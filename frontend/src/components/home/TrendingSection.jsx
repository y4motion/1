import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
import OptimizedImage from '../OptimizedImage';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function TrendingSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      // Try homepage API first, fallback to recommendations
      let response = await fetch(`${API_URL}/api/homepage/trending-products?limit=6`);
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/recommendations/trending?limit=6`);
      }
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || data.products || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section style={{ margin: '4rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingUp size={28} style={{ color: '#ef4444' }} /> Trending Now
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: '280px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section style={{ margin: '4rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={28} style={{ color: '#ef4444' }} /> Trending Now 🔥
        </h2>
        <Link to="/marketplace?sort=trending" style={{ color: '#a855f7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          View All <ArrowRight size={18} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {products.slice(0, 6).map((product, index) => (
          <Link key={product.id} to={`/product/${product.id}`}
            style={{
              background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px', overflow: 'hidden', textDecoration: 'none', transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; }}
          >
            <OptimizedImage
              src={product.images?.[0]?.url || product.image || '/placeholder.png'}
              alt={product.title || product.name}
              priority={index < 3}
              style={{ aspectRatio: '1', width: '100%' }}
            />
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white', margin: '0 0 0.5rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.title || product.name}
              </h3>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#a855f7' }}>
                ${product.price?.toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
