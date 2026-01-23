/**
 * HeroSection.jsx - Clean Video Background
 * 
 * Simplified hero: just video background, no search, no effects
 */

import React, { useState } from 'react';

const VIDEO_URL = 'https://customer-assets.emergentagent.com/job_dotkinetic/artifacts/l9nmmebs____202601201604_9ny2w.mp4';

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);

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
      {/* Video Background - Full Screen */}
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
          transition: 'opacity 0.8s ease',
          zIndex: 1,
          background: '#000'
        }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Loading state */}
      {!videoLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          color: 'rgba(255,255,255,0.3)',
          fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.2em'
        }}>
          LOADING...
        </div>
      )}

      {/* Subtle dark overlay at bottom for content below */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, transparent 100%)', 
          zIndex: 2,
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
}
