import type { Prisma } from "@prisma/client";
import { formatBookingDate } from "@/lib/bookings-query";

type BookingWithDetails = Prisma.BookingGetPayload<{
  include: { space: true; resident: true };
}>;

export function BookingsTable({
  bookings,
  cancelAction,
}: {
  bookings: BookingWithDetails[];
  cancelAction?: (bookingId: string) => Promise<void>;
}) {
  if (bookings.length === 0) {
    return (
      <div className="mt-2 rounded-2xl border border-black/5 bg-white p-5 text-sm text-foreground/60 shadow-sm">
        No hay reservas que coincidan con el filtro.
      </div>
    );
  }

  return (
    <div className="mt-2 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-saviia-purple-dark">
              {booking.space.name} · {formatBookingDate(booking.date)} · {booking.startTime}–
              {booking.endTime}
            </p>
            <p className="text-xs text-foreground/60">
              {booking.resident.name} (Apto {booking.resident.unit})
              {booking.partySize > 1 ? ` · ${booking.partySize} personas` : ""}
            </p>
          </div>
          {cancelAction && (
            <form action={cancelAction.bind(null, booking.id)}>
              <button
                type="submit"
                className="rounded-full px-3 py-1 text-sm text-saviia-terracotta hover:bg-saviia-terracotta/10"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
