'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/index';

interface LogoImageProps {
  src?: string | null;
  name: string;
  className?: string;
  /** Show company initial as fallback before 'Logo Not Found' */
  showInitial?: boolean;
}

/** Derive a Clearbit URL from a company name */
function deriveClearbitUrl(name: string, src?: string | null): string | null {
  if (src) return src;
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9 .-]/g, '')
    .replace(/\.(com|io|ai|co|org|net)$/i, '')
    .trim()
    .replace(/\s+/g, '');
  if (!base || base.length < 2) return null;
  return `https://logo.clearbit.com/${base}.com`;
}

/**
 * Startup logo with 3-tier fallback:
 *   1. Provided src → Clearbit auto-derive → "Logo Not Found" placeholder
 *   2. Fixed 1:1 square aspect ratio
 *   3. Grayscale filter for forensic archive aesthetic
 */
export const LogoImage = ({
  src,
  name,
  className,
  showInitial = true,
}: LogoImageProps) => {
  const [error, setError] = useState(false);

  const imgSrc = error ? null : deriveClearbitUrl(name, src);

  // Final fallback: "Logo Not Found" placeholder
  if (!imgSrc) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-[var(--cream-deep)] border border-[var(--cream-dark)] select-none",
          className
        )}
        style={{ aspectRatio: '1 / 1' }}
        title={`${name} — Logo Not Found`}
      >
        {showInitial ? (
          <span className="font-mono text-xs font-bold text-[var(--ink-muted)] uppercase leading-none">
            {name.substring(0, 2).toUpperCase()}
          </span>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--cream-dark)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-50"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="font-mono text-[6px] text-[var(--cream-dark)] uppercase tracking-[0.05em] leading-none mt-0.5">
              No Logo
            </span>
          </div>
        )}
      </div>
    );
  }

  // Logo found — render with grayscale filter
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white border border-[var(--cream-dark)]",
        className
      )}
      style={{ aspectRatio: '1 / 1' }}
    >
      <img
        src={imgSrc}
        alt={`${name} logo`}
        loading="lazy"
        className="w-full h-full object-contain p-1 filter grayscale contrast-125"
        onError={() => setError(true)}
      />
    </div>
  );
};
