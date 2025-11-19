'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface VantaBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

const VantaBackground: React.FC<VantaBackgroundProps> = ({ children, className }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [vantaLoaded, setVantaLoaded] = useState(false);

  useEffect(() => {
    // Check if scripts are already loaded in window
    if (window.THREE) setThreeLoaded(true);
    if (window.VANTA) setVantaLoaded(true);
  }, []);

  useEffect(() => {
    if (threeLoaded && vantaLoaded && !vantaEffect && vantaRef.current && window.VANTA) {
      try {
        // Vanta Birds depends on THREE.PerspectiveCamera, which might not be immediately available 
        // if THREE is loaded but not fully initialized in the Vanta context. 
        // Sometimes Vanta expects THREE to be on window.
        // We can add a small safety check or delay.
        
        const effect = window.VANTA.BIRDS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          backgroundColor: 0xffffff, // Matches our light theme
          color1: 0x6B7FD7, // Primary brand color
          color2: 0x52C41A, // Secondary brand color
          backgroundAlpha: 1.0, // Opaque background
          birdSize: 1.50,
          wingSpan: 30.00,
          speedLimit: 5.00,
          separation: 20.00,
          alignment: 20.00,
          cohesion: 20.00,
          quantity: 4.00,
          THREE: window.THREE // Explicitly pass THREE to Vanta
        });
        setVantaEffect(effect);
      } catch (error) {
        console.error("Failed to initialize Vanta effect:", error);
      }
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [threeLoaded, vantaLoaded, vantaEffect]);

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={() => setThreeLoaded(true)}
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
        strategy="afterInteractive"
        onLoad={() => setVantaLoaded(true)}
      />
      
      <div 
        ref={vantaRef} 
        className={`relative w-full min-h-screen ${className || ''}`}
        style={{ zIndex: 0 }} // Ensure it's a background
      >
        <div className="relative z-10">
           {children}
        </div>
      </div>
    </>
  );
};

export default VantaBackground;
