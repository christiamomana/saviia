"use client";

import { updateResidentAction } from "@/lib/actions/residents";
import type { Resident } from "@prisma/client";

export function ResidentRow({ resident }: { resident: Resident }) {
  return (
    <form
      action={updateResidentAction.bind(null, resident.id)}
      className="grid grid-cols-1 items-center gap-2 border-b border-gray-100 px-4 py-3 sm:grid-cols-6"
    >
      <div className="sm:col-span-2">
        <p className="text-sm font-medium">{resident.name}</p>
        <p className="text-xs text-gray-500">{resident.email}</p>
      </div>
      <input
        name="unit"
        defaultValue={resident.unit}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      <select
        name="role"
        defaultValue={resident.role}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="RESIDENT">Residente</option>
        <option value="ADMIN">Admin</option>
      </select>
      <select
        name="paymentStatus"
        defaultValue={resident.paymentStatus}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="AL_DIA">Al día</option>
        <option value="MORA">En mora</option>
      </select>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-gray-600">
          <input
            type="checkbox"
            name="bookingSuspended"
            defaultChecked={resident.bookingSuspended}
          />
          Suspendido
        </label>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
