import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, sessionCookieValue } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function authorized(req: Request): Promise<boolean> {
  const session = sessionCookieValue();
  if (session && (await cookies()).get(ADMIN_COOKIE)?.value === session) return true;
  const expected = process.env.ADMIN_TOKEN;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || expected.length < 16) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  if (!(await authorized(req))) return new Response("Unauthorized", { status: 401 });

  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { id: "asc" },
    include: { referredBy: { select: { email: true } } },
  });

  const header = ["id", "email", "name", "persona", "referral_code", "referral_count", "referred_by", "created_at"];
  const rows = entries.map((e) =>
    [e.id, e.email, e.name, e.persona, e.referralCode, e.referralCount, e.referredBy?.email, e.createdAt.toISOString()]
      .map(csvCell)
      .join(","),
  );

  return new Response([header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="okil-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
