"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/site/Reveal";
import { formatCurrencyCompact } from "@/lib/utils/format";
import type { CaseStudy } from "@/lib/db/case-studies";

/*
 * DIRECTION CONTRACT — /explore archive register
 * THESIS: the archive index as a printed register of plates. Refuses the
 * card-grid catalogue default and the plain list; every record is a ruled
 * folio plate carrying its accession number, dossier facts, and verdict.
 * OWN-WORLD: established editorial system unchanged — paper/ink/oxblood,
 * hairline rules, label-catalog metadata, mono tabular figures, Geist sans;
 * one new atom, the .chip facet (mono 10px, hairline, accent-deep active).
 * STORY: a researcher scans plates like library stacks, narrows by facet
 * chips computed from the data, and opens a file; every figure traces to a
 * case file.
 * FIRST VIEWPORT: archive header band — oxblood-dot kicker, register h1,
 * search field with Q. affix, facet rail, then the ruled plates beginning
 * immediately, each a full-width row with dossier rail on the right.
 * FORM: folio/plate register — candidate 4 of the grounded list, assigned
 * by surface seed 9fc2d8bb.
 * FINISH: "unreviewed and undocumented is unfinished; this build ends with
 * the finish review, the verdict, and DESIGN.md"
 */

interface ExploreClientProps {
  initialCases: CaseStudy[];
  initialSearch?: string;
}

function accessionIndex(caseStudy: CaseStudy): string {
  return caseStudy.case_number || caseStudy.slug.toUpperCase();
}

export function ExploreClient({ initialCases, initialSearch = "" }: ExploreClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedFailType, setSelectedFailType] = useState<string | null>(null);

  // Stable accession sequence: the plate number is the record's place in the
  // register, fixed at load time — filters reorder the view, never the index.
  const accession = useMemo(
    () => new Map(initialCases.map((c, i) => [c.slug, i + 1])),
    [initialCases],
  );

  const industries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of initialCases) {
      if (!c.industry) continue;
      counts.set(c.industry, (counts.get(c.industry) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [initialCases]);

  const failureTypes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of initialCases) {
      for (const r of c.failure_reasons || []) {
        counts.set(r, (counts.get(r) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [initialCases]);

  const filtered = useMemo(() => {
    return initialCases.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          c.company_name,
          c.summary,
          c.industry,
          accessionIndex(c),
          ...(c.failure_reasons || []),
          ...(c.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedIndustry && c.industry !== selectedIndustry) return false;
      if (selectedFailType && !(c.failure_reasons || []).includes(selectedFailType))
        return false;
      return true;
    });
  }, [initialCases, search, selectedIndustry, selectedFailType]);

  const hasFilters = Boolean(search || selectedIndustry || selectedFailType);

  const clearAll = () => {
    setSearch("");
    setSelectedIndustry(null);
    setSelectedFailType(null);
  };

  return (
    <div>
      {/* Archive header band */}
      <section className="texture-paper">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-6 md:pb-16 md:pt-20">
          <Reveal>
            <p className="label-catalog flex items-center gap-2 text-accent-deep">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              The archive · {initialCases.length} case files on record
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl md:text-6xl">
              A register of documented failures
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-mute">
              Every published file in the collection — funding histories,
              lifespans, failure patterns, and verdicts — indexed by accession
              and searchable by keyword, industry, or cause of death.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <form
              role="search"
              aria-label="Search the archive"
              className="mt-10 border-t border-line pt-8"
              onSubmit={(e) => {
                e.preventDefault();
                router.replace(search.trim() ? `/explore?q=${encodeURIComponent(search.trim())}` : "/explore");
              }}
            >
              <div className="flex max-w-3xl flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-mute"
                  >
                    Q.
                  </span>
                  <input
                    id="explore-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search case files"
                    placeholder="Company, industry, failure pattern, or accession…"
                    className="field field-search w-full"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Search records
                </button>
              </div>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                {initialCases.length} files · indexed by accession · verified
                against sources
              </p>
            </form>

            {/* Facet rail — computed from the data, never hardcoded */}
            <div className="mt-6 border-t border-line pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="label-catalog mr-1">Industry</span>
                {industries.map(([ind, count]) => (
                  <button
                    key={ind}
                    type="button"
                    aria-pressed={selectedIndustry === ind}
                    aria-label={`${ind}, ${count} ${count === 1 ? "file" : "files"}`}
                    onClick={() =>
                      setSelectedIndustry(selectedIndustry === ind ? null : ind)
                    }
                    className={`chip ${selectedIndustry === ind ? "chip-active" : ""}`}
                  >
                    {ind}
                    <span aria-hidden className="tabular-nums">{count}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="label-catalog mr-1">Failure pattern</span>
                {failureTypes.map(([reason, count]) => (
                  <button
                    key={reason}
                    type="button"
                    aria-pressed={selectedFailType === reason}
                    aria-label={`${reason}, ${count} ${count === 1 ? "file" : "files"}`}
                    onClick={() =>
                      setSelectedFailType(selectedFailType === reason ? null : reason)
                    }
                    className={`chip ${selectedFailType === reason ? "chip-active" : ""}`}
                  >
                    {reason}
                    <span aria-hidden className="tabular-nums">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Register of plates */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          {/* Result status line */}
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute" aria-live="polite">
              {hasFilters
                ? `${filtered.length} of ${initialCases.length} records match`
                : `All ${initialCases.length} records in order of accession`}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="link-editorial"
              >
                Clear all filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center md:py-28">
              <div aria-hidden className="mx-auto w-12 border-t border-line" />
              <p className="mt-8 font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
                No records match this query.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-mute">
                The archive holds {initialCases.length} published files. Broaden
                the search, or start again.
              </p>
              <button type="button" onClick={clearAll} className="btn btn-outline mt-10">
                Clear search
              </button>
            </div>
          ) : (
            <ol className="divide-y divide-line">
              {filtered.map((c) => {
                const lifespan =
                  c.founded_year && c.shutdown_year
                    ? `${c.shutdown_year - c.founded_year} ${
                        c.shutdown_year - c.founded_year === 1 ? "yr" : "yrs"
                      }`
                    : "—";
                return (
                  <li key={c.slug}>
                    <Link
                      href={`/case/${c.slug}`}
                      className="group grid gap-6 py-9 transition-colors hover:bg-paper-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-12 md:py-11"
                    >
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                          No. {String(accession.get(c.slug) ?? 0).padStart(2, "0")}
                          {c.published_at ? (
                            <>
                              {" · "}
                              Filed{" "}
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                                .format(new Date(c.published_at))
                                .toUpperCase()}
                            </>
                          ) : null}
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink transition-colors group-hover:text-accent-deep sm:text-4xl">
                          {c.company_name}
                        </h2>
                        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-mute">
                          {c.summary}
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          {(c.failure_reasons || []).slice(0, 3).map((r) => (
                            <span
                              key={r}
                              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute"
                            >
                              <span aria-hidden className="inline-block h-1 w-1 bg-accent-deep" />
                              {r}
                            </span>
                          ))}
                          {c.failure_reasons && c.failure_reasons.length > 3 ? (
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                              +{c.failure_reasons.length - 3} more
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-6 border-t border-line pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <dt className="label-catalog">Raised</dt>
                            <dd className="mt-1.5 font-mono text-[15px] tabular-nums text-ink">
                              {formatCurrencyCompact(c.funding_raised)}
                            </dd>
                          </div>
                          <div>
                            <dt className="label-catalog">Lifespan</dt>
                            <dd className="mt-1.5 font-mono text-[15px] tabular-nums text-ink">
                              {lifespan}
                            </dd>
                          </div>
                          <div>
                            <dt className="label-catalog">Industry</dt>
                            <dd className="mt-1.5 font-mono text-[15px] tabular-nums text-ink">
                              {c.industry || "—"}
                            </dd>
                          </div>
                        </dl>
                        <span className="link-editorial mt-2 inline-flex items-center gap-2 self-start md:mt-0">
                          Open case file
                          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                            →
                          </span>
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
