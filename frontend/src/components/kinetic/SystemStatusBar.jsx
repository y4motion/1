/**
 * SystemStatusBar.jsx - Live Activity + Trending Combined
 * 
 * Combines:
 * - LiveActivityFeed (left) - real-time purchases
 * - TrendingChips (right) - hot search terms
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wifi, TrendingUp, ShoppingCart, Eye, Heart } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Activity icons
const getActivityIcon = (type) => {
  const icons = { purchase: ShoppingCart, view: Eye, cart: Heart };
  return icons[type] || Eye;
};

// Format time ago
const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (seconds < 30) return 'сейчас';
  if (seconds < 60) return `${seconds}с`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}м`;
  return `${Math.floor(minutes / 60)}ч`;
};

export const SystemStatusBar = ({ className = '' }) => {
  const [activities, setActivities] = useState([]);
  const [trending, setTrending] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  
  // Fetch live data
  const fetchData = useCallback(async () => {
    try {
      // Activity feed
      const actRes = await fetch(`${API_URL}/api/activity/feed?limit=5`);
      if (actRes.ok) {
        const data = await actRes.json();
        setActivities(data);
      }
      
      // Online count
      const onlineRes = await fetch(`${API_URL}/api/activity/online`);
      if (onlineRes.ok) {
        const data = await onlineRes.json();
        setOnlineCount(data.online_count || 0);
      }
      
      // Trending
      const trendRes = await fetch(`${API_URL}/api/homepage/trending-searches?limit=5`);
      if (trendRes.ok) {
        const data = await trendRes.json();
        setTrending(data);
      }
    } catch (err) {
      // Use fallback data
      setActivities([
        { id: 1, type: 'purchase', user: { name: 'voidwalker' }, product: { name: 'RTX 5090' }, timestamp: new Date() },
        { id: 2, type: 'view', user: { name: 'darknode' }, product: { name: 'Ryzen 9' }, timestamp: new Date(Date.now() - 60000) }
      ]);
      setTrending([
        { id: 1, name: 'RTX 5090', growth: '+156%' },
        { id: 2, name: 'Ryzen 9', growth: '+89%' },
        { id: 3, name: 'DDR5', growth: '+67%' }
      ]);
      setOnlineCount(234);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <motion.div 
      className={`system-status-bar ${className}`}
      data-testid="system-status-bar"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Left: Live Activity */}
      <div className="status-left">
        <div className="status-indicator">
          <span className="live-dot" />
          <Wifi size={12} />
          <span className="online-count">{onlineCount}</span>
        </div>
        
        <div className="activity-ticker">
          {activities.slice(0, 3).map((activity, i) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <motion.div 
                key={activity.id || i}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Icon size={12} />
                <span className="activity-user">{activity.user?.name}</span>
                <span className="activity-action">
                  {activity.type === 'purchase' ? 'купил' : 'смотрит'}
                </span>
                <span className="activity-product">{activity.product?.name}</span>
                <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Right: Trending */}
      <div className="status-right">
        <div className="trending-label">
          <TrendingUp size={12} />
          <span>HOT</span>
        </div>
        
        <div className="trending-chips">
          {trending.slice(0, 4).map((item, i) => (
            <motion.a
              key={item.id || i}
              href={`/marketplace?search=${encodeURIComponent(item.name)}`}
              className="trend-chip"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="trend-name">{item.name}</span>
              <span className="trend-growth">{item.growth}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SystemStatusBar;
