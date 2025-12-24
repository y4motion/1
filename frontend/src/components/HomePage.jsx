import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import TopArticlesWidget from './TopArticlesWidget';
import TopUsersWidget from './TopUsersWidget';
import TopProposalsWidget from './TopProposalsWidget';
import TestimonialsCarousel from './TestimonialsCarousel';
import AIFloatingButton from './AIFloatingButton';
import AIStatusIndicator from './AIStatusIndicator';
import { categories, products } from '../mockData';
import '../styles/glassmorphism.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [greetingText, setGreetingText] = useState('');
  const [cursor, setCursor] = useState(true);
  const [suggestions, setSuggestions] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // AI typewriter greeting
  useEffect(() => {
    const lines = [
      'System online.',
      `Привет, ${user?.username || 'Гость'}.`,
      'Готов помочь с железом мечты. С чего начнём?'
    ];

    let text = '';
    let lineIdx = 0;
    let charIdx = 0;

    const type = () => {
      if (lineIdx >= lines.length) {
        setTimeout(() => setShowOverlay(false), 1500);
        return;
      }

      if (charIdx < lines[lineIdx].length) {
        text += lines[lineIdx][charIdx];
        setGreetingText(text);
        charIdx++;
        setTimeout(type, 50);
      } else {
        text += '\n';
        setGreetingText(text);
        lineIdx++;
        charIdx = 0;
        setTimeout(type, 200);
      }
    };

    setTimeout(type, 300);
    const blink = setInterval(() => setCursor(p => !p), 530);
    return () => clearInterval(blink);
  }, [user]);

  const featured = products.filter(p => p.originalPrice).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative' }}>
      {/* HIDE EMERGENT SPINNER */}
      <style>{`
        /* Hide all Emergent system spinners */
        #emergent-loading, 
        .emergent-spinner,
        [class*=\"spinner\"],
        [class*=\"loading\"][class*=\"emergent\"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `}</style>

      {/* AI Greeting Overlay - ТОЛЬКО overlay поверх hero */}
      {showOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'overlayFadeOut 0.7s ease 4.5s forwards',
            pointerEvents: showOverlay ? 'all' : 'none'
          }}
        >
          <div
            style={{
              fontFamily: '\"SF Mono\", Monaco, \"Courier New\", monospace',
              fontSize: '1.2rem',
              color: '#fff',
              textShadow: '0 0 10px rgba(255,255,255,0.4)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
              padding: '2rem'
            }}
          >
            {greetingText}
            {cursor && <span>_</span>}
          </div>
        </div>
      )}

      {/* Hero - СРАЗУ видимый фон */}
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a, #0a0a0a)',
          overflow: 'hidden'
        }}
      >
        {/* Search - Ultra-minimal */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '650px',
            padding: '2rem',
            opacity: showOverlay ? 0 : 1,
            transition: 'opacity 0.8s ease 5s'
          }}
        >
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Ищи железо, сборку или спроси меня..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSuggestions(true)}
              onBlur={() => setTimeout(() => setSuggestions(false), 200)}
              style={{
                width: '100%',
                padding: '0.8rem 3rem 0.8rem 1.2rem',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                textAlign: 'center',
                transition: 'all 0.3s',
                fontWeight: '400'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            {/* Icons */}
            <div style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.3)', cursor: 'pointer', padding: '0.2rem', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.3)'}
              >
                <Mic size={16} />
              </button>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                AI
              </div>
            </div>

            {/* Suggestions */}
            {suggestions && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                left: 0,
                right: 0,
                background: 'rgba(8, 8, 8, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.8rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Core AI предлагает:
                </div>
                {['Продолжим твою сборку?', 'Лучшие мониторы 4K 2025', 'Сборка до 150к', 'Новые OLED'].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(s)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      marginBottom: '0.2rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                      e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '0.8rem',
            marginTop: '1.5rem',
            justifyContent: 'center',
            opacity: showOverlay ? 0 : 1,
            transition: 'opacity 0.8s ease 5.5s'
          }}>
            {[
              { label: '⚡ Начать сборку', path: '/pc-builder' },
              { label: '🎮 Готовые билды', path: '/marketplace' },
              { label: '💬 Сообщество', path: '/feed' }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() => navigate(btn.path)}
                style={{
                  padding: '0.7rem 1.4rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.color = 'white';
                  e.target.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!showOverlay && <AIStatusIndicator />}
      {!showOverlay && <AIFloatingButton onClick={() => {}} />}

      {/* Blocks */}
      <div style={{ padding: '0 2.5rem', marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '1840px', margin: '0 auto 24px' }}>
          {[
            { t: 'RATING', i: 'https://images.unsplash.com/photo-1602025882379-e01cf08baa51?w=800&q=80', l: '/rating' },
            { t: 'ARTICLES', i: 'https://images.unsplash.com/photo-1626958390898-162d3577f293?w=800&q=80', l: '/articles' },
            { t: 'CREATORS', i: 'https://images.unsplash.com/photo-1618586810102-aaa7049200c0?w=800&q=80', l: '/creators' },
            { t: 'GROUP BUY', i: 'https://images.pexels.com/photos/34563105/pexels-photo-34563105.jpeg?w=800', l: '/groupbuy' }
          ].map((c, idx) => (
            <div key={idx} onClick={() => navigate(c.l)} style={{ aspectRatio: '1/1', borderRadius: '3px', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src={c.i} alt={c.t} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '700', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>{c.t}</h3>
              </div>
            </div>
          ))}
        </div>
        <div onClick={() => navigate('/feed')} style={{ height: '560px', maxWidth: '1840px', margin: '0 auto', borderRadius: '3px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
          <img src="https://images.unsplash.com/photo-1615031465602-20f3ff3ca279?w=1600&q=80" alt="FEED" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '4rem', fontWeight: '700', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>FEED</h3>
          </div>
        </div>
      </div>

      <TestimonialsCarousel />

      <div style={{ padding: '0 2.5rem' }}>
        <div style={{ marginTop: '4rem', marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '1840px', margin: '0 auto' }}>
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
              <a key={cat.id} href={`/category/${cat.slug}`} style={{
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1840px', margin: '0 auto' }}>
            {featured.map(p => (
              <a key={p.id} href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgb(10,10,10)', borderRadius: '3px', overflow: 'hidden', transition: 'transform 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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

      <style>{`
        @keyframes overlayFadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        input::placeholder { color: rgba(255, 255, 255, 0.35); }
      `}</style>
    </div>
  );
};

export default HomePage;
