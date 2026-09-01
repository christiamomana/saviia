// Prisma 7's migrate/schema engine does not understand the "libsql://"
// connection string scheme (it only speaks file:/postgres:/mysql:/etc), so
// `prisma migrate deploy` fails with P1013 against a real Turso database.
// This script applies the same generated SQL in prisma/migrations/ directly
// through @libsql/client (the JS driver Turso actually supports), tracking
// what has already run in a small bookkeeping table so it's safe to re-run.
//
// Usage: npx tsx scripts/apply-turso-migrations.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { config as loadEnv } from "dotenv";
import { createClient } from "@libsql/client";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || url.startsWith("file:")) {
  throw new Error(
    "TURSO_DATABASE_URL must point at a real Turso database (libsql://...) to run this script."
  );
}

const MIGRATIONS_DIR = join(__dirname, "..", "prisma", "migrations");

async function main() {
  const client = createClient({ url, authToken });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_saviia_migrations" (
      "name" TEXT PRIMARY KEY NOT NULL,
      "applied_at" TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = new Set(
    (await client.execute(`SELECT name FROM "_saviia_migrations"`)).rows.map(
      (r) => r.name as string
    )
  );

  const migrationDirs = readdirSync(MIGRATIONS_DIR)
    .filter((name) => statSync(join(MIGRATIONS_DIR, name)).isDirectory())
    .sort();

  for (const dir of migrationDirs) {
    if (applied.has(dir)) {
      console.log(`skip (already applied): ${dir}`);
      continue;
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, dir, "migration.sql"), "utf-8");
    console.log(`applying: ${dir}`);
    await client.executeMultiple(sql);
    await client.execute({
      sql: `INSERT INTO "_saviia_migrations" (name) VALUES (?)`,
      args: [dir],
    });
    console.log(`applied: ${dir}`);
  }

  console.log("Turso migrations up to date.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
