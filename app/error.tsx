"use client"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. Our team has been notified.</p>
      <button onClick={reset}>Try again</button>
    </main>
  )
}
