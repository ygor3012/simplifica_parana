import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addClassroomMember,
  addTask,
  createClassroom,
  deleteTask,
  getAllTasksByUser,
  getClassroomByCode,
  getClassroomById,
  getClassroomStudents,
  getClassroomsByStudent,
  getClassroomsByTeacher,
  getTasksByClassroom,
  getTasksByUserAndPlatform,
  setUserAppRole,
  toggleTask,
} from "./db";

// ─── Users ────────────────────────────────────────────────────────────────────

const usersRouter = router({
  setRole: protectedProcedure
    .input(z.object({ appRole: z.enum(["aluno", "professor"]) }))
    .mutation(async ({ ctx, input }) => {
      await setUserAppRole(ctx.user.id, input.appRole);
      return { success: true };
    }),
});

// ─── Classrooms ───────────────────────────────────────────────────────────────

const classroomsRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.appRole !== "professor") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas professores podem criar salas." });
      }
      const code = nanoid(6).toUpperCase();
      const classroom = await createClassroom(
        ctx.user.id,
        input.name,
        input.description ?? null,
        code
      );
      return classroom;
    }),

  join: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const classroom = await getClassroomByCode(input.code.toUpperCase());
      if (!classroom) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sala não encontrada. Verifique o código." });
      }
      const member = await addClassroomMember(classroom.id, ctx.user.id);
      return { classroom, member };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.appRole === "professor") {
      return getClassroomsByTeacher(ctx.user.id);
    }
    return getClassroomsByStudent(ctx.user.id);
  }),

  getStudents: protectedProcedure
    .input(z.object({ classroomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const classroom = await getClassroomById(input.classroomId);
      if (!classroom || classroom.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado." });
      }
      return getClassroomStudents(input.classroomId);
    }),

  classProgress: protectedProcedure
    .input(z.object({ classroomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const classroom = await getClassroomById(input.classroomId);
      if (!classroom || classroom.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado." });
      }
      const students = await getClassroomStudents(input.classroomId);
      const allTasks = await getTasksByClassroom(input.classroomId);

      const studentProgress = students.map((student) => {
        const studentTasks = allTasks.filter((t) => t.userId === student.id);
        const total = studentTasks.length;
        const done = studentTasks.filter((t) => t.completed).length;
        return {
          student,
          total,
          done,
          percent: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      });

      const totalTasks = allTasks.length;
      const doneTasks = allTasks.filter((t) => t.completed).length;
      return {
        students: studentProgress,
        overall: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      };
    }),
});

// ─── Tasks ────────────────────────────────────────────────────────────────────

const tasksRouter = router({
  add: protectedProcedure
    .input(
      z.object({
        platform: z.string().min(1),
        title: z.string().min(1),
        dueDate: z.string().optional(),
        classroomId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dueDate = input.dueDate ? new Date(input.dueDate) : null;
      const task = await addTask(
        ctx.user.id,
        input.platform,
        input.title,
        dueDate,
        input.classroomId ?? null,
        null
      );
      return task;
    }),

  assignToClass: protectedProcedure
    .input(
      z.object({
        classroomId: z.number(),
        platform: z.string().min(1),
        title: z.string().min(1),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.appRole !== "professor") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas professores podem atribuir tarefas." });
      }
      const classroom = await getClassroomById(input.classroomId);
      if (!classroom || classroom.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado." });
      }
      const students = await getClassroomStudents(input.classroomId);
      const dueDate = input.dueDate ? new Date(input.dueDate) : null;
      const created = await Promise.all(
        students.map((s) =>
          addTask(s.id, input.platform, input.title, dueDate, input.classroomId, ctx.user.id)
        )
      );
      return { count: created.length };
    }),

  list: protectedProcedure
    .input(z.object({ platform: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return getTasksByUserAndPlatform(ctx.user.id, input.platform);
    }),

  all: protectedProcedure.query(async ({ ctx }) => {
    return getAllTasksByUser(ctx.user.id);
  }),

  toggle: protectedProcedure
    .input(z.object({ taskId: z.number(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await toggleTask(input.taskId, ctx.user.id, input.completed);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteTask(input.taskId, ctx.user.id);
      return { success: true };
    }),

  progress: protectedProcedure.query(async ({ ctx }) => {
    const allTasks = await getAllTasksByUser(ctx.user.id);
    const platforms: Record<string, { total: number; done: number }> = {};
    for (const task of allTasks) {
      if (!platforms[task.platform]) platforms[task.platform] = { total: 0, done: 0 };
      platforms[task.platform].total++;
      if (task.completed) platforms[task.platform].done++;
    }
    const result: Record<string, number> = {};
    for (const [platform, { total, done }] of Object.entries(platforms)) {
      result[platform] = total > 0 ? Math.round((done / total) * 100) : 0;
    }
    const totalTasks = allTasks.length;
    const doneTasks = allTasks.filter((t) => t.completed).length;
    return {
      byPlatform: result,
      overall: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  }),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  users: usersRouter,
  classrooms: classroomsRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
