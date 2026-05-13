'use client';

import { IntelKicker } from '@/components/ui/IntelKicker';
import { ScanButton } from '@/components/ui/ScanButton';

export function PreMortemCTA() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 py-6 border-t border-border-subtle flex justify-center">
      <div className="w-full max-w-[400px] bg-bg-surface border border-border-subtle p-8 rounded-[2px] text-center relative overflow-hidden group">
        <div className="relative z-10">
          <span className="font-mono text-[10px] text-red-500 tracking-widest uppercase block mb-4">CRITICAL_WARNING</span>
          
          <h2 className="font-header text-[36px] leading-[0.9] text-text-primary mb-6">
            YOUR_STARTUP_IS_NOT <br/>
            <span className="text-red-600 italic">IMMORTAL.</span>
          </h2>

          <p className="text-text-muted text-[12px] mb-8 leading-relaxed">
            Simulate your collapse. Identify fatal contradictions in your unit economics before the market executes them.
          </p>

          <ScanButton href="/pre-mortem" label="INITIATE DIAGNOSTIC" className="w-full" />
        </div>

        {/* Subtle Hazard Border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600/20 via-red-600/40 to-red-600/20" />
      </div>
    </section>
  );
}
