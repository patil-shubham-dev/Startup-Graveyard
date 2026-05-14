'use client';

import { useEffect, useRef, useState } from 'react';

interface StatsBarProps {
  totalCases: number;
  totalBurned: number;
  avgLifespan: string | number;
  patternCount: number;
}

function formatBig(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function useCountUp(target: number, duration = 1200, isVisible: boolean) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || startedRef.current || target === 0) return;
    startedRef.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isVisible, target, duration]);

  return count;
}

function StatItem({
  label,
  rawValue,
  displayValue,
  isVisible,
}: {
  label: string;
  rawValue: number;
  displayValue?: string;
  isVisible: boolean;
}) {
  const count = useCountUp(rawValue, 1200, isVisible);
  const shown = displayValue ?? String(count);

  return (
    <div
      style={{
        flex: 1,
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: '700',
          lineHeight: 1,
          color: 'var(--ink-black)',
          letterSpacing: '-0.02em',
        }}
      >
        {shown}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '9px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--ink-muted)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function StatsBar({ totalCases, totalBurned, avgLifespan, patternCount }: StatsBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const burnedNum = totalBurned;
  const lifespanNum = parseFloat(String(avgLifespan)) || 0;

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        backgroundColor: 'var(--cream-deep)',
        borderTop: '1.5px dashed var(--cream-dark)',
        borderBottom: '1.5px dashed var(--cream-dark)',
      }}
    >
      <div
        className="sg-container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
        }}
      >
        {/* Stat 1: Published Cases */}
        <StatItem
          label="PUBLISHED CASES"
          rawValue={totalCases}
          isVisible={isVisible}
        />

        {/* Divider */}
        <div style={{ width: '1.5px', background: 'var(--cream-dark)', margin: '16px 0', flexShrink: 0 }} />

        {/* Stat 2: Capital Lost */}
        <StatItem
          label="CAPITAL LOST"
          rawValue={burnedNum}
          displayValue={isVisible ? formatBig(burnedNum) : '$0'}
          isVisible={isVisible}
        />

        {/* Divider */}
        <div style={{ width: '1.5px', background: 'var(--cream-dark)', margin: '16px 0', flexShrink: 0 }} />

        {/* Stat 3: Avg Lifespan */}
        <StatItem
          label="AVG. LIFESPAN (YRS)"
          rawValue={Math.round(lifespanNum * 10)}
          displayValue={isVisible ? `${lifespanNum.toFixed(1)} YRS` : '0 YRS'}
          isVisible={isVisible}
        />

        {/* Divider */}
        <div style={{ width: '1.5px', background: 'var(--cream-dark)', margin: '16px 0', flexShrink: 0 }} />

        {/* Stat 4: Failure Patterns */}
        <StatItem
          label="FAILURE PATTERNS"
          rawValue={patternCount}
          isVisible={isVisible}
        />
      </div>
    </div>
  );
}
