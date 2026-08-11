"use client";

import { motion, MotionConfig } from "framer-motion";
import { useMemo, useState } from "react";
import styles from "./insights.module.css";

export interface GenomeNodeData {
  id: string;
  name: string;
  count: number;
  x: number;
  y: number;
  r: number;
  labelX: "left" | "right" | "center";
}

export interface GenomeLinkData {
  source: string;
  target: string;
  weight: number;
  d: string;
}

interface FailureGenomeProps {
  nodes: GenomeNodeData[];
  links: GenomeLinkData[];
  width: number;
  height: number;
}

/** Chapter VIII — the failure genome: causes as specimens, lines as
 *  co-occurrences inside the same case file. Hover a cause to trace its
 *  relationships; the plate is pure SVG, drawn on reveal. */
export function FailureGenome({ nodes, links, width, height }: FailureGenomeProps) {
  const [active, setActive] = useState<string | null>(null);
  const linkById = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const link of links) {
      const a = map.get(link.source) || new Set<string>();
      a.add(link.target);
      map.set(link.source, a);
      const b = map.get(link.target) || new Set<string>();
      b.add(link.source);
      map.set(link.target, b);
    }
    return map;
  }, [links]);

  const opacityFor = (link: GenomeLinkData): number => {
    if (active === null) return 0.34;
    const neighbours = linkById.get(active);
    if (neighbours?.has(link.source) && neighbours.has(link.target)) return 0.95;
    if (link.source === active || link.target === active) return 0.95;
    return 0.08;
  };

  const nodeOpacity = (id: string): number => {
    if (active === null || active === id) return 1;
    return linkById.get(active)?.has(id) ? 1 : 0.25;
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.genomeFrame}>
      <div className={styles.genomeScroll}>
        <svg
          className={styles.genome}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Failure genome: causes connected by co-occurrence within case files. Cash Exhaustion is the central hub."
          style={{ minWidth: 560 }}
        >
          <g>
            {links.map((link, i) => (
              <motion.path
                key={`${link.source}::${link.target}`}
                d={link.d}
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth={Math.min(0.6 + link.weight * 0.45, 2.6)}
                style={{ opacity: opacityFor(link), transition: "opacity 0.25s ease" }}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.1, delay: 0.15 + i * 0.035, ease: "easeInOut" }}
              />
            ))}
          </g>
          <g>
            {nodes.map((node, i) => {
              const isActive = active === node.id;
              const labelX =
                node.labelX === "left"
                  ? node.x - node.r - 12
                  : node.labelX === "right"
                    ? node.x + node.r + 12
                    : node.x;
              const anchor = node.labelX === "left" ? "end" : node.labelX === "right" ? "start" : "middle";
              const labelY = node.labelX === "center" ? node.y + node.r + 16 : node.y + 4;
              return (
                <motion.g
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  className={styles.genomeNode}
                  style={{ opacity: nodeOpacity(node.id), transition: "opacity 0.25s ease" }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }}
                  onMouseEnter={() => setActive(node.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(node.id)}
                  onBlur={() => setActive(null)}
                  aria-label={`${node.name} — ${node.count} case file${node.count === 1 ? "" : "s"}`}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    fill={isActive ? "var(--color-accent-deep)" : "var(--color-paper)"}
                    stroke={isActive ? "var(--color-accent-deep)" : "var(--color-ink)"}
                    strokeWidth={1}
                    style={{ transition: "fill 0.2s ease, stroke 0.2s ease" }}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r - 3}
                    fill="none"
                    stroke={isActive ? "var(--color-paper)" : "var(--color-ink-mute)"}
                    strokeWidth={0.5}
                    strokeDasharray="1 3"
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor={anchor}
                    className={styles.genomeLabel}
                    fill={isActive ? "var(--color-accent-deep)" : "var(--color-ink)"}
                    style={{ transition: "fill 0.2s ease" }}
                  >
                    {node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 3}
                    textAnchor="middle"
                    className={styles.genomeCount}
                    fill={isActive ? "var(--color-paper)" : "var(--color-ink-mute)"}
                  >
                    {node.count}
                  </text>
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>
      </div>
      </MotionConfig>
  );
}
