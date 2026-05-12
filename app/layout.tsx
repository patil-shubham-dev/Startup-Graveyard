import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ChatOverlay } from "@/components/layout/ChatOverlay";
import { ProgressBar } from "@/components/layout/ProgressBar";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Startup Graveyard AI | Learn from Startup Failures",
  description: "AI-powered intelligence platform documenting and analyzing startup failures to help founders avoid fatal mistakes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08080D] text-[#F1F5F9] font-body">
        <AuthProvider>
          <ProgressBar />
          <Navigation />
          <div className="flex-1">
            {children}
          </div>
          <ChatOverlay />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
