// Emails a new-signup notice to the team inbox over SMTP (Gmail / Google Workspace
// app password). The email is the only record of a signup, so failures throw.
import nodemailer, { type Transporter } from "nodemailer";

const NOTIFY_TO = process.env.NOTIFY_EMAIL ?? "info@okil.ai";

type Signup = { email: string; name?: string; persona: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

let transport: Transporter | undefined;
function getTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user, pass: pass.replace(/\s+/g, "") },
  });
  return transport;
}

export async function notifyNewSignup(s: Signup): Promise<void> {
  const t = getTransport();
  if (!t) throw new Error("SMTP_USER / SMTP_PASS are not configured");
  await t.sendMail({
      from: `"${(s.name ?? "New signup").replace(/[<>",]/g, "")} via okil.ai" <${process.env.SMTP_USER}>`,
      to: NOTIFY_TO,
      // Hit "Reply" in the inbox to write straight back to the person who signed up.
      replyTo: s.email,
      subject: `New waitlist signup: ${s.email}`,
      html: `<p><b>Email:</b> ${esc(s.email)}<br><b>Name:</b> ${esc(s.name ?? "—")}<br><b>Type:</b> ${esc(s.persona)}</p>`,
  });
}
