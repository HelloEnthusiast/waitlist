"use client";

import { useEffect, useState } from "react";

type Status = {
  referralCode: string;
  position: number;
  total: number;
  referralCount: number;
  alreadyJoined: boolean;
};

const STORAGE_KEY = "okil-waitlist-code";
const REFERRAL_BOOST = 5;

const personas = [
  { value: "LAWYER", label: "an advocate or law firm" },
  { value: "BUSINESS", label: "an in-house legal team" },
  { value: "INDIVIDUAL", label: "an individual" },
  { value: "STUDENT", label: "a law student" },
] as const;

function readStoredCode(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeCode(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Storage unavailable (private mode etc.) — the status just won't persist.
  }
}

export default function WaitlistForm() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ref, setRef] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRef(params.get("ref") ?? undefined);

    const code = readStoredCode();
    if (!code) return;
    fetch(`/api/waitlist?code=${encodeURIComponent(code)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Status | null) => s && setStatus(s))
      .catch(() => {});
  }, []);

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
          ref,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      storeCode(data.referralCode);
      setStatus(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const link = `${origin}/?ref=${status.referralCode}`;
    const shareText = "I've put my name down for Okil, a way to ask legal questions in Nepali or English. Worth a look:";

    return (
      <div>
        <p className="font-mono text-xs text-ink/55">{status.alreadyJoined ? "welcome back" : "done. you're in line."}</p>
        <p className="mt-3 font-serif text-2xl leading-snug">
          You&rsquo;re number{" "}
          <span className="font-semibold text-crimson tabular-nums">{status.position.toLocaleString()}</span> of{" "}
          {status.total.toLocaleString()}.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          We&rsquo;ll email you when your turn comes. Nothing else in the meantime.
        </p>

        <div className="mt-6 border-t border-dashed border-ink/30 pt-5">
          <p className="font-serif text-lg font-semibold">Want to get in sooner?</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/65">
            Send this link to a colleague or another firm. Each person who joins through it moves you{" "}
            {REFERRAL_BOOST} places up.
            {status.referralCount > 0 &&
              ` So far ${status.referralCount} ${status.referralCount === 1 ? "person has" : "people have"}.`}
          </p>
          <div className="mt-4 flex border border-ink/60">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Your invite link"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-xs outline-none"
            />
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(link).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="border-l border-ink/60 bg-ink px-4 py-2 text-sm text-paper transition hover:bg-crimson"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-3 text-sm text-ink/65">
            or share on{" "}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson"
            >
              WhatsApp
            </a>
            ,{" "}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson"
            >
              Facebook
            </a>{" "}
            or{" "}
            <a
              href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-crimson decoration-2 underline-offset-4 hover:text-crimson"
            >
              X
            </a>
            .
          </p>
        </div>
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
        {ref ? "A friend sent you here, so they'll move up a few places too. " : ""}
        One email when it&rsquo;s your turn. No newsletters, no sharing your address.
      </p>
    </form>
  );
}
