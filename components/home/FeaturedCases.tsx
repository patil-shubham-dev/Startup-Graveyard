'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DossierCard } from '@/components/ui/DossierCard';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { listCaseStudies, CaseStudy } from '@/lib/db/case-studies';

export function FeaturedCases() {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await listCaseStudies({ limit: 3 });
        setCases(data);
      } catch (error) {
        console.error('Failed to load featured cases:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCases();
  }, []);

  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 py-6 border-t border-border-subtle overflow-hidden">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase block mb-1">ARCHIVE_QUERY // 001</span>
          <h2 className="section-header">Forensic Investigation</h2>
        </div>
        <Link 
          href="/explore" 
          className="font-mono text-[10px] text-text-muted hover:text-violet-500 tracking-widest uppercase transition-colors"
        >
          FULL_ARCHIVE // →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[160px] bg-bg-surface border border-border-subtle rounded-[2px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cases.map((study) => (
            <DossierCard 
              key={study.id} 
              id={study.id.slice(0, 4).toUpperCase()}
              name={study.company_name}
              category={study.category}
              status="CLOSED"
              description={study.executive_summary}
              burnedAmount={study.funding_lost || 0}
              eolYear={new Date(study.founded_date).getFullYear().toString()}
              primaryCause={study.failure_reason}
              slug={study.slug}
            />
          ))}
        </div>
      )}
    </section>
  );
}
