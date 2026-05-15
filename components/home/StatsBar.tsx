'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCurrencyCompact } from '@/lib/utils/format';

interface StatsBarProps {
  totalCases: number;
  totalBurned: number;
  avgLifespan: string | number;
  patternCount: number;
}


function useCountUp(target: number, duration = 1400, isVisible: boolean) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || startedRef.current || target === 0) return;
    startedRef.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
  const count = useCountUp(rawValue, 1400, isVisible);
  const shown = displayValue ?? String(count);

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        textAlign: 'center',
      }}
    >
      <div
        className="t-num"
        style={{
          fontSize: 'clamp(28px, 3.5vw, 44px)',
          fontWeight: '600',
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
          fontSize: '8.5px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'var(--ink-muted)',
          whiteSpace: 'nowrap',
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
      { threshold: 0.4 }
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
        borderTop: '1px solid var(--cream-dark)',
        borderBottom: '1px solid var(--cream-dark)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fine dashed accent lines */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.4,
          backgroundImage: 'repeating-linear-gradient(90deg, var(--cream-dark) 0, var(--cream-dark) 1px, transparent 1px, transparent 25%)',
          backgroundSize: '25% 100%',
        }}
      />

      <div
        className="sg-container"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'stretch',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <StatItem label="PUBLISHED CASES" rawValue={totalCases} isVisible={isVisible} />
        <div style={{ width: '1px', background: 'var(--cream-dark)', margin: '16px 0', flexShrink: 0 }} />
        <StatItem
          label="CAPITAL LOST"
          rawValue={burnedNum}
          displayValue={isVisible ? formatCurrencyCompact(burnedNum) : '$0'}
          isVisible={isVisible}
        />
        <div style={{ width: '1px', background: 'var(--cream-dark)', margin: '16px 0', flexShrink: 0 }} />
        <StatItem
          label="AVG. LIFESPAN (YRS)"
          rawValue={Math.round(lifespanNum * 10)}
          displayValue={isVisible ? `${lifespanNum.toFixed(1)} YRS` : '0 YRS'}
          isVisible={isVisible}
        />
        <div style={{ width: '1px', background: 'var(--cream-dark)', margin: '16px 0', flexShrink: 0 }} />
        <StatItem label="FAILURE PATTERNS" rawValue={patternCount} isVisible={isVisible} />
      </div>
    </div>
  );
}
