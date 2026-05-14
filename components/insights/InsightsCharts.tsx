'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface FailureItem {
  name: string;
  value: number;
  color?: string;
}

interface FundingTrend {
  year: string;
  amount: number;
}

interface InsightsChartsProps {
  failureData: FailureItem[];
  fundingTrends: FundingTrend[];
}

const PIE_COLORS = [
  'var(--rust-accent)',
  'var(--ochre-signal)',
  'var(--sage-neutral)',
  'var(--ink-muted)',
  '#8B7355',
  '#5C4A3A',
];

function formatBig(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

const CustomBarTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'var(--paper-white)',
          border: '1px solid var(--cream-dark)',
          borderRadius: '2px',
          padding: '8px 12px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--ink-muted)',
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--ink-black)',
          }}
        >
          {formatBig(payload[0].value)}
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'var(--paper-white)',
          border: '1px solid var(--cream-dark)',
          borderRadius: '2px',
          padding: '8px 12px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--ink-muted)',
            marginBottom: '4px',
          }}
        >
          {payload[0].name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--ink-black)',
          }}
        >
          {payload[0].value} cases
        </div>
      </div>
    );
  }
  return null;
};

export function InsightsCharts({ failureData, fundingTrends }: InsightsChartsProps) {
  const chartFailureData = failureData.length
    ? failureData
    : [
        { name: 'No Market Need', value: 42 },
        { name: 'Cash Exhaustion', value: 29 },
        { name: 'Team Fracture', value: 23 },
        { name: 'Competition', value: 19 },
        { name: 'Pricing Failure', value: 18 },
        { name: 'Regulatory', value: 16 },
      ];

  const chartFundingData = fundingTrends.length
    ? fundingTrends
    : [
        { year: '2018', amount: 2_400_000_000 },
        { year: '2019', amount: 3_200_000_000 },
        { year: '2020', amount: 5_100_000_000 },
        { year: '2021', amount: 8_700_000_000 },
        { year: '2022', amount: 6_300_000_000 },
        { year: '2023', amount: 4_100_000_000 },
      ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '48px',
      }}
      className="lg:grid-cols-2 grid-cols-1"
    >
      {/* Donut Chart — Failure distribution */}
      <div className="chart-card" style={{ padding: '28px' }}>
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--ink-muted)',
            marginBottom: '24px',
          }}
        >
          PRIMARY CAUSE DISTRIBUTION
        </div>

        <div style={{ height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartFailureData}
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartFailureData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginTop: '16px',
          }}
        >
          {chartFailureData.slice(0, 6).map((item, i) => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '1px',
                  backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart — Capital lost by year */}
      <div className="chart-card" style={{ padding: '28px' }}>
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--ink-muted)',
            marginBottom: '24px',
          }}
        >
          CAPITAL LOST BY YEAR
        </div>

        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartFundingData}
              barCategoryGap="32%"
            >
              <XAxis
                dataKey="year"
                tick={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 9,
                  fill: 'var(--ink-muted)',
                  letterSpacing: '0.1em',
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="amount"
                fill="var(--ochre-signal)"
                radius={[1, 1, 0, 0]}
                background={{ fill: 'var(--cream-dark)', radius: 1 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
