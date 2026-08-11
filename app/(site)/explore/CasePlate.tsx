"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { formatCurrencyCompact } from "@/lib/utils/format";
import { extractFounders, extractInvestors } from "@/lib/case-study-utils";
import type { CaseStudy } from "@/lib/db/case-studies";
import styles from "./explore.module.css";

interface CasePlateProps {
  study: CaseStudy;
  accession: number;
  maxFunding: number;
  minYear: number;
  maxYear: number;
  related: CaseStudy[];
}

/* Risk severity for 0–100 domain scores — same thresholds the dossier
 * publishes (Critical ≥70 / High ≥40 / Moderate ≥20 / Low). */
function riskLabel(score: number): string {
  if (score >= 70) return "Critical";
  if (score >= 40) return "High";
  if (score >= 20) return "Moderate";
  return "Low";
}

export const CasePlate = memo(function CasePlate({
  study: c,
  accession,
  maxFunding,
  minYear,
  maxYear,
  related,
}: CasePlateProps) {
  const valuation = (c as unknown as { valuation_peak?: number }).valuation_peak ?? null;

  const riskScore = useMemo(() => {
    const vals = Object.values(c.risk_scores ?? {}).filter(
      (v): v is number => typeof v === "number",
    );
    return vals.length ? Math.max(...vals) : null;
  }, [c.risk_scores]);

  const founders = useMemo(() => extractFounders(c), [c]);
  const investors = useMemo(() => extractInvestors(c), [c]);
  const sourcesCount = c.sources?.length ? c.sources.length : null;

  const lifespanYears =
    c.founded_year && c.shutdown_year ? c.shutdown_year - c.founded_year : null;
  const duration =
    lifespanYears === null
      ? "—"
      : lifespanYears < 1
        ? "<1 yr"
        : `${lifespanYears} yr${lifespanYears === 1 ? "" : "s"}`;

  const fundPct =
    maxFunding > 0 ? Math.max(3, Math.min(100, ((c.funding_raised ?? 0) / maxFunding) * 100)) : 0;

  const span = Math.max(1, maxYear - minYear);
  const startPct = c.founded_year ? ((c.founded_year - minYear) / span) * 100 : 0;
  const endPct = c.shutdown_year ? ((c.shutdown_year - minYear) / span) * 100 : 100;

  const filed = c.published_at
    ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
        .format(new Date(c.published_at))
        .toUpperCase()
    : null;

  const country = (c as unknown as { country?: string }).country ?? null;

  const kicker = [c.industry, country, c.founded_year && c.shutdown_year ? `${c.founded_year}–${c.shutdown_year}` : null]
    .filter(Boolean)
    .join(" · ");

  const primaryCause = (c.failure_reasons ?? [])[0] ?? null;

  return (
    <li className={styles.plate}>
      <Link href={`/case/${c.slug}`} className={`group ${styles.plateLink}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
            No. {String(accession).padStart(2, "0")}
            {filed ? <> · Filed {filed}</> : null}
          </p>
          {riskScore !== null && (
            <p className={styles.riskTag}>
              <span aria-hidden className="inline-block h-1 w-1 bg-accent-deep" />
              Risk · {riskLabel(riskScore)}
            </p>
          )}
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink transition-colors group-hover:text-accent-deep sm:text-4xl">
          {c.company_name}
        </h2>

        {kicker && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
            {kicker}
          </p>
        )}

        <p className={`mt-4 max-w-3xl text-[15px] leading-relaxed text-ink-mute ${styles.summaryClamp}`}>
          {c.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
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

        <dl className={`${styles.metaPanel} mt-5`}>
          <div className={styles.metaCell}>
            <dt className={styles.metaLabel}>Raised</dt>
            <dd className={styles.metaValue}>
              {c.funding_raised ? formatCurrencyCompact(c.funding_raised) : "—"}
            </dd>
            <div aria-hidden className={styles.fundingTrack}>
              <div className={styles.fundingFill} style={{ width: `${fundPct}%` }} />
            </div>
          </div>
          <div className={styles.metaCell}>
            <dt className={styles.metaLabel}>Peak valuation</dt>
            <dd className={styles.metaValue}>{valuation ? formatCurrencyCompact(valuation) : "—"}</dd>
          </div>
          <div className={styles.metaCell}>
            <dt className={styles.metaLabel}>Lifespan</dt>
            <dd className={styles.metaValue}>{duration}</dd>
            {c.founded_year && c.shutdown_year ? (
              <div aria-hidden className={styles.timelineTrack}>
                <div className={styles.timelineRail} />
                <div className={styles.timelineDot} style={{ left: `${startPct}%` }} />
                <div className={styles.timelineDot} style={{ left: `${endPct}%` }} />
              </div>
            ) : null}
          </div>
          <div className={styles.metaCell}>
            <dt className={styles.metaLabel}>Peak team</dt>
            <dd className={styles.metaValue}>
              {c.employees_peak ? `${c.employees_peak.toLocaleString("en-US")} people` : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          {related.length > 0 ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
              Related files ·{" "}
              <span className="text-ink">
                {related.map((r) => r.company_name).join(", ")}
              </span>
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {sourcesCount !== null ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                {sourcesCount} verified {sourcesCount === 1 ? "source" : "sources"}
              </p>
            ) : null}
            <span className="link-editorial inline-flex items-center gap-2">
              Open case file
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>

        <div className={styles.preview} aria-hidden>
          <div>
            <p className="label-catalog">Principals</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink">
              {founders.length ? founders.join(", ") : "—"}
            </p>
          </div>
          <div>
            <p className="label-catalog">Backers</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink">
              {investors.length
                ? [
                    ...investors.slice(0, 3),
                    investors.length > 3 ? `+${investors.length - 3} more` : null,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "—"}
            </p>
          </div>
          <div>
            <p className="label-catalog">Record</p>
            <dl className="mt-2 space-y-1.5">
              {valuation ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                    Peak valuation
                  </dt>
                  <dd className="font-mono text-xs tabular-nums text-ink">
                    {formatCurrencyCompact(valuation)}
                  </dd>
                </div>
              ) : null}
              {c.employees_peak ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                    Peak team
                  </dt>
                  <dd className="font-mono text-xs tabular-nums text-ink">
                    {c.employees_peak.toLocaleString("en-US")}
                  </dd>
                </div>
              ) : null}
              {sourcesCount !== null ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                    Sources
                  </dt>
                  <dd className="font-mono text-xs tabular-nums text-ink">{sourcesCount}</dd>
                </div>
              ) : null}
              {primaryCause ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                    Primary cause
                  </dt>
                  <dd className="max-w-[55%] truncate font-mono text-xs text-ink">{primaryCause}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </Link>
    </li>
  );
});
