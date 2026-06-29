'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { LeaderboardItem } from '@/lib/db/insights-data';

interface Props {
  items: LeaderboardItem[];
  hasData: boolean;
}

const METRICS = [
  'Capital Destruction',
  'Fastest Collapses',
  'Longest Slow Deaths',
  'Largest Layoffs',
  'Most Repeated Mistakes',
  'Most Expensive Pivots',
  'Most Overvalued Failures',
] as const;

type Metric = typeof METRICS[number];

const metricColors: Record<string, string> = {
  'Capital Destruction': 'var(--failed-red)',
  'Fastest Collapses': 'var(--rust-accent)',
  'Longest Slow Deaths': 'var(--ink-muted)',
  'Largest Layoffs': '#7C3AED',
  'Most Repeated Mistakes': 'var(--ochre-signal)',
  'Most Expensive Pivots': 'var(--sage-neutral)',
  'Most Overvalued Failures': '#980002',
};

export default function FailureLeaderboards({ items, hasData }: Props) {
  const [activeMetric, setActiveMetric] = useState<Metric>('Capital Destruction');

  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.metric === activeMetric)
      .slice(0, 10);
  }, [items, activeMetric]);

  if (!hasData || !items.length) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        backgroundColor: 'var(--cream-deep)',
        border: '1.5px dashed var(--cream-dark)',
        borderRadius: '2px',
      }}>
        <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)', marginBottom: '8px' }}>
          INSUFFICIENT ARCHIVE DATA
        </div>
        <p style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '13px', color: 'var(--ink-muted)' }}>
          Add more case studies to populate failure leaderboards.
        </p>
      </div>
    );
  }

  const metricCounts = METRICS.map(m => ({
    metric: m,
    count: items.filter(i => i.metric === m).length,
  }));

  const activeColor = metricColors[activeMetric] || 'var(--rust-accent)';

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '28px',
        overflowX: 'auto',
        paddingBottom: '4px',
        flexWrap: 'wrap',
      }}>
        {metricCounts.map(({ metric, count }) => (
          <button
            key={metric}
            onClick={() => setActiveMetric(metric as Metric)}
            style={{
              padding: '8px 16px',
              background: activeMetric === metric ? metricColors[metric] || 'var(--rust-accent)' : 'transparent',
              border: `1px solid ${activeMetric === metric ? 'transparent' : 'var(--cream-dark)'}`,
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: activeMetric === metric ? 'white' : 'var(--ink-muted)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (activeMetric !== metric) { e.currentTarget.style.borderColor = metricColors[metric] || 'var(--rust-accent)'; e.currentTarget.style.color = metricColors[metric] || 'var(--rust-accent)'; }}}
            onMouseLeave={e => { if (activeMetric !== metric) { e.currentTarget.style.borderColor = 'var(--cream-dark)'; e.currentTarget.style.color = 'var(--ink-muted)'; }}}
          >
            {metric}
            <span style={{ marginLeft: '6px', opacity: 0.7, fontFamily: 'var(--font-dm-mono), monospace' }}>{count}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filteredItems.map((item, i) => (
          <Link key={`${item.metric}-${item.rank}`} href={item.slug ? `/case/${item.slug}` : '#'} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr auto',
              gap: '14px',
              alignItems: 'center',
              padding: '12px 18px',
              backgroundColor: 'var(--paper-white)',
              border: '1.5px dashed var(--cream-dark)',
              borderLeft: `3px solid ${i < 3 ? activeColor : 'transparent'}`,
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = activeColor; e.currentTarget.style.backgroundColor = 'var(--cream-deep)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cream-dark)'; e.currentTarget.style.backgroundColor = 'var(--paper-white)'; }}
            >
              <div style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '13px',
                fontWeight: '600',
                color: i < 3 ? activeColor : 'var(--ink-muted)',
                textAlign: 'center',
              }}>
                <span className="t-num">{item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : `#${item.rank}`}</span>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--ink-black)',
                  lineHeight: 1.3,
                }}>
                  {item.company}
                </div>
                {item.industry && (
                  <div style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '8px',
                    color: 'var(--ink-muted)',
                    marginTop: '2px',
                  }}>
                    {item.industry}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="t-num" style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeColor,
                  lineHeight: 1,
                }}>
                  {item.displayValue}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '13px',
          color: 'var(--ink-muted)',
          fontStyle: 'italic',
          border: '1.5px dashed var(--cream-dark)',
          borderRadius: '2px',
        }}>
          No entries for this leaderboard yet.
        </div>
      )}
    </div>
  );
}
