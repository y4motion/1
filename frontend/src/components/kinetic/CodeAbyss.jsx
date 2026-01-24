/**
 * CodeAbyss.jsx - THE LIVING ABYSS v3
 * 
 * ASCII Art Characters forming animated shapes
 * Inspired by: Matrix code forming living creatures
 * 
 * Features:
 * - Text characters (0, 1, symbols) forming recognizable shapes
 * - Characters constantly animate/rearrange
 * - Shapes swim/float across the screen
 * - Parallax on mouse movement
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Character sets for different styles
const BINARY = ['0', '1'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
const SYMBOLS = ['@', '#', '$', '%', '&', '*', '+', '=', '~', '^'];
const CODE = ['<', '>', '/', '{', '}', '[', ']', '(', ')', ';', ':', '.', ','];

// KOI FISH shape definition - each row is a string where spaces are empty
const KOI_SHAPE = [
  '                              1111',
  '                         111111111111',
  '                      1111111111111111',
  '                   111111111111111111111',
  '                1111111111  1111111111111',
  '             1111111111  @@  111111111111',
  '          1111111111111  @@  1111111111111',
  '       111111111111111111111111111111111111',
  '    1111111111111111111111111111111111111111',
  '  11111111111111111111111111111111111111111111',
  '111111111111111111111111111111111111111111111111',
  '  11111111111111111111111111111111111111111111',
  '    1111111111111111111111111111111111111111',
  '       111111111111111111111111111111111111',
  '          11111111111111111111111111111',
  '             111111111111111111111        111',
  '                11111111111111         1111111',
  '                   1111111          111111111',
  '                                  1111111111',
  '                                111111111',
  '                                  11111',
];

// BUTTERFLY shape
const BUTTERFLY_SHAPE = [
  '      111111                      111111',
  '    1111111111                  1111111111',
  '   111111111111                111111111111',
  '  11111111111111              11111111111111',
  ' 1111111111111111            1111111111111111',
  '111111111111111111    11    111111111111111111',
  ' 1111111111111111   1111   1111111111111111',
  '  11111111111111   111111   11111111111111',
  '   111111111111     1111     111111111111',
  '    1111111111       11       1111111111',
  '      111111                    111111',
];

// GHOST/SKULL shape
const GHOST_SHAPE = [
  '        11111111111111',
  '      111111111111111111',
  '    1111111111111111111111',
  '   111111111111111111111111',
  '  11111  111111111111  11111',
  '  1111  @@  111111  @@  1111',
  '  1111  @@  111111  @@  1111',
  '  11111111111111111111111111',
  '  11111111111111111111111111',
  '   1111111111    1111111111',
  '   11111111  1111  11111111',
  '    111111111111111111111',
  '      1111111111111111',
  '       11  111111  11',
  '       11  111111  11',
  '       11    11    11',
];

// Parse shape into character positions
const parseShape = (shapeArray, charSet = BINARY) => {
  const chars = [];
  const height = shapeArray.length;
  const maxWidth = Math.max(...shapeArray.map(row => row.length));
  
  shapeArray.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== ' ') {
        chars.push({
          x: x * 8,
          y: y * 12,
          char: row[x] === '@' ? '@' : charSet[Math.floor(Math.random() * charSet.length)],
          isEye: row[x] === '@',
          delay: Math.random() * 2,
        });
      }
    }
  });
  
  return { chars, width: maxWidth * 8, height: height * 12 };
};

// Animated ASCII Shape Component
const AnimatedASCIIShape = ({ 
  shape, 
  charSet = BINARY,
  x, 
  y, 
  scale = 1,
  opacity = 0.15,
  color = 'white',
  animationSpeed = 1,
  parallaxX,
  parallaxY,
  swimming = false,
  swimSpeed = 0.5,
}) => {
  const [chars, setChars] = useState([]);
  const [position, setPosition] = useState({ x, y });
  const frameRef = useRef(0);
  
  const parsedShape = useMemo(() => parseShape(shape, charSet), [shape, charSet]);
  
  // Initialize and animate characters
  useEffect(() => {
    setChars(parsedShape.chars.map(c => ({ ...c })));
    
    // Animate character changes
    const interval = setInterval(() => {
      setChars(prev => prev.map(char => ({
        ...char,
        char: char.isEye ? '@' : charSet[Math.floor(Math.random() * charSet.length)],
      })));
    }, 200 / animationSpeed);
    
    return () => clearInterval(interval);
  }, [parsedShape, charSet, animationSpeed]);
  
  // Swimming animation
  useEffect(() => {
    if (!swimming) return;
    
    const animate = () => {
      frameRef.current += 1;
      setPosition(prev => {
        const newX = prev.x + swimSpeed;
        const wave = Math.sin(frameRef.current / 60) * 20;
        
        // Reset position when off screen
        if (newX > window.innerWidth + 200) {
          return { x: -parsedShape.width - 100, y: 100 + Math.random() * 400 };
        }
        
        return { x: newX, y: y + wave };
      });
    };
    
    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, [swimming, swimSpeed, parsedShape.width, y]);

  const springX = useSpring(parallaxX || 0, { stiffness: 50, damping: 30 });
  const springY = useSpring(parallaxY || 0, { stiffness: 50, damping: 30 });

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: swimming ? position.x : x,
        top: swimming ? position.y : y,
        x: springX,
        y: springY,
        fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
        fontSize: `${10 * scale}px`,
        lineHeight: `${12 * scale}px`,
        letterSpacing: `${2 * scale}px`,
        color,
        opacity,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'pre',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {chars.reduce((rows, char, i) => {
        const rowIndex = Math.floor(char.y / (12 * scale));
        if (!rows[rowIndex]) rows[rowIndex] = [];
        rows[rowIndex].push(char);
        return rows;
      }, []).map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', height: `${12 * scale}px` }}>
          {row.sort((a, b) => a.x - b.x).map((char, charIndex) => (
            <span
              key={charIndex}
              style={{
                display: 'inline-block',
                width: `${8 * scale}px`,
                textAlign: 'center',
                color: char.isEye ? '#333' : color,
                opacity: char.isEye ? 0.8 : 1,
                textShadow: char.isEye ? 'none' : `0 0 ${5 * scale}px rgba(255,255,255,0.3)`,
              }}
            >
              {char.char}
            </span>
          ))}
        </div>
      ))}
    </motion.div>
  );
};

// Pre-rendered canvas-based ASCII for better performance
const CanvasASCIIShape = ({ 
  shape, 
  charSet = BINARY,
  x, 
  y, 
  scale = 1,
  opacity = 0.12,
  color = '#ffffff',
  swimming = false,
  swimSpeed = 0.3,
}) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const positionRef = useRef({ x, y });
  const charsRef = useRef([]);
  
  const parsedShape = useMemo(() => parseShape(shape, charSet), [shape, charSet]);
  
  useEffect(() => {
    charsRef.current = parsedShape.chars.map(c => ({ ...c }));
  }, [parsedShape]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const fontSize = 11 * scale;
    ctx.font = `${fontSize}px "JetBrains Mono", "Fira Code", monospace`;
    
    let animationId;
    
    const render = () => {
      frameRef.current += 1;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update character values occasionally
      if (frameRef.current % 6 === 0) {
        charsRef.current = charsRef.current.map(char => ({
          ...char,
          char: char.isEye ? '●' : charSet[Math.floor(Math.random() * charSet.length)],
        }));
      }
      
      // Swimming movement
      if (swimming) {
        positionRef.current.x += swimSpeed;
        positionRef.current.y = y + Math.sin(frameRef.current / 50) * 30;
        
        if (positionRef.current.x > window.innerWidth + 300) {
          positionRef.current.x = -parsedShape.width * scale - 200;
          positionRef.current.y = 150 + Math.random() * 350;
        }
      }
      
      // Draw characters
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      
      charsRef.current.forEach(char => {
        if (char.isEye) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = '#666';
        } else {
          ctx.globalAlpha = opacity;
          ctx.fillStyle = color;
        }
        ctx.fillText(char.char, char.x * scale, char.y * scale + fontSize);
      });
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => cancelAnimationFrame(animationId);
  }, [parsedShape, charSet, scale, opacity, color, swimming, swimSpeed, y]);

  return (
    <canvas
      ref={canvasRef}
      width={parsedShape.width * scale + 50}
      height={parsedShape.height * scale + 50}
      style={{
        position: 'absolute',
        left: swimming ? positionRef.current.x : x,
        top: swimming ? positionRef.current.y : y,
        pointerEvents: 'none',
      }}
    />
  );
};

// Main swimming Koi component using canvas for performance
const SwimmingKoi = ({ mouseX, mouseY }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const posRef = useRef({ x: -400, y: 250 });
  const charsRef = useRef([]);
  
  const parsedKoi = useMemo(() => parseShape(KOI_SHAPE, BINARY), []);
  
  useEffect(() => {
    charsRef.current = parsedKoi.chars.map(c => ({ ...c }));
  }, [parsedKoi]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const render = () => {
      frameRef.current += 1;
      
      // Swimming movement
      posRef.current.x += 0.4;
      posRef.current.y = 250 + Math.sin(frameRef.current / 60) * 40;
      
      if (posRef.current.x > window.innerWidth + 400) {
        posRef.current.x = -500;
        posRef.current.y = 150 + Math.random() * 300;
      }
      
      // Update canvas position
      canvas.style.left = `${posRef.current.x}px`;
      canvas.style.top = `${posRef.current.y}px`;
      
      // Clear and draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update chars every few frames
      if (frameRef.current % 5 === 0) {
        charsRef.current = charsRef.current.map(char => ({
          ...char,
          char: char.isEye ? '●' : BINARY[Math.floor(Math.random() * BINARY.length)],
        }));
      }
      
      ctx.font = '11px "JetBrains Mono", monospace';
      
      charsRef.current.forEach(char => {
        if (char.isEye) {
          ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        }
        ctx.fillText(char.char, char.x, char.y + 11);
      });
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationId);
  }, [parsedKoi]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={300}
      style={{
        position: 'absolute',
        left: -400,
        top: 250,
        pointerEvents: 'none',
      }}
    />
  );
};

// Swimming Butterfly
const SwimmingButterfly = ({ startX, startY }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const posRef = useRef({ x: startX, y: startY });
  const charsRef = useRef([]);
  
  const parsedButterfly = useMemo(() => parseShape(BUTTERFLY_SHAPE, NUMBERS), []);
  
  useEffect(() => {
    charsRef.current = parsedButterfly.chars.map(c => ({ ...c }));
  }, [parsedButterfly]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const render = () => {
      frameRef.current += 1;
      
      // Floating movement (slower, more erratic)
      posRef.current.x += Math.sin(frameRef.current / 100) * 0.5;
      posRef.current.y += Math.cos(frameRef.current / 80) * 0.3;
      
      canvas.style.left = `${posRef.current.x}px`;
      canvas.style.top = `${posRef.current.y}px`;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update chars
      if (frameRef.current % 8 === 0) {
        charsRef.current = charsRef.current.map(char => ({
          ...char,
          char: NUMBERS[Math.floor(Math.random() * NUMBERS.length)],
        }));
      }
      
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      
      charsRef.current.forEach(char => {
        ctx.fillText(char.char, char.x * 0.8, char.y * 0.8 + 9);
      });
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationId);
  }, [parsedButterfly]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        pointerEvents: 'none',
      }}
    />
  );
};

// Floating Ghost
const FloatingGhost = ({ startX, startY }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const posRef = useRef({ x: startX, y: startY });
  const charsRef = useRef([]);
  
  const parsedGhost = useMemo(() => parseShape(GHOST_SHAPE, HEX), []);
  
  useEffect(() => {
    charsRef.current = parsedGhost.chars.map(c => ({ ...c }));
  }, [parsedGhost]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const render = () => {
      frameRef.current += 1;
      
      // Hovering motion
      posRef.current.y = startY + Math.sin(frameRef.current / 40) * 15;
      
      canvas.style.top = `${posRef.current.y}px`;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update chars
      if (frameRef.current % 4 === 0) {
        charsRef.current = charsRef.current.map(char => ({
          ...char,
          char: char.isEye ? '●' : HEX[Math.floor(Math.random() * HEX.length)],
        }));
      }
      
      ctx.font = '10px "JetBrains Mono", monospace';
      
      charsRef.current.forEach(char => {
        if (char.isEye) {
          ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        }
        ctx.fillText(char.char, char.x, char.y + 10);
      });
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationId);
  }, [parsedGhost, startY]);

  return (
    <canvas
      ref={canvasRef}
      width={250}
      height={250}
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        pointerEvents: 'none',
      }}
    />
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
      {/* Swimming Koi Fish - made of 0s and 1s */}
      <SwimmingKoi mouseX={mouseX} mouseY={mouseY} />
      
      {/* Floating Butterfly - made of numbers */}
      <SwimmingButterfly startX={typeof window !== 'undefined' ? window.innerWidth - 350 : 1200} startY={120} />
      
      {/* Floating Ghost - made of hex */}
      <FloatingGhost startX={80} startY={450} />
      
      {/* Second Koi swimming lower */}
      <SwimmingKoi mouseX={mouseX} mouseY={mouseY} />

      {/* Ambient glow spots */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%)',
          top: '10%',
          left: '15%',
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 60%)',
          bottom: '15%',
          right: '10%',
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}
