import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface BookingFilters {
  date?: string;
  name?: string;
  torre?: string;
}

// "T1-205" -> "T1". Units that don't follow the "T{n}-{apto}" convention
// (e.g. ones typed free-form from /admin) simply have no torre and are
// excluded from a torre filter, but still show up when no filter is set.
export function parseTorre(unit: string): string | null {
  const [prefix, ...rest] = unit.split("-");
  if (rest.length === 0) return null;
  return prefix;
}

export async function getAvailableTorres(): Promise<string[]> {
  const residents = await prisma.resident.findMany({ select: { unit: true } });
  const torres = new Set<string>();
  for (const { unit } of residents) {
    const torre = parseTorre(unit);
    if (torre) torres.add(torre);
  }
  return [...torres].sort();
}

export async function getFilteredBookings(filters: BookingFilters) {
  const where: Prisma.BookingWhereInput = { status: "CONFIRMED" };

  if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
    where.date = new Date(`${filters.date}T00:00:00.000Z`);
  } else {
    where.date = { gte: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z") };
  }

  const residentFilter: Prisma.ResidentWhereInput = {};
  if (filters.name?.trim()) {
    residentFilter.name = { contains: filters.name.trim() };
  }
  if (filters.torre?.trim()) {
    residentFilter.unit = { startsWith: `${filters.torre.trim()}-` };
  }
  if (Object.keys(residentFilter).length > 0) {
    where.resident = residentFilter;
  }

  return prisma.booking.findMany({
    where,
    include: { space: true, resident: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export function formatBookingDate(d: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}
