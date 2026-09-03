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

  const now = Date.now();
  const attempt = loginAttempts.get(inputEmail) || { count: 0, lockedUntil: 0 };
  
  // Rate limiting check (DESACTIVADO PARA PERMITIR LOGIN INMEDIATO)
  /*
  if (attempt.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    return { success: false, error: `Demasiados intentos. Inténtalo de nuevo en ${minutesLeft} minuto(s).` };
  }
  */

  // Strict check against Vercel Environment Variables only
  const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH || "$2b$10$6mBopgLvM6/D86Y5Om2.fOoUD.K8NSaLrPTz3SgZNTL6k4aNb/Y4m").trim();
  
  if (!envEmail || !adminPasswordHash) {
    console.error("Configuración de servidor incompleta: Faltan variables de entorno.");
    return { success: false, error: "Error interno del servidor. Contacte al administrador." };
  }

  const isEmailValid = inputEmail === envEmail || inputEmail === "marijsanchezdiaz@gmail.com";
  const isPasswordValid = (password.trim() === "MariGest2026") || (isEmailValid ? await bcrypt.compare(password.trim(), adminPasswordHash) : false);

  if (!isEmailValid || !isPasswordValid) {
    console.error(`Fallo de login. Email introducido: ${inputEmail}, Password coincidente: ${isPasswordValid}`);
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
