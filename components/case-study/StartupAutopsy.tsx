'use client';

import type { ForensicData } from '@/lib/case-study-utils';

interface StartupAutopsyProps {
  data: ForensicData;
  failureReasons: string[];
  riskScores: Record<string, number>;
}

export function StartupAutopsy({ data, failureReasons, riskScores }: StartupAutopsyProps) {
  const score = data.failureScore ?? 0;
  const survival = data.survivalProbability ?? 0;

  const scoreColor = score >= 70 ? 'var(--failed-red)' : score >= 40 ? 'var(--rust-accent)' : 'var(--ochre-signal)';
  const survivalColor = survival >= 50 ? 'var(--sage-neutral)' : survival >= 20 ? 'var(--ochre-signal)' : 'var(--failed-red)';

  return (
    <div className="border border-[var(--cream-dark)]/50 bg-[var(--paper-white)] rounded-sm overflow-hidden">
      <div className="bg-[var(--ink-black)] px-6 py-3 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--cream-base)]/60">STARTUP_AUTOPSY_REPORT</span>
        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--rust-accent)]">FORENSIC_FINDINGS</span>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Cause of Death */}
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">CAUSE OF DEATH</div>
          <div className="font-display text-2xl md:text-3xl font-medium text-[var(--ink-black)]">
            {data.causeOfDeath || failureReasons[0] || 'Undetermined'}
          </div>
        </div>

        {/* Secondary Causes & Contributing Factors */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-3">Secondary Causes</div>
            <div className="space-y-2">
              {(data.secondaryCauses.length > 0 ? data.secondaryCauses : failureReasons.slice(1, 4)).map((cause, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--rust-accent)] shrink-0" />
                  <span className="text-sm text-[var(--ink-soft)]">{cause}</span>
                </div>
              ))}
              {data.secondaryCauses.length === 0 && failureReasons.length <= 1 && (
                <span className="text-sm text-[var(--ink-muted)] italic">No secondary causes identified</span>
              )}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-3">Contributing Factors</div>
            <div className="space-y-2">
              {(data.contributingFactors.length > 0 ? data.contributingFactors : failureReasons.slice(2, 6)).map((factor, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ochre-signal)] shrink-0" />
                  <span className="text-sm text-[var(--ink-soft)]">{factor}</span>
                </div>
              ))}
              {data.contributingFactors.length === 0 && failureReasons.length <= 2 && (
                <span className="text-sm text-[var(--ink-muted)] italic">No contributing factors identified</span>
              )}
            </div>
          </div>
        </div>

        {/* Fatal Event */}
        {data.fatalEvent && (
          <div className="bg-[var(--cream-deep)]/50 border border-[var(--cream-dark)]/30 p-5 rounded-sm">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--failed-red)] mb-2">FATAL EVENT</div>
            <div className="text-sm leading-relaxed text-[var(--ink-soft)]">{data.fatalEvent}</div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Failure Score */}
          <div className="border border-[var(--cream-dark)]/40 p-4 rounded-sm">
            <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">Failure Score</div>
            <div className="flex items-end gap-2">
              <span className="font-display text-3xl font-medium" style={{ color: scoreColor }}>{score}</span>
              <span className="font-mono text-[10px] text-[var(--ink-muted)] mb-1">/100</span>
            </div>
            <div className="mt-2 h-1.5 bg-[var(--cream-dark)]/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
            </div>
          </div>

          {/* Survival Probability */}
          <div className="border border-[var(--cream-dark)]/40 p-4 rounded-sm">
            <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">Survival Probability</div>
            <div className="flex items-end gap-2">
              <span className="font-display text-3xl font-medium" style={{ color: survivalColor }}>{survival}</span>
              <span className="font-mono text-[10px] text-[var(--ink-muted)] mb-1">/100</span>
            </div>
            <div className="mt-2 h-1.5 bg-[var(--cream-dark)]/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${survival}%`, backgroundColor: survivalColor }} />
            </div>
          </div>

          {/* Could It Survive Today */}
          <div className="border border-[var(--cream-dark)]/40 p-4 rounded-sm col-span-2">
            <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">Could It Survive Today?</div>
            <div className="font-display text-2xl font-medium" style={{ color: data.couldItSurviveToday ? 'var(--sage-neutral)' : 'var(--failed-red)' }}>
              {data.couldItSurviveToday === null ? 'Inconclusive' : data.couldItSurviveToday ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">
              {data.couldItSurviveToday === null
                ? 'Insufficient data for assessment'
                : data.couldItSurviveToday
                  ? 'Market conditions or business model would be viable today'
                  : 'Structural flaws would prevent survival in any era'}
            </div>
          </div>
        </div>

        {/* Risk DNA */}
        {Object.keys(riskScores).length > 0 && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-4">RISK_DNA_SCAN</div>
            <div className="space-y-3">
              {Object.entries(riskScores).map(([key, val]) => {
                const pct = typeof val === 'number' ? (val > 1 ? val : val * 100) : 0;
                const barColor = pct >= 70 ? 'var(--failed-red)' : pct >= 40 ? 'var(--rust-accent)' : pct >= 20 ? 'var(--ochre-signal)' : 'var(--sage-neutral)';
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">{key.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-[9px] text-[var(--ink-muted)]">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 bg-[var(--cream-dark)]/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
