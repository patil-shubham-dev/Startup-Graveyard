"use client"

export default function ExploreError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <p>Failed to load the archive.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
