/**
 * HeroSection.jsx - Video + Search
 * 
 * - Full screen video
 * - Search with wave animation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

const VIDEO_URL = '/hero-video.mp4';

// Wave letter component
const WaveLetter = ({ char, index, isVisible }) => (
  <motion.span
    initial={{ opacity: 0.1 }}
    animate={isVisible ? { opacity: [0.1, 0.5, 0.1] } : { opacity: 0.1 }}
    transition={{
      duration: 2.5,
      delay: index * 0.3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    style={{
      display: 'inline-block',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '13px',
      letterSpacing: '0.25em',
      color: '#fff'
    }}
  >
    {char}
  </motion.span>
);

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const searchRef = useRef(null);
  const isInView = useInView(searchRef, { once: false, margin: "-50px" });

  const searchText = 'поиск';

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
    <div className="hero-wrapper" data-testid="hero-section">
      <style>{`
        .hero-wrapper {
          background: #000;
        }
        
        .hero-video-section {
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: #000;
        }
        
        .hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .hero-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 30%;
          background: linear-gradient(to top, #000 0%, transparent 100%);
          pointer-events: none;
        }
        
        .hero-play-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        .play-triangle {
          width: 0;
          height: 0;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          border-left: 16px solid rgba(255,255,255,0.5);
          margin-left: 3px;
        }
        
        /* Search Strip */
        .search-strip {
          height: 70px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .hero-search-form {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .hero-search-field {
          position: absolute;
          width: 200px;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: rgba(255,255,255,0.5);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.25em;
          text-align: center;
          caret-color: rgba(255,255,255,0.3);
          z-index: 2;
        }
        
        .wave-text {
          pointer-events: none;
          user-select: none;
        }
        
        .wave-text.hidden {
          opacity: 0;
        }
      `}</style>
      <div className="hero-video-section">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          onPlay={() => setIsPlaying(true)}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        {videoLoaded && !isPlaying && (
          <button className="hero-play-btn" onClick={handlePlayClick}>
            <div className="play-triangle" />
          </button>
        )}

        <div className="hero-gradient" />
      </div>

      {/* Search Strip */}
      <div className="search-strip" ref={searchRef}>
        <form onSubmit={handleSearch} className="hero-search-form">
          <div className={`wave-text ${(isFocused || searchQuery) ? 'hidden' : ''}`}>
            {searchText.split('').map((char, i) => (
              <WaveLetter 
                key={i} 
                char={char} 
                index={i} 
                isVisible={isInView && !isFocused && !searchQuery}
              />
            ))}
          </div>
          <input
            type="text"
            className="hero-search-field"
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
