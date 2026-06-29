'use client';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { formatCurrencyCompact } from '@/lib/utils/format';

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  prefix?: string;
}

const CustomTooltip = ({ active, payload, label, prefix = '$' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ink-black border border-ink-muted/30 p-3 shadow-2xl rounded-sm">
        <p className="t-label text-cream-base mb-1">{label}</p>
        <p className="t-h3 text-rust-accent text-lg">
          {prefix}{typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

interface ChartDataPoint {
  date: string;
  amount?: number;
  count?: number;
}

interface FundingChartProps {
  data: ChartDataPoint[];
}

export const FundingChart = ({ data }: FundingChartProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[350px] chart-card p-8">
      <h4 className="t-label mb-8 text-ink-muted flex items-center justify-between">
        <span>Capital Injection Timeline</span>
        <span className="text-[10px] opacity-50">UNIT: USD</span>
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorFunding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--rust-accent)" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="var(--rust-accent)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(217, 207, 192, 0.2)" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
            tickFormatter={(value) => `$${formatCurrencyCompact(value)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="var(--rust-accent)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorFunding)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface HeadcountChartProps {
  data: ChartDataPoint[];
}

export const HeadcountChart = ({ data }: HeadcountChartProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[350px] chart-card p-8">
      <h4 className="t-label mb-8 text-ink-muted flex items-center justify-between">
        <span>Headcount Expansion / Contraction</span>
        <span className="text-[10px] opacity-50">UNIT: EMPLOYEES</span>
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(217, 207, 192, 0.2)" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
          />
          <Tooltip content={<CustomTooltip prefix="" />} />
          <Bar dataKey="count" animationDuration={2000}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === data.length - 1 ? 'var(--failed-red)' : 'var(--ink-soft)'} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
