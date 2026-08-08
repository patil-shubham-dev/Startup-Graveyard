"use client"

import { PageError } from "@/components/site/PageError"

export default function AskError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageError
      {...props}
      title="The terminal is silent."
      copy="The archive terminal could not be reached. The records are unharmed — try again."
      backHref="/explore"
      backLabel="Back to the archive"
    />
  )
}
