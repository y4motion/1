/**
 * NetworkFeed.jsx - Ghost Network Masonry Feed
 * 
 * Features:
 * - Masonry grid layout
 * - Category tabs
 * - Infinite scroll
 * - Post cards with hover preview
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Filter, Grid, List, Heart, MessageSquare, 
  Bookmark, Share2, Play, Image, FileText, Cpu,
  Monitor, Gamepad2, BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const springSmooth = { type: "spring", stiffness: 300, damping: 30 };

// Categories
const categories = [
  { id: 'all', label: 'ВСЕ', icon: Grid },
  { id: 'hardware', label: 'ЖЕЛЕЗО', icon: Cpu },
  { id: 'software', label: 'СОФТ', icon: Monitor },
  { id: 'battlestations', label: 'СЕТАПЫ', icon: Gamepad2 },
  { id: 'guides', label: 'ГАЙДЫ', icon: BookOpen }
];

// Post card component
const PostCard = ({ post, onLike, onSave }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasMedia = post.media && post.media.length > 0;
  const isVideo = hasMedia && post.media[0].type === 'video';
  
  return (
    <motion.article
      className={`network-post-card ${hasMedia ? 'has-media' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={springSmooth}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      layout
    >
      {/* Media */}
      {hasMedia && (
        <div className="post-media">
          {isVideo ? (
            <>
              <video 
                src={post.media[0].thumbnail_url || post.media[0].url}
                muted
                loop
                autoPlay={isHovered}
                playsInline
              />
              <div className="media-badge video">
                <Play size={12} />
              </div>
            </>
          ) : (
            <img 
              src={post.media[0].url} 
              alt={post.title}
              loading="lazy"
            />
          )}
          
          {/* Hover overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="media-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="overlay-stats">
                  <span><Heart size={14} /> {post.likes}</span>
                  <span><MessageSquare size={14} /> {post.comments_count}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Content */}
      <div className="post-content">
        {/* Author */}
        <div className="post-author">
          <div className="author-avatar">
            {post.user_avatar ? (
              <img src={post.user_avatar} alt={post.username} />
            ) : (
              <span>{post.username?.[0]?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div className="author-info">
            <span className="author-name">{post.username}</span>
            <span className="author-level">LVL {post.user_level || 1}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="post-title">{post.title}</h3>
        
        {/* Preview text (if no media) */}
        {!hasMedia && post.content && (
          <p className="post-preview">
            {post.content.substring(0, 120)}...
          </p>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="post-tag">#{tag}</span>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="post-actions">
          <button 
            className={`action-btn ${post.is_liked ? 'active' : ''}`}
            onClick={() => onLike(post.id)}
          >
            <Heart size={16} fill={post.is_liked ? 'currentColor' : 'none'} />
            <span>{post.likes || 0}</span>
          </button>
          
          <button className="action-btn">
            <MessageSquare size={16} />
            <span>{post.comments_count || 0}</span>
          </button>
          
          <button 
            className={`action-btn ${post.is_saved ? 'active' : ''}`}
            onClick={() => onSave(post.id)}
          >
            <Bookmark size={16} fill={post.is_saved ? 'currentColor' : 'none'} />
          </button>
          
          <button className="action-btn">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default function NetworkFeed() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('hot');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch posts
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort
      });
      
      if (category !== 'all') {
        params.append('category', category);
      }
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_URL}/api/network/feed?${params}`, { headers });
      const data = await res.json();
      
      if (reset) {
        setPosts(data.posts || []);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      
      setHasMore(data.has_more || false);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [category, sort, page, token]);
  
  // Initial load
  useEffect(() => {
    fetchPosts(true);
  }, [category, sort]);
  
  // Like handler
  const handleLike = async (postId) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/network/post/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes: data.likes, is_liked: data.action === 'liked' }
            : p
        ));
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };
  
  // Save handler
  const handleSave = async (postId) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/network/post/${postId}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, saves_count: data.saves, is_saved: data.action === 'saved' }
            : p
        ));
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };
  
  // Load more
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchPosts();
    }
  };

  return (
    <div className="network-feed" data-testid="network-feed">
      {/* Header */}
      <header className="feed-header">
        <div className="feed-title-row">
          <h1>THE NETWORK</h1>
          
          {user && user.level >= 5 && (
            <motion.button 
              className="create-post-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              <span>СОЗДАТЬ</span>
            </motion.button>
          )}
        </div>
        
        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`category-tab ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Sort Options */}
        <div className="sort-options">
          <button 
            className={`sort-btn ${sort === 'hot' ? 'active' : ''}`}
            onClick={() => setSort('hot')}
          >
            🔥 HOT
          </button>
          <button 
            className={`sort-btn ${sort === 'new' ? 'active' : ''}`}
            onClick={() => setSort('new')}
          >
            ✨ NEW
          </button>
          <button 
            className={`sort-btn ${sort === 'top' ? 'active' : ''}`}
            onClick={() => setSort('top')}
          >
            👑 TOP
          </button>
        </div>
      </header>
      
      {/* Masonry Grid */}
      <div className="feed-masonry">
        <AnimatePresence>
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              onLike={handleLike}
              onSave={handleSave}
            />
          ))}
        </AnimatePresence>
        
        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div className="feed-empty">
            <FileText size={48} />
            <h3>Пока пусто</h3>
            <p>Будь первым, кто создаст пост!</p>
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="feed-loading">
            <div className="loading-spinner" />
          </div>
        )}
      </div>
      
      {/* Load More */}
      {hasMore && !loading && posts.length > 0 && (
        <button className="load-more-btn" onClick={loadMore}>
          Загрузить ещё
        </button>
      )}
    </div>
  );
}
