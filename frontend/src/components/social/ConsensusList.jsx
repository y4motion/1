/**
 * ConsensusList.jsx - King of the Hill Ideas
 * 
 * Features:
 * - Ranked ideas list
 * - RP voting system
 * - Category filters
 * - Create idea modal
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, ChevronUp, MessageSquare, Clock, 
  AlertCircle, Check, Loader2, Coins, Lock,
  Filter, Plus, TrendingUp, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const springSmooth = { type: "spring", stiffness: 300, damping: 30 };

// Status badges
const statusConfig = {
  open: { label: 'OPEN', color: '#00FFD4', icon: Lightbulb },
  reviewing: { label: 'REVIEWING', color: '#FF9F43', icon: Clock },
  in_progress: { label: 'IN PROGRESS', color: '#3B82F6', icon: Loader2 },
  implemented: { label: 'IMPLEMENTED', color: '#00FF00', icon: Check },
  rejected: { label: 'REJECTED', color: '#FF0000', icon: AlertCircle }
};

// Categories
const ideaCategories = [
  { id: 'all', label: 'ВСЕ' },
  { id: 'site', label: 'САЙТ' },
  { id: 'products', label: 'ТОВАРЫ' },
  { id: 'software', label: 'СОФТ' },
  { id: 'community', label: 'КОМЬЮНИТИ' }
];

// Idea card component
const IdeaCard = ({ idea, userRp, onVote, canVote }) => {
  const [voting, setVoting] = useState(false);
  const status = statusConfig[idea.status] || statusConfig.open;
  const StatusIcon = status.icon;
  
  const handleVote = async () => {
    if (!canVote || voting || idea.has_voted) return;
    
    setVoting(true);
    await onVote(idea.id);
    setVoting(false);
  };
  
  return (
    <motion.article
      className="idea-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={springSmooth}
      layout
    >
      {/* Rank */}
      <div className="idea-rank">
        <span className="rank-number">#{idea.rank || '—'}</span>
        {idea.rank_change > 0 && <span className="rank-up">↑{idea.rank_change}</span>}
        {idea.rank_change < 0 && <span className="rank-down">↓{Math.abs(idea.rank_change)}</span>}
      </div>
      
      {/* Vote Button */}
      <div className="idea-vote">
        <motion.button
          className={`vote-btn ${idea.has_voted ? 'voted' : ''}`}
          onClick={handleVote}
          disabled={!canVote || idea.has_voted || voting}
          whileHover={canVote && !idea.has_voted ? { scale: 1.1 } : {}}
          whileTap={canVote && !idea.has_voted ? { scale: 0.9 } : {}}
        >
          {voting ? (
            <Loader2 size={20} className="spin" />
          ) : (
            <ChevronUp size={20} />
          )}
        </motion.button>
        <span className="vote-score">{idea.vote_score?.toFixed(1) || 0}</span>
        <span className="vote-count">{idea.votes || 0} votes</span>
      </div>
      
      {/* Content */}
      <div className="idea-content">
        {/* Status Badge */}
        <div className="idea-status" style={{ color: status.color }}>
          <StatusIcon size={12} />
          <span>{status.label}</span>
        </div>
        
        {/* Title */}
        <h3 className="idea-title">{idea.title}</h3>
        
        {/* Description preview */}
        <p className="idea-description">
          {idea.description?.substring(0, 150)}...
        </p>
        
        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="idea-tags">
            {idea.tags.map(tag => (
              <span key={tag} className="idea-tag">{tag}</span>
            ))}
          </div>
        )}
        
        {/* Meta */}
        <div className="idea-meta">
          <div className="meta-author">
            <span className="author-name">@{idea.username}</span>
            <span className="author-level">LVL {idea.user_level || 1}</span>
          </div>
          
          <div className="meta-stats">
            <span><MessageSquare size={12} /> {idea.comments_count || 0}</span>
            <span><Coins size={12} /> {idea.rp_cost} RP</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default function ConsensusList() {
  const { user, token } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('score');
  const [userRp, setUserRp] = useState(0);
  const [voteCost, setVoteCost] = useState(50);
  const [canVote, setCanVote] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  
  // Fetch ideas
  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({ page: 1, limit: 30, sort });
      if (category !== 'all') {
        params.append('category', category);
      }
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_URL}/api/consensus/ideas?${params}`, { headers });
      const data = await res.json();
      
      setIdeas(data.ideas || []);
      setUserRp(data.user_rp || 0);
      setVoteCost(data.vote_cost || 50);
      
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoading(false);
    }
  }, [category, sort, token]);
  
  // Fetch user info
  const fetchInfo = useCallback(async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_URL}/api/consensus/info`, { headers });
      const data = await res.json();
      
      setUserRp(data.user?.rp_balance || 0);
      setCanVote(data.user?.can_vote || false);
      setCanCreate(data.user?.can_create_idea || false);
      
    } catch (err) {
      console.error('Failed to fetch info:', err);
    }
  }, [token]);
  
  useEffect(() => {
    fetchIdeas();
    fetchInfo();
  }, [fetchIdeas, fetchInfo]);
  
  // Vote handler
  const handleVote = async (ideaId) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/consensus/idea/${ideaId}/vote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserRp(data.user_rp);
        
        // Update idea in list
        setIdeas(prev => prev.map(idea => 
          idea.id === ideaId 
            ? { ...idea, vote_score: data.new_score, has_voted: true, votes: (idea.votes || 0) + 1 }
            : idea
        ));
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  return (
    <div className="consensus-list" data-testid="consensus-list">
      {/* Header */}
      <header className="consensus-header">
        <div className="header-title-row">
          <h1>THE CONSENSUS</h1>
          
          {/* User RP Balance */}
          <div className="rp-balance">
            <Coins size={16} />
            <span>{userRp} RP</span>
          </div>
        </div>
        
        <p className="header-subtitle">
          Голосуй за идеи — лучшие воплощаются в жизнь
        </p>
        
        {/* Create Button */}
        <div className="header-actions">
          <motion.button 
            className={`create-idea-btn ${!canCreate ? 'disabled' : ''}`}
            whileHover={canCreate ? { scale: 1.05 } : {}}
            whileTap={canCreate ? { scale: 0.95 } : {}}
            disabled={!canCreate}
          >
            {canCreate ? (
              <>
                <Plus size={18} />
                <span>ПРЕДЛОЖИТЬ ИДЕЮ</span>
                <span className="cost-badge">500 RP</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>УРОВЕНЬ 10</span>
              </>
            )}
          </motion.button>
        </div>
        
        {/* Category Tabs */}
        <div className="category-tabs">
          {ideaCategories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        {/* Sort Options */}
        <div className="sort-options">
          <button 
            className={`sort-btn ${sort === 'score' ? 'active' : ''}`}
            onClick={() => setSort('score')}
          >
            <TrendingUp size={14} /> TOP
          </button>
          <button 
            className={`sort-btn ${sort === 'new' ? 'active' : ''}`}
            onClick={() => setSort('new')}
          >
            <Sparkles size={14} /> NEW
          </button>
          <button 
            className={`sort-btn ${sort === 'trending' ? 'active' : ''}`}
            onClick={() => setSort('trending')}
          >
            🔥 TRENDING
          </button>
        </div>
        
        {/* Vote Cost Info */}
        <div className="vote-cost-info">
          <span>Голос стоит <strong>{voteCost} RP</strong></span>
          {!canVote && <span className="warning"> • Нужен уровень 5</span>}
        </div>
      </header>
      
      {/* Ideas List */}
      <div className="ideas-list">
        <AnimatePresence>
          {ideas.map(idea => (
            <IdeaCard 
              key={idea.id}
              idea={idea}
              userRp={userRp}
              canVote={canVote && userRp >= voteCost}
              onVote={handleVote}
            />
          ))}
        </AnimatePresence>
        
        {/* Empty state */}
        {!loading && ideas.length === 0 && (
          <div className="ideas-empty">
            <Lightbulb size={48} />
            <h3>Пока нет идей</h3>
            <p>Будь первым, кто предложит идею!</p>
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="ideas-loading">
            <div className="loading-spinner" />
          </div>
        )}
      </div>
    </div>
  );
}
