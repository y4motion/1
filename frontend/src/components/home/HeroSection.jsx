/**
 * HeroSection.jsx - Video + Scattered Philosophy Text
 * 
 * Black sharp typography appearing in different positions
 * Each phrase fades in then fades out
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEO_URL = 'https://customer-assets.emergentagent.com/job_dotkinetic/artifacts/l9nmmebs____202601201604_9ny2w.mp4';

// Philosophy phrases with positions and timing
const PHILOSOPHY_LINES = [
  { 
    text: 'минимализм', 
    delay: 1.5,
    duration: 3,
    position: { top: '15%', left: '10%' },
    size: 'xl'
  },
  { 
    text: '— что это такое?', 
    delay: 3.5,
    duration: 2.5,
    position: { top: '35%', right: '8%' },
    size: 'lg'
  },
  { 
    text: 'это не мучительное устранение бесполезного', 
    delay: 6,
    duration: 3,
    position: { bottom: '40%', left: '5%' },
    size: 'md'
  },
  { 
    text: 'и не аскетизм....', 
    delay: 9,
    duration: 2,
    position: { top: '25%', right: '15%' },
    size: 'md'
  },
  { 
    text: 'это максимум ресурса', 
    delay: 11.5,
    duration: 3,
    position: { bottom: '30%', right: '10%' },
    size: 'lg'
  },
  { 
    text: 'в чистом пространстве', 
    delay: 14.5,
    duration: 4,
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    size: 'xl'
  },
];

const PhilosophyLine = ({ line, isVisible }) => {
  const sizeStyles = {
    xl: { fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 700 },
    lg: { fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 600 },
    md: { fontSize: 'clamp(1rem, 2.5vw, 1.8rem)', fontWeight: 500 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1],
            exit: { duration: 0.6 }
          }}
          style={{
            position: 'absolute',
            ...line.position,
            fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
            fontStyle: 'italic',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            maxWidth: '45%',
            textShadow: '0 0 30px rgba(255,255,255,0.3)',
            ...sizeStyles[line.size]
          }}
        >
          {line.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [visibleLines, setVisibleLines] = useState({});
  const [cycleKey, setCycleKey] = useState(0);

  // Animate lines appearing and disappearing
  useEffect(() => {
    const timers = [];
    
    // Reset
    setVisibleLines({});
    
    // Schedule each line appearance and disappearance
    PHILOSOPHY_LINES.forEach((line, index) => {
      // Show
      const showTimer = setTimeout(() => {
        setVisibleLines(prev => ({ ...prev, [index]: true }));
      }, line.delay * 1000);
      timers.push(showTimer);

      // Hide
      const hideTimer = setTimeout(() => {
        setVisibleLines(prev => ({ ...prev, [index]: false }));
      }, (line.delay + line.duration) * 1000);
      timers.push(hideTimer);
    });

    // Restart cycle
    const resetTimer = setTimeout(() => {
      setCycleKey(prev => prev + 1);
    }, 22000);
    timers.push(resetTimer);

    return () => timers.forEach(t => clearTimeout(t));
  }, [cycleKey]);

  // Force video play
  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }, [videoLoaded]);

  return (
    <div 
      className="hero-section-clean"
      style={{ 
        height: '100vh', 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        background: '#000'
      }}
      data-testid="hero-section"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
      `}</style>

      {/* Video Background */}
      <video
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        onCanPlay={() => setVideoLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 1s ease',
          zIndex: 1,
          background: '#000'
        }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Philosophy Text - Scattered */}
      <div 
        key={cycleKey}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {PHILOSOPHY_LINES.map((line, index) => (
          <PhilosophyLine 
            key={index} 
            line={line} 
            isVisible={visibleLines[index]} 
          />
        ))}
      </div>

      {/* Bottom gradient */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: 0,
          left: 0,
          right: 0,
          height: '20%',
          background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, transparent 100%)', 
          zIndex: 15,
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
}
