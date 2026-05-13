import type { Metadata } from "next";
import { Playfair_Display, DM_Serif_Display, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ChatOverlay } from "@/components/layout/ChatOverlay";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { PageWrapper } from "@/components/layout/PageWrapper";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-header",
  weight: "400",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Startup Graveyard | Forensic Intelligence Archive",
  description: "The world's most comprehensive forensic database of startup failures. Analyze the billion-dollar mistakes.",
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
      className={`${playfair.variable} ${dmSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-screen overflow-hidden antialiased`}
      suppressHydrationWarning
    >
      <body className="h-screen overflow-hidden bg-bg-base text-text-primary font-body selection:bg-violet-500/30">
        <AuthProvider>
          <div className="flex h-screen flex-col relative overflow-hidden">
            {/* Global Texture Overlays */}
            <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.035] bg-noise" />
            <div className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.01] bg-grid-fine" />
            <div className="fixed inset-0 pointer-events-none z-[9997] bg-vignette" />
            
            <ProgressBar />
            <Navigation />
            <main className="flex-1 relative overflow-hidden">
              <PageWrapper>
                {children}
              </PageWrapper>
            </main>
            <Footer stats={stats} />
            <ChatOverlay />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
