/**
 * HeroSection.jsx - Video Full Screen + Search Below
 * 
 * Single snake line crawling around invisible border
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VIDEO_URL = 'https://customer-assets.emergentagent.com/job_dotkinetic/artifacts/l9nmmebs____202601201604_9ny2w.mp4';

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Force video play
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    playVideo();
    video.addEventListener('loadeddata', playVideo);
    video.addEventListener('canplay', playVideo);
    
    // Try on first interaction
    const handleClick = () => {
      playVideo();
      document.removeEventListener('click', handleClick);
    };
    document.addEventListener('click', handleClick);

    return () => {
      video.removeEventListener('loadeddata', playVideo);
      video.removeEventListener('canplay', playVideo);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
        @keyframes snake-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .search-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          height: 48px;
          border-radius: 24px;
          overflow: hidden;
        }
        
        .search-input {
          position: relative;
          z-index: 2;
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
          color: rgba(255, 255, 255, 0.3);
        }
        
        /* Snake border effect using conic gradient */
        .snake-glow {
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 324deg,
            rgba(255, 255, 255, 0.5) 342deg,
            rgba(255, 255, 255, 0.3) 350deg,
            transparent 360deg
          );
          animation: snake-rotate 8s linear infinite;
          z-index: 1;
        }
        
        .search-container:focus-within .snake-glow {
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 315deg,
            rgba(255, 255, 255, 0.8) 340deg,
            rgba(255, 255, 255, 0.5) 352deg,
            transparent 360deg
          );
          animation-duration: 5s;
        }
        
        /* Inner black to hide the gradient center */
        .search-inner {
          position: absolute;
          inset: 1px;
          background: #050505;
          border-radius: 24px;
          z-index: 1;
        }
      `}</style>

      {/* Video Section - Full Viewport */}
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

        {/* Bottom gradient */}
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

      {/* Search Strip */}
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
          {/* Rotating snake glow */}
          <div className="snake-glow" />
          
          {/* Inner background */}
          <div className="search-inner" />
          
          {/* Input */}
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
