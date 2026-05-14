'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { name: 'ARCHIVES', href: '/explore' },
  { name: 'INSIGHTS', href: '/insights' },
  { name: 'PRE-MORTEM', href: '/pre-mortem' },
  { name: 'INTEL', href: '/ask' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '56px',
          backgroundColor: 'var(--cream-base)',
          borderBottom: '1px solid var(--cream-dark)',
        }}
      >
        <div
          className="sg-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '56px',
            gap: '24px',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Stamped SG Monogram */}
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--cream-deep)',
                border: '1px solid var(--cream-dark)',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 2px rgba(26,23,20,0.12), 2px 2px 4px rgba(26,23,20,0.08), inset 0 -1px 0 rgba(217,207,192,0.5)',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--ink-black)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  textShadow: '0 1px 0 rgba(253,250,245,0.5)',
                }}
              >
                SG
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-black)',
                  lineHeight: 1,
                }}
              >
                STARTUP GRAVEYARD
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  fontWeight: '300',
                  textTransform: 'none',
                  letterSpacing: '0.04em',
                  color: 'var(--ink-muted)',
                  lineHeight: 1,
                }}
              >
                Forensic intelligence for failed companies
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
            className="hidden lg:flex"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '11px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: isActive ? 'var(--rust-accent)' : 'var(--ink-muted)',
                    textDecoration: 'none',
                    position: 'relative',
                    paddingBottom: '2px',
                    transition: 'color 0.15s ease',
                  }}
                  className="nav-link"
                >
                  {link.name}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: 0,
                        width: '100%',
                        height: '2px',
                        backgroundColor: 'var(--rust-accent)',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/pre-mortem"
              className="btn-stamp hidden sm:inline-flex"
            >
              RUN PRE-MORTEM →
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden"
              style={{
                background: 'none',
                border: '1px solid var(--cream-dark)',
                borderRadius: '2px',
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
              aria-label="Toggle menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: '16px',
                    height: '1.5px',
                    backgroundColor: 'var(--ink-muted)',
                    transition: 'all 0.2s ease',
                    transform:
                      mobileOpen && i === 0
                        ? 'rotate(45deg) translate(4px, 4px)'
                        : mobileOpen && i === 2
                        ? 'rotate(-45deg) translate(4px, -4px)'
                        : mobileOpen && i === 1
                        ? 'scaleX(0)'
                        : 'none',
                  }}
                />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="lg:hidden"
            style={{
              position: 'absolute',
              top: '56px',
              left: 0,
              right: 0,
              backgroundColor: 'var(--cream-base)',
              borderBottom: '1px solid var(--cream-dark)',
              zIndex: 99,
              padding: '16px 0',
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 24px',
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: isActive ? 'var(--rust-accent)' : 'var(--ink-muted)',
                    textDecoration: 'none',
                    borderLeft: isActive ? '3px solid var(--rust-accent)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
            <div style={{ padding: '12px 24px' }}>
              <Link href="/pre-mortem" className="btn-stamp" onClick={() => setMobileOpen(false)}>
                RUN PRE-MORTEM →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
