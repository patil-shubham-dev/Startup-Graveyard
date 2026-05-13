import { IntelKicker } from '@/components/ui/IntelKicker';

export function VerdictBox({ reasons }: { reasons: string[] }) {
  return (
    <div className="my-20 relative overflow-hidden glass-dossier p-12 rounded-[4px] border-border-strong">
      <div className="absolute top-4 right-6 font-mono text-[9px] text-text-ghost opacity-40 select-none">
        ARCHIVE_REF: DG-882-X // CONFIDENTIAL
      </div>
      
      <div className="mb-12">
        <IntelKicker label="VERDICT" figure="PRIMARY_CAUSES" />
        <div className="h-[1px] w-full bg-gradient-to-r from-amber-500/30 to-transparent mt-4" />
      </div>

      <div className="space-y-6">
        {(reasons || []).map((reason, i) => (
          <div key={reason} className="flex items-start gap-6 group">
            <span className="font-mono text-amber-500 font-bold mt-1 text-xs">0{i + 1}</span>
            <div className="flex-1">
              <span className="font-mono text-[15px] text-text-primary uppercase tracking-tight group-hover:text-amber-500 transition-colors duration-300">
                {reason.replace('_', ' ')}
              </span>
              <div className="h-[1px] w-0 group-hover:w-full bg-amber-500/20 transition-all duration-700 mt-2" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-between items-center">
        <div className="h-[1px] flex-1 bg-border-subtle" />
        <span className="font-mono text-[8px] text-text-ghost uppercase tracking-[0.4em] mx-6">END_OF_INVESTIGATION</span>
        <div className="h-[1px] flex-1 bg-border-subtle" />
      </div>

      {/* Forensic Decoration */}
      <div className="absolute -bottom-8 -left-8 w-24 h-24 border border-white/[0.02] rounded-full" />
    </div>
  );
}
