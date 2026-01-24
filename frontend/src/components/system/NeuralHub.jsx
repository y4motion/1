/**
 * NeuralHub.jsx - COMMAND CENTER v4.0
 * 
 * Wide Dashboard Layout (900px x 550px)
 * Two-panel design: Identity | Operations
 * Full Russian localization
 * No scroll - everything fits perfectly
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Package, Gift, Target, 
  Trophy, Wallet, Shield, Activity, X, Cpu, 
  Eye, Crown, Bug, Rocket, Sparkles, Mail,
  Zap, Star, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// SVG Noise Filter
const NoiseFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </svg>
);

// Achievement Badge
const AchievementBadge = ({ icon: Icon, label, color }) => (
  <motion.div 
    title={label}
    whileHover={{ scale: 1.1, y: -2 }}
    style={{
      width: '38px',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `${color}12`,
      border: `1px solid ${color}25`,
      borderRadius: '10px',
      color: color,
      cursor: 'pointer',
    }}
  >
    <Icon size={16} />
  </motion.div>
);

// Stat Bar Component
const StatBar = ({ label, value, max, color, icon: Icon }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '10px',
        fontFamily: 'monospace',
        letterSpacing: '2px',
        opacity: 0.5
      }}>
        <Icon size={12} style={{ color }} />
        <span>{label}</span>
      </div>
      <span style={{ 
        fontSize: '12px', 
        fontFamily: 'monospace',
        color,
        fontWeight: '600'
      }}>
        {value}/{max}
      </span>
    </div>
    <div style={{
      height: '4px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '2px',
      overflow: 'hidden',
    }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value/max) * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
          boxShadow: `0 0 12px ${color}50`,
          borderRadius: '2px',
        }}
      />
    </div>
  </div>
);

// Action Banner (Large clickable card)
const ActionBanner = ({ icon: Icon, title, subtitle, onClick, isNew, color = 'white' }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
    whileTap={{ scale: 0.98 }}
    style={{
      width: '100%',
      padding: '20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: 'pointer',
      color: 'white',
      textAlign: 'left',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s ease',
    }}
  >
    {/* NEW indicator */}
    {isNew && (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: '#FF3333',
          borderRadius: '0 2px 2px 0',
        }}
      />
    )}
    
    <div style={{
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `${color}10`,
      borderRadius: '12px',
      border: `1px solid ${color}20`,
    }}>
      <Icon size={22} style={{ color, opacity: 0.8 }} />
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: '600',
        letterSpacing: '0.5px',
        marginBottom: '4px'
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '11px', 
        opacity: 0.4,
        fontFamily: 'monospace',
      }}>
        {subtitle}
      </div>
    </div>
    
    {isNew && (
      <span style={{
        padding: '4px 10px',
        background: 'rgba(255,50,50,0.15)',
        border: '1px solid rgba(255,50,50,0.25)',
        borderRadius: '6px',
        fontSize: '9px',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        color: '#FF5555'
      }}>
        NEW
      </span>
    )}
  </motion.button>
);

// Navigation Tile (Grid item)
const NavTile = ({ icon: Icon, label, badge, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ 
      scale: 1.03, 
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.12)'
    }}
    whileTap={{ scale: 0.97 }}
    style={{
      padding: '20px 16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      color: 'white',
      position: 'relative',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '12px',
    }}>
      <Icon size={20} strokeWidth={1.5} style={{ opacity: 0.7 }} />
    </div>
    
    <span style={{ 
      fontSize: '11px', 
      fontWeight: '500',
      letterSpacing: '1px',
      opacity: 0.8
    }}>
      {label}
    </span>
    
    {badge && (
      <span style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        minWidth: '18px',
        height: '18px',
        padding: '0 5px',
        background: '#FF3333',
        borderRadius: '9px',
        fontSize: '10px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {badge}
      </span>
    )}
  </motion.button>
);

// COMMAND CENTER Component
export const NeuralHub = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const hubRef = useRef(null);
  
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
          
          {/* CENTERING CONTAINER */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            {/* Backdrop */}
            <div 
              onClick={onClose}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(12px)',
              }}
            />
          
            {/* COMMAND CENTER PANEL */}
            <motion.div
              ref={hubRef}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                position: 'relative',
                width: '900px',
                height: '560px',
                
                // LUXURY GLASS
                background: 'rgba(8, 8, 8, 0.95)',
                backdropFilter: 'blur(40px)',
                border: '0.5px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '28px',
                
                // GLOW
                boxShadow: `
                  0 0 0 0.5px rgba(255,255,255,0.05),
                  0 30px 80px -20px rgba(0, 0, 0, 0.8),
                  0 0 80px -30px rgba(0, 255, 212, 0.12)
                `,
                
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '320px 1fr',
                fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                color: 'white',
              }}
              data-testid="neural-hub"
            >
              {/* Noise overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.025,
                filter: 'url(#noise)',
                pointerEvents: 'none',
              }} />
              
              {/* ==========================================
                  LEFT PANEL: IDENTITY (Профиль)
                  ========================================== */}
              <div style={{
                padding: '28px',
                background: 'rgba(0,0,0,0.3)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px',
                }}>
                  <Cpu size={12} style={{ opacity: 0.4, color: '#00FFD4' }} />
                  <span style={{
                    fontSize: '9px',
                    letterSpacing: '3px',
                    opacity: 0.4,
                    fontFamily: 'monospace',
                  }}>
                    NEURAL.HUB
                  </span>
                </div>
                
                {/* Avatar - Large */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 30px rgba(0,255,212,0.2)',
                        '0 0 50px rgba(0,255,212,0.35)',
                        '0 0 30px rgba(0,255,212,0.2)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '24px',
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                      border: '2px solid rgba(0,255,212,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <Crown size={40} style={{ color: '#00FFD4' }} />
                  </motion.div>
                  
                  {/* Name & Class */}
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600',
                    letterSpacing: '1px',
                    marginBottom: '6px'
                  }}>
                    VOID_ARCHITECT
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '3px 10px',
                      background: 'linear-gradient(135deg, rgba(0,255,212,0.15), transparent)',
                      border: '1px solid rgba(0,255,212,0.3)',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      letterSpacing: '1px',
                      color: '#00FFD4',
                    }}>
                      LVL.99
                    </span>
                    <span style={{ 
                      fontSize: '10px',
                      color: '#C9B037',
                      fontFamily: 'monospace',
                      letterSpacing: '2px',
                      textShadow: '0 0 10px rgba(201,176,55,0.5)'
                    }}>
                      [ ORIGIN ]
                    </span>
                  </div>
                </div>
                
                {/* Stats */}
                <div style={{ marginBottom: '20px' }}>
                  <StatBar 
                    label="РЕЗОНАНС" 
                    value={4850} 
                    max={5000} 
                    color="#00FFD4"
                    icon={Zap}
                  />
                  <StatBar 
                    label="ЭНТРОПИЯ" 
                    value={8} 
                    max={100} 
                    color="#FF6B6B"
                    icon={Activity}
                  />
                  <StatBar 
                    label="ДОВЕРИЕ" 
                    value={99} 
                    max={100} 
                    color="#C9B037"
                    icon={Shield}
                  />
                </div>
                
                {/* Achievements Grid */}
                <div>
                  <div style={{
                    fontSize: '9px',
                    letterSpacing: '2px',
                    opacity: 0.3,
                    marginBottom: '12px',
                    fontFamily: 'monospace',
                  }}>
                    ДОСТИЖЕНИЯ
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px'
                  }}>
                    <AchievementBadge icon={Crown} label="Основатель" color="#FFD700" />
                    <AchievementBadge icon={Bug} label="Охотник за багами" color="#FF6B6B" />
                    <AchievementBadge icon={Rocket} label="Альфа Тестер" color="#00FFD4" />
                    <AchievementBadge icon={Star} label="Легенда" color="#C9B037" />
                    <AchievementBadge icon={Award} label="Мастер" color="#9C27B0" />
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    opacity: 0.3, 
                    marginTop: '10px',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}>
                    +19 ещё
                  </div>
                </div>
                
                {/* Spacer */}
                <div style={{ flex: 1 }} />
                
                {/* Disconnect button */}
                <motion.button
                  onClick={() => { logout(); onClose(); }}
                  whileHover={{ backgroundColor: 'rgba(255,50,50,0.1)' }}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    color: 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                  }}
                >
                  <Eye size={12} />
                  ОТКЛЮЧИТЬСЯ
                </motion.button>
              </div>
              
              {/* ==========================================
                  RIGHT PANEL: OPERATIONS (Меню)
                  ========================================== */}
              <div style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Header with close */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    fontSize: '9px',
                    letterSpacing: '3px',
                    opacity: 0.4,
                    fontFamily: 'monospace',
                  }}>
                    ОПЕРАЦИИ
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer',
                      opacity: 0.5,
                    }}
                  >
                    <X size={14} />
                  </motion.button>
                </div>
                
                {/* Action Banners (2 columns) */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <ActionBanner 
                    icon={Gift}
                    title="ЗАБРАТЬ НАГРАДЫ"
                    subtitle="3 предмета · DecryptionCube"
                    onClick={() => handleNavigate('/rewards')}
                    isNew={true}
                    color="#FF6B6B"
                  />
                  <ActionBanner 
                    icon={Target}
                    title="ДЕЙЛИ ЛОГ"
                    subtitle="2/5 выполнено"
                    onClick={() => handleNavigate('/daily')}
                    color="#00FFD4"
                  />
                </div>
                
                {/* Navigation Grid (3x2) */}
                <div style={{
                  fontSize: '9px',
                  letterSpacing: '3px',
                  opacity: 0.3,
                  marginBottom: '12px',
                  fontFamily: 'monospace',
                }}>
                  НАВИГАЦИЯ
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '12px',
                  flex: 1
                }}>
                  <NavTile 
                    icon={User} 
                    label="ДОСЬЕ" 
                    onClick={() => handleNavigate('/profile')}
                  />
                  <NavTile 
                    icon={Bell} 
                    label="СИГНАЛЫ" 
                    badge="3"
                    onClick={() => handleNavigate('/notifications')}
                  />
                  <NavTile 
                    icon={Mail} 
                    label="ПОЧТА" 
                    onClick={() => handleNavigate('/chat')}
                  />
                  <NavTile 
                    icon={Package} 
                    label="ИНВЕНТАРЬ" 
                    onClick={() => handleNavigate('/inventory')}
                  />
                  <NavTile 
                    icon={Trophy} 
                    label="РЕЙТИНГ" 
                    onClick={() => handleNavigate('/rating')}
                  />
                  <NavTile 
                    icon={Settings} 
                    label="СИСТЕМА" 
                    onClick={() => handleNavigate('/settings')}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NeuralHub;
