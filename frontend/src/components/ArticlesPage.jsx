import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Clock, Eye, Heart, BookMarked, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ArticlesPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, featured

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const fetchArticles = async () => {
    try {
      const url = filter === 'featured'
        ? `${process.env.REACT_APP_BACKEND_URL}/api/articles?featured_only=true`
        : `${process.env.REACT_APP_BACKEND_URL}/api/articles`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16" data-theme={theme}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={theme === 'minimal-mod' ? 'text-2xl font-bold' : 'text-3xl font-bold'}>
              {theme === 'minimal-mod' ? 'ARTICLES' : 'Статьи'}
            </h1>
          </div>
          {user && (
            <button
              onClick={() => navigate('/articles/create')}
              className="glass-strong px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all"
              style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
            >
              <Plus className="w-5 h-5" />
              <span>Написать статью</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all ${filter === 'all' ? 'bg-purple-500' : 'glass-strong hover:bg-white/5'}`}
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
          >
            Все статьи
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 rounded-xl transition-all ${filter === 'featured' ? 'bg-purple-500' : 'glass-strong hover:bg-white/5'}`}
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
          >
            Избранное
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-white/50">Пока нет статей</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <div
                key={article.id}
                onClick={() => navigate(`/articles/${article.id}`)}
                className="glass-strong overflow-hidden cursor-pointer hover:scale-105 transition-all"
                style={{ borderRadius: theme === 'minimal-mod' ? '0' : '16px' }}
              >
                {/* Cover Image */}
                {article.cover_image && (
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full">
                      {article.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Subtitle */}
                  {article.subtitle && (
                    <p className="text-sm text-white/70 mb-4 line-clamp-2">
                      {article.subtitle}
                    </p>
                  )}

                  {/* Author & Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 rounded-full">
                        {article.username}
                      </span>
                      {article.is_verified_creator && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Clock className="w-3 h-3" />
                      <span>{article.read_time} мин</span>
                    </div>
                  </div>

                  {/* Engagement */}
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{article.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{article.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookMarked className="w-4 h-4" />
                      <span>{article.bookmarks}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;