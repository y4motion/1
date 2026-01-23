/**
 * LiveTicker.jsx
 * Compact news widget with fade-up animation
 * 1/3 width, expandable, lines float up and dissolve
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ChevronDown, ChevronUp } from 'lucide-react';

const MOCK_NEWS = [
  { id: 1, text: "НОВЫЙ DROP: VOID KEYCAPS УЖЕ В ПРОДАЖЕ" },
  { id: 2, text: "MINIMAL OS 2.1 — ОБНОВЛЕНИЕ ДОСТУПНО" },
  { id: 3, text: "COMMUNITY: 15K BUILDERS ПРИСОЕДИНИЛИСЬ" },
  { id: 4, text: "GLASSY SWAP: НОВЫЕ МОДЕЛИ ДЛЯ ОБМЕНА" },
  { id: 5, text: "ROADMAP Q1 2025: ГОЛОСОВАНИЕ ОТКРЫТО" },
];

export const LiveTicker = ({ 
  items = MOCK_NEWS,
  interval = 4000,
  onItemClick,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [key, setKey] = useState(0);

  // Auto-rotate through items
  useEffect(() => {
    if (isExpanded) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
      setKey(prev => prev + 1);
    }, interval);
    
    return () => clearInterval(timer);
  }, [items.length, interval, isExpanded]);

  const currentItem = items[currentIndex];

  return (
    <div className={`live-ticker-compact ${isExpanded ? 'expanded' : ''} ${className}`}>
      <style>{`
        .live-ticker-compact {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .live-ticker-compact:hover {
          border-color: rgba(255,255,255,0.08);
        }
        
        .ticker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
        }
        
        .ticker-label-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .ticker-dot {
          width: 6px;
          height: 6px;
          background: #ff3b3b;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .ticker-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.4);
        }
        
        .ticker-expand-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.25);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        
        .ticker-expand-btn:hover {
          color: rgba(255,255,255,0.5);
        }
        
        /* Single item view */
        .ticker-single {
          height: 40px;
          position: relative;
          overflow: hidden;
          padding: 0 16px;
        }
        
        .ticker-item-float {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.05em;
          padding: 0 16px;
          cursor: pointer;
        }
        
        .ticker-item-float:hover {
          color: rgba(255,255,255,0.7);
        }
        
        /* Expanded list view */
        .ticker-list {
          padding: 0 16px 12px;
        }
        
        .ticker-list-item {
          padding: 10px 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .ticker-list-item:last-child {
          border-bottom: none;
        }
        
        .ticker-list-item:hover {
          color: rgba(255,255,255,0.7);
        }
        
        .ticker-list-item.active {
          color: rgba(255,255,255,0.6);
        }
      `}</style>

      {/* Header */}
      <div className="ticker-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ticker-label-group">
          <div className="ticker-dot" />
          <span className="ticker-title">LIVE</span>
        </div>
        <button className="ticker-expand-btn">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Content */}
      {!isExpanded ? (
        // Single floating item
        <div className="ticker-single">
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              className="ticker-item-float"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, filter: 'blur(4px)' }}
              transition={{ 
                duration: 0.6,
                exit: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
              }}
              onClick={() => onItemClick?.(currentItem)}
            >
              {currentItem?.text}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        // Expanded list
        <div className="ticker-list">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`ticker-list-item ${i === currentIndex ? 'active' : ''}`}
              onClick={() => onItemClick?.(item)}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveTicker;
