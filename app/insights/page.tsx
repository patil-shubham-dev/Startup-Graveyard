import type { Metadata } from "next"
import Link from "next/link"
import { readAllCases } from "@/lib/archive-ledger"
import { formatCurrencyCompact } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Insights",
  description: "Research findings across the archive — failure patterns, industries, and capital burned.",
}

function countMap(values: string[]): Array<[string, number]> {
  const counts = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    counts.set(v, (counts.get(v) || 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

export default async function InsightsPage() {
  const cases = readAllCases().filter((c) => c.published)

  const patterns = countMap(cases.flatMap((c) => c.failure_reasons || []))
  const patternTop = patterns[0]?.[1] || 1

  const industries = countMap(cases.map((c) => c.industry || ""))

  const years = countMap(cases.map((c) => (c.shutdown_year ? String(c.shutdown_year) : "")))
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  const yearTop = years.reduce((max, entry) => Math.max(max, entry[1]), 0) || 1

  const withYears = cases.filter((c) => c.founded_year && c.shutdown_year)
  const avgLifespan =
    withYears.length > 0
      ? Math.round(
          withYears.reduce((sum, c) => sum + ((c.shutdown_year as number) - (c.founded_year as number)), 0) /
            withYears.length,
        )
      : 0

  const totalBurned = cases.reduce((sum, c) => sum + (c.funding_raised || 0), 0)
  const totalLessons = cases.reduce((sum, c) => sum + (c.lessons?.length || 0), 0)

  const topFunding = [...cases]
    .sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0))
    .filter((c) => c.funding_raised)
    .slice(0, 5)

  return (
    <main>
      <div className="mx-auto max-w-3xl px-5 pt-12 sm:px-6 md:pt-16">
        <p className="label-catalog flex items-center gap-2">
          <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
          Research findings · {patterns.length} patterns recorded across {cases.length} files
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          Failure intelligence
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-mute">
          Data-driven analysis of {cases.length} documented failures. Every figure below is
          computed from the case files themselves — no invented numbers.
        </p>
      </div>

      <dl className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-x-8 gap-y-8 border-t border-line px-5 pt-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-4">
        <div>
          <dt className="label-catalog">Cases on file</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">{cases.length}</dd>
        </div>
        <div>
          <dt className="label-catalog">Average lifespan</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">
            {avgLifespan || "—"} yrs
          </dd>
        </div>
        <div>
          <dt className="label-catalog">Industries</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">{industries.length}</dd>
        </div>
        <div>
          <dt className="label-catalog">Capital burned</dt>
          <dd className="mt-2 font-mono text-xl tabular-nums text-ink sm:text-2xl">
            {formatCurrencyCompact(totalBurned)}
          </dd>
        </div>
      </dl>

      <div className="mx-auto mt-16 max-w-3xl space-y-16 px-5 sm:px-6 md:mt-20">
        {patterns.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Failure patterns · Prevalence
            </p>
            <ol className="mt-6">
              {patterns.map(([name, count], i) => (
                <li key={name} className="border-t border-line py-5 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium text-ink">{name}</span>
                    </span>
                    <span className="font-mono text-[11px] uppercase tabular-nums text-ink-mute">
                      {count} {count === 1 ? "file" : "files"} · {Math.round((count / patternTop) * 100)}%
                      of top
                    </span>
                  </div>
                  <div className="mt-3 h-[3px] bg-line">
                    <div
                      className="h-full bg-accent-deep"
                      style={{ width: `${Math.max(2, Math.round((count / patternTop) * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
              {patterns.length} recorded failure patterns · {totalLessons} lessons extracted
            </p>
          </section>
        )}

        {years.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Shutdowns by year
            </p>
            <div className="mt-8 flex items-end gap-3 sm:gap-5">
              {years.map(([year, count]) => (
                <div key={year} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="font-mono text-[11px] tabular-nums text-ink-mute">{count}</span>
                  <div
                    className="w-full max-w-12 bg-accent-deep"
                    style={{ height: `${Math.max(4, Math.round((count / yearTop) * 96))}px` }}
                  />
                  <span className="font-mono text-[10px] tabular-nums text-ink-mute">{year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {industries.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Industries · Case counts
            </p>
            <div className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {industries.map(([name, count], i) => (
                <div key={name} className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] font-medium text-ink">{name}</span>
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-ink-mute">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {topFunding.length > 0 && (
          <section>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Capital burned · Top five
            </p>
            <ol className="mt-6">
              {topFunding.map((c, i) => (
                <li key={c.slug} className="border-t border-line py-5 first:border-t-0 first:pt-0">
                  <Link
                    href={`/case/${c.slug}`}
                    className="group flex items-baseline justify-between gap-4"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block font-medium text-ink transition-colors group-hover:text-accent-deep">
                          {c.company_name}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                          {c.industry || "General"}
                          {c.shutdown_year ? ` · ${c.shutdown_year}` : ""}
                        </span>
                      </span>
                    </span>
                    <span className="font-mono text-lg tabular-nums text-ink">
                      {formatCurrencyCompact(c.funding_raised)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <p className="label-catalog flex items-center gap-2">
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
            Archive instruments
          </p>
          <div className="mt-6 grid gap-10 sm:grid-cols-2">
            <div className="border-l border-line pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">/ask</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">Ask for deeper analysis</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-mute">
                Have Graveyard Intelligence compare cases, identify patterns, or build a custom
                research report.
              </p>
              <Link href="/ask" className="btn btn-outline mt-6">
                Open terminal
              </Link>
            </div>
            <div className="border-l border-line pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">/pre-mortem</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">Test against these patterns</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-mute">
                Run a forensic pre-mortem on a new idea and see which of these patterns it inherits.
              </p>
              <Link href="/pre-mortem" className="btn btn-outline mt-6">
                Run pre-mortem
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
