import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Noto_Serif_Devanagari, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], axes: ["opsz"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
const devanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600"],
  variable: "--font-devanagari",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://okil.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Okil · AI practice platform for law firms in Nepal",
  description:
    "Manage clients, cases and hearings, draft documents, analyse contracts and research Nepali law, all in one system, in Nepali or English. Request early access.",
  openGraph: {
    title: "Okil",
    description: "Practice management, drafting and document analysis for law firms in Nepal. Request early access.",
    url: siteUrl,
    siteName: "Okil",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable} ${devanagari.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
