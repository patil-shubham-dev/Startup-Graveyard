"use client"

export default function AskError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <p>Failed to load the chat interface.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
