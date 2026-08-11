import Link from "next/link";
import { getLedgerStats } from "@/lib/db/case-studies";
import { readAllCases, ledgerFromCases } from "@/lib/archive-ledger";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { href: "/explore", label: "The archive" },
      { href: "/insights", label: "Insights" },
      { href: "/about", label: "About" },
    ],
  },
  {
    heading: "Instruments",
    links: [
      { href: "/ask", label: "Archive terminal" },
      { href: "/pre-mortem", label: "Forensic pre-mortem" },
      { href: "/submit", label: "Submit a case" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

/**
 * Closing page of the archive: one tight block — identity, three
 * navigation columns, the archive ledger line, and the colophon.
 * No watermark, no newsletter, no marketing rails.
 */
export async function Footer() {
  const cases = readAllCases();
  const ledger = (await getLedgerStats()) || ledgerFromCases(cases);
  const published = ledger?.published ?? 0;
  const inReview = ledger?.inReview ?? 0;
  const spanStart = ledger?.span?.split("–")[0]?.trim() ?? null;

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-y-10">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-[15px] font-semibold tracking-tight text-ink">
              Start-up Graveyard
            </p>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-ink-mute sm:max-w-md lg:mt-3 lg:max-w-xs">
              A forensic research archive documenting why real startups failed —
              so their mistakes are not repeated.
            </p>
            <p className="mt-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute lg:mt-5">
              Automated drafting → fact-check → human review
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="label-catalog">{col.heading}</p>
              <ul className="mt-3 space-y-2 lg:mt-4 lg:space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-nav pb-0.5 text-sm text-ink-mute transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-8 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute lg:mt-10 lg:pt-5">
          {spanStart ? `Archiving failures since ${spanStart}` : "Forensic research archive"}
          {" · "}
          {published} cases published
          {inReview > 0 ? ` · ${inReview} awaiting review` : " · all cases reviewed"}
        </p>

        <div className="mt-6 flex flex-col gap-1.5 border-t border-line pt-4 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between lg:mt-8 lg:gap-2 lg:pt-5">
          <p>
            © {new Date().getFullYear()} Start-up Graveyard. Documenting failure
            so it isn&apos;t repeated.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
            Evidence over opinion
          </p>
        </div>
      </div>
    </footer>
  );
}
