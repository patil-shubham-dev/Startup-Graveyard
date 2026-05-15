'use client';

import { Play, Download, ShieldCheck, FileText } from 'lucide-react';

interface ForensicControlsProps {
  audioUrl?: string;
}

export function ForensicControls({ audioUrl }: ForensicControlsProps) {
  const handleExport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-4 mb-12 py-4 border-y border-cream-dark/30">
      {audioUrl && (
        <button className="flex items-center gap-3 px-5 py-2 bg-ink-black text-cream-base rounded-[2px] hover:bg-ink-muted transition-colors group shadow-sm">
          <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[10px] font-bold tracking-wider">PLAY_FORENSIC_BRIEFING</span>
          <div className="w-[1px] h-3 bg-cream-base/20 mx-1" />
          <span className="font-mono text-[9px] opacity-60">04:12</span>
        </button>
      )}

      <button 
        onClick={handleExport}
        className="flex items-center gap-3 px-5 py-2 border border-border-strong bg-white/40 text-ink-black rounded-[2px] hover:bg-cream-base transition-colors group shadow-sm"
      >
        <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        <span className="font-mono text-[10px] font-bold tracking-wider">EXPORT_DOSSIER_PDF</span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 opacity-40">
          <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
          <span className="font-mono text-[9px] text-ink-black uppercase font-bold">VERIFIED_SOURCE</span>
        </div>
        <div className="flex items-center gap-2 opacity-40">
          <FileText className="w-3.5 h-3.5 text-ink-black" />
          <span className="font-mono text-[9px] text-ink-black uppercase font-bold">EVIDENCE_LEVEL_01</span>
        </div>
      </div>
    </div>
  );
}
