/**
 * NeuralHub.jsx - THE NEURAL INTERFACE v3.0
 * 
 * GOD MODE EDITION
 * SPATIAL UI - Floating Holographic Panel
 * Style: Death Stranding PDA / Iron Man HUD
 * 
 * Features:
 * - Perfect centering (inset-0 + flex)
 * - Luxury materials (noise texture, cyan glow)
 * - Admin persona showcase
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Settings, Bell, Mail, 
  Package, Gift, Target, Trophy, Wallet,
  Shield, Activity, ChevronRight, X,
  Cpu, Eye, Sparkles, Crown, Bug, Rocket
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// SVG Noise Filter for texture
const NoiseFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </svg>
);

// System Vitals - Compact with noise effect
const SystemVitals = ({ rp = 4850, maxRp = 5000, entropy = 0.08 }) => (
  <div style={{ padding: '14px 0' }}>
    <div style={{ marginBottom: '10px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '6px',
        fontSize: '9px',
        fontFamily: '"JetBrains Mono", monospace',
        letterSpacing: '2px',
        opacity: 0.5
      }}>
        <span>RP.RESONANCE</span>
        <span style={{ color: '#00FFD4' }}>{rp}/{maxRp}</span>
      </div>
      <div style={{
        height: '3px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(rp/maxRp) * 100}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00FFD4 0%, rgba(0,255,212,0.5) 100%)',
            boxShadow: '0 0 10px #00FFD4',
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
      opacity: 0.35,
      letterSpacing: '1px'
    }}>
      <Activity size={10} />
      <span>ENTROPY: {(entropy * 100).toFixed(0)}%</span>
      <span style={{ opacity: 0.5 }}>•</span>
      <span>SYNC: ACTIVE</span>
    </div>
  </div>
);

// Navigation Item - Large with hover slide
const NavItem = ({ icon: Icon, label, subLabel, onClick, badge, pulse }) => (
  <motion.button
    onClick={onClick}
    initial={false}
    whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.04)' }}
    whileTap={{ scale: 0.98 }}
    style={{
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 'none',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      cursor: 'pointer',
      color: 'white',
      textAlign: 'left',
      position: 'relative',
      fontFamily: 'inherit',
      transition: 'background 0.2s ease',
    }}
  >
    {pulse && (
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute',
          left: '6px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '20px',
          background: '#FF3333',
          borderRadius: '2px',
        }}
      />
    )}
    
    <div style={{
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <Icon size={18} strokeWidth={1.5} style={{ opacity: 0.7 }} />
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{ 
        fontSize: '13px', 
        fontWeight: '500',
        letterSpacing: '0.3px',
        marginBottom: subLabel ? '3px' : 0
      }}>
        {label}
      </div>
      {subLabel && (
        <div style={{ 
          fontSize: '10px', 
          opacity: 0.35,
          fontFamily: 'monospace',
          letterSpacing: '0.5px'
        }}>
          {subLabel}
        </div>
      )}
    </div>
    
    {badge && (
      <span style={{
        padding: '3px 8px',
        background: badge === 'NEW' ? 'rgba(255,50,50,0.12)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${badge === 'NEW' ? 'rgba(255,50,50,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '6px',
        fontSize: '9px',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        color: badge === 'NEW' ? '#FF5555' : 'rgba(255,255,255,0.6)'
      }}>
        {badge}
      </span>
    )}
    
    <ChevronRight size={14} style={{ opacity: 0.15 }} />
  </motion.button>
);

// Achievement Badge
const AchievementBadge = ({ icon: Icon, label, color }) => (
  <div 
    title={label}
    style={{
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `${color}15`,
      border: `1px solid ${color}30`,
      borderRadius: '8px',
      color: color,
    }}
  >
    <Icon size={14} />
  </div>
);

// GOD MODE Profile - Admin/Founder showcase
const AdminProfile = () => {
  const trustColor = '#00FFD4'; // Cyan for max level
  
  return (
    <div style={{
      padding: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Avatar with resonance ring - REAL PHOTO */}
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{ 
              boxShadow: [
                `0 0 20px ${trustColor}20`,
                `0 0 40px ${trustColor}40`,
                `0 0 20px ${trustColor}20`
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${trustColor}30, transparent)`,
              border: `2px solid ${trustColor}50`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Cyberpunk style avatar - using gradient placeholder that looks premium */}
            <div style={{
              width: '100%',
              height: '100%',
              background: `
                linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)
              `,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              <Crown size={24} style={{ color: trustColor }} />
            </div>
          </motion.div>
          
          {/* Elite status indicator */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${trustColor}, #00FF88)`,
              border: '3px solid #0a0a0a',
              boxShadow: `0 0 10px ${trustColor}`,
            }}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '600',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '0.5px'
          }}>
            VOID_ARCHITECT
            <span style={{
              fontSize: '9px',
              padding: '2px 6px',
              background: `linear-gradient(135deg, ${trustColor}20, transparent)`,
              border: `1px solid ${trustColor}40`,
              borderRadius: '4px',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              color: trustColor,
            }}>
              LVL.99
            </span>
          </div>
          
          <div style={{ 
            fontSize: '10px', 
            fontFamily: 'monospace',
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ 
              color: '#C9B037',
              textShadow: '0 0 10px #C9B03750'
            }}>
              [ ORIGIN ]
            </span>
          </div>
        </div>
      </div>
      
      {/* Achievement badges row */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginTop: '14px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255,255,255,0.04)'
      }}>
        <AchievementBadge icon={Crown} label="Founder" color="#FFD700" />
        <AchievementBadge icon={Bug} label="Bug Hunter" color="#FF6B6B" />
        <AchievementBadge icon={Rocket} label="Alpha Tester" color="#00FFD4" />
        <AchievementBadge icon={Sparkles} label="Legendary" color="#C9B037" />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          fontSize: '9px',
          opacity: 0.3,
          fontFamily: 'monospace'
        }}>
          +12 more
        </div>
      </div>
    </div>
  );
};

// Main Neural Hub Component - GOD MODE
export const NeuralHub = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const hubRef = useRef(null);
  
  // Context actions
  const contextActions = [
    { 
      icon: Gift, 
      label: 'CLAIM REWARDS', 
      subLabel: '3 items · DecryptionCube',
      pulse: true,
      badge: 'NEW'
    },
    { 
      icon: Target, 
      label: 'DAILY LOG', 
      subLabel: '2/5 completed',
      pulse: true 
    }
  ];
  
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
          <NoiseFilter />
          
          {/* PERFECT CENTERING CONTAINER */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            {/* Backdrop - Dark overlay with blur */}
            <div 
              onClick={onClose}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.70)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />
          
            {/* FLOATING ISLAND - Neural Hub Panel */}
            <motion.div
              ref={hubRef}
              initial={{ 
                opacity: 0, 
                scale: 0.9, 
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
                damping: 32,
                mass: 0.8
              }}
              style={{
                position: 'relative',
                width: '400px',
                maxHeight: '80vh',
                
                // LUXURY GLASS MATERIAL
                background: 'rgba(10, 10, 10, 0.92)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                
                // ULTRA-THIN BORDER
                border: '0.5px solid rgba(255, 255, 255, 0.12)',
                
                // SOFT ROUNDED EDGES
                borderRadius: '24px',
                
                // CYAN GLOW
                boxShadow: `
                  0 0 0 0.5px rgba(255,255,255,0.05),
                  0 25px 60px -15px rgba(0, 0, 0, 0.7),
                  0 0 60px -20px rgba(0, 255, 212, 0.15)
                `,
                
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                color: 'white',
              }}
              data-testid="neural-hub"
            >
              {/* Noise texture overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                filter: 'url(#noise)',
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
              }} />
              
              {/* Header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={12} style={{ opacity: 0.4, color: '#00FFD4' }} />
                  <span style={{
                    fontSize: '10px',
                    letterSpacing: '3px',
                    opacity: 0.4,
                    fontFamily: 'monospace',
                  }}>
                    NEURAL.HUB
                  </span>
                  <span style={{
                    fontSize: '8px',
                    opacity: 0.2,
                    fontFamily: 'monospace',
                  }}>
                    v3.0
                  </span>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: 0.5,
                  }}
                >
                  <X size={12} />
                </motion.button>
              </div>
              
              {/* GOD MODE Profile */}
              <AdminProfile />
              
              {/* System Vitals */}
              <div style={{ padding: '0 20px' }}>
                <SystemVitals rp={4850} maxRp={5000} entropy={0.08} />
              </div>
              
              {/* Scrollable Content */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
              }}>
                {/* Context Actions */}
                <div style={{ 
                  padding: '8px 12px',
                  borderTop: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <div style={{
                    fontSize: '8px',
                    letterSpacing: '3px',
                    opacity: 0.25,
                    marginBottom: '6px',
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
                
                {/* Navigation */}
                <div style={{ 
                  padding: '8px 12px',
                  borderTop: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <div style={{
                    fontSize: '8px',
                    letterSpacing: '3px',
                    opacity: 0.25,
                    marginBottom: '6px',
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
                    subLabel="3 unread"
                    badge="3"
                    onClick={() => handleNavigate('/notifications')}
                  />
                  <NavItem 
                    icon={Mail} 
                    label="Messages" 
                    onClick={() => handleNavigate('/chat')}
                  />
                  <NavItem 
                    icon={Wallet} 
                    label="Inventory" 
                    subLabel="47 items"
                    onClick={() => handleNavigate('/inventory')}
                  />
                  <NavItem 
                    icon={Trophy} 
                    label="Achievements" 
                    subLabel="24/24 unlocked"
                    onClick={() => handleNavigate('/profile?tab=achievements')}
                  />
                  <NavItem 
                    icon={Shield} 
                    label="Trust Score" 
                    subLabel="Level 99 · ORIGIN"
                    onClick={() => handleNavigate('/profile?tab=trust')}
                  />
                  <NavItem 
                    icon={Settings} 
                    label="System Config" 
                    onClick={() => handleNavigate('/settings')}
                  />
                </div>
              </div>
              
              {/* Footer - Disconnect */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
                <motion.button
                  onClick={() => { logout(); onClose(); }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255,50,50,0.08)',
                    borderColor: 'rgba(255,50,50,0.15)'
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    color: 'rgba(255,255,255,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Eye size={12} />
                  DISCONNECT
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NeuralHub;
