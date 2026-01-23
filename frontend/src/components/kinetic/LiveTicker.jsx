/**
 * LiveTicker.jsx
 * Running news ticker with Dot Matrix style
 * Stops on hover, Nothing aesthetics
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KineticWidget } from './KineticWidget';

const MOCK_NEWS = [
  { id: 1, text: "НОВЫЙ DROP: VOID KEYCAPS УЖЕ В ПРОДАЖЕ" },
  { id: 2, text: "MINIMAL OS 2.1 — ОБНОВЛЕНИЕ ДОСТУПНО" },
  { id: 3, text: "COMMUNITY: 15K BUILDERS ПРИСОЕДИНИЛИСЬ" },
  { id: 4, text: "GLASSY SWAP: НОВЫЕ МОДЕЛИ ДЛЯ ОБМЕНА" },
  { id: 5, text: "ROADMAP Q1 2025: ГОЛОСОВАНИЕ ОТКРЫТО" },
];

export const LiveTicker = ({ 
  items = MOCK_NEWS,
  speed = 30,
  onItemClick,
  className = ''
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Duplicate items for seamless loop
  const allItems = [...items, ...items];
  
  return (
    <KineticWidget 
      className={`live-ticker-widget ${className}`}
      hover={false}
    >
      <div className="live-ticker">
        <div className="ticker-label">
          LIVE FEED
        </div>
        
        <div 
          className="ticker-track"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => { setIsPaused(false); setHoveredItem(null); }}
        >
          <motion.div 
            className="ticker-content"
            animate={{ x: isPaused ? 0 : '-50%' }}
            transition={{
              x: {
                duration: speed,
                repeat: Infinity,
                ease: 'linear',
                repeatType: 'loop'
              }
            }}
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {allItems.map((item, i) => (
              <React.Fragment key={`${item.id}-${i}`}>
                <motion.span
                  className="ticker-item"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onClick={() => onItemClick?.(item)}
                  whileHover={{ scale: 1.02 }}
                >
                  {item.text}
                </motion.span>
                {i < allItems.length - 1 && (
                  <span className="ticker-separator">•</span>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
    </KineticWidget>
  );
};

export default LiveTicker;
