"use client"

import Link from "next/link"

export default function CaseError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <p>Failed to load this case study.</p>
      <div>
        <button onClick={reset}>Try again</button>
        <Link href="/explore">Back to archive</Link>
      </div>
    </div>
  )
}
