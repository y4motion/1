/**
 * CommunityPulse.jsx - Homepage Widgets (Two separate cards)
 * 
 * - NetworkPulse: Top post from Network
 * - ConsensusPulse: Top idea from Consensus
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, Lightbulb, ChevronRight, Heart, 
  ChevronUp, FileText, Users
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const springBouncy = { type: "spring", stiffness: 400, damping: 25 };

/**
 * NetworkPulse - Top post widget
 */
export const NetworkPulse = ({ className = '' }) => {
  const [topPost, setTopPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/network/feed?limit=1&sort=hot`);
        if (res.ok) {
          const data = await res.json();
          if (data.posts?.length > 0) {
            setTopPost(data.posts[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch top post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div 
      className={`pulse-widget network-pulse ${className}`}
      data-testid="network-pulse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springBouncy}
    >
      <div className="pulse-widget-inner">
        {/* Header */}
        <div className="pulse-header">
          <div className="pulse-badge network">
            <Activity size={12} />
            <span>NETWORK</span>
          </div>
          <span className="pulse-live">
            <span className="live-dot" />
            LIVE
          </span>
        </div>
        
        {/* Content */}
        {topPost ? (
          <div className="pulse-content">
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
            <FileText size={28} />
            <span>Пока нет постов</span>
            <p>Будь первым!</p>
          </div>
        )}
        
        {/* Footer Link */}
        <Link to="/community/network" className="pulse-expand">
          <span>ОТКРЫТЬ ЛЕНТУ</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

/**
 * ConsensusPulse - Top idea widget
 */
export const ConsensusPulse = ({ className = '' }) => {
  const [topIdea, setTopIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/consensus/ideas?limit=1&sort=score`);
        if (res.ok) {
          const data = await res.json();
          if (data.ideas?.length > 0) {
            setTopIdea(data.ideas[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch top idea:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div 
      className={`pulse-widget consensus-pulse ${className}`}
      data-testid="consensus-pulse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springBouncy}
    >
      <div className="pulse-widget-inner">
        {/* Header */}
        <div className="pulse-header">
          <div className="pulse-badge consensus">
            <Lightbulb size={12} />
            <span>CONSENSUS</span>
          </div>
        </div>
        
        {/* Content */}
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
            <Lightbulb size={28} />
            <span>Нет идей</span>
            <p>Предложи первым!</p>
          </div>
        )}
        
        {/* Footer Link */}
        <Link to="/community/consensus" className="pulse-expand">
          <span>ГОЛОСОВАТЬ</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

/**
 * CommunityPulse - Combined wrapper (for backward compatibility)
 * Now renders both widgets side by side
 */
export const CommunityPulse = ({ className = '' }) => {
  return (
    <div className={`community-pulse-row ${className}`} data-testid="community-pulse">
      <NetworkPulse />
      <ConsensusPulse />
    </div>
  );
};

export default CommunityPulse;
