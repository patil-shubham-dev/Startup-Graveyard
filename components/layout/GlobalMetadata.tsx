'use client';

import { formatCurrencyCompact } from '@/lib/utils/format';

interface GlobalMetadataProps {
  totalCases: number;
  totalBurned: number;
  survivalRate?: string;
}

export function GlobalMetadata({ totalCases, totalBurned, survivalRate = "98.4%" }: GlobalMetadataProps) {
  const formattedBurned = formatCurrencyCompact(totalBurned);

  return (
    <div className="flex flex-wrap items-center gap-5 font-mono text-[10px] tracking-[0.24em] uppercase text-text-muted">
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-bold">{totalCases.toLocaleString()}</span>
        <span>CASES</span>
      </div>
      <div className="h-3 w-px bg-border-subtle" />
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-bold">{formattedBurned}</span>
        <span>DESTROYED</span>
      </div>
      <div className="h-3 w-px bg-border-subtle" />
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-bold">{survivalRate}</span>
        <span>FAIL_RATE</span>
      </div>
    </div>
  );
}
