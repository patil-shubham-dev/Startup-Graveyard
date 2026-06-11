'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { listCaseStudies, CaseStudy } from '@/lib/db/case-studies';
import { useDebounce } from '@/lib/hooks/useDebounce';

const DossierCard = dynamic(() => import('@/components/ui/DossierCard').then(m => m.DossierCard), {
  loading: () => <div className="skeleton-cream" style={{ height: '200px', borderRadius: '2px' }} />,
});

const INDUSTRIES = ['Fintech', 'SaaS', 'Hardware', 'Healthtech', 'E-commerce', 'Social', 'Logistics'];
const FAIL_TYPES = ['No Market Need', 'Cash Exhaustion', 'Team Fracture', 'Competition', 'Pricing Failure', 'Regulatory'];

function TombstoneSVG() {
  return (
    <svg width="64" height="80" viewBox="0 0 64 80" fill="none" aria-hidden="true">
      <rect x="16" y="32" width="32" height="40" rx="1" fill="none" stroke="var(--cream-dark)" strokeWidth="1.5" />
      <path d="M16 32 Q16 14 32 14 Q48 14 48 32" fill="none" stroke="var(--cream-dark)" strokeWidth="1.5" />
      <line x1="24" y1="48" x2="40" y2="48" stroke="var(--cream-dark)" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="24" y1="54" x2="36" y2="54" stroke="var(--cream-dark)" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="8" y1="72" x2="56" y2="72" stroke="var(--cream-dark)" strokeWidth="1.5" />
    </svg>
  );
}

interface ExploreClientProps {
  initialCases: CaseStudy[];
}

export function ExploreClient({ initialCases = [] }: ExploreClientProps) {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [failType, setFailType] = useState('');

  const debouncedSearch = useDebounce(search, 300);
  const debouncedIndustry = useDebounce(industry, 300);

  const { data: cases, isLoading } = useQuery({
    queryKey: ['case-studies', debouncedIndustry],
    queryFn: () => listCaseStudies({ industry: debouncedIndustry || undefined }),
    initialData: initialCases,
    staleTime: 5 * 60 * 1000,
  });

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        !debouncedSearch ||
        c.company_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.summary.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.industry?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesFailType =
        !failType ||
        c.failure_reasons?.some((r) => r.toLowerCase().includes(failType.toLowerCase()));

      return matchesSearch && matchesFailType;
    });
  }, [cases, debouncedSearch, failType]);

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--cream-base)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--cream-deep)',
          borderBottom: '1.5px dashed var(--cream-dark)',
          padding: '40px 0 32px',
        }}
      >
        <div className="sg-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--rust-accent)',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--sage-neutral)',
                    display: 'inline-block',
                  }}
                />
                LIVE ARCHIVE
              </div>
              <h1 className="t-h1">Archives</h1>
            </div>

            <div
              className="t-num"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: isLoading ? 'var(--ink-muted)' : 'var(--rust-accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? 'SYNCING...' : <>{filteredCases.length}_FILES</>}
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isLoading ? 'var(--ochre-signal)' : 'var(--rust-accent)',
                  display: 'inline-block',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '12px',
                  color: 'var(--ink-muted)',
                  pointerEvents: 'none',
                }}
              >
                ⌕
              </span>
              <input
                type="text"
                placeholder="SEARCH_AUTOPSIES..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--paper-white)',
                  border: '1px solid var(--cream-dark)',
                  borderRadius: '1px',
                  padding: '8px 12px 8px 30px',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-black)',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="sg-select"
            >
              <option value="">INDUSTRY ▾</option>
              {INDUSTRIES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={failType}
              onChange={(e) => setFailType(e.target.value)}
              className="sg-select"
            >
              <option value="">FAIL_TYPE ▾</option>
              {FAIL_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>

            {(search || industry || failType) && (
              <button
                onClick={() => { setSearch(''); setIndustry(''); setFailType(''); }}
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-muted)',
                  background: 'none',
                  border: '1px solid var(--cream-dark)',
                  borderRadius: '1px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                CLEAR ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="sg-container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {isLoading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-cream"
                style={{ height: '200px', borderRadius: '2px' }}
              />
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '100px',
              paddingBottom: '100px',
              gap: '24px',
              textAlign: 'center',
            }}
          >
            <TombstoneSVG />
            <div
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: '32px',
                fontWeight: '300',
                fontStyle: 'italic',
                color: 'var(--ink-muted)',
              }}
            >
              No autopsies matched.
            </div>
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--cream-dark)',
              }}
            >
              ADJUST FILTERS TO SEARCH THE ARCHIVE
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredCases.map((study) => (
              <DossierCard
                key={study.id}
                id={study.case_number}
                name={study.company_name}
                category={study.industry || 'GENERAL'}
                status="CLOSED"
                description={study.summary}
                burnedAmount={study.funding_raised || 0}
                eolYear={study.shutdown_year?.toString() || '—'}
                primaryCause={study.failure_reasons?.[0] || 'UNSPECIFIED'}
                slug={study.slug}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
