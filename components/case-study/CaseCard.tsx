import Link from 'next/link';
import { CaseStudy } from '@/lib/db/case-studies';

export function CaseCard({ study }: { study: CaseStudy }) {
  return (
    <div className="forensic-card flex flex-col h-full group">
      {/* 1. Row: CASE #ID --- Industry pill */}
      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-amber-signal text-[10px] tracking-[0.2em] uppercase">
          {study.case_number}
        </span>
        <span className="bg-white/5 border border-border-subtle text-text-secondary px-2.5 py-0.5 rounded-[4px] text-[10px] uppercase font-mono">
          {study.industry}
        </span>
      </div>

      {/* 3. Row: Logo + Company Name */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-lg">
          {study.company_name[0]}
        </div>
        <h3 className="font-display text-xl font-medium text-text-primary group-hover:text-violet-primary transition-colors">
          {study.company_name}
        </h3>
      </div>
      
      {/* 5. Italic verdict */}
      <p className="text-text-secondary italic text-sm mb-3 line-clamp-2 leading-relaxed">
        {study.summary}
      </p>

      {/* 7. Divider */}
      <div className="h-[1px] bg-border-subtle w-full mb-3" />

      {/* 9. Stats row */}
      <div className="font-mono text-[11px] text-text-muted flex items-center gap-2 mb-3">
        <span>${((study.funding_raised || 0) / 1000000000).toFixed(1)}B raised</span>
        <span>·</span>
        <span>Failed {study.shutdown_year}</span>
        {study.employees_peak && (
          <>
            <span>·</span>
            <span>{study.employees_peak} employees</span>
          </>
        )}
      </div>

      {/* 11. Row: Failure tag + Read Dossier */}
      <div className="mt-auto flex items-center justify-between">
        <span className="bg-amber-surface border border-amber-border text-amber-signal px-2.5 py-0.5 rounded-[4px] text-[10px] uppercase font-mono font-medium">
          {study.failure_reasons[0] || 'CRITICAL FAILURE'}
        </span>
        
        <Link 
          href={`/case/${study.slug}`}
          className="text-[13px] font-medium text-violet-primary group-hover:text-violet-hover transition-colors flex items-center"
        >
          Read Dossier <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
