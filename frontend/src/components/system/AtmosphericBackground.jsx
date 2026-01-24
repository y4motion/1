/**
 * AtmosphericBackground.jsx - ACRYLIC GHOST ATMOSPHERE
 * 
 * Global background component that creates the "Clean Future" aesthetic.
 * 
 * LAYERS:
 * 1. Base: Deep black with subtle warmth
 * 2. White Fog: Huge, blurred white orbs slowly drifting (smoke in darkness)
 * 3. Noise Texture: Grain overlay for material feel (rough plastic/asphalt)
 * 4. Vignette: Darkened corners for focus
 * 
 * Style: Nothing/Teenage Engineering/Apple Vision Pro
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Fog orb configuration - MORE VISIBLE atmospheric fog
const FOG_ORBS = [
  { 
    id: 1,
    size: 1000,
    x: '5%',
    y: '10%',
    opacity: 0.07,
    duration: 35,
    delay: 0,
  },
  { 
    id: 2,
    size: 800,
    x: '65%',
    y: '45%',
    opacity: 0.06,
    duration: 45,
    delay: 3,
  },
  { 
    id: 3,
    size: 1200,
    x: '35%',
    y: '70%',
    opacity: 0.05,
    duration: 50,
    delay: 7,
  },
  { 
    id: 4,
    size: 600,
    x: '80%',
    y: '5%',
    opacity: 0.04,
    duration: 40,
    delay: 12,
  },
  { 
    id: 5,
    size: 500,
    x: '20%',
    y: '50%',
    opacity: 0.035,
    duration: 30,
    delay: 5,
  },
];

// White Fog Orb - creates "smoke in darkness" effect
const FogOrb = ({ size, x, y, opacity, duration, delay }) => (
  <motion.div
    initial={{ 
      x: x,
      y: y,
      scale: 0.9,
      opacity: 0,
    }}
    animate={{ 
      x: [x, `calc(${x} + 6%)`, `calc(${x} - 4%)`, x],
      y: [y, `calc(${y} - 5%)`, `calc(${y} + 4%)`, y],
      scale: [0.9, 1.15, 1, 0.95, 0.9],
      opacity: [opacity * 0.6, opacity, opacity * 0.85, opacity, opacity * 0.6],
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.6) 25%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
      filter: 'blur(100px)',
      pointerEvents: 'none',
      willChange: 'transform, opacity',
    }}
  />
);

// Noise texture using SVG filter - ENHANCED for material feel
const NoiseTexture = () => (
  <>
    {/* SVG filter definition */}
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="ghost-noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="saturate"
            values="0"
            in="noise"
            result="graynoise"
          />
          <feComponentTransfer in="graynoise" result="finalnoise">
            <feFuncA type="linear" slope="0.18" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="finalnoise" mode="overlay" />
        </filter>
      </defs>
    </svg>

    {/* Noise overlay - rough plastic/asphalt texture */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        opacity: 0.055,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  </>
);

// Vignette - darkens edges for focus
const Vignette = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
      pointerEvents: 'none',
    }}
  />
);

// Subtle grid pattern (matching NeuralHub)
const SubtleGrid = () => (
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
      opacity: 0.5,
    }}
  />
);

// Main Atmospheric Background Component
export const AtmosphericBackground = ({ 
  showFog = true,
  showNoise = true,
  showVignette = true,
  showGrid = false,
  intensity = 1, // 0.5 = subtle, 1 = normal, 1.5 = dramatic
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        // Deep black with very subtle warmth
        background: 'linear-gradient(180deg, #050505 0%, #030303 50%, #020202 100%)',
      }}
      data-testid="atmospheric-background"
    >
      {/* Layer 1: White Fog Orbs */}
      {showFog && (
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            overflow: 'hidden',
            opacity: intensity,
          }}
        >
          {FOG_ORBS.map((orb) => (
            <FogOrb key={orb.id} {...orb} />
          ))}
        </div>
      )}

      {/* Layer 2: Subtle Grid (optional) */}
      {showGrid && <SubtleGrid />}

      {/* Layer 3: Noise Texture */}
      {showNoise && <NoiseTexture />}

      {/* Layer 4: Vignette */}
      {showVignette && <Vignette />}

      {/* Subtle top edge highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default AtmosphericBackground;
