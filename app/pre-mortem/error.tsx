"use client"

export default function PreMortemError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <p>Failed to load the pre-mortem tool.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
