'use client';

import { useState } from 'react';

interface VisualEvidenceProps {
  images: string[];
  companyName: string;
}

export function VisualEvidence({ images, companyName }: VisualEvidenceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const selected = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">
        Archived media and visual records
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className="group relative aspect-video overflow-hidden border border-[var(--cream-dark)]/40 rounded-sm bg-[var(--cream-deep)] cursor-pointer"
          >
            <img
              src={src}
              alt={`${companyName} — evidence ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-[var(--ink-black)]/0 group-hover:bg-[var(--ink-black)]/10 transition-colors" />
            <div className="absolute bottom-2 right-2 font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5 bg-[var(--ink-black)]/60 text-[var(--cream-base)] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
              View
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-[var(--ink-black)]/90 flex items-center justify-center p-6"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-6 right-6 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--cream-base)]/60 hover:text-[var(--cream-base)] transition-colors"
          >
            Close [ESC]
          </button>
          <div className="max-w-5xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected}
              alt={`${companyName} — evidence`}
              className="w-full h-full object-contain rounded-sm"
            />
          </div>
          <div className="absolute bottom-6 flex gap-4">
            {selectedIndex !== null && selectedIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
                className="font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-2 border border-[var(--cream-base)]/20 text-[var(--cream-base)]/60 hover:text-[var(--cream-base)] hover:border-[var(--cream-base)]/40 transition-colors rounded-sm"
              >
                ← Previous
              </button>
            )}
            <span className="font-mono text-[10px] text-[var(--cream-base)]/40 self-center">
              {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
            </span>
            {selectedIndex !== null && selectedIndex < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
                className="font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-2 border border-[var(--cream-base)]/20 text-[var(--cream-base)]/60 hover:text-[var(--cream-base)] hover:border-[var(--cream-base)]/40 transition-colors rounded-sm"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
