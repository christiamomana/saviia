import Image from "next/image";
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[radial-gradient(circle_at_50%_-10%,#fff,transparent_60%),linear-gradient(180deg,#fbf7f1,#f3e9e0)] px-6 py-12 text-center">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl shadow-saviia-purple/10">
        <div className="h-1.5 w-full bg-gradient-to-r from-saviia-gold via-saviia-coral to-saviia-purple" />
        <div className="flex flex-col items-center gap-6 px-8 py-10">
          <Image src="/logo.png" alt="Saviia" width={168} height={62} priority />

          <div>
            <h1 className="text-lg font-semibold text-saviia-purple-dark">
              Reservas de espacios comunes
            </h1>
            <p className="mt-1 text-sm text-saviia-purple-dark/60">
              Conjunto Residencial Saviia PH
            </p>
          </div>

          {error && (
            <p className="w-full rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error === "AccessDenied"
                ? "Tu correo no está registrado como residente. Contacta a la Administración."
                : "No fue posible iniciar sesión. Intenta de nuevo."}
            </p>
          )}

          <form
            className="w-full"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl ?? "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-saviia-purple/20 bg-white px-6 py-3 text-sm font-medium text-saviia-purple-dark shadow-sm transition hover:border-saviia-purple/40 hover:shadow-md"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
                />
              </svg>
              Iniciar sesión con Google
            </button>
          </form>
        </div>
      </div>

      <p className="text-xs text-saviia-purple-dark/40">
        Solo residentes registrados por la Administración pueden reservar.
      </p>
    </main>
  );
}
