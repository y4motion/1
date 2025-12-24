import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categories, products } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import TopArticlesWidget from './TopArticlesWidget';
import TopUsersWidget from './TopUsersWidget';
import TopProposalsWidget from './TopProposalsWidget';
import TestimonialsCarousel from './TestimonialsCarousel';
import DynamicCategoryGrid from './DynamicCategoryGrid';
import OptimizedImage from './OptimizedImage';
import '../styles/glassmorphism.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isJarvisLoading, setIsJarvisLoading] = useState(true);
  const [currentText, setCurrentText] = useState('');
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // JARVIS loading sequence
    const jarvisSequence = [
      { text: 'System initializing...', delay: 0, duration: 1000, pauseAfter: 0 },
      { text: ' Online.', delay: 1000, duration: 500, pauseAfter: 500 },
      { text: `Привет, ${user?.username || 'Гость'}.`, delay: 2000, duration: 1500, pauseAfter: 0 },
      { text: 'Готов помочь с железом мечты. С чего начнём?', delay: 3500, duration: 500, pauseAfter: 0 }
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let timeoutId;
    let completedLines = [];

    const typeCharacter = () => {
      if (lineIndex >= jarvisSequence.length) {
        // Animation complete, fade out
        setTimeout(() => {
          setIsJarvisLoading(false);
        }, 500);
        return;
      }

      const currentSequence = jarvisSequence[lineIndex];
      
      if (charIndex < currentSequence.text.length) {
        const fullText = completedLines.join('\n') + 
          (completedLines.length > 0 ? '\n' : '') + 
          currentSequence.text.substring(0, charIndex + 1);
        setCurrentText(fullText);
        setCurrentLine(lineIndex);
        charIndex++;
        timeoutId = setTimeout(typeCharacter, 60); // 60ms per character
      } else {
        // Line complete
        completedLines.push(currentSequence.text);
        lineIndex++;
        charIndex = 0;
        
        const nextSequence = jarvisSequence[lineIndex];
        if (nextSequence) {
          const waitTime = nextSequence.delay - (jarvisSequence[lineIndex - 1]?.delay + jarvisSequence[lineIndex - 1]?.duration || 0);
          timeoutId = setTimeout(typeCharacter, Math.max(0, waitTime));
        } else {
          // All done, wait then fade out
          setTimeout(() => setIsJarvisLoading(false), 1000);
        }
      }
    };

    timeoutId = setTimeout(typeCharacter, 100);

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
  }, [user]);

  // Get featured products (products with originalPrice - on sale)
  const featuredProducts = products.filter((p) => p.originalPrice).slice(0, 3);

  // Top 4 square blocks (PMM.gg style) - Angry Miao images
  const topCategories = [
    {
      title: 'RATING',
      image:
        'https://images.unsplash.com/photo-1602025882379-e01cf08baa51?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmR8ZW58MHx8fHwxNzYyNTQxOTA0fDA&ixlib=rb-4.1.0&q=85',
      link: '/rating',
      description: 'Рейтинг сообщества',
    },
    {
      title: 'ARTICLES',
      image:
        'https://images.unsplash.com/photo-1626958390898-162d3577f293?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmR8ZW58MHx8fHwxNzYyNTQxOTA0fDA&ixlib=rb-4.1.0&q=85',
      link: '/articles',
      description: 'Обзоры и аналитика',
    },
    {
      title: 'CREATORS',
      image:
        'https://images.unsplash.com/photo-1618586810102-aaa7049200c0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmR8ZW58MHx8fHwxNzYyNTQxOTA0fDA&ixlib=rb-4.1.0&q=85',
      link: '/creators',
      description: 'Хаб креаторов',
    },
    {
      title: 'GROUP BUY',
      image: 'https://images.pexels.com/photos/34563105/pexels-photo-34563105.jpeg',
      link: '/groupbuy',
      description: 'Групповые закупки',
    },
  ];

  // Large bottom block for FEED - Angry Miao image
  const bottomBlock = {
    title: 'FEED',
    image:
      'https://images.unsplash.com/photo-1615031465602-20f3ff3ca279?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxhbmdyeSUyMG1pYW8lMjBrZXlib2FyZHxlbnwwfHx8fDE3NjI1NDIyOTF8MA&ixlib=rb-4.1.0&q=85',
    link: '/feed',
    description: 'Лента постов и новостей сообщества',
  };

  return (
    <div className="dark-bg" style={{ minHeight: '100vh' }}>
      <div className="grain-overlay" />

      {/* JARVIS Loading Screen */}
      {isJarvisLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isJarvisLoading ? 'none' : 'fadeOut 0.5s ease forwards',
          }}
        >
          <div
            style={{
              fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
              fontSize: '1.25rem',
              color: '#fff',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              lineHeight: '1.8',
              maxWidth: '800px',
              padding: '2rem',
            }}
          >
            {currentText}
            {showCursor && (
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '20px',
                  backgroundColor: '#fff',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Hero Section - Minimalist Gradient */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
        }}
      >
        {/* Search Bar - Always Visible After Loading */}
        {!isJarvisLoading && (
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              padding: '2rem',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 0.8s ease forwards',
            }}
          >
            <div
              className="search-container"
              style={{
                position: 'relative',
                maxWidth: '780px',
                width: '100%',
              }}
            >
              {/* Search Icon Above */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <Search size={24} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search for products..."
                className="search-input-minimal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '1.1rem',
                  outline: 'none',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderBottom = '2px solid rgba(255, 255, 255, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
                }}
              />
            </div>
          </div>
        )}

        {/* Scroll Hint Arrows */}
        {!isJarvisLoading && (
          <div
            style={{
              position: 'absolute',
              bottom: '3rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 1s ease 1s forwards',
              opacity: 0,
            }}
          >
            <div
              style={{
                animation: 'strobeArrow 2s ease-in-out infinite',
                animationDelay: '0s',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M19 12l-7 7-7-7" />
              </svg>
            </div>

            <div
              style={{
                marginTop: '-1.5rem',
                animation: 'strobeArrow 2s ease-in-out infinite',
                animationDelay: '0.3s',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        {/* CSS Animations */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          @keyframes strobeArrow {
            0%,
            100% {
              opacity: 0.2;
              transform: translateY(0);
            }
            50% {
              opacity: 1;
              transform: translateY(8px);
            }
          }

          .search-input-minimal::placeholder {
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
          }
        `}</style>
      </div>

      {/* Divider */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background:
            theme === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
          margin: '3rem 0',
        }}
      />

      {/* PMM.gg Style Layout: 4 Squares + 1 Large Rectangle - EXACT SIZES */}
      <div style={{ padding: '0 2.5rem', marginBottom: '4rem' }}>
        {' '}
        {/* 40px = 2.5rem padding */}
        {/* Top 4 Square Blocks - 382px x 382px with 24px gap */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            maxWidth: '1840px',
            margin: '0 auto',
            marginBottom: '24px',
          }}
        >
          {topCategories.map((category, index) => (
            <div
              key={index}
              onClick={() => navigate(category.link)}
              className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105"
              style={{
                aspectRatio: '1 / 1',
                width: '100%',
                borderRadius: theme === 'minimal-mod' ? '0' : '3px',
              }}
            >
              {/* Background Image - Optimized */}
              <OptimizedImage
                src={category.image}
                alt={category.title}
                priority={index < 2}
                className="w-full h-full transition-transform duration-500 group-hover:scale-110"
              />

              {/* Dark Overlay */}
              <div
                className="absolute inset-0 bg-black transition-opacity duration-300"
                style={{ opacity: 0.3 }}
              />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <h3
                  className="text-white text-4xl font-bold text-center tracking-wider"
                  style={{
                    textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                    fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit',
                  }}
                >
                  {category.title}
                </h3>
                {category.description && (
                  <p
                    className="text-white/80 text-sm text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
                  >
                    {category.description}
                  </p>
                )}
              </div>

              {/* Hover Border */}
              <div
                className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300"
                style={{ borderRadius: theme === 'minimal-mod' ? '0' : '3px' }}
              />
            </div>
          ))}
        </div>
        {/* Large Bottom Block for FEED - 1600px x 560px */}
        <div
          onClick={() => navigate(bottomBlock.link)}
          className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.01]"
          style={{
            height: '560px',
            maxWidth: '1840px',
            margin: '0 auto',
            borderRadius: theme === 'minimal-mod' ? '0' : '3px',
          }}
        >
          {/* Background Image - Optimized */}
          <OptimizedImage
            src={bottomBlock.image}
            alt={bottomBlock.title}
            priority={true}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center max-w-3xl">
              <h3
                className="text-white text-6xl font-bold mb-4 tracking-wider"
                style={{
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                  fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit',
                }}
              >
                {bottomBlock.title}
              </h3>
              <p
                className="text-white/90 text-xl"
                style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
              >
                {bottomBlock.description}
              </p>
            </div>
          </div>

          {/* Hover Border */}
          <div
            className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300"
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '3px' }}
          />
        </div>
      </div>

      {/* Testimonials Section (PMM.gg style) */}
      <TestimonialsCarousel />

      {/* Content Container */}
      <div style={{ padding: '0 2.5rem' }}>
        {' '}
        {/* 40px padding */}
        {/* Community Hub Section */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              maxWidth: '1840px',
              margin: '0 auto',
            }}
          >
            <TopArticlesWidget />
            <TopUsersWidget />
            <TopProposalsWidget />
          </div>
        </div>
        {/* Top Categories Section */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              textAlign: 'center',
              letterSpacing: '1px',
            }}
          >
            {t('home.exploreTitle') || 'Explore the most popular products'}
          </h3>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '4rem',
            }}
          >
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`} className="text-link">
                {t(`categories.${category.slug}`)}
              </Link>
            ))}
          </div>
        </div>
        {/* Featured Products - PMM.gg Style */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '3rem',
              textAlign: 'center',
              letterSpacing: '1px',
            }}
          >
            FEATURED DEALS
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              maxWidth: '1840px',
              margin: '0 auto',
            }}
          >
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="group cursor-pointer transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'rgb(10, 10, 10)',
                    borderRadius: theme === 'minimal-mod' ? '0' : '3px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Product Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '280px',
                      overflow: 'hidden',
                    }}
                  >
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      width="100%"
                      height="280px"
                      className="group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '1.5rem' }}>
                    <div
                      style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {product.category}
                    </div>

                    <h4
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: 'white',
                      }}
                    >
                      {product.name}
                    </h4>

                    <p
                      style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        marginBottom: '1rem',
                      }}
                    >
                      {product.description}
                    </p>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: 'white',
                        }}
                      >
                        ${product.price}
                      </div>
                      {product.originalPrice && (
                        <div
                          style={{
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '0.875rem',
                            textDecoration: 'line-through',
                          }}
                        >
                          ${product.originalPrice}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
