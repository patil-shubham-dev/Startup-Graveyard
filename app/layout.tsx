import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AppFooter } from "@/components/site/AppFooter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Start-up Graveyard — Forensic Intelligence Archive",
    template: "%s — Start-up Graveyard",
  },
  description:
    "A forensic research archive documenting why startups fail. Investigate real case studies, analyze failure patterns, and learn from the dead.",
  openGraph: {
    title: "Start-up Graveyard",
    description: "Forensic Intelligence Archive — documenting why startups fail.",
    siteName: "Start-up Graveyard",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Start-up Graveyard — forensic research archive" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {/* START-UP GRAVEYARD — DIRECTION CONTRACT
        THESIS: A canonical research archive: evidence over atmosphere. Refuses the graveyard-kitsch register and the
        data-viz-theatre register; the page is an institution, not a gimmick or a demo.
        OWN-WORLD: Paper-white ground (#faf9f6), charcoal ink, oxblood accent, hairline rules, Geist sans with
        tabular figures for every measure; one near-black well for the living-archive section. No gradients, no glass,
        no emoji, no icons-as-decoration.
        STORY: The visitor believes this archive is serious, real, and alive — every figure verifiable from the case
        data, four cases under human review, growing weekly — and acts: explore, run a pre-mortem, ask the archive.
        FIRST VIEWPORT: Wordmark and primary nav above a ruled hero: one-line tribute headline with a serif italic
        phrase, purpose lead, two actions (Explore / Pre-mortem), and a data ledger of the archive as it stands today.
        FORM: canon — category standard taken via the standing exit (roll 6c35e3d4 declined); craft bar set by
        Linear/Stripe/Vercel, The Economist/FT, McKinsey/BCG, Wikipedia.
        FINISH: "unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md"
        */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <AppFooter footer={<Footer />} />
      </body>
    </html>
  );
}
