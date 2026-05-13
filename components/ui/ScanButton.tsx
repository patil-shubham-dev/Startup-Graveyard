import React from 'react';
import Link from 'next/link';

interface ScanButtonProps {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  icon?: boolean;
}

export function ScanButton({ href, label, variant = 'primary', className = '', icon = true }: ScanButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <Link 
      href={href}
      className={`group relative px-8 py-3 rounded-full overflow-hidden inline-flex items-center gap-3 transition-all active:scale-95 ${className}`}
    >
      {/* Background & Overlays */}
      {isPrimary ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-700 transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)] transition-opacity duration-300" />
          <div className="absolute -inset-1 bg-violet-600/30 blur-md rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-white/5 border border-white/10 transition-colors group-hover:bg-white/10 group-hover:border-white/20" />
        </>
      )}

      {/* Label */}
      <span className={`relative z-10 font-mono text-[11px] font-bold tracking-[0.15em] ${isPrimary ? 'text-white' : 'text-text-primary'}`}>
        {label}
        {icon && <span className="ml-2">→</span>}
      </span>

      {/* Scanning Bar (Branded Effect) */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-[scan_1s_infinite]" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </Link>
  );
}
