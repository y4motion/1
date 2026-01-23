/**
 * HeroSection.jsx - Video Full Screen + Search Below
 * 
 * Video with autoplay fix, search with snake animation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const VIDEO_URL = '/hero-video.mp4';

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Attempt autoplay with multiple strategies
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Autoplay blocked, showing play button');
        setIsPlaying(false);
      }
    };

    // Try immediately
    attemptPlay();

    // Try again when video is ready
    video.addEventListener('canplay', attemptPlay);
    video.addEventListener('loadeddata', () => {
      setVideoLoaded(true);
      attemptPlay();
    });

    return () => {
      video.removeEventListener('canplay', attemptPlay);
    };
  }, []);

  // Manual play handler
  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (video) {
      try {
        video.muted = true;
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Play failed:', err);
      }
    }
  };

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
        
        @keyframes pulse-play {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
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
        
        .search-inner {
          position: absolute;
          inset: 1px;
          background: #050505;
          border-radius: 24px;
          z-index: 1;
        }
        
        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
          animation: pulse-play 2s ease-in-out infinite;
        }
        
        .play-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .play-button svg {
          color: rgba(255, 255, 255, 0.8);
          margin-left: 4px;
        }
      `}</style>

      {/* Video Section - Full Viewport */}
      <div 
        style={{ 
          height: '100vh',
          position: 'relative', 
          overflow: 'hidden',
          background: '#000'
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
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        {/* Play button if autoplay blocked */}
        {videoLoaded && !isPlaying && (
          <button 
            className="play-button"
            onClick={handlePlayClick}
            aria-label="Play video"
          >
            <Play size={32} />
          </button>
        )}

        {/* Loading indicator - hide after 3 seconds even if video not loaded */}
        {!videoLoaded && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              letterSpacing: '0.2em',
              animation: 'fadeOut 3s forwards 2s'
            }}
          >
            <style>{`
              @keyframes fadeOut {
                to { opacity: 0; visibility: hidden; }
              }
            `}</style>
          </div>
        )}

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
          <div className="snake-glow" />
          <div className="search-inner" />
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
