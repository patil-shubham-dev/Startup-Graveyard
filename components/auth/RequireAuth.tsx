'use client'

import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/db/config'

interface RequireAuthProps {
  children: React.ReactNode
  feature: 'pre-mortem' | 'chat'
}

export function RequireAuth({ children, feature }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleGoogleSignIn = useCallback(async () => {
    setSigningIn(true)
    const next = pathname === '/pre-mortem' ? '/pre-mortem' : '/ask'
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
    if (error) {
      console.error('Google sign-in error:', error.message)
      setSigningIn(false)
    }
  }, [pathname])

  const handleCreateAccount = useCallback(async () => {
    setSigningIn(true)
    const next = pathname === '/pre-mortem' ? '/pre-mortem' : '/ask'
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
    if (error) {
      console.error('Google sign-up error:', error.message)
      setSigningIn(false)
    }
  }, [pathname])

  if (!mounted) return null

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        backgroundColor: 'var(--cream-base)',
      }}>
        <div className="skeleton-cream" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      </div>
    )
  }

  if (!user) {
    const titles: Record<string, string> = {
      'pre-mortem': 'Pre-Mortem Intelligence',
      'chat': 'Graveyard Intelligence',
    }
    const descriptions: Record<string, string> = {
      'pre-mortem': 'Sign in to run an AI-powered failure risk assessment on your startup idea.',
      'chat': 'Sign in to ask the Graveyard Keeper about startup failures and patterns.',
    }
    const kickers: Record<string, string> = {
      'pre-mortem': 'PRE-MORTEM //',
      'chat': 'INTEL ARCHIVE //',
    }

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        backgroundColor: 'var(--cream-base)',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(245, 240, 232, 0.6)',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          fontSize: 120,
          fontWeight: 200,
          color: 'var(--cream-dark)',
          opacity: 0.15,
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          lineHeight: 1,
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          0x
        </div>

        {/* Auth gate card */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 440,
          width: '100%',
        }}>
          {/* Stamp */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 32,
          }}>
            <div className="stamp-closed">AUTHENTICATION REQUIRED</div>
          </div>

          {/* Title */}
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
            {titles[feature]}
          </h1>

          {/* Kicker */}
          <div style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--rust-accent)',
            textAlign: 'center',
            marginBottom: 16,
          }}>
            {kickers[feature]}
          </div>

          {/* Description */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.7,
            color: 'var(--ink-muted)',
            textAlign: 'center',
            marginBottom: 40,
            maxWidth: 360,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {descriptions[feature]}
          </p>

          {/* Auth card */}
          <div style={{
            background: 'var(--paper-white)',
            border: '1.5px solid var(--cream-dark)',
            borderRadius: 16,
            padding: '36px 32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}>
            {/* Secure notice */}
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

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
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
                  e.currentTarget.style.background = 'var(--cream-base)'
                  e.currentTarget.style.borderColor = 'var(--rust-accent)'
                }
              }}
              onMouseLeave={(e) => {
                if (!signingIn) {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = 'var(--cream-dark)'
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

            {/* Divider */}
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

            {/* Create Account */}
            <button
              onClick={handleCreateAccount}
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
                  e.currentTarget.style.background = 'var(--cream-base)'
                  e.currentTarget.style.borderColor = 'var(--ochre-signal)'
                }
              }}
              onMouseLeave={(e) => {
                if (!signingIn) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'var(--cream-dark)'
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

            {/* Footnote */}
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
        </div>
      </div>
    )
  }

  return <>{children}</>
}
