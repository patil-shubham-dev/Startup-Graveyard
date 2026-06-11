'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevKeyRef = useRef(routeKey);

  useEffect(() => {
    if (prevKeyRef.current !== routeKey) {
      setLoading(true);
      timeoutRef.current = setTimeout(() => setLoading(false), 400);
      prevKeyRef.current = routeKey;
    } else {
      setLoading(false);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [routeKey]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[200] overflow-hidden pointer-events-none">
      <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-progress" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/3 h-full animate-scan-fast" />
    </div>
  );
}
