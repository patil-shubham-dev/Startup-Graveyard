'use client';

import { formatCurrency } from '@/lib/utils/format';

interface FailureDatum {
  name: string;
  value: number;
  color?: string;
}

interface LiquidationItem {
  name: string;
  amount: number;
  reason: string;
}

interface MarketIntelligenceProps {
  failureData?: FailureDatum[];
  topLiquidations?: LiquidationItem[];
}

export function MarketIntelligence({ failureData = [], topLiquidations = [] }: MarketIntelligenceProps) {
  const bars = failureData.slice(0, 5);
  const maxValue = Math.max(...bars.map((item) => item.value), 1);

  return (
    <section className="editorial-container">
      <div className="mb-10">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-[#bc9056]">INTEL ANALYTICS / LIVE</span>
        <h2 className="section-header mb-3">Signals that read cleanly at a glance.</h2>
        <p className="section-copy max-w-[660px]">
          These summaries are tied to the archive data, but presented with more restraint so the numbers feel useful instead of ornamental.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="panel-surface rounded-[28px] p-6 sm:p-7">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">Failure distribution</h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">Top causes in archive</span>
          </div>

          <div className="grid gap-4">
            {bars.map((item, index) => {
              const width = `${Math.max(12, Math.round((item.value / maxValue) * 100))}%`;

              return (
                <div key={item.name} className="rounded-[24px] border border-white/8 bg-[#13181d] p-5">
                  <div className="mb-3 flex items-end justify-between gap-4">
                    <div>
                      <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-sans text-[16px] font-semibold text-text-primary">{item.name}</h4>
                    </div>
                    <span className="metric-value font-mono text-[12px] uppercase tracking-[0.16em] text-[#d8b17b]">
                      {item.value} cases
                    </span>
                  </div>

                  <div className="h-2.5 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#60798b] to-[#d8b17b]"
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel-surface rounded-[28px] p-6 sm:p-7">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">Largest capital losses</h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">Published cases</span>
          </div>

          <div className="space-y-3">
            {topLiquidations.map((item, index) => (
              <div
                key={item.name}
                className="rounded-[24px] border border-white/8 bg-[#13181d] px-5 py-5 transition-colors hover:bg-[#171d22]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className="truncate font-sans text-[16px] font-semibold text-text-primary">{item.name}</h4>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                      {item.reason}
                    </p>
                  </div>
                  <span className="metric-value whitespace-nowrap font-mono text-[13px] font-semibold text-[#d8b17b]">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}

            {topLiquidations.length === 0 && (
              <div className="rounded-[24px] border border-white/8 bg-[#13181d] p-5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                Data sync pending
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
