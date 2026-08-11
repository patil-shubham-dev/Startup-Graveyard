"use client";

import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import { useId, useState } from "react";
import { formatCurrencyCompact } from "@/lib/utils/format";
import styles from "./insights.module.css";

export interface LifespanDatum {
  slug: string;
  name: string;
  start: number;
  end: number;
  years: number;
  funding: number;
  industry: string;
}

interface LifespanRailProps {
  data: LifespanDatum[];
}

/** Fig. 01 — each file as a bar from founding year to shutdown year, drawn
 *  across the archive's time span. Hover or focus a bar for the file's record. */
export function LifespanRail({ data }: LifespanRailProps) {
  const [active, setActive] = useState<string | null>(null);
  const labelId = useId();

  const min = Math.min(...data.map((d) => d.start));
  const max = Math.max(...data.map((d) => d.end));

  const activeRow = data.find((d) => d.slug === active);

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.rail}>
      <div className={styles.railAxis} aria-hidden>
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <div className={styles.railBody} role="list" aria-label="Lifespan of each archived failure">
        {data.map((d, i) => {
          const left = ((d.start - min) / (max - min)) * 100;
          const width = Math.max(((d.end - d.start) / (max - min)) * 100, 0.5);
          const isActive = active === d.slug;
          return (
            <div key={d.slug} className={styles.railRow} role="listitem">
              <Link
                href={`/case/${d.slug}`}
                className={`${styles.railBar} ${isActive ? styles.railBarActive : ""}`}
                style={{ left: `${left}%`, width: `${width}%` }}
                onMouseEnter={() => setActive(d.slug)}
                onFocus={() => setActive(d.slug)}
                onMouseLeave={() => setActive(null)}
                onBlur={() => setActive(null)}
                aria-label={`${d.name} — founded ${d.start}, shutdown ${d.end}, ${d.years} years`}
              >
                <motion.span
                  className={styles.railFill}
                  initial={{ opacity: 0, scaleY: 0.4 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                />
                {isActive && (
                  <span className={styles.railName} aria-hidden>
                    {d.name}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </div>
      <div
        className={styles.railCard}
        role="status"
        aria-live="polite"
        aria-labelledby={labelId}
        data-empty={activeRow ? undefined : true}
      >
        {activeRow ? (
          <>
            <span id={labelId} className={styles.railCardName}>
              {activeRow.name}
            </span>
            <span className={styles.railCardMeta}>
              {activeRow.start}–{activeRow.end} · {activeRow.years} yrs ·{" "}
              {activeRow.industry}
            </span>
            <span className={styles.railCardFunding}>
              {formatCurrencyCompact(activeRow.funding)} raised
            </span>
          </>
        ) : (
          <span id={labelId} className={styles.railCardHint}>
            Hover a record to read it
          </span>
        )}
      </div>
    </div>
      </MotionConfig>
  );
}
