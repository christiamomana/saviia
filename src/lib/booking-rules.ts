import { toZonedTime } from "date-fns-tz";
import { format, addDays } from "date-fns";
import type { WeeklySchedule, TimeWindow } from "@/lib/spaces";

export const TIME_ZONE = "America/Bogota";
export const DATE_FORMAT = "yyyy-MM-dd";

/** Calendar day (America/Bogota) for a given instant, as "YYYY-MM-DD". */
export function calendarDay(instant: Date): string {
  return format(toZonedTime(instant, TIME_ZONE), DATE_FORMAT);
}

/** ISO weekday (1 = lunes ... 7 = domingo) for a "YYYY-MM-DD" calendar day string. */
export function isoWeekday(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utcDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sun .. 6 = Sat
  return utcDay === 0 ? 7 : utcDay;
}

/** Earliest bookable "YYYY-MM-DD" given the space's minimum advance-days rule. */
export function earliestBookableDate(now: Date, minAdvanceDays: number): string {
  const today = toZonedTime(now, TIME_ZONE);
  return format(addDays(today, minAdvanceDays), DATE_FORMAT);
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function getOpenWindows(scheduleJson: string, dateStr: string): TimeWindow[] {
  const schedule = JSON.parse(scheduleJson) as WeeklySchedule;
  return schedule[String(isoWeekday(dateStr))] ?? [];
}

/** All bookable slot start times ("HH:mm") for a space on a given day. */
export function generateSlots(
  space: { scheduleJson: string; slotMinutes: number },
  dateStr: string
): string[] {
  const windows = getOpenWindows(space.scheduleJson, dateStr);
  const slots: string[] = [];
  for (const [start, end] of windows) {
    let cursor = timeToMinutes(start);
    const windowEnd = timeToMinutes(end);
    while (cursor + space.slotMinutes <= windowEnd) {
      slots.push(minutesToTime(cursor));
      cursor += space.slotMinutes;
    }
  }
  return slots;
}

export interface SpaceRuleFields {
  capacity: number;
  minAdvanceDays: number;
  slotMinutes: number;
  maxSlotsPerBookingPerDay: number | null;
  maxBookingsPerUnitPerDay: number | null;
  maxPeoplePerBooking: number | null;
  scheduleJson: string;
}

export interface ResidentRuleFields {
  id: string;
  unit: string;
  paymentStatus: "AL_DIA" | "MORA";
  bookingSuspended: boolean;
}

export interface BookingValidationInput {
  space: SpaceRuleFields;
  resident: ResidentRuleFields;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  partySize: number;
  now: Date;
  /** Suma de partySize de reservas CONFIRMED existentes para ese espacio/fecha/hora (de cualquier residente). */
  occupiedInSlot: number;
  /** Cantidad de slots ya reservados (CONFIRMED) por este mismo residente en ese espacio/fecha. */
  residentSlotsBookedThatDay: number;
  /** IDs de residentes (distintos) de la misma unidad con al menos una reserva CONFIRMED ese espacio/fecha. */
  unitResidentIdsBookedThatDay: string[];
}

export type BookingValidationResult = { ok: true } | { ok: false; error: string };

export function validateBookingRequest(input: BookingValidationInput): BookingValidationResult {
  const { space, resident, date, startTime, partySize, now } = input;

  if (resident.paymentStatus !== "AL_DIA") {
    return { ok: false, error: "Debes estar al día en el pago de administración para reservar." };
  }
  if (resident.bookingSuspended) {
    return {
      ok: false,
      error: "Tu derecho a reservar está temporalmente suspendido. Contacta a la Administración.",
    };
  }

  const validSlots = generateSlots(space, date);
  if (!validSlots.includes(startTime)) {
    return { ok: false, error: "El horario seleccionado no está disponible para este espacio." };
  }

  const earliest = earliestBookableDate(now, space.minAdvanceDays);
  if (date < earliest) {
    return {
      ok: false,
      error: `Debes reservar con al menos ${space.minAdvanceDays} día(s) calendario de anticipación.`,
    };
  }

  if (space.maxPeoplePerBooking != null && partySize > space.maxPeoplePerBooking) {
    return {
      ok: false,
      error: `Máximo ${space.maxPeoplePerBooking} personas por reserva en este espacio.`,
    };
  }
  if (partySize < 1) {
    return { ok: false, error: "El número de personas debe ser al menos 1." };
  }

  if (input.occupiedInSlot + partySize > space.capacity) {
    return { ok: false, error: "El aforo para ese horario ya está completo." };
  }

  if (
    space.maxSlotsPerBookingPerDay != null &&
    input.residentSlotsBookedThatDay + 1 > space.maxSlotsPerBookingPerDay
  ) {
    const hours = (space.maxSlotsPerBookingPerDay * space.slotMinutes) / 60;
    return { ok: false, error: `Ya alcanzaste tu límite de ${hours} horas para este espacio hoy.` };
  }

  if (space.maxBookingsPerUnitPerDay != null) {
    const alreadyCounts = input.unitResidentIdsBookedThatDay.includes(resident.id);
    const distinctUsers = alreadyCounts
      ? input.unitResidentIdsBookedThatDay.length
      : input.unitResidentIdsBookedThatDay.length + 1;
    if (distinctUsers > space.maxBookingsPerUnitPerDay) {
      return {
        ok: false,
        error: `Tu unidad ya alcanzó el máximo de ${space.maxBookingsPerUnitPerDay} usuarios distintos para este espacio hoy.`,
      };
    }
  }

  return { ok: true };
}
