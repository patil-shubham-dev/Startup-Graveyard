'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CaseCard } from '../case-study/CaseCard';
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
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="font-mono text-amber-signal tracking-[5px] text-[10px] uppercase block mb-3 font-bold">FEATURED AUTOPSIES</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary tracking-tight">Intelligence Highlights</h2>
        </div>
        <Link 
          href="/explore" 
          className="px-6 py-3 border border-border-subtle hover:bg-bg-surface-2 text-text-secondary hover:text-text-primary font-mono text-[10px] tracking-[2px] uppercase rounded-lg transition-all duration-300 shadow-lg hover:shadow-violet-glow/10"
        >
          Access Full Archive →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[420px] bg-bg-surface-1 border border-border-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((study) => (
            <CaseCard key={study.id} study={study} />
          ))}
          {cases.length === 0 && (
            <p className="col-span-full text-center text-text-muted font-mono text-sm py-12 border-2 border-dashed border-border-subtle rounded-xl">
              RETRIEVING CASE FILES...
            </p>
          )}
        </div>
      )}
    </section>
  );
}
