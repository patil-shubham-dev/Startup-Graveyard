import Link from "next/link";
import Image from "next/image";
import { getLedgerStats, type LedgerStats } from "@/lib/db/case-studies";
import { readAllCases, ledgerFromCases } from "@/lib/archive-ledger";
import { formatCurrencyCompact } from "@/lib/utils/format";
import { extractTimelineEvents, extractValuationPeak } from "@/lib/case-study-utils";
import { Reveal } from "@/components/site/Reveal";

const TICKER_ITEMS: Array<{ label: string; value: (l: LedgerStats) => string }> = [
  { label: "Documented cases", value: (l) => String(l.documented) },
  { label: "Published", value: (l) => String(l.published) },
  { label: "Under review", value: (l) => String(l.inReview) },
  { label: "Industries", value: (l) => String(l.industries) },
  { label: "Average lifespan", value: (l) => `${l.avgLifespan.toFixed(1)} years` },
  { label: "Archive span", value: (l) => l.span },
];

const SEARCH_FACETS = [
  "Company",
  "Founder",
  "Funding",
  "Industry",
  "Failure pattern",
  "Year",
  "Root cause",
];

const TICKER_COPIES = 4;

export default async function Home() {
  const cases = readAllCases();
  const published = cases.filter((c) => c.published);
  const ledger = (await getLedgerStats()) || ledgerFromCases(cases);
  const ledgerStats: LedgerStats = ledger ?? {
    documented: cases.length,
    published: published.length,
    inReview: cases.length - published.length,
    industries: 0,
    avgLifespan: 0,
    span: "—",
  };
  const inReview = ledgerStats.inReview;

  const byFunding = [...published].sort(
    (a, b) => (b.funding_raised || 0) - (a.funding_raised || 0),
  );
  const spotlight =
    byFunding.find((c) => extractTimelineEvents(c).length >= 3) ??
    byFunding[0];

  const failureModes = new Map<string, number>();
  for (const c of published) {
    for (const r of c.failure_reasons || []) {
      failureModes.set(r, (failureModes.get(r) ?? 0) + 1);
    }
  }
  const topModes = [...failureModes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxMode = topModes[0]?.[1] ?? 1;

  const totalBurned = published.reduce((sum, c) => sum + (c.funding_raised || 0), 0);

  return (
    <>
      {/* Hero */}
      <section className="hero relative mx-auto overflow-hidden">
        <div aria-hidden className="hero-engraving -z-10 w-[66%] sm:w-[58%] md:w-[50%] lg:w-[48%]">
          <Image
            src="/engraving-2.webp"
            alt=""
            fill
            priority
            sizes="60vw"
          />
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-6 sm:pt-20 md:pb-20 md:pt-24">
          <h1 className="rise max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.032em] text-ink sm:text-5xl md:text-7xl">
            <span className="block">Failure leaves clues.</span>
            <em className="hero-quiet-em mt-2 block font-serif font-normal italic sm:mt-1 md:mt-3">
              The archive preserves them.
            </em>
          </h1>
          <p className="rise rise-1 mt-8 max-w-2xl text-lg leading-relaxed text-ink-mute">
            Start-up Graveyard is a forensic research archive:{" "}
            {ledgerStats.documented} documented startup failures — their funding
            histories, warning signs, and root causes — searchable, comparable,
            and interrogable by AI. Learn from the dead so your next idea
            survives.
          </p>
          <div className="rise rise-2 mt-12 flex flex-wrap items-center gap-x-5 gap-y-4">
            <Link href="/explore" className="btn btn-primary">
              Explore the archive
            </Link>
            <Link href="/pre-mortem" className="btn btn-outline">
              Run a pre-mortem
            </Link>
          </div>
        </div>
      </section>

      {/* Moving archive ticker */}
      <div className="ticker" role="region" aria-label="Archive statistics">
        <div className="ticker-track">
          {Array.from({ length: TICKER_COPIES }, (_, copy) => (
            <div
              key={copy}
              className="ticker-seq"
              aria-hidden={copy > 0}
            >
              {TICKER_ITEMS.map((item) => (
                <span key={item.label} className="ticker-item">
                  <span>{item.label}</span>
                  <span aria-hidden className="ticker-dot">
                    •
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {item.value(ledgerStats)}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Archive search */}
      <section className="texture-paper">
        <div
          aria-hidden
          className="archive-watermark absolute right-0 top-0 h-full w-1/2 max-w-[560px]"
        >
          <Image
            src="/archive-mark.webp"
            alt=""
            fill
            sizes="560px"
            style={{ objectFit: "contain", objectPosition: "center" }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-6 md:pb-20 md:pt-20">
          <Reveal>
            <div className="max-w-3xl border-t border-line pt-8 md:pt-10">
              <p className="label-catalog flex items-center gap-2 text-accent-deep">
                <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
                Search the archive · {ledgerStats.documented} documented cases
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                Search across documented startup failures
              </h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-mute">
                Find companies, founders, funding histories, or the warning
                signs that preceded the shutdown — by keyword, industry, or
                failure pattern.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <form action="/explore" method="get" role="search" aria-label="Search the archive" className="mt-8 border-t border-line pt-8 md:pt-10">
              <div className="mt-1 flex max-w-3xl flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-mute"
                  >
                    Q.
                  </span>
                  <input
                    id="archive-search"
                    name="q"
                    type="search"
                    aria-label="Search the archive"
                    placeholder="Company, founder, industry, or failure pattern…"
                    className="field field-search w-full"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Search records
                </button>
              </div>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="footnote">Search by</span>
                {SEARCH_FACETS.map((facet) => (
                  <span key={facet} className="footnote flex items-center gap-3">
                    <span aria-hidden className="h-1 w-1 bg-ink-mute" />
                    {facet}
                  </span>
                ))}
              </p>
            </form>
          </Reveal>
        </div>
      </section>

      {/* The problem */}
      <section className="texture-paper bg-paper-2">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-20">
          <Reveal>
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              Failure is the industry&apos;s best-kept secret.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="space-y-5 text-[16px] leading-relaxed text-ink-mute">
              <p>
                Every startup blog covers the winners. The write-ups stop when
                the money does — so the same avoidable mistakes get made again,
                by new founders, with new money.
              </p>
              <p>
                This archive records what the ecosystem forgets: the funding
                histories, the warning signs, the root causes, and the verdicts —
                documented forensically, case by case, and searchable by pattern.
              </p>
              <p className="pt-2">
                <Link href="/insights" className="link-editorial">
                  Explore the failure patterns
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured case */}
      {spotlight && (
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 pt-16 pb-16 sm:px-6 md:grid-cols-[1fr_1.05fr] md:pt-20 md:pb-24">
            <Reveal>
              <p className="label-catalog flex items-center gap-2 text-accent-deep">
                <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
                Case file · featured
              </p>
              <h2 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
                {spotlight.company_name}
              </h2>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                No. {spotlight.case_number}
                {spotlight.published_at ? (
                  <>
                    {" · "}
                    Filed{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                      .format(new Date(spotlight.published_at))
                      .toUpperCase()}
                  </>
                ) : null}
              </p>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-mute">
                {spotlight.summary}
              </p>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-line pt-7 sm:grid-cols-3">
                <div>
                  <dt className="label-catalog">Raised</dt>
                  <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">
                    {formatCurrencyCompact(spotlight.funding_raised)}
                  </dd>
                </div>
                <div>
                  <dt className="label-catalog">Peak valuation</dt>
                  <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">
                    {formatCurrencyCompact(extractValuationPeak(spotlight))}
                  </dd>
                </div>
                <div>
                  <dt className="label-catalog">Lifespan</dt>
                  <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">
                    {spotlight.founded_year && spotlight.shutdown_year
                      ? `${spotlight.shutdown_year - spotlight.founded_year} yrs`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="label-catalog">Peak headcount</dt>
                  <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">
                    {spotlight.employees_peak
                      ? spotlight.employees_peak.toLocaleString("en-US")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="label-catalog">Industry</dt>
                  <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">
                    {spotlight.industry || "—"}
                  </dd>
                </div>
              </dl>
              <Link href={`/case/${spotlight.slug}`} className="btn btn-primary mt-10">
                Open case file
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="border-l border-line pl-8">
                <p className="label-catalog">Timeline · First four records</p>
                <ol className="mt-9 space-y-10">
                  {extractTimelineEvents(spotlight)
                    .slice(0, 4)
                    .map((e, i) => (
                      <li key={`${e.date}-${e.title}`} className="relative">
                        <span
                          aria-hidden
                          className={`absolute -left-[35px] top-[7px] h-1.5 w-1.5 ${
                            i === 3 ? "bg-accent-deep" : "bg-ink"
                          }`}
                        />
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="font-mono text-[11px] tabular-nums text-ink-mute">
                            {e.date}
                          </p>
                          <p className="font-mono text-[10px] tabular-nums text-ink-mute">
                            No. {String(i + 1).padStart(2, "0")}
                          </p>
                        </div>
                        <p className="mt-2 text-[15px] font-medium text-ink">
                          {e.title}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-mute">
                          {e.description}
                        </p>
                      </li>
                    ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Failure modes */}
      {topModes.length > 0 && (
        <section className="border-t border-line bg-paper-2 texture-paper">
          <div className="mx-auto max-w-6xl px-5 pt-16 pb-16 sm:px-6 md:pt-20 md:pb-20">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="label-catalog flex items-center gap-2 text-accent-deep">
                    <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
                    Research findings · {topModes.length} recorded across{" "}
                    {published.length} files
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                    The ways they die
                  </h2>
                </div>
                <Link href="/insights" className="link-editorial">
                  Explore the failure patterns
                </Link>
              </div>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-mute">
                Failure modes counted across every published case file. Most
                startups in this archive didn&apos;t fail once — they failed
                several ways at once.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <ul className="mt-12 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
                {topModes.map(([mode, count], i) => (
                  <li key={mode} className="border-t border-line py-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="flex items-baseline gap-4">
                        <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-medium text-ink">{mode}</span>
                      </span>
                      <span className="font-mono text-2xl tabular-nums text-ink">
                        {count}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        aria-hidden
                        className="h-px bg-ink/25"
                        style={{ width: `${Math.round((count / maxMode) * 100)}%` }}
                      />
                      <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.16em] text-ink-mute">
                        {Math.round((count / published.length) * 100)}% of files
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {/* Archive instruments */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-16 pb-16 sm:px-6 md:grid-cols-2 md:gap-0 md:pt-20 md:pb-20">
          <Reveal>
            <div className="flex h-full flex-col items-start md:pr-14">
              <p className="label-catalog flex items-center gap-2 text-accent-deep">
                <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
                Archive instrument · /ask
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                Archive terminal
              </h3>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-mute">
                A research assistant grounded in the archive. Ask it about any
                failure — it answers with evidence drawn from the published
                cases, not from memory.
              </p>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                Grounded in {ledgerStats.published} published case files
              </p>
              <Link href="/ask" className="btn btn-outline mt-8">
                Ask the archive
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col items-start border-t border-line pt-12 md:border-l md:border-t-0 md:pl-14 md:pt-0">
              <p className="label-catalog flex items-center gap-2 text-accent-deep">
                <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
                Archive instrument · /pre-mortem
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                Forensic pre-mortem
              </h3>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-mute">
                Stress-test your idea before it enters the ground. A multi-stage
                diagnostic interrogates your pitch against the failure patterns
                of {ledgerStats.documented} documented startups.
              </p>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                {topModes.length} failure patterns on file
              </p>
              <Link href="/pre-mortem" className="btn btn-outline mt-8">
                Run a pre-mortem
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Living archive */}
      <section className="texture-well bg-well text-well-ink">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 md:py-28">
          <div className="grid items-start gap-14 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="label-catalog flex items-center gap-2 text-well-mute">
                <span aria-hidden className="inline-block h-1.5 w-1.5 bg-well-line" />
                Volume I · The living archive
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl">
                The archive grows{" "}
                <em className="font-serif font-normal italic">weekly.</em>
              </h2>
              <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-well-mute">
                New cases are drafted by an automated research pipeline,
                fact-checked against live web sources, and passed through
                human review before they join the archive. Right now,{" "}
                {inReview === 1 ? "one case sits" : `${inReview} cases sit`} in
                the review queue.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/submit" className="btn btn-well">
                  Submit a case
                </Link>
                <Link href="/about" className="btn btn-well-outline">
                  About the archive
                </Link>
              </div>
            </div>
            <div className="md:col-span-5">
              <dl className="border-t border-well-line pt-7">
                <div className="v2-row flex items-baseline justify-between gap-6">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-well-mute">
                    Documented
                  </dt>
                  <dd className="font-mono text-xl tabular-nums text-well-ink">
                    {ledgerStats.documented}
                  </dd>
                </div>
                <div className="v2-row flex items-baseline justify-between gap-6">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-well-mute">
                    Published
                  </dt>
                  <dd className="font-mono text-xl tabular-nums text-well-ink">
                    {ledgerStats.published}
                  </dd>
                </div>
                <div className="v2-row flex items-baseline justify-between gap-6">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-well-mute">
                    In review
                  </dt>
                  <dd className="font-mono text-xl tabular-nums text-well-ink">
                    {inReview}
                  </dd>
                </div>
                <div className="v2-row flex items-baseline justify-between gap-6">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-well-mute">
                    Capital raised by published cases
                  </dt>
                  <dd className="font-mono text-xl tabular-nums text-well-ink">
                    {formatCurrencyCompact(totalBurned)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <p className="mt-14 border-t border-well-line pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-well-mute">
            Records pipeline: automated drafting → fact-checked against live
            sources → human review before publication
          </p>
        </div>
      </section>

      {/* Close */}
      <section>
        <div className="mx-auto max-w-3xl px-5 pb-24 pt-16 text-center sm:px-6 md:pt-20 md:pb-28">
          <Reveal>
            <div aria-hidden className="mx-auto w-12 border-t border-line" />
            <blockquote className="mt-8 font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
              He who does not learn from history is condemned to repeat it. He who
              learns from failure is destined to survive.
            </blockquote>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/explore" className="btn btn-primary">
                Explore the archive
              </Link>
              <Link href="/pre-mortem" className="btn btn-outline">
                Run a pre-mortem
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
