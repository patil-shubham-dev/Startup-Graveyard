import React from 'react';

interface DataBadgeProps {
  label: string;
  variant?: 'amber' | 'red' | 'green' | 'violet' | 'ghost';
  className?: string;
}

export function DataBadge({ label, variant = 'amber', className = '' }: DataBadgeProps) {
  const variants = {
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    ghost: 'bg-white/5 text-text-muted border-white/10',
  };

  return (
    <span className={`px-2 py-0.5 rounded-sm border font-mono text-[9px] uppercase tracking-wider ${variants[variant]} ${className}`}>
      {label}
    </span>
  );
}
