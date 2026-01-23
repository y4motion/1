/**
 * HeroSection.jsx - Video + Search Bar Below
 * 
 * Clean video, black strip below with animated snake-border search
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VIDEO_URL = 'https://customer-assets.emergentagent.com/job_dotkinetic/artifacts/l9nmmebs____202601201604_9ny2w.mp4';

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Force video play
  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }, [videoLoaded]);

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
        /* Snake border animation */
        @keyframes snake-move {
          0% {
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes snake-move-reverse {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1000;
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
          color: rgba(255, 255, 255, 0.8);
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          letter-spacing: 0.05em;
          padding: 0 20px;
          text-align: center;
        }
        
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
          transition: color 0.3s ease;
        }
        
        .search-input:focus::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .snake-border {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: visible;
        }
        
        .snake-border svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        
        .snake-border rect {
          fill: none;
          stroke: rgba(255, 255, 255, 0.15);
          stroke-width: 1;
          rx: 24;
          ry: 24;
        }
        
        .snake-line {
          fill: none;
          stroke: rgba(255, 255, 255, 0.5);
          stroke-width: 1;
          stroke-linecap: round;
          stroke-dasharray: 80 920;
          animation: snake-move 8s linear infinite;
        }
        
        .search-container:focus-within .snake-line {
          stroke: rgba(255, 255, 255, 0.8);
          stroke-dasharray: 150 850;
          animation-duration: 5s;
        }
        
        .snake-line-2 {
          stroke-dasharray: 60 940;
          animation: snake-move-reverse 12s linear infinite;
          animation-delay: -4s;
          stroke: rgba(255, 255, 255, 0.25);
        }
        
        .search-container:focus-within .snake-line-2 {
          stroke: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* Video Section */}
      <div 
        style={{ 
          height: 'calc(100vh - 80px)', 
          position: 'relative', 
          overflow: 'hidden'
        }}
      >
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
            transition: 'opacity 1s ease'
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        {/* Bottom fade to black strip */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to top, #000 0%, transparent 100%)', 
            pointerEvents: 'none'
          }} 
        />
      </div>

      {/* Black Search Strip */}
      <div 
        style={{
          height: '80px',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px'
        }}
      >
        <form onSubmit={handleSearch} className="search-container">
          {/* Animated Snake Border */}
          <div className="snake-border">
            <svg viewBox="0 0 600 48" preserveAspectRatio="none">
              {/* Base subtle border */}
              <rect x="0.5" y="0.5" width="599" height="47" />
              
              {/* Animated snake line 1 */}
              <rect 
                className="snake-line"
                x="0.5" y="0.5" 
                width="599" height="47"
              />
              
              {/* Animated snake line 2 (opposite direction) */}
              <rect 
                className="snake-line snake-line-2"
                x="0.5" y="0.5" 
                width="599" height="47"
              />
            </svg>
          </div>
          
          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </form>
      </div>
    </div>
  );
}
