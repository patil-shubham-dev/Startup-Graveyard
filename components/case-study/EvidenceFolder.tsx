'use client';

import { Paperclip, Eye } from 'lucide-react';

interface EvidenceFolderProps {
  images: string[];
}

export function EvidenceFolder({ images }: EvidenceFolderProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mt-20">
      <div className="flex items-center gap-3 mb-10">
        <Paperclip className="w-5 h-5 text-rust-accent rotate-45" />
        <h3 className="font-mono text-[10px] text-ink-muted tracking-[0.2em] uppercase">RECOVERED_EVIDENCE_FOLDER</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((img, i) => (
          <div 
            key={i} 
            className="group relative aspect-[16/10] bg-cream-dark overflow-hidden border border-border-strong rounded-[2px] shadow-sm hover:shadow-md transition-all duration-500 grayscale hover:grayscale-0"
          >
            <div className="absolute inset-0 bg-ink-black/20 group-hover:bg-transparent transition-colors z-10" />
            
            <img 
              src={img} 
              alt={`Evidence Item ${i + 1}`}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />

            {/* Evidence Tag */}
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-cream-base border border-cream-dark px-3 py-1 flex flex-col gap-0.5">
                <span className="font-mono text-[8px] text-ink-ghost leading-none uppercase">ITEM_NO</span>
                <span className="font-mono text-[10px] text-ink-black font-bold leading-none tracking-wider">REF_{i + 101}</span>
              </div>
            </div>

            {/* Hover Action */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="bg-cream-base/90 backdrop-blur-sm border border-cream-dark px-4 py-2 rounded-[2px] flex items-center gap-2 shadow-xl">
                <Eye className="w-4 h-4 text-ink-black" />
                <span className="font-mono text-[11px] text-ink-black font-bold">VIEW_HI_RES</span>
              </div>
            </div>

            {/* Tape Effect */}
            <div className="absolute top-0 right-1/4 w-12 h-6 bg-cream-base/40 backdrop-blur-[2px] border-x border-cream-dark/20 rotate-3 transform -translate-y-2 z-30 pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <p className="font-mono text-[9px] text-ink-ghost italic max-w-[300px] text-right leading-relaxed">
          * ALL VISUAL ASSETS HAVE BEEN DIGITALLY RESTORED FROM ARCHIVED CACHE DATA. 
          ACCURACY OF COLOR REPRODUCTION MAY VARY FROM ORIGINAL SOURCE.
        </p>
      </div>
    </div>
  );
}
