import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Trophy, Star, Flame, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function RatingPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly'); // monthly, all_time

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/rating/leaderboard?period=${period}`
      );
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-purple-500 to-blue-500';
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen pt-20 pb-16" data-theme={theme}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={theme === 'minimal-mod' ? 'text-2xl font-bold' : 'text-3xl font-bold'}>
            {theme === 'minimal-mod' ? 'RATING' : 'Рейтинг Сообщества'}
          </h1>
        </div>

        {/* Info */}
        <p className="text-white/70 max-w-3xl mb-6">
          Топ-10 пользователей месяца получают Легендарное Достижение и доступ к Видео Ховеру
          Профиля.
        </p>

        {/* Period Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-xl transition-all ${period === 'monthly' ? 'bg-purple-500' : 'glass-strong hover:bg-white/5'}`}
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
          >
            Месяц
          </button>
          <button
            onClick={() => setPeriod('all_time')}
            className={`px-4 py-2 rounded-xl transition-all ${period === 'all_time' ? 'bg-purple-500' : 'glass-strong hover:bg-white/5'}`}
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
          >
            Все время
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-white/50">Пока нет данных</div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={user.user_id}
                  className={`glass-strong p-6 ${isTop3 ? 'border-2' : ''}`}
                  style={{
                    borderRadius: theme === 'minimal-mod' ? '0' : '16px',
                    borderColor: isTop3
                      ? rank === 1
                        ? '#fbbf24'
                        : rank === 2
                          ? '#9ca3af'
                          : '#fb923c'
                      : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center font-bold text-xl`}
                      style={{ borderRadius: theme === 'minimal-mod' ? '0' : '50%' }}
                    >
                      {getRankMedal(rank)}
                    </div>

                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl">
                      {user.user_avatar || '👤'}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold">{user.username}</span>
                        {user.has_video_hover && <span className="text-sm">🎥</span>}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/70">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>LVL {user.current_level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          <span>{user.current_streak}d</span>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      {period === 'monthly' ? (
                        <>
                          <div className="text-2xl font-bold text-purple-400">
                            {user.monthly_rp}
                          </div>
                          <div className="text-xs text-white/50">RP</div>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-blue-400">{user.total_xp}</div>
                          <div className="text-xs text-white/50">XP</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Legendary Achievements (Top 10) */}
                  {rank <= 10 &&
                    user.legendary_achievements &&
                    user.legendary_achievements.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 flex-wrap">
                          {user.legendary_achievements.map((achievement, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full"
                            >
                              {achievement}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RatingPage;
