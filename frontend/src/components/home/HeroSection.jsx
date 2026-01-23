/**
 * HeroSection.jsx - Video Full Screen + Search Below Viewport
 * 
 * Video takes 100vh, search strip is below (need to scroll)
 * Single snake line ~10% of perimeter, no visible border
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VIDEO_URL = 'https://customer-assets.emergentagent.com/job_dotkinetic/artifacts/l9nmmebs____202601201604_9ny2w.mp4';

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Force video play on multiple events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.muted = true;
      video.play().catch(err => console.log('Video play error:', err));
    };

    // Try to play immediately
    playVideo();

    // Also try on user interaction
    const handleInteraction = () => {
      playVideo();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('scroll', handleInteraction);

    // Try again after load
    video.addEventListener('loadeddata', playVideo);
    video.addEventListener('canplay', playVideo);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      video.removeEventListener('loadeddata', playVideo);
      video.removeEventListener('canplay', playVideo);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Calculate perimeter for snake animation
  // Approx perimeter of rounded rect 600x48 with 24px radius ≈ 1200px
  const perimeter = 1200;
  const snakeLength = perimeter * 0.1; // 10% of perimeter

  return (
    <div 
      className="hero-wrapper"
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        background: '#000'
      }}
      data-testid="hero-section"
    >
      <style>{`
        @keyframes snake-crawl {
          0% {
            stroke-dashoffset: ${perimeter};
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .search-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          height: 48px;
        }
        
        .search-input {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.1em;
          padding: 0 24px;
          text-align: center;
        }
        
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.15);
          text-transform: lowercase;
        }
        
        .search-input:focus::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        
        .snake-border {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        
        .snake-border svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        
        /* Single snake line - no base border visible */
        .snake-line {
          fill: none;
          stroke: rgba(255, 255, 255, 0.4);
          stroke-width: 1;
          stroke-linecap: round;
          stroke-dasharray: ${snakeLength} ${perimeter - snakeLength};
          animation: snake-crawl 10s linear infinite;
        }
        
        .search-container:focus-within .snake-line {
          stroke: rgba(255, 255, 255, 0.7);
          animation-duration: 6s;
        }
      `}</style>

      {/* Video Section - Full Viewport Height */}
      <div 
        style={{ 
          height: '100vh',
          position: 'relative', 
          overflow: 'hidden'
        }}
      >
        <video
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 1s ease'
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        {/* Gradient fade at bottom */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: 0,
            left: 0,
            right: 0,
            height: '20%',
            background: 'linear-gradient(to top, #050505 0%, transparent 100%)', 
            pointerEvents: 'none'
          }} 
        />
      </div>

      {/* Search Strip - Below Viewport (need to scroll) */}
      <div 
        style={{
          height: '80px',
          background: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px'
        }}
      >
        <form onSubmit={handleSearch} className="search-container">
          {/* Single Snake Border - No visible base border */}
          <div className="snake-border">
            <svg viewBox="0 0 600 48" preserveAspectRatio="none">
              <rect 
                className="snake-line"
                x="0.5" y="0.5" 
                width="599" height="47"
                rx="24" ry="24"
              />
            </svg>
          </div>
          
          <input
            type="text"
            className="search-input"
            placeholder="поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
