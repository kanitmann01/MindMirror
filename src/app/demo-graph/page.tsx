'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Card, Select, Typography } from 'antd';
import { GraphNode, GraphLink } from '@/lib/graphUtils';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

const { Title, Paragraph } = Typography;

// --- MOCK DATA ---
const MOCK_DATA = {
  nodes: [
    { id: 'user', name: 'Explorer Archetype', val: 10, color: '#818CF8', group: 'user' },
    { id: 't1', name: 'Openness', val: 6, color: '#94A3B8', group: 'trait' },
    { id: 't2', name: 'Extraversion', val: 6, color: '#94A3B8', group: 'trait' },
    { id: 'i1', name: 'Learning', val: 8, color: '#FCD34D', group: 'intent' },
    { id: 'i2', name: 'Escapism', val: 8, color: '#FCD34D', group: 'intent' },
    { id: 'm1', name: 'Dune', val: 4, color: '#A5B4FC', group: 'media' },
    { id: 'm2', name: 'Minecraft', val: 4, color: '#A5B4FC', group: 'media' },
    { id: 'm3', name: 'Spirited Away', val: 4, color: '#A5B4FC', group: 'media' },
    { id: 'm4', name: 'Inception', val: 4, color: '#A5B4FC', group: 'media' },
  ],
  links: [
    { source: 'user', target: 't1' },
    { source: 'user', target: 't2' },
    { source: 'user', target: 'i1' },
    { source: 'user', target: 'i2' },
    { source: 'i1', target: 't1' },
    { source: 'i2', target: 'm1' },
    { source: 'i1', target: 'm1' },
    { source: 'i2', target: 'm2' },
    { source: 'i2', target: 'm3' },
    { source: 'i1', target: 'm4' },
  ]
};

// --- VARIATIONS CONFIG ---
const VARIATIONS = [
  {
    key: 'v1',
    name: 'V1: Standard Repulsion',
    charge: -300,
    linkDist: 60,
    decay: 0.1,
    radius: (v: number) => v * 4,
    layout: 'Default forces'
  },
  {
    key: 'v2',
    name: 'V2: High Repulsion (Spaced)',
    charge: -800,
    linkDist: 120,
    decay: 0.1,
    radius: (v: number) => v * 4,
    layout: 'Aggressive spacing'
  },
  {
    key: 'v3',
    name: 'V3: Tiny Nodes (Minimal)',
    charge: -400,
    linkDist: 80,
    decay: 0.1,
    radius: (v: number) => 5, // Fixed small radius
    layout: 'Minimalist dots'
  },
  {
    key: 'v4',
    name: 'V4: Floating Atoms (Drift)',
    charge: -200,
    linkDist: 100,
    decay: 0.01, // Very low friction
    alphaDecay: 0, // Infinite movement
    radius: (v: number) => v * 3,
    layout: 'Particle simulation'
  },
  {
    key: 'v5',
    name: 'V5: Dense Cluster',
    charge: -100,
    linkDist: 30,
    decay: 0.2,
    radius: (v: number) => v * 4,
    layout: 'Tight grouping'
  },
  {
    key: 'v6',
    name: 'V6: Star/Radial Layout',
    charge: -500,
    linkDist: 150,
    decay: 0.1,
    dagMode: 'radialout', // Radial tree
    radius: (v: number) => v * 4,
    layout: 'Structured Radial'
  }
];

export default function DemoGraphPage() {
  const [selectedVar, setSelectedVar] = useState(VARIATIONS[1]);
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDims({ w: containerRef.current.offsetWidth, h: 600 });
    }
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(selectedVar.charge);
      fgRef.current.d3Force('link').distance(selectedVar.linkDist);
      fgRef.current.d3ReheatSimulation();
    }
  }, [selectedVar]);

  return (
    <div className="p-8">
      <Title level={2}>Graph Physics Laboratory</Title>
      <Paragraph>
        Select a physics variation below to see how it affects the layout.
        Once you find one you like, tell me "I like V2" or "I like V4".
      </Paragraph>

      <div className="mb-4">
        <Select
          size="large"
          style={{ width: 300 }}
          value={selectedVar.key}
          onChange={(val) => setSelectedVar(VARIATIONS.find(v => v.key === val) || VARIATIONS[0])}
          options={VARIATIONS.map(v => ({ value: v.key, label: v.name }))}
        />
      </div>

      <div ref={containerRef} className="border rounded-xl overflow-hidden bg-slate-50 shadow-inner" style={{ height: 600 }}>
         <ForceGraph2D
            ref={fgRef}
            width={dims.w}
            height={dims.h}
            graphData={MOCK_DATA}
            nodeLabel="name"
            
            // Dynamic Physics Props
            d3VelocityDecay={selectedVar.decay}
            d3AlphaDecay={selectedVar.alphaDecay || 0.0228} // Default if not set
            dagMode={selectedVar.dagMode as any || undefined}

            // Rendering
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              const r = selectedVar.radius(node.val || 5);

              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();

              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#333';
              ctx.fillText(label, node.x, node.y + r + fontSize + 2);
            }}
            
            linkColor={() => '#cbd5e1'}
         />
      </div>
      
      <Card className="mt-4 bg-gray-100">
        <pre className="text-xs">
          {JSON.stringify(selectedVar, null, 2)}
        </pre>
      </Card>
    </div>
  );
}

