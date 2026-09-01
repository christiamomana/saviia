import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { AddResidentForm } from "./add-resident-form";
import { ResidentRow } from "./resident-row";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const [residents, upcomingBookings] = await Promise.all([
    prisma.resident.findMany({ orderBy: { unit: "asc" } }),
    prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        date: { gte: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z") },
      },
      include: { space: true, resident: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold text-saviia-purple-dark">Administración</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-saviia-purple-dark">Agregar residente</h2>
        <div className="mt-2 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <AddResidentForm />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-saviia-purple-dark">
          Residentes ({residents.length})
        </h2>
        <div className="mt-2 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          {residents.map((resident) => (
            <ResidentRow key={resident.id} resident={resident} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-saviia-purple-dark">
          Reservas próximas ({upcomingBookings.length})
        </h2>
        <div className="mt-2 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          {upcomingBookings.length === 0 && (
            <p className="px-5 py-4 text-sm text-foreground/60">No hay reservas próximas.</p>
          )}
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-saviia-purple-dark">
                  {booking.space.name} · {formatDate(booking.date)} · {booking.startTime}–
                  {booking.endTime}
                </p>
                <p className="text-xs text-foreground/60">
                  {booking.resident.name} (Apto {booking.resident.unit})
                  {booking.partySize > 1 ? ` · ${booking.partySize} personas` : ""}
                </p>
              </div>
              <form action={cancelBookingAction.bind(null, booking.id)}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-1 text-sm text-saviia-terracotta hover:bg-saviia-terracotta/10"
                >
                  Cancelar
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
