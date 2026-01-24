/**
 * CodeAbyss.jsx - THE LIVING ABYSS v2
 * 
 * Dot-Matrix / Dithering Style Background
 * Inspired by Nothing Phone, Ghost in the Shell aesthetic
 * 
 * Features:
 * - Large visible dot patterns
 * - Dithering gradient effects
 * - Organic shapes made of dots
 * - Parallax on mouse movement
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Generate dot matrix pattern
const generateDotMatrix = (width, height, density = 0.3, shape = 'random') => {
  const dots = [];
  const cellSize = 8;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let shouldDraw = false;
      
      if (shape === 'random') {
        shouldDraw = Math.random() < density;
      } else if (shape === 'gradient-left') {
        // Denser on left, fading right
        const normalizedX = x / cols;
        shouldDraw = Math.random() < (1 - normalizedX) * density * 2;
      } else if (shape === 'gradient-right') {
        const normalizedX = x / cols;
        shouldDraw = Math.random() < normalizedX * density * 2;
      } else if (shape === 'circle') {
        const centerX = cols / 2;
        const centerY = rows / 2;
        const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDist = Math.min(cols, rows) / 2;
        shouldDraw = Math.random() < (1 - dist / maxDist) * density * 1.5;
      } else if (shape === 'wave') {
        const wave = Math.sin((x / cols) * Math.PI * 2 + (y / rows) * Math.PI);
        shouldDraw = Math.random() < (wave + 1) / 2 * density;
      }
      
      if (shouldDraw) {
        dots.push({ x: x * cellSize, y: y * cellSize, size: Math.random() * 2 + 2 });
      }
    }
  }
  return dots;
};

// SVG Dot Pattern Component
const DotPattern = ({ 
  width, 
  height, 
  density, 
  shape, 
  opacity = 0.15,
  color = 'white',
  style = {},
  parallaxX,
  parallaxY
}) => {
  const dots = useMemo(() => generateDotMatrix(width, height, density, shape), [width, height, density, shape]);
  
  return (
    <motion.svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        ...style,
        x: parallaxX,
        y: parallaxY,
      }}
    >
      {dots.map((dot, i) => (
        <rect
          key={i}
          x={dot.x}
          y={dot.y}
          width={dot.size}
          height={dot.size}
          fill={color}
          opacity={opacity}
        />
      ))}
    </motion.svg>
  );
};

// Large organic blob shape made of dots
const DotBlob = ({ x, y, size, density, parallaxFactor, mouseX, mouseY }) => {
  const parallaxX = useTransform(mouseX, [-500, 500], [20 * parallaxFactor, -20 * parallaxFactor]);
  const parallaxY = useTransform(mouseY, [-500, 500], [15 * parallaxFactor, -15 * parallaxFactor]);
  
  const springX = useSpring(parallaxX, { stiffness: 50, damping: 30 });
  const springY = useSpring(parallaxY, { stiffness: 50, damping: 30 });

  const dots = useMemo(() => {
    const result = [];
    const cellSize = 6;
    const cols = Math.ceil(size / cellSize);
    const rows = Math.ceil(size / cellSize);
    const centerX = cols / 2;
    const centerY = rows / 2;
    const radius = Math.min(cols, rows) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const distFromCenter = Math.sqrt(
          Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
        );
        
        // Organic edge with noise
        const noise = Math.sin(col * 0.5) * Math.cos(row * 0.3) * 3;
        const edgeRadius = radius + noise;
        
        if (distFromCenter < edgeRadius) {
          // Dithering: denser in center
          const distRatio = distFromCenter / radius;
          if (Math.random() > distRatio * (1 - density)) {
            result.push({
              x: col * cellSize,
              y: row * cellSize,
              size: 3 + Math.random() * 2
            });
          }
        }
      }
    }
    return result;
  }, [size, density]);

  return (
    <motion.svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        x: springX,
        y: springY,
        pointerEvents: 'none',
      }}
    >
      {dots.map((dot, i) => (
        <rect
          key={i}
          x={dot.x}
          y={dot.y}
          width={dot.size}
          height={dot.size}
          fill="white"
          opacity={0.12}
        />
      ))}
    </motion.svg>
  );
};

// Koi fish made of dots - swimming animation
const DotKoi = ({ mouseX, mouseY }) => {
  const [position, setPosition] = React.useState({ x: -300, y: 300 });
  
  useEffect(() => {
    const animate = () => {
      setPosition(prev => ({
        x: prev.x > window.innerWidth + 400 ? -400 : prev.x + 0.5,
        y: prev.y + Math.sin(Date.now() / 2000) * 0.3
      }));
    };
    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, []);

  const parallaxX = useTransform(mouseX, [-500, 500], [-15, 15]);
  const parallaxY = useTransform(mouseY, [-500, 500], [-10, 10]);
  const springX = useSpring(parallaxX, { stiffness: 30, damping: 20 });
  const springY = useSpring(parallaxY, { stiffness: 30, damping: 20 });

  // Generate fish shape dots
  const fishDots = useMemo(() => {
    const dots = [];
    const fishLength = 200;
    const fishHeight = 80;
    
    for (let x = 0; x < fishLength; x += 5) {
      for (let y = 0; y < fishHeight; y += 5) {
        // Fish body shape (ellipse)
        const normalizedX = x / fishLength;
        const normalizedY = (y - fishHeight / 2) / (fishHeight / 2);
        
        // Body curve
        const bodyWidth = Math.sin(normalizedX * Math.PI) * 0.8;
        // Tail gets thinner
        const tailFactor = normalizedX > 0.7 ? (1 - normalizedX) * 3 : 1;
        
        if (Math.abs(normalizedY) < bodyWidth * tailFactor) {
          // Dithering effect
          if (Math.random() > 0.3) {
            dots.push({ x, y, size: 3 + Math.random() * 2 });
          }
        }
        
        // Eye
        if (normalizedX > 0.15 && normalizedX < 0.25 && Math.abs(normalizedY) < 0.15) {
          dots.push({ x, y, size: 4, isEye: true });
        }
      }
    }
    
    // Tail fin
    for (let x = fishLength - 20; x < fishLength + 40; x += 5) {
      for (let y = -30; y < fishHeight + 30; y += 5) {
        const tailProgress = (x - (fishLength - 20)) / 60;
        const spread = tailProgress * 50;
        const centerY = fishHeight / 2;
        
        if (Math.abs(y - centerY) < spread && Math.random() > 0.5) {
          dots.push({ x, y, size: 2 + Math.random() });
        }
      }
    }
    
    return dots;
  }, []);

  return (
    <motion.svg
      width={280}
      height={140}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        x: springX,
        y: springY,
        pointerEvents: 'none',
      }}
    >
      {fishDots.map((dot, i) => (
        <rect
          key={i}
          x={dot.x}
          y={dot.y}
          width={dot.size}
          height={dot.size}
          fill={dot.isEye ? '#333' : 'white'}
          opacity={dot.isEye ? 0.8 : 0.15}
        />
      ))}
    </motion.svg>
  );
};

// Butterfly made of dots
const DotButterfly = ({ x, y, mouseX, mouseY }) => {
  const [wingAngle, setWingAngle] = React.useState(0);
  
  useEffect(() => {
    const animate = () => {
      setWingAngle(Math.sin(Date.now() / 300) * 15);
    };
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  const parallaxX = useTransform(mouseX, [-500, 500], [25, -25]);
  const parallaxY = useTransform(mouseY, [-500, 500], [20, -20]);
  const springX = useSpring(parallaxX, { stiffness: 40, damping: 25 });
  const springY = useSpring(parallaxY, { stiffness: 40, damping: 25 });

  const wingDots = useMemo(() => {
    const dots = [];
    const wingSize = 60;
    
    // Generate wing shape
    for (let wx = 0; wx < wingSize; wx += 4) {
      for (let wy = 0; wy < wingSize; wy += 4) {
        const normalizedX = wx / wingSize;
        const normalizedY = wy / wingSize;
        
        // Wing shape (rounded)
        const dist = Math.sqrt(Math.pow(normalizedX - 0.5, 2) + Math.pow(normalizedY - 0.5, 2));
        if (dist < 0.5 && Math.random() > 0.4) {
          // Left wing
          dots.push({ x: -wx - 10, y: wy - wingSize / 2, size: 3 });
          // Right wing
          dots.push({ x: wx + 10, y: wy - wingSize / 2, size: 3 });
        }
      }
    }
    
    // Body
    for (let by = -30; by < 30; by += 4) {
      dots.push({ x: 0, y: by, size: 4, isBody: true });
    }
    
    return dots;
  }, []);

  return (
    <motion.svg
      width={160}
      height={120}
      viewBox="-80 -60 160 120"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        x: springX,
        y: springY,
        pointerEvents: 'none',
      }}
    >
      <g style={{ transform: `perspective(100px) rotateY(${wingAngle}deg)` }}>
        {wingDots.map((dot, i) => (
          <rect
            key={i}
            x={dot.x}
            y={dot.y}
            width={dot.size}
            height={dot.size}
            fill="white"
            opacity={dot.isBody ? 0.2 : 0.12}
          />
        ))}
      </g>
    </motion.svg>
  );
};

export default function CodeAbyss() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Parallax transforms for static patterns
  const parallax1X = useTransform(mouseX, [-500, 500], [30, -30]);
  const parallax1Y = useTransform(mouseY, [-500, 500], [20, -20]);
  const parallax2X = useTransform(mouseX, [-500, 500], [15, -15]);
  const parallax2Y = useTransform(mouseY, [-500, 500], [10, -10]);
  
  const spring1X = useSpring(parallax1X, { stiffness: 30, damping: 20 });
  const spring1Y = useSpring(parallax1Y, { stiffness: 30, damping: 20 });
  const spring2X = useSpring(parallax2X, { stiffness: 40, damping: 25 });
  const spring2Y = useSpring(parallax2Y, { stiffness: 40, damping: 25 });

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
      {/* Large gradient blob - LEFT side */}
      <DotPattern
        width={600}
        height={800}
        density={0.4}
        shape="gradient-left"
        opacity={0.12}
        style={{ left: -100, top: 100 }}
        parallaxX={spring1X}
        parallaxY={spring1Y}
      />

      {/* Large gradient blob - RIGHT side */}
      <DotPattern
        width={500}
        height={600}
        density={0.35}
        shape="gradient-right"
        opacity={0.1}
        style={{ right: -50, top: 200 }}
        parallaxX={spring2X}
        parallaxY={spring2Y}
      />

      {/* Circular blob - bottom left */}
      <DotBlob
        x={50}
        y={500}
        size={400}
        density={0.5}
        parallaxFactor={1.2}
        mouseX={mouseX}
        mouseY={mouseY}
      />

      {/* Circular blob - top right */}
      <DotBlob
        x={typeof window !== 'undefined' ? window.innerWidth - 350 : 1000}
        y={50}
        size={300}
        density={0.4}
        parallaxFactor={0.8}
        mouseX={mouseX}
        mouseY={mouseY}
      />

      {/* Swimming Koi fish */}
      <DotKoi mouseX={mouseX} mouseY={mouseY} />

      {/* Butterfly */}
      <DotButterfly 
        x={typeof window !== 'undefined' ? window.innerWidth - 200 : 1200} 
        y={150} 
        mouseX={mouseX} 
        mouseY={mouseY} 
      />

      {/* Wave pattern - bottom */}
      <DotPattern
        width={typeof window !== 'undefined' ? window.innerWidth : 1920}
        height={300}
        density={0.25}
        shape="wave"
        opacity={0.08}
        style={{ bottom: 0, left: 0 }}
        parallaxX={spring2X}
        parallaxY={spring1Y}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
          top: '5%',
          left: '10%',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 60%)',
          bottom: '10%',
          right: '5%',
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}
