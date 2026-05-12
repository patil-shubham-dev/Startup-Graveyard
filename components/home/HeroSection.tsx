'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-32">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-radial-at-c from-violet-primary/5 via-transparent to-transparent opacity-40" />
        <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F1F2E" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        
        {/* Animated Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              scale: [1, 1.2, 1],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 4 + Math.random() * 4, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-amber-signal rounded-full shadow-[0_0_8px_#F59E0B]"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-[920px]"
      >
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Startup Graveyard" className="h-24 w-auto mb-8 filter invert brightness-200" />
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-violet-primary/10 border border-violet-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-primary"></span>
            </span>
            <span className="font-mono text-[10px] text-violet-primary uppercase tracking-[3px] font-bold">
              V4 PRO INTELLIGENCE ACTIVE
            </span>
          </div>
        </div>
        
        <h1 className="font-display text-[48px] md:text-[88px] font-bold leading-[0.95] mb-8 text-text-primary tracking-tighter">
          Master the art of <br />
          <span className="hero-gradient italic">not failing.</span>
        </h1>
        
        <p className="text-text-secondary text-lg md:text-xl max-w-[640px] mx-auto mb-12 leading-relaxed font-body">
          The world's most comprehensive database of startup autopsies. 
          Deconstruct a thousand failures to build one lasting success.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/explore" 
            className="w-full sm:w-auto px-10 py-4 bg-violet-primary hover:bg-violet-hover active:bg-violet-dim text-white font-mono text-[12px] uppercase tracking-[2px] font-bold rounded-lg shadow-violet-glow transition-all duration-300"
          >
            Access Archives
          </Link>
          <Link 
            href="/pre-mortem" 
            className="w-full sm:w-auto px-10 py-4 bg-bg-surface-2 border border-border-subtle hover:border-violet-primary text-text-secondary hover:text-text-primary font-mono text-[12px] uppercase tracking-[2px] font-bold rounded-lg transition-all duration-300"
          >
            Run Pre-Mortem
          </Link>
        </div>
      </motion.div>

      {/* Hero Stats */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12"
      >
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">CASES</span>
          <span className="font-mono text-lg text-text-primary">1,024</span>
        </div>
        <div className="h-8 w-[1px] bg-border-subtle" />
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">CAPITAL DECAY</span>
          <span className="font-mono text-lg text-text-primary">$48.2B</span>
        </div>
        <div className="h-8 w-[1px] bg-border-subtle" />
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">SUCCESS RATE</span>
          <span className="font-mono text-lg text-amber-signal">0.02%</span>
        </div>
      </motion.div>
    </section>
  );
}
