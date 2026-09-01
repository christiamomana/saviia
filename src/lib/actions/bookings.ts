"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateBookingRequest, timeToMinutes, minutesToTime } from "@/lib/booking-rules";

const createBookingSchema = z.object({
  spaceSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  partySize: z.coerce.number().int().min(1).max(20),
});

export type CreateBookingState = { error?: string; success?: boolean };

function dateStringToUtcMidnight(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function createBookingAction(
  _prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const session = await auth();
  if (!session?.user?.residentId) {
    return { error: "Debes iniciar sesión para reservar." };
  }

  const parsed = createBookingSchema.safeParse({
    spaceSlug: formData.get("spaceSlug"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    partySize: formData.get("partySize") ?? 1,
  });
  if (!parsed.success) {
    return { error: "Datos de reserva inválidos." };
  }
  const { spaceSlug, date, startTime, partySize } = parsed.data;

  const [resident, space] = await Promise.all([
    prisma.resident.findUnique({ where: { id: session.user.residentId } }),
    prisma.space.findUnique({ where: { slug: spaceSlug } }),
  ]);
  if (!resident) return { error: "Residente no encontrado." };
  if (!space) return { error: "Espacio no encontrado." };

  const day = dateStringToUtcMidnight(date);

  const [slotBookings, residentBookingsThatDay, unitBookingsThatDay] = await Promise.all([
    prisma.booking.findMany({
      where: { spaceId: space.id, date: day, startTime, status: "CONFIRMED" },
      select: { partySize: true },
    }),
    prisma.booking.findMany({
      where: { spaceId: space.id, date: day, residentId: resident.id, status: "CONFIRMED" },
      select: { id: true },
    }),
    prisma.booking.findMany({
      where: {
        spaceId: space.id,
        date: day,
        status: "CONFIRMED",
        resident: { unit: resident.unit },
      },
      select: { residentId: true },
      distinct: ["residentId"],
    }),
  ]);

  const occupiedInSlot = slotBookings.reduce((sum, b) => sum + b.partySize, 0);

  const validation = validateBookingRequest({
    space,
    resident,
    date,
    startTime,
    partySize,
    now: new Date(),
    occupiedInSlot,
    residentSlotsBookedThatDay: residentBookingsThatDay.length,
    unitResidentIdsBookedThatDay: unitBookingsThatDay.map((b) => b.residentId),
  });

  if (!validation.ok) {
    return { error: validation.error };
  }

  const endMinutes = timeToMinutes(startTime) + space.slotMinutes;
  const endTime = minutesToTime(endMinutes);

  await prisma.booking.create({
    data: {
      spaceId: space.id,
      residentId: resident.id,
      date: day,
      startTime,
      endTime,
      partySize,
      status: "CONFIRMED",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/espacios/${spaceSlug}`);

  return { success: true };
}

export async function cancelBookingAction(bookingId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.residentId) {
    throw new Error("Debes iniciar sesión.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { space: true },
  });
  if (!booking) throw new Error("Reserva no encontrada.");

  const isOwner = booking.residentId === session.user.residentId;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    throw new Error("No tienes permiso para cancelar esta reserva.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/espacios/${booking.space.slug}`);
  revalidatePath("/admin");
}
