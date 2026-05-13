'use client';

import { useState, useEffect } from 'react';
import { DossierCard } from '@/components/ui/DossierCard';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { listCaseStudies, CaseStudy } from '@/lib/db/case-studies';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = async () => {
      setLoading(true);
      try {
        const data = await listCaseStudies({ 
          industry: industry !== 'INDUSTRY' ? industry : undefined 
        });
        setCases(data);
      } catch (error) {
        console.error('Failed to load case studies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCases();
  }, [industry]);

  const filteredCases = cases.filter(c => 
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.summary.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="h-full flex flex-col pt-12 overflow-hidden relative">
      {/* Pinned Filter Bar (48px) */}
      <div className="h-12 bg-bg-base border-b border-border-subtle flex items-center px-6 gap-6 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4 min-w-fit">
          <span className="font-header text-lg font-bold text-text-primary tracking-tight">ARCHIVES</span>
          <div className="w-[1px] h-6 bg-border-subtle" />
        </div>

        <div className="flex-1 relative max-w-md">
          <input 
            type="text" 
            placeholder="SEARCH_AUTOPSIES..." 
            className="w-full bg-bg-surface border border-border-subtle pl-8 pr-4 h-8 text-[10px] font-mono focus:outline-none focus:border-violet-600/50 transition-colors text-text-primary rounded-[1px] placeholder:text-text-muted uppercase tracking-widest"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">⌕</div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="bg-bg-surface border border-border-subtle px-3 h-8 text-[9px] font-mono uppercase tracking-widest text-text-muted focus:outline-none focus:border-violet-600/50 rounded-[1px] cursor-pointer"
          >
            <option value="">INDUSTRY</option>
            {['Fintech', 'SaaS', 'Hardware', 'Healthtech'].map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
          </select>
          <select className="bg-bg-surface border border-border-subtle px-3 h-8 text-[9px] font-mono uppercase tracking-widest text-text-muted focus:outline-none rounded-[1px] cursor-pointer">
            <option value="">FAIL_TYPE</option>
            <option value="PMF">PMF_ERROR</option>
            <option value="BURN">BURN_RATE</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">
            {loading ? 'SYNCING...' : `${filteredCases.length}_FILES`}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-[140px] bg-bg-surface border border-border-subtle rounded-[2px] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCases.map((study) => (
                <DossierCard 
                  key={study.id} 
                  id={study.case_number}
                  name={study.company_name}
                  category={study.industry || 'N/A'}
                  status="CLOSED"
                  description={study.summary}
                  burnedAmount={study.funding_raised || 0}
                  eolYear={study.shutdown_year?.toString() || 'N/A'}
                  primaryCause={study.failure_reasons?.[0] || 'UNSPECIFIED'}
                  slug={study.slug}
                  variant="compact"
                />
              ))}
            </div>
            {filteredCases.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-20">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-[0.5em]">
                  NO_MATCHING_RECORDS_FOUND_IN_ARCHIVE
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
