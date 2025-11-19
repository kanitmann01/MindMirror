'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GraphNode, GraphLink } from '@/lib/graphUtils';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { Switch, Typography } from 'antd';

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

  useEffect(() => {
    console.log('MindMap mounted or updated. Data:', data);
    // Wait a bit for the container to be laid out
    const timer = setTimeout(() => {
        if (containerRef.current) {
            console.log('Resizing MindMap:', containerRef.current.offsetWidth, containerRef.current.offsetHeight);
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
      // Re-trigger the node object creation by forcing an update
      // There isn't a direct "re-render nodes" method, but we can achieve this
      // by tricking it into thinking the data "might" have changed or just by
      // explicitly re-setting the nodeThreeObject function if we were passing it dynamically.
      // However, react-force-graph watches props. passing a new function reference might help?
      // Actually, just calling refresh() is often enough for canvas, but for ThreeJS objects,
      // we need to tell it to reconstruct the scene objects.
      
      // The library is smart. If we pass the same data object, it might not re-render nodes.
      // But we are conditionally rendering inside `nodeThreeObject`.
      // We need to make sure `nodeThreeObject` is re-evaluated.
      
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
    <div className="relative">
       {/* Toggle Control */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded backdrop-blur-sm border border-slate-700">
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

      <div ref={containerRef} style={{ height: 500, width: '100%' }} className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl bg-black">
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
    </div>
  );
};

export default MindMap;
