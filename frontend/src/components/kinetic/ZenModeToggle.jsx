/**
 * ZenModeToggle.jsx - Zen Mode Switch
 * 
 * When enabled:
 * - Hides noisy sections (categories, deals, news)
 * - Keeps: Hero, App Grid, Core widgets
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useGhostStore } from '../../stores/useGhostStore';

export const ZenModeToggle = ({ className = '' }) => {
  const { isZenMode, toggleZenMode } = useGhostStore();
  
  return (
    <motion.button
      className={`zen-toggle ${isZenMode ? 'active' : ''} ${className}`}
      data-testid="zen-mode-toggle"
      onClick={toggleZenMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
    >
      <motion.div
        className="zen-icon"
        animate={{ rotate: isZenMode ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isZenMode ? <EyeOff size={16} /> : <Eye size={16} />}
      </motion.div>
      <span className="zen-label">
        {isZenMode ? 'ZEN' : 'FOCUS'}
      </span>
      <div className={`zen-indicator ${isZenMode ? 'on' : ''}`} />
    </motion.button>
  );
};

export default ZenModeToggle;
