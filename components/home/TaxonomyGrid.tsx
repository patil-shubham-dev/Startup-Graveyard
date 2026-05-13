'use client';

import { motion } from 'framer-motion';
import { IntelKicker } from '@/components/ui/IntelKicker';

const CATEGORIES = [
  { 
    name: 'Product-Market Fit', 
    stat: '38% OF FAILURES', 
    desc: 'Building something the market does not fundamentally require.', 
    severity: 'red',
    icon: '⊘'
  },
  { 
    name: 'Burn Rate', 
    stat: '29% OF FAILURES', 
    desc: 'Unsustainable capital deployment vs. revenue velocity.', 
    severity: 'red',
    icon: '⚡'
  },
  { 
    name: 'Competition', 
    stat: '19% OF FAILURES', 
    desc: 'Strategic displacement by incumbents or rapid-movers.', 
    severity: 'amber',
    icon: '◈'
  },
  { 
    name: 'Regulatory', 
    stat: '12% OF FAILURES', 
    desc: 'Legal non-compliance and structural oversight barriers.', 
    severity: 'amber',
    icon: '⚖'
  },
  { 
    name: 'Team Conflict', 
    stat: '9% OF FAILURES', 
    desc: 'Internal leadership collapse and vision misalignment.', 
    severity: 'amber',
    icon: '⧖'
  },
  { 
    name: 'Timing', 
    stat: '7% OF FAILURES', 
    desc: 'Premature market entry or post-trend obsolescence.', 
    severity: 'green',
    icon: '◔'
  },
  { 
    name: 'Fraud', 
    stat: '4% OF FAILURES', 
    desc: 'Deliberate deception and unethical resource diversion.', 
    severity: 'red',
    icon: '⚠'
  },
  { 
    name: 'Tech Debt', 
    stat: '3% OF FAILURES', 
    desc: 'Infrastructure collapse under rapid scaling pressure.', 
    severity: 'green',
    icon: '⌨'
  },
];

export function TaxonomyGrid({ failureData }: { failureData?: { name: string, value: number }[] }) {
  const severityColors = {
    red: 'border-red-500',
    amber: 'border-amber-500',
    green: 'border-green-500',
  };

  const total = failureData?.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 py-6 border-t border-border-subtle">
      <div className="mb-6">
        <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase block mb-1">SYSTEMIC_TAXONOMY // V.02</span>
        <h2 className="section-header">Systemic Vulnerabilities</h2>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border-subtle border border-border-subtle">
        {CATEGORIES.map((cat, i) => {
          const realStat = failureData?.find(d => d.name === cat.name);
          const percentage = realStat ? Math.round((realStat.value / total) * 100) : null;
          const displayStat = percentage !== null ? `${percentage}%_FAILURE` : cat.stat;

          return (
            <div 
              key={cat.name} 
              className="group bg-bg-base p-4 hover:bg-bg-surface transition-colors relative overflow-hidden h-[120px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-violet-500 text-sm opacity-60">{cat.icon}</span>
                <span className="font-mono text-[9px] text-text-muted tracking-widest">{displayStat}</span>
              </div>
              
              <h4 className="font-sans text-[14px] font-bold text-text-primary mb-1">
                {cat.name}
              </h4>
              
              <p className="text-text-muted text-[11px] leading-tight line-clamp-2">
                {cat.desc}
              </p>

              {/* Status Indicator */}
              <div className={`absolute bottom-0 left-0 w-full h-[2px] ${
                cat.severity === 'red' ? 'bg-red-500/30' : 
                cat.severity === 'amber' ? 'bg-amber-500/30' : 'bg-green-500/30'
              }`} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
