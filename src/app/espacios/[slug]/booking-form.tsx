"use client";

import { useActionState } from "react";
import { createBookingAction, type CreateBookingState } from "@/lib/actions/bookings";

const initialState: CreateBookingState = {};

export function BookingForm({
  spaceSlug,
  date,
  slots,
  maxPeoplePerBooking,
}: {
  spaceSlug: string;
  date: string;
  slots: { startTime: string; available: boolean; remaining: number }[];
  maxPeoplePerBooking: number | null;
}) {
  const [state, formAction, pending] = useActionState(createBookingAction, initialState);

  if (slots.length === 0) {
    return <p className="text-sm text-gray-500">Este espacio está cerrado ese día.</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="spaceSlug" value={spaceSlug} />
      <input type="hidden" name="date" value={date} />

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Horario</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => (
            <label
              key={slot.startTime}
              className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm ${
                slot.available
                  ? "border-gray-300 hover:border-gray-400"
                  : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
              }`}
            >
              <input
                type="radio"
                name="startTime"
                value={slot.startTime}
                required
                disabled={!slot.available}
                className="sr-only"
              />
              {slot.startTime}
            </label>
          ))}
        </div>
      </fieldset>

      {maxPeoplePerBooking != null && (
        <div>
          <label htmlFor="partySize" className="text-sm font-medium text-gray-700">
            Número de personas (máx. {maxPeoplePerBooking})
          </label>
          <input
            id="partySize"
            name="partySize"
            type="number"
            min={1}
            max={maxPeoplePerBooking}
            defaultValue={1}
            className="mt-1 block w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
      )}
      {maxPeoplePerBooking == null && <input type="hidden" name="partySize" value={1} />}

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          ¡Reserva confirmada! La puedes ver en tu panel.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "Reservando..." : "Reservar"}
      </button>
    </form>
  );
}
