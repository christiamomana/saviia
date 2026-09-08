import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { BookingsTable } from "@/components/bookings-table";
import { AddResidentForm } from "./add-resident-form";
import { ResidentRow } from "./resident-row";

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
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-saviia-purple-dark">
            Reservas próximas ({upcomingBookings.length})
          </h2>
          <Link
            href="/admin/reservas"
            className="text-sm text-saviia-purple-dark hover:underline"
          >
            Ver todas las reservas →
          </Link>
        </div>
        <BookingsTable bookings={upcomingBookings} cancelAction={cancelBookingAction} />
      </section>
    </main>
  );
}
