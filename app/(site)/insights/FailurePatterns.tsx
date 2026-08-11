"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { formatCurrencyCompact } from "@/lib/utils/format";
import { SpecimenMark } from "./ornaments";
import styles from "./insights.module.css";

export interface PatternCase {
  slug: string;
  name: string;
  year: number;
  funding: number;
}

export interface PatternPlateData {
  name: string;
  count: number;
  pctOfFiles: number;
  avgFunding: number;
  avgLifespan: number;
  industries: string[];
  confidence: string;
  cases: PatternCase[];
}

interface FailurePatternsProps {
  patterns: PatternPlateData[];
}

/** Chapter III — the archive's failure patterns as laboratory specimens:
 *  hover a plate to peek at its record, open it to read the case list. */
export function FailurePatterns({ patterns }: FailurePatternsProps) {
  const [open, setOpen] = useState<number | null>(null);
  const topCount = patterns[0]?.count || 1;

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.specimenList}>
      {patterns.map((p, i) => {
        const isOpen = open === i;
        return (
          <article key={p.name} className={`${styles.specimen} ${isOpen ? styles.specimenOpen : ""}`}>
            <div className={styles.specimenPrevalence} aria-hidden>
              <span style={{ width: `${Math.max(3, Math.round((p.count / topCount) * 100))}%` }} />
            </div>
            <button
              type="button"
              className={styles.specimenHeader}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <SpecimenMark number={String(i + 1).padStart(2, "0")} />
              <span className={styles.specimenTitle}>
                <span className={styles.specimenName}>{p.name}</span>
                <span className={styles.specimenCount}>
                  {p.count} {p.count === 1 ? "file" : "files"} · {p.pctOfFiles}% of archive
                </span>
              </span>
              <span className={styles.specimenPeek} aria-hidden>
                {formatCurrencyCompact(p.avgFunding)} avg · {p.avgLifespan} yr avg · {p.confidence}
              </span>
              <svg
                aria-hidden
                className={`${styles.specimenChevron} ${isOpen ? styles.specimenChevronOpen : ""}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
              >
                <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  className={styles.specimenPanel}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PatternRecord p={p} />
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
      </MotionConfig>
  );
}

function PatternRecord({ p }: { p: PatternPlateData }) {
  return (
    <div className={styles.specimenRecord}>
      <dl className={styles.specimenMeta}>
        <div>
          <dt>Average funding</dt>
          <dd>{formatCurrencyCompact(p.avgFunding)}</dd>
        </div>
        <div>
          <dt>Average lifespan</dt>
          <dd>{p.avgLifespan} yrs</dd>
        </div>
        <div>
          <dt>Evidence confidence</dt>
          <dd>{p.confidence}</dd>
        </div>
        <div>
          <dt>Industries affected</dt>
          <dd>{p.industries.length ? p.industries.join(" · ") : "—"}</dd>
        </div>
      </dl>
      <ul className={styles.specimenCases} role="list">
        {p.cases.map((c) => (
          <li key={c.slug}>
            <Link href={`/case/${c.slug}`} className={styles.specimenCaseLink}>
              <span className={styles.specimenCaseName}>{c.name}</span>
              <span className={styles.specimenCaseMeta}>
                {c.year || "—"} · {formatCurrencyCompact(c.funding)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
