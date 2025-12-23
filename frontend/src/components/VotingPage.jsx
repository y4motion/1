import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function VotingPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('voting'); // vetting, voting, in_progress, completed

  useEffect(() => {
    fetchProposals();
  }, [filter]);

  const fetchProposals = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/voting?status=${filter}`
      );
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'vetting':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'voting':
        return 'bg-blue-500/20 text-blue-400';
      case 'in_progress':
        return 'bg-purple-500/20 text-purple-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'vetting':
        return 'На модерации';
      case 'voting':
        return 'На голосовании';
      case 'in_progress':
        return 'В разработке';
      case 'completed':
        return 'Завершено';
      case 'rejected':
        return 'Отклонено';
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
              {theme === 'minimal-mod' ? 'VOTING' : 'Голосования'}
            </h1>
          </div>
          {user && (
            <button
              onClick={() => navigate('/voting/create')}
              className="glass-strong px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all"
              style={{ borderRadius: theme === 'minimal-mod' ? '0' : '12px' }}
            >
              <Plus className="w-5 h-5" />
              <span>Создать запрос</span>
            </button>
          )}
        </div>

        {/* Info */}
        <p className="text-white/70 max-w-3xl mb-4">
          Система предложений для влияния на развитие сайта. Вес вашего голоса зависит от уровня.
        </p>

        {/* Filters */}
        <div className="flex gap-2">
          {['vetting', 'voting', 'in_progress', 'completed'].map((status) => (
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

      {/* Proposals List */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12 text-white/50">Пока нет запросов</div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => navigate(`/voting/${proposal.id}`)}
                className="glass-strong p-6 cursor-pointer hover:scale-[1.01] transition-all"
                style={{ borderRadius: theme === 'minimal-mod' ? '0' : '16px' }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${getStatusColor(proposal.status)}`}
                    >
                      {getStatusText(proposal.status)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                      {proposal.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(proposal.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
                <p className="text-white/70 mb-4 line-clamp-2">{proposal.description}</p>

                {/* Author */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-white/50">Автор:</span>
                  <span className="text-sm font-medium">{proposal.username}</span>
                  <span className="text-xs px-2 py-0.5 bg-purple-500/20 rounded-full">
                    LVL {proposal.user_level}
                  </span>
                </div>

                {/* Voting Stats */}
                {proposal.status === 'voting' && (
                  <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-green-400" />
                      <span className="font-bold">{proposal.votes_up}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5 text-red-400" />
                      <span className="font-bold">{proposal.votes_down}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-sm text-white/70">Score:</span>
                      <span className="font-bold text-purple-400">
                        {proposal.weighted_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>{proposal.comments_count}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VotingPage;
