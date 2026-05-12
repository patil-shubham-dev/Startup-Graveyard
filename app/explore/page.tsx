'use client';

import { useState, useEffect } from 'react';
import { CaseCard } from '@/components/case-study/CaseCard';
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
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <header className="mb-16">
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 text-text-primary tracking-tight">The Graveyard</h1>
        <p className="text-text-secondary max-w-2xl text-lg leading-relaxed font-body">
          Browse through the definitive record of startup failures. 
          Use forensic filters to search by industry, funding, or root cause.
        </p>
      </header>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-bg-page/80 backdrop-blur-md border border-border-subtle p-5 mb-16 flex flex-wrap gap-4 items-center rounded-lg shadow-xl">
        <div className="flex-1 min-w-[240px] relative">
          <input 
            type="text" 
            placeholder="Search 1,000+ startup autopsies..." 
            className="w-full bg-bg-surface-2 border border-border-subtle px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary transition-colors text-text-primary rounded-md placeholder:text-text-muted font-body shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-4 top-3 text-text-muted text-[10px] font-mono border border-border-subtle px-1.5 py-0.5 rounded-sm bg-bg-surface-1">/</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="bg-bg-surface-2 border border-border-subtle px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-text-secondary focus:outline-none focus:border-violet-primary rounded-md cursor-pointer transition-colors"
          >
            <option value="INDUSTRY">INDUSTRY</option>
            <option value="Fintech">FINTECH</option>
            <option value="Streaming">STREAMING</option>
            <option value="SaaS">SAAS</option>
            <option value="Hardware">HARDWARE</option>
          </select>

          <select className="bg-bg-surface-2 border border-border-subtle px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-text-secondary focus:outline-none focus:border-violet-primary rounded-md cursor-pointer opacity-50">
            <option>FUNDING</option>
            <option>$100M+</option>
            <option>$500M+</option>
          </select>

          <select className="bg-bg-surface-2 border border-border-subtle px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-text-secondary focus:outline-none focus:border-violet-primary rounded-md cursor-pointer opacity-50">
            <option>FAILURE REASON</option>
            <option>PMF FAILURE</option>
            <option>BURN RATE</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-10">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-[3px]">
          {loading ? 'RETRIEVING RECORDS...' : `Showing ${filteredCases.length} OF ${cases.length} CASE FILES`}
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-border-strong bg-bg-surface-3 text-violet-primary rounded-sm transition-colors"><GridIcon /></button>
          <button className="p-2 border border-border-subtle hover:bg-bg-surface-2 transition-colors text-text-muted rounded-sm"><ListIcon /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[400px] bg-bg-surface-1 border border-border-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((study) => (
            <CaseCard key={study.id} study={study} />
          ))}
          {filteredCases.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-border-subtle rounded-xl">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
                No matching autopsies found in this sector.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Infinite Scroll Indicator */}
      {!loading && cases.length > 0 && (
        <div className="mt-24 py-16 border-t border-border-subtle text-center">
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-[5px]">
            END OF CURRENT DOSSIER
          </p>
        </div>
      )}
    </main>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
