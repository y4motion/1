/**
 * NeuralHub.jsx - THE NEURAL INTERFACE
 * 
 * Replaces traditional dropdown menu with an immersive overlay.
 * Style: Vision Pro UX + Death Stranding + NieR: Automata
 * 
 * Features:
 * - Full-screen focus mode overlay
 * - Radial node layout expanding from trigger point
 * - Context-aware smart actions
 * - Animated system vitals
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Settings, Bell, Mail, BookMarked, 
  Users, Power, Zap, Shield, Activity,
  Package, Gift, Target, Trophy, Wallet,
  ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

// System Vitals Component - RP Bar + Entropy
const SystemVitals = ({ rp = 2450, maxRp = 5000, entropy = 0.23 }) => {
  return (
    <div className="system-vitals" style={{ padding: '12px 0' }}>
      {/* RP (Resonance Points) Bar */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          letterSpacing: '1px'
        }}>
          <span style={{ opacity: 0.5 }}>RP.RESONANCE</span>
          <span style={{ opacity: 0.7 }}>{rp}/{maxRp}</span>
        </div>
        <div style={{
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '0',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(rp/maxRp) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
            }}
          />
          {/* Entropy noise overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,${entropy * 0.5}) 2px,
              rgba(0,0,0,${entropy * 0.5}) 4px
            )`,
            animation: 'noiseShift 0.5s steps(5) infinite',
          }}/>
        </div>
      </div>
      
      {/* Entropy indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '9px',
        fontFamily: 'monospace',
        opacity: 0.5
      }}>
        <Activity size={10} />
        <span>ENTROPY: {(entropy * 100).toFixed(0)}%</span>
        <div style={{
          flex: 1,
          height: '1px',
          background: `linear-gradient(90deg, rgba(255,255,255,0.3) ${entropy * 100}%, transparent ${entropy * 100}%)`
        }}/>
      </div>
    </div>
  );
};

// Smart Action Button - Context-aware
const SmartAction = ({ icon: Icon, label, subLabel, onClick, pulse, badge }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        color: 'white',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* Pulse indicator */}
      {pulse && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            background: '#FF0000',
          }}
        />
      )}
      
      <div style={{
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '500',
          letterSpacing: '0.5px',
          marginBottom: '2px'
        }}>
          {label}
        </div>
        {subLabel && (
          <div style={{ 
            fontSize: '10px', 
            opacity: 0.5,
            fontFamily: 'monospace'
          }}>
            {subLabel}
          </div>
        )}
      </div>
      
      {badge && (
        <span style={{
          padding: '2px 8px',
          background: badge === 'NEW' ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${badge === 'NEW' ? 'rgba(255,0,0,0.3)' : 'rgba(255,255,255,0.15)'}`,
          fontSize: '9px',
          fontFamily: 'monospace',
          letterSpacing: '1px',
        }}>
          {badge}
        </span>
      )}
      
      <ChevronRight size={14} style={{ opacity: 0.3 }} />
    </motion.button>
  );
};

// Mini Profile Card
const MiniProfile = ({ user, level, className: userClass }) => {
  const trustColor = level > 5 ? '#4CAF50' : level > 3 ? '#FFC107' : '#F44336';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '16px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Avatar with resonance ring */}
      <div style={{ position: 'relative' }}>
        <motion.div
          animate={{ 
            boxShadow: [
              `0 0 20px ${trustColor}40`,
              `0 0 30px ${trustColor}60`,
              `0 0 20px ${trustColor}40`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${trustColor}40, ${trustColor}20)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            border: `2px solid ${trustColor}`,
          }}
        >
          {user?.avatar || '👤'}
        </motion.div>
        
        {/* Online pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#4CAF50',
            border: '2px solid #050505',
          }}
        />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '15px', 
          fontWeight: '600',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {user?.username || 'OPERATOR'}
          <span style={{
            fontSize: '9px',
            padding: '2px 6px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontFamily: 'monospace',
            letterSpacing: '1px',
          }}>
            LVL.{level}
          </span>
        </div>
        <div style={{ 
          fontSize: '10px', 
          opacity: 0.5,
          fontFamily: 'monospace',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          CLASS: {userClass || 'UNDEFINED'}
        </div>
      </div>
    </div>
  );
};

// Main Neural Hub Component
export const NeuralHub = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, t } = useLanguage();
  const hubRef = useRef(null);
  
  // Smart context detection
  const [contextActions, setContextActions] = useState([]);
  
  useEffect(() => {
    // Determine context-aware actions based on current page
    const actions = [];
    
    if (location.pathname.includes('/product/')) {
      actions.push({ icon: Package, label: 'SELL SIMILAR', subLabel: 'List your item' });
    }
    
    // Check for unclaimed rewards (mock)
    const hasUnclaimedRewards = true;
    if (hasUnclaimedRewards) {
      actions.push({ 
        icon: Gift, 
        label: 'CLAIM REWARDS', 
        subLabel: '3 items available',
        pulse: true,
        badge: 'NEW'
      });
    }
    
    // Check for incomplete daily log
    const dailyLogComplete = false;
    if (!dailyLogComplete) {
      actions.push({ 
        icon: Target, 
        label: 'DAILY LOG', 
        subLabel: '2/5 completed',
        pulse: true 
      });
    }
    
    setContextActions(actions);
  }, [location]);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hubRef.current && !hubRef.current.contains(e.target)) {
        if (triggerRef?.current && !triggerRef.current.contains(e.target)) {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scroll
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, triggerRef]);
  
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Focus Mode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 9998,
            }}
            onClick={onClose}
          />
          
          {/* Neural Hub Panel */}
          <motion.div
            ref={hubRef}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            style={{
              position: 'fixed',
              top: '80px',
              left: '24px',
              width: '340px',
              maxHeight: 'calc(100vh - 120px)',
              background: 'rgba(10, 10, 10, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              zIndex: 9999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: '"SF Mono", "JetBrains Mono", monospace',
              color: 'white',
            }}
            data-testid="neural-hub"
          >
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '2px',
                opacity: 0.5,
              }}>
                NEURAL.HUB v1.0
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: 0.5,
                  padding: '4px',
                }}
              >
                <X size={16} />
              </motion.button>
            </div>
            
            {/* Mini Profile */}
            <MiniProfile 
              user={user || { username: 'GHOST_USER', avatar: '👻' }}
              level={7}
              className="ARCHITECT"
            />
            
            {/* System Vitals */}
            <div style={{ padding: '0 16px' }}>
              <SystemVitals rp={2450} maxRp={5000} entropy={0.23} />
            </div>
            
            {/* Context Actions (Smart Grid) */}
            {contextActions.length > 0 && (
              <div style={{ 
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  fontSize: '9px',
                  letterSpacing: '2px',
                  opacity: 0.4,
                  marginBottom: '10px',
                }}>
                  CONTEXT.ACTIONS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {contextActions.map((action, i) => (
                    <SmartAction 
                      key={i}
                      {...action}
                      onClick={() => handleNavigate('/profile')}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Navigation Items */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                fontSize: '9px',
                letterSpacing: '2px',
                opacity: 0.4,
                marginBottom: '10px',
              }}>
                NAVIGATION
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <SmartAction 
                  icon={User} 
                  label="OPERATOR DOSSIER" 
                  subLabel="View full profile"
                  onClick={() => handleNavigate('/profile')}
                />
                <SmartAction 
                  icon={Bell} 
                  label="NOTIFICATIONS" 
                  subLabel="19 unread"
                  badge="19"
                  onClick={() => handleNavigate('/notifications')}
                />
                <SmartAction 
                  icon={Mail} 
                  label="MESSAGES" 
                  subLabel="3 new"
                  onClick={() => handleNavigate('/chat')}
                />
                <SmartAction 
                  icon={Wallet} 
                  label="INVENTORY" 
                  subLabel="12 items"
                  onClick={() => handleNavigate('/inventory')}
                />
                <SmartAction 
                  icon={Trophy} 
                  label="ACHIEVEMENTS" 
                  subLabel="7/24 unlocked"
                  onClick={() => handleNavigate('/profile?tab=achievements')}
                />
                <SmartAction 
                  icon={Shield} 
                  label="TRUST SCORE" 
                  subLabel="Level 7 · VERIFIED"
                  onClick={() => handleNavigate('/profile?tab=trust')}
                />
                <SmartAction 
                  icon={Settings} 
                  label="SYSTEM CONFIG" 
                  onClick={() => handleNavigate('/settings')}
                />
              </div>
            </div>
            
            {/* Footer - Logout */}
            {isAuthenticated && (
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                <motion.button
                  onClick={() => { logout(); onClose(); }}
                  whileHover={{ backgroundColor: 'rgba(255,0,0,0.1)' }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    letterSpacing: '2px',
                    fontFamily: 'inherit',
                  }}
                >
                  <Power size={14} />
                  DISCONNECT
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NeuralHub;
