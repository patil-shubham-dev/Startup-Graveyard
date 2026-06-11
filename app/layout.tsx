export const revalidate = 3600; // Revalidate every hour by default
import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Providers } from "@/lib/providers";
import { Suspense } from "react";

const Footer = dynamic(() => import("@/components/layout/Footer").then(m => m.Footer), {
  loading: () => <footer className="h-24 bg-cream-deep border-t border-cream-dark" />,
});

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
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  preload: false,
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://integrate.api.nvidia.com" />
        <link rel="preconnect" href="https://db.gqohxgwctyfmfbggwvmp.supabase.co" />
        <link rel="dns-prefetch" href="https://integrate.api.nvidia.com" />
        <link rel="dns-prefetch" href="https://db.gqohxgwctyfmfbggwvmp.supabase.co" />
      </head>
      <body style={{ backgroundColor: "var(--cream-base)", color: "var(--ink-black)" }}>
        <AuthProvider>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Suspense fallback={null}>
                <ProgressBar />
              </Suspense>
              <Navigation />
              <main className="relative flex-1">
                <PageWrapper>{children}</PageWrapper>
              </main>
              <Footer />
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
