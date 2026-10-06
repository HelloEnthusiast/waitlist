"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, sessionCookieValue, tokenMatches } from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const ip = clientIp(await headers());
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60_000)) return "Too many attempts. Try again later.";

  const value = sessionCookieValue();
  if (!value || !tokenMatches(String(formData.get("token") ?? ""))) return "Invalid token.";

  (await cookies()).set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}
