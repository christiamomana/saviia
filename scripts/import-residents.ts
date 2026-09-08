// One-off bulk import of the building's resident roster (extracted from the
// admin's Excel database, filtered to valid @gmail.com addresses — only
// those can log in via Google). Idempotent: only creates residents whose
// email doesn't already exist, so it's safe to re-run (e.g. after fixing a
// name) without clobbering residents already edited from /admin.
//
// Usage: npx tsx scripts/import-residents.ts [path/to/residents.json]
// Expects a JSON array of { email, name, unit }. Defaults to
// scripts/residents-import.json (gitignored — contains personal data).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config as loadEnv } from "dotenv";

interface RosterEntry {
  email: string;
  name: string;
  unit: string;
}

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv({ path: ".env" });
  // Imported dynamically, after env vars are loaded: db.ts reads
  // TURSO_DATABASE_URL at module-evaluation time, and a static top-level
  // import would be hoisted above the loadEnv() calls above.
  const { prisma } = await import("../src/lib/db");

  const filePath = process.argv[2] ?? join(__dirname, "residents-import.json");
  const raw = JSON.parse(readFileSync(filePath, "utf-8")) as RosterEntry[];

  let created = 0;
  let skipped = 0;

  for (const entry of raw) {
    const email = entry.email.toLowerCase().trim();
    const existing = await prisma.resident.findUnique({ where: { email } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.resident.create({
      data: {
        email,
        name: entry.name,
        unit: entry.unit,
        role: "RESIDENT",
        paymentStatus: "AL_DIA",
      },
    });
    created++;
  }

  console.log(`Importación lista: ${created} residentes creados, ${skipped} ya existían (omitidos).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
