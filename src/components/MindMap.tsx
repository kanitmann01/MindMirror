'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GraphNode, GraphLink, GRAPH_COLORS } from '@/lib/graphUtils';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { Switch, Drawer, Typography, Tag, Space, Badge } from 'antd';
import InfoTooltip from './InfoTooltip';

// Dynamically import ForceGraph3D (No SSR)
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface MindMapProps {
  data: { nodes: GraphNode[]; links: GraphLink[] };
}

const MindMap = ({ data }: MindMapProps) => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 500 });
  const [showLabels, setShowLabels] = useState(true); // Default on
  
  // Drawer State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

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
    const radius = Math.min((node.val || 1) * 2, 10);
    
    // 1. The Sphere (Node)
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      emissive: color, 
      emissiveIntensity: 0.6
    });
    const sphere = new THREE.Mesh(geometry, material);

    // 3. Group them together
    const group = new THREE.Group();
    group.add(sphere);

    // 2. The Label (Sprite) - Only add if toggled ON
    if (showLabels) {
      const sprite = new SpriteText(node.name);
      sprite.color = '#ffffff'; // Explicit white
      sprite.textHeight = 6; 
      sprite.position.set(0, radius + 4, 0); 
      group.add(sprite);
    }
    
    return group;
  }, [showLabels]); // Dependency on showLabels ensures the function changes

  return (
    <div className="relative w-full">
       {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
         {/* Toggle Label */}
         <div className="bg-black/50 p-2 rounded backdrop-blur-sm border border-slate-700 pointer-events-auto w-fit">
             <div className="flex items-center gap-2">
               <Switch 
                 size="small" 
                 checked={showLabels} 
                 onChange={setShowLabels} 
                 className="bg-slate-600" 
               />
               <span style={{ color: 'white', fontSize: '12px', fontWeight: 500 }}>Show Names</span>
             </div>
         </div>

         {/* Legend */}
         <div className="bg-black/50 p-3 rounded backdrop-blur-sm border border-slate-700 pointer-events-auto">
            <Typography.Text strong style={{ color: 'white', fontSize: '12px', display: 'block', marginBottom: 8 }}>
               Legend <InfoTooltip text="Color coding for graph nodes" />
            </Typography.Text>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Badge color={GRAPH_COLORS.USER} /> <span className="text-xs text-white">You</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge color={GRAPH_COLORS.TRAIT} /> <span className="text-xs text-white">Traits (OCEAN)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge color={GRAPH_COLORS.INSIGHT} /> <span className="text-xs text-white">Core Insights</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge color={GRAPH_COLORS.INTENT} /> <span className="text-xs text-white">Psych Intents</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge color={GRAPH_COLORS.MEDIA_DEFAULT} /> <span className="text-xs text-white">Media</span>
                </div>
            </div>
         </div>
      </div>

      {/* 3D Graph Container */}
      <div 
        ref={containerRef} 
        className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl bg-black w-full"
        style={{ height: '500px', maxHeight: '60vh' }} // Responsive height limit
      >
        {dims.width > 0 && (
          <ForceGraph3D
            ref={fgRef}
            width={dims.width}
            height={dims.height}
            graphData={data}
            backgroundColor="#000000"
            showNavInfo={false}
            
            linkColor={() => 'rgba(255,255,255,0.2)'}
            linkWidth={1}
            linkResolution={6}
            
            nodeThreeObject={nodeThreeObject} // Pass the callback that depends on state
            nodeThreeObjectExtend={false} // We are providing the full object, not extending
            
            onNodeClick={handleClick}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}
            
            // Physics settings
            cooldownTicks={100}
            onEngineStop={() => {
                if (fgRef.current) {
                    fgRef.current.zoomToFit(400);
                }
            }}
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
