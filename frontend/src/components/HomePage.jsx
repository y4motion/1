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
  const [showAIOverlay, setShowAIOverlay] = useState(true);
  const [aiText, setAiText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const featuredProducts = products.filter(p => p.originalPrice).slice(0, 3);

  // Core AI greeting animation
  useEffect(() => {
    const initAI = async () => {
      const CoreAI = (await import('../utils/coreAI')).default;
      CoreAI.init(user);
      const greeting = await CoreAI.generateGreeting();
      
      let fullText = '';
      let lineIndex = 0;
      let charIndex = 0;

      const typeChar = () => {
        if (lineIndex >= greeting.lines.length) {
          setTimeout(() => setShowAIOverlay(false), 2000);
          return;
        }

        const line = greeting.lines[lineIndex];
        if (charIndex < line.length) {
          fullText += line[charIndex];
          setAiText(fullText);
          charIndex++;
          setTimeout(typeChar, 50);
        } else {
          fullText += '\\n';
          setAiText(fullText);
          lineIndex++;
          charIndex = 0;
          setTimeout(typeChar, lineIndex === 1 ? 300 : 150);
        }
      };

      setTimeout(typeChar, 300);
    };

    initAI();

    const cursorBlink = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(cursorBlink);
  }, [user]);

  // AI suggestions
  const aiSuggestions = [
    'Продолжим твою сборку?',
    'Лучшие мониторы для 4K гейминга 2025',
    'Сборка до 150к с высоким FPS',
    'Покажи новые OLED-панели',
    'RTX 5090 — цены и наличие'
  ];

  const topCategories = [
    {
      title: 'RATING',
      image: 'https://images.unsplash.com/photo-1602025882379-e01cf08baa51?w=800&q=80',
      link: '/rating'
    },
    {
      title: 'ARTICLES',
      image: 'https://images.unsplash.com/photo-1626958390898-162d3577f293?w=800&q=80',
      link: '/articles'
    },
    {
      title: 'CREATORS',
      image: 'https://images.unsplash.com/photo-1618586810102-aaa7049200c0?w=800&q=80',
      link: '/creators'
    },
    {
      title: 'GROUP BUY',
      image: 'https://images.pexels.com/photos/34563105/pexels-photo-34563105.jpeg?w=800',
      link: '/groupbuy'
    }
  ];

  const bottomBlock = {
    title: 'FEED',
    image: 'https://images.unsplash.com/photo-1615031465602-20f3ff3ca279?w=1600&q=80',
    link: '/feed'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* AI Greeting Overlay - только полупрозрачный overlay */}
      {showAIOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeOut 0.7s ease 4.5s forwards'
          }}
        >
          <div
            style={{
              fontFamily: '\"SF Mono\", \"Monaco\", \"Inconsolata\", \"Courier New\", monospace',
              fontSize: '1.25rem',
              color: '#fff',
              textShadow: '0 0 10px rgba(255,255,255,0.5)',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              lineHeight: '1.8',
              maxWidth: '800px',
              padding: '2rem'
            }}
          >
            {aiText}
            {showCursor && <span style={{ marginLeft: '2px' }}>_</span>}
          </div>
        </div>
      )}

      {/* Hero Section - сразу видимый */}
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 25%, #1a1a1a 50%, #0f0f0f 75%, #0a0a0a 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Search Section */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '700px',
            padding: '2rem',
            opacity: showAIOverlay ? 0 : 1,
            transition: 'opacity 0.8s ease',
            animation: 'fadeIn 0.8s ease 5s forwards'
          }}
        >
          {/* Search Icon Above */}
          <div style={{ textAlign: 'center', marginBottom: '1rem', opacity: 0, animation: 'fadeIn 0.5s ease 5.5s forwards' }}>
            <Search size={28} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Ищи железо, сборку или спроси меня..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: '100%',
                padding: '1rem 3.5rem 1rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.1rem',
                outline: 'none',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
              }}
            />
            
            {/* Icons inside search */}
            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '0.5rem' }}>
              <button style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', padding: '0.25rem' }}>
                <Mic size={20} />
              </button>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                AI
              </div>
            </div>

            {/* AI Suggestions Dropdown */}
            {showSuggestions && searchQuery.length === 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  left: 0,
                  right: 0,
                  background: 'rgba(10, 10, 10, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Core AI предлагает:
                </div>
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'none',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      marginBottom: '0.25rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              justifyContent: 'center',
              opacity: showAIOverlay ? 0 : 1,
              animation: 'fadeIn 0.8s ease 5.5s forwards',
              flexWrap: 'wrap'
            }}
          >
            {['⚡ Начать сборку', '🎮 Готовые билды', '💬 Сообщество'].map((label, idx) => (
              <button
                key={idx}
                onClick={() => navigate(['/pc-builder', '/marketplace', '/feed'][idx])}
                style={{
                  padding: '0.875rem 1.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '0.95rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Status Indicator */}
      {!showAIOverlay && <AIStatusIndicator />}

      {/* AI Floating Button */}
      {!showAIOverlay && <AIFloatingButton onClick={() => setShowAIModal(true)} />}

      {/* Category Blocks */}
      <div style={{ padding: '0 2.5rem', marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '1840px', margin: '0 auto', marginBottom: '24px' }}>
          {topCategories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(cat.link)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '3px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '700', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                  {cat.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div
          onClick={() => navigate(bottomBlock.link)}
          style={{
            height: '560px',
            maxWidth: '1840px',
            margin: '0 auto',
            borderRadius: '3px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <img src={bottomBlock.image} alt={bottomBlock.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: 'white', fontSize: '4rem', fontWeight: '700', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              {bottomBlock.title}
            </h3>
          </div>
        </div>
      </div>

      <TestimonialsCarousel />

      <div style={{ padding: '0 2.5rem' }}>
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '1840px', margin: '0 auto' }}>
            <TopArticlesWidget />
            <TopUsersWidget />
            <TopProposalsWidget />
          </div>
        </div>

        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center', color: 'white' }}>
            Популярные категории
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '4rem' }}>
            {categories.slice(0, 8).map((cat) => (
              <a
                key={cat.id}
                href={`/category/${cat.slug}`}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '3rem', textAlign: 'center', color: 'white' }}>
            FEATURED DEALS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1840px', margin: '0 auto' }}>
            {featuredProducts.map((product) => (
              <a
                key={product.id}
                href={`/product/${product.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{ backgroundColor: 'rgb(10, 10, 10)', borderRadius: '3px', overflow: 'hidden', transition: 'transform 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: '100%', height: '280px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      {product.category}
                    </div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>
                      {product.name}
                    </h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {product.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                        ${product.price}
                      </div>
                      {product.originalPrice && (
                        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.875rem', textDecoration: 'line-through' }}>
                          ${product.originalPrice}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        input::placeholder { color: rgba(255, 255, 255, 0.4); text-align: center; }
      `}</style>
    </div>
  );
};

export default HomePage;
