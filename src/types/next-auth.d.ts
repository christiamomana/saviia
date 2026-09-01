import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      residentId: string;
      unit: string;
      role: "RESIDENT" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    residentId?: string;
    unit?: string;
    role?: "RESIDENT" | "ADMIN";
  }
}
