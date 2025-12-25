import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import OptimizedImage from '../OptimizedImage';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function LatestArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      // Try homepage API first
      let response = await fetch(`${API_URL}/api/homepage/latest-articles?limit=3`);
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/content/articles?limit=3`);
      }
      if (response.ok) {
        const data = await response.json();
        setArticles(data.data || data.articles || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || articles.length === 0) return null;

  return (
    <section style={{ margin: '4rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={28} style={{ color: '#3b82f6' }} /> Latest Articles
        </h2>
        <Link to="/articles" style={{ color: '#a855f7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          View All <ArrowRight size={18} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {articles.slice(0, 3).map((article) => (
          <Link key={article.id} to={`/article/${article.id}`}
            style={{
              background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px', overflow: 'hidden', textDecoration: 'none', transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; }}
          >
            {article.cover_image && (
              <OptimizedImage src={article.cover_image} alt={article.title} style={{ aspectRatio: '16/9', width: '100%' }} />
            )}
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                {article.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 1rem 0', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {article.excerpt || article.content?.substring(0, 150)}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                <Clock size={14} />
                {new Date(article.created_at).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
