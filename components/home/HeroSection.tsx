'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/format';

const HARDCODED_FAILURES = [
  {
    name: 'Quibi',
    burn: '$1.75B',
    date: '2020',
    industry: 'STREAMING',
    note: 'Consumer appetite never matched the spend curve. Mobile-first pivoted into irrelevance.',
    caseNum: 'CASE #0001',
  },
  {
    name: 'Jawbone',
    burn: '$930M',
    date: '2017',
    industry: 'HARDWARE',
    note: 'Hardware ambition outran operating discipline. Wearables market shifted before they could.',
    caseNum: 'CASE #0002',
  },
  {
    name: 'Fast',
    burn: '$120M',
    date: '2022',
    industry: 'FINTECH',
    note: 'Narrative growth masked a dangerously thin product core. CAC never reconciled with LTV.',
    caseNum: 'CASE #0003',
  },
  {
    name: 'Theranos',
    burn: '$945M',
    date: '2018',
    industry: 'HEALTHTECH',
    note: 'Trust collapsed before the business could recover. Deception compounded by regulatory blindness.',
    caseNum: 'CASE #0004',
  },
];

interface LiveCase {
  company_name: string;
  funding_raised: number;
  shutdown_year: number | null;
  slug: string;
}

interface HeroStats {
  totalCases: number;
  totalBurned: number;
  avgLifespan: string;
  patternCount: number;
  totalLessons: number;
}

interface HeroSectionProps {
  stats?: HeroStats;
  liveCases?: LiveCase[];
}

// Folded corner SVG
function FoldedCorner() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      style={{ position: 'absolute', bottom: 0, right: 0 }}
      aria-hidden="true"
    >
      <path d="M20 0 L20 20 L0 20 Z" fill="var(--cream-dark)" />
      <path d="M20 0 L20 20 L0 20" fill="none" stroke="var(--cream-dark)" strokeWidth="1" />
    </svg>
  );
}

export function HeroSection({ liveCases = [] }: HeroSectionProps) {
  // Build rotation list: 4 hardcoded + up to 2 from Supabase
  const dynamicCards = liveCases.slice(0, 2).map((c, i) => ({
    name: c.company_name,
    burn: formatCurrency(c.funding_raised),
    date: String(c.shutdown_year || '—'),
    industry: 'ARCHIVE',
    note: 'Documented in the archive. High-capital collapse with compounding failure vectors.',
    caseNum: `CASE #${String(i + 5).padStart(4, '0')}`,
  }));

  const ALL_FAILURES = [...HARDCODED_FAILURES, ...dynamicCards];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % ALL_FAILURES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [ALL_FAILURES.length]);

  const current = ALL_FAILURES[activeIndex];

  return (
    <section style={{ width: '100%', backgroundColor: 'var(--cream-base)' }}>
      <div className="sg-container">
        <div
          style={{
            display: 'grid',
            gap: '48px',
            paddingTop: '80px',
            paddingBottom: '80px',
            alignItems: 'start',
          }}
          className="lg:grid-cols-[55fr_45fr]"
        >
          {/* LEFT: Editorial copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Kicker */}
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--rust-accent)',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--rust-accent)',
                  flexShrink: 0,
                }}
              />
              FORENSIC INTELLIGENCE UNIT / LIVE ARCHIVE
            </div>

            {/* Hero headline */}
            <h1
              className="t-hero"
              style={{ maxWidth: '10ch', marginBottom: '28px' }}
            >
              Learn from the companies that failed expensively.
            </h1>

            {/* Subtext */}
            <p
              className="t-body"
              style={{ maxWidth: '420px', marginBottom: '40px' }}
            >
              Startup Graveyard is a research-driven archive of failed companies, built
              to help founders study collapse with the same seriousness investors study growth.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '0' }}>
              <Link href="/explore" className="btn-rust">
                BROWSE CASE STUDIES →
              </Link>
              <Link href="/pre-mortem" className="btn-outline-ink">
                RUN PRE-MORTEM →
              </Link>
            </div>
          </div>

          {/* RIGHT: Rotating dossier card */}
          <div>
            {/* Card header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--ink-muted)',
                }}
              >
                FEATURED COLLAPSE
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--sage-neutral)',
                    display: 'inline-block',
                  }}
                />
                ROTATING LIVE
              </span>
            </div>

            {/* Dossier card */}
            <div
              style={{
                backgroundColor: 'var(--paper-white)',
                border: '1px solid var(--cream-dark)',
                borderRadius: '2px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '4px 6px 24px rgba(26,23,20,0.08), 0 1px 0 rgba(217,207,192,0.5)',
                minHeight: '320px',
              }}
            >
              {/* Paper grain */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  opacity: 0.05,
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'repeat',
                  backgroundSize: '150px 150px',
                }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  style={{ padding: '32px', position: 'relative', zIndex: 1 }}
                >
                  {/* Top meta */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '24px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      {current.industry} / {current.caseNum}
                    </span>
                    <span className="stamp-closed">CLOSED</span>
                  </div>

                  {/* Company name */}
                  <div
                    style={{
                      fontFamily: 'var(--font-cormorant), Georgia, serif',
                      fontSize: 'clamp(40px, 5vw, 64px)',
                      fontWeight: '700',
                      lineHeight: 0.9,
                      letterSpacing: '-0.03em',
                      color: 'var(--ink-black)',
                      marginBottom: '20px',
                    }}
                  >
                    {current.name}
                  </div>

                  {/* Note */}
                  <p
                    style={{
                      fontFamily: 'var(--font-source-serif), Georgia, serif',
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: 'var(--ink-soft)',
                      marginBottom: '28px',
                      maxWidth: '38ch',
                    }}
                  >
                    {current.note}
                  </p>

                  {/* Bottom data */}
                  <div
                    style={{
                      borderTop: '1.5px dashed var(--cream-dark)',
                      paddingTop: '20px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: 'var(--ink-muted)',
                          marginBottom: '6px',
                        }}
                      >
                        CAPITAL LOST
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-cormorant), Georgia, serif',
                          fontSize: '28px',
                          fontWeight: '700',
                          color: 'var(--rust-accent)',
                          lineHeight: 1,
                        }}
                      >
                        {current.burn}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: 'var(--ink-muted)',
                          marginBottom: '6px',
                        }}
                      >
                        YEAR CLOSED
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-cormorant), Georgia, serif',
                          fontSize: '28px',
                          fontWeight: '700',
                          color: 'var(--ink-black)',
                          lineHeight: 1,
                        }}
                      >
                        {current.date}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Folded corner */}
              <FoldedCorner />
            </div>

            {/* Rotation dots */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
              }}
            >
              {ALL_FAILURES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    width: i === activeIndex ? '20px' : '6px',
                    height: '3px',
                    borderRadius: '1px',
                    backgroundColor:
                      i === activeIndex ? 'var(--rust-accent)' : 'var(--cream-dark)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
