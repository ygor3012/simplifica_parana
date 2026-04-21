import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(appRole: "aluno" | "professor" = "aluno"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-profile",
    email: "profile@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    appRole,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Profile & User Management", () => {
  it("should allow user to change role from aluno to professor", async () => {
    const ctx = createAuthContext("aluno");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.users.setRole({ appRole: "professor" });

    expect(result).toEqual({ success: true });
  });

  it("should allow user to change role from professor to aluno", async () => {
    const ctx = createAuthContext("professor");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.users.setRole({ appRole: "aluno" });

    expect(result).toEqual({ success: true });
  });

  it("should retrieve user profile info via auth.me", async () => {
    const ctx = createAuthContext("aluno");
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
    expect(user?.email).toBe("profile@example.com");
    expect(user?.name).toBe("Test User");
  });

  it("should retrieve all tasks for a user", async () => {
    const ctx = createAuthContext("aluno");
    const caller = appRouter.createCaller(ctx);

    // This should not throw, even if there are no tasks
    const tasks = await caller.tasks.all();

    expect(Array.isArray(tasks)).toBe(true);
  });

  it("should retrieve task progress for a user", async () => {
    const ctx = createAuthContext("aluno");
    const caller = appRouter.createCaller(ctx);

    const progress = await caller.tasks.progress();

    expect(progress).toBeDefined();
    expect(progress).toHaveProperty("overall");
    expect(progress).toHaveProperty("byPlatform");
    expect(typeof progress.overall).toBe("number");
  });
});
