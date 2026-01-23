/**
 * TelemetryBar.jsx - System Metrics (Bottom)
 * 
 * Shows running stats like a terminal:
 * - LIVE.NODES (online users)
 * - PRODUCTS (total indexed)
 * - XP.GENERATED (total)
 * - TRADES.TODAY
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGhostStore } from '../../stores/useGhostStore';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Animated number component
const AnimatedNumber = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    // Simple animation: count up to new value
    const start = displayValue;
    const end = value;
    const duration = 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };
  
  return <span className="telemetry-value">{formatNumber(displayValue)}{suffix}</span>;
};

export const TelemetryBar = ({ className = '' }) => {
  const { telemetry, setTelemetry } = useGhostStore();
  const [isFlashing, setIsFlashing] = useState({});
  
  // Fetch telemetry data
  const fetchTelemetry = useCallback(async () => {
    try {
      // Online count
      const onlineRes = await fetch(`${API_URL}/api/activity/online`);
      if (onlineRes.ok) {
        const data = await onlineRes.json();
        if (data.online_count !== telemetry.liveNodes) {
          setIsFlashing(prev => ({ ...prev, liveNodes: true }));
          setTimeout(() => setIsFlashing(prev => ({ ...prev, liveNodes: false })), 500);
        }
        setTelemetry({ liveNodes: data.online_count || 0 });
      }
      
      // Other metrics would come from analytics API
      // For now, use mock data that slowly increases
      setTelemetry({
        totalProducts: 15402 + Math.floor(Math.random() * 10),
        totalXP: 8423156 + Math.floor(Math.random() * 1000),
        tradesToday: 234 + Math.floor(Math.random() * 5)
      });
    } catch (err) {
      // Fallback
      setTelemetry({
        liveNodes: 234,
        totalProducts: 15402,
        totalXP: 8423156,
        tradesToday: 234
      });
    }
  }, [telemetry.liveNodes, setTelemetry]);
  
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);
  
  const metrics = [
    { key: 'liveNodes', label: 'LIVE.NODES', value: telemetry.liveNodes },
    { key: 'totalProducts', label: 'PRODUCTS.INDEXED', value: telemetry.totalProducts },
    { key: 'totalXP', label: 'XP.GENERATED', value: telemetry.totalXP },
    { key: 'tradesToday', label: 'TRADES.TODAY', value: telemetry.tradesToday }
  ];

  return (
    <motion.div 
      className={`telemetry-bar ${className}`}
      data-testid="telemetry-bar"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
    >
      <div className="telemetry-inner">
        <span className="telemetry-prefix">SYS.TELEMETRY://</span>
        
        {metrics.map((metric, i) => (
          <div 
            key={metric.key}
            className={`telemetry-metric ${isFlashing[metric.key] ? 'flash' : ''}`}
          >
            <span className="telemetry-label">{metric.label}:</span>
            <AnimatedNumber value={metric.value} />
            {i < metrics.length - 1 && <span className="telemetry-sep">│</span>}
          </div>
        ))}
        
        <span className="telemetry-cursor">█</span>
      </div>
    </motion.div>
  );
};

export default TelemetryBar;
