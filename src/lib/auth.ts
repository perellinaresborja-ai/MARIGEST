import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_marigest_key_2026";
const key = new TextEncoder().encode(JWT_SECRET);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("marigest_session")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("No autenticado"); // Throwing error is safer for server actions than direct redirect to avoid NEXT_REDIRECT interference in try-catches.
  }
  return session;
}
