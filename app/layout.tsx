export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Source_Serif_4, Crimson_Text } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { PageWrapper } from "@/components/layout/PageWrapper";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Startup Graveyard | Forensic Intelligence Archive",
  description:
    "The world's most comprehensive forensic database of startup failures. Analyze the billion-dollar mistakes.",
  icons: {
    icon: "/assets/logo-icon.svg",
    shortcut: "/assets/logo-icon.svg",
    apple: "/assets/logo-icon.svg",
  },
};

import { getGlobalStats } from "@/lib/db/case-studies";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stats = await getGlobalStats();

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmMono.variable} ${sourceSerif.variable} ${crimsonText.variable} antialiased`}
      suppressHydrationWarning
    >
      <body style={{ backgroundColor: "var(--cream-base)", color: "var(--ink-black)" }}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <ProgressBar />
            <Navigation />
            <main className="relative flex-1">
              <PageWrapper>{children}</PageWrapper>
            </main>
            <Footer stats={stats} />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
