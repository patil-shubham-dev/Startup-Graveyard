"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Format = "int" | "currency" | "pct" | "years";

const FORMATTERS: Record<Format, (v: number) => string> = {
  int: (v) => v.toLocaleString("en-US"),
  currency: (v) => {
    if (v >= 1e12) return `$${+(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${+(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${+(v / 1e6).toFixed(0)}M`;
    if (v >= 1e3) return `$${+(v / 1e3).toFixed(0)}K`;
    return `$${v}`;
  },
  pct: (v) => `${Math.round(v)}%`,
  years: (v) => `${Math.round(v)} yrs`,
};

interface CountUpProps {
  value: number;
  format?: Format;
  duration?: number;
  className?: string;
}

/** Counts upward once when scrolled into view; renders final value instantly
 *  under prefers-reduced-motion and for non-numeric needs. */
export function CountUp({
  value,
  format = "int",
  duration = 1.3,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const formatter = FORMATTERS[format];
  const [display, setDisplay] = useState(() => formatter(0));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: reduced ? 0.001 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(formatter(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, value, reduced, duration, formatter]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
