"use client";

import { motion, MotionConfig } from "framer-motion";
import styles from "./insights.module.css";

export interface BarDatum {
  label: string;
  sub: string;
  display: string;
  pct: number;
}

interface AnimatedBarsProps {
  data: BarDatum[];
  tone?: "paper" | "well";
  unit?: string;
}

/** Small engraved bar plates: bars draw from zero once in view. Used for the
 *  pace figures and the correlation plates. */
export function AnimatedBars({ data, tone = "paper", unit = "" }: AnimatedBarsProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.barPlate} role="list">
        {data.map((d, i) => (
          <div key={d.label} className={styles.barRow} role="listitem">
            <div className={styles.barHead}>
              <span className={styles.barLabel}>{d.label}</span>
              <span className={styles.barSub}>{d.sub}</span>
            </div>
            <div className={tone === "well" ? styles.barTrackWell : styles.barTrack}>
              <motion.div
                className={styles.barFill}
                initial={{ width: 0 }}
                whileInView={{ width: `${d.pct}%` }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className={styles.barValue} aria-label={`${d.label}: ${d.display}${unit}`}>
              {d.display}
              <span aria-hidden className={styles.barUnit}>
                {unit}
              </span>
            </span>
          </div>
        ))}
      </div>
    </MotionConfig>
  );
}
