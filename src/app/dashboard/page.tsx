import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { SPACE_DEFS } from "@/lib/spaces";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

const ACCENT_COLORS = ["bg-saviia-gold", "bg-saviia-coral", "bg-saviia-terracotta", "bg-saviia-purple"];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.residentId) redirect("/login");

  const resident = await prisma.resident.findUnique({
    where: { id: session.user.residentId },
  });
  if (!resident) redirect("/login");

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      residentId: resident.id,
      status: "CONFIRMED",
      date: { gte: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z") },
    },
    include: { space: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      {resident.paymentStatus === "MORA" && (
        <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tu unidad figura en mora con la administración. Puedes ver los espacios, pero no
          podrás reservar hasta normalizar tu estado de cuenta.
        </div>
      )}

      <h1 className="text-xl font-semibold text-saviia-purple-dark">Espacios comunes</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPACE_DEFS.map((space, i) => (
          <Link
            key={space.slug}
            href={`/espacios/${space.slug}`}
            className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`h-1.5 w-full ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`} />
            <div className="p-5">
              <h2 className="font-medium text-saviia-purple-dark">{space.name}</h2>
              <p className="mt-1 text-sm text-foreground/60">{space.description}</p>
              <p className="mt-3 text-xs font-medium text-saviia-terracotta">
                {space.minAdvanceDays > 0
                  ? `Anticipación mínima: ${space.minAdvanceDays} día(s)`
                  : "Reserva el mismo día, según disponibilidad"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold text-saviia-purple-dark">Mis reservas</h2>
      {upcomingBookings.length === 0 ? (
        <p className="mt-2 text-sm text-foreground/60">No tienes reservas próximas.</p>
      ) : (
        <ul className="mt-4 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white">
          {upcomingBookings.map((booking) => (
            <li key={booking.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-saviia-purple-dark">{booking.space.name}</p>
                <p className="text-sm text-foreground/60">
                  {formatDate(booking.date)} · {booking.startTime}–{booking.endTime}
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
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
