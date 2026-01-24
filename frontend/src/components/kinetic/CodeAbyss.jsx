/**
 * CodeAbyss.jsx - THE LIVING ABYSS
 * 
 * Parallax background layer with ASCII art objects
 * floating in the digital void.
 * 
 * Objects:
 * - THE KOI: Giant data fish swimming diagonally
 * - THE BUTTERFLY: Symbol of transformation
 * - THE SCHEMATIC: Motherboard blueprint
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// ASCII ART OBJECTS - The Digital Creatures

const KOI_FISH = `
                                          ░░░░░░░░
                                    ░░░░░▒▒▒▒▒▒▒▒░░░░
                              ░░░░▒▒▒▒▓▓▓▓▓▓▓▓▒▒▒▒░░░░
                        ░░░░▒▒▒▒▓▓████████████▓▓▒▒▒▒░░░░
                  ░░░░▒▒▒▒▓▓████▓▓▓▓▓▓▓▓▓▓████▓▓▒▒▒▒░░░░
            ░░░░▒▒▒▒▓▓████▓▓░░░░░░░░░░░░▓▓████▓▓▒▒▒▒░░░░
      ░░░░▒▒▒▒▓▓████▓▓░░  ████  ░░░░░░░░▓▓████▓▓▒▒▒▒░░░░
░░░░▒▒▒▒▓▓████▓▓░░░░░░░░████████░░░░░░░░▓▓████▓▓▒▒▒▒░░░░
▒▒▒▒▓▓████████▓▓░░░░░░░░░░████░░░░░░░░▓▓████▓▓▒▒▒▒░░░░
      ▓▓████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓████████▓▓▒▒▒▒░░
            ▓▓████████████████████████████▓▓░░░░
                  ▓▓██████████████████▓▓░░░░    ░░
                        ▓▓████████▓▓░░░░      ░░░░░░
                              ▓▓▓▓░░        ░░░░░░░░░░
                                          ░░░░░░░░░░░░░░
                                                ░░░░░░
`;

const BUTTERFLY = `
            ▓▓▓▓▓▓▓▓                      ▓▓▓▓▓▓▓▓
        ▓▓▓▓░░░░░░▓▓▓▓                ▓▓▓▓░░░░░░▓▓▓▓
      ▓▓░░░░▒▒▒▒░░░░▓▓              ▓▓░░░░▒▒▒▒░░░░▓▓
    ▓▓░░▒▒████▒▒░░▓▓              ▓▓░░▒▒████▒▒░░▓▓
    ▓▓░░▒▒████▒▒░░▓▓    ▓▓▓▓▓▓    ▓▓░░▒▒████▒▒░░▓▓
      ▓▓░░▒▒▒▒░░▓▓    ▓▓░░░░▓▓      ▓▓░░▒▒▒▒░░▓▓
        ▓▓░░░░▓▓      ▓▓░░░░▓▓        ▓▓░░░░▓▓
          ▓▓▓▓        ▓▓░░░░▓▓          ▓▓▓▓
                      ▓▓░░░░▓▓
                        ▓▓▓▓
`;

const MOTHERBOARD = `
┌────────────────────────────────────────────────────────┐
│  ╔══════╗   ┌──┐  ┌──┐  ┌──┐  ┌──┐                    │
│  ║ CPU  ║   │▓▓│  │▓▓│  │▓▓│  │▓▓│    ┌────────────┐  │
│  ║      ║   └──┘  └──┘  └──┘  └──┘    │   GHOST    │  │
│  ╚══════╝                              │  PROTOCOL  │  │
│     ║║                                 └────────────┘  │
│  ┌──╨╨──┐   ┌─────────────────────┐                    │
│  │░░░░░░│   │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│   ═══════════════ │
│  │░░░░░░│   │▒▒▒  GPU SLOT  ▒▒▒▒▒│                    │
│  │░░░░░░│   │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│   ═══════════════ │
│  └──────┘   └─────────────────────┘                    │
│                                                        │
│  ○ ○ ○ ○ ○   ▓▓▓   ▓▓▓   ▓▓▓        ┌──┐ ┌──┐ ┌──┐   │
│  ○ ○ ○ ○ ○                          │▓▓│ │▓▓│ │▓▓│   │
│  ○ ○ ○ ○ ○   RAM   RAM   RAM        └──┘ └──┘ └──┘   │
│                                                        │
│  ════════════════════════════════════════════════════  │
│  │ I/O │ USB │ LAN │ AUDIO │ POWER │    ░░░░░░░░░░░   │
└────────────────────────────────────────────────────────┘
`;

const GPU_CHIP = `
    ╔═══════════════════════════════╗
    ║  ┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐  ║
    ║  └─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘  ║
    ║ ┌─┐                       ┌─┐ ║
    ║ └─┘  ┌─────────────────┐  └─┘ ║
    ║ ┌─┐  │   ▓▓▓▓▓▓▓▓▓▓▓   │  ┌─┐ ║
    ║ └─┘  │   ▓ NVIDIA ▓   │  └─┘ ║
    ║ ┌─┐  │   ▓▓▓▓▓▓▓▓▓▓▓   │  ┌─┐ ║
    ║ └─┘  └─────────────────┘  └─┘ ║
    ║ ┌─┐                       ┌─┐ ║
    ║ └─┘                       └─┘ ║
    ║  ┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐  ║
    ║  └─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘  ║
    ╚═══════════════════════════════╝
`;

const BINARY_WAVE = `
01001000 01000101 01001100 01001100 01001111
10110010 00101001 11010010 10100101 01001010
01010010 10100101 01010010 10100101 01010010
11010010 01010100 10101010 01010101 10101010
00101010 10101010 01010101 01010101 10101010
`;

// Floating Code Particle
const CodeParticle = ({ children, depth, initialX, initialY, mouseX, mouseY }) => {
  const parallaxFactor = depth * 0.05;
  
  const x = useTransform(mouseX, [-500, 500], [initialX + 30 * parallaxFactor, initialX - 30 * parallaxFactor]);
  const y = useTransform(mouseY, [-500, 500], [initialY + 20 * parallaxFactor, initialY - 20 * parallaxFactor]);
  
  const springX = useSpring(x, { stiffness: 50, damping: 30 });
  const springY = useSpring(y, { stiffness: 50, damping: 30 });

  return (
    <motion.pre
      style={{
        x: springX,
        y: springY,
        position: 'absolute',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: `${8 + depth * 2}px`,
        lineHeight: 1.2,
        color: 'white',
        opacity: 0.05 + (depth * 0.015),
        filter: `blur(${Math.max(0, 1.5 - depth * 0.3)}px)`,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'pre',
        zIndex: depth,
      }}
    >
      {children}
    </motion.pre>
  );
};

// Animated Swimming Koi
const SwimmingKoi = ({ mouseX, mouseY }) => {
  const [position, setPosition] = useState({ x: -400, y: 200 });
  
  useEffect(() => {
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + 0.3,
        y: prev.y + Math.sin(Date.now() / 2000) * 0.5
      }));
    };
    
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  const resetPosition = position.x > window.innerWidth + 500;
  const actualX = resetPosition ? -600 : position.x;
  
  useEffect(() => {
    if (resetPosition) {
      setPosition({ x: -600, y: 150 + Math.random() * 300 });
    }
  }, [resetPosition]);

  const parallaxX = useTransform(mouseX, [-500, 500], [-20, 20]);
  const parallaxY = useTransform(mouseY, [-500, 500], [-15, 15]);
  
  const springX = useSpring(parallaxX, { stiffness: 30, damping: 20 });
  const springY = useSpring(parallaxY, { stiffness: 30, damping: 20 });

  return (
    <motion.pre
      style={{
        position: 'absolute',
        left: actualX,
        top: position.y,
        x: springX,
        y: springY,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '6px',
        lineHeight: 1,
        color: 'white',
        opacity: 0.06,
        filter: 'blur(1px)',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'pre',
        zIndex: 1,
        transform: 'scaleX(1)',
      }}
    >
      {KOI_FISH}
    </motion.pre>
  );
};

// Floating Butterfly
const FloatingButterfly = ({ mouseX, mouseY }) => {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const animate = () => {
      setRotation(Math.sin(Date.now() / 1000) * 5);
    };
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  const parallaxX = useTransform(mouseX, [-500, 500], [15, -15]);
  const parallaxY = useTransform(mouseY, [-500, 500], [10, -10]);
  
  const springX = useSpring(parallaxX, { stiffness: 40, damping: 25 });
  const springY = useSpring(parallaxY, { stiffness: 40, damping: 25 });

  return (
    <motion.pre
      style={{
        position: 'absolute',
        right: '15%',
        top: '20%',
        x: springX,
        y: springY,
        rotate: rotation,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '5px',
        lineHeight: 1,
        color: 'white',
        opacity: 0.055,
        filter: 'blur(0.5px)',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'pre',
        zIndex: 2,
      }}
    >
      {BUTTERFLY}
    </motion.pre>
  );
};

export default function CodeAbyss() {
  const containerRef = useRef(null);
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
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, #0a0a0a 0%, #000000 100%)',
      }}
      data-testid="code-abyss-background"
    >
      {/* Deep Layer - Motherboard Schematic */}
      <CodeParticle
        depth={1}
        initialX={-100}
        initialY={400}
        mouseX={mouseX}
        mouseY={mouseY}
      >
        {MOTHERBOARD}
      </CodeParticle>

      {/* Mid Layer - GPU Chip */}
      <CodeParticle
        depth={2}
        initialX={window.innerWidth - 500}
        initialY={600}
        mouseX={mouseX}
        mouseY={mouseY}
      >
        {GPU_CHIP}
      </CodeParticle>

      {/* Floating Binary Wave */}
      <CodeParticle
        depth={1.5}
        initialX={200}
        initialY={800}
        mouseX={mouseX}
        mouseY={mouseY}
      >
        {BINARY_WAVE}
      </CodeParticle>

      {/* Another Binary Wave */}
      <CodeParticle
        depth={0.5}
        initialX={window.innerWidth - 300}
        initialY={200}
        mouseX={mouseX}
        mouseY={mouseY}
      >
        {BINARY_WAVE}
      </CodeParticle>

      {/* Swimming Koi Fish */}
      <SwimmingKoi mouseX={mouseX} mouseY={mouseY} />

      {/* Floating Butterfly */}
      <FloatingButterfly mouseX={mouseX} mouseY={mouseY} />

      {/* Ambient Glow Spots */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)',
          bottom: '20%',
          right: '10%',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
}
