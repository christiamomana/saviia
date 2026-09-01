import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7's config loader intentionally does not read .env files, so we load
// them ourselves before the datasource url below is resolved.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

// Prisma 7 moved the Migrate/CLI connection URL out of schema.prisma. Unlike
// the @prisma/adapter-libsql runtime client (src/lib/db.ts), which takes the
// auth token as a separate constructor option, the CLI/migrate engine needs
// it embedded in the URL as an "authToken" query param — so we build that
// here from the same two env vars used everywhere else (TURSO_DATABASE_URL,
// TURSO_AUTH_TOKEN), rather than requiring a differently-shaped URL just for
// the CLI. Local dev can point TURSO_DATABASE_URL at a file, e.g.
// "file:./prisma/dev.db", in which case there is no token to append.
function cliDatasourceUrl(): string {
  // `prisma generate` (run from postinstall on every `npm install`, including
  // on Vercel before env vars matter for it) only needs the schema, not a
  // reachable database — so fall back to a placeholder instead of throwing,
  // and only require a real TURSO_DATABASE_URL for commands that actually
  // connect (migrate, db seed, studio, etc).
  const url = process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db";
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!token || url.startsWith("file:")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}authToken=${token}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: cliDatasourceUrl(),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
