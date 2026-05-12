'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export function FailureDNA({ scores }: { scores: Record<string, number> }) {
  const data = [
    { subject: 'PMF', A: (scores || {}).pmf || 50 },
    { subject: 'BURN', A: (scores || {}).burn || 50 },
    { subject: 'COMP', A: (scores || {}).competition || 50 },
    { subject: 'EXEC', A: (scores || {}).execution || 50 },
    { subject: 'TIME', A: (scores || {}).timing || 50 },
    { subject: 'TEAM', A: (scores || {}).team || 50 },
  ];

  return (
    <div className="bg-bg-surface-1 border border-border-subtle p-8 h-fit rounded-md">
      <h3 className="font-mono text-[10px] tracking-[3px] text-text-muted uppercase mb-8">FAILURE DNA — RISK MAP</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#1F1F2E" strokeWidth={0.5} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#475569', fontSize: 10, fontFamily: 'var(--font-mono)' }} 
            />
            <Radar
              name="Risk"
              dataKey="A"
              stroke="#EF4444"
              strokeWidth={1.5}
              fill="#EF4444"
              fillOpacity={0.15}
              dot={{ fill: '#EF4444', r: 4 }}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
        {data.map((item) => (
          <div key={item.subject} className="flex flex-col">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] text-text-muted uppercase">{item.subject}</span>
              <span className="font-mono text-[10px] text-text-primary">{item.A}%</span>
            </div>
            <div className="h-[4px] bg-bg-surface-2 rounded-full overflow-hidden">
              <motion_div 
                initial={{ width: 0 }}
                whileInView={{ width: `${item.A}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  item.A > 70 ? 'bg-red-critical' : item.A > 40 ? 'bg-amber-signal' : 'bg-green-lesson'
                }`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
const motion_div = motion.div;
