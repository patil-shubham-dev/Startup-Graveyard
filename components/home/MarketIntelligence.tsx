'use client';

import { IntelKicker } from '@/components/ui/IntelKicker';

const LIQUIDATIONS = [
  { name: 'QUIBI', amount: '$1.75B', reason: 'MARKET_MISALIGNMENT' },
  { name: 'THERANOS', amount: '$945M', reason: 'SYSTEMIC_FRAUD' },
  { name: 'BETTER PLACE', amount: '$850M', reason: 'TEMPORAL_ERROR' },
  { name: 'KATERRA', amount: '$800M', reason: 'EXECUTION_COLLAPSE' },
];

export function MarketIntelligence() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 py-6 border-t border-border-subtle">
      <div className="mb-6">
        <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase block mb-1">INTEL_ANALYTICS // LIVE</span>
        <h2 className="section-header">Market Intelligence</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left: Failure Distribution */}
        <div className="bg-bg-surface p-4 rounded-[2px] border border-border-subtle relative group overflow-hidden h-[240px]">
          <h3 className="font-mono text-[10px] text-text-muted mb-6 uppercase tracking-widest">Failure_Distribution</h3>
          
          <div className="h-40 flex items-center justify-center relative">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border border-violet-500/10" />
              <div className="absolute inset-2 rounded-full border border-violet-500/20 border-t-transparent animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-violet-500/40 border-b-transparent animate-[spin_4s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[9px] text-violet-500 animate-pulse">ANALYZING</span>
              </div>
            </div>
            <div className="ml-8 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-600" />
                <span className="font-mono text-[10px] text-text-muted uppercase">PMF_MISMATCH</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="font-mono text-[10px] text-text-muted uppercase">BURN_RATE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-border-strong" />
                <span className="font-mono text-[10px] text-text-muted uppercase">REGULATORY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: High Value Liquidations */}
        <div className="bg-bg-surface p-4 rounded-[2px] border border-border-subtle relative group overflow-hidden h-[240px]">
          <h3 className="font-mono text-[10px] text-text-muted mb-6 uppercase tracking-widest">High_Value_Liquidations</h3>
          
          <div className="space-y-1">
            {LIQUIDATIONS.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-text-muted text-[9px]">0{i+1}</span>
                  <span className="font-sans text-[13px] font-bold text-text-primary">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-violet-500 text-[11px] font-bold">{item.amount}</div>
                  <div className="font-mono text-[8px] text-text-muted uppercase">{item.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
