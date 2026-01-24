/**
 * AtmosphericBackground.jsx - THE ATMOSPHERIC VOID
 * 
 * ACRYLIC GHOST STYLE
 * White fog/smoke effect on dark background
 * Creates depth without color
 * 
 * Features:
 * - Slow-moving white fog blobs
 * - Film grain texture
 * - Vignette effect
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// SVG Noise Filter for grain texture
const NoiseFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id="atmospheric-noise">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.7" 
          numOctaves="4" 
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0"/>
      </filter>
    </defs>
  </svg>
);

// Fog blob component - slow drifting white smoke
const FogBlob = ({ 
  initialX, 
  initialY, 
  size, 
  opacity = 0.03,
  duration = 25,
  delay = 0 
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  
  // Random drift target
  const getNewTarget = () => ({
    x: initialX + (Math.random() - 0.5) * 200,
    y: initialY + (Math.random() - 0.5) * 150,
  });
  
  return (
    <motion.div
      initial={{ x: initialX, y: initialY, scale: 0.8, opacity: 0 }}
      animate={{ 
        x: [initialX, initialX + 100, initialX - 50, initialX],
        y: [initialY, initialY - 80, initialY + 60, initialY],
        scale: [1, 1.1, 0.95, 1],
        opacity: [opacity, opacity * 1.2, opacity * 0.8, opacity]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay: delay,
      }}
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
        filter: `blur(${size / 3}px)`,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    />
  );
};

// Vignette overlay - darkens edges
const Vignette = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
      pointerEvents: 'none',
    }}
  />
);

// Film grain overlay
const GrainOverlay = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity: 0.035,
      filter: 'url(#atmospheric-noise)',
      pointerEvents: 'none',
      mixBlendMode: 'overlay',
    }}
  />
);

// Subtle grid pattern
const SubtleGridOverlay = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
      pointerEvents: 'none',
    }}
  />
);

// Main Atmospheric Background Component
export default function AtmosphericBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
        background: '#050505',
        pointerEvents: 'none',
      }}
      data-testid="atmospheric-background"
    >
      <NoiseFilter />
      
      {/* Fog blobs - white smoke effect */}
      {/* Large deep blobs */}
      <FogBlob initialX={-200} initialY={100} size={1000} opacity={0.025} duration={30} delay={0} />
      <FogBlob initialX={800} initialY={-100} size={900} opacity={0.02} duration={35} delay={5} />
      <FogBlob initialX={400} initialY={500} size={1100} opacity={0.022} duration={28} delay={10} />
      
      {/* Medium mid-layer blobs */}
      <FogBlob initialX={100} initialY={300} size={600} opacity={0.018} duration={22} delay={3} />
      <FogBlob initialX={1000} initialY={200} size={700} opacity={0.02} duration={26} delay={8} />
      <FogBlob initialX={600} initialY={-50} size={500} opacity={0.015} duration={20} delay={12} />
      
      {/* Small accent blobs */}
      <FogBlob initialX={200} initialY={600} size={400} opacity={0.015} duration={18} delay={6} />
      <FogBlob initialX={1200} initialY={400} size={450} opacity={0.018} duration={24} delay={15} />
      
      {/* Subtle grid */}
      <SubtleGridOverlay />
      
      {/* Film grain texture */}
      <GrainOverlay />
      
      {/* Vignette - darker edges */}
      <Vignette />
      
      {/* Top edge highlight - subtle light source */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '300px',
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.02) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
