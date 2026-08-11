"use client";

import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import { formatCurrencyCompact } from "@/lib/utils/format";
import styles from "./insights.module.css";

export interface CapitalRowData {
  rank: number;
  slug: string;
  name: string;
  funding: number;
  industry: string;
  year: number;
  lifespan: number;
  team: number;
  reasons: string[];
}

interface CapitalRankingProps {
  data: CapitalRowData[];
}

/** Chapter VI — capital destroyed, set as a financial report on the dark
 *  well. Every company in the archive is a line on the ledger; hover a line
 *  to read its record. */
export function CapitalRanking({ data }: CapitalRankingProps) {
  const max = Math.max(...data.map((d) => d.funding), 1);

  return (
    <MotionConfig reducedMotion="user">
      <ol className={styles.ledger} role="list">
      {data.map((d, i) => {
        const pct = Math.max(3, Math.round((d.funding / max) * 100));
        return (
          <li key={d.slug}>
            <Link href={`/case/${d.slug}`} className={styles.ledgerRow}>
              <span className={styles.ledgerRank}>{String(d.rank).padStart(2, "0")}</span>
              <span className={styles.ledgerBody}>
                <span className={styles.ledgerHead}>
                  <span className={styles.ledgerName}>{d.name}</span>
                  <span className={styles.ledgerMeta}>
                    {d.industry} · {d.year || "—"}
                  </span>
                </span>
                <span className={styles.ledgerTrack} aria-hidden>
                  <motion.span
                    className={styles.ledgerFill}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 1.1, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span className={styles.ledgerDetail} aria-hidden>
                  {d.lifespan ? `${d.lifespan} yrs on record` : "—"} ·{" "}
                  {d.team ? `${d.team.toLocaleString()} at peak` : "—"} ·{" "}
                  {d.reasons.join(" / ") || "—"}
                </span>
              </span>
              <span className={styles.ledgerAmount}>{formatCurrencyCompact(d.funding)}</span>
            </Link>
          </li>
        );
      })}
      </ol>
      </MotionConfig>
  );
}
