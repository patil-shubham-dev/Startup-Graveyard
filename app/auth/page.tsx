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
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")

    if (!supabase) {
      setMessage("Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
      return
    }

    try {
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage(
          mode === "signin"
            ? "Signed in successfully."
            : "Check your email for the confirmation link."
        )
      }
    } catch {
      setMessage("An error occurred. Please try again.")
    }
  }

  return (
    <main>
      <div>
        <p>Access</p>
        <h1>{mode === "signin" ? "Sign in" : "Create account"}</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {message && <p>{message}</p>}

          <button type="submit">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <p>
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button type="button" onClick={() => setMode("signup")}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </main>
  )
}
