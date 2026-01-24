/**
 * AtmosphericBackground.jsx - ACRYLIC GHOST ATMOSPHERE v3
 * 
 * Global background creating "Clean Future" / "Fog in darkness" aesthetic.
 * 
 * LAYERS:
 * 1. Deep black base
 * 2. White fog clouds - VISIBLE atmospheric light
 * 3. Grain texture for material feel  
 * 4. Vignette for cinematic focus
 * 
 * Style: Nothing/Teenage Engineering/Apple Vision Pro
 */

import React from 'react';

const fogStyles = `
  @keyframes fog-float-1 {
    0%, 100% { 
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(30px, -20px) scale(1.05);
    }
    50% { 
      transform: translate(-20px, 30px) scale(1.1);
    }
    75% {
      transform: translate(15px, 10px) scale(1.02);
    }
  }
  
  @keyframes fog-float-2 {
    0%, 100% { 
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(-40px, 25px) scale(1.08);
    }
    66% { 
      transform: translate(25px, -35px) scale(0.95);
    }
  }
  
  @keyframes fog-float-3 {
    0%, 100% { 
      transform: translate(0, 0) scale(1);
    }
    50% { 
      transform: translate(50px, 40px) scale(1.15);
    }
  }
  
  @keyframes fog-pulse-slow {
    0%, 100% { 
      opacity: 0.06;
      transform: scale(1);
    }
    50% { 
      opacity: 0.09;
      transform: scale(1.05);
    }
  }
  
  .atmospheric-fog-1 {
    position: absolute;
    left: -5%;
    top: 5%;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle at center, 
      rgba(255, 255, 255, 0.12) 0%, 
      rgba(255, 255, 255, 0.06) 35%, 
      rgba(255, 255, 255, 0.02) 60%, 
      transparent 80%
    );
    filter: blur(40px);
    animation: fog-float-1 45s ease-in-out infinite;
    pointer-events: none;
  }
  
  .atmospheric-fog-2 {
    position: absolute;
    right: -10%;
    top: 30%;
    width: 1000px;
    height: 1000px;
    border-radius: 50%;
    background: radial-gradient(circle at center, 
      rgba(255, 255, 255, 0.10) 0%, 
      rgba(255, 255, 255, 0.05) 40%, 
      rgba(255, 255, 255, 0.015) 65%, 
      transparent 85%
    );
    filter: blur(50px);
    animation: fog-float-2 55s ease-in-out infinite;
    pointer-events: none;
  }
  
  .atmospheric-fog-3 {
    position: absolute;
    left: 25%;
    bottom: -15%;
    width: 1200px;
    height: 1200px;
    border-radius: 50%;
    background: radial-gradient(circle at center, 
      rgba(255, 255, 255, 0.08) 0%, 
      rgba(255, 255, 255, 0.04) 45%, 
      rgba(255, 255, 255, 0.01) 70%, 
      transparent 90%
    );
    filter: blur(60px);
    animation: fog-float-3 70s ease-in-out infinite;
    pointer-events: none;
  }
  
  .atmospheric-fog-4 {
    position: absolute;
    right: 15%;
    top: -5%;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle at center, 
      rgba(255, 255, 255, 0.08) 0%, 
      rgba(255, 255, 255, 0.03) 50%, 
      transparent 75%
    );
    filter: blur(35px);
    animation: fog-pulse-slow 30s ease-in-out infinite;
    pointer-events: none;
  }
  
  .atmospheric-fog-5 {
    position: absolute;
    left: 50%;
    top: 40%;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle at center, 
      rgba(255, 255, 255, 0.06) 0%, 
      rgba(255, 255, 255, 0.025) 45%, 
      transparent 70%
    );
    filter: blur(45px);
    animation: fog-pulse-slow 40s ease-in-out infinite;
    animation-delay: -20s;
    pointer-events: none;
  }
`;

// Grain texture overlay
const GrainTexture = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      opacity: 0.04,
      mixBlendMode: 'overlay',
      pointerEvents: 'none',
    }}
  />
);

// Vignette for cinematic depth
const Vignette = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
      pointerEvents: 'none',
    }}
  />
);

// Main component
export const AtmosphericBackground = ({ 
  showFog = true,
  showNoise = true,
  showVignette = true,
}) => {
  return (
    <>
      <style>{fogStyles}</style>
      
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          overflow: 'hidden',
          background: '#020202',
        }}
        data-testid="atmospheric-background"
      >
        {/* White Fog Clouds */}
        {showFog && (
          <>
            <div className="atmospheric-fog-1" />
            <div className="atmospheric-fog-2" />
            <div className="atmospheric-fog-3" />
            <div className="atmospheric-fog-4" />
            <div className="atmospheric-fog-5" />
          </>
        )}

        {/* Grain Texture */}
        {showNoise && <GrainTexture />}

        {/* Vignette */}
        {showVignette && <Vignette />}
      </div>
    </>
  );
};

export default AtmosphericBackground;
