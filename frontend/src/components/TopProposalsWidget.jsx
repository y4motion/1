import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function TopProposalsWidget() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProposals();
  }, []);

  const fetchTopProposals = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/voting?status=voting&limit=3`
      );
      if (response.ok) {
        const data = await response.json();
        // Sort by weighted_score and take top 3
        const sorted = data.sort((a, b) => b.weighted_score - a.weighted_score).slice(0, 3);
        setProposals(sorted);
      }
    } catch (error) {
      console.error('Error fetching top proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-6">Загрузка...</div>;
  if (proposals.length === 0) return null;

  return (
    <div
      className="glass-strong p-6"
      style={{ borderRadius: theme === 'minimal-mod' ? '0' : '16px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🗳️ Топ-3 Активных Запроса</h2>
        <button
          onClick={() => navigate('/voting')}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Все голосования →
        </button>
      </div>

      <div className="space-y-3">
        {proposals.map((proposal, index) => (
          <div
            key={proposal.id}
            onClick={() => navigate(`/voting/${proposal.id}`)}
            className="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
            style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold line-clamp-2 flex-1">{proposal.title}</h3>
              <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full ml-2">
                {proposal.category}
              </span>
            </div>

            <p className="text-sm text-white/70 mb-3 line-clamp-2">{proposal.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4 text-green-400" />
                <span>{proposal.votes_up}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{proposal.comments_count}</span>
              </div>
              <div className="ml-auto text-purple-400 font-bold">
                Score: {proposal.weighted_score.toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopProposalsWidget;
