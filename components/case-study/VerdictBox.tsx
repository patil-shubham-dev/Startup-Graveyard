export function VerdictBox({ reasons }: { reasons: string[] }) {
  const divider = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
  
  return (
    <div className="verdict-box my-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-text-muted opacity-30 select-none">
        ARCHIVE REF: DG-882-X
      </div>
      
      <div className="mb-8">
        <span className="font-mono text-[10px] tracking-[3px] uppercase text-amber-signal block mb-2">
          VERDICT — PRIMARY CAUSES OF FAILURE
        </span>
        <div className="font-mono text-[10px] text-border-medium overflow-hidden whitespace-nowrap">
          {divider}
        </div>
      </div>

      <div className="space-y-4">
        {(reasons || []).map((reason) => (
          <div key={reason} className="flex items-start gap-4 font-mono text-[14px]">
            <span className="text-amber-signal font-bold">✗</span>
            <span className="text-text-primary uppercase tracking-tight">{reason}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 font-mono text-[10px] text-border-medium overflow-hidden whitespace-nowrap">
        {divider}
      </div>
    </div>
  );
}
