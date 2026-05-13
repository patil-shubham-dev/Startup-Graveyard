import Link from 'next/link';
import { CaseStudy } from '@/lib/db/case-studies';

export function CaseCard({ study }: { study: CaseStudy }) {
  return (
    <div className="glass p-5 rounded-2xl flex flex-col h-full group hover:bg-white/[0.04] transition-all duration-500 border-subtle shadow-premium">
      {/* 1. Row: CASE #ID --- Industry pill */}
      <div className="flex justify-between items-center mb-5">
        <span className="font-mono text-violet-primary text-[9px] tracking-[0.3em] uppercase font-bold">
          CASE_{study.case_number}
        </span>
        <span className="bg-white/5 border border-white/10 text-text-muted px-2 py-0.5 rounded-lg text-[8px] uppercase font-mono tracking-widest font-bold">
          {study.industry}
        </span>
      </div>

      {/* 3. Row: Logo + Company Name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl glass flex items-center justify-center text-sm font-bold text-text-primary shadow-lg border border-white/10 group-hover:bg-violet-primary/20 transition-all">
          {study.company_name[0]}
        </div>
        <h3 className="font-display text-xl font-bold text-text-primary group-hover:text-violet-primary transition-colors tracking-tight">
          {study.company_name}
        </h3>
      </div>
      
      {/* 5. Italic verdict */}
      <p className="text-text-secondary text-[13px] mb-5 line-clamp-2 leading-relaxed font-medium opacity-80">
        "{study.summary}"
      </p>

      {/* 9. Stats row */}
      <div className="font-mono text-[9px] text-text-subtle flex items-center gap-3 mb-5 font-bold tracking-wider uppercase">
        <span className="text-amber-signal/80 underline decoration-amber-signal/20 underline-offset-4">${((study.funding_raised || 0) / 1000000000).toFixed(1)}B_BURNED</span>
        <span className="opacity-20">|</span>
        <span>EOL_{study.shutdown_year}</span>
      </div>

      {/* 11. Row: Failure tag + Read Dossier */}
      <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
        <span className="bg-violet-primary/5 border border-violet-primary/10 text-violet-primary/80 px-2.5 py-0.5 rounded-lg text-[8px] uppercase font-mono font-bold tracking-widest">
          {study.failure_reasons[0] || 'CRITICAL_FAIL'}
        </span>
        
        <Link 
          href={`/case/${study.slug}`}
          className="text-[10px] font-mono font-bold tracking-[2px] text-text-muted group-hover:text-text-primary transition-all uppercase flex items-center"
        >
          VIEW_DOSSIER <span className="ml-1.5 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
