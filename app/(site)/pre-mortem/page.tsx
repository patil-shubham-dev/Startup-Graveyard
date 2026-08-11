import type { Metadata } from "next";
import { PreMortemClient } from "./components/PreMortemClient";
import { getLedgerStats } from "@/lib/db/case-studies";

export const metadata: Metadata = {
  title: "Pre-mortem Analysis — Start-up Graveyard",
  description:
    "Describe your startup idea and we will interrogate it against documented failure cases before you commit years to it.",
};

export const dynamic = "force-dynamic";

export default async function PreMortemPage() {
  const stats = await getLedgerStats();
  const documentedCases = stats?.documented ?? 0;

  return (
    <main>
      <PreMortemClient documentedCases={documentedCases} />
    </main>
  );
}
