"use client"

import { useState } from "react"
import Link from "next/link"

export default function SubmitPage() {
  const [companyName, setCompanyName] = useState("")
  const [summary, setSummary] = useState("")
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = companyName.trim().length > 0 && reason.trim().length > 0 && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName.trim(), summary: summary.trim(), reason: reason.trim() }),
      })
      if (!res.ok) throw new Error("Submission failed")
      setSubmitted(true)
    } catch {
      setError("The archive could not receive your submission. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
        Submit a case · For the record
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        Add to the archive
      </h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-mute">
        Know a startup that failed and isn&apos;t in the archive? Submit it for review and our
        research team will investigate.
      </p>

      <div className="mt-12 border-t border-line pt-10">
        {submitted ? (
          <div>
            <p className="label-catalog flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
              Received · Review queue
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Your submission has been filed.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink-mute">
              Thank you for contributing. Every submission is read by a human before it enters the
              archive — if it meets our editorial standard, it will appear in the register.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/explore" className="btn btn-primary">
                Return to the archive
              </Link>
              <Link href="/" className="btn btn-outline">
                Back to the home page
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-8">
              <div>
                <label htmlFor="companyName" className="label-catalog block">
                  Company name <span aria-hidden className="text-accent-deep">*</span>
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Theranos"
                  required
                  className="field mt-3 w-full"
                />
              </div>

              <div>
                <label htmlFor="reason" className="label-catalog block">
                  Why did it fail? <span aria-hidden className="text-accent-deep">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe the primary reasons for failure..."
                  rows={3}
                  required
                  className="field field-area mt-3 w-full"
                />
              </div>

              <div>
                <label htmlFor="summary" className="label-catalog block">
                  Summary / background
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What did the company do? Any additional context..."
                  rows={4}
                  className="field field-area mt-3 w-full"
                />
              </div>

              {error && (
                <p role="alert" className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-deep">
                  {error}
                </p>
              )}

              <div className="border-t border-line pt-8">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Submitting…" : "Submit for review"}
                </button>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                  Human review · Evidence over opinion · Submissions may be rejected
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
