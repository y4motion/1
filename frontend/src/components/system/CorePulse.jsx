/**
 * CorePulse.jsx - THE SYSTEM CORE
 * 
 * The logo button that "breathes" and opens the Neural Hub.
 * Visual indicator of system status and user trust level.
 */

import React, { useState, useRef, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Power } from 'lucide-react';
import NeuralHub from './NeuralHub';

// Trust level colors
const TRUST_COLORS = {
  low: '#F44336',      // Red
  medium: '#FFC107',   // Yellow
  high: '#4CAF50',     // Green
  elite: '#9C27B0',    // Purple
  legendary: '#00BCD4' // Cyan
};

const getTrustColor = (trustLevel) => {
  if (trustLevel >= 9) return TRUST_COLORS.legendary;
  if (trustLevel >= 7) return TRUST_COLORS.elite;
  if (trustLevel >= 5) return TRUST_COLORS.high;
  if (trustLevel >= 3) return TRUST_COLORS.medium;
  return TRUST_COLORS.low;
};

export const CorePulse = forwardRef(({ trustLevel = 7, hasNotifications = true }, ref) => {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const buttonRef = useRef(null);
  
  const color = getTrustColor(trustLevel);
  
  return (
    <>
      <motion.button
        ref={(node) => {
          buttonRef.current = node;
          if (ref) {
            if (typeof ref === 'function') ref(node);
            else ref.current = node;
          }
        }}
        onClick={() => setIsHubOpen(!isHubOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        data-testid="core-pulse-button"
      >
        {/* Outer pulse ring */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            pointerEvents: 'none',
          }}
        />
        
        {/* Inner glow */}
        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
            boxShadow: [
              `0 0 10px ${color}40`,
              `0 0 20px ${color}60`,
              `0 0 10px ${color}40`
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        
        {/* Icon */}
        <Power 
          size={22} 
          strokeWidth={2}
          style={{ 
            color: 'white',
            position: 'relative',
            zIndex: 1,
          }} 
        />
        
        {/* Notification dot */}
        {hasNotifications && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#FF0000',
              border: '2px solid #050505',
            }}
          />
        )}
      </motion.button>
      
      {/* Neural Hub */}
      <NeuralHub 
        isOpen={isHubOpen} 
        onClose={() => setIsHubOpen(false)}
        triggerRef={buttonRef}
      />
    </>
  );
});

CorePulse.displayName = 'CorePulse';

export default CorePulse;
