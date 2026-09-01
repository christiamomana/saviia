import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  earliestBookableDate,
  generateSlots,
  expandBookingToSlots,
  calendarDay,
  currentTimeOfDay,
} from "@/lib/booking-rules";
import { BookingForm } from "./booking-form";

export default async function SpacePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.residentId) redirect("/login");

  const { slug } = await params;
  const { date: requestedDate } = await searchParams;

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) notFound();

  const minDate = earliestBookableDate(new Date(), space.minAdvanceDays);
  const date =
    requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : minDate;

  const slotTimes = generateSlots(space, date);
  const dayBookings = await prisma.booking.findMany({
    where: {
      spaceId: space.id,
      date: new Date(`${date}T00:00:00.000Z`),
      status: "CONFIRMED",
    },
    select: { startTime: true, endTime: true, partySize: true },
  });
  const occupiedByStart = new Map<string, number>();
  for (const b of dayBookings) {
    for (const slot of expandBookingToSlots(b.startTime, b.endTime, space.slotMinutes)) {
      occupiedByStart.set(slot, (occupiedByStart.get(slot) ?? 0) + b.partySize);
    }
  }
  const now = new Date();
  const isToday = date === calendarDay(now);
  const nowTime = currentTimeOfDay(now);
  const slots = slotTimes.map((startTime) => {
    const occupied = occupiedByStart.get(startTime) ?? 0;
    const remaining = space.capacity - occupied;
    const alreadyPassed = isToday && startTime <= nowTime;
    return { startTime, remaining, available: remaining > 0 && !alreadyPassed };
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold text-saviia-purple-dark">{space.name}</h1>
      <p className="mt-1 text-sm text-foreground/60">{space.description}</p>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-saviia-purple-dark">Reglas de uso</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
          {space.rulesSummary.split("\n").map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <form className="flex items-end gap-3" method="get">
          <div>
            <label htmlFor="date" className="text-sm font-medium text-saviia-purple-dark">
              Fecha
            </label>
            <input
              id="date"
              type="date"
              name="date"
              defaultValue={date}
              min={minDate}
              className="mt-1 block rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
            />
          </div>
          <button
            type="submit"
            className="rounded-full border border-saviia-purple/30 px-4 py-1.5 text-sm text-saviia-purple-dark hover:bg-saviia-purple/10"
          >
            Ver disponibilidad
          </button>
        </form>
        <p className="mt-2 text-xs text-saviia-terracotta">
          {space.minAdvanceDays > 0
            ? `Anticipación mínima: ${space.minAdvanceDays} día(s) calendario.`
            : "Puedes reservar el mismo día, sujeto a disponibilidad."}
        </p>

        <div className="mt-6">
          <BookingForm
            spaceSlug={space.slug}
            date={date}
            slots={slots}
            capacity={space.capacity}
            maxPeoplePerBooking={space.maxPeoplePerBooking}
            maxSlotsPerBooking={space.maxSlotsPerBooking}
            slotMinutes={space.slotMinutes}
          />
        </div>
      </section>
    </main>
  );
}
