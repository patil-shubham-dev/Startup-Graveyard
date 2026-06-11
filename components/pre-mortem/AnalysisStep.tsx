'use client';

import { motion } from 'framer-motion';

export function AnalysisStep() {
  return (
    <motion.div
      key="step-analysis"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[480px] mx-auto w-full flex flex-col items-center justify-center text-center gap-5 min-h-[280px] overflow-hidden"
    >
      <div className="relative w-16 h-16 shrink-0">
        <div className="absolute inset-0 border-[3px] border-dashed border-[#DDD3C5] rounded-full animate-spin" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-[6px] border-2 border-[#D35A22]/40 rounded-full animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center font-display-serif font-bold text-[16px] text-[#111111]">
          SG
        </div>
      </div>

      <div className="flex flex-col gap-1.5 shrink-0">
        <h2 className="font-display-serif text-[25px] font-bold italic text-[#111111] leading-none">
          Compiling Forensic Verdict
        </h2>
        <p className="text-[13px] text-[#6D655B] leading-relaxed max-w-[320px] font-sans">
          Graveyard Keeper AI is processing responses against historical startup death spirals...
        </p>
      </div>

      <div className="flex flex-col gap-1.5 w-full bg-[#FCFAF6] border border-[#DDD3C5] p-3.5 rounded-[16px] shadow-sm shrink-0">
        {[
          { label: 'SCANNING VECTORS', time: '120ms' },
          { label: 'MAPPING RISK COEFFICIENTS', time: '230ms' },
          { label: 'COMPARING HISTORICAL AUTOPSIES', time: 'ACTIVE' }
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-[9.5px] font-monospace tracking-wider border-b border-[#DDD3C5]/20 last:border-0 pb-1.5 last:pb-0 leading-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D35A22] animate-pulse" />
              <span className="text-[#111111] font-bold">{item.label}</span>
            </div>
            <span className={item.time === 'ACTIVE' ? 'text-[#D35A22] font-bold animate-pulse' : 'text-[#9A9187]'}>
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
