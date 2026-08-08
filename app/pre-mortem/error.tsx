"use client"

import { PageError } from "@/components/site/PageError"

export default function PreMortemError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageError
      {...props}
      title="The examination was interrupted."
      copy="The pre-mortem instrument could not be prepared. The records are unharmed — try again."
      backHref="/explore"
      backLabel="Back to the archive"
    />
  )
}
