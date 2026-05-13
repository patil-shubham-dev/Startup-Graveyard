'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { StatBlock } from '@/components/ui/StatBlock';
import { ScanButton } from '@/components/ui/ScanButton';

const RECENT_FAILURES = [
  { name: 'THERANOS', burn: '$94.5B', date: 'SEP 2018' },
  { name: 'QUIBI', burn: '$1.75B', date: 'DEC 2020' },
  { name: 'JAWBONE', burn: '$930M', date: 'JUL 2017' },
  { name: 'FAST', burn: '$120M', date: 'APR 2022' },
];

export function HeroSection({ stats }: { stats?: { totalCases: number, totalBurned: number } }) {
  const [failureIndex, setFailureIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFailureIndex((prev) => (prev + 1) % RECENT_FAILURES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const formattedBurned = stats 
    ? stats.totalBurned >= 1000 
      ? `$${(stats.totalBurned / 1000).toFixed(1)}B` 
      : `$${stats.totalBurned}M`
    : '$48.2B';

  const formattedCases = stats ? stats.totalCases.toLocaleString() : '1,024';

  return (
    <section className="relative h-[calc(100vh-88px)] flex items-center overflow-hidden select-none px-6">
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        {/* Left: Content (55%) */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <span className="font-mono text-[10px] tracking-[0.25em] text-violet-500 font-bold uppercase">
              FORENSIC_INTELLIGENCE_UNIT // EST_2020
            </span>
          </div>
          
          <h1 className="hero-title mb-6 max-w-[500px]">
            Analyze the <br />
            <span className="text-violet-600">Billion-Dollar</span> <br />
            Mistakes.
          </h1>

          <p className="text-text-muted text-[13px] leading-relaxed max-w-[420px] mb-8">
            The world's most comprehensive forensic database of startup failures. 
            Pressure-test your idea before the market does. Institutional prestige with a sharp edge.
          </p>

          <div className="flex items-center gap-4 mb-10">
            <ScanButton href="/explore" label="ACCESS ARCHIVES" />
            <ScanButton href="/pre-mortem" label="RUN PRE-MORTEM" variant="secondary" />
          </div>

          {/* Stats Row Integrated Below CTAs */}
          <div className="flex items-center gap-8 py-6 border-t border-border-subtle max-w-[600px]">
            <StatBlock value={formattedCases} label="CASES" />
            <div className="w-[1px] h-10 bg-border-subtle" />
            <StatBlock value={formattedBurned} label="BURN" />
            <div className="w-[1px] h-10 bg-border-subtle" />
            <StatBlock value="300+" label="LESSONS" />
            <div className="w-[1px] h-10 bg-border-subtle" />
            <StatBlock value="24/7" label="STATUS" />
          </div>
        </div>

        {/* Right: Intelligence Widget (45%) */}
        <div className="relative group flex justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[420px] glass-dossier p-6 rounded-[2px] border-border-strong shadow-2xl relative"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="block font-mono text-[9px] text-text-muted tracking-widest uppercase mb-2">LIVE_TRANSCRIPT</span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={failureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col"
                  >
                    <span className="font-header text-xl text-text-primary mb-1">{RECENT_FAILURES[failureIndex].name}</span>
                    <span className="font-mono text-[10px] text-violet-500">{RECENT_FAILURES[failureIndex].burn} LIQUIDATED</span>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="px-2 py-1 border border-violet-500/30 bg-violet-500/5 rounded-[1px]">
                <span className="font-mono text-[9px] text-violet-400 font-bold animate-pulse">RECORDING...</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase">MARKET_VOLATILITY</span>
                  <span className="font-mono text-[10px] text-red-500">HIGH_RISK</span>
                </div>
                <div className="h-12 w-full bg-black/40 border border-border-subtle overflow-hidden">
                  <svg viewBox="0 0 100 40" className="w-full h-full stroke-violet-600/60 fill-none" preserveAspectRatio="none">
                    <path d="M0,35 Q5,10 10,30 T20,15 T30,35 T40,20 T50,30 T60,10 T70,35 T80,20 T90,30 T100,5" strokeWidth="1" />
                  </svg>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border-subtle">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block font-mono text-[8px] text-text-muted uppercase mb-1">VECTOR_ID</span>
                    <span className="block font-mono text-[10px] text-text-primary">SG-X-9012</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[8px] text-text-muted uppercase mb-1">CLASSIFICATION</span>
                    <span className="block font-mono text-[10px] text-text-primary italic">TOP_SECRET</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Corner Decor */}
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-violet-600" />
            <div className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-violet-600" />
            <div className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b border-l border-violet-600" />
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-violet-600" />
          </motion.div>
          
          <div className="absolute inset-0 bg-violet-600/5 blur-[100px] -z-10" />
        </div>
      </div>
    </section>
  );
}

function DataBadge({ label, variant }: { label: string, variant: 'amber' | 'violet' }) {
  return (
    <div className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] font-bold tracking-wider border ${
      variant === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    }`}>
      {label}
    </div>
  );
}
