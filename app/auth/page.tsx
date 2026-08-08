"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (!supabase) {
      setMessage({
        text: "Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        isError: true,
      })
      return
    }

    try {
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })

      if (error) {
        setMessage({ text: error.message, isError: true })
      } else {
        setMessage({
          text:
            mode === "signin"
              ? "Signed in successfully."
              : "Check your email for the confirmation link.",
          isError: false,
        })
      }
    } catch {
      setMessage({ text: "An error occurred. Please try again.", isError: true })
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
        Archive access
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-ink-mute">
        {mode === "signin"
          ? "Access your saved work and continue your research."
          : "An account lets the archive remember your sessions."}
      </p>

      <div className="mt-12 border-t border-line pt-10">
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-8">
            <div>
              <label htmlFor="email" className="label-catalog block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="field mt-3 w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-catalog block">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                className="field mt-3 w-full"
              />
            </div>

            {message && (
              <p
                role={message.isError ? "alert" : "status"}
                className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
                  message.isError ? "text-accent-deep" : "text-ink-mute"
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="border-t border-line pt-8">
              <button type="submit" className="btn btn-primary w-full">
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>

              <p className="mt-6 text-sm leading-relaxed text-ink-mute">
                {mode === "signin" ? (
                  <>
                    No account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup")
                        setMessage(null)
                      }}
                      className="link-editorial"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin")
                        setMessage(null)
                      }}
                      className="link-editorial"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
