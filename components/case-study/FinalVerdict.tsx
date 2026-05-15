'use client';

import { motion } from 'framer-motion';

interface FinalVerdictProps {
  status: string;
}

export function FinalVerdict({ status = 'CASE_CLOSED' }: FinalVerdictProps) {
  return (
    <div className="mt-32 py-20 flex flex-col items-center justify-center border-t border-cream-dark/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="text-[120px] font-bold font-mono tracking-tighter whitespace-nowrap -rotate-12 translate-y-10">
          CONFIDENTIAL_DATA_RESTORED_BY_SG_FORENSICS
        </div>
      </div>

      <div className="relative text-center">
        <p className="font-mono text-[10px] text-ink-ghost tracking-[0.3em] uppercase mb-12">END_OF_DOSSIER</p>
        
        <motion.div
          initial={{ scale: 2.5, opacity: 0, rotate: -20 }}
          whileInView={{ scale: 1, opacity: 1, rotate: -15 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 15,
            delay: 0.2
          }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative inline-block"
        >
          {/* The Stamp */}
          <div className="border-[6px] border-rust-accent px-12 py-6 rounded-[4px] relative">
            {/* Ink bleed effect */}
            <div className="absolute inset-0 border-[6px] border-rust-accent blur-[1px] opacity-60 rounded-[4px]" />
            
            <span className="font-mono text-5xl font-black text-rust-accent tracking-tighter uppercase relative z-10">
              {status.replace(/_/g, ' ')}
            </span>

            {/* Rough texture overlay */}
            <div className="absolute inset-0 mix-blend-screen opacity-40 pointer-events-none" 
                 style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
          </div>

          {/* Date Stamp */}
          <div className="absolute -bottom-10 right-0">
             <p className="font-mono text-[9px] text-rust-accent/70 font-bold">
               FILED: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
             </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-24 max-w-[500px] text-center">
        <p className="text-[13px] text-ink-muted leading-relaxed italic">
          "The archives never lie. We only fail to read them."
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-cream-dark" />
          <div className="w-1 h-1 rounded-full bg-cream-dark" />
          <div className="w-1 h-1 rounded-full bg-cream-dark" />
        </div>
      </div>
    </div>
  );
}
