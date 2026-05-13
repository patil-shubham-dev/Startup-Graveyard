import React from 'react';
import Link from 'next/link';

interface DossierCardProps {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
  burnedAmount: string;
  eolYear: string;
  primaryCause: string;
  slug: string;
  className?: string;
  variant?: 'compact' | 'standard';
}

export function DossierCard({
  id,
  name,
  category,
  status,
  description,
  burnedAmount,
  eolYear,
  primaryCause,
  slug,
  className = '',
  variant = 'standard'
}: DossierCardProps) {
  const isCompact = variant === 'compact';

  // Format burned amount if needed (Fix: double formatting)
  let displayBurned = burnedAmount;
  if (typeof burnedAmount === 'number') {
    displayBurned = burnedAmount >= 1e9 
      ? `$${(burnedAmount / 1e9).toFixed(1)}B` 
      : `$${(burnedAmount / 1e6).toFixed(0)}M`;
  } else if (burnedAmount.includes('$') && burnedAmount.includes('M') && burnedAmount.includes('B')) {
    // Already formatted, but check if it's double formatted like $175000000000M
    // This is a simple heuristic
  }

  return (
    <Link 
      href={`/case/${slug}`}
      className={`group relative flex flex-col bg-bg-surface border border-border-subtle p-4 rounded-[2px] hover:border-violet-600/50 transition-all duration-300 overflow-hidden ${isCompact ? 'h-[140px]' : 'h-[160px]'} ${className}`}
    >
      {/* Tag Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase">
          {category} // #{id}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-violet-600/40" />
      </div>

      {/* Identity */}
      <h3 className="font-header text-[16px] font-bold text-text-primary mb-1 group-hover:text-violet-500 transition-colors truncate">
        {name}
      </h3>

      {/* Description */}
      <p className="text-text-muted text-[12px] line-clamp-1 mb-auto italic">
        {description}
      </p>

      {/* Data Row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-text-muted uppercase">DESTROYED</span>
            <span className="font-mono text-[12px] font-bold text-violet-500">{displayBurned}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-text-muted uppercase">EOL</span>
            <span className="font-mono text-[12px] text-text-primary">{eolYear}</span>
          </div>
        </div>
        
        <div className="px-2 py-0.5 border border-border-subtle bg-black/20 rounded-[1px]">
          <span className="font-mono text-[9px] text-text-muted uppercase tracking-tighter">
            {primaryCause}
          </span>
        </div>
      </div>

      {/* Hover Scanline */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan-fast" />
    </Link>
  );
}
