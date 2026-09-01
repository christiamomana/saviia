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
    return <p className="text-sm text-foreground/60">Este espacio está cerrado ese día.</p>;
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="spaceSlug" value={spaceSlug} />
      <input type="hidden" name="date" value={date} />

      <fieldset>
        <legend className="text-sm font-medium text-saviia-purple-dark">Horario</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => (
            <label
              key={slot.startTime}
              className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm transition has-[:checked]:border-saviia-purple has-[:checked]:bg-saviia-purple has-[:checked]:text-white ${
                slot.available
                  ? "border-black/10 hover:border-saviia-purple/40"
                  : "cursor-not-allowed border-black/5 bg-black/[0.02] text-foreground/30"
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
          <label htmlFor="partySize" className="text-sm font-medium text-saviia-purple-dark">
            Número de personas (máx. {maxPeoplePerBooking})
          </label>
          <input
            id="partySize"
            name="partySize"
            type="number"
            min={1}
            max={maxPeoplePerBooking}
            defaultValue={1}
            className="mt-1 block w-24 rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
          />
        </div>
      )}
      {maxPeoplePerBooking == null && <input type="hidden" name="partySize" value={1} />}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ¡Reserva confirmada! La puedes ver en tu panel.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-saviia-purple px-5 py-2.5 text-sm font-medium text-white transition hover:bg-saviia-purple-dark disabled:opacity-50"
      >
        {pending ? "Reservando..." : "Reservar"}
      </button>
    </form>
  );
}
