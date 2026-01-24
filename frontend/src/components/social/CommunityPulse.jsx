/**
 * CommunityPulse.jsx - Homepage Widgets (Two separate cards)
 * 
 * - NetworkPulse: Top post from Network (with mock data fallback)
 * - ConsensusPulse: Top idea from Consensus (with mock data fallback)
 * 
 * Style: Glass Material / Acrylic Ghost
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, Lightbulb, ChevronRight, Heart, 
  ChevronUp, FileText, Users, Eye, MessageSquare
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const springBouncy = { type: "spring", stiffness: 400, damping: 25 };

// Mock data for demo - always show content
const MOCK_POST = {
  title: "White Minimal Setup 2024",
  username: "ghost_builder",
  likes: 847,
  comments: 64,
  views: 2400,
  media: [{ url: null }], // placeholder
  category: "showcase"
};

const MOCK_IDEA = {
  title: "Dark Theme V2",
  description: "Улучшенная тёмная тема с OLED-оптимизацией и новыми акцентными цветами для ночного режима",
  votes: 1247,
  vote_score: 9.2,
  status: "in_progress",
  progress: 85
};

/**
 * NetworkPulse - Top post widget with Glass Material
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
          } else {
            // Use mock data if no posts
            setTopPost(MOCK_POST);
          }
        } else {
          setTopPost(MOCK_POST);
        }
      } catch (err) {
        console.error('Failed to fetch top post:', err);
        setTopPost(MOCK_POST);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const post = topPost || MOCK_POST;

  return (
    <motion.div 
      className={`pulse-widget network-pulse kinetic-widget ${className}`}
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
        
        {/* Content - Always show */}
        <div className="pulse-content">
          {/* Mock Image Area */}
          <div className="pulse-media" style={{
            height: '100px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            overflow: 'hidden',
          }}>
            {post.media?.[0]?.url ? (
              <img src={post.media[0].url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px', opacity: 0.3 }}>🖥️</span>
            )}
          </div>
          
          <h3 className="pulse-title" style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '8px',
          }}>
            {post.title}
          </h3>
          
          <div className="pulse-meta" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
          }}>
            <span className="meta-author" style={{ color: 'rgba(255,255,255,0.6)' }}>
              @{post.username}
            </span>
            <span className="meta-stat" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart size={11} /> {post.likes || 0}
            </span>
            <span className="meta-stat" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={11} /> {post.comments || 0}
            </span>
          </div>
        </div>
        
        {/* Footer Link */}
        <Link to="/community/network" className="pulse-expand" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0 0',
          marginTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: '0.1em',
          transition: 'color 0.2s',
        }}>
          <span>ОТКРЫТЬ ЛЕНТУ</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

/**
 * ConsensusPulse - Top idea widget with Glass Material
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
          } else {
            setTopIdea(MOCK_IDEA);
          }
        } else {
          setTopIdea(MOCK_IDEA);
        }
      } catch (err) {
        console.error('Failed to fetch top idea:', err);
        setTopIdea(MOCK_IDEA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const idea = topIdea || MOCK_IDEA;

  return (
    <motion.div 
      className={`pulse-widget consensus-pulse kinetic-widget ${className}`}
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
            <span>ROADMAP</span>
          </div>
          <span style={{
            fontSize: '9px',
            fontFamily: '"JetBrains Mono", monospace',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
          }}>Q1 2025</span>
        </div>
        
        {/* Content - Always show */}
        <div className="pulse-content" style={{ marginTop: '16px' }}>
          {/* Rank badge */}
          <div className="pulse-idea-rank" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <span className="rank-badge" style={{
              padding: '4px 10px',
              background: 'rgba(255,159,67,0.15)',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#FF9F43',
              fontFamily: '"JetBrains Mono", monospace',
            }}>#1</span>
            <span className="rank-score" style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: '"JetBrains Mono", monospace',
            }}>{idea.vote_score?.toFixed(1) || '9.2'}</span>
          </div>
          
          <h3 className="pulse-title" style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '8px',
          }}>
            {idea.title}
          </h3>
          
          <p className="pulse-description" style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5,
            marginBottom: '16px',
          }}>
            {idea.description?.substring(0, 80)}...
          </p>
          
          {/* Progress bar */}
          <div className="pulse-progress" style={{ marginBottom: '8px' }}>
            <div style={{
              height: '4px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${idea.progress || 85}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.3))',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
          
          <div className="pulse-votes" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
              {idea.progress || 85}% COMPLETE
            </span>
            <span style={{ 
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <ChevronUp size={12} /> {idea.votes || 1247} votes
            </span>
          </div>
        </div>
        
        {/* Footer Link */}
        <Link to="/community/consensus" className="pulse-expand" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0 0',
          marginTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: '0.1em',
          transition: 'color 0.2s',
        }}>
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
