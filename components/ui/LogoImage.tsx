'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/index';

export const LogoImage = ({ 
  src, 
  name, 
  className 
}: { 
  src?: string | null; 
  name: string; 
  className?: string 
}) => {
  const [error, setError] = useState(false);

  // Fallback to Clearbit if no src provided, or if src fails
  const clearbitUrl = `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com`;
  const displaySrc = error ? null : (src || clearbitUrl);

  if (!displaySrc || error) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-ink-black text-cream-base font-bold rounded-sm border border-cream-dark/20",
        className
      )}>
        {name.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-white p-1 rounded-sm border border-cream-dark/20", className)}>
      <img
        src={displaySrc}
        alt={`${name} logo`}
        className="w-full h-full object-contain filter grayscale contrast-125"
        onError={() => setError(true)}
      />
    </div>
  );
};
