import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './home/HeroSection';
import FeaturedCategories from './home/FeaturedCategories';
import TrendingSection from './home/TrendingSection';
import LatestArticles from './home/LatestArticles';
import TopArticlesWidget from './TopArticlesWidget';
import TopUsersWidget from './TopUsersWidget';
import TopProposalsWidget from './TopProposalsWidget';
import TestimonialsCarousel from './TestimonialsCarousel';
import { categories, products } from '../mockData';
import '../styles/glassmorphism.css';

const HomePage = () => {
  const navigate = useNavigate();
  const featured = products.filter(p => p.originalPrice).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Hero Section - extracted component */}
      <HeroSection />

      {/* Content Blocks */}
      <div style={{ padding: '0 2.5rem', marginBottom: '4rem' }}>
        {/* Feature Grid */}
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
                aspectRatio: '1/1', borderRadius: '4px', overflow: 'hidden',
                cursor: 'pointer', position: 'relative', transition: 'transform 0.4s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src={c.i} alt={c.t} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: '700', textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>{c.t}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Feed Banner */}
        <div
          onClick={() => navigate('/feed')}
          style={{
            height: '560px', maxWidth: '1840px', margin: '0 auto', borderRadius: '4px',
            overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform 0.4s ease'
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
        {/* Widgets Grid */}
        <div style={{
          marginTop: '4rem', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem', maxWidth: '1840px', margin: '4rem auto'
        }}>
          <TopArticlesWidget />
          <TopUsersWidget />
          <TopProposalsWidget />
        </div>

        {/* Featured Categories - extracted component */}
        <FeaturedCategories />

        {/* Trending Section - extracted component */}
        <TrendingSection />

        {/* Latest Articles - extracted component */}
        <LatestArticles />

        {/* Popular Categories */}
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
                  padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px',
                  color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = 'rgba(255,255,255,0.7)'; }}
              >{cat.name}</a>
            ))}
          </div>
        </div>

        {/* Featured Deals */}
        <div style={{ margin: '3rem 0' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>
            FEATURED DEALS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1840px', margin: '0 auto' }}>
            {featured.map(p => (
              <a key={p.id} href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{ background: 'rgb(10,10,10)', borderRadius: '4px', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{p.category}</div>
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
