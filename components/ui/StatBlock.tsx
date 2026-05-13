import React from 'react';

interface StatBlockProps {
  value: string;
  label: string;
  accent?: boolean;
  className?: string;
}

export function StatBlock({ value, label, accent = false, className = '' }: StatBlockProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`font-sans text-[32px] font-bold leading-none mb-2 ${accent ? 'text-violet-600' : 'text-text-primary'}`}>
        {value}
      </span>
      <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
        {label.replace(/\s+/g, '_')}
      </span>
    </div>
  );
}
