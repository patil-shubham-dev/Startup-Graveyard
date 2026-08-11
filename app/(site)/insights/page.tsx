import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readAllCases } from "@/lib/archive-ledger";
import { CANONICAL_FAILURE_REASONS } from "@/lib/taxonomy";
import { formatCurrencyCompact } from "@/lib/utils";
import { deriveInsights } from "./compute";
import styles from "./insights.module.css";
import { AnnotationStamp, FigureLabel, Monogram, PlateCorners, Seal } from "./ornaments";
import { AnimatedBars } from "./AnimatedBars";
import { CapitalRanking } from "./CapitalRanking";
import { FailureGenome } from "./FailureGenome";
import { FailurePatterns } from "./FailurePatterns";
import { LifespanRail } from "./LifespanRail";
import { ShutdownTimeline } from "./ShutdownTimeline";
import { StatLedger } from "./StatLedger";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "The intelligence report of the archive — failure patterns, lifespans, industries, and capital destroyed, computed from the case files themselves.",
};

/** Margin quotes transcribed from the published case files (first voice only). */
const RESEARCH_NOTES = [
  {
    text: "We underestimated the complexity of the construction industry and overestimated our ability to disrupt it.",
    author: "Michael Marks",
    role: "Founder, Katerra",
    slug: "katerra",
  },
  {
    text: "We were blinded by the promise of a revolutionary technology.",
    author: "Elizabeth Holmes",
    role: "Founder, Theranos",
    slug: "theranos",
  },
  {
    text: "Jawbone's demise was a cautionary tale for hardware startups: focus on software and services.",
    author: "Fred Wilson",
    role: "Founder, Union Square Ventures",
    slug: "jawbone",
  },
  {
    text: "We were excited about ScaleFactor's potential, but the company's struggles to scale its technology and team have been a disappointment.",
    author: "Gregg Brockway",
    role: "Investor; founder of Webvan",
    slug: "scale-factor",
  },
  {
    text: "Fast's failure was a result of their inability to scale their business model.",
    author: "Arianna Simpson",
    role: "Partner, Andreessen Horowitz",
    slug: "fast",
  },
  {
    text: "Quibi's failure was a result of poor timing and a lack of clear direction.",
    author: "Mark Zuckerberg",
    role: "Investor",
    slug: "quibi",
  },
];

function findingFigure(kind: string, value: number): string {
  switch (kind) {
    case "funding":
      return formatCurrencyCompact(value);
    case "years":
      return `${value} yrs`;
    case "pct":
      return `${value}%`;
    case "perYear":
      return `${formatCurrencyCompact(value * 100)} / yr`;
    case "team":
      return value > 0 ? `${value.toLocaleString()} people` : "—";
    default:
      return "—";
  }
}

export default async function InsightsPage() {
  const allCases = readAllCases();
  const report = deriveInsights(allCases);

  const deadliestYear = [...report.timeline].sort((a, b) => b.count - a.count)[0];
  const maxPace = report.pace[0]?.perYear || 1;

  const paceBars = report.pace.map((p) => ({
    label: p.name,
    sub: p.detail,
    display: formatCurrencyCompact(p.perYear * 100),
    pct: Math.max(4, Math.round((p.perYear / maxPace) * 100)),
  }));

  const empty = report.published === 0;

  return (
    <div className={styles.page}>
      {/* ── Frontispiece ── */}
      <section className={styles.hero}>
        <div aria-hidden className={styles.heroArt}>
          <Image
            src="/archive-shelves.webp"
            alt=""
            width={1600}
            height={820}
            priority
            sizes="(min-width: 1024px) 1000px, 0px"
          />
        </div>
        <div className={styles.heroBody}>
          <Reveal>
            <div className={styles.heroEyebrow}>
              <Seal size={44} />
              <span className={styles.heroEyebrowText}>
                The archive · Intelligence report · No. {report.span || "—"}
              </span>
            </div>
            <h1 className={styles.heroTitle}>Failure intelligence</h1>
            <p className={styles.heroAbstract}>
              An annual report on the documented dead: what was raised, how long each company
              burned, and the patterns that kept repeating. Every figure on this page is computed
              from the case files themselves {empty ? "" : `— ${report.published} published of ${report.documented} on record`}.
            </p>
          </Reveal>
          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaValue}>{report.published}</span>
              <span className={styles.heroMetaLabel}>Files on record</span>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaValue}>{report.span || "—"}</span>
              <span className={styles.heroMetaLabel}>Archive window</span>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaValue}>{report.industryCount}</span>
              <span className={styles.heroMetaLabel}>Industries documented</span>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaValue}>{report.patterns.length}</span>
              <span className={styles.heroMetaLabel}>Failure patterns recorded</span>
            </div>
          </div>
        </div>
      </section>

      {empty ? (
        <section className={styles.sectionInner}>
          <p className={styles.sectionLead}>
            The archive is empty pending review. Figures will appear here as case files are
            published.
          </p>
        </section>
      ) : (
        <>
          {/* ── Abstract band ── */}
          <section className={styles.abstractBand}>
            <div className={styles.abstractBody}>
              <div>
                <h2 className={styles.abstractTitle}>
                  <span aria-hidden className={styles.abstractMark} />
                  What can be learned here
                </h2>
                <p className={styles.abstractText}>
                  The archive is organised as a continuing study of terminal cases: reasons on
                  record, the capital each consumed, the distance between founding and shutdown.
                </p>
              </div>
              <ul className={styles.learnList}>
                <li className={styles.learnItem}>
                  <span className={styles.learnIndex}>01</span>
                  <span>
                    Which failure patterns carry the most evidence — and the files behind each.
                  </span>
                </li>
                <li className={styles.learnItem}>
                  <span className={styles.learnIndex}>02</span>
                  <span>
                    How long companies actually ran, from founding year to shutdown year.
                  </span>
                </li>
                <li className={styles.learnItem}>
                  <span className={styles.learnIndex}>03</span>
                  <span>
                    Where the capital went: the ledger of the archive&rsquo;s largest collapses.
                  </span>
                </li>
                <li className={styles.learnItem}>
                  <span className={styles.learnIndex}>04</span>
                  <span>
                    First-voice research notes pulled from the case files quoting the people
                    involved.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* ── Chapter I — The record ── */}
          <section className={styles.sectionInner}>
            <header className={styles.sectionHead}>
              <span className={styles.sectionIndex}>Chapter I — The record</span>
              <h2 className={styles.sectionTitle}>The totals, laid out</h2>
              <p className={styles.sectionLead}>
                Headline figures from {report.published} published files, each with the supporting
                context that turns a number into a documented claim.
              </p>
            </header>
            <StatLedger
              cells={[
                {
                  label: "Capital destroyed",
                  value: Math.round(report.totalBurned / 100),
                  format: "currency",
                  context: `Largest single collapse: ${report.largestCollapse.name} (${report.largestCollapse.pctOfTotal}% of total)`,
                  stamp: "A.01",
                },
                {
                  label: "Average lifespan",
                  value: report.avgLifespan,
                  format: "years",
                  context: `Median ${report.medianLifespan} yrs · fastest ${report.minLifespan} yrs`,
                  stamp: "A.02",
                },
                {
                  label: "Failure patterns",
                  value: report.patterns.length,
                  format: "int",
                  context: `Top: ${report.topPattern.name} (${report.topPattern.pct}% of files)`,
                  stamp: "A.03",
                },
                {
                  label: "Industries documented",
                  value: report.industryCount,
                  format: "int",
                  context: `Across the ${report.span} archive window`,
                  stamp: "A.04",
                },
                {
                  label: "Lessons extracted",
                  value: report.lessonsTotal,
                  format: "int",
                  context: `From ${report.published} published case files`,
                  stamp: "A.05",
                },
                {
                  label: "Sources on file",
                  value: report.sourcesTotal,
                  format: "int",
                  context: `With ${report.quotesTotal} first-voice quotes`,
                  stamp: "A.06",
                },
              ]}
            />
          </section>

          {/* ── Chapter II — Lifespans ── */}
          {report.lifespan.length > 0 && (
            <section className="border-y border-line bg-paper-2">
              <div className={styles.sectionInner}>
                <header className={styles.sectionHead}>
                  <span className={styles.sectionIndex}>Chapter II — Lifespans</span>
                  <h2 className={styles.sectionTitle}>How long the archive runs span</h2>
                  <p className={styles.sectionLead}>
                    Each file drawn as a ruled line from founding year to shutdown year. The
                    record spans {report.span || "—"}, with lifespans between {report.minLifespan}{" "}
                    and {report.maxLifespan} years.
                  </p>
                  <p className={styles.sectionNote}>Hover or focus a line to read its file record</p>
                </header>
                <LifespanRail data={report.lifespan.map((l) => ({ ...l }))} />
              </div>
            </section>
          )}

          {/* ── Chapter III — Failure patterns ── */}
          {report.patterns.length > 0 && (
            <section className={styles.sectionInner}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionIndex}>Chapter III — Cause of failure</span>
                <h2 className={styles.sectionTitle}>The recurring patterns</h2>
                <p className={styles.sectionLead}>
                  {report.topPattern.name} appears in {report.topPattern.count} of{" "}
                  {report.published} files — the most repeated reason on record. Each specimen
                  below carries its own evidence.
                </p>
                <p className={styles.sectionNote}>
                  Confidence: High (≥ 5 files) · Substantial (≥ 3) · Limited (below 3)
                </p>
              </header>
              <FailurePatterns
                patterns={report.patterns.map((p) => ({
                  name: p.name,
                  count: p.count,
                  pctOfFiles: p.pctOfFiles,
                  avgFunding: p.avgFunding,
                  avgLifespan: p.avgLifespan,
                  industries: p.industries,
                  confidence: p.confidence,
                  cases: p.cases.map((c) => ({ ...c })),
                }))}
              />
            </section>
          )}

          {/* ── Chapter IV — Shutdowns by year ── */}
          {report.timeline.length > 1 && (
            <section className="border-y border-line bg-paper-2">
              <div className={styles.sectionInner}>
                <header className={styles.sectionHead}>
                  <span className={styles.sectionIndex}>Chapter IV — The timeline</span>
                  <h2 className={styles.sectionTitle}>Shutdowns, year by year</h2>
                  <p className={styles.sectionLead}>
                    Filed closures plotted across the archive window. The deadliest year is{" "}
                    {deadliestYear?.year || "—"} with {deadliestYear?.count} closure
                    {deadliestYear && deadliestYear.count > 1 ? "s" : ""}.
                  </p>
                  <FigureLabel number="02" label="Closures by year" />
                </header>
                <ShutdownTimeline data={report.timeline.map((y) => ({ ...y }))} />
              </div>
            </section>
          )}

          {/* ── Chapter V — Industry register ── */}
          {report.industries.length > 0 && (
            <section className={styles.sectionInner}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionIndex}>Chapter V — Industries</span>
                <h2 className={styles.sectionTitle}>The industries of failure</h2>
                <p className={styles.sectionLead}>
                  {report.industryCount} industries on record, each with its files, capital, and
                  the causes that recur most inside it.
                </p>
              </header>
              <div className={styles.industryGrid}>
                {report.industries.map((ind) => (
                  <article key={ind.name} className={styles.industryCell}>
                    <div className={styles.industryTop}>
                      <Monogram letter={ind.name.charAt(0)} size={52} />
                      <div>
                        <h3 className={styles.industryName}>{ind.name}</h3>
                        <div className={styles.industryMeta}>
                          <span>{ind.count} file{ind.count === 1 ? "" : "s"}</span>
                          <span>{formatCurrencyCompact(ind.totalFunding)} raised</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.industryCauses}>
                      {ind.causes.map((cause) => (
                        <span key={cause.name} className={styles.industryCause}>
                          {cause.name}
                        </span>
                      ))}
                    </div>
                    <div className={styles.industryCases}>
                      {ind.cases.map((c) => (
                        <Link key={c.slug} href={`/case/${c.slug}`} className={styles.industryCase}>
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── Chapter VI — Capital report (well) ── */}
          {report.capital.length > 0 && (
            <section className={styles.ctaBand}>
              <div className={styles.sectionInnerWell}>
                <header className={styles.sectionHead}>
                  <span className={styles.sectionIndex}>Chapter VI — The ledgers</span>
                  <h2 className={styles.sectionTitle}>Capital destroyed</h2>
                  <p className={styles.sectionLead}>
                    {formatCurrencyCompact(report.totalBurned)} burned across the record.{" "}
                    {report.largestCollapse.name} accounts for {report.largestCollapse.pctOfTotal}%
                    of it — {formatCurrencyCompact(report.largestCollapse.amount)}.
                  </p>
                  <p className={styles.sectionNote}>Hover a line to read its record</p>
                </header>
                <FigureLabel number="06" label="The ranking of capital destroyed" />
                <CapitalRanking
                  data={report.capital.map((c) => ({
                    rank: c.rank,
                    slug: c.slug,
                    name: c.name,
                    funding: c.funding,
                    industry: c.industry,
                    year: c.year,
                    lifespan: c.lifespan,
                    team: c.team,
                    reasons: c.reasons,
                  }))}
                />
                {paceBars.length > 0 && (
                  <div className={styles.paceBlock}>
                    <FigureLabel number="05" label="Capital intensity — burn per operating year" />
                    <AnimatedBars data={paceBars} tone="well" unit="/ yr" />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Chapter VII — Key findings ── */}
          {report.keyFindings.length > 0 && (
            <section className="border-y border-line bg-paper-2">
              <div className={styles.sectionInner}>
                <header className={styles.sectionHead}>
                  <span className={styles.sectionIndex}>Chapter VII — Findings</span>
                  <h2 className={styles.sectionTitle}>Key findings across the record</h2>
                  <p className={styles.sectionLead}>
                    The superlatives the archive is certain of — each traced to a named file.
                  </p>
                </header>
                <ol className={styles.findingsList}>
                  {report.keyFindings.map((f) => (
                    <li key={f.index} className={styles.finding}>
                      <span className={styles.findingIndex}>{f.index}</span>
                      <span className={styles.findingLabel}>{f.label}</span>
                      <span className={styles.findingFigure}>{findingFigure(f.figure, f.figureValue)}</span>
                      <span className={styles.findingCompany}>{f.company}</span>
                      <p className={styles.findingDetail}>{f.detail}</p>
                      {f.slug && (
                        <Link href={`/case/${f.slug}`} className={styles.findingLink}>
                          Read the file →
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* ── Chapter VIII — The failure genome ── */}
          {report.genome.nodes.length > 0 && (
            <section className={styles.sectionInner}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionIndex}>Chapter VIII — The genome</span>
                <h2 className={styles.sectionTitle}>The failure genome</h2>
                <p className={styles.sectionLead}>
                  Every recorded cause as a specimen; every line a co-occurrence inside the same
                  case file. The archive&rsquo;s abiding pattern — that failures rarely carry one
                  reason but several — is visible here as network.
                </p>
                <FigureLabel number="03" label="Causes of failure — co-occurrence map" />
              </header>
              <div className={styles.genomeFrame}>
                <PlateCorners />
                <FailureGenome
                  nodes={report.genome.nodes.map((n) => ({ ...n }))}
                  links={report.genome.links.map((l) => ({ ...l }))}
                  width={report.genome.width}
                  height={report.genome.height}
                />
              </div>
              <p className={styles.genomeCaption}>
                Hover a cause to trace its co-occurrences. Line weight marks how often two causes
                share a file.
              </p>
            </section>
          )}

          {/* ── Chapter IX — Correlations ── */}
          {report.correlations.length > 0 && (
            <section className="border-y border-line bg-paper-2">
              <div className={styles.sectionInner}>
                <header className={styles.sectionHead}>
                  <span className={styles.sectionIndex}>Chapter IX — Cross-tabs</span>
                  <h2 className={styles.sectionTitle}>Causes by industry</h2>
                  <p className={styles.sectionLead}>
                    The pairings that recur most: a failure reason cited inside an industry, with
                    the files that carry both.
                  </p>
                </header>
                <div className={styles.corrGrid}>
                  {report.correlations.map((c) => (
                    <div key={`${c.reason}::${c.industry}`} className={styles.corrRow}>
                      <div className={styles.corrPair}>
                        <span className={styles.corrReason}>{c.reason}</span>
                        <span className={styles.corrIndustry}>{c.industry}</span>
                        <span className={styles.corrCount}>{c.count}</span>
                      </div>
                      <div className={styles.corrCases}>
                        {c.cases.map((cc) => (
                          <Link
                            key={cc.slug}
                            href={`/case/${cc.slug}`}
                            className={styles.corrCase}
                          >
                            {cc.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Chapter X — Research notes ── */}
          <section className={styles.sectionInner}>
            <header className={styles.sectionHead}>
              <span className={styles.sectionIndex}>Chapter X — Research notes</span>
              <h2 className={styles.sectionTitle}>In the record&rsquo;s own words</h2>
              <p className={styles.sectionLead}>
                Quotes lifted from the case files — founders and the people who backed them,
                warning in their own voice.
              </p>
            </header>
            <ul className={styles.notesList}>
              {RESEARCH_NOTES.map((note) => (
                <li key={note.slug} className={styles.note}>
                  <AnnotationStamp label="First voice" />
                  <p className={styles.noteQuote}>&ldquo;{note.text}&rdquo;</p>
                  <footer className={styles.noteMeta}>
                    <div>
                      <span className={styles.noteAuthor}>{note.author}</span>
                      <span className={styles.noteRole}>{note.role}</span>
                    </div>
                    <Link href={`/case/${note.slug}`} className={styles.noteFile}>
                      File {note.slug} &rarr;
                    </Link>
                  </footer>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Chapter XI — Methodology ── */}
          <section className="border-y border-line bg-paper-2">
            <div className={styles.sectionInner}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionIndex}>Chapter XI — The method</span>
                <h2 className={styles.sectionTitle}>How this report is made</h2>
              </header>
              <ol className={styles.methodList}>
                <li className={styles.methodItem}>
                  <span className={styles.methodIndex}>01</span>
                  <div>
                    <h3 className={styles.methodTitle}>Source of record</h3>
                    <p className={styles.methodText}>
                      Every figure above is computed at render time from the case files in the
                      local archive — {report.published} published of {report.documented}{" "}
                      documented. No number here is estimated or extrapolated from other sources.
                    </p>
                  </div>
                </li>
                <li className={styles.methodItem}>
                  <span className={styles.methodIndex}>02</span>
                  <div>
                    <h3 className={styles.methodTitle}>Taxonomy</h3>
                    <p className={styles.methodText}>
                      Failure reasons are normalized to the archive&rsquo;s canonical labels ({" "}
                      {CANONICAL_FAILURE_REASONS.length} recorded) so equivalent phrasings count
                      as one pattern, not many.
                    </p>
                  </div>
                </li>
                <li className={styles.methodItem}>
                  <span className={styles.methodIndex}>03</span>
                  <div>
                    <h3 className={styles.methodTitle}>Confidence</h3>
                    <p className={styles.methodText}>
                      Pattern confidence is set by document count only: High when five or more
                      files cite a reason, Substantial at three, Limited below. It is a statement
                      about evidence, not about the archive&rsquo;s opinion.
                    </p>
                  </div>
                </li>
                <li className={styles.methodItem}>
                  <span className={styles.methodIndex}>04</span>
                  <div>
                    <h3 className={styles.methodTitle}>Capital</h3>
                    <p className={styles.methodText}>
                      Funding figures are the total capital reported raised per file, in the
                      archive&rsquo;s cent convention, converted for display. Where founding year
                      is missing, lifespan and the intensity figures derived from it are omitted
                      rather than approximated.
                    </p>
                  </div>
                </li>
                <li className={styles.methodItem}>
                  <span className={styles.methodIndex}>05</span>
                  <div>
                    <h3 className={styles.methodTitle}>Scope &amp; exclusions</h3>
                    <p className={styles.methodText}>
                      {report.excluded.length === 0
                        ? "No file has been excluded."
                        : `Held from publication: ${report.excluded
                            .map((e) => `${e.name} — ${e.reason}`)
                            .join("; ")}.`}{" "}
                      Drafts are excluded from every figure. Sources and citations are recorded
                      per file, not carried forward.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          {/* ── Recent discoveries ── */}
          {report.accessions.length > 0 && (
            <section className={styles.sectionInner}>
              <header className={styles.sectionHead}>
                <span className={styles.sectionIndex}>Recent discoveries</span>
                <h2 className={styles.sectionTitle}>Newest files in the archive</h2>
              </header>
              <ol className={styles.accessionList}>
                {report.accessions.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/case/${a.slug}`} className={styles.accessionRow}>
                      <span>
                        <span className={styles.accessionName}>{a.name}</span>
                        <span className={styles.accessionMeta}>
                          {" "}
                          · {a.industry} · filed {a.filed}
                        </span>
                      </span>
                      <span className={styles.accessionDate}>{a.filed}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      {/* ── Closing ── */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaInner}>
          <div>
            <h2 className={styles.ctaTitle}>Put the record to work</h2>
            <p className={styles.ctaText}>
              The archive is not a museum. Test a new idea against it, ask it a question, or
              submit a file for the record.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/explore" className="btn btn-well">
                Browse the archive
              </Link>
              <Link href="/pre-mortem" className="btn btn-well-outline">
                Run a pre-mortem
              </Link>
              <Link href="/ask" className="btn btn-well-outline">
                Ask a question
              </Link>
            </div>
            <p className={styles.ctaNote}>
              Files are added by review — drafts are held from the record until verified.
            </p>
          </div>
          <div className={styles.ctaAside}>
            <Seal tone="well" size={88} />
            <p className={styles.ctaAsideText}>
              Archive intelligence · {report.published} files on record
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.colophon}>
        <p className={styles.colophonText}>
          Computed from {report.published} published case files of {report.documented} documented
          on record · {report.lessonsTotal} lessons · {report.sourcesTotal} sources ·{" "}
          {report.quotesTotal} quotes · No figure on this page is estimated.
        </p>
        <p className={styles.colophonText}>The Graveyard · Intelligence desk · {report.span}</p>
      </footer>
    </div>
  );
}