"use client";

import { CountUp } from "./CountUp";
import styles from "./insights.module.css";

export interface StatCell {
  label: string;
  value: number;
  format: "int" | "currency" | "pct" | "years";
  context: string;
  stamp: string;
}

interface StatLedgerProps {
  cells: StatCell[];
}

/** Chapter I — The record: the archive's headline figures, each with the
 *  supporting context that turns a number into a documented claim. */
export function StatLedger({ cells }: StatLedgerProps) {
  return (
    <dl className={styles.statLedger}>
      {cells.map((cell) => (
        <div key={cell.label} className={styles.statCell}>
          <dt className={styles.statStamp}>{cell.stamp}</dt>
          <dd className={styles.statValue}>
            <CountUp value={cell.value} format={cell.format} />
          </dd>
          <dt className={styles.statLabel}>{cell.label}</dt>
          <dd className={styles.statContext}>{cell.context}</dd>
        </div>
      ))}
    </dl>
  );
}
