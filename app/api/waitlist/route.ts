import { NextResponse } from "next/server";
import { notifyNewSignup } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { joinWaitlist, signupSchema, statusByCode } from "@/lib/waitlist";

export async function POST(req: Request) {
  if (!rateLimit(`join:${clientIp(req.headers)}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const emailIssue = parsed.error.issues.some((i) => i.path[0] === "email");
    return NextResponse.json(
      { error: emailIssue ? "Please enter a valid email address." : "Invalid submission." },
      { status: 400 },
    );
  }

  try {
    const status = await joinWaitlist(parsed.data);
    if (!status.alreadyJoined) {
      await notifyNewSignup({ email: parsed.data.email, name: parsed.data.name, persona: parsed.data.persona, referredBy: parsed.data.ref, position: status.position, total: status.total });
    }
    return NextResponse.json(status, { status: status.alreadyJoined ? 200 : 201 });
  } catch (err) {
    console.error("waitlist signup failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

// Lets a returning visitor refresh their queue position from their referral code.
export async function GET(req: Request) {
  if (!rateLimit(`status:${clientIp(req.headers)}`, 30)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const code = new URL(req.url).searchParams.get("code")?.trim();
  if (!code || code.length > 16) return NextResponse.json({ error: "Missing code." }, { status: 400 });

  const status = await statusByCode(code);
  if (!status) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(status);
}
