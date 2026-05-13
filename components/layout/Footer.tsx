'use client';

import { GlobalMetadata } from './GlobalMetadata';

interface FooterProps {
  stats?: {
    totalCases: number;
    totalBurned: number;
  };
}

export function Footer({ stats }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 bg-bg-base border-t border-border-subtle z-[100] px-6 flex items-center justify-between pointer-events-auto">
      {/* Left: Copyright */}
      <div className="flex items-center gap-4">
        <img src="/assets/logo-icon.svg" alt="Icon" className="h-4 w-4 opacity-50" />
        <span className="font-mono text-[10px] text-text-muted tracking-wider">
          © {currentYear} STARTUP_GRAVEYARD // FORENSIC_INTEL
        </span>
      </div>

      {/* Center: Global Metadata */}
      <div className="hidden md:block">
        <GlobalMetadata 
          totalCases={stats?.totalCases || 0} 
          totalBurned={stats?.totalBurned || 0} 
        />
      </div>

      {/* Right: Version & Status */}
      <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest text-text-muted uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>SYSTEM_OPERATIONAL</span>
        </div>
        <div className="hidden sm:block">
          V.2.0.4-LOCKED
        </div>
      </div>
    </footer>
  );
}
