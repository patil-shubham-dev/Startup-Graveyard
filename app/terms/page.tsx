import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
}

export default function TermsPage() {
  return (
    <main>
      <p>Legal</p>
      <h1>Terms of Service</h1>
      <div>
        <p>
          By using Start-up Graveyard, you agree to these terms. The content
          on this site is for educational and research purposes.
        </p>
        <h3>Content</h3>
        <p>
          Case studies are generated with AI assistance and may contain
          inaccuracies. Cross-reference critical information before making
          decisions based on our content.
        </p>
        <h3>Use</h3>
        <p>
          You may use this site for personal, educational, and research
          purposes. Commercial use or redistribution of the content without
          attribution is not permitted.
        </p>
        <h3>Disclaimer</h3>
        <p>
          This site is provided &ldquo;as is&rdquo; without warranties of any
          kind. We are not responsible for decisions made based on the
          information presented here.
        </p>
      </div>
    </main>
  )
}
