"use client"

import { PageError } from "@/components/site/PageError"

export default function CaseError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageError
      {...props}
      title="This case file is misfiled."
      copy="The dossier could not be opened. The records are unharmed — try again, or return to the register."
      backHref="/explore"
      backLabel="Back to the archive"
    />
  )
}
