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
        <div className="mb-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tu unidad figura en mora con la administración. Puedes ver los espacios, pero no
          podrás reservar hasta normalizar tu estado de cuenta.
        </div>
      )}

      <h1 className="text-xl font-semibold">Espacios comunes</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPACE_DEFS.map((space) => (
          <Link
            key={space.slug}
            href={`/espacios/${space.slug}`}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:shadow"
          >
            <h2 className="font-medium">{space.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{space.description}</p>
            <p className="mt-3 text-xs text-gray-400">
              Anticipación mínima: {space.minAdvanceDays} día(s)
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Mis reservas</h2>
      {upcomingBookings.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No tienes reservas próximas.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {upcomingBookings.map((booking) => (
            <li key={booking.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{booking.space.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(booking.date)} · {booking.startTime}–{booking.endTime}
                  {booking.partySize > 1 ? ` · ${booking.partySize} personas` : ""}
                </p>
              </div>
              <form action={cancelBookingAction.bind(null, booking.id)}>
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:text-red-800"
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
