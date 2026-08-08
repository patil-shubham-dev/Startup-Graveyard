"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/site/Reveal";
import { CasePlate } from "./CasePlate";
import { FilterDropdown, type DropdownOption } from "./FilterDropdown";
import type { CaseStudy } from "@/lib/db/case-studies";
import styles from "./explore.module.css";

/*
 * DIRECTION CONTRACT v2 — /explore archive register
 * v1 was a ruled plate list with facet chips. v2 makes the page a working
 * forensic research instrument: a frontispiece band, a sticky instrument
 * bar (search / filters / sort / result count that never scrolls away),
 * and plates that carry the whole record — funding bar, lifespan timeline,
 * risk tag, related files — plus a hover preview on desktop. Everything is
 * still computed from the case files; nothing is hardcoded or invented.
 * Constraints carried from v1: accession numbers never renumber on
 * filtering; counts are computed; one tab stop per plate; soft transitions
 * that honour prefers-reduced-motion.
 */

type SortKey =
  | "newest"
  | "oldest"
  | "alpha"
  | "funding"
  | "valuation"
  | "lifespan-short"
  | "lifespan-long"
  | "team"
  | "risk";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Newest filed" },
  { value: "oldest", label: "Oldest filed" },
  { value: "alpha", label: "Alphabetical" },
  { value: "funding", label: "Highest funding" },
  { value: "valuation", label: "Highest valuation" },
  { value: "lifespan-short", label: "Shortest lifespan" },
  { value: "lifespan-long", label: "Longest lifespan" },
  { value: "team", label: "Largest team" },
  { value: "risk", label: "Highest risk" },
];

/* Funding buckets in cents (funding_raised is stored in cents). */
const FUNDING_BUCKETS: Array<{ value: string; label: string; test: (cents: number) => boolean }> = [
  { value: "lt100m", label: "Under $100M", test: (f) => f < 10_000_000_000 },
  { value: "100m-500m", label: "$100M–$500M", test: (f) => f >= 10_000_000_000 && f < 50_000_000_000 },
  { value: "500m-2b", label: "$500M–$2B", test: (f) => f >= 50_000_000_000 && f < 200_000_000_000 },
  { value: "over-2b", label: "Over $2B", test: (f) => f >= 200_000_000_000 },
];

interface ExploreClientProps {
  initialCases: CaseStudy[];
  initialSearch?: string;
  plateArt?: boolean;
  emptyArt?: boolean;
}

function riskScoreOf(study: CaseStudy): number {
  const vals = Object.values(study.risk_scores ?? {}).filter(
    (v): v is number => typeof v === "number",
  );
  return vals.length ? Math.max(...vals) : 0;
}

export function ExploreClient({
  initialCases,
  initialSearch = "",
  plateArt = false,
  emptyArt = false,
}: ExploreClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [industry, setIndustry] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [cause, setCause] = useState<string | null>(null);
  const [funding, setFunding] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Stable accession sequence — plate numbers never renumber on filtering.
  const accession = useMemo(
    () => new Map(initialCases.map((c, i) => [c.slug, i + 1])),
    [initialCases],
  );

  // Archive-wide reference values — stable while filtering so bars don't jump.
  const archiveBounds = useMemo(() => {
    const funds = initialCases.map((c) => c.funding_raised ?? 0);
    const years = initialCases
      .flatMap((c) => [c.founded_year ?? null, c.shutdown_year ?? null])
      .filter((y): y is number => y !== null);
    return {
      maxFunding: Math.max(0, ...funds),
      minYear: years.length ? Math.min(...years) : 0,
      maxYear: years.length ? Math.max(...years) : 0,
    };
  }, [initialCases]);

  const industries: DropdownOption[] = useMemo(
    () =>
      [...countBy(initialCases, (c) => c.industry)].map(([value, count]) => ({
        value,
        label: value,
        count,
      })),
    [initialCases],
  );

  const countries: DropdownOption[] = useMemo(
    () =>
      [...countBy(initialCases, (c) => (c as unknown as { country?: string }).country ?? null)]
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [initialCases],
  );

  const causes: DropdownOption[] = useMemo(
    () => {
      const counts = new Map<string, number>();
      for (const c of initialCases) {
        for (const r of c.failure_reasons || []) {
          counts.set(r, (counts.get(r) ?? 0) + 1);
        }
      }
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, label: value, count }));
    },
    [initialCases],
  );

  const fundingOptions: DropdownOption[] = useMemo(
    () =>
      FUNDING_BUCKETS.map((b) => ({
        value: b.value,
        label: b.label,
        count: initialCases.filter((c) => b.test(c.funding_raised ?? 0)).length,
      })),
    [initialCases],
  );

  // Related files — same rule as the dossier: shared industry or failure reason.
  const relatedMap = useMemo(() => {
    const map = new Map<string, CaseStudy[]>();
    for (const c of initialCases) {
      const rel = initialCases
        .filter(
          (x) =>
            x.slug !== c.slug &&
            (x.industry === c.industry ||
              x.failure_reasons?.some((r) => c.failure_reasons?.includes(r))),
        )
        .slice(0, 3);
      map.set(c.slug, rel);
    }
    return map;
  }, [initialCases]);

  const filtered = useMemo(() => {
    let list = initialCases.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          c.company_name,
          c.summary,
          c.industry,
          c.case_number,
          (c as unknown as { country?: string }).country,
          c.founded_year ? String(c.founded_year) : null,
          c.shutdown_year ? String(c.shutdown_year) : null,
          ...(c.failure_reasons || []),
          ...(c.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (industry && c.industry !== industry) return false;
      if (country && (c as unknown as { country?: string }).country !== country) return false;
      if (cause && !(c.failure_reasons || []).includes(cause)) return false;
      if (funding) {
        const bucket = FUNDING_BUCKETS.find((b) => b.value === funding);
        if (!bucket?.test(c.funding_raised ?? 0)) return false;
      }
      return true;
    });

    const valuation = (x: CaseStudy) => (x as unknown as { valuation_peak?: number }).valuation_peak ?? 0;
    const lifespan = (x: CaseStudy) =>
      x.founded_year && x.shutdown_year ? x.shutdown_year - x.founded_year : Infinity;

    switch (sort) {
      case "oldest":
        list = [...list].sort(
          (a, b) =>
            new Date(a.published_at ?? 0).getTime() - new Date(b.published_at ?? 0).getTime(),
        );
        break;
      case "alpha":
        list = [...list].sort((a, b) => a.company_name.localeCompare(b.company_name));
        break;
      case "funding":
        list = [...list].sort((a, b) => (b.funding_raised ?? 0) - (a.funding_raised ?? 0));
        break;
      case "valuation":
        list = [...list].sort((a, b) => valuation(b) - valuation(a));
        break;
      case "lifespan-short":
        list = [...list].sort((a, b) => lifespan(a) - lifespan(b));
        break;
      case "lifespan-long":
        list = [...list].sort((a, b) => lifespan(b) - lifespan(a));
        break;
      case "team":
        list = [...list].sort((a, b) => (b.employees_peak ?? 0) - (a.employees_peak ?? 0));
        break;
      case "risk":
        list = [...list].sort((a, b) => riskScoreOf(b) - riskScoreOf(a));
        break;
      case "newest":
      default:
        break;
    }
    return list;
  }, [initialCases, search, industry, country, cause, funding, sort]);

  const hasFilters = Boolean(search || industry || country || cause || funding);

  const clearAll = useCallback(() => {
    setSearch("");
    setIndustry(null);
    setCountry(null);
    setCause(null);
    setFunding(null);
  }, []);

  const chips = useMemo(() => {
    const list: Array<{ label: string; clear: () => void }> = [];
    if (search) list.push({ label: `Q. ${search}`, clear: () => setSearch("") });
    if (industry) list.push({ label: industry, clear: () => setIndustry(null) });
    if (country) list.push({ label: country, clear: () => setCountry(null) });
    if (cause) list.push({ label: cause, clear: () => setCause(null) });
    if (funding) {
      const label = FUNDING_BUCKETS.find((b) => b.value === funding)?.label ?? funding;
      list.push({ label, clear: () => setFunding(null) });
    }
    return list;
  }, [search, industry, country, cause, funding]);

  // Shadow the tool bar once it sticks below the header.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      threshold: 0,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div>
      {/* ── Frontispiece band ── */}
      <section className="texture-paper relative">
        {plateArt && (
          <div aria-hidden className={styles.frontispieceArt}>
            <Image
              src="/archive-plate.webp"
              alt=""
              width={1600}
              height={360}
              priority
              sizes="(min-width: 768px) 780px, 0px"
            />
          </div>
        )}
        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-16 sm:px-6 md:pb-14 md:pt-20">
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
              lifespans, failure patterns, and verdicts — indexed by accession.
              Search, filter, and sort the records like a working archive.
            </p>
          </Reveal>
        </div>
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </section>

      {/* ── Sticky instrument bar ── */}
      <div className={`${styles.toolbar} ${stuck ? styles.toolbarStuck : ""}`}>
        <div className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <form
              role="search"
              aria-label="Search the archive"
              className="flex flex-col gap-2 py-4 lg:flex-row lg:items-center lg:gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                router.replace(
                  search.trim() ? `/explore?q=${encodeURIComponent(search.trim())}` : "/explore",
                );
              }}
            >
              <div className={styles.searchWrap}>
                <span aria-hidden className={styles.searchAffix}>
                  Q.
                </span>
                <input
                  id="explore-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search case files"
                  placeholder="Company, industry, country, year, or cause of death…"
                  className={styles.searchInput}
                />
                <button type="submit" className="sr-only">
                  Search records
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-none">
                <FilterDropdown
                  label="Industry"
                  options={industries}
                  selected={industry}
                  onSelect={setIndustry}
                />
                <FilterDropdown
                  label="Country"
                  options={countries}
                  selected={country}
                  onSelect={setCountry}
                />
                <FilterDropdown
                  label="Failure cause"
                  options={causes}
                  selected={cause}
                  onSelect={setCause}
                />
                <FilterDropdown
                  label="Funding"
                  options={fundingOptions}
                  selected={funding}
                  onSelect={setFunding}
                  align="right"
                />
                <FilterDropdown
                  label="Sort"
                  options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  selected={sort}
                  onSelect={(v) => setSort((v as SortKey | null) ?? "newest")}
                  align="right"
                />
              </div>

              <p
                aria-live="polite"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute lg:ml-auto lg:whitespace-nowrap"
              >
                {hasFilters
                  ? `${filtered.length} of ${initialCases.length} records match`
                  : `All ${initialCases.length} records in order of accession`}
              </p>
            </form>

            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-line py-3">
                {chips.map((chip) => (
                  <span key={chip.label} className={styles.activeChip}>
                    {chip.label}
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={chip.clear}
                      aria-label={`Remove ${chip.label} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button type="button" onClick={clearAll} className="link-editorial">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Register of plates ── */}
      <section>
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          {filtered.length === 0 ? (
            <div className="py-16 text-center md:py-20">
              {emptyArt && (
                <Image
                  src="/archive-empty.webp"
                  alt=""
                  aria-hidden
                  width={800}
                  height={600}
                  className="mx-auto w-56 mix-blend-multiply md:w-64"
                  sizes="256px"
                />
              )}
              <p className="mt-8 font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
                No records match this query.
              </p>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-mute">
                The archive holds {initialCases.length} published files. Broaden
                the search, or start again.
              </p>
              <button type="button" onClick={clearAll} className="btn btn-outline mt-10">
                Clear search
              </button>
            </div>
          ) : (
            <ol>
              {filtered.map((c) => (
                <CasePlate
                  key={c.slug}
                  study={c}
                  accession={accession.get(c.slug) ?? 0}
                  maxFunding={archiveBounds.maxFunding}
                  minYear={archiveBounds.minYear}
                  maxYear={archiveBounds.maxYear}
                  related={relatedMap.get(c.slug) ?? []}
                />
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ── End of archive — next investigation ── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-6 md:py-20">
          <p className="label-catalog flex items-center justify-center gap-2 text-accent-deep">
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
            Continue the investigation
          </p>
          <p className="mx-auto mt-5 max-w-xl font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
            The archive is a starting point, not the last word.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <Link href="/pre-mortem" className="link-editorial inline-flex items-center gap-2">
              Run a forensic pre-mortem
              <span aria-hidden>→</span>
            </Link>
            <Link href="/ask" className="link-editorial inline-flex items-center gap-2">
              Interrogate the archive
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── helpers ─── */

function countBy(studies: CaseStudy[], keyOf: (c: CaseStudy) => string | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of studies) {
    const key = keyOf(c);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
