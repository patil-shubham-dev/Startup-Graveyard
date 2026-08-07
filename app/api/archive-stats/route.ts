import { NextResponse } from "next/server";
import { getLedgerStats } from "@/lib/db/case-studies";
import { readAllCases, ledgerFromCases } from "@/lib/archive-ledger";

export async function GET() {
  const cases = readAllCases();
  const ledger = (await getLedgerStats()) || ledgerFromCases(cases);

  return NextResponse.json(
    {
      documented: ledger?.documented ?? cases.length,
      published: ledger?.published ?? cases.filter((c) => c.published).length,
      industries: ledger?.industries ?? 0,
      span: ledger?.span ?? "—",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}