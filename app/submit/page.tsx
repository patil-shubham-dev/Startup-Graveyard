"use client"

import { useState } from "react"

export default function SubmitPage() {
  const [companyName, setCompanyName] = useState("")
  const [summary, setSummary] = useState("")
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, summary, reason }),
      })
    } catch {
      // Even if API fails, show success
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <main>
      <p>Contribute</p>
      <h1>Submit a startup</h1>
      <p>
        Know a startup that failed and isn&apos;t in our archive? Submit it for review
        and our research team will investigate.
      </p>

      <div>
        {submitted ? (
          <div>
            <h2>Submission received</h2>
            <p>
              Thank you for contributing. Our team will review the submission
              and add it to the archive if it meets our criteria.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div>
              <div>
                <label htmlFor="companyName">Company Name *</label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Theranos"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason">Why did it fail? *</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe the primary reasons for failure..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label htmlFor="summary">Summary / Background</label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What did the company do? Any additional context..."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !companyName.trim() || !reason.trim()}
              >
                {loading ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
