'use client';

import { useState, useEffect } from 'react';
import { DossierCard } from '@/components/ui/DossierCard';
import { listCaseStudies, CaseStudy } from '@/lib/db/case-studies';

const INDUSTRIES = ['Fintech', 'SaaS', 'Hardware', 'Healthtech', 'E-commerce', 'Social', 'Logistics'];
const FAIL_TYPES = ['No Market Need', 'Cash Exhaustion', 'Team Fracture', 'Competition', 'Pricing Failure', 'Regulatory'];

// Tombstone SVG for empty state
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
  const [cases, setCases] = useState<CaseStudy[]>(initialCases);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch if filters change and we aren't using the initial state
    if (industry) {
      const loadCases = async () => {
        setLoading(true);
        try {
          const data = await listCaseStudies({ industry: industry || undefined });
          setCases(data);
        } catch (error) {
          console.error('Failed to load case studies:', error);
        } finally {
          setLoading(false);
        }
      };
      loadCases();
    } else if (cases !== initialCases && !industry) {
        setCases(initialCases);
    }
  }, [industry, initialCases]);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      !search ||
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.summary.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase());

    const matchesFailType =
      !failType ||
      c.failure_reasons?.some((r) => r.toLowerCase().includes(failType.toLowerCase()));

    return matchesSearch && matchesFailType;
  });

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--cream-base)',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          backgroundColor: 'var(--cream-deep)',
          borderBottom: '1.5px dashed var(--cream-dark)',
          padding: '40px 0 32px',
        }}
      >
        <div className="sg-container">
          {/* Top row: title + count */}
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

            {/* File count */}
            <div
              className="t-num"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: loading ? 'var(--ink-muted)' : 'var(--rust-accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {loading ? 'SYNCING...' : <>{filteredCases.length}_FILES</>}
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: loading ? 'var(--ochre-signal)' : 'var(--rust-accent)',
                  display: 'inline-block',
                  animation: loading ? 'pulse 1s ease-in-out infinite' : 'none',
                }}
              />
            </div>
          </div>

          {/* Filter bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            {/* Search */}
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

            {/* Industry dropdown */}
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

            {/* Fail type dropdown */}
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

            {/* Reset */}
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

      {/* Grid */}
      <div className="sg-container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {loading ? (
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
