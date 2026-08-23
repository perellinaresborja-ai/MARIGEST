"use server";

import { cookies } from "next/headers";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Rate limiting in-memory simple (por email)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export async function login(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Email y contraseña son requeridos" };
  }

  // Rate limiting check
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
  
  if (attempt.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    return { success: false, error: `Demasiados intentos. Inténtalo de nuevo en ${minutesLeft} minuto(s).` };
  }

  const adminEmail = process.env.ADMIN_EMAIL || "marijsanchezdiaz@gmail.com";
  // Fallback hash for "Maria@1976" in case env var is missing
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "$2b$10$3iDjBAZ.VY44EXqlAHEf6ea6lyjJh./VFmp2fkk7UOMDwUttbqx0.";

  const isEmailValid = email === adminEmail;
  const isPasswordValid = isEmailValid ? await bcrypt.compare(password, adminPasswordHash) : false;

  if (isEmailValid && isPasswordValid) {
    // Reset attempts on success
    loginAttempts.delete(email);

    const token = await signToken({ email, role: "ADMIN" });
    
    const cookieStore = await cookies();
    cookieStore.set("marigest_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { success: true };
  }

  // Increase attempts on failure
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.lockedUntil = now + 15 * 60 * 1000; // 15 minutos de bloqueo
  }
  loginAttempts.set(email, attempt);

  return { success: false, error: "Credenciales inválidas" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("marigest_session");
  return { success: true };
}
