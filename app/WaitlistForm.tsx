"use client";

import { useState } from "react";

const personas = [
  { value: "LAWYER", label: "an advocate or law firm" },
  { value: "BUSINESS", label: "an in-house legal team" },
  { value: "INDIVIDUAL", label: "an individual" },
  { value: "STUDENT", label: "a law student" },
] as const;

export default function WaitlistForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          name: form.get("name"),
          persona: form.get("persona"),
          company: form.get("company"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div>
        <p className="font-mono text-xs text-ink/55">done. you&rsquo;re on the list.</p>
        <p className="mt-3 font-serif text-2xl leading-snug">Thank you. We&rsquo;ve got your request.</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          We&rsquo;ll email you when your turn comes. Nothing else in the meantime.
        </p>
      </div>
    );
  }

  const fieldClass =
    "mt-1 w-full border-0 border-b border-ink/50 bg-transparent px-0 py-2 font-serif text-lg outline-none transition placeholder:text-ink/30 focus:border-crimson focus:ring-0";

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="font-mono text-xs text-ink/55">early-access request</p>
      <p className="mt-2 font-serif text-3xl font-semibold leading-tight">Request early access.</p>
      <p className="mt-2 text-sm leading-relaxed text-ink/65">
        We&rsquo;re onboarding a few firms at a time. Leave your email and we&rsquo;ll write when it&rsquo;s your turn.
      </p>

      <label className="mt-7 block text-sm text-ink/70" htmlFor="email">
        Your email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="ram@example.com"
        className={fieldClass}
      />

      <label className="mt-5 block text-sm text-ink/70" htmlFor="name">
        What should we call you? <span className="text-ink/45">(optional)</span>
      </label>
      <input id="name" name="name" type="text" autoComplete="name" maxLength={80} className={fieldClass} />

      <fieldset className="mt-6">
        <legend className="text-sm text-ink/70">I am</legend>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {personas.map((p, i) => (
            <label key={p.value} className="flex cursor-pointer items-center gap-2 text-[0.95rem]">
              <input
                type="radio"
                name="persona"
                value={p.value}
                defaultChecked={i === 0}
                className="h-4 w-4 accent-crimson"
              />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-sm text-crimson">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-7 w-full bg-ink px-4 py-3.5 text-[0.95rem] font-medium text-paper transition hover:bg-crimson disabled:opacity-60"
      >
        {submitting ? "Adding you…" : "Add me to the list"}
      </button>
      <p className="mt-3 text-xs leading-relaxed text-ink/50">
        One email when it&rsquo;s your turn. No newsletters, no sharing your address.
      </p>
    </form>
  );
}
