'use client';

import { Check } from 'lucide-react';
import { type Step, getCurrentVectorInfo } from './types';

interface SidebarContentProps {
  step: Step;
  currentQuestionIndex: number;
}

export function SidebarContent({ step, currentQuestionIndex }: SidebarContentProps) {
  const activeVector = getCurrentVectorInfo(step, currentQuestionIndex);

  return (
    <div className="flex flex-col h-full justify-between p-5 xl:p-6 overflow-hidden select-none bg-[#090B0F]">
      <div className="flex flex-col gap-4 xl:gap-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F7F4EE] text-[#090B0F] rounded-md flex items-center justify-center font-display-serif font-bold text-[15px]">
            SG
          </div>
          <div className="flex flex-col">
            <span className="font-monospace text-[9px] tracking-[0.2em] font-semibold text-[#F7F4EE] leading-none">STARTUP GRAVEYARD</span>
            <span className="font-monospace text-[8px] tracking-wider text-[#9A9187] uppercase mt-0.5 leading-none">
              Autopsy-backed risk diagnostic
            </span>
          </div>
        </div>

        <div className="h-[1px] bg-white/10" />

        <div className="flex flex-col gap-2.5">
          <span className="font-monospace text-[9.5px] tracking-[0.25em] text-[#D35A22] uppercase font-bold leading-none">— FORENSIC ENGINE</span>
          <h2 className="sidebar-title-styles text-[#F7F4EE] tracking-tight">Pre-Mortem Engine</h2>
          <p className="sidebar-description-styles text-white/60 leading-relaxed font-sans">
            Stress-test your business model against historical failure patterns to uncover lethal blind spots before it&apos;s too late.
          </p>
        </div>

        <div className="p-3.5 border border-white/10 bg-[#0F141B] rounded-xl flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="font-monospace text-[8.5px] tracking-wider uppercase font-bold text-white/50 leading-none">ENGINE STATUS</span>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FAE5A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3FAE5A]"></span>
              </span>
              <span className="font-monospace text-[8.5px] tracking-wider text-[#3FAE5A] font-bold">ACTIVE</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 border-t border-white/5 pt-2">
            <span className="font-monospace text-[10.5px] font-bold tracking-widest text-[#D35A22] leading-none">
              {activeVector.code}
            </span>
            <span className="font-display-serif text-[13.5px] italic mt-0.5 text-[#F7F4EE] leading-snug">
              {activeVector.label}
            </span>
            <span className="text-[11px] font-sans text-white/50 mt-1 leading-normal line-clamp-2">
              {activeVector.desc}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="font-monospace text-[8.5px] tracking-[0.2em] text-[#9A9187] uppercase font-bold block mb-0.5">ENGINE CAPABILITIES</span>
          <ul className="flex flex-col gap-1.5">
            {[
              { text: "Data-driven autopsies", active: activeVector.code === 'VEC_PRODUCT' },
              { text: "Multi-vector vulnerability scans", active: activeVector.code === 'VEC_MARKET' },
              { text: "Evidence-backed insights", active: activeVector.code === 'VEC_EXECUTION' },
              { text: "Structured Consulting diagnostics", active: activeVector.code === 'VEC_COMPILING' },
              { text: "Actionable recommendations", active: activeVector.code === 'VEC_COMPLETE' }
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-[12.5px] leading-none py-0.5">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                  item.active ? 'bg-[#D35A22] border-[#D35A22] text-[#F7F4EE]' : 'border-white/20 text-[#9A9187]'
                }`}>
                  <Check className="w-2 h-2" />
                </div>
                <span className={`font-sans transition-colors leading-none ${item.active ? 'font-semibold text-[#D35A22]' : 'text-white/60'}`}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-3.5 border border-white/5 bg-[#0F141B] text-[11.5px] leading-relaxed rounded-xl text-white/50 shrink-0">
        <span className="font-monospace font-bold block mb-0.5 uppercase tracking-wider text-[#D35A22] text-[9.5px] leading-none">CONFIDENTIAL INTEL NOTE</span>
        Analysis utilizes semantic indexing across 3,000+ failed venture autopsies. All data is isolated, processed securely, and fully confidential.
      </div>
    </div>
  );
}
