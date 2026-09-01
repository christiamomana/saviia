import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const resident = await prisma.resident.findUnique({
        where: { email: user.email.toLowerCase() },
      });
      // Solo los correos precargados por la Administración pueden ingresar.
      return resident !== null;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const resident = await prisma.resident.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (resident) {
          token.residentId = resident.id;
          token.unit = resident.unit;
          token.role = resident.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.residentId = token.residentId as string;
        session.user.unit = token.unit as string;
        session.user.role = token.role as "RESIDENT" | "ADMIN";
      }
      return session;
    },
  },
});
