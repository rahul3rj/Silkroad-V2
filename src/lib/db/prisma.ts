// src/lib/db/prisma.ts
// Prisma v7 client singleton with @prisma/adapter-pg.
//
// Prisma 7 changed the engine architecture:
//   - The "client" engine type requires a database adapter (not a direct URL in the client)
//   - The connection URL is still in .env.local as DATABASE_URL
//   - The adapter reads DATABASE_URL at runtime via a standard pg Pool
//
// The singleton pattern prevents connection pool exhaustion during
// Next.js hot-reload in development.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
