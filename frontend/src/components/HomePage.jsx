import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categories, products } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import TopArticlesWidget from './TopArticlesWidget';
import TopUsersWidget from './TopUsersWidget';
import TopProposalsWidget from './TopProposalsWidget';
import DynamicCategoryGrid from './DynamicCategoryGrid';
import '../styles/glassmorphism.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Get featured products (products with originalPrice - on sale)
  const featuredProducts = products.filter(p => p.originalPrice).slice(0, 3);

  // Dynamic category blocks for PMM.gg style
  const mainCategories = [
    {
      title: 'FEED',
      image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80',
      link: '/feed',
      description: 'Лента постов и новостей'
    },
    {
      title: 'ARTICLES',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
      link: '/articles',
      description: 'Обзоры и аналитика'
    },
    {
      title: 'CREATORS',
      image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&q=80',
      link: '/creators',
      description: 'Хаб креаторов'
    },
    {
      title: 'GROUP BUY',
      image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80',
      link: '/groupbuy',
      description: 'Групповые закупки'
    }
  ];

  return (
    <div className="dark-bg" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
      <div className="grain-overlay" />
      
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        {/* Main Hero Text with Pulsing */}
        <h1 
          className="pulse-glow"
          style={{
            fontSize: '5rem',
            fontWeight: '900',
            marginBottom: '3rem',
            letterSpacing: '2px',
            lineHeight: '1.1'
          }}
        >
          {t('hero.title')}
        </h1>

        {/* Search Dialog */}
        <div className="search-dialog" style={{ maxWidth: '600px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Search size={20} style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }} />
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
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

      {/* Dynamic Category Grid (PMM.gg style) */}
      <DynamicCategoryGrid 
        categories={mainCategories}
        columns={4}
      />

        {/* Community Hub Section */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '3rem',
            textAlign: 'center',
            letterSpacing: '1px'
          }}>
            {t('home.communityHub') || '\ud83c\udf0e Community Hub'}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <TopArticlesWidget />
            <TopUsersWidget />
            <TopProposalsWidget />
          </div>
        </div>

        {/* Featured Products */}
        <div style={{ marginTop: '4rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}>
            {t('home.featuredDeals')}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="product-card" style={{ padding: '1.5rem' }}>
                  {/* Product Image */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'
                  }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="no-transform-transition"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{
                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
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
                      marginBottom: '0.5rem'
                    }}>
                      {product.name}
                    </h4>
                    <p style={{
                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      {product.description}
                    </p>
                  </div>

                  {/* Price and Status */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700'
                      }}>
                        ${product.price}
                      </div>
                      {product.originalPrice && (
                        <div style={{
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                          fontSize: '0.875rem',
                          textDecoration: 'line-through'
                        }}>
                          ${product.originalPrice}
                        </div>
                      )}
                    </div>
                    <div className="status-badge status-approved">
                      {t('product.approved')}
                    </div>
                  </div>
                </div>
              </Link>
            ))}</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
