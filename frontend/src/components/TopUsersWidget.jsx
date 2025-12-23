import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Flame } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function TopUsersWidget() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/rating/top-monthly?limit=3`
      );
      if (response.ok) {
        const data = await response.json();
        setTopUsers(data);
      }
    } catch (error) {
      console.error('Error fetching top users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) return <div className="text-center py-6">Загрузка...</div>;
  if (topUsers.length === 0) return null;

  return (
    <div
      className="glass-strong p-6"
      style={{ borderRadius: theme === 'minimal-mod' ? '0' : '16px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🏆 Топ-3 Месяца</h2>
        <button
          onClick={() => navigate('/rating')}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Полный рейтинг →
        </button>
      </div>

      <div className="space-y-3">
        {topUsers.map((user, index) => (
          <div
            key={user.user_id}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
          >
            {/* Rank */}
            <div className="text-2xl font-bold">{getMedal(index + 1)}</div>

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">
              {user.user_avatar || '👤'}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="font-bold">{user.username}</div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Trophy className="w-3 h-3" />
                <span>LVL {user.current_level}</span>
                <Flame className="w-3 h-3 ml-1" />
                <span>{user.current_streak}d</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-lg font-bold text-purple-400">{user.monthly_rp}</div>
              <div className="text-xs text-white/50">RP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopUsersWidget;
