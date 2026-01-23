/**
 * HeroSection.jsx - Video + Philosophy Text
 * 
 * Clean video background with animated minimalist philosophy text
 * Japanese-style italic typography
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEO_URL = 'https://customer-assets.emergentagent.com/job_dotkinetic/artifacts/l9nmmebs____202601201604_9ny2w.mp4';

// Philosophy phrases - appearing sequentially
const PHILOSOPHY_LINES = [
  { text: 'минимализм', delay: 1.5 },
  { text: '— что это такое?', delay: 3 },
  { text: 'это не мучительное устранение бесполезного', delay: 5.5 },
  { text: 'и не аскетизм....', delay: 8 },
  { text: 'это максимум ресурса', delay: 10.5 },
  { text: 'в чистом пространстве', delay: 12.5 },
];

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [visibleLines, setVisibleLines] = useState([]);
  const [cycleKey, setCycleKey] = useState(0);

  // Animate lines appearing
  useEffect(() => {
    const timers = [];
    
    // Reset visible lines
    setVisibleLines([]);
    
    // Schedule each line appearance
    PHILOSOPHY_LINES.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
      }, line.delay * 1000);
      timers.push(timer);
    });

    // After all lines shown, wait then restart cycle
    const resetTimer = setTimeout(() => {
      setVisibleLines([]);
      setCycleKey(prev => prev + 1);
    }, 20000); // 20 seconds total cycle
    timers.push(resetTimer);

    return () => timers.forEach(t => clearTimeout(t));
  }, [cycleKey]);

  // Force video play on load
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&display=swap');
        
        .philosophy-container {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding: 2rem;
          pointer-events: none;
        }
        
        .philosophy-line {
          font-family: 'Cormorant Garamond', 'Times New Roman', serif;
          font-style: italic;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
          line-height: 1.4;
          letter-spacing: 0.08em;
          text-shadow: 0 2px 20px rgba(0,0,0,0.8);
        }
        
        .philosophy-line.title {
          font-size: clamp(2.5rem, 8vw, 5rem);
          margin-bottom: 0.2em;
          font-weight: 400;
        }
        
        .philosophy-line.subtitle {
          font-size: clamp(1.2rem, 3vw, 2rem);
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2em;
        }
        
        .philosophy-line.body {
          font-size: clamp(1rem, 2.5vw, 1.5rem);
          color: rgba(255, 255, 255, 0.6);
          max-width: 600px;
          margin-bottom: 0.5em;
        }
        
        .philosophy-line.accent {
          font-size: clamp(1.1rem, 2.8vw, 1.7rem);
          color: rgba(255, 255, 255, 0.85);
          margin-top: 0.5em;
        }
        
        .philosophy-line.final {
          font-size: clamp(1.2rem, 3vw, 1.9rem);
          color: rgba(255, 255, 255, 0.95);
          font-weight: 400;
        }
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

      {/* Dark overlay for text readability */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)', 
          zIndex: 2,
          pointerEvents: 'none'
        }} 
      />

      {/* Philosophy Text */}
      <div className="philosophy-container" key={cycleKey}>
        <AnimatePresence>
          {/* Line 1: минимализм */}
          {visibleLines.includes(0) && (
            <motion.div
              className="philosophy-line title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              минимализм
            </motion.div>
          )}

          {/* Line 2: — что это такое? */}
          {visibleLines.includes(1) && (
            <motion.div
              className="philosophy-line subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              — что это такое?
            </motion.div>
          )}

          {/* Line 3: это не мучительное устранение бесполезного */}
          {visibleLines.includes(2) && (
            <motion.div
              className="philosophy-line body"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              это не мучительное устранение бесполезного
            </motion.div>
          )}

          {/* Line 4: и не аскетизм.... */}
          {visibleLines.includes(3) && (
            <motion.div
              className="philosophy-line body"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              и не аскетизм....
            </motion.div>
          )}

          {/* Line 5: это максимум ресурса */}
          {visibleLines.includes(4) && (
            <motion.div
              className="philosophy-line accent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              это максимум ресурса
            </motion.div>
          )}

          {/* Line 6: в чистом пространстве */}
          {visibleLines.includes(5) && (
            <motion.div
              className="philosophy-line final"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              в чистом пространстве
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom gradient fade to content below */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: 0,
          left: 0,
          right: 0,
          height: '25%',
          background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, transparent 100%)', 
          zIndex: 15,
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
}
