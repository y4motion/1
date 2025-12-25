import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Sparkles, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import coreAI from '../../utils/coreAI';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMultiMenu, setShowMultiMenu] = useState(false);
  const [activeMultiTool, setActiveMultiTool] = useState('voice');
  const [displayText, setDisplayText] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showHint, setShowHint] = useState(!localStorage.getItem('searchHintShown'));
  
  const searchInputRef = useRef(null);
  const multiMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if greeting should be shown
  const shouldShowGreeting = () => {
    if (sessionStorage.getItem('greetingShown')) return false;
    const lastVisit = localStorage.getItem('lastGreetingTime');
    if (lastVisit) {
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (parseInt(lastVisit) > hourAgo) return false;
    }
    return true;
  };

  const [greetingDone, setGreetingDone] = useState(!shouldShowGreeting());
  const [greetingLines, setGreetingLines] = useState([
    "System online.",
    "Привет, Гость.",
    "Готов помочь с железом мечты."
  ]);

  // Particles
  const particles = useMemo(() => 
    [...Array(40)].map((_, i) => ({
      id: i,
      size: 1 + Math.random() * 2.5,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      fadeDuration: 6 + Math.random() * 8,
      fadeDelay: Math.random() * 10,
      driftDuration: 15 + Math.random() * 25,
      driftDelay: Math.random() * 15,
      driftIndex: Math.floor(Math.random() * 4)
    })), []
  );

  // Init
  useEffect(() => {
    coreAI.init(user);
    const aiSuggestions = coreAI.getSearchSuggestions();
    setSuggestions(['Ищи железо, сборку или спроси меня...', ...aiSuggestions]);
    
    const initGreeting = async () => {
      const greeting = await coreAI.generateGreeting();
      if (greeting.lines && greeting.lines.length > 0) {
        setGreetingLines(greeting.lines);
      }
    };
    initGreeting();
  }, [user]);

  // Typewriter effect
  useEffect(() => {
    if (greetingDone || greetingLines.length === 0) return;
    
    let charIndex = 0;
    let isActive = true;
    setDisplayText('> _');
    
    const typeLine = (lineIndex) => {
      if (!isActive || lineIndex >= greetingLines.length) {
        setTimeout(() => {
          if (isActive) {
            sessionStorage.setItem('greetingShown', 'true');
            localStorage.setItem('lastGreetingTime', Date.now().toString());
            setGreetingDone(true);
          }
        }, 800);
        return;
      }
      
      charIndex = 0;
      const line = greetingLines[lineIndex];
      
      const typeChar = () => {
        if (!isActive) return;
        if (charIndex <= line.length) {
          setDisplayText(line.substring(0, charIndex));
          charIndex++;
          setTimeout(typeChar, 65);
        } else {
          setTimeout(() => {
            if (isActive) typeLine(lineIndex + 1);
          }, 1200);
        }
      };
      typeChar();
    };
    
    setTimeout(() => typeLine(0), 1000);
    return () => { isActive = false; };
  }, [greetingLines, greetingDone]);

  // Parallax scroll effect
  useEffect(() => {
    if (!greetingDone) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const particles = document.querySelectorAll('.hero-particle');
      
      particles.forEach((particle) => {
        const speed = parseFloat(particle.dataset.speed) || 0.05;
        particle.style.transform = `translateY(${scrollY * speed}px)`;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [greetingDone]);

  // Rotating suggestions
  useEffect(() => {
    if (!greetingDone || !isSearchActive || suggestions.length === 0) return;
    const getDelay = () => activeSuggestion === 0 ? 7000 : 4500;
    const timeout = setTimeout(() => {
      setActiveSuggestion(prev => (prev + 1) % suggestions.length);
    }, getDelay());
    return () => clearTimeout(timeout);
  }, [greetingDone, isSearchActive, suggestions.length, activeSuggestion]);

  // Hide hint after timeout
  useEffect(() => {
    if (showHint && !isSearchActive) {
      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('searchHintShown', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHint, isSearchActive]);

  // Close multi menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (multiMenuRef.current && !multiMenuRef.current.contains(e.target)) {
        setShowMultiMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchActivate = () => {
    setIsSearchActive(true);
    setShowHint(false);
    localStorage.setItem('searchHintShown', 'true');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 400);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!searchQuery && searchContainerRef.current && 
          !searchContainerRef.current.contains(document.activeElement)) {
        setIsSearchFocused(false);
      }
    }, 200);
  };

  const handleSearch = useCallback((query) => {
    if (!query.trim()) return;
    coreAI.trackAction('search', { query });
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  }, [navigate]);

  const handleMultiToolSelect = (tool) => {
    setActiveMultiTool(tool);
    setShowMultiMenu(false);
    
    if (tool === 'voice') {
      console.log('Voice search activated');
    } else if (tool === 'ai') {
      window.dispatchEvent(new CustomEvent('openGlassyChat', { detail: { tab: 'ai' } }));
    } else if (tool === 'history') {
      console.log('Search history');
    }
  };

  const multiToolConfig = {
    voice: { icon: Mic, label: 'Голосовой поиск' },
    ai: { icon: Sparkles, label: 'Спросить CORE AI' },
    history: { icon: Clock, label: 'История поиска' }
  };

  const ActiveIcon = multiToolConfig[activeMultiTool].icon;

  const quickActions = [
    { text: 'Начать сборку', link: '/assembly' },
    { text: 'Готовые билды', link: '/builds' },
    { text: 'Сообщество', link: '/community' }
  ];

  return (
    <div style={{ height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <style>{heroStyles}</style>

      {/* Video Background */}
      <video
        autoPlay muted loop playsInline
        onLoadedData={() => setVideoLoaded(true)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: videoLoaded ? 0.5 : 0,
          transition: 'opacity 1s ease', zIndex: 0, filter: 'brightness(0.35) contrast(1.1)'
        }}
      >
        <source src="https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-in-the-dark-5378/1080p.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient base */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(8,8,12,1) 0%, rgba(0,0,0,1) 100%)', zIndex: 1 }} />

      {/* Floating particles */}
      {greetingDone && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden', pointerEvents: 'none' }}>
          {particles.map((p) => (
            <div
              key={p.id}
              className="hero-particle"
              data-speed={0.05 + (p.id % 3) * 0.02}
              style={{
                position: 'absolute', width: `${p.size}px`, height: `${p.size}px`,
                background: 'rgba(255,255,255,0.6)', borderRadius: '50%',
                left: `${p.startX}%`, top: `${p.startY}%`,
                animation: `drift${p.driftIndex + 1} ${p.driftDuration}s ease-in-out infinite, particleFade ${p.fadeDuration}s ease-in-out infinite`,
                animationDelay: `${p.driftDelay}s, ${p.fadeDelay}s`, willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>
      )}

      {/* Greeting Overlay */}
      {!greetingDone && (
        <div style={{ position: 'absolute', inset: 0, background: '#000000', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '700px' }}>
            <pre style={{
              fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Courier New", monospace',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: '#ffffff',
              textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.2)',
              lineHeight: '2.2', letterSpacing: '0.03em', margin: 0, whiteSpace: 'pre-wrap'
            }}>
              {displayText}
              <span style={{
                display: 'inline-block', width: '10px', height: '1.1em', background: '#fff',
                marginLeft: '2px', verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite',
                boxShadow: '0 0 12px rgba(255,255,255,0.5)'
              }} />
            </pre>
          </div>
        </div>
      )}

      {/* DYNAMIC SEARCH INTERFACE */}
      {greetingDone && (
        <div 
          ref={searchContainerRef}
          className="hero-search-container"
          style={{
            position: 'relative', zIndex: 10, width: '100%', maxWidth: '800px',
            padding: '2rem', textAlign: 'center'
          }}
        >
          {/* INITIAL STATE: Only Search Icon */}
          {!isSearchActive && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeInScale 0.6s ease-out' }}>
              <button
                onClick={handleSearchActivate}
                style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'floatSearch 4s ease-in-out infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                aria-label="Открыть поиск"
              >
                <Search size={32} />
              </button>

              {/* Hint */}
              {showHint && (
                <div style={{
                  marginTop: '1.5rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  animation: 'fadeIn 0.5s ease-out, pulse 2s ease-in-out infinite'
                }}>
                  Нажми для поиска
                </div>
              )}
            </div>
          )}

          {/* ACTIVE STATE: Search Bar + Actions */}
          {isSearchActive && (
            <div style={{ animation: 'slideInSearch 0.5s ease-out' }}>
              {/* Search Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                ...(isSearchFocused && {
                  borderColor: 'rgba(168, 85, 247, 0.4)',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)'
                })
              }}>
                {/* Search Icon (small, left) */}
                <Search size={20} style={{ color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0 }} />

                {/* Input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  placeholder={suggestions[activeSuggestion] || 'Ищи железо, сборку или спроси меня...'}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
                    outline: 'none'
                  }}
                />

                {/* Multi-Tool Button */}
                <div ref={multiMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowMultiMenu(!showMultiMenu)}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <ActiveIcon size={18} />
                    {activeMultiTool === 'ai' && (
                      <span style={{
                        position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px',
                        background: '#4ade80', borderRadius: '50%', animation: 'pulseGlow 2s ease infinite'
                      }} />
                    )}
                    <ChevronDown size={12} style={{ 
                      position: 'absolute', bottom: '2px', right: '2px',
                      color: 'rgba(255,255,255,0.4)'
                    }} />
                  </button>

                  {/* Multi-Tool Menu */}
                  {showMultiMenu && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '200px',
                      background: 'rgba(20, 20, 25, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '0.5rem',
                      animation: 'fadeInDown 0.2s ease-out',
                      zIndex: 50
                    }}>
                      {Object.entries(multiToolConfig).map(([key, { icon: Icon, label }]) => (
                        <button
                          key={key}
                          onClick={() => handleMultiToolSelect(key)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: activeMultiTool === key ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => {
                            if (activeMultiTool !== key) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (activeMultiTool !== key) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <Icon size={18} />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions (appear on focus) */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '1.5rem',
                opacity: isSearchFocused ? 1 : 0,
                transform: isSearchFocused ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.3s ease',
                pointerEvents: isSearchFocused ? 'auto' : 'none'
              }}>
                {quickActions.map((action, i) => (
                  <a
                    key={i}
                    href={action.link}
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                      fontFamily: '"SF Mono", monospace',
                      transition: 'all 0.2s',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#fff';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.target.style.textShadow = '0 0 20px rgba(168,85,247,0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.target.style.background = 'transparent';
                      e.target.style.textShadow = 'none';
                    }}
                  >
                    {action.text}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const heroStyles = `
  @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 6px rgba(74, 222, 128, 0.4); } 50% { box-shadow: 0 0 12px rgba(74, 222, 128, 0.8); } }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes particleFade { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.5; } }
  @keyframes drift1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(8px, -12px); } }
  @keyframes drift2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-10px, 6px); } }
  @keyframes drift3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(6px, 10px); } }
  @keyframes drift4 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-8px, -8px); } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  @keyframes floatSearch { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes slideInSearch { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  input::placeholder { color: rgba(255, 255, 255, 0.4); }
`;
