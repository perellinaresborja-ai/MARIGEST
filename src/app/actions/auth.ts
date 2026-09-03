"use server";
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Rate limiting in-memory simple
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export async function login(formData: FormData) {
  const pin = formData.get("pin")?.toString().trim();

  if (!pin) {
    return { success: false, error: "Introduce el PIN" };
  }

  // PIN MAESTRO
  if (pin === "1506") {
    const token = await signToken({ email: "marijsanchezdiaz@gmail.com", role: "ADMIN" });
    
    const cookieStore = await cookies();
    cookieStore.set("marigest_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 año de sesión para no molestar
      path: "/",
    });

    return { success: true };
  }

  return { success: false, error: "PIN incorrecto" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("marigest_session");
  return { success: true };
}
