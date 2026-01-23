/**
 * KineticWidget.jsx
 * Base "Floating Island" component for Kinetic Dot-OS
 * 
 * Style: Nothing aesthetics + Howard.le spring physics
 */

import React from 'react';
import { motion } from 'framer-motion';
import './kinetic.css';

// Spring physics config
export const springConfig = {
  type: "spring",
  stiffness: 250,
  damping: 25,
  mass: 1
};

export const springBouncy = {
  type: "spring",
  stiffness: 400,
  damping: 20
};

// Base Floating Island Widget
export const KineticWidget = ({
  children,
  className = '',
  delay = 0,
  hover = true,
  glow = false,
  onClick,
  style = {}
}) => {
  return (
    <motion.div
      className={`kinetic-widget ${glow ? 'with-glow' : ''} ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springConfig, delay }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -4,
        transition: springBouncy
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      style={style}
    >
      {children}
      
      {/* Recording dot indicator */}
      <div className="recording-dot" />
    </motion.div>
  );
};

// Dot Matrix Text component
export const DotText = ({ 
  children, 
  size = 'md', 
  color = 'default',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'dot-text-xs',
    sm: 'dot-text-sm',
    md: 'dot-text-md',
    lg: 'dot-text-lg',
    xl: 'dot-text-xl'
  };
  
  const colorClasses = {
    default: '',
    muted: 'dot-text-muted',
    accent: 'dot-text-accent',
    amber: 'dot-text-amber'
  };
  
  return (
    <span className={`dot-text ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};

// Status Indicator
export const StatusDot = ({ status = 'online', label }) => {
  const colors = {
    online: '#00FF00',
    offline: '#FF0000',
    idle: '#FFAA00',
    sync: '#00FFD4'
  };
  
  return (
    <div className="status-indicator">
      <span 
        className="status-dot-ping"
        style={{ '--status-color': colors[status] }}
      />
      <span 
        className="status-dot-core"
        style={{ backgroundColor: colors[status] }}
      />
      {label && <span className="status-label">{label}</span>}
    </div>
  );
};

// Dotted Progress Bar
export const DottedProgress = ({ 
  value = 0, 
  max = 100, 
  color = 'white',
  showValue = true,
  label = ''
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="dotted-progress">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-track">
        <div 
          className="progress-fill"
          style={{ 
            width: `${percent}%`,
            '--progress-color': color
          }}
        />
      </div>
      {showValue && (
        <span className="progress-value">{Math.round(percent)}%</span>
      )}
    </div>
  );
};

// Expand Button (↗)
export const ExpandButton = ({ onClick, size = 'md' }) => {
  const sizes = { sm: 24, md: 32, lg: 40 };
  
  return (
    <motion.button
      className="expand-button"
      onClick={onClick}
      whileHover={{ scale: 1.1, rotate: 45 }}
      whileTap={{ scale: 0.9 }}
      style={{ width: sizes[size], height: sizes[size] }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 17L17 7M17 7H7M17 7V17" />
      </svg>
    </motion.button>
  );
};

export default KineticWidget;
