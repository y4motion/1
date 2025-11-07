import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categories, products } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import TopArticlesWidget from './TopArticlesWidget';
import TopUsersWidget from './TopUsersWidget';
import TopProposalsWidget from './TopProposalsWidget';
import TestimonialsCarousel from './TestimonialsCarousel';
import DynamicCategoryGrid from './DynamicCategoryGrid';
import '../styles/glassmorphism.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Get featured products (products with originalPrice - on sale)
  const featuredProducts = products.filter(p => p.originalPrice).slice(0, 3);

  // Loading animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoaded(true), 500); // Wait 500ms then transform
          return 100;
        }
        return prev + 2; // Increment by 2% every 50ms = 2.5 seconds total
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Top 4 square blocks (PMM.gg style) - Angry Miao images
  const topCategories = [
    {
      title: 'RATING',
      image: 'https://images.unsplash.com/photo-1602025882379-e01cf08baa51?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmR8ZW58MHx8fHwxNzYyNTQxOTA0fDA&ixlib=rb-4.1.0&q=85',
      link: '/rating',
      description: 'Рейтинг сообщества'
    },
    {
      title: 'ARTICLES',
      image: 'https://images.unsplash.com/photo-1626958390898-162d3577f293?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmR8ZW58MHx8fHwxNzYyNTQxOTA0fDA&ixlib=rb-4.1.0&q=85',
      link: '/articles',
      description: 'Обзоры и аналитика'
    },
    {
      title: 'CREATORS',
      image: 'https://images.unsplash.com/photo-1618586810102-aaa7049200c0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmR8ZW58MHx8fHwxNzYyNTQxOTA0fDA&ixlib=rb-4.1.0&q=85',
      link: '/creators',
      description: 'Хаб креаторов'
    },
    {
      title: 'GROUP BUY',
      image: 'https://images.pexels.com/photos/34563105/pexels-photo-34563105.jpeg',
      link: '/groupbuy',
      description: 'Групповые закупки'
    }
  ];

  // Large bottom block for FEED - Angry Miao image
  const bottomBlock = {
    title: 'FEED',
    image: 'https://images.unsplash.com/photo-1615031465602-20f3ff3ca279?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxhbmdyeSUyMG1pYW8lMjBrZXlib2FyZHxlbnwwfHx8fDE3NjI1NDIyOTF8MA&ixlib=rb-4.1.0&q=85',
    link: '/feed',
    description: 'Лента постов и новостей сообщества'
  };

  return (
    <div className="dark-bg" style={{ minHeight: '100vh' }}>
      <div className="grain-overlay" />
      
      {/* Hero Section with Video Background */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden'
      }}>
        {/* Background Image (instead of video for now) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            backgroundImage: 'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            opacity: 0.5
          }}
        />

        {/* Dark Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }} />

        {/* Search in Center with Loading Animation */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '2rem',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {!isLoaded ? (
            /* Loading Bar Animation */
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              height: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
              {/* Progress Line */}
              <div
                style={{
                  width: `${loadingProgress}%`,
                  height: '2px',
                  background: 'white',
                  transition: 'width 0.05s linear',
                  boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                }}
              />
              {/* Loading Percentage */}
              <span
                style={{
                  position: 'absolute',
                  left: `${loadingProgress}%`,
                  transform: 'translateX(-50%)',
                  top: '-30px',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  textShadow: '0 0 10px rgba(255,255,255,0.8)',
                  transition: 'left 0.05s linear'
                }}
              >
                {loadingProgress}%
              </span>
            </div>
          ) : (
            /* Search Bar After Loading - Compact, No Border */
            <div
              className="search-container"
              style={{
                position: 'relative',
                maxWidth: '600px',
                width: '100%',
                animation: 'searchShrink 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            >
              {/* Search Icon Above */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: 0,
                animation: 'fadeInIcon 0.5s ease 0.8s forwards'
              }}>
                <Search size={24} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
              </div>

              {/* Search Input - No Border */}
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
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderBottom = '2px solid rgba(255, 255, 255, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
                }}
              />
            </div>
          )}
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes searchShrink {
            from {
              transform: scaleX(2);
              opacity: 0;
            }
            to {
              transform: scaleX(1);
              opacity: 1;
            }
          }

          @keyframes fadeInIcon {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }

          .search-input-minimal::placeholder {
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
          }
        `}</style>
      </div>

      {/* Divider */}
      <div style={{
        width: '100%',
        height: '1px',
        background: theme === 'dark' 
          ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
        margin: '3rem 0'
      }} />

      {/* PMM.gg Style Layout: 4 Squares + 1 Large Rectangle - EXACT SIZES */}
      <div style={{ padding: '0 2.5rem', marginBottom: '4rem' }}> {/* 40px = 2.5rem padding */}
        {/* Top 4 Square Blocks - 382px x 382px with 24px gap */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          maxWidth: '1840px',
          margin: '0 auto',
          marginBottom: '24px'
        }}>
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
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                    fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
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
          {/* Background Image */}
          <img
            src={bottomBlock.image}
            alt={bottomBlock.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                  fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
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
      <div style={{ padding: '0 2.5rem' }}> {/* 40px padding */}
        {/* Community Hub Section */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <div style={{
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
        </div>

        {/* Top Categories Section */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '1px'
          }}>
            {t('home.exploreTitle') || 'Explore the most popular products'}
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '4rem'
          }}>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="text-link"
              >
                {t(`categories.${category.slug}`)}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products - PMM.gg Style */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '3rem',
            textAlign: 'center',
            letterSpacing: '1px'
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
                    overflow: 'hidden'
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '100%',
                    height: '280px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase'
                    }}>
                      {product.category}
                    </div>
                    
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: 'white'
                    }}>
                      {product.name}
                    </h4>
                    
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                      marginBottom: '1rem'
                    }}>
                      {product.description}
                    </p>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'white'
                      }}>
                        ${product.price}
                      </div>
                      {product.originalPrice && (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.4)',
                          fontSize: '0.875rem',
                          textDecoration: 'line-through'
                        }}>
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
