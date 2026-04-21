import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  setUserAppRole: vi.fn().mockResolvedValue(undefined),
  createClassroom: vi.fn().mockResolvedValue({
    id: 1,
    name: "Turma A",
    description: "Descrição",
    code: "ABC123",
    teacherId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getClassroomByCode: vi.fn().mockResolvedValue({
    id: 1,
    name: "Turma A",
    description: null,
    code: "ABC123",
    teacherId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getClassroomById: vi.fn().mockResolvedValue({
    id: 1,
    name: "Turma A",
    description: null,
    code: "ABC123",
    teacherId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getClassroomsByTeacher: vi.fn().mockResolvedValue([]),
  getClassroomsByStudent: vi.fn().mockResolvedValue([]),
  addClassroomMember: vi.fn().mockResolvedValue({ id: 1, classroomId: 1, studentId: 2, joinedAt: new Date() }),
  getClassroomStudents: vi.fn().mockResolvedValue([]),
  addTask: vi.fn().mockResolvedValue({
    id: 1, title: "Tarefa 1", platform: "Khan", userId: 1,
    classroomId: null, assignedByTeacherId: null, dueDate: null,
    completed: false, createdAt: new Date(), updatedAt: new Date(),
  }),
  getTasksByUserAndPlatform: vi.fn().mockResolvedValue([]),
  getAllTasksByUser: vi.fn().mockResolvedValue([]),
  toggleTask: vi.fn().mockResolvedValue(undefined),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  getTasksByClassroom: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  const clearedCookies: unknown[] = [];
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Usuário Teste",
      loginMethod: "manus",
      role: "user",
      appRole: "aluno",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: unknown) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("limpa o cookie de sessão e retorna sucesso", async () => {
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1, openId: "u1", email: "a@b.com", name: "A", loginMethod: "manus",
        role: "user", appRole: "aluno", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

describe("users.setRole", () => {
  it("define papel de aluno", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.users.setRole({ appRole: "aluno" });
    expect(result).toEqual({ success: true });
  });

  it("define papel de professor", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.users.setRole({ appRole: "professor" });
    expect(result).toEqual({ success: true });
  });
});

describe("classrooms.create", () => {
  it("professor pode criar sala", async () => {
    const ctx = makeCtx({ appRole: "professor" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.classrooms.create({ name: "Turma A", description: "Desc" });
    expect(result).toBeDefined();
    expect(result?.name).toBe("Turma A");
    expect(result?.code).toBe("ABC123");
  });

  it("aluno não pode criar sala", async () => {
    const ctx = makeCtx({ appRole: "aluno" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.classrooms.create({ name: "Turma A" })).rejects.toThrow();
  });
});

describe("classrooms.join", () => {
  it("aluno entra em sala com código válido", async () => {
    const ctx = makeCtx({ id: 2, appRole: "aluno" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.classrooms.join({ code: "ABC123" });
    expect(result.classroom.code).toBe("ABC123");
  });
});

describe("tasks.add", () => {
  it("adiciona tarefa para plataforma Khan", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tasks.add({ platform: "Khan", title: "Módulo 1" });
    expect(result).toBeDefined();
    expect(result?.title).toBe("Tarefa 1");
    expect(result?.platform).toBe("Khan");
  });
});

describe("tasks.toggle", () => {
  it("marca tarefa como concluída", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tasks.toggle({ taskId: 1, completed: true });
    expect(result).toEqual({ success: true });
  });
});

describe("tasks.delete", () => {
  it("exclui tarefa do usuário", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tasks.delete({ taskId: 1 });
    expect(result).toEqual({ success: true });
  });
});

describe("tasks.progress", () => {
  it("retorna progresso geral zerado quando não há tarefas", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tasks.progress();
    expect(result.overall).toBe(0);
    expect(result.byPlatform).toEqual({});
  });
});
