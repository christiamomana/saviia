import { redirect } from "next/navigation";
import { hasCeladorSession, celadorLogoutAction } from "@/lib/actions/celador";
import { getFilteredBookings, getAvailableTorres } from "@/lib/bookings-query";
import { BookingsFilterForm } from "@/components/bookings-filter-form";
import { BookingsTable } from "@/components/bookings-table";

export default async function CeladorReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; name?: string; torre?: string }>;
}) {
  if (!(await hasCeladorSession())) redirect("/celador");

  const { date, name, torre } = await searchParams;

  const [bookings, torres] = await Promise.all([
    getFilteredBookings({ date, name, torre }),
    getAvailableTorres(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-saviia-purple-dark">Reservas</h1>
        <form action={celadorLogoutAction}>
          <button
            type="submit"
            className="rounded-full px-4 py-1.5 text-sm text-foreground/60 hover:bg-black/5"
          >
            Salir
          </button>
        </form>
      </div>
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
        <BookingsTable bookings={bookings} />
      </section>
    </main>
  );
}
