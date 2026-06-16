// Load .env.local first (Next.js convention), then fall back to .env.
// This ensures `prisma migrate` and `prisma generate` can read your DB URLs
// even though dotenv/config only reads `.env` by default.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // no-op if .env doesn't exist

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL (port 5432) — used by Prisma CLI for migrations.
    // This bypasses the connection pooler so schema changes apply correctly.
    url: env("DIRECT_URL"),
  },
});

