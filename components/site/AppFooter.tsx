"use client";

import { usePathname } from "next/navigation";

/**
 * The site footer is a root-layout concern rendered for every page EXCEPT
 * the ASK application shell (and its error states) and the INSIGHTS report.
 * Both are self-contained surfaces with their own bespoke closing: ASK is a
 * full-screen app, INSIGHTS closes with its own colophon.
 */
export function AppFooter({ footer }: { footer: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/ask" || pathname.startsWith("/ask/")) return null;
  if (pathname === "/insights" || pathname.startsWith("/insights/")) return null;
  return <>{footer}</>;
}