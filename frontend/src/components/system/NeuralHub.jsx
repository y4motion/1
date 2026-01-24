/**
 * NeuralHub.jsx - THE NEURAL INTERFACE v2.0
 * 
 * SPATIAL UI - Floating Holographic Panel
 * Style: Death Stranding PDA / Iron Man HUD
 * 
 * NOT a sidebar. A floating island that appears in space.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Settings, Bell, Mail, 
  Package, Gift, Target, Trophy, Wallet,
  Shield, Activity, ChevronRight, X,
  Cpu, Zap, Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

// System Vitals - Compact with noise effect
const SystemVitals = ({ rp = 2450, maxRp = 5000, entropy = 0.23 }) => (
  <div style={{ padding: '16px 0' }}>
    <div style={{ marginBottom: '12px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '6px',
        fontSize: '9px',
        fontFamily: 'monospace',
        letterSpacing: '2px',
        opacity: 0.4
      }}>
        <span>RP.RESONANCE</span>
        <span>{rp}/{maxRp}</span>
      </div>
      <div style={{
        height: '3px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(rp/maxRp) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
          }}
        />
      </div>
    </div>
    
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '9px',
      fontFamily: 'monospace',
      opacity: 0.3,
      letterSpacing: '1px'
    }}>
      <Activity size={10} />
      <span>ENTROPY: {(entropy * 100).toFixed(0)}%</span>
    </div>
  </div>
);

// Navigation Item - Large with hover slide
const NavItem = ({ icon: Icon, label, subLabel, onClick, badge, pulse }) => (
  <motion.button
    onClick={onClick}
    initial={false}
    whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.98 }}
    style={{
      width: '100%',
      padding: '16px 20px',
      background: 'transparent',
      border: 'none',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: 'pointer',
      color: 'white',
      textAlign: 'left',
      position: 'relative',
      fontFamily: 'inherit',
      transition: 'background 0.2s ease',
    }}
  >
    {/* Pulse indicator for important items */}
    {pulse && (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: '24px',
          background: '#FF3333',
          borderRadius: '2px',
        }}
      />
    )}
    
    <div style={{
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <Icon size={20} strokeWidth={1.5} style={{ opacity: 0.8 }} />
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: '500',
        letterSpacing: '0.5px',
        marginBottom: subLabel ? '4px' : 0
      }}>
        {label}
      </div>
      {subLabel && (
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.4,
          fontFamily: 'monospace',
          letterSpacing: '0.5px'
        }}>
          {subLabel}
        </div>
      )}
    </div>
    
    {badge && (
      <span style={{
        padding: '4px 10px',
        background: badge === 'NEW' ? 'rgba(255,50,50,0.15)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${badge === 'NEW' ? 'rgba(255,50,50,0.3)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: '8px',
        fontSize: '10px',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        color: badge === 'NEW' ? '#FF5555' : 'inherit'
      }}>
        {badge}
      </span>
    )}
    
    <ChevronRight size={16} style={{ opacity: 0.2 }} />
  </motion.button>
);

// Mini Profile - Holographic style
const MiniProfile = ({ user, level, userClass }) => {
  const trustColor = level > 7 ? '#00D4FF' : level > 5 ? '#4CAF50' : level > 3 ? '#FFC107' : '#F44336';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '20px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Avatar with resonance ring */}
      <div style={{ position: 'relative' }}>
        <motion.div
          animate={{ 
            boxShadow: [
              `0 0 20px ${trustColor}30`,
              `0 0 35px ${trustColor}50`,
              `0 0 20px ${trustColor}30`
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${trustColor}20, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            border: `2px solid ${trustColor}60`,
          }}
        >
          {user?.avatar || '👻'}
        </motion.div>
        
        {/* Online indicator */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#4CAF50',
            border: '3px solid rgba(0,0,0,0.9)',
          }}
        />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '600',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {user?.username || 'OPERATOR'}
          <span style={{
            fontSize: '10px',
            padding: '3px 8px',
            background: `${trustColor}20`,
            border: `1px solid ${trustColor}40`,
            borderRadius: '6px',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            color: trustColor,
          }}>
            LVL.{level}
          </span>
        </div>
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.4,
          fontFamily: 'monospace',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          {userClass || 'UNDEFINED'}
        </div>
      </div>
    </div>
  );
};

// Main Neural Hub Component - FLOATING ISLAND
export const NeuralHub = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const hubRef = useRef(null);
  
  // Context actions based on page
  const [contextActions, setContextActions] = useState([]);
  
  useEffect(() => {
    const actions = [];
    
    // Always show rewards if available
    actions.push({ 
      icon: Gift, 
      label: 'CLAIM REWARDS', 
      subLabel: '3 items · DecryptionCube',
      pulse: true,
      badge: 'NEW'
    });
    
    // Daily log reminder
    actions.push({ 
      icon: Target, 
      label: 'DAILY LOG', 
      subLabel: '2/5 completed',
      pulse: true 
    });
    
    setContextActions(actions);
  }, [location]);
  
  // Close handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hubRef.current && !hubRef.current.contains(e.target)) {
        if (triggerRef?.current && !triggerRef.current.contains(e.target)) {
          onClose();
        }
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, triggerRef]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Cinematic blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              zIndex: 9998,
            }}
            onClick={onClose}
          />
          
          {/* FLOATING ISLAND - Neural Hub Panel */}
          <motion.div
            ref={hubRef}
            initial={{ 
              opacity: 0, 
              scale: 0.92, 
              y: 30,
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: 20,
            }}
            transition={{ 
              type: 'spring',
              stiffness: 400,
              damping: 35,
              mass: 0.8
            }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '420px',
              maxHeight: '85vh',
              
              // FLOATING GLASS MATERIAL
              background: 'rgba(8, 8, 8, 0.85)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              
              // SOFT ROUNDED EDGES
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              
              // GLOW EFFECT
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.05),
                0 25px 50px -12px rgba(0, 0, 0, 0.8),
                0 0 80px rgba(0, 200, 255, 0.05)
              `,
              
              zIndex: 9999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              color: 'white',
            }}
            data-testid="neural-hub"
          >
            {/* Header with version */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={14} style={{ opacity: 0.4 }} />
                <span style={{
                  fontSize: '11px',
                  letterSpacing: '3px',
                  opacity: 0.4,
                  fontFamily: 'monospace',
                }}>
                  NEURAL.HUB
                </span>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: 0.6,
                }}
              >
                <X size={14} />
              </motion.button>
            </div>
            
            {/* Mini Profile */}
            <MiniProfile 
              user={user || { username: 'GHOST_USER', avatar: '👻' }}
              level={7}
              userClass="ARCHITECT"
            />
            
            {/* System Vitals */}
            <div style={{ padding: '0 24px' }}>
              <SystemVitals rp={2450} maxRp={5000} entropy={0.23} />
            </div>
            
            {/* Context Actions */}
            {contextActions.length > 0 && (
              <div style={{ 
                padding: '8px 16px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{
                  fontSize: '9px',
                  letterSpacing: '3px',
                  opacity: 0.25,
                  marginBottom: '8px',
                  marginLeft: '8px',
                  fontFamily: 'monospace',
                }}>
                  QUICK.ACTIONS
                </div>
                {contextActions.map((action, i) => (
                  <NavItem 
                    key={i}
                    {...action}
                    onClick={() => handleNavigate('/rewards')}
                  />
                ))}
              </div>
            )}
            
            {/* Navigation */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '8px 16px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{
                fontSize: '9px',
                letterSpacing: '3px',
                opacity: 0.25,
                marginBottom: '8px',
                marginLeft: '8px',
                fontFamily: 'monospace',
              }}>
                NAVIGATION
              </div>
              
              <NavItem 
                icon={User} 
                label="Operator Dossier" 
                subLabel="Full profile"
                onClick={() => handleNavigate('/profile')}
              />
              <NavItem 
                icon={Bell} 
                label="Notifications" 
                subLabel="19 unread"
                badge="19"
                onClick={() => handleNavigate('/notifications')}
              />
              <NavItem 
                icon={Mail} 
                label="Messages" 
                subLabel="3 new"
                onClick={() => handleNavigate('/chat')}
              />
              <NavItem 
                icon={Wallet} 
                label="Inventory" 
                subLabel="12 items"
                onClick={() => handleNavigate('/inventory')}
              />
              <NavItem 
                icon={Trophy} 
                label="Achievements" 
                subLabel="7/24 unlocked"
                onClick={() => handleNavigate('/profile?tab=achievements')}
              />
              <NavItem 
                icon={Shield} 
                label="Trust Score" 
                subLabel="Level 7 · VERIFIED"
                onClick={() => handleNavigate('/profile?tab=trust')}
              />
              <NavItem 
                icon={Settings} 
                label="System Config" 
                onClick={() => handleNavigate('/settings')}
              />
            </div>
            
            {/* Footer - Disconnect */}
            {isAuthenticated && (
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <motion.button
                  onClick={() => { logout(); onClose(); }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255,50,50,0.1)',
                    borderColor: 'rgba(255,50,50,0.2)'
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: 'rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Eye size={14} />
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
