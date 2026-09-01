import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma 7's config loader intentionally does not read .env files, so we load
// them ourselves before the datasource url below is resolved.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

// Prisma 7 moved the Migrate/CLI connection URL out of schema.prisma.
// - Local dev: TURSO_DATABASE_URL can point to a local file, e.g. "file:./prisma/dev.db".
// - Real Turso: use the "libsql://<db>.turso.io?authToken=<TURSO_AUTH_TOKEN>" form here,
//   since the CLI/migrate engine (unlike the @prisma/adapter-libsql runtime client) takes
//   the auth token embedded in the URL rather than as a separate option.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("TURSO_DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
