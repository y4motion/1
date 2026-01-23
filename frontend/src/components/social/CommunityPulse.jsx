/**
 * CommunityPulse.jsx - Homepage Widget (Flip Card)
 * 
 * Two-sided card:
 * - Front: Top post from Network
 * - Back: Top idea from Consensus
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, Lightbulb, ChevronRight, Heart, 
  ChevronUp, RotateCw, Users
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const springBouncy = { type: "spring", stiffness: 400, damping: 25 };

export const CommunityPulse = ({ className = '' }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [topPost, setTopPost] = useState(null);
  const [topIdea, setTopIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auto-flip every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Top post
        const postRes = await fetch(`${API_URL}/api/network/feed?limit=1&sort=hot`);
        if (postRes.ok) {
          const data = await postRes.json();
          if (data.posts?.length > 0) {
            setTopPost(data.posts[0]);
          }
        }
        
        // Top idea
        const ideaRes = await fetch(`${API_URL}/api/consensus/ideas?limit=1&sort=score`);
        if (ideaRes.ok) {
          const data = await ideaRes.json();
          if (data.ideas?.length > 0) {
            setTopIdea(data.ideas[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch community pulse:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  return (
    <motion.div 
      className={`community-pulse ${className}`}
      data-testid="community-pulse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springBouncy}
    >
      {/* Flip Container */}
      <div 
        className={`pulse-flip-container ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        {/* Front: Top Post */}
        <div className="pulse-card pulse-front">
          <div className="pulse-header">
            <div className="pulse-badge network">
              <Activity size={12} />
              <span>NETWORK</span>
            </div>
            <button className="flip-btn" onClick={handleFlip}>
              <RotateCw size={14} />
            </button>
          </div>
          
          {topPost ? (
            <div className="pulse-content">
              {/* Post Image */}
              {topPost.media?.[0]?.url && (
                <div className="pulse-media">
                  <img src={topPost.media[0].url} alt={topPost.title} />
                </div>
              )}
              
              <h3 className="pulse-title">{topPost.title}</h3>
              
              <div className="pulse-meta">
                <span className="meta-author">@{topPost.username}</span>
                <span className="meta-stat">
                  <Heart size={12} /> {topPost.likes || 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="pulse-empty">
              <Activity size={24} />
              <span>Нет постов</span>
            </div>
          )}
          
          <Link to="/community/network" className="pulse-expand">
            <span>ОТКРЫТЬ ЛЕНТУ</span>
            <ChevronRight size={14} />
          </Link>
        </div>
        
        {/* Back: Top Idea */}
        <div className="pulse-card pulse-back">
          <div className="pulse-header">
            <div className="pulse-badge consensus">
              <Lightbulb size={12} />
              <span>CONSENSUS</span>
            </div>
            <button className="flip-btn" onClick={handleFlip}>
              <RotateCw size={14} />
            </button>
          </div>
          
          {topIdea ? (
            <div className="pulse-content">
              <div className="pulse-idea-rank">
                <span className="rank-badge">#1</span>
                <span className="rank-score">{topIdea.vote_score?.toFixed(1) || 0}</span>
              </div>
              
              <h3 className="pulse-title">{topIdea.title}</h3>
              
              <p className="pulse-description">
                {topIdea.description?.substring(0, 80)}...
              </p>
              
              <div className="pulse-votes">
                <div className="votes-bar">
                  <div 
                    className="votes-fill" 
                    style={{ width: `${Math.min((topIdea.votes || 0) / 50 * 100, 100)}%` }}
                  />
                </div>
                <span className="votes-count">
                  <ChevronUp size={12} /> {topIdea.votes || 0} голосов
                </span>
              </div>
            </div>
          ) : (
            <div className="pulse-empty">
              <Lightbulb size={24} />
              <span>Нет идей</span>
            </div>
          )}
          
          <Link to="/community/consensus" className="pulse-expand">
            <span>ГОЛОСОВАТЬ</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
      
      {/* Community Stats Footer */}
      <div className="pulse-footer">
        <Users size={12} />
        <span>COMMUNITY PULSE</span>
        <span className="dot">•</span>
        <span className="tap-hint">TAP TO FLIP</span>
      </div>
    </motion.div>
  );
};

export default CommunityPulse;
