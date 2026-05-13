import React from 'react';

interface IntelKickerProps {
  label: string;
  figure?: string;
  className?: string;
}

export function IntelKicker({ label, figure, className = '' }: IntelKickerProps) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500 whitespace-nowrap">
        // {label.replace(/\s+/g, '_')}
      </span>
      {figure && (
        <>
          <div className="h-[1px] w-8 bg-border-subtle" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-ghost">
            {figure}
          </span>
        </>
      )}
    </div>
  );
}
