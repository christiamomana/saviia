"use client";

import { updateResidentAction } from "@/lib/actions/residents";
import type { Resident } from "@prisma/client";

export function ResidentRow({ resident }: { resident: Resident }) {
  return (
    <form
      action={updateResidentAction.bind(null, resident.id)}
      className="grid grid-cols-1 items-center gap-2 border-b border-black/5 px-5 py-4 last:border-b-0 sm:grid-cols-6"
    >
      <div className="sm:col-span-2">
        <p className="text-sm font-medium text-saviia-purple-dark">{resident.name}</p>
        <p className="text-xs text-foreground/50">{resident.email}</p>
      </div>
      <input
        name="unit"
        defaultValue={resident.unit}
        className="rounded-lg border border-black/10 px-2 py-1 text-sm"
      />
      <select
        name="role"
        defaultValue={resident.role}
        className="rounded-lg border border-black/10 px-2 py-1 text-sm"
      >
        <option value="RESIDENT">Residente</option>
        <option value="ADMIN">Admin</option>
      </select>
      <select
        name="paymentStatus"
        defaultValue={resident.paymentStatus}
        className="rounded-lg border border-black/10 px-2 py-1 text-sm"
      >
        <option value="AL_DIA">Al día</option>
        <option value="MORA">En mora</option>
      </select>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-foreground/60">
          <input
            type="checkbox"
            name="bookingSuspended"
            defaultChecked={resident.bookingSuspended}
          />
          Suspendido
        </label>
        <button
          type="submit"
          className="rounded-full border border-saviia-purple/30 px-3 py-1 text-xs text-saviia-purple-dark hover:bg-saviia-purple/10"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
