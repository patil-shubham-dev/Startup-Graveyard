import Link from "next/link"

export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p>
        This page doesn&apos;t exist. It may have been buried, or you may have
        followed a broken link.
      </p>
      <Link href="/">Return to the Graveyard</Link>
    </main>
  )
}
