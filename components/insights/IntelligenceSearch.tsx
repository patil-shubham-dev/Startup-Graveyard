'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  type: 'company' | 'industry' | 'pattern' | 'mistake' | 'historical' | 'discovery';
  label: string;
  description: string;
  link?: string;
  keywords: string[];
}

const SEARCH_INDEX: SearchResult[] = [
  { type: 'company', label: 'WeWork', description: 'Office space company that failed after fraud and mismanagement', link: '/case/wework', keywords: ['wework', 'office', 'real estate', 'adam neumann', 'fraud'] },
  { type: 'company', label: 'Theranos', description: 'HealthTech startup that collapsed due to fraudulent blood testing claims', link: '/case/theranos', keywords: ['theranos', 'blood test', 'healthtech', 'elizabeth holmes', 'fraud'] },
  { type: 'company', label: 'Quibi', description: 'Short-form video streaming service that failed within 6 months', link: '/case/quibi', keywords: ['quibi', 'streaming', 'video', 'katzenberg', 'short form'] },
  { type: 'company', label: 'Fast', description: 'Fintech checkout startup that collapsed from cash exhaustion', link: '/case/fast', keywords: ['fast', 'checkout', 'fintech', 'one-click'] },
  { type: 'company', label: 'Convoy', description: 'Logistics and freight brokerage startup that failed to scale', link: '/case/convoy', keywords: ['convoy', 'logistics', 'freight', 'trucking'] },
  { type: 'company', label: 'Katerra', description: 'Construction technology startup that collapsed despite billions in funding', link: '/case/katerra', keywords: ['katerra', 'construction', 'proptech', 'building'] },
  { type: 'company', label: 'Bird', description: 'Electric scooter sharing company that went bankrupt', link: '/case/bird', keywords: ['bird', 'scooter', 'micromobility', 'electric'] },
  { type: 'company', label: 'Olive AI', description: 'Healthcare AI startup that failed after over-hyping capabilities', link: '/case/olive-ai', keywords: ['olive', 'ai', 'healthcare', 'artificial intelligence'] },
  { type: 'company', label: 'Zume Pizza', description: 'Robotic pizza startup that pivoted multiple times before collapsing', link: '/case/zume-pizza', keywords: ['zume', 'pizza', 'robotics', 'food', 'automation'] },
  { type: 'company', label: 'Jawbone', description: 'Wearable tech pioneer that failed from competition and mismanagement', link: '/case/jawbone', keywords: ['jawbone', 'wearable', 'fitness', 'bluetooth'] },
  { type: 'company', label: 'Fab', description: 'E-commerce startup that burned through funding on rapid expansion', link: '/case/fab-dot-com', keywords: ['fab', 'ecommerce', 'design', 'flash sales'] },
  { type: 'company', label: 'Better.com', description: 'Mortgage lender that failed after toxic culture and mass layoffs', link: '/case/better-dot-com', keywords: ['better', 'mortgage', 'fintech', 'real estate', 'layoffs'] },
  { type: 'company', label: 'Varo Money', description: 'Neobank that struggled with regulatory challenges', link: '/case/varo-money', keywords: ['varo', 'neobank', 'banking', 'fintech'] },
  { type: 'company', label: 'Argo AI', description: 'Autonomous vehicle startup that raised billions before shutdown', link: '/case/argo-ai', keywords: ['argo', 'self-driving', 'autonomous', 'ford', 'volkswagen'] },
  { type: 'company', label: 'Arrival', description: 'Electric vehicle manufacturer that failed to scale production', link: '/case/arrival', keywords: ['arrival', 'ev', 'electric vehicle', 'bus', 'van'] },
  { type: 'company', label: 'Cazoo', description: 'Online used car marketplace that collapsed after SPAC merger', link: '/case/cazoo', keywords: ['cazoo', 'used cars', 'marketplace', 'spac'] },
  { type: 'company', label: 'Scale Factor', description: 'AI-powered accounting startup that failed from product issues', link: '/case/scale-factor', keywords: ['scale factor', 'accounting', 'fintech', 'ai'] },
  { type: 'company', label: 'Zeus Living', description: 'Flexible housing startup that collapsed', link: '/case/zeus-living', keywords: ['zeus', 'housing', 'rental', 'proptech'] },
  { type: 'industry', label: 'Fintech', description: 'Financial technology — one of the highest-failure sectors', keywords: ['fintech', 'financial', 'banking', 'payments', 'lending'] },
  { type: 'industry', label: 'HealthTech', description: 'Healthcare technology — high regulation, high failure rate', keywords: ['healthtech', 'healthcare', 'medical', 'biotech'] },
  { type: 'industry', label: 'SaaS', description: 'Software as a Service — competitive, distribution-dependent', keywords: ['saas', 'software', 'cloud', 'b2b'] },
  { type: 'industry', label: 'Crypto', description: 'Cryptocurrency and blockchain — volatile and regulatory-heavy', keywords: ['crypto', 'blockchain', 'web3', 'bitcoin'] },
  { type: 'industry', label: 'E-commerce', description: 'Online retail — crowded, low-margin, logistics-heavy', keywords: ['ecommerce', 'retail', 'online shopping', 'd2c'] },
  { type: 'industry', label: 'Logistics', description: 'Supply chain and freight — capital-intensive, thin margins', keywords: ['logistics', 'freight', 'supply chain', 'delivery'] },
  { type: 'industry', label: 'AI', description: 'Artificial intelligence — hype-driven, high expectations', keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml'] },
  { type: 'industry', label: 'FoodTech', description: 'Food and restaurant technology — difficult unit economics', keywords: ['foodtech', 'food', 'restaurant', 'delivery', 'meal'] },
  { type: 'pattern', label: 'The Blitzscaling Trap', description: 'Rapid scaling before achieving product-market fit', keywords: ['blitzscaling', 'rapid growth', 'scale too fast', 'hockey stick'] },
  { type: 'pattern', label: 'Capital Burn Addiction', description: 'Dependence on continuous fundraising to survive', keywords: ['burn rate', 'cash burn', 'fundraising', 'runway', 'cash exhaustion'] },
  { type: 'pattern', label: 'Weak Product-Market Fit', description: 'Building something the market does not need', keywords: ['pmf', 'product market fit', 'no market', 'market need'] },
  { type: 'pattern', label: 'Premature Expansion', description: 'Expanding before core business is proven', keywords: ['premature', 'expansion', 'overexpansion', 'new markets'] },
  { type: 'pattern', label: 'Solo Founder Fragility', description: 'Single-founder startups more vulnerable to failure', keywords: ['solo founder', 'single founder', 'cofounder', 'lonely founder'] },
  { type: 'pattern', label: 'The Pivot Deadline', description: 'Multiple pivots strongly correlate with failure', keywords: ['pivot', 'pivoting', 'strategy shift', 'pivot deadline'] },
  { type: 'pattern', label: 'Poor Unit Economics', description: 'Negative unit economics disguised as growth', keywords: ['unit economics', 'negative margin', 'cac', 'ltv'] },
  { type: 'pattern', label: 'Feature Creep Syndrome', description: 'Adding features without solving core problems', keywords: ['feature creep', 'scope creep', 'product bloat'] },
  { type: 'pattern', label: 'Regulatory Blindness', description: 'Ignoring compliance requirements until forced shutdown', keywords: ['regulatory', 'compliance', 'fraud', 'legal'] },
  { type: 'mistake', label: 'Premature Scaling', description: 'Scaling team, marketing, and operations before validation', keywords: ['premature scaling', 'scale too early', 'grow too fast'] },
  { type: 'mistake', label: 'Weak Distribution', description: 'No viable customer acquisition strategy', keywords: ['distribution', 'acquisition', 'marketing', 'go to market', 'gtm'] },
  { type: 'mistake', label: 'Burn Rate Addiction', description: 'Spending exceeds revenue, dependent on funding', keywords: ['burn', 'spending', 'cash', 'funding dependent'] },
  { type: 'mistake', label: 'Founder Conflict', description: 'Leadership disputes paralyze decision-making', keywords: ['founder fight', 'cofounder conflict', 'leadership', 'team fracture'] },
  { type: 'mistake', label: 'Lack of Focus', description: 'Attempting to serve too many markets at once', keywords: ['focus', 'spread thin', 'diversification', 'attention'] },
  { type: 'mistake', label: 'Weak Competitive Moat', description: 'Entering competitive markets without differentiation', keywords: ['competition', 'moat', 'differentiation', 'commodity'] },
  { type: 'historical', label: 'The Unicorn Era (2010-2019)', description: 'Growth-at-all-costs mindset defined a decade of venture capital', keywords: ['unicorn', '2010s', 'zero interest', 'growth', 'venture capital'] },
  { type: 'historical', label: 'The Dot-Com Aftermath (2000-2009)', description: 'Bubble burst taught hard lessons about business fundamentals', keywords: ['dot com', 'bubble', '2000', 'crash', 'internet'] },
  { type: 'historical', label: 'The Correction (2020-Present)', description: 'Rising capital costs expose over-leveraged business models', keywords: ['2020', 'correction', 'zero interest', 'rate hike', 'covid'] },
  { type: 'discovery', label: 'Funding Before PMF Correlation', description: 'Founders who raise over $100M before product-market fit fail 3x more often', keywords: ['funding', 'pmf', 'pre-revenue', 'overfunded'] },
  { type: 'discovery', label: 'Viral Growth Fragility', description: 'Consumer startups dependent on viral growth collapse 2x faster', keywords: ['viral', 'consumer', 'growth hack', 'network effects'] },
  { type: 'discovery', label: 'The Pivot Trap', description: 'Multiple pivots before profitability strongly correlate with failure', keywords: ['pivot', 'strategy shift', 'pivot trap', 'iteration'] },
  { type: 'discovery', label: 'Cash Exhaustion Paradox', description: 'Companies failing from cash exhaustion raise significant funding yet still run out', keywords: ['cash', 'burn', 'runway', 'exhaustion', 'fundraising'] },
];

export default function IntelligenceSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);



  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    const terms = value.toLowerCase().split(/\s+/).filter(Boolean);

    let filtered = SEARCH_INDEX.filter(item => {
      const searchable = [item.label, ...item.keywords, item.type, item.description].join(' ').toLowerCase();
      return terms.every(term => searchable.includes(term));
    });

    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    setResults(filtered);
  }, [selectedType]);

  const typeCounts = SEARCH_INDEX.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeColors: Record<string, string> = {
    company: 'var(--rust-accent)',
    industry: 'var(--sage-neutral)',
    pattern: 'var(--ochre-signal)',
    mistake: 'var(--failed-red)',
    historical: 'var(--ink-muted)',
    discovery: '#7C3AED',
  };

  return (
    <div style={{
      backgroundColor: isFocused || hasSearched ? 'var(--cream-deep)' : 'transparent',
      border: `1.5px dashed ${isFocused || hasSearched ? 'var(--rust-accent)' : 'var(--cream-dark)'}`,
      borderRadius: '2px',
      transition: 'all 0.2s ease',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search the intelligence database..."
            style={{
              padding: '14px 16px',
              fontSize: '15px',
              backgroundColor: 'var(--paper-white)',
              border: '1.5px dashed var(--cream-dark)',
              width: '100%',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              color: 'var(--ink-black)',
              outline: 'none',
              borderRadius: '2px',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--rust-accent)'; }}
            onMouseLeave={e => { if (!isFocused) e.currentTarget.style.borderColor = 'var(--cream-dark)'; }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: 'var(--ink-muted)',
                padding: '4px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
        {hasSearched && (
          <div style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '9px',
            color: 'var(--ink-muted)',
            whiteSpace: 'nowrap',
          }}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
      }}>
        {Object.entries(typeCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(selectedType === type ? null : type);
              if (query) handleSearch(query);
            }}
            style={{
              padding: '5px 12px',
              background: selectedType === type ? (typeColors[type] || 'var(--rust-accent)') : 'transparent',
              border: `1px solid ${selectedType === type ? 'transparent' : 'var(--cream-dark)'}`,
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: selectedType === type ? 'white' : 'var(--ink-muted)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (selectedType !== type) { e.currentTarget.style.borderColor = typeColors[type] || 'var(--rust-accent)'; e.currentTarget.style.color = typeColors[type] || 'var(--rust-accent)'; }}}
            onMouseLeave={e => { if (selectedType !== type) { e.currentTarget.style.borderColor = 'var(--cream-dark)'; e.currentTarget.style.color = 'var(--ink-muted)'; }}}
          >
            {type} ({count})
          </button>
        ))}
      </div>

      {hasSearched && (
        <div style={{ marginTop: '16px' }}>
          {results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {results.slice(0, 15).map((result, i) => (
                <Link
                  key={i}
                  href={result.link || `/explore?search=${encodeURIComponent(result.label)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--paper-white)',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: '1px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = typeColors[result.type] || 'var(--rust-accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-dark)'}
                  >
                    <span style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '7px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: typeColors[result.type] || 'var(--rust-accent)',
                      padding: '2px 6px',
                      border: `1px solid ${typeColors[result.type] || 'var(--rust-accent)'}`,
                      borderRadius: '1px',
                      flexShrink: 0,
                    }}>
                      {result.type}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-inter), system-ui, sans-serif',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--ink-black)',
                      }}>
                        {result.label}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-inter), system-ui, sans-serif',
                        fontSize: '11px',
                        color: 'var(--ink-muted)',
                        marginTop: '1px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {result.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '13px',
              color: 'var(--ink-muted)',
              fontStyle: 'italic',
              backgroundColor: 'var(--paper-white)',
              border: '1px solid var(--cream-dark)',
              borderRadius: '2px',
            }}>
              No results found for &ldquo;{query}&rdquo;. Try searching for a company name, industry, failure pattern, or discovery.
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div style={{
          marginTop: '12px',
          padding: '16px',
          textAlign: 'center',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '12px',
          color: 'var(--ink-muted)',
          fontStyle: 'italic',
        }}>
          Search across {SEARCH_INDEX.length} entries — companies, industries, patterns, mistakes, historical events, and discoveries
        </div>
      )}
    </div>
  );
}
