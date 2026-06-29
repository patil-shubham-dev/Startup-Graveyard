'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';

const navLinks = [
  { name: 'ARCHIVES', href: '/explore' },
  { name: 'INSIGHTS', href: '/insights' },
  { name: 'PRE-MORTEM', href: '/pre-mortem' },
  { name: 'INTEL', href: '/ask' },
  { name: 'ABOUT', href: '/about' },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const prefetch = (href: string) => {
    router.prefetch(href);
  };

  const isPreMortem = pathname === '/pre-mortem';
  const navHeight = isPreMortem ? '80px' : '56px';
  const headerBg = isPreMortem ? '#F7F4EE' : 'var(--cream-base)';
  const borderCol = isPreMortem ? '#DDD3C5' : 'var(--cream-dark)';

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: navHeight,
          backgroundColor: headerBg,
          borderBottom: `1px solid ${borderCol}`,
          transition: 'all 0.25s ease',
        }}
      >
        <div
          className="sg-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: navHeight,
            gap: '24px',
            transition: 'all 0.25s ease',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-black)',
                  lineHeight: 1.1,
                }}
              >
                STARTUP GRAVEYARD
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '9px',
                  fontWeight: '400',
                  textTransform: 'none',
                  letterSpacing: '0.04em',
                  color: 'var(--ink-muted)',
                  lineHeight: 1.1,
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
                  onMouseEnter={() => prefetch(link.href)}
                  style={{
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: '11px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: isActive ? 'var(--rust-accent)' : 'var(--ink-muted)',
                    textDecoration: 'none',
                    position: 'relative',
                    paddingBottom: '2.5px',
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
            {/* Auth Status */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px',
                    backgroundColor: 'var(--cream-deep)',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: '2px',
                  }}
                >
                  <User className="w-3 h-3" style={{ color: 'var(--ink-muted)' }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '10px',
                      color: 'var(--ink-muted)',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--rust-accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '2px 4px',
                      transition: 'opacity 0.15s ease',
                    }}
                    title="Sign out"
                  >
                    <LogOut className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '10px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--rust-accent)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  border: '1px solid var(--rust-accent)',
                  borderRadius: '2px',
                  transition: 'all 0.2s ease',
                }}
                className="hidden sm:inline-flex"
              >
                SIGN IN
              </Link>
            )}

            <Link
              href="/pre-mortem"
              className={isPreMortem ? "hidden sm:inline-flex" : "btn-stamp hidden sm:inline-flex"}
              style={
                isPreMortem
                  ? {
                      height: '48px',
                      padding: '0 24px',
                      backgroundColor: '#FCFAF6',
                      border: '1.5px solid #D35A22',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '12px',
                      fontWeight: '500',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#D35A22',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(211,90,34,0.04)',
                    }
                  : undefined
              }
            >
              RUN PRE-MORTEM →
            </Link>

            {/* Menu trigger button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={isPreMortem ? "flex" : "lg:hidden flex"}
              style={{
                background: isPreMortem ? '#FCFAF6' : 'none',
                border: isPreMortem ? '1.5px solid #DDD3C5' : '1px solid var(--cream-dark)',
                borderRadius: isPreMortem ? '8px' : '2px',
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4.5px',
                alignItems: 'center',
                justifyContent: 'center',
                width: isPreMortem ? '48px' : '36px',
                height: isPreMortem ? '48px' : '32px',
                boxShadow: isPreMortem ? '0 2px 8px rgba(17,17,17,0.04)' : 'none',
                transition: 'all 0.2s ease',
              }}
              aria-label="Toggle menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: isPreMortem ? '18px' : '16px',
                    height: isPreMortem ? '2px' : '1.5px',
                    backgroundColor: isPreMortem ? '#111111' : 'var(--ink-muted)',
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
              top: navHeight,
              left: 0,
              right: 0,
              backgroundColor: isPreMortem ? '#F7F4EE' : 'var(--cream-base)',
              borderBottom: `1px solid ${borderCol}`,
              zIndex: 99,
              padding: '16px 0',
              boxShadow: '0 8px 24px rgba(17,17,17,0.04)',
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
                    fontFamily: 'var(--font-mono), monospace',
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
            {/* Mobile auth */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--cream-dark)', marginTop: '8px', paddingTop: '16px' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '10px',
                      color: 'var(--ink-muted)',
                    }}
                  >
                    {user.email}
                  </span>
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--rust-accent)',
                      background: 'none',
                      border: '1px solid var(--rust-accent)',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderRadius: '2px',
                    }}
                  >
                    SIGN OUT
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="btn-stamp"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  SIGN IN
                </Link>
              )}
            </div>
            <div style={{ padding: '12px 24px' }}>
              <Link href="/pre-mortem" className="btn-stamp" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
                RUN PRE-MORTEM →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
