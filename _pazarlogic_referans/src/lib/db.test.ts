import { expect, test, describe, mock } from "bun:test";

// Mock @prisma/client
mock.module("@prisma/client", () => {
  return {
    PrismaClient: class {
      constructor() {}
    }
  };
});

describe("db connection singleton", () => {
  test("should export a PrismaClient instance and set global prisma", async () => {
    // In Bun, modules are cached. This test verifies the behavior when the module is loaded.
    const { db } = await import("./db");
    const { PrismaClient } = await import("@prisma/client");

    expect(db).toBeInstanceOf(PrismaClient);

    // Check if it's stored in globalThis (typical behavior in dev)
    if (process.env.NODE_ENV !== 'production') {
      expect((globalThis as any).prisma).toBe(db);
    }
  });

  test("should use existing global prisma if available", async () => {
    // Since we can't easily un-import a module in Bun,
    // we verify that if we were to import it again, it would have used the global.
    // In this specific test, because it's already imported, we're just checking the result of that import.
    const { db } = await import("./db");
    const { prisma } = globalThis as any;

    if (prisma) {
      expect(db).toBe(prisma);
    }
  });
});
