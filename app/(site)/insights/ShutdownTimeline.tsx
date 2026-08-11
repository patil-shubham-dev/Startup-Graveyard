"use client";

import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import { useId, useState } from "react";
import styles from "./insights.module.css";

export interface TimelineCase {
  slug: string;
  name: string;
  industry: string;
}

export interface TimelineYear {
  year: number;
  count: number;
  cases: TimelineCase[];
}

interface ShutdownTimelineProps {
  data: TimelineYear[];
}

/** Chapter IV — shutdowns by year as a ruled historical chart. Bars grow from
 *  the baseline; hover or focus a bar to read that year's case files. */
export function ShutdownTimeline({ data }: ShutdownTimelineProps) {
  const [active, setActive] = useState<number | null>(null);
  const cardId = useId();
  const max = Math.max(...data.map((d) => d.count), 1);
  const activeYear = data.find((d) => d.year === active) ?? null;

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.timeline}>
      <div className={styles.timelinePlot} role="img" aria-label="Shutdowns by year, charted across the archive span">
        <div className={styles.timelineRows} aria-hidden>
          {[max, Math.ceil(max / 2), 0].map((v) => (
            <span key={v} className={styles.timelineRowLine}>
              {v}
            </span>
          ))}
        </div>
        <div className={styles.timelineBars}>
          {data.map((d, i) => {
            const isActive = active === d.year;
            return (
              <div key={d.year} className={styles.timelineCol}>
                <button
                  type="button"
                  className={`${styles.timelineBar} ${isActive ? styles.timelineBarActive : ""}`}
                  style={{ height: `${Math.max(6, Math.round((d.count / max) * 100))}%` }}
                  onMouseEnter={() => setActive(d.year)}
                  onFocus={() => setActive(d.year)}
                  onMouseLeave={() => setActive(null)}
                  onBlur={() => setActive(null)}
                  aria-label={`${d.year}: ${d.count} shutdown${d.count === 1 ? "" : "s"} — ${d.cases
                    .map((c) => c.name)
                    .join(", ")}`}
                >
                  <motion.span
                    className={styles.timelineFill}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.9, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                </button>
                <span className={`${styles.timelineYear} ${isActive ? styles.timelineYearActive : ""}`}>
                  {d.year}
                </span>
              </div>
            );
          })}
        </div>
        <div className={styles.timelineBase} aria-hidden />
      </div>

      <div
        className={styles.timelineCard}
        role="status"
        aria-live="polite"
        aria-labelledby={cardId}
        data-empty={activeYear ? undefined : true}
      >
        {activeYear ? (
          <>
            <span id={cardId} className={styles.timelineCardHead}>
              {activeYear.year} — {activeYear.count} file{activeYear.count === 1 ? "" : "s"} closed
            </span>
            <ul className={styles.timelineCardCases} role="list">
              {activeYear.cases.map((c) => (
                <li key={c.slug}>
                  <Link href={`/case/${c.slug}`} className={styles.timelineCaseLink}>
                    <span>{c.name}</span>
                    <span className={styles.timelineCaseIndustry}>{c.industry}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <span id={cardId} className={styles.timelineCardHead}>
            Select a year to read its case files
          </span>
        )}
      </div>
    </div>
      </MotionConfig>
  );
}
