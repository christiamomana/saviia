import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saviia PH — Reservas",
  description: "Reserva los espacios comunes del Conjunto Residencial Saviia PH.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-saviia-cream text-foreground">
        {session && (
          <header className="border-b border-black/5 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Saviia" width={92} height={34} priority />
              </Link>
              <nav className="flex items-center gap-5 text-sm">
                <Link
                  href="/dashboard"
                  className="text-saviia-purple-dark/80 hover:text-saviia-purple-dark"
                >
                  Mis reservas
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-saviia-purple-dark/80 hover:text-saviia-purple-dark"
                  >
                    Administración
                  </Link>
                )}
                <span className="hidden text-saviia-purple-dark/50 sm:inline">
                  {session.user.name} · Apto {session.user.unit}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full border border-saviia-purple/30 px-3 py-1 text-saviia-purple-dark/80 hover:bg-saviia-purple/10"
                  >
                    Salir
                  </button>
                </form>
              </nav>
            </div>
          </header>
        )}
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
