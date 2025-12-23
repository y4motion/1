import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Users, TrendingUp, Clock, Plus, Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function GroupBuyPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [groupbuys, setGroupbuys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active, successful, failed

  useEffect(() => {
    fetchGroupbuys();
  }, [filter]);

  const fetchGroupbuys = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/groupbuy?status=${filter}`
      );
      if (response.ok) {
        const data = await response.json();
        setGroupbuys(data);
      }
    } catch (error) {
      console.error('Error fetching group buys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-400';
      case 'successful':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-white/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'successful':
        return 'Цель достигнута';
      case 'failed':
        return 'Не состоялась';
      case 'completed':
        return 'Завершена';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16" data-theme={theme}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={theme === 'minimal-mod' ? 'text-2xl font-bold' : 'text-3xl font-bold'}>
              {theme === 'minimal-mod' ? 'GROUP BUY' : 'Групповые Закупки'}
            </h1>
          </div>
          {user && (
            <button
              onClick={() => navigate('/groupbuy/create')}
              className="glass-strong px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all"
              style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
            >
              <Plus className="w-5 h-5" />
              <span>Создать</span>
            </button>
          )}
        </div>

        {/* Info */}
        <p className="text-white/70 max-w-3xl mb-6">
          Организуйте или присоединяйтесь к групповой закупке, чтобы получить лучшую цену!
        </p>

        {/* Filters */}
        <div className="flex gap-2">
          {['active', 'successful', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl transition-all ${filter === status ? 'bg-purple-500' : 'glass-strong hover:bg-white/5'}`}
              style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
            >
              {getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Group Buys Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : groupbuys.length === 0 ? (
          <div className="text-center py-12 text-white/50">Пока нет закупок</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupbuys.map((gb) => {
              const progress = getProgress(gb.current_participants, gb.min_participants);
              const daysLeft = Math.ceil(
                (new Date(gb.deadline) - new Date()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={gb.id}
                  onClick={() => navigate(`/groupbuy/${gb.id}`)}
                  className="glass-strong cursor-pointer hover:scale-105 transition-all overflow-hidden"
                  style={{ borderRadius: theme === 'minimal-mod' ? '0' : '16px' }}
                >
                  {/* Product Image */}
                  <img
                    src={gb.product_image}
                    alt={gb.product_name}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="mb-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(gb.status)}`}
                      >
                        {getStatusText(gb.status)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{gb.title}</h3>

                    {/* Product Name */}
                    <p className="text-sm text-white/70 mb-4">{gb.product_name}</p>

                    {/* Price Info */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm text-white/50">Текущая цена:</span>
                        <span className="text-xl font-bold text-green-400">
                          ${gb.current_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-white/40 line-through">
                          ${gb.original_price.toFixed(2)}
                        </span>
                        <span className="text-xs text-purple-400">
                          Цель: ${gb.target_price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="text-white/70">Прогресс</span>
                        <span className="font-bold">
                          {gb.current_participants}/{gb.min_participants}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Time Left */}
                    {gb.status === 'active' && (
                      <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                        <Clock className="w-4 h-4" />
                        <span>Осталось: {daysLeft} дней</span>
                      </div>
                    )}

                    {/* Organizer */}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                      <Users className="w-4 h-4" />
                      <span className="text-sm text-white/70">
                        Организатор: {gb.organizer_username}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupBuyPage;
