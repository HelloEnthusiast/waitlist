import Link from "next/link";
import type { Persona, Prisma } from "@prisma/client";
import { hasAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { logout } from "./actions";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Okil admin", robots: { index: false, follow: false } };

const PERSONAS: Persona[] = ["INDIVIDUAL", "LAWYER", "BUSINESS", "STUDENT"];
const PAGE_SIZE = 50;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; persona?: string; page?: string }>;
}) {
  if (!(await hasAdminSession())) return <LoginForm />;

  const { q = "", persona = "", page = "1" } = await searchParams;
  const pageNo = Math.max(1, parseInt(page, 10) || 1);
  const where: Prisma.WaitlistEntryWhereInput = {
    ...(q && { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] }),
    ...(PERSONAS.includes(persona as Persona) && { persona: persona as Persona }),
  };

  const since = new Date(Date.now() - 24 * 3600_000);
  const [total, last24h, referred, byPersona, matching, entries] = await Promise.all([
    prisma.waitlistEntry.count(),
    prisma.waitlistEntry.count({ where: { createdAt: { gte: since } } }),
    prisma.waitlistEntry.count({ where: { referredById: { not: null } } }),
    prisma.waitlistEntry.groupBy({ by: ["persona"], _count: true }),
    prisma.waitlistEntry.count({ where }),
    prisma.waitlistEntry.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (pageNo - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { referredBy: { select: { email: true } } },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(matching / PAGE_SIZE));
  const link = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (persona) sp.set("persona", persona);
    sp.set("page", String(p));
    return `/admin?${sp}`;
  };
  const stat = (label: string, value: number) => (
    <div className="rounded border border-neutral-200 p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-neutral-500">{label}</div>
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Okil waitlist</h1>
        <div className="flex items-center gap-4 text-sm">
          <a href="/api/admin/export" className="underline">Download CSV</a>
          <form action={logout}><button className="underline">Sign out</button></form>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {stat("Total signups", total)}
        {stat("Last 24h", last24h)}
        {stat("Via referral", referred)}
        {PERSONAS.map((p) => stat(p.toLowerCase(), byPersona.find((b) => b.persona === p)?._count ?? 0))}
      </section>

      <form className="flex flex-wrap gap-2 text-sm">
        <input name="q" defaultValue={q} placeholder="Search email or name" className="rounded border border-neutral-300 px-3 py-2" />
        <select name="persona" defaultValue={persona} className="rounded border border-neutral-300 px-3 py-2">
          <option value="">All personas</option>
          {PERSONAS.map((p) => <option key={p} value={p}>{p.toLowerCase()}</option>)}
        </select>
        <button className="rounded bg-black px-4 py-2 text-white">Filter</button>
      </form>

      <div className="overflow-x-auto rounded border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              {["#", "Email", "Name", "Persona", "Referrals", "Referred by", "Joined"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-neutral-100">
                <td className="px-3 py-2">{e.id}</td>
                <td className="px-3 py-2">{e.email}</td>
                <td className="px-3 py-2">{e.name ?? "—"}</td>
                <td className="px-3 py-2 lowercase">{e.persona}</td>
                <td className="px-3 py-2">{e.referralCount}</td>
                <td className="px-3 py-2">{e.referredBy?.email ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">{e.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-neutral-500">No entries.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <nav className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">{matching} matching · page {pageNo} of {pages}</span>
        <span className="flex gap-4">
          {pageNo > 1 && <Link href={link(pageNo - 1)} className="underline">Previous</Link>}
          {pageNo < pages && <Link href={link(pageNo + 1)} className="underline">Next</Link>}
        </span>
      </nav>
    </main>
  );
}
