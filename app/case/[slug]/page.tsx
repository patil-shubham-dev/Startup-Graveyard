import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { CaseStudy } from "@/lib/db/case-studies"
import { formatCurrencyCompact, formatDate } from "@/lib/utils"
import {
  extractBusinessModel,
  extractFounders,
  extractInvestors,
  extractLessons,
  extractQuotes,
  extractRootCauses,
  extractTimelineEvents,
  extractTopReasons,
  extractValuationPeak,
  extractWarningSigns,
  getLifespan,
} from "@/lib/case-study-utils"
import { readAllCases } from "@/lib/archive-ledger"
import { ExhibitGallery } from "@/components/case/ExhibitGallery"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"

interface PageProps {
  params: Promise<{ slug: string }>
}

function getCase(slug: string): CaseStudy | null {
  try {
    const d = readAllCases().find((c) => c.slug === slug)
    return d && d.published ? (d as CaseStudy) : null
  } catch {
    return null
  }
}

function extractContent(mdx: string): string {
  const match = mdx.match(/```mdx\n([\s\S]*?)```/)
  return match ? match[1].trim() : mdx.trim()
}

const DUPLICATE_METRIC_KEYS = new Set([
  "capital_raised",
  "peak_valuation",
  "years_active",
  "peak_employees",
  "founders",
  "investors",
])

function humanizeKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function RiskBar({ label, score }: { label: string; score: number }) {
  const level = score >= 70 ? "Critical" : score >= 40 ? "High" : score >= 20 ? "Moderate" : "Low"
  return (
    <div className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-medium capitalize text-ink">{humanizeKey(label)}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
          {level} · {score}%
        </span>
      </div>
      <div className="mt-3 h-[3px] bg-line" role="img" aria-label={`${humanizeKey(label)} risk score ${score}%`}>
        <div className="h-full bg-accent-deep" style={{ width: `${Math.max(2, Math.min(100, score))}%` }} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const c = getCase(slug)
  if (!c) return { title: "Case Not Found" }
  return { title: c.company_name, description: c.summary }
}

export default async function CasePage({ params }: PageProps) {
  const { slug } = await params
  const c = getCase(slug)
  if (!c) notFound()

  const allPublished = readAllCases().filter((x) => x.published && x.slug !== slug)
  const related = allPublished
    .filter(
      (x) =>
        x.industry === c.industry ||
        x.failure_reasons?.some((r) => c.failure_reasons?.includes(r)),
    )
    .slice(0, 3)

  const founders = extractFounders(c)
  const investors = extractInvestors(c)
  const rootCauses = extractRootCauses(c)
  const warningSigns = extractWarningSigns(c)
  const timelineEvents = extractTimelineEvents(c)
  const quotes = extractQuotes(c)
  const lessons = extractLessons(c)
  const topReasons = extractTopReasons(c)
  const valuationPeak = extractValuationPeak(c)

  const facts: Array<[string, string]> = [
    ["Founded", c.founded_year ? String(c.founded_year) : "—"],
    ["Shutdown", c.shutdown_year ? String(c.shutdown_year) : "—"],
    ["Lifespan", getLifespan(c)],
    ["Business model", extractBusinessModel(c) ?? "—"],
    ["Country", (c as unknown as { country?: string }).country || "—"],
    ["Peak headcount", c.employees_peak ? c.employees_peak.toLocaleString("en-US") : "—"],
    ["Capital raised", c.funding_raised ? formatCurrencyCompact(c.funding_raised) : "—"],
    ["Peak valuation", valuationPeak ? formatCurrencyCompact(valuationPeak) : "—"],
  ]

  if (c.metrics && typeof c.metrics === "object") {
    const m = c.metrics as Record<string, unknown>
    for (const [key, val] of Object.entries(m)) {
      if (DUPLICATE_METRIC_KEYS.has(key)) continue
      if (val === null || val === undefined || val === "") continue
      facts.push([humanizeKey(key), String(val)])
    }
  }

  const rawContent = c.content ? extractContent(c.content) : ""
  const sources = Array.isArray((c as unknown as { sources?: unknown }).sources)
    ? ((c as unknown as { sources: Array<{ title: string; url: string; type?: string }> }).sources)
    : []

  return (
    <div>
      <div className="mx-auto max-w-3xl px-5 pt-12 sm:px-6 md:pt-16">
        <Link href="/explore" className="link-editorial">
          ← Back to the archive
        </Link>

        <p className="label-catalog mt-10 flex items-center gap-2">
          <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
          Case file · {c.case_number || c.slug.toUpperCase()}
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
          {c.company_name}
        </h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute">
          No. {c.case_number || c.slug.toUpperCase()} · Filed {formatDate(c.published_at || "")} ·{" "}
          {(c as unknown as { country?: string }).country || "Location unknown"}
        </p>
        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-mute">{c.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          {(c.failure_reasons || []).map((r) => (
            <span
              key={r}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute"
            >
              <span aria-hidden className="inline-block h-1 w-1 bg-accent-deep" />
              {r}
            </span>
          ))}
        </div>
      </div>

      <dl className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-x-8 gap-y-8 border-t border-line px-5 pt-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
        <div>
          <dt className="label-catalog">Raised</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">
            {c.funding_raised ? formatCurrencyCompact(c.funding_raised) : "—"}
          </dd>
        </div>
        <div>
          <dt className="label-catalog">Peak valuation</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">
            {valuationPeak ? formatCurrencyCompact(valuationPeak) : "—"}
          </dd>
        </div>
        <div>
          <dt className="label-catalog">Lifespan</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">{getLifespan(c)}</dd>
        </div>
        <div>
          <dt className="label-catalog">Peak headcount</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">
            {c.employees_peak ? c.employees_peak.toLocaleString("en-US") : "—"}
          </dd>
        </div>
        <div>
          <dt className="label-catalog">Industry</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">{c.industry || "—"}</dd>
        </div>
      </dl>

      <div className="mx-auto mt-16 max-w-3xl space-y-16 px-5 sm:px-6 md:mt-20">
        {topReasons.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Case verdict
            </p>
            <ol className="mt-6">
              {topReasons.map((r, i) => (
                <li key={r.title} className="border-t border-line py-5 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-ink">{r.title}</h2>
                      {r.description && (
                        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-mute">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <p className="label-catalog flex items-center gap-2">
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
            The record
          </p>
          <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
                <dt className="label-catalog">{label}</dt>
                <dd className="font-mono text-[15px] tabular-nums text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {timelineEvents.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Timeline · {timelineEvents.length} records
            </p>
            <ol className="mt-6">
              {timelineEvents.map((e, i) => (
                <li key={i} className="border-t border-line py-5 first:border-t-0 first:pt-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                    <span className="w-24 shrink-0 font-mono text-[11px] uppercase tabular-nums text-ink-mute">
                      {e.date}
                    </span>
                    <div>
                      <h3 className="font-medium text-ink">{e.title}</h3>
                      {e.description && (
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-mute">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {rawContent && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              The narrative
            </p>
            <div className="case-narrative mt-6">
              <MDXRemote source={rawContent} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            </div>
          </section>
        )}

        <ExhibitGallery study={c} />

        {c.risk_scores && Object.keys(c.risk_scores).length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Risk assessment
            </p>
            <div className="mt-6">
              {Object.entries(c.risk_scores).map(([key, score]) => (
                <RiskBar key={key} label={key} score={score as number} />
              ))}
            </div>
          </section>
        )}

        {(warningSigns.length > 0 || rootCauses.length > 0) && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Autopsy
            </p>
            <div className="mt-6 grid gap-10 md:grid-cols-2">
              {warningSigns.length > 0 && (
                <div>
                  <h3 className="label-catalog">Warning signs</h3>
                  <ul className="mt-5 space-y-3">
                    {warningSigns.map((s) => (
                      <li key={s} className="flex gap-3 text-[15px] leading-relaxed text-ink-mute">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 bg-ink-mute" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {rootCauses.length > 0 && (
                <div>
                  <h3 className="label-catalog">Root causes</h3>
                  <ul className="mt-5 space-y-3">
                    {rootCauses.map((r) => (
                      <li key={r} className="flex gap-3 text-[15px] leading-relaxed text-ink-mute">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 bg-accent-deep" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {lessons.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Lessons
            </p>
            <ol className="mt-6">
              {lessons.map((l, i) => (
                <li key={i} className="border-t border-line py-5 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-medium text-ink">{l.title}</h3>
                      {l.explanation !== l.title && (
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-mute">
                          {l.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(founders.length > 0 || investors.length > 0) && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Principals
            </p>
            <div className="mt-6 grid gap-10 sm:grid-cols-2">
              {founders.length > 0 && (
                <div>
                  <h3 className="label-catalog">Founders</h3>
                  <ul className="mt-4 space-y-2 font-mono text-sm text-ink">
                    {founders.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {investors.length > 0 && (
                <div>
                  <h3 className="label-catalog">Investors</h3>
                  <ul className="mt-4 space-y-2 font-mono text-sm text-ink">
                    {investors.slice(0, 8).map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                    {investors.length > 8 && (
                      <li className="text-ink-mute">+{investors.length - 8} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {quotes.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Evidence · Recorded statements
            </p>
            <div className="mt-8 space-y-10">
              {quotes.map((q, i) => (
                <figure key={i}>
                  <blockquote className="font-serif text-xl italic leading-snug text-ink sm:text-2xl">
                    {q.text}
                  </blockquote>
                  <figcaption className="label-catalog mt-3">
                    {q.author}
                    {q.role ? ` · ${q.role}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {sources.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Sources
            </p>
            <ul className="mt-5 space-y-2">
              {sources.map((s, i) => (
                <li key={i} className="border-t border-line py-3 first:border-t-0 first:pt-0">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline justify-between gap-4"
                  >
                    <span className="text-[15px] text-ink underline decoration-line underline-offset-4 transition-colors group-hover:text-accent-deep group-hover:decoration-accent-deep">
                      {s.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                      {s.type || "source"} ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl border-t border-line px-5 pt-10 sm:px-6 md:mt-20">
          <p className="label-catalog flex items-center gap-2">
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
            Related files
          </p>
          <div className="mt-4 divide-y divide-line">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/case/${r.slug}`}
                className="group grid gap-3 py-6 transition-colors hover:bg-paper-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-baseline md:gap-12"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                    No. {r.case_number || r.slug.toUpperCase()}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink transition-colors group-hover:text-accent-deep">
                    {r.company_name}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-mute">{r.summary}</p>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <p className="font-mono text-[11px] uppercase tabular-nums text-ink-mute">
                    {r.industry || "General"}
                    {r.shutdown_year ? ` · ${r.shutdown_year}` : ""}
                  </p>
                  <span className="link-editorial">Open case file →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-16 max-w-3xl border-t border-line px-5 pt-10 sm:px-6 md:mt-20">
        <p className="label-catalog flex items-center gap-2">
          <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
          Archive instruments
        </p>
        <div className="mt-6 grid gap-10 sm:grid-cols-2">
          <div className="border-l border-line pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">/ask</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">Ask about this case</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-mute">
              Question Graveyard Intelligence on this file, its patterns, or how it compares to the
              rest of the archive.
            </p>
            <Link href="/ask" className="btn btn-outline mt-6">
              Open terminal
            </Link>
          </div>
          <div className="border-l border-line pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">/pre-mortem</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">Test your own idea</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-mute">
              Run a forensic pre-mortem on a new concept and see which of these failure patterns
              apply.
            </p>
            <Link href="/pre-mortem" className="btn btn-outline mt-6">
              Run pre-mortem
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
