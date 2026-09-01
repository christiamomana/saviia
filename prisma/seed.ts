import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { SPACE_DEFS } from "../src/lib/spaces";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
}

const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const def of SPACE_DEFS) {
    await prisma.space.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        rulesSummary: def.rules.join("\n"),
        capacity: def.capacity,
        minAdvanceDays: def.minAdvanceDays,
        slotMinutes: def.slotMinutes,
        maxSlotsPerBooking: def.maxSlotsPerBooking,
        maxSlotsPerBookingPerDay: def.maxSlotsPerBookingPerDay,
        maxBookingsPerUnitPerDay: def.maxBookingsPerUnitPerDay,
        maxPeoplePerBooking: def.maxPeoplePerBooking,
        scheduleJson: JSON.stringify(def.schedule),
      },
      update: {
        name: def.name,
        description: def.description,
        rulesSummary: def.rules.join("\n"),
        capacity: def.capacity,
        minAdvanceDays: def.minAdvanceDays,
        slotMinutes: def.slotMinutes,
        maxSlotsPerBooking: def.maxSlotsPerBooking,
        maxSlotsPerBookingPerDay: def.maxSlotsPerBookingPerDay,
        maxBookingsPerUnitPerDay: def.maxBookingsPerUnitPerDay,
        maxPeoplePerBooking: def.maxPeoplePerBooking,
        scheduleJson: JSON.stringify(def.schedule),
      },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "christiamchivico@gmail.com";
  await prisma.resident.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Administración Saviia PH",
      unit: "ADMIN",
      role: "ADMIN",
      paymentStatus: "AL_DIA",
    },
    update: { role: "ADMIN" },
  });

  console.log(`Seed listo: ${SPACE_DEFS.length} espacios, admin ${adminEmail}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
