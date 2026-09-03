"use server";

import { cookies } from "next/headers";

export async function setProfileCookie(profile: string) {
  const cookieStore = await cookies();
  cookieStore.set("marigest_profile", profile, { path: "/" });
}

export async function getProfileCookie() {
  const cookieStore = await cookies();
  const profile = cookieStore.get("marigest_profile")?.value;
  return profile || "VERMUT"; // default
}
