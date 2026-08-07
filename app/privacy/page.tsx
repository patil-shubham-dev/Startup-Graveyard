import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
}

export default function PrivacyPage() {
  return (
    <main>
      <p>Legal</p>
      <h1>Privacy Policy</h1>
      <div>
        <p>
          Start-up Graveyard respects your privacy. This policy explains how
          we collect, use, and protect your information.
        </p>
        <h3>Information We Collect</h3>
        <p>
          We collect minimal information: email address (if you sign up) and
          usage analytics via Simple Analytics (anonymous, no cookies). Chat
          conversations are stored temporarily for the AI to function.
        </p>
        <h3>Data Sharing</h3>
        <p>
          We do not sell your data. Chat data is sent to our AI provider
          (NVIDIA NIM) for processing. Analytics are collected by Simple
          Analytics, which is privacy-focused and does not track across sites.
        </p>
        <h3>Contact</h3>
        <p>
          For privacy-related inquiries, please open an issue on our GitHub
          repository.
        </p>
      </div>
    </main>
  )
}
