import { redirect } from "next/navigation";
import { hasCeladorSession } from "@/lib/actions/celador";
import { CeladorLoginForm } from "./login-form";

export default async function CeladorLoginPage() {
  if (await hasCeladorSession()) redirect("/celador/reservas");

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-xl font-semibold text-saviia-purple-dark">Acceso vigilancia</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Ingresa la contraseña para consultar las reservas.
      </p>
      <CeladorLoginForm />
    </main>
  );
}
