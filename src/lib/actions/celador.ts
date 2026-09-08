"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Contraseña compartida fija para vigilancia (celadores no tienen cuenta de
// Google en el sistema, así que no pueden pasar por el login normal).
const CELADOR_PASSWORD = "Saviia2025";
const COOKIE_NAME = "celador_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 horas, dura un turno de vigilancia

export type CeladorLoginState = { error?: string };

export async function celadorLoginAction(
  _prevState: CeladorLoginState,
  formData: FormData
): Promise<CeladorLoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || password !== CELADOR_PASSWORD) {
    return { error: "Contraseña incorrecta." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  redirect("/celador/reservas");
}

export async function celadorLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/celador");
}

export async function hasCeladorSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "1";
}
