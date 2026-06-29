'use client';

import type { Counterfactual } from '@/lib/case-study-utils';

interface CounterfactualAnalysisProps {
  counterfactuals: Counterfactual[];
}

export function CounterfactualAnalysis({ counterfactuals }: CounterfactualAnalysisProps) {
  if (counterfactuals.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">
        What if things had gone differently?
      </div>
      <div className="grid gap-5">
        {counterfactuals.map((cf, i) => (
          <div
            key={i}
            className="border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] rounded-sm overflow-hidden"
          >
            <div className="flex items-stretch">
              <div className="w-1 shrink-0 bg-[var(--rust-accent)]" />
              <div className="p-5 md:p-6 flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--rust-accent)] mb-1">
                      SCENARIO {String(i + 1).padStart(2, '0')}
                    </div>
                    <h4 className="font-display text-xl font-medium text-[var(--ink-black)]">
                      {cf.scenario}
                    </h4>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] px-3 py-1.5 border border-[var(--cream-dark)] text-[var(--ink-muted)] rounded-sm shrink-0">
                    {cf.probability}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
                  {cf.whatWouldHaveHappened}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
