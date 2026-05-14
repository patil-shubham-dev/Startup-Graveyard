import React from 'react';

interface StatBlockProps {
  value: string;
  label: string;
  accent?: boolean;
  className?: string;
}

export function StatBlock({ value, label, accent = false, className = '' }: StatBlockProps) {
  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      <span className={`metric-value mb-2 font-sans text-[clamp(28px,3vw,40px)] font-semibold leading-none ${accent ? 'text-[#d8b17b]' : 'text-text-primary'}`}>
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
        {label.replace(/\s+/g, '_')}
      </span>
    </div>
  );
}
