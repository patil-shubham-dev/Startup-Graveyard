'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[200] overflow-hidden pointer-events-none">
      <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-progress" />
      
      {/* Scanning light effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/3 h-full animate-scan-fast" />
    </div>
  );
}
