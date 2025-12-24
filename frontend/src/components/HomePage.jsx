import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TopArticlesWidget from './TopArticlesWidget';
import TopUsersWidget from './TopUsersWidget';
import TopProposalsWidget from './TopProposalsWidget';
import TestimonialsCarousel from './TestimonialsCarousel';
import coreAI from '../utils/coreAI';
import { categories, products } from '../mockData';
import '../styles/glassmorphism.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Проверяем нужно ли показывать приветствие
  const shouldShowGreeting = () => {
    // Если уже показывали в этой сессии - не показываем
    if (sessionStorage.getItem('greetingShown')) {
      return false;
    }
    
    // Проверяем время последнего визита
    const lastVisit = localStorage.getItem('lastGreetingTime');
    if (lastVisit) {
      const hourAgo = Date.now() - (60 * 60 * 1000); // 1 час
      if (parseInt(lastVisit) > hourAgo) {
        return false;
      }
    }
    
    return true;
  };

  const [greetingDone, setGreetingDone] = useState(!shouldShowGreeting());
  const [greetingLines, setGreetingLines] = useState([
    "System online.",
    "Привет, Гость.",
    "Готов помочь с железом мечты."
  ]);
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    coreAI.init(user);
    setSuggestions(coreAI.getSearchSuggestions());
    
    // Получаем персонализированное приветствие от Core AI
    const initGreeting = async () => {
      const greeting = await coreAI.generateGreeting();
      if (greeting.lines && greeting.lines.length > 0) {
        setGreetingLines(greeting.lines);
      }
    };
    initGreeting();
  }, [user]);

  // Typewriter effect - одна строка, сменяется следующей
  useEffect(() => {
    // Если приветствие уже было показано - не запускаем
    if (greetingDone || greetingLines.length === 0) return;
    
    let charIndex = 0;
    let isActive = true;
    
    // Начальная пауза с терминальным символом
    setDisplayText('> _');
    
    const typeLine = (lineIndex) => {
      if (!isActive || lineIndex >= greetingLines.length) {
        // Все строки показаны - сохраняем в storage и переход к поиску
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
          // Строка напечатана - пауза для фиксации, потом следующая
          setTimeout(() => {
            if (isActive) {
              setCurrentLine(lineIndex + 1);
              typeLine(lineIndex + 1);
            }
          }, 1200);
        }
      };
      
      typeChar();
    };
    
    // Начальная пауза с терминальным символом
    setTimeout(() => typeLine(0), 1000);
    
    return () => { isActive = false; };
  }, [greetingLines, greetingDone]);

  // Rotating suggestions
  useEffect(() => {
    if (!greetingDone || suggestions.length === 0) return;
    const interval = setInterval(() => {
      setActiveSuggestion(prev => (prev + 1) % suggestions.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [greetingDone, suggestions.length]);

  const handleSearch = useCallback((query) => {
    if (!query.trim()) return;
    coreAI.trackAction('search', { query });
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  }, [navigate]);

  const featured = products.filter(p => p.originalPrice).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(74, 222, 128, 0.4); }
          50% { box-shadow: 0 0 16px rgba(74, 222, 128, 0.7); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-25px) translateX(8px); opacity: 0.5; }
          50% { transform: translateY(-15px) translateX(-5px); opacity: 0.3; }
          75% { transform: translateY(-35px) translateX(12px); opacity: 0.4; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(255, 255, 255, 0.35); }
      `}</style>

      {/* === HERO SECTION === */}
      <div style={{
        height: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Video Background */}
        <video
          autoPlay muted loop playsInline
          onLoadedData={() => setVideoLoaded(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoLoaded ? 0.5 : 0,
            transition: 'opacity 1s ease',
            zIndex: 0,
            filter: 'brightness(0.35) contrast(1.1)'
          }}
        >
          <source src="https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-in-the-dark-5378/1080p.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient base */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(8,8,12,1) 0%, rgba(0,0,0,1) 100%)',
          zIndex: 1
        }} />

        {/* Floating particles - видны после приветствия */}
        {greetingDone && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${2 + Math.random() * 2}px`,
                  height: `${2 + Math.random() * 2}px`,
                  background: 'rgba(255,255,255,0.5)',
                  borderRadius: '50%',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `particleFloat ${5 + Math.random() * 5}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        )}

        {/* === GREETING OVERLAY (внутри hero, поверх поиска) === */}
        {!greetingDone && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#000000',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Greeting text */}
            <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '700px' }}>
              <pre style={{
                fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Courier New", monospace',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                color: '#ffffff',
                textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.2)',
                lineHeight: '2.2',
                letterSpacing: '0.03em',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {displayText}
                <span style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '1.1em',
                  background: '#fff',
                  marginLeft: '2px',
                  verticalAlign: 'text-bottom',
                  animation: 'blink 1s step-end infinite',
                  boxShadow: '0 0 12px rgba(255,255,255,0.5)'
                }} />
              </pre>
            </div>
          </div>
        )}

        {/* === SEARCH BAR & CTAs (под overlay, появляется после) === */}
        {greetingDone && (
          <div style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '700px',
            padding: '2rem',
            textAlign: 'center',
            animation: 'fadeInUp 0.7s ease forwards'
          }}>
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: isSearchFocused 
                  ? '1px solid rgba(255, 255, 255, 0.25)' 
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                transition: 'all 0.3s ease',
                boxShadow: isSearchFocused ? '0 0 40px rgba(255, 255, 255, 0.1)' : 'none'
              }}>
                <input
                  type="text"
                  placeholder="Ищи железо, сборку или спроси меня..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { setIsSearchFocused(true); setShowSuggestions(true); }}
                  onBlur={() => { setIsSearchFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  style={{
                    width: '100%',
                    padding: '1.1rem 5.5rem 1.1rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
                
                {/* Icons */}
                <div style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'center'
                }}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.35)',
                      cursor: 'pointer',
                      padding: '0.3rem',
                      transition: 'color 0.2s',
                      display: 'flex'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)'}
                  >
                    <Mic size={18} />
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                      }}
                      title="Core AI online"
                    >
                      <Sparkles size={14} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#4ade80',
                      border: '2px solid rgba(0, 0, 0, 0.9)',
                      animation: 'pulseGlow 2s ease-in-out infinite'
                    }} />
                  </div>
                </div>
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.75rem)',
                  left: 0,
                  right: 0,
                  background: 'rgba(8, 8, 12, 0.95)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.6)'
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
                      onClick={() => { setSearchQuery(s); handleSearch(s); }}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.8rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'rgba(255, 255, 255, 0.65)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        marginBottom: '0.2rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Floating suggestion pill */}
            {!showSuggestions && suggestions.length > 0 && (
              <div style={{ marginTop: '1.5rem', minHeight: '32px' }}>
                <button
                  onClick={() => { setSearchQuery(suggestions[activeSuggestion]); handleSearch(suggestions[activeSuggestion]); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1.2rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <Sparkles size={12} />
                  {suggestions[activeSuggestion]}
                </button>
              </div>
            )}

            {/* CTA Buttons */}
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
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>{btn.icon}</span>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
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
                transition: 'transform 0.4s ease'
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
                  textShadow: '2px 2px 12px rgba(0,0,0,0.9)'
                }}>{c.t}</h3>
              </div>
            </div>
          ))}
        </div>

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
          <img src="https://images.unsplash.com/photo-1615031465602-20f3ff3ca279?w=1600&q=80" alt="FEED" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', textShadow: '2px 2px 16px rgba(0,0,0,0.9)' }}>FEED</h3>
          </div>
        </div>
      </div>

      <TestimonialsCarousel />

      <div style={{ padding: '0 2.5rem' }}>
        <div style={{
          marginTop: '4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          maxWidth: '1840px',
          margin: '4rem auto'
        }}>
          <TopArticlesWidget />
          <TopUsersWidget />
          <TopProposalsWidget />
        </div>

        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#fff', marginBottom: '1.5rem' }}>
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

        <div style={{ margin: '3rem 0' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>
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
                    transition: 'transform 0.3s, box-shadow 0.3s'
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
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
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
