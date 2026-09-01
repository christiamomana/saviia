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

/** Current time of day (America/Bogota) as "HH:mm", for filtering out same-day slots that already started. */
export function currentTimeOfDay(now: Date): string {
  return format(toZonedTime(now, TIME_ZONE), "HH:mm");
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

/** The hourly slot start times a booking occupies, from its startTime up to (not including) its endTime. */
export function expandBookingToSlots(
  startTime: string,
  endTime: string,
  slotMinutes: number
): string[] {
  const slots: string[] = [];
  let cursor = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  while (cursor < end) {
    slots.push(minutesToTime(cursor));
    cursor += slotMinutes;
  }
  return slots;
}

/**
 * Up to `durationSlots` consecutive bookable slots for `space` on `dateStr`,
 * starting at `startTime`. Returns null if `startTime` isn't a valid slot, or
 * if fewer than `durationSlots` slots follow it back-to-back (e.g. it would
 * spill past closing time or into a later opening window).
 */
export function consecutiveSlots(
  space: { scheduleJson: string; slotMinutes: number },
  dateStr: string,
  startTime: string,
  durationSlots: number
): string[] | null {
  const validSlots = generateSlots(space, dateStr);
  const startIndex = validSlots.indexOf(startTime);
  if (startIndex === -1) return null;

  const picked = validSlots.slice(startIndex, startIndex + durationSlots);
  if (picked.length < durationSlots) return null;

  for (let i = 1; i < picked.length; i++) {
    if (timeToMinutes(picked[i]) !== timeToMinutes(picked[i - 1]) + space.slotMinutes) {
      return null; // gap between windows (e.g. a closed lunch break)
    }
  }
  return picked;
}

export interface SpaceRuleFields {
  capacity: number;
  minAdvanceDays: number;
  slotMinutes: number;
  maxSlotsPerBooking: number | null;
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
  /** Horas (slots) contiguas solicitadas a partir de startTime. */
  durationSlots: number;
  partySize: number;
  now: Date;
  /** Personas ya reservadas (CONFIRMED, de cualquier residente) por hora "HH:mm" para ese espacio/fecha. */
  occupiedByHour: Record<string, number>;
  /** Horas (slots) ya reservadas (CONFIRMED) por este mismo residente en ese espacio/fecha, sumando todas sus reservas. */
  residentSlotsBookedThatDay: number;
  /** IDs de residentes (distintos) de la misma unidad con al menos una reserva CONFIRMED ese espacio/fecha. */
  unitResidentIdsBookedThatDay: string[];
}

export type BookingValidationResult = { ok: true } | { ok: false; error: string };

export function validateBookingRequest(input: BookingValidationInput): BookingValidationResult {
  const { space, resident, date, startTime, durationSlots, partySize, now } = input;

  if (resident.paymentStatus !== "AL_DIA") {
    return { ok: false, error: "Debes estar al día en el pago de administración para reservar." };
  }
  if (resident.bookingSuspended) {
    return {
      ok: false,
      error: "Tu derecho a reservar está temporalmente suspendido. Contacta a la Administración.",
    };
  }

  const maxSlotsPerBooking = space.maxSlotsPerBooking ?? 1;
  if (durationSlots < 1 || durationSlots > maxSlotsPerBooking) {
    const hours = (maxSlotsPerBooking * space.slotMinutes) / 60;
    return {
      ok: false,
      error:
        maxSlotsPerBooking > 1
          ? `Puedes reservar entre 1 y ${hours} horas en una sola reserva.`
          : "Este espacio se reserva por turnos de una hora.",
    };
  }

  const requestedSlots = consecutiveSlots(space, date, startTime, durationSlots);
  if (!requestedSlots) {
    return {
      ok: false,
      error:
        durationSlots > 1
          ? "No hay suficientes horas consecutivas disponibles a partir de ese horario."
          : "El horario seleccionado no está disponible para este espacio.",
    };
  }

  const earliest = earliestBookableDate(now, space.minAdvanceDays);
  if (date < earliest) {
    return {
      ok: false,
      error:
        space.minAdvanceDays > 0
          ? `Debes reservar con al menos ${space.minAdvanceDays} día(s) calendario de anticipación.`
          : "No puedes reservar en una fecha pasada.",
    };
  }
  if (date === calendarDay(now) && startTime <= currentTimeOfDay(now)) {
    return { ok: false, error: "Ese horario ya pasó. Elige un horario más adelante." };
  }

  if (space.maxPeoplePerBooking != null && partySize > space.maxPeoplePerBooking) {
    return {
      ok: false,
      error: `Máximo ${space.maxPeoplePerBooking} personas por reserva en este espacio.`,
    };
  }
  if (partySize > space.capacity) {
    return { ok: false, error: `El aforo máximo de este espacio es de ${space.capacity} personas.` };
  }
  if (partySize < 1) {
    return { ok: false, error: "El número de personas debe ser al menos 1." };
  }

  for (const slot of requestedSlots) {
    const occupied = input.occupiedByHour[slot] ?? 0;
    if (occupied + partySize > space.capacity) {
      return { ok: false, error: `El aforo para las ${slot} ya está completo.` };
    }
  }

  if (
    space.maxSlotsPerBookingPerDay != null &&
    input.residentSlotsBookedThatDay + durationSlots > space.maxSlotsPerBookingPerDay
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
