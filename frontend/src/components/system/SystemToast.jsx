/**
 * SystemToast.jsx
 * Ghost Protocol - System Voice
 * 
 * Monospace toast notifications with "decoding" text effect.
 * Style: Black rectangle, thin white border, typewriter reveal.
 * Audio: Integrated with SystemAudio for immersive feedback.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playToastClick, playAccessGranted, playAccessDenied } from './SystemAudio';
import './SystemToast.css';

// Toast types with their visual config
const TOAST_TYPES = {
  info: {
    prefix: 'SYS',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textColor: 'var(--ghost-text-soft, rgba(255,255,255,0.7))'
  },
  success: {
    prefix: 'CONFIRM',
    borderColor: 'var(--ghost-cyan, #00FFD4)',
    textColor: 'var(--ghost-cyan, #00FFD4)'
  },
  warning: {
    prefix: 'ALERT',
    borderColor: 'var(--ghost-amber, #FF9F43)',
    textColor: 'var(--ghost-amber, #FF9F43)'
  },
  error: {
    prefix: 'ERROR',
    borderColor: 'var(--halo-danger, #FF4444)',
    textColor: 'var(--halo-danger, #FF4444)'
  },
  xp: {
    prefix: 'XP',
    borderColor: 'var(--ghost-cyan, #00FFD4)',
    textColor: 'var(--ghost-cyan, #00FFD4)'
  },
  rp: {
    prefix: 'RP',
    borderColor: 'var(--ghost-amber, #FF9F43)',
    textColor: 'var(--ghost-amber, #FF9F43)'
  },
  trust: {
    prefix: 'TRUST',
    borderColor: 'var(--ghost-void-blue, #2E5CFF)',
    textColor: 'var(--ghost-void-blue, #2E5CFF)'
  },
  access: {
    prefix: 'ACCESS',
    borderColor: 'var(--ghost-cyan, #00FFD4)',
    textColor: 'var(--ghost-cyan, #00FFD4)'
  },
  denied: {
    prefix: 'DENIED',
    borderColor: 'var(--halo-danger, #FF4444)',
    textColor: 'var(--halo-danger, #FF4444)'
  }
};

// Decoding characters for the scramble effect
const DECODE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEF';

// Single Toast component with decoding effect
const Toast = ({ id, message, type = 'info', onRemove }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDecoding, setIsDecoding] = useState(true);
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const fullText = `${config.prefix}: ${message}`;

  // Decoding animation effect
  useEffect(() => {
    let frame = 0;
    const totalFrames = fullText.length * 3; // 3 frames per character
    
    const decode = () => {
      frame++;
      const progress = Math.min(frame / 3, fullText.length);
      const revealedCount = Math.floor(progress);
      
      let result = fullText.substring(0, revealedCount);
      
      // Add scrambled characters for unrevealed portion
      if (revealedCount < fullText.length) {
        const scrambleCount = Math.min(3, fullText.length - revealedCount);
        for (let i = 0; i < scrambleCount; i++) {
          result += DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
        }
      }
      
      setDisplayText(result);
      
      if (frame < totalFrames) {
        requestAnimationFrame(decode);
      } else {
        setDisplayText(fullText);
        setIsDecoding(false);
      }
    };
    
    decode();
  }, [fullText]);

  // Auto-remove after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <motion.div
      className="system-toast"
      style={{
        '--toast-border': config.borderColor,
        '--toast-text': config.textColor
      }}
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      data-testid="system-toast"
    >
      <div className="toast-scan-line" />
      <span className={`toast-text ${isDecoding ? 'decoding' : ''}`}>
        {displayText}
        {isDecoding && <span className="toast-cursor">_</span>}
      </span>
    </motion.div>
  );
};

// Toast Container & Context
let toastIdCounter = 0;
let addToastExternal = null;

export const SystemToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]); // Max 5 toasts
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Expose addToast globally
  useEffect(() => {
    addToastExternal = addToast;
    return () => { addToastExternal = null; };
  }, [addToast]);

  return (
    <div className="system-toast-container" data-testid="toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onRemove={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Global toast function
export const systemToast = (message, type = 'info') => {
  if (addToastExternal) {
    return addToastExternal(message, type);
  }
  console.warn('SystemToastContainer not mounted');
};

// Convenience methods
systemToast.info = (msg) => systemToast(msg, 'info');
systemToast.success = (msg) => systemToast(msg, 'success');
systemToast.warning = (msg) => systemToast(msg, 'warning');
systemToast.error = (msg) => systemToast(msg, 'error');
systemToast.xp = (amount) => systemToast(`GENERATED: +${amount}`, 'xp');
systemToast.rp = (amount) => systemToast(`ACQUIRED: +${amount}`, 'rp');
systemToast.trust = (msg) => systemToast(msg, 'trust');
systemToast.access = (msg) => systemToast(msg, 'access');
systemToast.denied = (msg) => systemToast(msg, 'denied');

export default SystemToastContainer;
