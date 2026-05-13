'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

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
    <div className="glass-dossier p-10 border-border-strong rounded-[4px] relative overflow-hidden h-fit">
      <div className="absolute top-0 left-0 w-[2px] h-full bg-amber-500/40" />
      
      <h3 className="font-mono text-[10px] tracking-[0.2em] text-text-ghost uppercase mb-12">FAILURE_DNA // RISK_MAP</h3>
      
      <div className="h-64 w-full mb-12">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} 
            />
            <Radar
              name="Risk"
              dataKey="A"
              stroke="#F59E0B"
              strokeWidth={1}
              fill="#F59E0B"
              fillOpacity={0.05}
              dot={{ fill: '#F59E0B', r: 2 }}
              animationDuration={1000}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {data.map((item) => (
          <div key={item.subject} className="flex flex-col">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-mono text-[9px] text-text-ghost uppercase tracking-wider">{item.subject}</span>
              <span className="font-mono text-[10px] text-text-primary font-bold">{item.A}%</span>
            </div>
            <div className="h-[2px] bg-white/[0.03] overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${item.A}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${
                  item.A > 70 ? 'bg-red-500' : item.A > 40 ? 'bg-amber-500' : 'bg-green-500'
                }`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
