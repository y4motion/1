/**
 * CodeAbyss.jsx - THE LIVING ABYSS v4
 * 
 * Dense ASCII Koi Fish swimming randomly
 * + Proximity Effects for widgets
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Character sets
const BINARY = ['0', '1'];

// DENSE KOI FISH shape - tighter spacing
const KOI_SHAPE_DENSE = [
  '                           111',
  '                       1111111111',
  '                    111111111111111',
  '                 111111111111111111',
  '              1111111●●1111111111111',
  '           111111111●●111111111111111',
  '         11111111111111111111111111111',
  '       1111111111111111111111111111111',
  '     111111111111111111111111111111111',
  '   11111111111111111111111111111111111',
  '  1111111111111111111111111111111111111',
  ' 11111111111111111111111111111111111111',
  '111111111111111111111111111111111111111',
  ' 11111111111111111111111111111111111111',
  '  1111111111111111111111111111111111111',
  '   11111111111111111111111111111111111',
  '     1111111111111111111111111111111    11',
  '       111111111111111111111111111    1111',
  '         11111111111111111111111    111111',
  '           1111111111111111111   11111111',
  '              111111111111     1111111111',
  '                 1111111     111111111',
  '                           1111111',
  '                            11111',
];

// Parse shape into character positions - EXTRA DENSE version
const parseShapeDense = (shapeArray, charSet = BINARY) => {
  const chars = [];
  const charWidth = 5;  // EXTRA TIGHT!
  const lineHeight = 8; // EXTRA TIGHT!
  
  shapeArray.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== ' ') {
        const isEye = row[x] === '●';
        chars.push({
          x: x * charWidth,
          y: y * lineHeight,
          char: isEye ? '●' : charSet[Math.floor(Math.random() * charSet.length)],
          isEye,
        });
      }
    }
  });
  
  return { 
    chars, 
    width: Math.max(...shapeArray.map(r => r.length)) * charWidth,
    height: shapeArray.length * lineHeight
  };
};

// Swimming Koi with RANDOM wandering movement
const WanderingKoi = ({ id = 1 }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const charsRef = useRef([]);
  
  // Random wandering state
  const stateRef = useRef({
    x: id === 1 ? 200 : 800,
    y: id === 1 ? 150 : 350,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 1,
    targetX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 400 : 1200),
    targetY: 100 + Math.random() * 500,
    angle: 0,
  });
  
  const scale = 1.6;
  const parsedKoi = useMemo(() => parseShapeDense(KOI_SHAPE_DENSE, BINARY), []);
  
  useEffect(() => {
    charsRef.current = parsedKoi.chars.map(c => ({ ...c }));
  }, [parsedKoi]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    const state = stateRef.current;
    
    const render = () => {
      frameRef.current += 1;
      const frame = frameRef.current;
      
      // Change target occasionally
      if (frame % 300 === 0) {
        state.targetX = 100 + Math.random() * (window.innerWidth - 600);
        state.targetY = 100 + Math.random() * 500;
      }
      
      // Smooth steering toward target
      const dx = state.targetX - state.x;
      const dy = state.targetY - state.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 50) {
        state.vx += (dx / dist) * 0.02;
        state.vy += (dy / dist) * 0.015;
      }
      
      // Add some randomness
      state.vx += (Math.random() - 0.5) * 0.05;
      state.vy += (Math.random() - 0.5) * 0.03;
      
      // Friction
      state.vx *= 0.98;
      state.vy *= 0.98;
      
      // Clamp velocity
      const maxSpeed = 1.5;
      const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      if (speed > maxSpeed) {
        state.vx = (state.vx / speed) * maxSpeed;
        state.vy = (state.vy / speed) * maxSpeed;
      }
      
      // Update position
      state.x += state.vx;
      state.y += state.vy;
      
      // Bounce off edges - keep them more visible
      const margin = 100;
      if (state.x < margin) { state.x = margin; state.vx = Math.abs(state.vx) * 0.8; state.targetX = 400 + Math.random() * 600; }
      if (state.x > window.innerWidth - 400) { state.x = window.innerWidth - 400; state.vx = -Math.abs(state.vx) * 0.8; state.targetX = Math.random() * 600; }
      if (state.y < 80) { state.y = 80; state.vy *= -0.5; }
      if (state.y > 550) { state.y = 550; state.vy *= -0.5; }
      
      // Calculate rotation based on velocity
      state.angle = Math.atan2(state.vy, state.vx);
      
      // Update canvas position
      canvas.style.left = `${state.x}px`;
      canvas.style.top = `${state.y}px`;
      
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update characters - animated binary
      if (frame % 3 === 0) {
        charsRef.current = charsRef.current.map(char => ({
          ...char,
          char: char.isEye ? '●' : BINARY[Math.floor(Math.random() * BINARY.length)],
        }));
      }
      
      // Draw with rotation
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Flip if swimming left
      const flipX = state.vx < 0 ? -1 : 1;
      ctx.scale(flipX, 1);
      
      ctx.font = `${10 * scale}px "JetBrains Mono", "Courier New", monospace`;
      
      charsRef.current.forEach(char => {
        if (char.isEye) {
          ctx.fillStyle = 'rgba(40, 40, 40, 0.9)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        }
        const offsetX = -parsedKoi.width * scale / 2;
        const offsetY = -parsedKoi.height * scale / 2;
        ctx.fillText(char.char, char.x * scale + offsetX, char.y * scale + offsetY + 10 * scale);
      });
      
      ctx.restore();
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationId);
  }, [parsedKoi, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={400}
      style={{
        position: 'absolute',
        left: stateRef.current.x,
        top: stateRef.current.y,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

// Main CodeAbyss component - now only with 2 wandering Koi
export default function CodeAbyss() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#050505',
      }}
      data-testid="code-abyss-background"
    >
      {/* Two Wandering Koi Fish */}
      <WanderingKoi id={1} />
      <WanderingKoi id={2} />

      {/* Subtle ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 60%)',
          top: '15%',
          left: '20%',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.01) 0%, transparent 60%)',
          bottom: '20%',
          right: '15%',
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}

// === PROXIMITY EFFECT COMPONENT ===
// Use this wrapper around widgets for mouse-reactive dot scatter effect
export const ProximityDots = ({ children, dotCount = 40, className = '' }) => {
  const containerRef = useRef(null);
  const [dots, setDots] = useState([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const dotsRef = useRef([]);
  
  // Initialize dots
  useEffect(() => {
    const initialDots = Array.from({ length: dotCount }, (_, i) => ({
      id: i,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.2,
    }));
    dotsRef.current = initialDots;
    setDots(initialDots);
  }, [dotCount]);
  
  // Animation loop
  useEffect(() => {
    let animationId;
    
    const animate = () => {
      const container = containerRef.current;
      if (!container) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      const rect = container.getBoundingClientRect();
      const mouseX = ((mousePos.current.x - rect.left) / rect.width) * 100;
      const mouseY = ((mousePos.current.y - rect.top) / rect.height) * 100;
      
      dotsRef.current = dotsRef.current.map(dot => {
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Repel from mouse
        let pushX = 0;
        let pushY = 0;
        if (dist < 30 && dist > 0) {
          const force = (30 - dist) / 30 * 15;
          pushX = -(dx / dist) * force;
          pushY = -(dy / dist) * force;
        }
        
        // Spring back to base position
        const springX = (dot.baseX - dot.x) * 0.05;
        const springY = (dot.baseY - dot.y) * 0.05;
        
        return {
          ...dot,
          x: dot.x + pushX + springX,
          y: dot.y + pushY + springY,
        };
      });
      
      setDots([...dotsRef.current]);
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Proximity dots layer */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {dots.map(dot => (
          <div
            key={dot.id}
            style={{
              position: 'absolute',
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              backgroundColor: 'white',
              opacity: dot.opacity,
              borderRadius: '1px',
              transform: 'translate(-50%, -50%)',
              transition: 'none',
            }}
          />
        ))}
      </div>
      
      {/* Actual content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};
