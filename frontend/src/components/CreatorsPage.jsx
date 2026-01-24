import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Users, Eye, Heart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CreatorsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/creators`);
      if (response.ok) {
        const data = await response.json();
        setCreators(data);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16" data-theme={theme}>
      {/* Header */}
      <div className="w-full px-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={theme === 'minimal-mod' ? 'text-2xl font-bold' : 'text-3xl font-bold'}>
            {theme === 'minimal-mod' ? 'CREATORS HUB' : 'Хаб Креаторов'}
          </h1>
        </div>
        <p className="text-white/70 max-w-3xl">
          Верифицированные обзорщики и стримеры. Контент структурирован по тегам товаров и
          категориям.
        </p>
      </div>

      {/* Creators Grid */}
      <div className="w-full px-8">
        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : creators.length === 0 ? (
          <div className="text-center py-12 text-white/50">Пока нет креаторов</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="glass-strong overflow-hidden"
                style={{ borderRadius: theme === 'minimal-mod' ? '0' : '16px' }}
              >
                {/* Banner */}
                {creator.banner_image && (
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${creator.banner_image})` }}
                  />
                )}

                <div className="p-6">
                  {/* Avatar & Verification */}
                  <div className="flex items-start gap-3 mb-4 -mt-16 relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl border-4 border-black">
                      {creator.user_avatar || '🎬'}
                    </div>
                    {creator.is_verified && (
                      <span className="absolute top-0 right-0 text-xl">✓️</span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold mb-2">{creator.display_name}</h3>
                  <p className="text-sm text-white/70 mb-4 line-clamp-2">{creator.bio}</p>

                  {/* Specialization Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {creator.specialization.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-purple-500/20 rounded-full"
                        style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{creator.followers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{creator.total_views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{creator.total_likes}</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-2 mb-4">
                    {Object.entries(creator.social_links || {}).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 glass-strong rounded-lg hover:scale-110 transition-all"
                        style={{ borderRadius: theme === 'minimal-mod' ? '0' : '8px' }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/creators/${creator.id}`)}
                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:scale-105 transition-all"
                    style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
                  >
                    Смотреть профиль
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatorsPage;
