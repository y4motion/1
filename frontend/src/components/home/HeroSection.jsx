/**
 * HeroSection.jsx - Video + Search + Bento Controls
 * 
 * - Full screen video
 * - Search with wave animation
 * - Bento tiles: Zen Mode + Sonic Presets
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Moon, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { useGhostStore } from '../../stores/useGhostStore';

const VIDEO_URL = '/hero-video.mp4';

// Sound presets data with preview images
const SOUND_PRESETS = [
  { id: 'silence', name: 'Silence', preview: null },
  { id: 'rain', name: 'Rain', preview: '🌧️' },
  { id: 'forest', name: 'Forest', preview: '🌲' },
  { id: 'ocean', name: 'Ocean', preview: '🌊' },
  { id: 'fire', name: 'Fire', preview: '🔥' },
  { id: 'wind', name: 'Wind', preview: '💨' },
];

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

// Zen Mode Bento Tile
const ZenBento = () => {
  const { isZenMode, setZenMode } = useGhostStore();
  
  return (
    <motion.button
      className="bento-tile zen-bento"
      onClick={() => setZenMode(!isZenMode)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-testid="zen-bento"
    >
      <Moon size={16} strokeWidth={1.5} />
      <span className="bento-label">ZEN</span>
      <div className={`zen-indicator ${isZenMode ? 'active' : ''}`} />
    </motion.button>
  );
};

// Sonic Presets Bento Tile (horizontal scroll)
const SonicBento = () => {
  const { soundPreset, setSoundPreset, soundEnabled, setSoundEnabled } = useGhostStore();
  const scrollRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const handlePresetClick = (presetId) => {
    if (presetId === 'silence') {
      setSoundEnabled(false);
    } else {
      setSoundPreset(presetId);
      setSoundEnabled(true);
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };
  
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Auto-scroll animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 80, behavior: 'smooth' });
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bento-tile sonic-bento" data-testid="sonic-bento">
      <div className="sonic-header">
        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span className="bento-label">AMBIENT</span>
      </div>
      
      <div 
        className="sonic-presets-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {SOUND_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`sonic-preset ${soundPreset === preset.id ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset.id)}
          >
            <span className="preset-preview">
              {preset.preview || '—'}
            </span>
          </button>
        ))}
      </div>
      
      {canScrollRight && (
        <button className="scroll-hint" onClick={scrollRight}>
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
};

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
        
        /* Bento Controls Strip */
        .bento-controls {
          background: #000;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        
        .bento-tile {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .bento-tile:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }
        
        /* Zen Bento */
        .zen-bento {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          color: rgba(255,255,255,0.4);
        }
        
        .zen-bento:hover {
          color: rgba(255,255,255,0.6);
        }
        
        .bento-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
        }
        
        .zen-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.3s ease;
        }
        
        .zen-indicator.active {
          background: #fff;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        
        /* Sonic Bento */
        .sonic-bento {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          min-width: 200px;
          max-width: 280px;
          position: relative;
          overflow: hidden;
        }
        
        .sonic-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.4);
          flex-shrink: 0;
        }
        
        .sonic-presets-scroll {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 4px 0;
        }
        
        .sonic-presets-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .sonic-preset {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .sonic-preset:hover {
          background: rgba(255,255,255,0.08);
        }
        
        .sonic-preset.active {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        
        .preset-preview {
          font-size: 14px;
          opacity: 0.6;
        }
        
        .sonic-preset.active .preset-preview {
          opacity: 1;
        }
        
        .scroll-hint {
          position: absolute;
          right: 8px;
          background: linear-gradient(to right, transparent, #000 50%);
          padding: 4px 4px 4px 20px;
          color: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
        }
        
        .scroll-hint:hover {
          color: rgba(255,255,255,0.6);
        }
      `}</style>

      {/* Video Section */}
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

      {/* Bento Controls */}
      <div className="bento-controls">
        <ZenBento />
        <SonicBento />
      </div>
    </div>
  );
}
