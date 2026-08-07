"use client"

export default function InsightsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <p>Failed to load insights.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
