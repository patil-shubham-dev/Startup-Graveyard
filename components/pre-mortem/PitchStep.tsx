'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Layers, Clock, Database, Lock } from 'lucide-react';

interface PitchStepProps {
  pitch: string;
  isGenerating: boolean;
  onPitchChange: (value: string) => void;
  onSeeExample: () => void;
  onStartInterrogation: () => void;
}

export function PitchStep({ pitch, isGenerating, onPitchChange, onSeeExample, onStartInterrogation }: PitchStepProps) {
  const canProceed = pitch.length >= 20;

  return (
    <motion.div
      key="step-pitch"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="max-w-[760px] mx-auto w-full h-full flex flex-col justify-between py-2 overflow-hidden"
    >
      <div className="flex flex-col gap-2 shrink-0">
        <span className="font-monospace text-[10px] tracking-[0.2em] text-[#9A9187] uppercase font-bold leading-none">
          — FORENSIC DIAGNOSTIC ENGINE
        </span>
        <h1 className="hero-title-styles text-[#111111]">
          Diagnose your startup <span className="italic font-medium text-[#D35A22]">before it&apos;s too late.</span>
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-monospace text-[10px] tracking-wider text-[#6D655B] uppercase mt-1 leading-none">
          <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-[#D35A22]" /> 8 Vectors</span>
          <span className="text-[#DDD3C5]">•</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#D35A22]" /> &lt; 5 Min</span>
          <span className="text-[#DDD3C5]">•</span>
          <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-[#D35A22]" /> 3K Autopsies</span>
          <span className="text-[#DDD3C5]">•</span>
          <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-[#D35A22]" /> Secure</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-3.5 border border-[#DDD3C5] rounded-[16px] bg-[#FCFAF6] shadow-sm h-[170px] max-h-[170px] shrink-0 mt-2">
        <div className="flex justify-between items-center border-b border-[#DDD3C5]/60 pb-1.5 shrink-0">
          <label className="font-monospace text-[9.5px] tracking-[0.18em] text-[#D35A22] uppercase font-bold leading-none">
            VENTURE DESCRIPTION PITCH
          </label>
          <span className="font-monospace text-[9.5px] text-[#9A9187] leading-none">
            {pitch.length} / 1000 char
          </span>
        </div>

        <textarea
          className="w-full flex-1 bg-transparent font-sans text-[16px] text-[#111111] leading-relaxed outline-none resize-none pt-1 overflow-y-auto"
          placeholder="Describe your startup's core premise, target user base, business model, and competitive challenges. (Minimum 20 characters required to initiate diagnostics)..."
          value={pitch}
          onChange={(e) => onPitchChange(e.target.value.slice(0, 1000))}
        />
      </div>

      <div className="flex gap-4 justify-between items-center bg-[#FCFAF6] border border-[#DDD3C5] p-3 rounded-[16px] h-[64px] shrink-0 mt-2 shadow-sm">
        <div className="flex gap-3 items-center min-w-0">
          <Lightbulb className="w-5 h-5 text-[#E6A43B] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-monospace text-[9px] tracking-wider uppercase font-bold text-[#111111] leading-none">diagnostic guidance</span>
            <p className="text-[12px] text-[#6D655B] leading-none font-sans mt-1 truncate">
              Need structure? Populate a consulting-grade test case using the auto-injector.
            </p>
          </div>
        </div>
        <button
          onClick={onSeeExample}
          className="font-monospace text-[9px] tracking-widest uppercase border border-[#D35A22] text-[#D35A22] px-3.5 py-1.5 rounded-lg bg-[#FCFAF6] hover:bg-[#D35A22]/5 transition-all shrink-0 font-bold leading-none"
        >
          EXAMPLE
        </button>
      </div>

      <button
        onClick={onStartInterrogation}
        disabled={!canProceed || isGenerating}
        className={`w-full h-[52px] flex items-center justify-center gap-2 rounded-[16px] font-monospace text-[10.5px] font-bold tracking-[0.18em] uppercase transition-all duration-200 shrink-0 mt-2 ${
          canProceed && !isGenerating
            ? 'bg-gradient-to-r from-[#D35A22] to-[#BF4F1E] hover:from-[#BF4F1E] hover:to-[#D35A22] text-[#FCFAF6] shadow-sm hover:scale-[1.002]'
            : 'bg-[#DDD3C5] text-[#9A9187] cursor-not-allowed'
        }`}
      >
        {isGenerating ? 'ANALYZING INTENT...' : 'INITIATE DIAGNOSTIC →'}
      </button>
    </motion.div>
  );
}
