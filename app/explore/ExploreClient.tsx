'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { listCaseStudies, CaseStudy } from '@/lib/db/case-studies';
import { useDebounce } from '@/lib/hooks/useDebounce';

const DossierCard = dynamic(() => import('@/components/ui/DossierCard').then(m => m.DossierCard), {
  loading: () => <div className="skeleton-cream" style={{ height: '200px', borderRadius: '2px' }} />,
});

const DEFAULT_INDUSTRIES = ['Fintech', 'SaaS', 'Hardware', 'Healthtech', 'E-commerce', 'Social', 'Logistics'];
const DEFAULT_FAIL_TYPES = ['No Market Need', 'Cash Exhaustion', 'Team Fracture', 'Competition', 'Pricing Failure', 'Regulatory'];
const DEFAULT_COUNTRIES = ['US', 'UK', 'Canada', 'Germany', 'France', 'India', 'China', 'Australia'];
const FUNDING_RANGES = [
  { label: '< $1M', min: 0, max: 100_000_000 },
  { label: '$1M - $10M', min: 100_000_000, max: 1_000_000_000 },
  { label: '$10M - $100M', min: 1_000_000_000, max: 10_000_000_000 },
  { label: '$100M+', min: 10_000_000_000, max: undefined },
];
const YEAR_RANGES = [
  { label: 'Before 2000', min: undefined, max: 1999 },
  { label: '2000 - 2010', min: 2000, max: 2010 },
  { label: '2010 - 2020', min: 2010, max: 2020 },
  { label: 'After 2020', min: 2020, max: undefined },
];

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
  industries?: string[];
  failTypes?: string[];
  countries?: string[];
}

export function ExploreClient({ initialCases = [], industries, failTypes, countries }: ExploreClientProps) {
  const filterIndustries = industries && industries.length > 0 ? industries : DEFAULT_INDUSTRIES;
  const filterFailTypes = failTypes && failTypes.length > 0 ? failTypes : DEFAULT_FAIL_TYPES;
  const filterCountries = countries && countries.length > 0 ? countries : DEFAULT_COUNTRIES;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [failType, setFailType] = useState(searchParams.get('failType') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [fundingRange, setFundingRange] = useState(searchParams.get('funding') || '');
  const [yearRange, setYearRange] = useState(searchParams.get('year') || '');

  const debouncedSearch = useDebounce(search, 300);
  const debouncedIndustry = useDebounce(industry, 300);
  const debouncedFailType = useDebounce(failType, 300);
  const debouncedCountry = useDebounce(country, 300);
  const debouncedFundingRange = useDebounce(fundingRange, 300);
  const debouncedYearRange = useDebounce(yearRange, 300);

  const updateUrl = useCallback((q: string, ind: string, ft: string, co: string, fund: string, yr: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (ind) params.set('industry', ind);
    if (ft) params.set('failType', ft);
    if (co) params.set('country', co);
    if (fund) params.set('funding', fund);
    if (yr) params.set('year', yr);
    const newUrl = `/explore${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [router]);

  // Compute filter params for API query
  const { fundingMin, fundingMax } = useMemo(() => {
    const range = FUNDING_RANGES.find(r => r.label === debouncedFundingRange);
    return {
      fundingMin: range?.min,
      fundingMax: range?.max,
    };
  }, [debouncedFundingRange]);

  const { yearMin, yearMax } = useMemo(() => {
    const range = YEAR_RANGES.find(r => r.label === debouncedYearRange);
    return {
      yearMin: range?.min,
      yearMax: range?.max,
    };
  }, [debouncedYearRange]);

  const { data: cases, isLoading } = useQuery({
    queryKey: ['case-studies', debouncedIndustry, debouncedSearch, debouncedFailType, debouncedCountry, fundingMin, fundingMax, yearMin, yearMax],
    queryFn: () => listCaseStudies({
      industry: debouncedIndustry || undefined,
      search: debouncedSearch || undefined,
      failType: debouncedFailType || undefined,
      country: debouncedCountry || undefined,
      fundingMin,
      fundingMax,
      yearMin,
      yearMax,
    }),
    initialData: initialCases,
    staleTime: 5 * 60 * 1000,
  });

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesFailType =
        !debouncedFailType ||
        c.failure_reasons?.some((r) => r.toLowerCase().includes(debouncedFailType.toLowerCase()));

      return matchesFailType;
    });
  }, [cases, debouncedFailType]);

  const handleSearch = (val: string) => {
    setSearch(val);
    updateUrl(val, industry, failType, country, fundingRange, yearRange);
  };

  const handleIndustry = (val: string) => {
    setIndustry(val);
    updateUrl(search, val, failType, country, fundingRange, yearRange);
  };

  const handleFailType = (val: string) => {
    setFailType(val);
    updateUrl(search, industry, val, country, fundingRange, yearRange);
  };

  const handleCountry = (val: string) => {
    setCountry(val);
    updateUrl(search, industry, failType, val, fundingRange, yearRange);
  };

  const handleFundingRange = (val: string) => {
    setFundingRange(val);
    updateUrl(search, industry, failType, country, val, yearRange);
  };

  const handleYearRange = (val: string) => {
    setYearRange(val);
    updateUrl(search, industry, failType, country, fundingRange, val);
  };

  const clearAll = () => {
    setSearch('');
    setIndustry('');
    setFailType('');
    setCountry('');
    setFundingRange('');
    setYearRange('');
    router.replace('/explore', { scroll: false });
  };

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
                onChange={(e) => handleSearch(e.target.value)}
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
              onChange={(e) => handleIndustry(e.target.value)}
              className="sg-select"
            >
              <option value="">INDUSTRY ▾</option>
              {filterIndustries.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={failType}
              onChange={(e) => handleFailType(e.target.value)}
              className="sg-select"
            >
              <option value="">FAIL_TYPE ▾</option>
              {filterFailTypes.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={country}
              onChange={(e) => handleCountry(e.target.value)}
              className="sg-select"
            >
              <option value="">COUNTRY ▾</option>
              {filterCountries.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={fundingRange}
              onChange={(e) => handleFundingRange(e.target.value)}
              className="sg-select"
            >
              <option value="">FUNDING ▾</option>
              {FUNDING_RANGES.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={yearRange}
              onChange={(e) => handleYearRange(e.target.value)}
              className="sg-select"
            >
              <option value="">SHUTDOWN_YEAR ▾</option>
              {YEAR_RANGES.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label.toUpperCase()}
                </option>
              ))}
            </select>

            {(search || industry || failType || country || fundingRange || yearRange) && (
              <button
                onClick={clearAll}
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
