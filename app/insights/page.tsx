import { InsightsCharts } from '@/components/insights/InsightsCharts';
import { getInsightsData } from '@/lib/db/case-studies';
import { formatCurrency } from '@/lib/utils/format';

export const revalidate = 86400;
export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const data = await getInsightsData();

  const kpis = [
    { label: 'LIQUIDATIONS', value: data.totalCases.toLocaleString() },
    { label: 'CAPITAL_BURNED', value: formatCurrency(data.totalBurned) },
    { label: 'AVG_LIFESPAN', value: `${data.avgLifespan} YRS` },
    { label: 'PATTERNS_IDENTIFIED', value: String(data.patternCount) },
  ];

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
          padding: '48px 0 36px',
        }}
      >
        <div className="sg-container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--rust-accent)',
              }}
            >
              SYSTEMIC_ANALYSIS // V.02
            </span>
            <div
              style={{
                width: '1px',
                height: '12px',
                backgroundColor: 'var(--cream-dark)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--ink-muted)',
              }}
            >
              FILES_ANALYZED: {data.totalCases.toLocaleString()}
            </span>
          </div>
          <h1 className="t-h1">Failure Insights.</h1>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div
        style={{
          borderBottom: '1.5px dashed var(--cream-dark)',
          backgroundColor: 'var(--cream-base)',
        }}
      >
        <div
          className="sg-container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch',
          }}
        >
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '32px 24px',
                borderLeft: i > 0 ? '1.5px dashed var(--cream-dark)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  fontWeight: '700',
                  lineHeight: 1,
                  color: 'var(--ink-black)',
                  letterSpacing: '-0.02em',
                }}
              >
                {kpi.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--ink-muted)',
                }}
              >
                {kpi.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="sg-container section-pad">
        <InsightsCharts
          failureData={data.failureData}
          fundingTrends={data.fundingTrends}
        />

        {/* Forensic Patterns */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--rust-accent)',
              }}
            >
              SURVIVAL_HEURISTICS
            </span>
            <div style={{ height: '1px', flex: 1, background: 'var(--cream-dark)' }} />
          </div>

          <h2 className="t-h2" style={{ marginBottom: '40px', maxWidth: '18ch' }}>
            Forensic Patterns.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {[
              {
                title: 'The Blitzscaling Trap',
                desc: 'Series B within 12 months of Series A increases failure risk 4×. Speed without foundation is a liability.',
                stat: '42% HIGHER RISK',
                code: 'VEC-882',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L10 10M10 10L6 7M10 10L14 7" stroke="var(--ochre-signal)" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M4 14h12" stroke="var(--cream-dark)" strokeWidth="1" strokeDasharray="2 2"/>
                    <circle cx="10" cy="17" r="1.5" fill="var(--ochre-signal)"/>
                  </svg>
                ),
              },
              {
                title: 'Solo Founder Fragility',
                desc: 'Solo ventures are 30% more likely to cite burnout as a root cause. Accountability gaps compound in isolation.',
                stat: '31% MORE BURNOUT',
                code: 'VEC-914',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3" stroke="var(--ochre-signal)" strokeWidth="1.5"/>
                    <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--cream-dark)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="14" y1="12" x2="18" y2="12" stroke="var(--rust-accent)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                title: 'The Pivot Deadline',
                desc: 'More than 3 pivots without $1M ARR predicts failure by year 4. Strategic drift accelerates collapse.',
                stat: 'AVG. 3.2 PIVOTS',
                code: 'VEC-441',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 10h14M14 7l3 3-3 3" stroke="var(--ochre-signal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 5l-3 3 3 3" stroke="var(--cream-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
            ].map((insight) => (
              <div
                key={insight.title}
                className="chart-card"
                style={{ padding: '28px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: 'var(--rust-accent)',
                    }}
                  >
                    {insight.code}
                  </span>
                  {insight.icon}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: '22px',
                    fontWeight: '700',
                    lineHeight: 1.1,
                    color: 'var(--ink-black)',
                    marginBottom: '10px',
                  }}
                >
                  {insight.title}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-source-serif), Georgia, serif',
                    fontSize: '13px',
                    lineHeight: 1.65,
                    color: 'var(--ink-muted)',
                    marginBottom: '20px',
                  }}
                >
                  {insight.desc}
                </p>

                <div
                  style={{
                    borderTop: '1.5px dashed var(--cream-dark)',
                    paddingTop: '14px',
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '10px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--ochre-signal)',
                  }}
                >
                  {insight.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
