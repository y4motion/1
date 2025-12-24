import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import TopArticlesWidget from './TopArticlesWidget';
import TopUsersWidget from './TopUsersWidget';
import TopProposalsWidget from './TopProposalsWidget';
import TestimonialsCarousel from './TestimonialsCarousel';
import coreAI from '../utils/coreAI';
import { categories, products } from '../mockData';
import '../styles/glassmorphism.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [greetingLines, setGreetingLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [cursor, setCursor] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [aiStatus, setAiStatus] = useState('online');
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Initialize Core AI and get personalized greeting
  useEffect(() => {
    coreAI.init(user);
    
    const initGreeting = async () => {
      const greeting = await coreAI.generateGreeting();
      setGreetingLines(greeting.lines);
      setSuggestions(coreAI.getSearchSuggestions());
    };
    
    initGreeting();
  }, [user]);

  // Typewriter effect - simplified and reliable
  useEffect(() => {
    if (greetingLines.length === 0 || showOverlay === false) return;

    const totalChars = greetingLines.reduce((sum, line) => sum + line.length, 0);
    let currentChar = 0;
    let lineIdx = 0;
    let charIdx = 0;

    const typeTimer = setInterval(() => {
      if (lineIdx >= greetingLines.length) {
        clearInterval(typeTimer);
        // Wait a bit then fade out
        setTimeout(() => {
          setShowOverlay(false);
        }, 1000);
        return;
      }

      const line = greetingLines[lineIdx];
      if (charIdx < line.length) {
        charIdx++;
        setCurrentLineIndex(lineIdx);
        setCurrentCharIndex(charIdx);
      } else {
        // Move to next line
        lineIdx++;
        charIdx = 0;
        if (lineIdx < greetingLines.length) {
          setCurrentLineIndex(lineIdx);
          setCurrentCharIndex(0);
        }
      }
    }, 50);

    return () => clearInterval(typeTimer);
  }, [greetingLines]);

  // Cursor blink
  useEffect(() => {
    const blinkInterval = setInterval(() => setCursor(prev => !prev), 530);
    return () => clearInterval(blinkInterval);
  }, []);

  // Rotating suggestions animation
  useEffect(() => {
    if (showOverlay) return;
    
    const rotateInterval = setInterval(() => {
      setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
    }, 3500);

    return () => clearInterval(rotateInterval);
  }, [showOverlay, suggestions.length]);

  // Get displayed text with typewriter effect
  const displayedText = useMemo(() => {
    const lines = [];
    for (let i = 0; i < currentLineIndex; i++) {
      lines.push(greetingLines[i]);
    }
    if (currentLineIndex < greetingLines.length) {
      lines.push(greetingLines[currentLineIndex].substring(0, currentCharIndex));
    }
    return lines;
  }, [greetingLines, currentLineIndex, currentCharIndex]);

  const handleSearch = useCallback((query) => {
    if (!query.trim()) return;
    coreAI.trackAction('search', { query });
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  }, [navigate]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);

  const featured = products.filter(p => p.originalPrice).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative' }}>
      {/* GLOBAL: Hide ALL Emergent system spinners */}
      <style>{`
        /* Complete removal of Emergent spinners */
        #emergent-loading,
        .emergent-spinner,
        .emergent-loading,
        [class*="emergent"][class*="loading"],
        [class*="emergent"][class*="spinner"],
        [id*="emergent"][id*="loading"],
        div[style*="z-index: 9999"] > div[style*="border-radius: 50%"],
        .loading-spinner,
        .page-loader {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* Animated suggestion styles */
        @keyframes suggestionSlideIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes suggestionSlideOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-15px); }
        }

        @keyframes overlayFadeOut {
          0% { opacity: 1; backdrop-filter: blur(10px); }
          100% { opacity: 0; backdrop-filter: blur(0px); pointer-events: none; }
        }

        @keyframes heroContentFadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(74, 222, 128, 0.4); }
          50% { box-shadow: 0 0 16px rgba(74, 222, 128, 0.7); }
        }

        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(15px); opacity: 0.5; }
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }
      `}</style>

      {/* === HERO SECTION === */}
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoLoaded ? 0.6 : 0,
            transition: 'opacity 1s ease',
            zIndex: 0,
            filter: 'brightness(0.4) contrast(1.1)'
          }}
        >
          <source src="https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-in-the-dark-5378/1080p.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient fallback / placeholder */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: videoLoaded 
            ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)'
            : 'radial-gradient(ellipse at center, rgba(10,10,15,1) 0%, rgba(0,0,0,1) 100%)',
          zIndex: 1
        }} />

        {/* Subtle white particles (when video not loaded) */}
        {!videoLoaded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '2px',
                  height: '2px',
                  background: 'rgba(255,255,255,0.4)',
                  borderRadius: '50%',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `particleFloat ${4 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        )}

        {/* === AI GREETING OVERLAY === */}
        {showOverlay && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 9998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: currentLineIndex >= greetingLines.length ? 'overlayFadeOut 0.7s ease forwards' : 'none',
              animationDelay: currentLineIndex >= greetingLines.length ? '1.2s' : '0s'
            }}
          >
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                maxWidth: '700px',
                width: '100%'
              }}
            >
              {/* Terminal-style greeting */}
              <div
                style={{
                  fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Courier New", monospace',
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                  color: '#ffffff',
                  textShadow: '0 0 25px rgba(255,255,255,0.4), 0 0 50px rgba(255,255,255,0.15)',
                  lineHeight: '2.2',
                  letterSpacing: '0.03em',
                  textAlign: 'center'
                }}
              >
                {displayedText.map((line, idx) => (
                  <div key={idx} style={{ marginBottom: '0.3rem' }}>
                    {line}
                    {idx === displayedText.length - 1 && currentLineIndex < greetingLines.length && (
                      <span style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '1.2em',
                        background: cursor ? 'rgba(255,255,255,0.9)' : 'transparent',
                        marginLeft: '2px',
                        verticalAlign: 'text-bottom',
                        boxShadow: cursor ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === MAIN HERO CONTENT (visible after overlay fades) === */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '700px',
            padding: '2rem',
            opacity: showOverlay ? 0 : 1,
            visibility: showOverlay ? 'hidden' : 'visible',
            transform: showOverlay ? 'translateY(30px)' : 'translateY(0)',
            transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s, visibility 0s linear 0.2s'
          }}
        >
          {/* Search Bar - Ultra Minimal Glassmorphism */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isSearchFocused 
                ? '1px solid rgba(255, 255, 255, 0.25)' 
                : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              transition: 'all 0.3s ease',
              boxShadow: isSearchFocused 
                ? '0 0 30px rgba(255, 255, 255, 0.08), inset 0 0 20px rgba(255,255,255,0.02)' 
                : 'none'
            }}>
              <input
                type="text"
                placeholder="Ищи железо, сборку или спроси меня..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => {
                  setIsSearchFocused(false);
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                style={{
                  width: '100%',
                  padding: '1rem 5.5rem 1rem 1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  textAlign: 'center',
                  fontWeight: '400',
                  letterSpacing: '0.01em'
                }}
              />
              
              {/* Right side icons */}
              <div style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'center'
              }}>
                {/* Microphone button */}
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.35)',
                    cursor: 'pointer',
                    padding: '0.3rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label="Голосовой поиск"
                >
                  <Mic size={18} />
                </button>

                {/* AI Button with status indicator */}
                <div style={{ position: 'relative' }}>
                  <button
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="Core AI online"
                    aria-label="Core AI"
                  >
                    <Sparkles size={14} />
                  </button>
                  
                  {/* Green pulsing status dot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#4ade80',
                      border: '2px solid rgba(0, 0, 0, 0.8)',
                      animation: 'pulseGlow 2s ease-in-out infinite'
                    }}
                    title="Core AI online"
                  />
                </div>
              </div>
            </div>

            {/* Animated Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.75rem)',
                left: 0,
                right: 0,
                background: 'rgba(8, 8, 12, 0.95)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Sparkles size={12} />
                  Core AI предлагает:
                </div>
                {suggestions.slice(0, 5).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      background: activeSuggestionIndex === i ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: activeSuggestionIndex === i ? 'white' : 'rgba(255, 255, 255, 0.65)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.25s ease',
                      marginBottom: '0.25rem',
                      transform: activeSuggestionIndex === i ? 'translateX(5px)' : 'translateX(0)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = activeSuggestionIndex === i ? 'rgba(255, 255, 255, 0.06)' : 'transparent';
                      e.currentTarget.style.color = activeSuggestionIndex === i ? 'white' : 'rgba(255, 255, 255, 0.65)';
                      e.currentTarget.style.transform = activeSuggestionIndex === i ? 'translateX(5px)' : 'translateX(0)';
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Floating animated suggestions below search (when not focused) */}
          {!showOverlay && !showSuggestions && (
            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              minHeight: '28px'
            }}>
              <div
                key={activeSuggestionIndex}
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  animation: 'suggestionSlideIn 0.5s ease forwards',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSuggestionClick(suggestions[activeSuggestionIndex])}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                {suggestions[activeSuggestionIndex]}
              </div>
            </div>
          )}

          {/* CTA Buttons - Glass style */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { label: 'Начать сборку', path: '/pc-builder', icon: '⚡' },
              { label: 'Готовые билды', path: '/marketplace', icon: '🎮' },
              { label: 'Сообщество', path: '/feed', icon: '💬' }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() => navigate(btn.path)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === CONTENT BLOCKS === */}
      <div style={{ padding: '0 2.5rem', marginBottom: '4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          maxWidth: '1840px',
          margin: '0 auto 24px'
        }}>
          {[
            { t: 'RATING', i: 'https://images.unsplash.com/photo-1602025882379-e01cf08baa51?w=800&q=80', l: '/rating' },
            { t: 'ARTICLES', i: 'https://images.unsplash.com/photo-1626958390898-162d3577f293?w=800&q=80', l: '/articles' },
            { t: 'CREATORS', i: 'https://images.unsplash.com/photo-1618586810102-aaa7049200c0?w=800&q=80', l: '/creators' },
            { t: 'GROUP BUY', i: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=800', l: '/groupbuy' }
          ].map((c, idx) => (
            <div
              key={idx}
              onClick={() => navigate(c.l)}
              style={{
                aspectRatio: '1/1',
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src={c.i} alt={c.t} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{
                  color: '#fff',
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  fontWeight: '700',
                  textShadow: '2px 2px 12px rgba(0,0,0,0.9)',
                  letterSpacing: '0.05em'
                }}>{c.t}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* FEED Banner */}
        <div
          onClick={() => navigate('/feed')}
          style={{
            height: '560px',
            maxWidth: '1840px',
            margin: '0 auto',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src="https://images.unsplash.com/photo-1615031465602-20f3ff3ca279?w=1600&q=80"
            alt="FEED"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{
              color: '#fff',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '700',
              textShadow: '2px 2px 16px rgba(0,0,0,0.9)',
              letterSpacing: '0.1em'
            }}>FEED</h3>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Widgets Section */}
      <div style={{ padding: '0 2.5rem' }}>
        <div style={{
          marginTop: '4rem',
          marginBottom: '4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          maxWidth: '1840px',
          margin: '0 auto'
        }}>
          <TopArticlesWidget />
          <TopUsersWidget />
          <TopProposalsWidget />
        </div>

        {/* Categories */}
        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '1.5rem'
          }}>
            Популярные категории
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categories.slice(0, 8).map(cat => (
              <a
                key={cat.id}
                href={`/category/${cat.slug}`}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.04)';
                  e.target.style.color = 'rgba(255,255,255,0.7)';
                }}
              >{cat.name}</a>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div style={{ margin: '3rem 0' }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            FEATURED DEALS
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            maxWidth: '1840px',
            margin: '0 auto'
          }}>
            {featured.map(p => (
              <a key={p.id} href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: 'rgb(10,10,10)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem'
                    }}>
                      {p.category}
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#fff' }}>{p.name}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1rem' }}>{p.description}</p>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>${p.price}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
