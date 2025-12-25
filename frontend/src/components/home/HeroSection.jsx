import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import coreAI from '../../utils/coreAI';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [placeholderKey, setPlaceholderKey] = useState(0);
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

  // Particles - galaxy-like motion
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

  // Parallax scroll effect for particles
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
    if (!greetingDone || suggestions.length === 0) return;
    const getDelay = () => activeSuggestion === 0 ? 7000 : 4500;
    const timeout = setTimeout(() => {
      setPlaceholderKey(prev => prev + 1);
      setActiveSuggestion(prev => (prev + 1) % suggestions.length);
    }, getDelay());
    return () => clearTimeout(timeout);
  }, [greetingDone, suggestions.length, activeSuggestion]);

  const handleSearch = useCallback((query) => {
    if (!query.trim()) return;
    coreAI.trackAction('search', { query });
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  }, [navigate]);

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

      {/* Floating particles with parallax */}
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

      {/* Search Bar & CTAs */}
      {greetingDone && (
        <div style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: '800px',
          padding: '2rem', textAlign: 'center', animation: 'crtGlitch 0.4s ease-out, fadeInUp 0.8s ease 0.3s both'
        }}>
          {/* CRT Scanline overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            pointerEvents: 'none', opacity: 0.5, animation: 'scanline 0.1s linear 2'
          }} />

          {/* Search Zone */}
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '1rem', cursor: 'text' }}>
              {/* Animated placeholder */}
              {!searchQuery && (
                <div key={placeholderKey} style={{
                  position: 'absolute', left: 0, right: '60px', textAlign: 'center',
                  fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace', fontSize: '1.1rem',
                  color: 'rgba(255, 255, 255, 0.5)', textShadow: '0 0 15px rgba(255,255,255,0.3)',
                  pointerEvents: 'none', animation: 'suggestionIn 1s ease forwards'
                }}>
                  {suggestions[activeSuggestion] || 'Ищи железо, сборку или спроси меня...'}
                </div>
              )}
              
              <input
                type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                style={{
                  background: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem',
                  fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
                  textShadow: '0 0 20px rgba(255,255,255,0.4)', outline: 'none', textAlign: 'center',
                  minWidth: '400px', padding: '0.5rem'
                }}
              />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={actionBtnStyle} aria-label="Voice search">
                  <Mic size={18} />
                </button>
                <button style={{ ...actionBtnStyle, position: 'relative' }} aria-label="AI search">
                  <Sparkles size={18} />
                  <span style={{
                    position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px',
                    background: '#4ade80', borderRadius: '50%', animation: 'pulseGlow 2s ease infinite'
                  }} />
                </button>
              </div>
            </div>

            {/* Underline */}
            <div style={{
              position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
              height: '2px', background: isSearchFocused ? '#a855f7' : 'rgba(255,255,255,0.2)',
              width: isSearchFocused ? '100%' : '60%', transition: 'all 0.3s ease',
              boxShadow: isSearchFocused ? '0 0 15px rgba(168, 85, 247, 0.5)' : 'none'
            }} />
          </div>

          {/* CTA Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {['Начать сборку', 'Готовые билды', 'Сообщество'].map((text, i) => (
              <a key={i} href={['#pc-builder', '/builds', '/community'][i]}
                style={{
                  color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.95rem',
                  fontFamily: '"SF Mono", monospace', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.color = '#fff'; e.target.style.textShadow = '0 0 20px rgba(168,85,247,0.8)'; }}
                onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.7)'; e.target.style.textShadow = 'none'; }}
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const actionBtnStyle = {
  width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.2s'
};

const heroStyles = `
  @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 6px rgba(74, 222, 128, 0.4); } 50% { box-shadow: 0 0 12px rgba(74, 222, 128, 0.8); } }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes particleFade { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.5; } }
  @keyframes drift1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(8px, -12px); } }
  @keyframes drift2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-10px, 6px); } }
  @keyframes drift3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(6px, 10px); } }
  @keyframes drift4 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-8px, -8px); } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes suggestionIn { from { opacity: 0; } to { opacity: 0.5; } }
  @keyframes crtGlitch { 0% { opacity: 0; transform: translateX(-2px); } 10% { opacity: 1; transform: translateX(2px); } 20% { opacity: 0.5; transform: translateX(-1px); } 30% { opacity: 1; transform: translateX(0); } 100% { opacity: 1; transform: translateX(0); } }
  @keyframes scanline { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }
  input::placeholder { color: rgba(255, 255, 255, 0.5); }
`;
