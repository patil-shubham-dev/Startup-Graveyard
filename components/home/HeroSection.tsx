'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { formatCurrencyCompact } from '@/lib/utils/format';

const HARDCODED_FAILURES = [
  {
    name: 'Quibi',
    burn: 1750000000,
    date: '2020',
    industry: 'STREAMING',
    note: 'Consumer appetite never matched the spend curve. Mobile-first pivoted into irrelevance.',
    caseNum: 'CASE #0001',
  },
  {
    name: 'Jawbone',
    burn: 930000000,
    date: '2017',
    industry: 'HARDWARE',
    note: 'Hardware ambition outran operating discipline. Wearables market shifted before they could.',
    caseNum: 'CASE #0002',
  },
  {
    name: 'Fast',
    burn: 120000000,
    date: '2022',
    industry: 'FINTECH',
    note: 'Narrative growth masked a dangerously thin product core. CAC never reconciled with LTV.',
    caseNum: 'CASE #0003',
  },
  {
    name: 'Theranos',
    burn: 945000000,
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

function FoldedCorner() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      style={{ position: 'absolute', bottom: 0, right: 0 }}
      aria-hidden="true"
    >
      <path d="M22 0 L22 22 L0 22 Z" fill="var(--cream-dark)" />
      <path d="M22 0 L22 22 L0 22" fill="none" stroke="var(--cream-base)" strokeWidth="0.5" />
    </svg>
  );
}

export function HeroSection({ liveCases = [] }: HeroSectionProps) {
  const dynamicCards = liveCases.slice(0, 2).map((c, i) => ({
    name: c.company_name,
    burn: formatCurrencyCompact(c.funding_raised),
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
    <section
      style={{
        width: '100%',
        backgroundColor: 'var(--cream-base)',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fine grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.04,
          backgroundImage: `
            linear-gradient(to right, var(--ink-black) 1px, transparent 1px),
            linear-gradient(to bottom, var(--ink-black) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Soft vignette edges */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 60%, rgba(245,240,232,0.6) 100%)',
        }}
      />

      <div className="sg-container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gap: '40px',
            paddingTop: '35px', // Reduced by ~0.7cm (26px) from 61px
            paddingBottom: '48px',
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* LEFT: Editorial copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {/* Kicker */}
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: 'var(--rust-accent)',
                marginBottom: '24px',
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

            {/* Hero headline — forced 3-line structure */}
            <h1
              className="hero-headline"
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: 'clamp(56px, 6.8vw, 8rem)',
                fontWeight: 600,
                lineHeight: 1.05, // Increased from 0.91 for more spacing between lines
                letterSpacing: '-0.04em',
                color: 'var(--ink-black)',
                marginBottom: '28px',
              }}
            >
              Learn from the<br />
              companies that<br />
              <span style={{ color: 'var(--failed-red)' }}>failed</span>{' '}expensively.
            </h1>

            {/* Subtext */}
            <p
              style={{
                fontFamily: 'var(--font-body), Georgia, serif',
                fontSize: '18px',
                lineHeight: 1.75,
                color: 'var(--ink-muted)',
                maxWidth: '38ch',
                marginBottom: '36px',
              }}
            >
              Startup Graveyard is a research-driven archive of failed companies, built
              to help founders study collapse with the same seriousness investors study growth.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link href="/explore" className="btn-rust-hero">
                BROWSE CASE STUDIES →
              </Link>
              <Link href="/pre-mortem" className="btn-outline-hero">
                RUN PRE-MORTEM →
              </Link>
            </div>
          </motion.div>

          {/* RIGHT: Rotating dossier card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Card header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
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
                    boxShadow: '0 0 6px rgba(107,123,110,0.5)',
                  }}
                />
                ROTATING LIVE
              </span>
            </div>

            {/* Warm radial behind card */}
            <div style={{ position: 'relative' }}>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: '-20px',
                  background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,146,42,0.07) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Dossier card */}
              <div
                style={{
                  backgroundColor: 'var(--paper-white)',
                  border: '1px solid var(--cream-dark)',
                  borderRadius: '2px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '6px 10px 40px rgba(26,23,20,0.10), 0 1px 0 rgba(217,207,192,0.6)',
                  zIndex: 1,
                }}
              >
                {/* Paper grain — simplified for performance */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    opacity: 0.03,
                    backgroundImage: 'radial-gradient(var(--ink-black) 0.5px, transparent 0.5px)',
                    backgroundSize: '4px 4px',
                  }}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      padding: '36px 36px 32px',
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '300px',
                    }}
                  >
                    {/* Top meta */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '20px',
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
                        fontSize: 'clamp(44px, 5.5vw, 68px)',
                        fontWeight: '700',
                        lineHeight: 0.88,
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
                        fontFamily: 'var(--font-body), Georgia, serif',
                        fontSize: '14px',
                        lineHeight: 1.7,
                        color: 'var(--ink-soft)',
                        marginBottom: 'auto',
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
                        marginTop: '24px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-dm-mono), monospace',
                            fontSize: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            color: 'var(--ink-muted)',
                            marginBottom: '6px',
                          }}
                        >
                          CAPITAL LOST
                        </div>
                        <div
                          className="t-num"
                          style={{
                            fontSize: '30px',
                            fontWeight: '600',
                            color: 'var(--rust-accent)',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {typeof current.burn === 'number' ? formatCurrencyCompact(current.burn) : current.burn}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-dm-mono), monospace',
                            fontSize: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            color: 'var(--ink-muted)',
                            marginBottom: '6px',
                          }}
                        >
                          YEAR CLOSED
                        </div>
                        <div
                          className="t-num"
                          style={{
                            fontSize: '30px',
                            fontWeight: '600',
                            color: 'var(--ink-black)',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {current.date}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <FoldedCorner />
              </div>
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
                    width: i === activeIndex ? '22px' : '6px',
                    height: '3px',
                    borderRadius: '2px',
                    backgroundColor:
                      i === activeIndex ? 'var(--rust-accent)' : 'var(--cream-dark)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                    padding: 0,
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
