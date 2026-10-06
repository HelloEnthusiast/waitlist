import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "okil_admin";

// The cookie stores an HMAC derived from ADMIN_TOKEN, never the token itself.
function sessionValue(): string | null {
  const token = process.env.ADMIN_TOKEN;
  if (!token || token.length < 16) return null;
  return createHmac("sha256", token).update("okil-admin-session").digest("hex");
}

export function tokenMatches(given: string): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 16) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sessionCookieValue(): string | null {
  return sessionValue();
}

export async function hasAdminSession(): Promise<boolean> {
  const expected = sessionValue();
  const given = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  if (!expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
