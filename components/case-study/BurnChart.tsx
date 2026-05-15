'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BurnDataPoint {
  date: string;
  burn: number;
  funding: number;
}

interface BurnChartProps {
  data: {
    points: BurnDataPoint[];
    summary: string;
  };
}

export function BurnChart({ data }: BurnChartProps) {
  if (!data?.points) return null;

  const formattedData = data.points.map(p => ({
    ...p,
    displayDate: p.date.toUpperCase()
  }));

  return (
    <div className="glass-dossier p-8 rounded-[2px] border-border-strong bg-cream-deep/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <div className="text-[40px] font-bold font-mono tracking-tighter">FINANCIAL_EXHIBIT</div>
      </div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h3 className="font-mono text-[10px] text-ink-muted tracking-[0.2em] uppercase mb-1">BURN_VS_FUNDING_TRAJECTORY</h3>
          <p className="text-[11px] text-rust-accent font-serif italic">{data.summary}</p>
        </div>
        <div className="flex gap-4 items-center">
           <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-rust-accent" />
             <span className="font-mono text-[9px] text-ink-muted">BURN</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-ochre-signal" />
             <span className="font-mono text-[9px] text-ink-muted">FUNDING</span>
           </div>
        </div>
      </div>

      <div className="h-[240px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--rust-accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--rust-accent)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFunding" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--ochre-signal)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--ochre-signal)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cream-dark)" opacity={0.5} />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--ink-soft)', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--ink-soft)', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }}
              tickFormatter={(value) => `$${value}M`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--cream-base)', 
                border: '1px solid var(--cream-dark)',
                fontSize: '11px',
                fontFamily: 'var(--font-dm-mono)',
                color: 'var(--ink-black)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="burn" 
              stroke="var(--rust-accent)" 
              fillOpacity={1} 
              fill="url(#colorBurn)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="funding" 
              stroke="var(--ochre-signal)" 
              fillOpacity={1} 
              fill="url(#colorFunding)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
