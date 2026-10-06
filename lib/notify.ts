// Emails a new-signup notice to the team inbox via Resend. Best-effort: a mail
// failure is logged and never blocks or fails the signup itself.
const NOTIFY_TO = process.env.NOTIFY_EMAIL ?? "info@okil.ai";
const NOTIFY_FROM = process.env.NOTIFY_FROM ?? "okil.ai Waitlist <info@okil.ai>";

type Signup = { email: string; name?: string; persona: string; position: number; total: number; referredBy?: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function notifyNewSignup(s: Signup): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: s.name ? `${s.name.replace(/[<>",]/g, "")} via okil.ai <${NOTIFY_FROM.match(/<(.+)>/)?.[1] ?? NOTIFY_FROM}>` : NOTIFY_FROM,
        to: [NOTIFY_TO],
        // Hit "Reply" in the inbox to write straight back to the person who signed up.
        reply_to: s.email,
        subject: `New waitlist signup: ${s.email}`,
        html: `<p><b>Email:</b> ${esc(s.email)}<br><b>Name:</b> ${esc(s.name ?? "—")}<br><b>Type:</b> ${esc(s.persona)}<br><b>Referred by:</b> ${esc(s.referredBy ?? "—")}<br><b>Position:</b> ${s.position} of ${s.total}</p>`,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("signup notification failed", res.status, await res.text());
  } catch (err) {
    console.error("signup notification failed", err);
  }
}
