'use client';

import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s <= 40) return '#10B981'; // green
    if (s <= 70) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          {/* Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="var(--color-border-subtle)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Fill Arc */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[36px] font-medium" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className="mt-4 font-body text-[11px] text-text-muted uppercase tracking-widest">
        OVERALL RISK
      </span>
    </div>
  );
}
