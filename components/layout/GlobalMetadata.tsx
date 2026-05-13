'use client';

interface GlobalMetadataProps {
  totalCases: number;
  totalBurned: number;
  survivalRate?: string;
}

export function GlobalMetadata({ totalCases, totalBurned, survivalRate = "98.4%" }: GlobalMetadataProps) {
  const formattedBurned = totalBurned >= 1000 
    ? `$${(totalBurned / 1000).toFixed(1)}B` 
    : `$${totalBurned}M`;

  return (
    <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest uppercase text-text-muted">
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-bold">{totalCases.toLocaleString()}</span>
        <span>CASES</span>
      </div>
      <div className="w-[1px] h-3 bg-border-subtle" />
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-bold">{formattedBurned}</span>
        <span>DESTROYED</span>
      </div>
      <div className="w-[1px] h-3 bg-border-subtle" />
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-bold">{survivalRate}</span>
        <span>FAIL_RATE</span>
      </div>
    </div>
  );
}
