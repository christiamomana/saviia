import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");

  const { callbackUrl, error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Saviia PH</h1>
        <p className="mt-1 text-sm text-gray-500">
          Reserva los espacios comunes de tu conjunto residencial.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error === "AccessDenied"
            ? "Tu correo no está registrado como residente. Contacta a la Administración."
            : "No fue posible iniciar sesión. Intenta de nuevo."}
        </p>
      )}

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: callbackUrl ?? "/dashboard" });
        }}
      >
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
        >
          Iniciar sesión con Google
        </button>
      </form>
    </main>
  );
}
