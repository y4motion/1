/**
 * ControlStrip.jsx - Ghost OS Control Panel
 * 
 * Contains:
 * - Zen Mode Toggle (left)
 * - Sonic Tuner (right)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ZenModeToggle } from './ZenModeToggle';
import { SonicTuner } from './SonicTuner';

const springSmooth = { type: "spring", stiffness: 300, damping: 30 };

export const ControlStrip = ({ className = '' }) => {
  return (
    <motion.div 
      className={`control-strip ${className}`}
      data-testid="control-strip"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSmooth, delay: 0.3 }}
    >
      <div className="control-strip-inner">
        {/* Left: Zen Mode */}
        <div className="control-section control-left">
          <ZenModeToggle />
        </div>
        
        {/* Center: System Status (optional) */}
        <div className="control-section control-center">
          <span className="system-time">
            {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {/* Right: Sonic Tuner */}
        <div className="control-section control-right">
          <SonicTuner />
        </div>
      </div>
    </motion.div>
  );
};

export default ControlStrip;
