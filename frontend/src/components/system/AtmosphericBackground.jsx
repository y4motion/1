/**
 * AtmosphericBackground.jsx - ACRYLIC GHOST ATMOSPHERE v2
 * 
 * Global background component creating the "Clean Future" aesthetic.
 * 
 * LAYERS:
 * 1. Base: Deep black with subtle depth
 * 2. White Fog: Large, blurred white orbs drifting slowly (smoke in darkness)
 * 3. Noise Texture: Grain overlay for material feel (rough plastic/asphalt)
 * 4. Vignette: Darkened corners for focus
 * 
 * Style: Nothing/Teenage Engineering/Apple Vision Pro
 */

import React from 'react';

// CSS for fog animation
const fogStyles = `
  @keyframes fog-drift-1 {
    0%, 100% { 
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.045;
    }
    50% { 
      transform: translate(-45%, -55%) scale(1.15);
      opacity: 0.065;
    }
  }
  
  @keyframes fog-drift-2 {
    0%, 100% { 
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.04;
    }
    50% { 
      transform: translate(-55%, -45%) scale(1.1);
      opacity: 0.055;
    }
  }
  
  @keyframes fog-drift-3 {
    0%, 100% { 
      transform: translate(-50%, -50%) scale(0.95);
      opacity: 0.035;
    }
    50% { 
      transform: translate(-48%, -52%) scale(1.2);
      opacity: 0.05;
    }
  }
  
  @keyframes fog-pulse {
    0%, 100% { opacity: 0.03; }
    50% { opacity: 0.045; }
  }
  
  .fog-orb-1 {
    position: absolute;
    left: 8%;
    top: 15%;
    width: 900px;
    height: 900px;
    border-radius: 50%;
    background: radial-gradient(circle, 
      rgba(255, 255, 255, 0.8) 0%, 
      rgba(255, 255, 255, 0.3) 30%, 
      rgba(255, 255, 255, 0.05) 60%, 
      transparent 80%
    );
    filter: blur(60px);
    animation: fog-drift-1 40s ease-in-out infinite;
    pointer-events: none;
  }
  
  .fog-orb-2 {
    position: absolute;
    right: 5%;
    top: 40%;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, 
      rgba(255, 255, 255, 0.7) 0%, 
      rgba(255, 255, 255, 0.25) 35%, 
      rgba(255, 255, 255, 0.04) 65%, 
      transparent 85%
    );
    filter: blur(70px);
    animation: fog-drift-2 50s ease-in-out infinite;
    animation-delay: -15s;
    pointer-events: none;
  }
  
  .fog-orb-3 {
    position: absolute;
    left: 40%;
    bottom: 10%;
    width: 1100px;
    height: 1100px;
    border-radius: 50%;
    background: radial-gradient(circle, 
      rgba(255, 255, 255, 0.6) 0%, 
      rgba(255, 255, 255, 0.2) 40%, 
      rgba(255, 255, 255, 0.03) 70%, 
      transparent 90%
    );
    filter: blur(80px);
    animation: fog-drift-3 60s ease-in-out infinite;
    animation-delay: -25s;
    pointer-events: none;
  }
  
  .fog-orb-4 {
    position: absolute;
    right: 25%;
    top: 5%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, 
      rgba(255, 255, 255, 0.5) 0%, 
      rgba(255, 255, 255, 0.15) 40%, 
      transparent 70%
    );
    filter: blur(50px);
    animation: fog-pulse 25s ease-in-out infinite;
    animation-delay: -10s;
    pointer-events: none;
  }
`;

// Noise texture using canvas pattern for better performance
const NoiseTexture = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      opacity: 0.045,
      mixBlendMode: 'overlay',
      pointerEvents: 'none',
    }}
  />
);

// Vignette - darkens edges for cinematic focus
const Vignette = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse 80% 80% at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.5) 100%)',
      pointerEvents: 'none',
    }}
  />
);

// Main Atmospheric Background Component
export const AtmosphericBackground = ({ 
  showFog = true,
  showNoise = true,
  showVignette = true,
}) => {
  return (
    <>
      {/* Inject CSS animations */}
      <style>{fogStyles}</style>
      
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          overflow: 'hidden',
          // Deep black base
          background: 'linear-gradient(180deg, #040404 0%, #020202 50%, #010101 100%)',
        }}
        data-testid="atmospheric-background"
      >
        {/* Layer 1: White Fog Orbs */}
        {showFog && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <div className="fog-orb-1" />
            <div className="fog-orb-2" />
            <div className="fog-orb-3" />
            <div className="fog-orb-4" />
          </div>
        )}

        {/* Layer 2: Noise Texture */}
        {showNoise && <NoiseTexture />}

        {/* Layer 3: Vignette */}
        {showVignette && <Vignette />}

        {/* Subtle top edge highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '15%',
            right: '15%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  );
};

export default AtmosphericBackground;
