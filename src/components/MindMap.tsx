'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GraphNode, GraphLink, GRAPH_COLORS } from '@/lib/graphUtils';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { Switch, Drawer, Typography, Tag, Space, Badge, Button } from 'antd';
import { InfoCircleOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import InfoTooltip from './InfoTooltip';

// Dynamically import ForceGraph3D (No SSR)
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface MindMapProps {
  data: { nodes: GraphNode[]; links: GraphLink[] };
  currentMood?: string | null;
  initialMood?: string | null;
  readOnly?: boolean;
  autoRotate?: boolean;
  enableZoom?: boolean;
}

const MindMap = ({ data, currentMood, initialMood, readOnly = false, autoRotate = false, enableZoom = true }: MindMapProps) => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 500 });
  const [showLabels, setShowLabels] = useState(true); // Default on

  // Drawer State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  const [isPaused, setIsPaused] = useState(false);

  // Mood & Theme Logic
  const effectiveMood = currentMood || initialMood || 'Focused';
  
  const getThemeFromMood = useCallback((mood: string | null | undefined) => {
    if (!mood) return { bg: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)', velocityDecay: 0.6 }; // Deep Space Default

    const m = mood.toLowerCase();
    if (m.includes('anxious') || m.includes('stressed') || m.includes('overwhelmed')) {
      return { bg: 'radial-gradient(circle at center, #2d0a0a 0%, #000000 100%)', velocityDecay: 0.1 }; // Red Tint
    }
    if (m.includes('focused') || m.includes('calm') || m.includes('flow')) {
      return { bg: 'radial-gradient(circle at center, #051e3e 0%, #000000 100%)', velocityDecay: 0.9 }; // Deep Blue Tint
    }
    if (m.includes('happy') || m.includes('energetic') || m.includes('excited')) {
      return { bg: 'radial-gradient(circle at center, #2e2005 0%, #000000 100%)', velocityDecay: 0.6 }; // Gold Tint
    }
    if (m.includes('sad') || m.includes('tired') || m.includes('bored')) {
      return { bg: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)', velocityDecay: 0.95 }; // Grey Tint
    }
    return { bg: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)', velocityDecay: 0.6 };
  }, []);

  const theme = React.useMemo(() => getThemeFromMood(effectiveMood), [effectiveMood, getThemeFromMood]);

  useEffect(() => {

    // Wait a bit for the container to be laid out
    const timer = setTimeout(() => {
      if (containerRef.current) {
        setDims({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    }, 200); // Increased timeout

    const updateSize = () => {
      if (containerRef.current) {
        setDims({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timer);
    };
  }, [data]);

  // Force graph refresh when showLabels changes
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.refresh();
    }
  }, [showLabels]);

  const handleClick = useCallback((node: any) => {
    if (!node) return;
    const distance = 150;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      2000
    );

    // Open Details Panel
    setSelectedNode(node as GraphNode);
    setDrawerOpen(true);
  }, [fgRef]);

  // Define the node object function. We wrap it in useCallback to ensure referential stability
  // UNLESS showLabels changes, in which case we want a NEW function to force re-render.
  const nodeThreeObject = useCallback((node: any) => {
    const color = node.color || '#ccc';

    // Calculate decay for visualization
    let decayFactor = 1.0;
    if (node.group === 'media' && node.metadata && node.metadata.createdAt) {
      const date = new Date(node.metadata.createdAt);
      if (!isNaN(date.getTime())) {
        const diffTime = Math.abs(new Date().getTime() - date.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        decayFactor = Math.max(0.3, Math.pow(0.5, diffDays / 90));
      }
    }

    // Apply decay to radius
    const baseRadius = Math.min((node.val || 1) * 1.5, 5); // Drastically shrunk
    const radius = baseRadius * (node.group === 'media' ? decayFactor : 1.0);

    // 1. The Sphere (Node) - Neural Glow
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: node.group === 'media' ? 0.9 * decayFactor : 0.9,
      emissive: color,
      emissiveIntensity: node.group === 'media' ? 0.8 * decayFactor : 0.5, // Glow intensity
      roughness: 0.4,
      metalness: 0.6
    });
    const sphere = new THREE.Mesh(geometry, material);

    // 3. Group them together
    const group = new THREE.Group();
    group.add(sphere);

    // 2. The Label (Sprite) - Smart Labeling Logic
    if (showLabels) {
      const isMedia = node.group === 'media';
      const isHovered = node.id === hoveredNodeId;
      const isSelected = selectedNode?.id === node.id;

      const shouldShow = !isMedia || isHovered || isSelected;

      if (shouldShow) {
        const sprite = new SpriteText(node.name);
        sprite.color = '#ffffff'; // Explicit white
        sprite.textHeight = 8 * (node.group === 'media' ? Math.max(0.5, decayFactor) : 1); // Larger font
        sprite.position.set(0, radius + 8, 0); // Float above +Y offset
        group.add(sprite);
      }
    }

    return group;
  }, [showLabels, hoveredNodeId, selectedNode]); // Dependencies updated

  useEffect(() => {
    if (fgRef.current) {
      // Physics: Increase repulsion
      fgRef.current.d3Force('charge').strength(-50);
    }
  }, [data]); // Re-apply when data loads

  return (
    <div className="relative w-full">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        {/* Toggle Label */}
        <div className="bg-black/50 p-2 rounded backdrop-blur-sm border border-slate-700 pointer-events-auto w-fit flex gap-2">
          <div className="flex items-center gap-2">
            <Switch
              size="small"
              checked={showLabels}
              onChange={setShowLabels}
              className="bg-slate-600"
            />
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 500 }}>Show Names</span>
          </div>
          <div className="w-px bg-slate-600 mx-1" />
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
            if (fgRef.current) {
              if (isPaused) {
                fgRef.current.resumeAnimation();
              } else {
                fgRef.current.pauseAnimation();
              }
              setIsPaused(!isPaused);
            }
          }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 500 }}>{isPaused ? 'Resume' : 'Pause'}</span>
          </div>
        </div>

        {/* Legend */}
        <div className={`bg-black/50 rounded backdrop-blur-sm border border-slate-700 pointer-events-auto opacity-80 transition-all duration-300 ${isLegendOpen ? 'p-3' : 'p-2'}`}>
          <div className="flex justify-between items-center gap-4 mb-1 cursor-pointer" onClick={() => setIsLegendOpen(!isLegendOpen)}>
            {isLegendOpen && (
              <Typography.Text strong style={{ color: 'white', fontSize: '12px' }}>
                Neural Map <InfoTooltip text="Color coding based on psychological impact" />
              </Typography.Text>
            )}
            <Button 
              type="text" 
              size="small" 
              icon={isLegendOpen ? <MinusOutlined className="text-white/70" /> : <InfoCircleOutlined className="text-white" />} 
              className="flex items-center justify-center"
            />
          </div>
          
          {isLegendOpen && (
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2">
                <Badge color={GRAPH_COLORS.OPENNESS} /> <span className="text-xs text-white opacity-80 font-mono">Openness (Learning)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={GRAPH_COLORS.NEUROTICISM} /> <span className="text-xs text-white opacity-80 font-mono">Neuroticism (Escapism)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={GRAPH_COLORS.CONSCIENTIOUSNESS} /> <span className="text-xs text-white opacity-80 font-mono">Conscientiousness (Work)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={GRAPH_COLORS.EXTRAVERSION} /> <span className="text-xs text-white opacity-80 font-mono">Extraversion (Social)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={GRAPH_COLORS.AGREEABLENESS} /> <span className="text-xs text-white opacity-80 font-mono">Agreeableness (Connection)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3D Graph Container */}
      <div
        ref={containerRef}
        className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl w-full"
          style={{
          height: '500px',
          maxHeight: '60vh',
          background: theme.bg, // Use CSS gradient for background
          transition: 'background 1s ease-in-out' // Smooth transition for weather changes
        }}
      >
        {dims.width > 0 && (
          <ForceGraph3D
            ref={fgRef}
            width={dims.width}
            height={dims.height}
            graphData={data}
            backgroundColor="rgba(0,0,0,0)" // Transparent to let CSS gradient show
            showNavInfo={false}

            linkColor={() => 'rgba(255,255,255,0.2)'} // More transparent links
            linkWidth={0.2} // Thinner links
            linkResolution={6}

            nodeThreeObject={nodeThreeObject}
            nodeThreeObjectExtend={false}

            onNodeClick={!readOnly ? handleClick : undefined}
            onNodeHover={(node: any) => {
              if ((node && node.id !== hoveredNodeId) || (!node && hoveredNodeId !== null)) {
                setHoveredNodeId(node ? node.id : null);
              }
            }}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}

            // Physics settings - Stability Overhaul
            d3VelocityDecay={theme.velocityDecay} // Friction
            d3AlphaDecay={0.02} // Slower decay for smoother settling
            cooldownTicks={200} // Pre-calculate more ticks for stability
            warmupTicks={100} // Warmup before rendering to prevent explosion
            onEngineStop={() => {
              if (fgRef.current) {
                fgRef.current.zoomToFit(400);
              }
            }}
            
            // Demo Props
            // @ts-ignore
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            enableZoom={enableZoom}
          />
        )}
      </div>

      {/* Node Details Drawer */}
      <Drawer
        title={selectedNode?.name}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        mask={false} // Non-blocking
        width={320}
      >
        {selectedNode && (
          <div className="space-y-4">
            <div>
              <Tag color={selectedNode.color}>{selectedNode.group.toUpperCase()}</Tag>
            </div>

            {selectedNode.group === 'media' && selectedNode.metadata && (
              <div className="flex flex-col gap-2">
                <Typography.Text type="secondary">Category: <span className="capitalize text-black">{selectedNode.metadata.category}</span></Typography.Text>
                {selectedNode.metadata.rating && <Typography.Text>Rating: {selectedNode.metadata.rating}/5</Typography.Text>}

                {selectedNode.metadata.intent && (
                  <div>
                    <Typography.Text strong>Psychological Intent:</Typography.Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.metadata.intent.map((i: string) => <Tag key={i}>{i}</Tag>)}
                    </div>
                  </div>
                )}
                {selectedNode.metadata.mood && (
                  <div className="mt-2">
                    <Typography.Text strong>Mood Vibe:</Typography.Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.metadata.mood.map((m: string) => <Tag key={m} color="blue">{m}</Tag>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedNode.group === 'user' && selectedNode.metadata && (
              <div>
                <Typography.Paragraph>{selectedNode.metadata.description}</Typography.Paragraph>
              </div>
            )}

            {selectedNode.group === 'trait' && selectedNode.metadata && (
              <div>
                <Typography.Text>Current Score: {selectedNode.metadata.score}</Typography.Text>
                <Typography.Paragraph type="secondary" className="text-xs mt-2">
                  This trait score is dynamically influenced by your media consumption and mood logs.
                </Typography.Paragraph>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MindMap;
