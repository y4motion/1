import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Clock, Eye } from 'lucide-react';
import OptimizedImage from '../OptimizedImage';
import './LatestArticles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function LatestArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
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

  // Loading skeleton
  if (loading) {
    return (
      <section className="latest-articles-section">
        <div className="latest-articles-container">
          <div className="latest-articles-header">
            <h2 className="latest-articles-title">
              <span className="title-icon"><FileText size={20} /></span>
              Latest Articles
            </h2>
          </div>
          <div className="articles-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="article-skeleton-card">
                <div className="skeleton" style={{ height: '180px', marginBottom: '1.25rem' }} />
                <div className="skeleton" style={{ height: '24px', marginBottom: '0.75rem', width: '80%' }} />
                <div className="skeleton" style={{ height: '60px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '16px', width: '40%' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="latest-articles-section">
      <div className="latest-articles-container">
        <div className="latest-articles-header">
          <h2 className="latest-articles-title">
            <span className="title-icon"><FileText size={20} /></span>
            Latest Articles
          </h2>
          <Link to="/articles" className="view-all-link">
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="articles-grid">
          {articles.slice(0, 3).map((article) => (
            <Link key={article.id} to={`/article/${article.id}`} className="article-card">
              <div className="article-image">
                {article.cover_image ? (
                  <OptimizedImage 
                    src={article.cover_image} 
                    alt={article.title}
                  />
                ) : (
                  <div className="article-image-placeholder">
                    <FileText size={32} />
                  </div>
                )}
              </div>
              
              <div className="article-content">
                {article.category && (
                  <span className="article-category">{article.category}</span>
                )}
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">
                  {article.excerpt || article.content?.substring(0, 150)}
                </p>
              </div>

              <div className="article-footer">
                <div className="article-meta">
                  <span className="article-date">
                    <Clock size={14} />
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                  {article.views && (
                    <span className="article-views">
                      <Eye size={14} />
                      {article.views}
                    </span>
                  )}
                </div>
                <span className="read-more">
                  Read <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
