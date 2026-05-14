'use client';

import Link from 'next/link';

interface ScanButtonProps {
  href: string;
  label: string;
  fullWidth?: boolean;
}

export function ScanButton({ href, label, fullWidth }: ScanButtonProps) {
  return (
    <Link
      href={href}
      className={`btn-rust ${fullWidth ? 'w-full justify-center' : ''}`}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        padding: '14px 24px',
      }}
    >
      {label} →
    </Link>
  );
}
