"use client";

import { useActionState } from "react";
import { addResidentAction, type AddResidentState } from "@/lib/actions/residents";

const initialState: AddResidentState = {};

export function AddResidentForm() {
  const [state, formAction, pending] = useActionState(addResidentAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-end">
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-saviia-purple-dark">Correo Gmail</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-saviia-purple-dark">Nombre</label>
        <input
          name="name"
          required
          className="mt-1 block w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-saviia-purple-dark">Apto/Unidad</label>
        <input
          name="unit"
          required
          className="mt-1 block w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
        />
      </div>
      <div className="flex gap-2">
        <select
          name="role"
          defaultValue="RESIDENT"
          className="rounded-lg border border-black/10 px-2 py-1.5 text-sm"
        >
          <option value="RESIDENT">Residente</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          name="paymentStatus"
          defaultValue="AL_DIA"
          className="rounded-lg border border-black/10 px-2 py-1.5 text-sm"
        >
          <option value="AL_DIA">Al día</option>
          <option value="MORA">En mora</option>
        </select>
      </div>

      <div className="sm:col-span-5">
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-700">Residente agregado.</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-saviia-purple px-5 py-1.5 text-sm font-medium text-white hover:bg-saviia-purple-dark disabled:opacity-50"
        >
          {pending ? "Agregando..." : "Agregar residente"}
        </button>
      </div>
    </form>
  );
}
