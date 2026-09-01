import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {session && (
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="font-semibold">
                Saviia PH
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Mis reservas
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                    Administración
                  </Link>
                )}
                <span className="text-gray-400">
                  {session.user.name} · Apto {session.user.unit}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button type="submit" className="text-gray-600 hover:text-gray-900">
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
