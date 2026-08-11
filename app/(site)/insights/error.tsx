"use client"

import { PageError } from "@/components/site/PageError"

export default function InsightsError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageError
      {...props}
      title="The findings could not be collated."
      copy="Something went wrong while computing the research figures. The records are unharmed — try again."
      backHref="/explore"
      backLabel="Back to the archive"
    />
  )
}
