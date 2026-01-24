/**
 * AtmosphericBackground.jsx - GHOST ACRYLIC VOID
 * 
 * Premium atmospheric background with techwear/futuristic elements.
 * Subtle, not overwhelming. Clean Future aesthetic.
 * 
 * LAYERS:
 * 1. Deep void base
 * 2. Subtle white fog (smoke in darkness)
 * 3. Techwear elements: scanlines, grid, pulse waves
 * 4. Rare glitch events
 * 5. Grain texture
 * 6. Vignette
 */

import React, { useEffect, useState, useRef } from 'react';

const styles = `
  /* ============================================
     LAYER 1: SUBTLE FOG - "Smoke in Darkness"
     ============================================ */
  
  @keyframes fog-drift {
    0%, 100% { 
      transform: translate(0, 0) scale(1);
      opacity: var(--fog-opacity);
    }
    50% { 
      transform: translate(var(--drift-x), var(--drift-y)) scale(var(--drift-scale));
      opacity: calc(var(--fog-opacity) * 1.3);
    }
  }
  
  .ghost-fog {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at center, 
      rgba(255, 255, 255, var(--fog-center)) 0%, 
      rgba(255, 255, 255, calc(var(--fog-center) * 0.4)) 35%, 
      rgba(255, 255, 255, calc(var(--fog-center) * 0.1)) 60%, 
      transparent 80%
    );
    filter: blur(var(--fog-blur));
    animation: fog-drift var(--fog-duration) ease-in-out infinite;
    pointer-events: none;
    will-change: transform, opacity;
  }
  
  .ghost-fog-1 {
    --fog-center: 0.08;
    --fog-opacity: 0.04;
    --fog-blur: 60px;
    --fog-duration: 50s;
    --drift-x: 30px;
    --drift-y: -25px;
    --drift-scale: 1.08;
    left: -8%;
    top: 5%;
    width: 700px;
    height: 700px;
  }
  
  .ghost-fog-2 {
    --fog-center: 0.06;
    --fog-opacity: 0.035;
    --fog-blur: 70px;
    --fog-duration: 65s;
    --drift-x: -40px;
    --drift-y: 35px;
    --drift-scale: 1.1;
    right: -10%;
    top: 35%;
    width: 900px;
    height: 900px;
    animation-delay: -20s;
  }
  
  .ghost-fog-3 {
    --fog-center: 0.05;
    --fog-opacity: 0.03;
    --fog-blur: 80px;
    --fog-duration: 75s;
    --drift-x: 45px;
    --drift-y: 30px;
    --drift-scale: 1.12;
    left: 30%;
    bottom: -15%;
    width: 1000px;
    height: 1000px;
    animation-delay: -35s;
  }
  
  /* ============================================
     LAYER 2: TECHWEAR GRID - Coordinate System
     ============================================ */
  
  .ghost-grid {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 100px 100px;
    mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%);
    pointer-events: none;
  }
  
  /* Fine grid overlay */
  .ghost-grid-fine {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.5;
    pointer-events: none;
  }
  
  /* ============================================
     LAYER 3: SCANLINES - Horizontal Sweep
     ============================================ */
  
  @keyframes scanline-move {
    0% { transform: translateY(-100vh); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  
  .ghost-scanline {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255,255,255,0.06) 20%, 
      rgba(255,255,255,0.12) 50%, 
      rgba(255,255,255,0.06) 80%, 
      transparent 100%
    );
    animation: scanline-move 12s linear infinite;
    pointer-events: none;
  }
  
  .ghost-scanline-2 {
    animation-delay: -4s;
    opacity: 0.7;
  }
  
  .ghost-scanline-3 {
    animation-delay: -8s;
    opacity: 0.5;
  }
  
  /* ============================================
     LAYER 4: PULSE RINGS - Radar Effect
     ============================================ */
  
  @keyframes pulse-ring {
    0% { 
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.15;
    }
    50% {
      opacity: 0.08;
    }
    100% { 
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }
  
  .ghost-pulse-origin {
    position: absolute;
    width: 800px;
    height: 800px;
    pointer-events: none;
  }
  
  .ghost-pulse-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    animation: pulse-ring 8s ease-out infinite;
  }
  
  .ghost-pulse-ring:nth-child(2) { animation-delay: -2s; }
  .ghost-pulse-ring:nth-child(3) { animation-delay: -4s; }
  .ghost-pulse-ring:nth-child(4) { animation-delay: -6s; }
  
  /* ============================================
     LAYER 5: DATA STREAMS - Vertical Lines
     ============================================ */
  
  @keyframes data-stream {
    0% { 
      transform: translateY(-100%);
      opacity: 0;
    }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { 
      transform: translateY(100vh);
      opacity: 0;
    }
  }
  
  .ghost-data-stream {
    position: absolute;
    width: 1px;
    height: 150px;
    background: linear-gradient(180deg,
      transparent 0%,
      rgba(255,255,255,0.08) 50%,
      transparent 100%
    );
    animation: data-stream 15s linear infinite;
    pointer-events: none;
  }
  
  /* ============================================
     LAYER 6: CORNER BRACKETS - Tech Frame
     ============================================ */
  
  .ghost-corner {
    position: absolute;
    width: 60px;
    height: 60px;
    pointer-events: none;
    opacity: 0.08;
  }
  
  .ghost-corner::before,
  .ghost-corner::after {
    content: '';
    position: absolute;
    background: white;
  }
  
  .ghost-corner-tl {
    top: 40px;
    left: 40px;
  }
  .ghost-corner-tl::before { width: 30px; height: 1px; top: 0; left: 0; }
  .ghost-corner-tl::after { width: 1px; height: 30px; top: 0; left: 0; }
  
  .ghost-corner-tr {
    top: 40px;
    right: 40px;
  }
  .ghost-corner-tr::before { width: 30px; height: 1px; top: 0; right: 0; }
  .ghost-corner-tr::after { width: 1px; height: 30px; top: 0; right: 0; }
  
  .ghost-corner-bl {
    bottom: 40px;
    left: 40px;
  }
  .ghost-corner-bl::before { width: 30px; height: 1px; bottom: 0; left: 0; }
  .ghost-corner-bl::after { width: 1px; height: 30px; bottom: 0; left: 0; }
  
  .ghost-corner-br {
    bottom: 40px;
    right: 40px;
  }
  .ghost-corner-br::before { width: 30px; height: 1px; bottom: 0; right: 0; }
  .ghost-corner-br::after { width: 1px; height: 30px; bottom: 0; right: 0; }
  
  /* ============================================
     LAYER 7: GLITCH EVENT - Rare Occurrence
     ============================================ */
  
  @keyframes glitch-flash {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  
  @keyframes glitch-shift {
    0% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    50% { transform: translateX(3px); }
    75% { transform: translateX(-1px); }
    100% { transform: translateX(0); }
  }
  
  .ghost-glitch {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
  }
  
  .ghost-glitch.active {
    animation: glitch-flash 0.15s ease-out;
  }
  
  .ghost-glitch-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(255,255,255,0.3);
    animation: glitch-shift 0.1s ease-out;
  }
  
  /* ============================================
     LAYER 8: CROSSHAIR - Center Marker
     ============================================ */
  
  .ghost-crosshair {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    pointer-events: none;
    opacity: 0.04;
  }
  
  .ghost-crosshair::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, transparent 30%, white 50%, transparent 70%);
    transform: translateX(-50%);
  }
  
  .ghost-crosshair::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 30%, white 50%, transparent 70%);
    transform: translateY(-50%);
  }
  
  /* ============================================
     LAYER 9: HORIZON LINE
     ============================================ */
  
  .ghost-horizon {
    position: absolute;
    left: 10%;
    right: 10%;
    top: 50%;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255,255,255,0.02) 20%, 
      rgba(255,255,255,0.04) 50%, 
      rgba(255,255,255,0.02) 80%, 
      transparent 100%
    );
    pointer-events: none;
  }
`;

// Grain texture overlay
const GrainTexture = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      opacity: 0.035,
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
      background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.5) 100%)',
      pointerEvents: 'none',
    }}
  />
);

// Glitch event component with random triggers
const GlitchEvent = () => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchLines, setGlitchLines] = useState([]);
  
  useEffect(() => {
    // Random glitch every 15-45 seconds
    const triggerGlitch = () => {
      const lines = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, () => ({
        top: Math.random() * 100,
        width: 20 + Math.random() * 60,
        left: Math.random() * 40,
      }));
      setGlitchLines(lines);
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);
    };
    
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 30000; // 15-45s
      return setTimeout(() => {
        triggerGlitch();
        scheduleNext();
      }, delay);
    };
    
    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className={`ghost-glitch ${isGlitching ? 'active' : ''}`}>
      {isGlitching && glitchLines.map((line, i) => (
        <div
          key={i}
          className="ghost-glitch-line"
          style={{
            top: `${line.top}%`,
            left: `${line.left}%`,
            width: `${line.width}%`,
          }}
        />
      ))}
    </div>
  );
};

// Data streams with staggered positions
const DataStreams = () => {
  const streams = [
    { left: '8%', delay: 0, duration: 18 },
    { left: '23%', delay: -6, duration: 22 },
    { left: '45%', delay: -12, duration: 16 },
    { left: '67%', delay: -3, duration: 20 },
    { left: '82%', delay: -9, duration: 24 },
    { left: '91%', delay: -15, duration: 19 },
  ];
  
  return (
    <>
      {streams.map((s, i) => (
        <div
          key={i}
          className="ghost-data-stream"
          style={{
            left: s.left,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </>
  );
};

// Main component
export const AtmosphericBackground = ({ 
  showFog = true,
  showGrid = true,
  showScanlines = true,
  showPulse = true,
  showDataStreams = true,
  showCorners = true,
  showGlitch = true,
  showCrosshair = true,
  showHorizon = true,
  showNoise = true,
  showVignette = true,
}) => {
  return (
    <>
      <style>{styles}</style>
      
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
        {/* Fog layer */}
        {showFog && (
          <>
            <div className="ghost-fog ghost-fog-1" />
            <div className="ghost-fog ghost-fog-2" />
            <div className="ghost-fog ghost-fog-3" />
          </>
        )}
        
        {/* Grid layers */}
        {showGrid && (
          <>
            <div className="ghost-grid" />
            <div className="ghost-grid-fine" />
          </>
        )}
        
        {/* Horizon line */}
        {showHorizon && <div className="ghost-horizon" />}
        
        {/* Scanlines */}
        {showScanlines && (
          <>
            <div className="ghost-scanline" />
            <div className="ghost-scanline ghost-scanline-2" />
            <div className="ghost-scanline ghost-scanline-3" />
          </>
        )}
        
        {/* Pulse rings - bottom right */}
        {showPulse && (
          <div className="ghost-pulse-origin" style={{ right: '5%', bottom: '10%' }}>
            <div className="ghost-pulse-ring" />
            <div className="ghost-pulse-ring" />
            <div className="ghost-pulse-ring" />
            <div className="ghost-pulse-ring" />
          </div>
        )}
        
        {/* Data streams */}
        {showDataStreams && <DataStreams />}
        
        {/* Corner brackets */}
        {showCorners && (
          <>
            <div className="ghost-corner ghost-corner-tl" />
            <div className="ghost-corner ghost-corner-tr" />
            <div className="ghost-corner ghost-corner-bl" />
            <div className="ghost-corner ghost-corner-br" />
          </>
        )}
        
        {/* Center crosshair */}
        {showCrosshair && <div className="ghost-crosshair" />}
        
        {/* Rare glitch events */}
        {showGlitch && <GlitchEvent />}
        
        {/* Grain texture */}
        {showNoise && <GrainTexture />}
        
        {/* Vignette */}
        {showVignette && <Vignette />}
      </div>
    </>
  );
};

export default AtmosphericBackground;
