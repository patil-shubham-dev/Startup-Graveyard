import type { Metadata } from "next";
import { AskClient } from "./AskClient";
import { getLedgerStats } from "@/lib/db/case-studies";

export const metadata: Metadata = {
  title: "Ask the Archive",
  description:
    "Graveyard Intelligence — a research terminal grounded in the Start-up Graveyard case archive. Ask about failed startups, compare cases, and trace failure patterns.",
};

export default async function AskPage() {
  let grounding = { published: 0, industries: 0 };
  try {
    const stats = await getLedgerStats();
    if (stats) {
      grounding = { published: stats.published, industries: stats.industries };
    }
  } catch {
    // archive stats are cosmetic here; the terminal works without them
  }

  return <AskClient grounding={grounding} />;
}
