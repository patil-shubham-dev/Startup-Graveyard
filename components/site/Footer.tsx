import Link from "next/link";
import Image from "next/image";
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

export async function Footer() {
  const cases = readAllCases();
  const ledger = (await getLedgerStats()) || ledgerFromCases(cases);
  const published = ledger?.published ?? 0;
  const inReview = ledger?.inReview ?? 0;
  const spanStart = ledger?.span?.split("–")[0]?.trim() ?? null;

  const latestPublishedAt = cases
    .map((c) => c.published_at)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);
  const lastUpdated = latestPublishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      })
        .format(new Date(latestPublishedAt))
        .toUpperCase()
    : null;

  return (
    <footer className="relative overflow-hidden border-t border-line bg-paper">
      <div
        aria-hidden
        className="archive-watermark absolute bottom-0 right-0 h-full w-1/2 max-w-[420px]"
      >
        <Image
          src="/archive-mark.webp"
          alt=""
          fill
          sizes="420px"
          style={{ objectFit: "contain", objectPosition: "center" }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-ink">
              Start-up Graveyard
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-mute">
              A forensic research archive documenting why real startups failed —
              so their mistakes are not repeated.
            </p>
            <p className="mt-6 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
              {spanStart ? `Archiving failures since ${spanStart}` : "Forensic research archive"}
              {" · "}
              {published} cases published · {inReview} awaiting review
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
              Automated drafting → fact-check → human review
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="label-catalog">{col.heading}</p>
              <ul className="mt-5 space-y-3">
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
        <dl className="mt-14 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-7 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="label-catalog">Archive volume</dt>
            <dd className="mt-2 font-mono text-sm text-ink">Vol. I · 2026</dd>
          </div>
          <div>
            <dt className="label-catalog">Archive version</dt>
            <dd className="mt-2 font-mono text-sm text-ink">Milestone 24</dd>
          </div>
          <div>
            <dt className="label-catalog">Last updated</dt>
            <dd className="mt-2 font-mono text-sm text-ink">{lastUpdated ?? "—"}</dd>
          </div>
          <div>
            <dt className="label-catalog">Editorial standard</dt>
            <dd className="mt-2 text-sm text-ink">Evidence before opinion</dd>
          </div>
        </dl>
        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Start-up Graveyard. Documenting failure
            so it isn&apos;t repeated.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
            Evidence over opinion · {inReview > 0 ? `${inReview} case${inReview === 1 ? "" : "s"} awaiting review` : "All cases reviewed"}
          </p>
        </div>
      </div>
    </footer>
  );
}
