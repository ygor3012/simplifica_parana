import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  ClassroomMember,
  InsertUser,
  classroomMembers,
  classrooms,
  tasks,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function setUserAppRole(userId: number, appRole: "aluno" | "professor") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ appRole }).where(eq(users.id, userId));
}

// ─── Classrooms ───────────────────────────────────────────────────────────────

export async function createClassroom(
  teacherId: number,
  name: string,
  description: string | null,
  code: string
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(classrooms).values({ teacherId, name, description, code });
  const result = await db
    .select()
    .from(classrooms)
    .where(and(eq(classrooms.teacherId, teacherId), eq(classrooms.code, code)))
    .limit(1);
  return result[0];
}

export async function getClassroomByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(classrooms)
    .where(eq(classrooms.code, code))
    .limit(1);
  return result[0];
}

export async function getClassroomById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(classrooms).where(eq(classrooms.id, id)).limit(1);
  return result[0];
}

export async function getClassroomsByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(classrooms).where(eq(classrooms.teacherId, teacherId));
}

export async function getClassroomsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  const memberships = await db
    .select()
    .from(classroomMembers)
    .where(eq(classroomMembers.studentId, studentId));
  if (!memberships.length) return [];
  const result: (typeof classrooms.$inferSelect)[] = [];
  for (const m of memberships) {
    const c = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.id, m.classroomId))
      .limit(1);
    if (c[0]) result.push(c[0]);
  }
  return result;
}

export async function addClassroomMember(classroomId: number, studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(classroomMembers)
    .where(
      and(
        eq(classroomMembers.classroomId, classroomId),
        eq(classroomMembers.studentId, studentId)
      )
    )
    .limit(1);
  if (existing.length) return existing[0] as ClassroomMember;
  await db.insert(classroomMembers).values({ classroomId, studentId });
  const result = await db
    .select()
    .from(classroomMembers)
    .where(
      and(
        eq(classroomMembers.classroomId, classroomId),
        eq(classroomMembers.studentId, studentId)
      )
    )
    .limit(1);
  return result[0] as ClassroomMember;
}

export async function getClassroomStudents(classroomId: number) {
  const db = await getDb();
  if (!db) return [];
  const members = await db
    .select()
    .from(classroomMembers)
    .where(eq(classroomMembers.classroomId, classroomId));
  if (!members.length) return [];
  const studentIds = members.map((m) => m.studentId);
  const result: (typeof users.$inferSelect)[] = [];
  for (const sid of studentIds) {
    const u = await db.select().from(users).where(eq(users.id, sid)).limit(1);
    if (u[0]) result.push(u[0]);
  }
  return result;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function addTask(
  userId: number,
  platform: string,
  title: string,
  dueDate: Date | null,
  classroomId: number | null,
  assignedByTeacherId: number | null
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(tasks).values({
    userId,
    platform,
    title,
    dueDate: dueDate ?? undefined,
    classroomId: classroomId ?? undefined,
    assignedByTeacherId: assignedByTeacherId ?? undefined,
    completed: false,
  });
  const result = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.platform, platform), eq(tasks.title, title)))
    .limit(1);
  return result[0];
}

export async function getTasksByUserAndPlatform(userId: number, platform: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.platform, platform)));
}

export async function getAllTasksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function toggleTask(taskId: number, userId: number, completed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(tasks)
    .set({ completed })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

export async function deleteTask(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

export async function getTasksByClassroom(classroomId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.classroomId, classroomId));
}
