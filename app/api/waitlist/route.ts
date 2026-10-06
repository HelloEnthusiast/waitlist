import { NextResponse } from "next/server";
import { notifyNewSignup } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/waitlist";

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
    await notifyNewSignup(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("waitlist signup failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
