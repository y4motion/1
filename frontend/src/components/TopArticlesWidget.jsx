import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function TopArticlesWidget() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopArticles();
  }, []);

  const fetchTopArticles = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/articles?limit=3&featured_only=true`
      );
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching top articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-6">Загрузка...</div>;
  if (articles.length === 0) return null;

  return (
    <div className="glass-strong p-6" style={{ borderRadius: theme === 'minimal-mod' ? '0' : '16px' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">📰 Топ Статьи Месяца</h2>
        <button
          onClick={() => navigate('/articles')}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Все статьи →
        </button>
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <div
            key={article.id}
            onClick={() => navigate(`/articles/${article.id}`)}
            className="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
          >
            <div className="flex items-start gap-3">
              {article.cover_image && (
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-20 h-20 object-cover rounded-lg"
                  style={{ borderRadius: theme === 'minimal-mod' ? '0' : '8px' }}
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold mb-1 line-clamp-2">{article.title}</h3>
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{article.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.read_time} мин</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopArticlesWidget;