'use client';

import { TrendingDown, Activity } from 'lucide-react';

interface SectorStats {
  sectorName: string;
  impactScore: number; // 0-100
  marketSentiment: 'bearish' | 'neutral' | 'stable';
  trendDescription: string;
}

interface SectorBenchmarkingProps {
  stats: SectorStats;
}

export function SectorBenchmarking({ stats }: SectorBenchmarkingProps) {
  if (!stats) return null;

  return (
    <div className="glass-dossier p-6 border-border-strong bg-cream-deep/40 rounded-[2px] mt-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-ink-muted/10" />
      
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-3.5 h-3.5 text-rust-accent" />
        <h3 className="font-mono text-[9px] text-ink-muted tracking-widest uppercase">SECTOR_WAVE_ANALYSIS: {stats.sectorName}</h3>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-header text-3xl font-bold text-ink-black italic">{stats.impactScore}%</span>
            <span className="font-mono text-[8px] text-ink-ghost uppercase">FORENSIC_IMPACT_RATING</span>
          </div>
          <p className="text-[12px] text-ink-soft leading-relaxed pr-4">
            {stats.trendDescription}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 px-4 py-3 border-l border-cream-dark/50">
          <TrendingDown className={`w-6 h-6 ${stats.marketSentiment === 'bearish' ? 'text-rust-accent' : 'text-ink-muted'}`} />
          <span className="font-mono text-[8px] text-ink-muted uppercase">{stats.marketSentiment}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-1 h-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 ${i < stats.impactScore / 5 ? 'bg-rust-accent/40' : 'bg-cream-dark'}`} 
          />
        ))}
      </div>
    </div>
  );
}
