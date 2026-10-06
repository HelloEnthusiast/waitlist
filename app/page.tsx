import { waitlistTotal } from "@/lib/waitlist";
import WaitlistForm from "./WaitlistForm";

// Refresh the public signup counter at most once a minute.
export const revalidate = 60;

// How a practice typically runs today, in the words a partner would use.
const today = [
  "Hearing dates live in a paper diary and one clerk's memory.",
  "Client details sit in WhatsApp chats, phone contacts and loose files.",
  "Every agreement is retyped from the last one saved in Word.",
  "Reading a 40-page contract means an associate's whole afternoon.",
  "Invoices are written by hand and chased by phone.",
  "Finding the right Supreme Court ruling takes hours of flipping through Patrikas.",
];

const clauses = [
  {
    no: "१",
    title: "Practice management",
    lead: "One system of record for the whole firm: clients, cases, hearings, tasks, documents and billing. Everyone sees what their role allows, and nothing lives only in someone's head.",
    covers: [
      "client and matter records with full history",
      "पेशी diary with SMS and email reminders to advocates and clients",
      "task assignment and deadlines across the team",
      "time tracking and NPR invoicing",
      "a document vault with role-based access",
      "contract renewal and expiry tracking",
    ],
  },
  {
    no: "२",
    title: "Drafting",
    lead: "Describe the matter in a sentence or two. Okil prepares the first draft, laid out the way courts and government offices in Nepal expect, in Nepali or English. Your advocate reviews, edits and signs.",
    covers: [
      "rental, employment, partnership and service agreements",
      "NDAs, MoUs and power of attorney (अख्तियारनामा)",
      "legal notices and applications",
      "plaints (फिराद) and writ petitions",
      "your firm's own templates and clause library",
    ],
  },
  {
    no: "३",
    title: "Document analysis",
    lead: "Upload a contract, a judgment or a case file. Okil summarises it, pulls out the parties, dates, obligations and amounts, and flags one-sided or missing clauses, so your team starts from the findings instead of page one.",
    covers: [
      "contract review with suggested changes",
      "key dates and obligations pulled into the diary",
      "short summaries of long judgments and case bundles",
      "side-by-side comparison of two versions",
    ],
  },
  {
    no: "४",
    title: "Legal research",
    lead: "Search Nepali law by describing the problem. Every answer cites the section or judgment it came from, so an advocate can verify it in seconds.",
    covers: [
      "the Constitution of Nepal",
      "Muluki Civil and Criminal Codes, 2074",
      "Acts, rules and regulations",
      "Supreme Court precedents from Nepal Kanoon Patrika",
    ],
  },
];

// Sample rows for the hearing-diary illustration.
const diary = [
  { date: "असोज २१", court: "काठमाडौं जिल्ला अदालत", matter: "घरबहाल विवाद", no: "०८२-सी-०१४५" },
  { date: "कात्तिक ३", court: "उच्च अदालत पाटन", matter: "लेनदेन", no: "०८२-एपी-०३१२" },
  { date: "कात्तिक १२", court: "सर्वोच्च अदालत", matter: "रिट निवेदन", no: "०८२-डब्लुओ-००८८" },
];

const audiences = [
  ["Law firms", "Partners and associates who want one place for clients, cases, drafts and billing."],
  ["Solo advocates", "Run a one-person practice with the organisation of a larger firm."],
  ["In-house legal teams", "Contracts, renewals, compliance filings and approvals for a company's own legal work."],
];

function Seal() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <defs>
        <path id="seal-ring" d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0" />
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="60" cy="60" r="56" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="51" strokeWidth="0.8" />
        <circle cx="60" cy="60" r="31" strokeWidth="0.8" />
      </g>
      <text fill="currentColor" fontSize="10" fontFamily="var(--font-mono)">
        <textPath href="#seal-ring" textLength="266" lengthAdjust="spacing">
          OKIL.AI • FOR LAW FIRMS • EARLY ACCESS •
        </textPath>
      </text>
      <text x="60" y="58" textAnchor="middle" fill="currentColor" fontSize="15" fontFamily="var(--font-devanagari)">
        ओकिल
      </text>
      <text x="60" y="74" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="var(--font-devanagari)">
        २०८३
      </text>
    </svg>
  );
}

function Scribble() {
  return (
    <svg
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      className="absolute -bottom-2 left-0 h-3 w-full text-crimson"
      aria-hidden="true"
    >
      <path
        d="M3 9 C 30 4, 58 11, 92 7 S 150 3, 172 8 S 192 10, 197 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function Home() {
  const total = await waitlistTotal().catch(() => 0);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="flex items-baseline justify-between pb-4 pt-7">
          <span className="font-serif text-[1.7rem] font-semibold tracking-tight">
            okil<span className="text-crimson">.</span>
          </span>
          <span className="font-mono text-xs text-ink/60">
            <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-crimson" />
            early access is open
          </span>
        </header>
        <div className="double-rule" />

        <section className="grid gap-14 pb-20 pt-14 lg:grid-cols-12 lg:gap-10 lg:pt-20">
          <div className="lg:col-span-7">
            <p className="font-deva text-xl text-crimson">कानुनी अभ्यासका लागि एउटै प्रणाली।</p>
            <h1 className="mt-4 font-serif text-[2.9rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-7xl">
              The AI practice platform for{" "}
              <span className="relative inline-block whitespace-nowrap">
                Nepal&rsquo;s law firms.
                <Scribble />
              </span>
            </h1>
            <p className="mt-8 max-w-xl font-serif text-xl leading-relaxed text-ink/80">
              Okil brings your clients, cases, hearing dates, billing and documents into one system, with AI that drafts
              agreements, reads contracts and researches Nepali law alongside your team. In Nepali or English.
            </p>
            {total > 0 && (
              <p className="mt-8 font-mono text-sm text-ink/60">
                {total.toLocaleString()} {total === 1 ? "person has" : "people have"} joined the early-access list.
              </p>
            )}
          </div>

          <div className="relative lg:col-span-5 lg:pt-4">
            <div className="pointer-events-none absolute -right-1 -top-12 z-10 h-28 w-28 rotate-[-14deg] text-crimson opacity-80 mix-blend-multiply sm:-right-6 sm:h-32 sm:w-32">
              <Seal />
            </div>
            <div className="relative border border-ink/70 bg-[#fbf8f1] p-6 shadow-[6px_6px_0_rgba(28,26,23,0.9)] sm:p-8">
              <WaitlistForm />
            </div>
          </div>
        </section>

        <section className="border-t border-ink/20 py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-3xl font-semibold leading-tight">Most practices still run on memory and paper.</h2>
              <p className="mt-3 max-w-xs text-ink/65">
                Good advocates lose hours every week to work that is not advocacy.
              </p>
            </div>
            <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-8">
              {today.map((t, i) => (
                <li
                  key={t}
                  className={`border-l-2 pl-4 font-serif text-lg leading-snug text-ink/85 ${
                    i % 3 === 1 ? "border-crimson" : "border-ink/25"
                  }`}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="double-rule py-16">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">One platform, four jobs</h2>
          <p className="mt-2 font-mono text-xs text-ink/55">a CRM for the firm, with an AI associate built in.</p>

          <ol className="mt-12">
            {clauses.map((c) => (
              <li key={c.no} className="grid gap-4 border-t border-ink/15 py-9 md:grid-cols-12 md:gap-8">
                <div className="flex items-baseline gap-4 md:col-span-4">
                  <span className="font-deva text-4xl leading-none text-crimson">{c.no}.</span>
                  <h3 className="font-serif text-2xl font-semibold leading-tight">{c.title}</h3>
                </div>
                <div className="md:col-span-8">
                  <p className="font-serif text-lg leading-relaxed text-ink/85">{c.lead}</p>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/65">
                    <span className="font-mono text-xs text-ink/50">includes:&nbsp;</span>
                    {c.covers.join("; ")}.
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="relative left-1/2 w-screen -translate-x-1/2 bg-ink py-20 text-paper">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs text-paper/60">built for the people who run the practice</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                Who Okil is for.
              </h2>
              <p className="mt-4 text-paper/70">
                The same system works whether you are one advocate or a firm with several partners, and the AI uses
                your matters and templates, so its drafts start closer to how you already work.
              </p>
              <dl className="mt-8 space-y-4">
                {audiences.map(([term, desc]) => (
                  <div key={term} className="grid grid-cols-[8.5rem_1fr] gap-3 border-t border-paper/15 pt-4">
                    <dt className="font-serif font-semibold">{term}</dt>
                    <dd className="text-sm leading-relaxed text-paper/70">{desc}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="self-center lg:col-span-7 lg:pl-6">
              <div className="rotate-[0.6deg] border border-ink/20 bg-[#fbf8f1] p-5 text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] sm:p-7">
                <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
                  <span className="font-deva text-xl font-semibold">पेशी डायरी</span>
                  <span className="font-mono text-xs text-ink/55">this month · 3 hearings</span>
                </div>
                <table className="mt-2 w-full text-left">
                  <tbody>
                    {diary.map((row) => (
                      <tr key={row.no} className="border-b border-dashed border-ink/25 last:border-0">
                        <td className="whitespace-nowrap py-3 pr-4 align-top font-deva text-crimson">{row.date}</td>
                        <td className="py-3 pr-4 align-top">
                          <div className="font-deva">{row.court}</div>
                          <div className="font-deva text-sm text-ink/60">{row.matter}</div>
                        </td>
                        <td className="hidden whitespace-nowrap py-3 text-right align-top font-deva text-xs text-ink/50 sm:table-cell">
                          {row.no}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 border-t border-ink/15 pt-3 font-mono text-[0.7rem] text-ink/55">
                  reminder sent to 2 advocates · 1 client
                </p>
              </div>
              <figcaption className="mt-3 text-right font-mono text-[0.7rem] text-paper/45">
                a sketch of the hearing diary
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="grid gap-8 py-20 lg:grid-cols-12">
          <h2 className="font-serif text-3xl font-semibold lg:col-span-4">Our position on AI in legal work.</h2>
          <div className="max-w-2xl font-serif text-lg leading-relaxed text-ink/85 lg:col-span-8">
            <p>
              Okil is a tool for advocates, not a substitute for them. It prepares drafts, summaries and research with
              citations; the advocate reviews, decides and signs. Responsibility for the work stays where the law puts
              it.
            </p>
            <p className="mt-4">
              Client files are confidential, and the product is being designed around that. We are opening early
              access to a small number of firms at a time so we can build it with them. Join the list and we will write
              to you when it is your turn.
            </p>
            <p className="mt-6 font-deva text-crimson">धन्यवाद,</p>
            <p className="italic">the Okil team</p>
          </div>
        </section>

        <footer className="double-rule flex flex-col gap-2 py-8 font-mono text-xs text-ink/55 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} okil.ai · info@okil.ai</span>
          <span>Okil provides software and legal information, not legal advice.</span>
        </footer>
      </div>
    </main>
  );
}
