import Link from "next/link"

export default function CaseNotFound() {
  return (
    <div>
      <p>This case study was not found in the archive.</p>
      <Link href="/explore">Browse all cases</Link>
    </div>
  )
}
