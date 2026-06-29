'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import type { PatternNode, PatternLink } from '@/lib/db/insights-data';

interface Props {
  nodes: PatternNode[];
  links: PatternLink[];
}

const severityColors: Record<string, string> = {
  critical: '#980002',
  high: '#B54A2A',
  medium: '#C8922A',
  low: '#6B7B6E',
};

export default function FailurePatternNetwork({ nodes, links }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const activeId = selected || hovered;

  const positionedNodes = useMemo(() => {
    if (!nodes.length) return [];
    const critical = nodes.filter(n => n.severity === 'critical');
    const high = nodes.filter(n => n.severity === 'high');
    const medium = nodes.filter(n => n.severity === 'medium');
    const low = nodes.filter(n => n.severity === 'low');

    const result: Array<PatternNode & { x: number; y: number }> = [];
    const centerX = 350;
    const layers = [
      { items: critical, y: 90, spread: 200 },
      { items: high, y: 210, spread: 280 },
      { items: medium, y: 330, spread: 250 },
      { items: low, y: 430, spread: 200 },
    ];

    layers.forEach(({ items, y, spread }) => {
      items.forEach((n, i) => {
        const totalWidth = Math.min(spread, items.length * 130);
        const startX = centerX - totalWidth / 2;
        result.push({
          ...n,
          x: startX + (items.length > 1 ? (i / (items.length - 1)) * totalWidth : totalWidth / 2),
          y: y + (Math.abs(i - (items.length - 1) / 2) * 15),
        });
      });
    });

    return result;
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, (typeof positionedNodes)[0]>();
    positionedNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [positionedNodes]);

  const getConnectedNodes = useCallback((nodeId: string): Set<string> => {
    const connected = new Set<string>();
    links.forEach(l => {
      if (l.source === nodeId) connected.add(l.target);
      if (l.target === nodeId) connected.add(l.source);
    });
    return connected;
  }, [links]);

  if (!nodes.length) {
    return (
      <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cream-deep)', border: '1.5px dashed var(--cream-dark)', borderRadius: '2px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)' }}>
            INSUFFICIENT DATA
          </div>
          <p style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '13px', color: 'var(--ink-muted)', marginTop: '8px' }}>
            Add more case studies to visualize the failure pattern network.
          </p>
        </div>
      </div>
    );
  }

  const selectedNode = selected ? nodeMap.get(selected) : null;
  const selectedConnections = selected ? getConnectedNodes(selected) : new Set<string>();

  const height = Math.max(520, positionedNodes.length * 60);

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Fatal', color: severityColors.critical },
            { label: 'High', color: severityColors.high },
            { label: 'Medium', color: severityColors.medium },
            { label: 'Low', color: severityColors.low },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', color: 'var(--ink-muted)' }}>
          {nodes.length} patterns · {links.length} connections
        </span>
      </div>

      <div style={{
        backgroundColor: 'var(--paper-white)',
        border: '1.5px dashed var(--cream-dark)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 700 ${height}`}
          style={{ background: 'transparent', fontFamily: 'var(--font-dm-mono), monospace', display: 'block' }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            {positionedNodes.map(node => (
              <radialGradient key={node.id} id={`glow-${node.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={severityColors[node.severity]} stopOpacity="0.3" />
                <stop offset="100%" stopColor={severityColors[node.severity]} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {links.map((link, i) => {
            const source = nodeMap.get(link.source);
            const target = nodeMap.get(link.target);
            if (!source || !target) return null;
            const isActive = activeId && (activeId === link.source || activeId === link.target);
            const isSelectedConnection = selected && (selectedConnections.has(link.source) || selectedConnections.has(link.target));
            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isActive || isSelectedConnection ? severityColors[source.severity] : 'var(--cream-dark)'}
                strokeWidth={isActive ? 2 : 0.8}
                strokeDasharray={isActive ? 'none' : '3 4'}
                opacity={isActive ? 0.8 : isSelectedConnection ? 0.5 : 0.25}
              />
            );
          })}

          {positionedNodes.map((node) => {
            const isActive = activeId === node.id;
            const connected = selected ? selectedConnections.has(node.id) : false;
            const isDimmed = selected && node.id !== selected && !connected;

            const radius = 20 + Math.min(node.count * 2.5, 24);
            const fontSize = node.name.length > 14 ? '5.5px' : '6.5px';

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                onClick={() => setSelected(selected === node.id ? null : node.id)}
                style={{ cursor: 'pointer' }}
                opacity={isDimmed ? 0.2 : 1}
              >
                {isActive && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 12}
                    fill={`url(#glow-${node.id})`}
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={isActive ? severityColors[node.severity] : 'var(--cream-base)'}
                  stroke={severityColors[node.severity]}
                  strokeWidth={isActive ? 3 : 1.5}
                  opacity={isActive ? 1 : 0.85}
                />

                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? 'white' : 'var(--ink-black)'}
                  fontSize={fontSize}
                  fontWeight="500"
                  letterSpacing="0.02em"
                >
                  {node.name}
                </text>

                <text
                  x={node.x}
                  y={node.y + radius + 11}
                  textAnchor="middle"
                  fill={isDimmed ? 'transparent' : 'var(--ink-muted)'}
                  fontSize="7px"
                  fontWeight="400"
                >
                  {node.count} case{node.count !== 1 ? 's' : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {selectedNode && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            padding: '16px 20px',
            backgroundColor: 'var(--paper-white)',
            border: '1.5px dashed var(--cream-dark)',
            borderRadius: '2px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(26,23,20,0.1)',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', color: severityColors[selectedNode.severity] }}>
                {selectedNode.category.toUpperCase()} PATTERN
              </div>
              <div style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '18px', fontWeight: '600', color: 'var(--ink-black)', marginTop: '2px' }}>
                {selectedNode.name}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                {[...selectedConnections].map(connId => {
                  const connNode = nodeMap.get(connId);
                  return connNode ? (
                    <span key={connId} style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '7px',
                      color: severityColors[connNode.severity],
                      padding: '1px 6px',
                      border: `1px solid ${severityColors[connNode.severity]}`,
                      borderRadius: '1px',
                    }}>
                      → {connNode.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="t-num" style={{ fontSize: '22px', fontWeight: '600', color: severityColors[selectedNode.severity], fontFamily: 'var(--font-dm-mono), monospace' }}>
                {selectedNode.count}
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                Cases
              </div>
            </div>
          </div>
        )}
      </div>

      {!selected && (
        <p style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '12px',
          color: 'var(--ink-muted)',
          marginTop: '16px',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          Click a node to explore its connections across the failure intelligence knowledge graph.
        </p>
      )}
    </div>
  );
}
