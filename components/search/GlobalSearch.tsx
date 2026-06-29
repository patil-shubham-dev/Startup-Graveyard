'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { listCaseStudies } from '@/lib/db/case-studies';

const EMPTY_RESULT: Array<{ slug: string; company_name: string; case_number: string; industry: string | null }> = [];

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  const { data: results = EMPTY_RESULT } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return EMPTY_RESULT;
      const cases = await listCaseStudies({ search: debouncedQuery, limit: 10 });
      return cases.map((c) => ({
        slug: c.slug,
        company_name: c.company_name,
        case_number: c.case_number,
        industry: c.industry,
      }));
    },
    enabled: open && debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K to toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // '/' to open search (when not already focused in an input/textarea)
      if (e.key === '/' && !open && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const navigateTo = useCallback((slug: string) => {
    setOpen(false);
    setQuery('');
    router.push(`/case/${slug}`);
  }, [router]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '520px',
          backgroundColor: 'var(--paper-white)',
          border: '1px solid var(--cream-dark)',
          borderRadius: '2px',
          zIndex: 9999,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Search the archive"
      >
        <div style={{ padding: '16px', borderBottom: '1px solid var(--cream-dark)' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="SEARCH THE ARCHIVE..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--ink-black)',
            }}
          />
        </div>
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
          {results.length === 0 && debouncedQuery.length >= 2 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              color: 'var(--ink-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              No results for &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : results.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              color: 'var(--cream-dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Type at least 2 characters to search
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.slug}
                onClick={() => navigateTo(item.slug)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--cream-light)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink-black)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cream-deep)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontWeight: '600' }}>{item.company_name}</span>
                {item.industry && (
                  <span style={{ color: 'var(--ink-muted)', marginLeft: '8px' }}>{item.industry}</span>
                )}
                <span style={{ color: 'var(--cream-dark)', marginLeft: '8px', fontSize: '9px' }}>
                  {item.case_number}
                </span>
              </button>
            ))
          )}
        </div>
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--cream-dark)',
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '9px',
          color: 'var(--ink-muted)',
          display: 'flex',
          gap: '16px',
          justifyContent: 'flex-end',
        }}>
          <span>↑↓ NAVIGATE</span>
          <span>↵ OPEN</span>
          <span>ESC CLOSE</span>
        </div>
      </div>
    </>
  );
}
