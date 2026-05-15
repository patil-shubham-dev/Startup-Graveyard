'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface ForensicRadarProps {
  scores: Record<string, number>;
}

export function ForensicRadar({ scores }: ForensicRadarProps) {
  const data = Object.entries(scores).map(([key, value]) => ({
    subject: key.replace(/_/g, ' '),
    A: value * 100,
    fullMark: 100,
  }));

  if (data.length === 0) return null;

  return (
    <div className="glass-dossier p-8 rounded-[2px] border-border-strong bg-cream-deep/30">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-mono text-[10px] text-ink-muted tracking-[0.2em] uppercase">RISK_SIGNATURE_ANALYSIS</h3>
        <span className="text-[9px] font-mono text-rust-accent px-2 py-0.5 border border-rust-accent/30 rounded-full">HIGH_FIDELITY</span>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="var(--cream-dark)" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'var(--ink-soft)', fontSize: 9, fontFamily: 'var(--font-dm-mono)' }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Risk Level"
              dataKey="A"
              stroke="var(--rust-accent)"
              fill="var(--rust-accent)"
              fillOpacity={0.4}
              strokeWidth={2}
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
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-cream-dark/50 flex flex-wrap gap-4">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rust-accent/60" />
            <span className="font-mono text-[9px] text-ink-muted uppercase">{d.subject}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
