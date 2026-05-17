export const revalidate = 3600; // Revalidate every hour by default
import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Suspense } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://startupgraveyard.com'),
  title: "Startup Graveyard | Forensic Intelligence Archive",
  description:
    "The world's most comprehensive forensic database of startup failures. Analyze the billion-dollar mistakes, death spirals, and autopsy reports of failed ventures.",
  keywords: ["startup failures", "post-mortem", "business autopsies", "entrepreneurship risk", "venture capital", "why startups fail"],
  authors: [{ name: "Forensic Intelligence Team" }],
  openGraph: {
    title: "Startup Graveyard | Forensic Intelligence Archive",
    description: "Analyze the billion-dollar mistakes of failed ventures.",
    url: "https://startupgraveyard.com",
    siteName: "Startup Graveyard",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Startup Graveyard Forensic Archive",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Startup Graveyard | Forensic Intelligence Archive",
    description: "Analyze the billion-dollar mistakes of failed ventures.",
    images: ["/assets/og-image.jpg"],
  },
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
      className={`${cormorant.variable} ${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className={`${cormorant.variable} ${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable}`} style={{ backgroundColor: "var(--cream-base)", color: "var(--ink-black)" }}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Suspense fallback={null}>
              <ProgressBar />
            </Suspense>
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
