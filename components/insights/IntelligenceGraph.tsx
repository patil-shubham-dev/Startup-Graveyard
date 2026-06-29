'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { IntelligenceGraphNode, IntelligenceGraphLink } from '@/lib/db/insights-data';

interface Props {
  nodes: IntelligenceGraphNode[];
  links: IntelligenceGraphLink[];
  hasData: boolean;
}

interface NodePos {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_COLORS: Record<string, string> = {
  failure_cause: '#980002',
  founder_mistake: '#B54A2A',
  industry: '#3B82F6',
  business_model: '#6B7B6E',
  economic_event: '#7C3AED',
  company: '#FDFAF5',
  outcome: '#7A6F65',
};

const NODE_LABEL_COLORS: Record<string, string> = {
  failure_cause: '#FFFFFF',
  founder_mistake: '#FFFFFF',
  industry: '#FFFFFF',
  business_model: '#FFFFFF',
  economic_event: '#FFFFFF',
  company: '#1A1714',
  outcome: '#FFFFFF',
};

const NODE_RADIUS: Record<string, number> = {
  failure_cause: 16,
  founder_mistake: 14,
  industry: 14,
  business_model: 12,
  economic_event: 13,
  company: 11,
  outcome: 10,
};

const STRENGTH_OPACITY: Record<string, number> = {
  strong: 0.6,
  medium: 0.35,
  weak: 0.15,
};

const STRENGTH_WIDTH: Record<string, number> = {
  strong: 2.5,
  medium: 1.5,
  weak: 0.8,
};

const TYPE_LABELS: Record<string, string> = {
  failure_cause: 'FAILURE CAUSE',
  founder_mistake: 'FOUNDER MISTAKE',
  industry: 'INDUSTRY',
  business_model: 'BUSINESS MODEL',
  economic_event: 'ECONOMIC EVENT',
  company: 'COMPANY',
  outcome: 'OUTCOME',
};

function computeInitialPositions(nodes: IntelligenceGraphNode[], w: number, h: number): NodePos[] {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.35;
  return nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const hash = ((i * 9301 + 49297) % 233280) / 233280;
    return {
      id: n.id,
      x: cx + radius * Math.cos(angle) + (hash - 0.5) * 60,
      y: cy + radius * Math.sin(angle) + (hash - 0.5) * 60,
      vx: 0,
      vy: 0,
    };
  });
}

export default function IntelligenceGraph({ nodes: rawNodes, links: rawLinks, hasData }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<NodePos[]>([]);
  const [simReady, setSimReady] = useState(false);
  const [selectedNode, setSelectedNode] = useState<IntelligenceGraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ w: 900, h: 600 });
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [highlightMode, setHighlightMode] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ w: rect.width, h: Math.max(600, rect.height) });
  }, []);

  const initPositions = useMemo(() => {
    if (!rawNodes.length) return [];
    const w = Math.max(dimensions.w, 600);
    const h = Math.max(dimensions.h, 450);
    return computeInitialPositions(rawNodes, w, h);
  }, [rawNodes, dimensions]);

  useEffect(() => {
    if (initPositions.length === 0) return;

    let running = true;
    let frameCount = 0;
    let frameId = 0;
    const sim = initPositions.map(p => ({ ...p }));
    const W = dimensions.w;
    const H = dimensions.h;
    const cx = W / 2;
    const cy = H / 2;
    const alpha = 1;
    const alphaMin = 0.001;
    const alphaDecay = 0.0228;

    frameId = requestAnimationFrame(function initFrame() {
      if (!running) return;
      setPositions(sim.map(p => ({ ...p })));

      function tick() {
        if (!running) return;
        const currentAlpha = sim.length > 0 ? alpha * Math.pow(1 - alphaDecay, frameCount) : 0;

        if (currentAlpha < alphaMin || sim.length === 0) {
          setSimReady(true);
          return;
        }

        for (let i = 0; i < sim.length; i++) {
          const a = sim[i];
          let fx = 0, fy = 0;

          for (let j = i + 1; j < sim.length; j++) {
            const b = sim[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1) { dist = 1; }
            const force = (600 * currentAlpha) / (dist * dist);
            fx -= force * (dx / dist);
            fy -= force * (dy / dist);
          }

          fx += (cx - a.x) * 0.01 * currentAlpha;
          fy += (cy - a.y) * 0.01 * currentAlpha;

          let linkFx = 0, linkFy = 0;
          for (const l of rawLinks) {
            let target: NodePos | undefined;
            if (l.source === a.id) target = sim.find(n => n.id === l.target);
            if (l.target === a.id) target = sim.find(n => n.id === l.source);
            if (!target) continue;
            const dx = target.x - a.x;
            const dy = target.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const idealDist = 120;
            const force = (dist - idealDist) * 0.02 * currentAlpha;
            linkFx += force * (dx / dist);
            linkFy += force * (dy / dist);
          }

          a.vx = (a.vx + fx + linkFx) * 0.6;
          a.vy = (a.vy + fy + linkFy) * 0.6;
          a.x += a.vx;
          a.y += a.vy;
          a.x = Math.max(40, Math.min(W - 40, a.x));
          a.y = Math.max(40, Math.min(H - 40, a.y));
        }

        frameCount++;
        if (frameCount < 300) {
          frameId = requestAnimationFrame(tick);
        } else {
          setPositions(sim.map(p => ({ ...p })));
          setSimReady(true);
        }
      }

      frameId = requestAnimationFrame(tick);
    });

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
    };
  }, [initPositions, rawLinks, dimensions]);

  const posMap = useMemo(() => {
    const map = new Map<string, NodePos>();
    for (const p of positions) map.set(p.id, p);
    return map;
  }, [positions]);

  const getConnected = useCallback((nodeId: string): Set<string> => {
    const connected = new Set<string>();
    for (const l of rawLinks) {
      if (l.source === nodeId) connected.add(l.target);
      if (l.target === nodeId) connected.add(l.source);
    }
    return connected;
  }, [rawLinks]);

  const selectedConnections = selectedNode ? getConnected(selectedNode.id) : new Set<string>();
  const maxRelated = rawNodes.length > 0 ? Math.max(...rawNodes.map(n => n.relatedCount), 1) : 1;

  const discoveries = useMemo(() =>
    rawNodes.filter(n => n.relatedCount > 0).sort((a, b) => b.relatedCount - a.relatedCount).slice(0, 3),
  [rawNodes]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setViewTransform(v => ({ ...v, scale: Math.max(0.2, Math.min(4, v.scale * (1 + delta))) }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && e.target === svgRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y });
    }
  }, [viewTransform.x, viewTransform.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setViewTransform(v => ({
        ...v, x: e.clientX - panStart.x, y: e.clientY - panStart.y,
      }));
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  if (!hasData || !rawNodes.length) {
    return (
      <div style={{
        height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--cream-deep)', border: '1.5px dashed var(--cream-dark)', borderRadius: '2px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)' }}>
            INSUFFICIENT DATA
          </div>
          <p style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '13px', color: 'var(--ink-muted)', marginTop: '8px' }}>
            More data needed to build the intelligence graph.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: color, border: type === 'company' ? '1px solid var(--cream-dark)' : 'none' }} />
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                {TYPE_LABELS[type]}
              </span>
            </div>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', color: 'var(--ink-muted)' }}>
          {rawNodes.length} nodes · {rawLinks.length} connections
        </span>
      </div>

      {discoveries.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {discoveries.map((d, i) => {
            const labels = ['Most Connected', 'Highest Risk', 'Widest Impact'];
            const pd = posMap.get(d.id);
            return (
              <button
                key={d.id}
                onClick={() => {
                  setHighlightMode(highlightMode === d.id ? null : d.id);
                  if (pd) setViewTransform({ x: -pd.x * 1.5 + dimensions.w / 2, y: -pd.y * 1.5 + dimensions.h / 2, scale: 1.5 });
                }}
                style={{
                  padding: '6px 12px',
                  background: highlightMode === d.id ? NODE_COLORS[d.type] || 'var(--rust-accent)' : 'transparent',
                  border: `1px solid ${highlightMode === d.id ? 'transparent' : NODE_COLORS[d.type] || 'var(--cream-dark)'}`,
                  borderRadius: '2px', cursor: 'pointer',
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: highlightMode === d.id ? 'white' : NODE_COLORS[d.type] || 'var(--ink-muted)',
                  transition: 'all 0.15s',
                }}
              >
                {labels[i] || 'Discovery'}: {d.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          backgroundColor: 'var(--ink-black)', border: '1.5px dashed var(--cream-dark)', borderRadius: '2px',
          overflow: 'hidden', position: 'relative', height: '620px', cursor: isPanning ? 'grabbing' : 'grab',
        }}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%" height="100%"
          style={{ display: 'block', background: 'transparent' }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        >
          <g transform={`translate(${viewTransform.x},${viewTransform.y}) scale(${viewTransform.scale})`}>
            {rawLinks.map((link, i) => {
              const source = posMap.get(link.source);
              const target = posMap.get(link.target);
              if (!source || !target) return null;
              const isActive = selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target);
              const isHL = highlightMode && (highlightMode === link.source || highlightMode === link.target);
              return (
                <line key={i} x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                  stroke="var(--cream-dark)"
                  strokeWidth={isActive || isHL ? 3 : STRENGTH_WIDTH[link.strength] || 0.8}
                  opacity={isActive || isHL ? 0.7 : STRENGTH_OPACITY[link.strength] || 0.15}
                />
              );
            })}

            {positions.map((pos) => {
              const node = rawNodes.find(n => n.id === pos.id);
              if (!node) return null;
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const isHL = highlightMode === node.id;
              const isConnected = selectedNode && selectedConnections.has(node.id);
              const isDimmed = selectedNode && node.id !== selectedNode.id && !isConnected;

              const color = NODE_COLORS[node.type] || 'var(--cream-dark)';
              const labelColor = NODE_LABEL_COLORS[node.type] || 'var(--ink-black)';
              const baseRadius = NODE_RADIUS[node.type] || 10;
              const r = isSelected ? baseRadius + 6 : isHovered || isHL ? baseRadius + 3 : baseRadius;
              const scale = node.relatedCount / maxRelated;
              const sr = r + scale * 6;

              return (
                <g key={node.id} transform={`translate(${pos.x},${pos.y})`} opacity={isDimmed ? 0.12 : 1}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    setSelectedNode(isSelected ? null : node);
                    if (!isSelected) setViewTransform(v => ({ ...v, scale: 1.2 }));
                  }}
                >
                  {(isHovered || isSelected || isHL) && <circle r={sr + 14} fill={color} opacity={0.08} />}
                  <circle r={sr} fill={isSelected || isHL ? color : 'var(--cream-base)'} stroke={color} strokeWidth={isSelected || isHL ? 3 : 1.5} />
                  <text y={1.5} textAnchor="middle" dominantBaseline="central"
                    fill={isSelected || isHL ? 'white' : labelColor}
                    fontSize={node.label.length > 14 ? '5px' : '6px'} fontWeight="600"
                    fontFamily="var(--font-dm-mono), monospace"
                  >
                    {node.label.slice(0, 14)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {!simReady && (
          <div style={{
            position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', color: 'rgba(253,250,245,0.4)',
            background: 'rgba(0,0,0,0.6)', padding: '6px 14px', borderRadius: '2px',
          }}>
            Computing Intelligence Map...
          </div>
        )}

        {!selectedNode && (
          <div style={{
            position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', color: 'rgba(253,250,245,0.35)',
            background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: '2px', whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            Click any node to explore · Scroll to zoom · Drag to pan
          </div>
        )}
      </div>

      {selectedNode && (
        <div style={{
          marginTop: '16px', backgroundColor: 'var(--paper-white)', border: '1.5px dashed var(--cream-dark)',
          borderLeft: `4px solid ${NODE_COLORS[selectedNode.type] || 'var(--rust-accent)'}`,
          borderRadius: '2px', padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', color: NODE_COLORS[selectedNode.type] || 'var(--rust-accent)', marginBottom: '4px' }}>
                {TYPE_LABELS[selectedNode.type] || selectedNode.type.toUpperCase()} · {selectedNode.relatedCount} connections
              </div>
              <h3 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '22px', fontWeight: '600', color: 'var(--ink-black)', lineHeight: 1.1 }}>
                {selectedNode.label}
              </h3>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <div className="t-num" style={{ fontSize: '18px', fontWeight: '600', color: NODE_COLORS[selectedNode.type] || 'var(--rust-accent)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                  {selectedNode.count}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                  Observed Cases
                </div>
              </div>
              <div>
                <div className="t-num" style={{ fontSize: '18px', fontWeight: '600', color: selectedNode.relatedCount >= 5 ? 'var(--sage-neutral)' : 'var(--ochre-signal)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                  {selectedNode.relatedCount}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                  Related Nodes
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '16px', color: 'var(--ink-muted)', padding: '0 4px', lineHeight: 1 }}>&times;</button>
            </div>
          </div>

          {selectedNode.description && (
            <p style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '13px', lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: '14px', maxWidth: '60ch' }}>
              {selectedNode.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[...selectedConnections].slice(0, 8).map(connId => {
              const connNode = rawNodes.find(n => n.id === connId);
              if (!connNode) return null;
              const color = NODE_COLORS[connNode.type] || 'var(--cream-dark)';
              const connPos = posMap.get(connId);
              return (
                <button key={connId}
                  onClick={() => {
                    setSelectedNode(connNode);
                    if (connPos) setViewTransform({ x: -connPos.x * 1.3 + dimensions.w / 2, y: -connPos.y * 1.3 + dimensions.h / 2, scale: 1.3 });
                  }}
                  style={{
                    padding: '4px 10px', background: 'var(--cream-deep)', border: `1px solid ${color}`,
                    borderRadius: '2px', cursor: 'pointer', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', color: color, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--cream-deep)'; e.currentTarget.style.color = color; }}
                >
                  {TYPE_LABELS[connNode.type]}: {connNode.label}
                </button>
              );
            })}
            {selectedConnections.size > 8 && (
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', color: 'var(--ink-muted)' }}>
                +{selectedConnections.size - 8} more
              </span>
            )}
          </div>

          {selectedNode.severity && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--cream-dark)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: NODE_COLORS[selectedNode.type] || 'var(--ink-muted)', padding: '2px 8px', border: `1px solid ${NODE_COLORS[selectedNode.type] || 'var(--cream-dark)'}`, borderRadius: '1px' }}>
                {selectedNode.severity.toUpperCase()} SEVERITY
              </span>
              {selectedNode.slug && (
                <Link href={`/case/${selectedNode.slug}`} style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--rust-accent)', textDecoration: 'none' }}>
                  View Case Study &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
