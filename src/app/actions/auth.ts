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

  const inputEmail = email.toLowerCase().trim();
  const envEmail = (process.env.ADMIN_EMAIL || "marijsanchezdiaz@gmail.com").toLowerCase().trim();

  // Rate limiting check
  const now = Date.now();
  const attempt = loginAttempts.get(inputEmail) || { count: 0, lockedUntil: 0 };
  
  if (attempt.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    return { success: false, error: `Demasiados intentos. Inténtalo de nuevo en ${minutesLeft} minuto(s).` };
  }

  // Fallback hash in case env var is missing or invalid
  let adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
  if (!adminPasswordHash.startsWith("$2")) {
    adminPasswordHash = "$2b$10$3iDjBAZ.VY44EXqlAHEf6ea6lyjJh./VFmp2fkk7UOMDwUttbqx0.";
  }

  const isEmailValid = inputEmail === envEmail;
  const isPasswordValid = isEmailValid ? await bcrypt.compare(password.trim(), adminPasswordHash) : false;

  if (!isEmailValid || !isPasswordValid) {
    console.error(`Fallo de login. isEmailValid: ${isEmailValid}, isPasswordValid: ${isPasswordValid}. (Email introducido: ${inputEmail})`);
  }

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
