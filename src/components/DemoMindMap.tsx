'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DEMO_NODES, DEMO_LINKS } from '@/lib/demoData';

const MindMap = dynamic(() => import('@/components/MindMap'), { ssr: false });

const DemoMindMap = () => {
  const demoData = { nodes: DEMO_NODES, links: DEMO_LINKS };

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group">
      <MindMap 
        data={demoData} 
        currentMood="Focused" 
        readOnly={true} 
        autoRotate={true} 
        enableZoom={false} 
      />
      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
        Interactive Demo
      </div>
    </div>
  );
};

export default DemoMindMap;

