import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
}

const SECTIONS = [
  {
    heading: "Information we collect",
    body: "We collect minimal information: email address (if you sign up) and usage analytics via Simple Analytics (anonymous, no cookies). Chat conversations are stored temporarily for the AI to function.",
  },
  {
    heading: "Data sharing",
    body: "We do not sell your data. Chat data is sent to our AI provider (NVIDIA NIM) for processing. Analytics are collected by Simple Analytics, which is privacy-focused and does not track across sites.",
  },
  {
    heading: "Contact",
    body: "For privacy-related inquiries, please open an issue on our GitHub repository.",
  },
] as const

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
        Legal · Record
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        Privacy Policy
      </h1>

      <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink-mute">
        Start-up Graveyard respects your privacy. This policy explains how we
        collect, use, and protect your information.
      </p>

      <div className="mt-10">
        {SECTIONS.map((s) => (
          <section key={s.heading} className="border-t border-line py-8 first:border-t-0 first:pt-0">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{s.heading}</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-mute">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
