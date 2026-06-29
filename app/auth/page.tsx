'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/db/config';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signingIn, setSigningIn] = useState(false);

  const redirect = searchParams.get('redirect') || '/';
  const action = searchParams.get('action');

  useEffect(() => {
    if (action === 'signin' && !signingIn) {
      handleGoogleAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleGoogleAuth() {
    setSigningIn(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`;
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    }).then(({ error }) => {
      if (error) {
        console.error('Google auth error:', error.message);
        setSigningIn(false);
      }
    });
  }

  if (action === 'signin') {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--cream-base)',
      }}>
        <div className="skeleton-cream" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
      paddingTop: 80,
      backgroundColor: 'var(--cream-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        fontSize: 160,
        fontWeight: 200,
        color: 'var(--cream-dark)',
        opacity: 0.1,
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        AUTH
      </div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '8%',
        fontSize: 100,
        fontWeight: 200,
        color: 'var(--cream-dark)',
        opacity: 0.08,
        fontFamily: 'var(--font-dm-mono), monospace',
        lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        0x7E
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 420,
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div className="stamp-closed">DOSSIER ACCESS</div>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(32px, 5vw, 44px)',
          fontWeight: 700,
          color: 'var(--ink-black)',
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>
          Investigator Authentication
        </h1>

        <div style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: 'var(--rust-accent)',
          textAlign: 'center',
          marginBottom: 12,
        }}>
          SECURE ACCESS GATE // V.02
        </div>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--ink-muted)',
          textAlign: 'center',
          marginBottom: 40,
          maxWidth: 340,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Secure authentication is required to access the forensic archive and pre-mortem diagnostic engine.
        </p>

        <div style={{
          background: 'var(--paper-white)',
          border: '1.5px solid var(--cream-dark)',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 28,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sage-neutral)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--ink-muted)',
            }}>
              SECURED BY SUPABASE AUTH
            </span>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={signingIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px 24px',
              background: signingIn ? 'var(--cream-deep)' : 'white',
              border: '1.5px solid var(--cream-dark)',
              borderRadius: 10,
              cursor: signingIn ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
              opacity: signingIn ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!signingIn) {
                e.currentTarget.style.background = 'var(--cream-base)';
                e.currentTarget.style.borderColor = 'var(--rust-accent)';
              }
            }}
            onMouseLeave={(e) => {
              if (!signingIn) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--cream-dark)';
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--ink-black)',
            }}>
              {signingIn ? 'CONNECTING...' : 'Sign in with Google'}
            </span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--cream-dark)', opacity: 0.5 }} />
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--ink-muted)',
            }}>
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--cream-dark)', opacity: 0.5 }} />
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={signingIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 24px',
              background: 'transparent',
              border: '1.5px dashed var(--cream-dark)',
              borderRadius: 10,
              cursor: signingIn ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
              opacity: signingIn ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!signingIn) {
                e.currentTarget.style.background = 'var(--cream-base)';
                e.currentTarget.style.borderColor = 'var(--ochre-signal)';
              }
            }}
            onMouseLeave={(e) => {
              if (!signingIn) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--cream-dark)';
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ochre-signal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 10,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--ink-muted)',
            }}>
              Create an account
            </span>
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1px solid var(--cream-dark)',
            opacity: 0.6,
          }}>
            <button
              onClick={() => router.push('/')}
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--ink-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Return to Archive
            </button>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 8,
              color: 'var(--cream-dark)',
            }}>
              |
            </span>
            <button
              onClick={() => router.push(redirect === '/' ? '/explore' : redirect)}
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--rust-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Continue to {redirect === '/pre-mortem' ? 'Pre-Mortem' : redirect === '/ask' ? 'Intel' : 'Explore'}
            </button>
          </div>

          <p style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 7.5,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--cream-dark)',
            textAlign: 'center',
            marginTop: 24,
            marginBottom: 0,
            lineHeight: 1.6,
          }}>
            Only authorized investigators may access the archives
          </p>
        </div>
      </motion.div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--cream-base)',
      }}>
        <div className="skeleton-cream" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      </main>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
