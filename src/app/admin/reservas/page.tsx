import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { getFilteredBookings, getAvailableTorres } from "@/lib/bookings-query";
import { BookingsFilterForm } from "@/components/bookings-filter-form";
import { BookingsTable } from "@/components/bookings-table";

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; name?: string; torre?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const { date, name, torre } = await searchParams;

  const [bookings, torres] = await Promise.all([
    getFilteredBookings({ date, name, torre }),
    getAvailableTorres(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold text-saviia-purple-dark">Todas las reservas</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Filtra por fecha, nombre del residente o torre.
      </p>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <BookingsFilterForm date={date} name={name} torre={torre} torres={torres} />
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-saviia-purple-dark">
          Reservas ({bookings.length})
        </h2>
        <BookingsTable bookings={bookings} cancelAction={cancelBookingAction} />
      </section>
    </main>
  );
}
