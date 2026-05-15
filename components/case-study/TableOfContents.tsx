'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/index';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTree, X, ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  label: string;
}

export const TableOfContents = ({ sections }: { sections: Section[] }) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-[100] w-14 h-14 bg-ink-black text-cream-base rounded-full flex items-center justify-center shadow-xl border border-cream-dark/20"
      >
        {isOpen ? <X size={24} /> : <ListTree size={24} />}
      </button>

      {/* Desktop Sticky TOC */}
      <nav className="hidden lg:block sticky top-32 h-fit w-full max-w-[240px] space-y-2 py-4">
        <h3 className="t-label mb-6 text-ink-muted flex items-center gap-2">
          <ListTree size={14} /> Investigation Index
        </h3>
        <div className="space-y-1 relative">
          <div className="absolute left-0 top-0 w-[1px] h-full bg-cream-dark/30" />
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "group flex items-center gap-3 w-full text-left py-2 px-4 transition-all duration-300 relative",
                  isActive ? "text-rust-accent" : "text-ink-muted hover:text-ink-soft"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 w-[2px] h-full bg-rust-accent"
                  />
                )}
                <span className={cn(
                  "t-mono text-[11px] uppercase tracking-wider transition-transform",
                  isActive ? "translate-x-1" : "group-hover:translate-x-1"
                )}>
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Overlay TOC */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="lg:hidden fixed inset-x-6 bottom-28 z-[100] bg-paper-white border border-cream-dark p-8 rounded-lg shadow-2xl overflow-y-auto max-h-[60vh] paper-dossier"
          >
            <h3 className="t-label mb-6 text-ink-muted">Investigation Index</h3>
            <div className="space-y-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "flex items-center justify-between w-full text-left py-2 border-b border-cream-dark/10",
                    activeSection === section.id ? "text-rust-accent" : "text-ink-soft"
                  )}
                >
                  <span className="t-mono text-[12px] uppercase tracking-wider">{section.label}</span>
                  <ChevronRight size={14} className={activeSection === section.id ? "opacity-100" : "opacity-30"} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
