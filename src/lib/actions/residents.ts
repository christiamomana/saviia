"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado.");
  }
  return session;
}

const addResidentSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  unit: z.string().min(1),
  role: z.enum(["RESIDENT", "ADMIN"]),
  paymentStatus: z.enum(["AL_DIA", "MORA"]),
});

export type AddResidentState = { error?: string; success?: boolean };

export async function addResidentAction(
  _prevState: AddResidentState,
  formData: FormData
): Promise<AddResidentState> {
  await requireAdmin();

  const parsed = addResidentSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    unit: formData.get("unit"),
    role: formData.get("role"),
    paymentStatus: formData.get("paymentStatus"),
  });
  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el correo y los campos requeridos." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.resident.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe un residente con ese correo." };
  }

  await prisma.resident.create({
    data: { ...parsed.data, email },
  });

  revalidatePath("/admin");
  return { success: true };
}

const updateResidentSchema = z.object({
  unit: z.string().min(1),
  role: z.enum(["RESIDENT", "ADMIN"]),
  paymentStatus: z.enum(["AL_DIA", "MORA"]),
  bookingSuspended: z.coerce.boolean(),
});

export async function updateResidentAction(residentId: string, formData: FormData) {
  await requireAdmin();

  const parsed = updateResidentSchema.safeParse({
    unit: formData.get("unit"),
    role: formData.get("role"),
    paymentStatus: formData.get("paymentStatus"),
    bookingSuspended: formData.get("bookingSuspended") === "on",
  });
  if (!parsed.success) return;

  await prisma.resident.update({
    where: { id: residentId },
    data: parsed.data,
  });

  revalidatePath("/admin");
}
