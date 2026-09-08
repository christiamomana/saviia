"use client";

import { useActionState } from "react";
import { celadorLoginAction, type CeladorLoginState } from "@/lib/actions/celador";

const initialState: CeladorLoginState = {};

export function CeladorLoginForm() {
  const [state, formAction, pending] = useActionState(celadorLoginAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <div>
        <label className="text-xs font-medium text-saviia-purple-dark">Contraseña</label>
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1 block w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:border-saviia-purple focus:outline-none focus:ring-1 focus:ring-saviia-purple"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-saviia-purple px-5 py-1.5 text-sm font-medium text-white hover:bg-saviia-purple-dark disabled:opacity-50"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
