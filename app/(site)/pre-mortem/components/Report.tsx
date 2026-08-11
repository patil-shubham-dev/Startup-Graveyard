"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { PremortemReport, PremortemRisk } from "@/lib/premortem/schemas";

interface ReportProps {
  idea: string;
  report: PremortemReport;
  shareToken: string | null;
  groundedCases: number;
  documentedCases: number;
  onRestart: () => void;
  onRefineIdea: () => void;
}

export function riskLevel(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 70) return "HIGH";
  if (score >= 45) return "MEDIUM";
  return "LOW";
}

function RiskRow({ risk, index }: { risk: PremortemRisk; index: number }) {
  const level = riskLevel(risk.score);
  return (
    <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="flex items-baseline gap-4 text-lg font-semibold tracking-tight text-ink">
          <span className="font-mono text-[10px] font-medium tabular-nums text-ink-mute">
            {String(index + 1).padStart(2, "0")}
          </span>
          {risk.title}
        </h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
          {level} · {risk.score}%
        </p>
      </div>
      <div className="mt-3 h-[3px] w-full bg-line" role="presentation">
        <div
          className="h-full bg-accent-deep"
          style={{ width: `${Math.max(2, Math.min(100, risk.score))}%` }}
        />
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-mute">
        {risk.rationale}
      </p>
      {risk.evidence && (
        <div className="mt-4 max-w-2xl border-l-2 border-line pl-4">
          <p className="label-catalog">Historical evidence</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-mute">{risk.evidence}</p>
        </div>
      )}
      {risk.related_cases.length > 0 && (
        <div className="mt-4">
          <p className="label-catalog">Related failures</p>
          <ul className="mt-2 space-y-1.5">
            {risk.related_cases.map((c) => (
              <li key={`${risk.title}-${c.name}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                {c.slug ? (
                  <Link href={`/case/${c.slug}`} className="link-editorial text-sm">
                    {c.name}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-ink">{c.name}</span>
                )}
                {c.relevance && <span className="text-sm leading-relaxed text-ink-mute">{c.relevance}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Report({
  idea,
  report,
  shareToken,
  groundedCases,
  documentedCases,
  onRestart,
  onRefineIdea,
}: ReportProps) {
  const overallLevel = riskLevel(report.risk_score);

  const allCases = useMemo(() => {
    const seen = new Set<string>();
    const cases: Array<{ name: string; slug?: string; relevance: string }> = [];
    for (const risk of report.risks) {
      for (const c of risk.related_cases) {
        const key = c.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          cases.push(c);
        }
      }
    }
    return cases;
  }, [report.risks]);

  return (
    <article aria-label="Pre-mortem report">
      <p className="label-catalog">/ pre-mortem · report</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Pre-mortem report
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-mute">
        On the idea: “{idea}”
      </p>

      <section className="mt-10 border-t border-line pt-8">
        <h3 className="label-catalog">Overall risk</h3>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-4xl font-semibold tracking-tight text-ink">
            {overallLevel}
            <span className="ml-3 font-mono text-sm font-medium tracking-[0.16em] text-ink-mute">
              {report.risk_score}%
            </span>
          </p>
        </div>
        <div className="mt-4 h-[3px] w-full bg-line" role="presentation">
          <div
            className="h-full bg-accent-deep"
            style={{ width: `${Math.max(2, Math.min(100, report.risk_score))}%` }}
          />
        </div>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-mute">
          {report.executive_verdict}
        </p>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h3 className="label-catalog">Top failure risks</h3>
        <div className="mt-4">
          {report.risks.map((risk, i) => (
            <RiskRow key={risk.title} risk={risk} index={i} />
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h3 className="label-catalog">Why this could fail</h3>
        <ol className="mt-4 space-y-0">
          {report.why_this_could_fail.map((item, i) => (
            <li key={item} className="flex items-baseline gap-5 border-t border-line py-4 first:border-t-0 first:pt-0">
              <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="max-w-2xl text-[15px] leading-relaxed text-ink-mute">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h3 className="label-catalog">What to test before building</h3>
        <ol className="mt-4 space-y-0">
          {report.what_to_test.map((item, i) => (
            <li key={item} className="flex items-baseline gap-5 border-t border-line py-4 first:border-t-0 first:pt-0">
              <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="max-w-2xl text-[15px] leading-relaxed text-ink-mute">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h3 className="label-catalog">Early warning signals</h3>
        <ul className="mt-4 space-y-0">
          {report.early_warning_signals.map((item) => (
            <li key={item} className="flex items-baseline gap-5 border-t border-line py-4 first:border-t-0 first:pt-0">
              <span aria-hidden="true" className="mt-[7px] h-[5px] w-[5px] shrink-0 bg-accent-deep" />
              <span className="max-w-2xl text-[15px] leading-relaxed text-ink-mute">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {allCases.length > 0 && (
        <section className="mt-10 border-t border-line pt-8">
          <h3 className="label-catalog">Relevant failure cases</h3>
          <ul className="mt-4 space-y-0">
            {allCases.map((c, i) => (
              <li key={c.name} className="flex items-baseline gap-5 border-t border-line py-4 first:border-t-0 first:pt-0">
                <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                  Case {String(i + 1).padStart(2, "0")}
                </span>
                <span className="max-w-2xl text-[15px] leading-relaxed">
                  {c.slug ? (
                    <Link href={`/case/${c.slug}`} className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-accent-deep">
                      {c.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink">{c.name}</span>
                  )}
                  {c.relevance && <span className="text-ink-mute"> — {c.relevance}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="label-catalog mt-4">
            Cross-referenced against {groundedCases > 0 ? `${groundedCases} retrieved case${groundedCases === 1 ? "" : "s"}` : "the archive"} · {documentedCases} cases documented
          </p>
        </section>
      )}

      <section className="mt-10 border-t border-line pt-8">
        <h3 className="label-catalog">The pre-mortem verdict</h3>
        <p className="mt-4 max-w-2xl font-serif text-lg italic leading-relaxed text-ink">
          {report.verdict}
        </p>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={onRestart} className="btn btn-primary">
            Run another pre-mortem
          </button>
          <button onClick={onRefineIdea} className="btn btn-outline">
            Refine my idea
          </button>
          <Link href="/ask" className="btn btn-outline">
            Ask the archive
          </Link>
        </div>
        {!shareToken && (
          <p className="mt-6 text-xs leading-relaxed text-ink-mute">
            This report is stored on this device.{" "}
            <Link href="/auth" className="font-medium text-accent-deep underline underline-offset-4 hover:text-accent-deeper">
              Sign in
            </Link>{" "}
            to save and share it across devices.
          </p>
        )}
      </section>
    </article>
  );
}
