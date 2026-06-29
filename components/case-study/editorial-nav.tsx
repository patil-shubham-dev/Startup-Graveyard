'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTree, X } from 'lucide-react';
import { cn } from '@/lib/utils/index';

const sections = [
  { id: 'summary', label: 'Summary' },
  { id: 'snapshot', label: 'Snapshot' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'story', label: 'Story' },
  { id: 'failure', label: 'Failure' },
  { id: 'root-cause', label: 'Root Cause' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'people', label: 'People' },
  { id: 'investors', label: 'Investors' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'takeaway', label: 'Verdict' },
];

export function EditorialNav() {
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] w-12 h-12 bg-[var(--ink-black)] text-[var(--cream-base)] rounded-full flex items-center justify-center shadow-xl"
      >
        {open ? <X size={20} /> : <ListTree size={20} />}
      </button>

      <nav className="hidden lg:block sticky top-32 w-[200px] shrink-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-muted)] mb-6">
          Sections
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 w-px h-full bg-[var(--cream-dark)]/40" />
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  'block w-full text-left py-1.5 pl-4 text-[11px] transition-all duration-200 relative',
                  isActive
                    ? 'text-[var(--rust-accent)] font-medium'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink-soft)]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-0 w-0.5 h-full bg-[var(--rust-accent)]"
                  />
                )}
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="lg:hidden fixed inset-x-4 bottom-24 z-[100] bg-[var(--paper-white)] border border-[var(--cream-dark)] p-6 rounded-lg shadow-2xl max-h-[50vh] overflow-y-auto"
          >
            <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-muted)] mb-4">
              Sections
            </div>
            <div className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    'block w-full text-left py-2 text-sm border-b border-[var(--cream-dark)]/10',
                    active === s.id ? 'text-[var(--rust-accent)]' : 'text-[var(--ink-soft)]'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
