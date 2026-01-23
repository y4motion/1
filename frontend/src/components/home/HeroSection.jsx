/**
 * HeroSection.jsx - Video + Minimal Search
 * 
 * No border, typewriter effect for placeholder
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'framer-motion';

const VIDEO_URL = '/hero-video.mp4';

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typedText, setTypedText] = useState('');
  const [hasTyped, setHasTyped] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const searchRef = useRef(null);
  const isInView = useInView(searchRef, { once: true, margin: "-100px" });

  // Typewriter effect when search comes into view
  useEffect(() => {
    if (isInView && !hasTyped) {
      const text = 'поиск';
      let i = 0;
      setTypedText('');
      
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
          setHasTyped(true);
        }
      }, 150);

      return () => clearInterval(typeInterval);
    }
  }, [isInView, hasTyped]);

  // Video autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        video.muted = true;
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        setIsPlaying(false);
      }
    };

    attemptPlay();
    video.addEventListener('canplay', attemptPlay);
    video.addEventListener('loadeddata', () => {
      setVideoLoaded(true);
      attemptPlay();
    });

    return () => {
      video.removeEventListener('canplay', attemptPlay);
    };
  }, []);

  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      await video.play();
      setIsPlaying(true);
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
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes pulse-play {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.8; }
        }
        
        .search-strip {
          height: 70px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .search-form {
          position: relative;
        }
        
        .search-input {
          width: 300px;
          background: none;
          border: none;
          outline: none;
          color: rgba(255, 255, 255, 0.4);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.2em;
          padding: 0;
          text-align: center;
          caret-color: rgba(255, 255, 255, 0.3);
        }
        
        .search-input::placeholder {
          color: transparent;
        }
        
        .search-input:focus {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .typewriter-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.15);
          pointer-events: none;
          white-space: nowrap;
        }
        
        .typewriter-placeholder.typing::after {
          content: '▌';
          animation: blink 0.7s step-end infinite;
          margin-left: 1px;
          font-size: 12px;
        }
        
        .typewriter-placeholder.done::after {
          display: none;
        }
        
        .search-form:focus-within .typewriter-placeholder,
        .search-form.has-value .typewriter-placeholder {
          opacity: 0;
        }
        
        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
          animation: pulse-play 3s ease-in-out infinite;
        }
        
        .play-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .play-icon {
          width: 0;
          height: 0;
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
          border-left: 20px solid rgba(255, 255, 255, 0.6);
          margin-left: 4px;
        }
      `}</style>

      {/* Video Section */}
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

        {/* Play button if needed */}
        {videoLoaded && !isPlaying && (
          <button className="play-button" onClick={handlePlayClick}>
            <div className="play-icon" />
          </button>
        )}

        {/* Bottom gradient */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: 0,
            left: 0,
            right: 0,
            height: '25%',
            background: 'linear-gradient(to top, #000 0%, transparent 100%)', 
            pointerEvents: 'none'
          }} 
        />
      </div>

      {/* Search Strip - Minimal */}
      <div className="search-strip" ref={searchRef}>
        <form 
          onSubmit={handleSearch} 
          className={`search-form ${searchQuery ? 'has-value' : ''}`}
        >
          {/* Typewriter placeholder */}
          <span className={`typewriter-placeholder ${hasTyped ? 'done' : 'typing'}`}>
            {typedText}
          </span>
          
          {/* Actual input */}
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="поиск"
          />
        </form>
      </div>
    </div>
  );
}
