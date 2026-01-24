/**
 * AtmosphericBackground.jsx - GHOST ACRYLIC VOID v2
 * 
 * Dense techwear atmosphere with layered depth.
 * Premium tech aesthetic — Nothing/Teenage Engineering/FUI
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';

const styles = `
  /* ============================================
     BASE ANIMATIONS
     ============================================ */
  
  @keyframes float-slow {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-10px) translateX(5px); }
    50% { transform: translateY(-5px) translateX(-5px); }
    75% { transform: translateY(-15px) translateX(3px); }
  }
  
  @keyframes float-reverse {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(10px) translateX(-8px); }
  }
  
  @keyframes fade-pulse {
    0%, 100% { opacity: var(--base-opacity); }
    50% { opacity: calc(var(--base-opacity) * 1.5); }
  }
  
  @keyframes rotate-slow {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  
  @keyframes rotate-reverse {
    from { transform: translate(-50%, -50%) rotate(360deg); }
    to { transform: translate(-50%, -50%) rotate(0deg); }
  }
  
  @keyframes scan-vertical {
    0% { transform: translateY(-100vh); opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  
  @keyframes radar-sweep {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes typing {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  
  @keyframes wave-move {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes particle-float {
    0%, 100% { 
      transform: translate(var(--start-x), var(--start-y));
      opacity: var(--particle-opacity);
    }
    50% { 
      transform: translate(var(--end-x), var(--end-y));
      opacity: calc(var(--particle-opacity) * 0.5);
    }
  }
  
  /* ============================================
     LAYER 1: SUBTLE FOG
     ============================================ */
  
  .void-fog {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    will-change: transform, opacity;
  }
  
  .void-fog-1 {
    left: -5%;
    top: 0%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, transparent 70%);
    filter: blur(50px);
    animation: float-slow 60s ease-in-out infinite;
  }
  
  .void-fog-2 {
    right: -8%;
    top: 30%;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 45%, transparent 75%);
    filter: blur(60px);
    animation: float-reverse 75s ease-in-out infinite;
  }
  
  .void-fog-3 {
    left: 25%;
    bottom: -10%;
    width: 900px;
    height: 900px;
    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 50%, transparent 80%);
    filter: blur(70px);
    animation: float-slow 90s ease-in-out infinite;
    animation-delay: -30s;
  }
  
  /* ============================================
     LAYER 2: COORDINATE GRID
     ============================================ */
  
  .void-grid-major {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 120px 120px;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
  }
  
  .void-grid-minor {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black 0%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black 0%, transparent 100%);
  }
  
  /* ============================================
     LAYER 3: HEXAGONAL OVERLAY
     ============================================ */
  
  .void-hex-pattern {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.8;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
  }
  
  /* ============================================
     LAYER 4: ORBITAL RINGS
     ============================================ */
  
  .void-orbital-container {
    position: absolute;
    left: 50%;
    top: 50%;
    pointer-events: none;
  }
  
  .void-orbital {
    position: absolute;
    left: 50%;
    top: 50%;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.03);
  }
  
  .void-orbital-1 {
    width: 300px;
    height: 300px;
    animation: rotate-slow 120s linear infinite;
  }
  
  .void-orbital-2 {
    width: 500px;
    height: 500px;
    border-style: dashed;
    border-color: rgba(255,255,255,0.02);
    animation: rotate-reverse 180s linear infinite;
  }
  
  .void-orbital-3 {
    width: 700px;
    height: 700px;
    animation: rotate-slow 240s linear infinite;
  }
  
  .void-orbital-dot {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(255,255,255,0.1);
  }
  
  /* ============================================
     LAYER 5: FLOATING PARTICLES
     ============================================ */
  
  .void-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: particle-float var(--duration) ease-in-out infinite;
  }
  
  /* ============================================
     LAYER 6: SCANLINES
     ============================================ */
  
  .void-scanline {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255,255,255,0.04) 20%, 
      rgba(255,255,255,0.08) 50%, 
      rgba(255,255,255,0.04) 80%, 
      transparent 100%
    );
    animation: scan-vertical 15s linear infinite;
  }
  
  /* ============================================
     LAYER 7: RADAR
     ============================================ */
  
  .void-radar {
    position: absolute;
    width: 200px;
    height: 200px;
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 50%;
  }
  
  .void-radar-sweep {
    position: absolute;
    width: 50%;
    height: 2px;
    left: 50%;
    top: 50%;
    transform-origin: left center;
    background: linear-gradient(90deg, rgba(255,255,255,0.2), transparent);
    animation: radar-sweep 4s linear infinite;
  }
  
  .void-radar-ring {
    position: absolute;
    inset: 20%;
    border: 1px solid rgba(255,255,255,0.02);
    border-radius: 50%;
  }
  
  .void-radar-ring-2 {
    inset: 40%;
  }
  
  .void-radar-dot {
    position: absolute;
    width: 3px;
    height: 3px;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  
  /* ============================================
     LAYER 8: DATA STREAMS
     ============================================ */
  
  .void-stream {
    position: absolute;
    width: 1px;
    height: 100px;
    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent);
    animation: scan-vertical var(--duration) linear infinite;
    animation-delay: var(--delay);
  }
  
  /* ============================================
     LAYER 9: CONSTELLATION
     ============================================ */
  
  .void-constellation {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  
  .void-star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    --base-opacity: 0.2;
    animation: fade-pulse 4s ease-in-out infinite;
  }
  
  .void-constellation-line {
    position: absolute;
    height: 1px;
    background: rgba(255,255,255,0.03);
    transform-origin: left center;
  }
  
  /* ============================================
     LAYER 10: HUD ELEMENTS
     ============================================ */
  
  .void-hud {
    position: absolute;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 9px;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.15);
    pointer-events: none;
    text-transform: uppercase;
  }
  
  .void-hud-tl {
    top: 60px;
    left: 60px;
  }
  
  .void-hud-tr {
    top: 60px;
    right: 60px;
    text-align: right;
  }
  
  .void-hud-bl {
    bottom: 60px;
    left: 60px;
  }
  
  .void-hud-br {
    bottom: 60px;
    right: 60px;
    text-align: right;
  }
  
  .void-hud-cursor {
    display: inline-block;
    width: 6px;
    height: 10px;
    background: rgba(255,255,255,0.3);
    margin-left: 2px;
    animation: blink 1s step-end infinite;
  }
  
  .void-hud-value {
    color: rgba(255,255,255,0.25);
  }
  
  /* ============================================
     LAYER 11: WAVE INTERFERENCE
     ============================================ */
  
  .void-wave {
    position: absolute;
    left: -100%;
    width: 200%;
    height: 1px;
    background: repeating-linear-gradient(
      90deg,
      transparent 0px,
      rgba(255,255,255,0.03) 2px,
      transparent 4px
    );
    animation: wave-move 20s linear infinite;
  }
  
  /* ============================================
     LAYER 12: CORNER BRACKETS
     ============================================ */
  
  .void-bracket {
    position: absolute;
    width: 80px;
    height: 80px;
    pointer-events: none;
  }
  
  .void-bracket::before,
  .void-bracket::after {
    content: '';
    position: absolute;
    background: rgba(255,255,255,0.06);
  }
  
  .void-bracket-tl { top: 30px; left: 30px; }
  .void-bracket-tl::before { width: 40px; height: 1px; top: 0; left: 0; }
  .void-bracket-tl::after { width: 1px; height: 40px; top: 0; left: 0; }
  
  .void-bracket-tr { top: 30px; right: 30px; }
  .void-bracket-tr::before { width: 40px; height: 1px; top: 0; right: 0; }
  .void-bracket-tr::after { width: 1px; height: 40px; top: 0; right: 0; }
  
  .void-bracket-bl { bottom: 30px; left: 30px; }
  .void-bracket-bl::before { width: 40px; height: 1px; bottom: 0; left: 0; }
  .void-bracket-bl::after { width: 1px; height: 40px; bottom: 0; left: 0; }
  
  .void-bracket-br { bottom: 30px; right: 30px; }
  .void-bracket-br::before { width: 40px; height: 1px; bottom: 0; right: 0; }
  .void-bracket-br::after { width: 1px; height: 40px; bottom: 0; right: 0; }
  
  /* Inner brackets */
  .void-bracket-inner {
    width: 20px;
    height: 20px;
    opacity: 0.5;
  }
  
  .void-bracket-inner::before,
  .void-bracket-inner::after {
    background: rgba(255,255,255,0.04);
  }
  
  .void-bracket-inner.tl { top: 50px; left: 50px; }
  .void-bracket-inner.tl::before { width: 15px; height: 1px; }
  .void-bracket-inner.tl::after { height: 15px; width: 1px; }
  
  .void-bracket-inner.tr { top: 50px; right: 50px; }
  .void-bracket-inner.tr::before { width: 15px; height: 1px; right: 0; }
  .void-bracket-inner.tr::after { height: 15px; width: 1px; right: 0; }
  
  .void-bracket-inner.bl { bottom: 50px; left: 50px; }
  .void-bracket-inner.bl::before { width: 15px; height: 1px; bottom: 0; }
  .void-bracket-inner.bl::after { height: 15px; width: 1px; bottom: 0; }
  
  .void-bracket-inner.br { bottom: 50px; right: 50px; }
  .void-bracket-inner.br::before { width: 15px; height: 1px; right: 0; bottom: 0; }
  .void-bracket-inner.br::after { height: 15px; width: 1px; right: 0; bottom: 0; }
  
  /* ============================================
     LAYER 13: CENTER ELEMENTS
     ============================================ */
  
  .void-center-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
    border: 1px solid rgba(255,255,255,0.02);
    border-radius: 50%;
  }
  
  .void-center-cross {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
  }
  
  .void-center-cross::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%);
  }
  
  .void-center-cross::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    height: 1px;
    width: 100%;
    background: linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%);
  }
  
  .void-center-dot {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }
  
  /* ============================================
     LAYER 14: GLITCH
     ============================================ */
  
  .void-glitch-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.05s;
  }
  
  .void-glitch-container.active {
    opacity: 1;
  }
  
  .void-glitch-line {
    position: absolute;
    left: 0;
    height: 2px;
    background: rgba(255,255,255,0.2);
  }
  
  /* ============================================
     LAYER 15: AXIS LINES
     ============================================ */
  
  .void-axis-h {
    position: absolute;
    left: 5%;
    right: 5%;
    top: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.015) 20%, rgba(255,255,255,0.025) 50%, rgba(255,255,255,0.015) 80%, transparent);
  }
  
  .void-axis-v {
    position: absolute;
    top: 5%;
    bottom: 5%;
    left: 50%;
    width: 1px;
    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.015) 20%, rgba(255,255,255,0.025) 50%, rgba(255,255,255,0.015) 80%, transparent);
  }
  
  /* ============================================
     LAYER 16: MEASUREMENT MARKS
     ============================================ */
  
  .void-measure {
    position: absolute;
    background: rgba(255,255,255,0.03);
  }
  
  .void-measure-h {
    height: 1px;
    width: 8px;
  }
  
  .void-measure-v {
    width: 1px;
    height: 8px;
  }
`;

// Grain texture
const GrainTexture = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    opacity: 0.03,
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
  }} />
);

// Vignette
const Vignette = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
    pointerEvents: 'none',
  }} />
);

// Floating particles
const Particles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2,
      duration: 20 + Math.random() * 40,
      delay: Math.random() * -40,
      opacity: 0.05 + Math.random() * 0.15,
      startX: `${-20 + Math.random() * 40}px`,
      startY: `${-20 + Math.random() * 40}px`,
      endX: `${-20 + Math.random() * 40}px`,
      endY: `${-20 + Math.random() * 40}px`,
    })), []
  );
  
  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="void-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: `rgba(255,255,255,${p.opacity})`,
            '--duration': `${p.duration}s`,
            '--start-x': p.startX,
            '--start-y': p.startY,
            '--end-x': p.endX,
            '--end-y': p.endY,
            '--particle-opacity': p.opacity,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
};

// Constellation of connected stars
const Constellation = () => {
  const stars = useMemo(() => [
    { x: 15, y: 20 }, { x: 18, y: 25 }, { x: 22, y: 22 },
    { x: 75, y: 15 }, { x: 80, y: 20 }, { x: 78, y: 25 },
    { x: 85, y: 70 }, { x: 88, y: 75 }, { x: 82, y: 78 },
    { x: 10, y: 75 }, { x: 15, y: 80 }, { x: 12, y: 85 },
    { x: 45, y: 10 }, { x: 50, y: 15 }, { x: 55, y: 12 },
    { x: 40, y: 85 }, { x: 45, y: 90 }, { x: 50, y: 88 },
  ], []);
  
  const lines = useMemo(() => [
    [0, 1], [1, 2], [0, 2],
    [3, 4], [4, 5],
    [6, 7], [7, 8], [6, 8],
    [9, 10], [10, 11],
    [12, 13], [13, 14],
    [15, 16], [16, 17],
  ], []);
  
  return (
    <div className="void-constellation">
      {stars.map((star, i) => (
        <div
          key={i}
          className="void-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {lines.map(([a, b], i) => (
          <line
            key={i}
            x1={`${stars[a].x}%`}
            y1={`${stars[a].y}%`}
            x2={`${stars[b].x}%`}
            y2={`${stars[b].y}%`}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
};

// HUD elements with data
const HUDElements = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (d) => d.toTimeString().slice(0, 8);
  const formatDate = (d) => d.toISOString().slice(0, 10);
  
  return (
    <>
      <div className="void-hud void-hud-tl">
        <div>SYS.<span className="void-hud-value">GHOST_OS</span></div>
        <div style={{ marginTop: 4 }}>VER.<span className="void-hud-value">2.0.4</span></div>
        <div style={{ marginTop: 4 }}>ENV.<span className="void-hud-value">VOID</span><span className="void-hud-cursor" /></div>
      </div>
      
      <div className="void-hud void-hud-tr">
        <div><span className="void-hud-value">{formatTime(time)}</span></div>
        <div style={{ marginTop: 4 }}><span className="void-hud-value">{formatDate(time)}</span></div>
        <div style={{ marginTop: 4 }}>UTC+<span className="void-hud-value">{-time.getTimezoneOffset() / 60}</span></div>
      </div>
      
      <div className="void-hud void-hud-bl">
        <div>LAT.<span className="void-hud-value">55.7558</span></div>
        <div style={{ marginTop: 4 }}>LON.<span className="void-hud-value">37.6173</span></div>
        <div style={{ marginTop: 4 }}>ALT.<span className="void-hud-value">156M</span></div>
      </div>
      
      <div className="void-hud void-hud-br">
        <div>NET.<span className="void-hud-value">ONLINE</span></div>
        <div style={{ marginTop: 4 }}>SIG.<span className="void-hud-value">98%</span></div>
        <div style={{ marginTop: 4 }}>PWR.<span className="void-hud-value">NOMINAL</span></div>
      </div>
    </>
  );
};

// Data streams
const DataStreams = () => {
  const streams = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      left: `${5 + i * 12}%`,
      duration: 12 + Math.random() * 10,
      delay: Math.random() * -20,
      height: 80 + Math.random() * 60,
    })), []
  );
  
  return (
    <>
      {streams.map((s, i) => (
        <div
          key={i}
          className="void-stream"
          style={{
            left: s.left,
            height: s.height,
            '--duration': `${s.duration}s`,
            '--delay': `${s.delay}s`,
          }}
        />
      ))}
    </>
  );
};

// Measurement marks along axes
const MeasurementMarks = () => {
  const hMarks = useMemo(() => Array.from({ length: 20 }, (_, i) => 5 + i * 4.5), []);
  const vMarks = useMemo(() => Array.from({ length: 15 }, (_, i) => 10 + i * 5.5), []);
  
  return (
    <>
      {hMarks.map((pos, i) => (
        <div key={`h${i}`} className="void-measure void-measure-h" style={{ left: `${pos}%`, top: '50%', transform: 'translateY(-50%)' }} />
      ))}
      {vMarks.map((pos, i) => (
        <div key={`v${i}`} className="void-measure void-measure-v" style={{ top: `${pos}%`, left: '50%', transform: 'translateX(-50%)' }} />
      ))}
    </>
  );
};

// Glitch effect
const GlitchEffect = () => {
  const [active, setActive] = useState(false);
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    const trigger = () => {
      setLines(Array.from({ length: 2 + Math.floor(Math.random() * 4) }, () => ({
        top: Math.random() * 100,
        width: 15 + Math.random() * 50,
        left: Math.random() * 35,
      })));
      setActive(true);
      setTimeout(() => setActive(false), 100 + Math.random() * 100);
    };
    
    const schedule = () => {
      const delay = 20000 + Math.random() * 40000;
      return setTimeout(() => { trigger(); schedule(); }, delay);
    };
    
    const t = schedule();
    return () => clearTimeout(t);
  }, []);
  
  return (
    <div className={`void-glitch-container ${active ? 'active' : ''}`}>
      {lines.map((l, i) => (
        <div key={i} className="void-glitch-line" style={{ top: `${l.top}%`, left: `${l.left}%`, width: `${l.width}%` }} />
      ))}
    </div>
  );
};

// Main component
export const AtmosphericBackground = () => {
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
        {/* Fog */}
        <div className="void-fog void-fog-1" />
        <div className="void-fog void-fog-2" />
        <div className="void-fog void-fog-3" />
        
        {/* Grids */}
        <div className="void-grid-major" />
        <div className="void-grid-minor" />
        <div className="void-hex-pattern" />
        
        {/* Axes */}
        <div className="void-axis-h" />
        <div className="void-axis-v" />
        <MeasurementMarks />
        
        {/* Orbital rings */}
        <div className="void-orbital-container">
          <div className="void-orbital void-orbital-1">
            <div className="void-orbital-dot" style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }} />
          </div>
          <div className="void-orbital void-orbital-2">
            <div className="void-orbital-dot" style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }} />
          </div>
          <div className="void-orbital void-orbital-3">
            <div className="void-orbital-dot" style={{ top: '50%', right: 0, transform: 'translateY(-50%)' }} />
          </div>
        </div>
        
        {/* Center elements */}
        <div className="void-center-ring" />
        <div className="void-center-cross" />
        <div className="void-center-dot" />
        
        {/* Constellation */}
        <Constellation />
        
        {/* Particles */}
        <Particles />
        
        {/* Scanlines */}
        <div className="void-scanline" />
        <div className="void-scanline" style={{ animationDelay: '-5s', opacity: 0.7 }} />
        <div className="void-scanline" style={{ animationDelay: '-10s', opacity: 0.5 }} />
        
        {/* Data streams */}
        <DataStreams />
        
        {/* Wave */}
        <div className="void-wave" style={{ top: '30%' }} />
        <div className="void-wave" style={{ top: '70%', animationDelay: '-10s', animationDuration: '25s' }} />
        
        {/* Radar */}
        <div className="void-radar" style={{ right: '8%', bottom: '15%' }}>
          <div className="void-radar-sweep" />
          <div className="void-radar-ring" />
          <div className="void-radar-ring void-radar-ring-2" />
          <div className="void-radar-dot" />
        </div>
        
        {/* Corner brackets */}
        <div className="void-bracket void-bracket-tl" />
        <div className="void-bracket void-bracket-tr" />
        <div className="void-bracket void-bracket-bl" />
        <div className="void-bracket void-bracket-br" />
        <div className="void-bracket void-bracket-inner tl" />
        <div className="void-bracket void-bracket-inner tr" />
        <div className="void-bracket void-bracket-inner bl" />
        <div className="void-bracket void-bracket-inner br" />
        
        {/* HUD */}
        <HUDElements />
        
        {/* Glitch */}
        <GlitchEffect />
        
        {/* Texture */}
        <GrainTexture />
        <Vignette />
      </div>
    </>
  );
};

export default AtmosphericBackground;
