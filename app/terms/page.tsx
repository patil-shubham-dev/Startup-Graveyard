import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
}

const SECTIONS = [
  {
    heading: "Agreement",
    body: "By using Start-up Graveyard, you agree to these terms. The content on this site is for educational and research purposes.",
  },
  {
    heading: "Content",
    body: "Case studies are generated with AI assistance and may contain inaccuracies. Cross-reference critical information before making decisions based on our content.",
  },
  {
    heading: "Use",
    body: "You may use this site for personal, educational, and research purposes. Commercial use or redistribution of the content without attribution is not permitted.",
  },
  {
    heading: "Disclaimer",
    body: "This site is provided \u201cas is\u201d without warranties of any kind. We are not responsible for decisions made based on the information presented here.",
  },
] as const

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
        Legal · Record
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        Terms of Service
      </h1>

      <div className="mt-12">
        {SECTIONS.map((s) => (
          <section key={s.heading} className="border-t border-line py-8 first:border-t-0 first:pt-0">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{s.heading}</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-mute">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
