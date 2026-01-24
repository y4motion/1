/**
 * NeuralHub.jsx - ACRYLIC GHOST v7.2 FINAL POLISH
 * 
 * FROSTED GLASS AESTHETIC - ULTIMATE EDITION
 * + Monospace fonts for all numbers/stats
 * + Soft white edge glow (subtle, premium)
 * + All buttons polished with consistent style
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Package, Gift, Target, 
  Trophy, Wallet, Shield, X, 
  Mail, Star, Clock, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Premium Avatar URL
const AVATAR_URL = 'https://images.pexels.com/photos/27969612/pexels-photo-27969612.jpeg';

// Subtle white corner glow
const CornerGlow = () => (
  <>
    {/* Top Left */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '120px',
      height: '120px',
      background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.04) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />
    {/* Top Right */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '120px',
      height: '120px',
      background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.04) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />
    {/* Bottom Left */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '120px',
      height: '120px',
      background: 'radial-gradient(ellipse at bottom left, rgba(255,255,255,0.03) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />
    {/* Bottom Right */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '120px',
      height: '120px',
      background: 'radial-gradient(ellipse at bottom right, rgba(255,255,255,0.03) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />
    {/* Edge highlights */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '200px',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '200px',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      pointerEvents: 'none',
    }} />
  </>
);

// Subtle grid pattern
const SubtleGrid = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  }} />
);

// Mono number display
const MonoNum = ({ children, style = {} }) => (
  <span style={{
    fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
    fontVariantNumeric: 'tabular-nums',
    ...style
  }}>
    {children}
  </span>
);

// Clean stat bar with mono numbers
const StatBar = ({ label, value, max }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '11px',
    }}>
      <span style={{ opacity: 0.4, fontWeight: '500', letterSpacing: '0.5px' }}>{label}</span>
      <MonoNum style={{ opacity: 0.7, fontSize: '11px' }}>{value}/{max}</MonoNum>
    </div>
    <div style={{
      height: '2px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '1px',
      overflow: 'hidden',
    }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value/max) * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          height: '100%',
          background: 'rgba(255,255,255,0.6)',
          boxShadow: '0 0 10px rgba(255,255,255,0.3)',
          borderRadius: '1px',
        }}
      />
    </div>
  </div>
);

// Clean navigation tile
const NavTile = ({ icon: Icon, label, badge, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ 
      backgroundColor: 'rgba(255,255,255,0.06)',
      y: -2,
      borderColor: 'rgba(255,255,255,0.1)'
    }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
    style={{
      padding: '24px 16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      color: 'white',
      position: 'relative',
      fontFamily: 'inherit',
    }}
  >
    <div style={{
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '14px',
    }}>
      <Icon size={22} strokeWidth={1.5} style={{ opacity: 0.6 }} />
    </div>
    
    <span style={{ 
      fontSize: '11px', 
      fontWeight: '500',
      letterSpacing: '0.5px',
      opacity: 0.7
    }}>
      {label}
    </span>
    
    {badge && (
      <motion.span 
        animate={{ 
          boxShadow: ['0 0 0px rgba(255,255,255,0)', '0 0 15px rgba(255,255,255,0.3)', '0 0 0px rgba(255,255,255,0)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          minWidth: '20px',
          height: '20px',
          padding: '0 6px',
          background: 'rgba(255,255,255,0.9)',
          color: 'black',
          borderRadius: '10px',
          fontSize: '10px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {badge}
      </motion.span>
    )}
  </motion.button>
);

// Action card - wide format
const ActionCard = ({ icon: Icon, title, subtitle, onClick, isNew }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ 
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.12)',
      y: -1
    }}
    whileTap={{ scale: 0.99 }}
    style={{
      padding: '24px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      cursor: 'pointer',
      color: 'white',
      textAlign: 'left',
      position: 'relative',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
    }}
  >
    {isNew && (
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '40px',
          background: 'white',
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 15px rgba(255,255,255,0.5)',
        }}
      />
    )}
    
    <div style={{
      width: '56px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '16px',
    }}>
      <Icon size={24} strokeWidth={1.5} style={{ opacity: 0.6 }} />
    </div>
    
    <div style={{ flex: 1 }}>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: '600',
        letterSpacing: '0.3px',
        marginBottom: '4px',
        opacity: 0.9
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '12px', 
        opacity: 0.4,
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        {subtitle}
      </div>
    </div>
    
    {isNew && (
      <span style={{
        padding: '6px 12px',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: '600',
        letterSpacing: '1px',
        opacity: 0.8,
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        NEW
      </span>
    )}
  </motion.button>
);

// ACRYLIC GHOST Neural Hub - FINAL
export const NeuralHub = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const hubRef = useRef(null);
  
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
          }}
        >
          {/* Backdrop */}
          <motion.div 
            onClick={onClose}
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(30px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
            }}
          />
          
          {/* FROSTED ACRYLIC CONTAINER */}
          <motion.div
            ref={hubRef}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'relative',
              width: '1000px',
              height: '620px',
              
              // FROSTED GLASS
              background: 'rgba(18, 18, 18, 0.85)',
              backdropFilter: 'blur(60px)',
              WebkitBackdropFilter: 'blur(60px)',
              
              // ELEGANT BORDER
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '32px',
              
              // SOFT WHITE GLOW
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.03),
                0 25px 80px -20px rgba(0,0,0,0.5),
                0 0 80px -30px rgba(255,255,255,0.08)
              `,
              
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '340px 1fr',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              color: 'white',
            }}
            data-testid="neural-hub"
          >
            {/* Subtle grid */}
            <SubtleGrid />
            
            {/* Corner glow effects */}
            <CornerGlow />

            {/* ==========================================
                LEFT PANEL: IDENTITY
                ========================================== */}
            <div style={{
              padding: '48px 40px',
              background: 'rgba(0,0,0,0.15)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Avatar */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                marginBottom: '32px'
              }}>
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 30px rgba(255,255,255,0.08)',
                      '0 0 50px rgba(255,255,255,0.12)',
                      '0 0 30px rgba(255,255,255,0.08)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '28px',
                    border: '2px solid rgba(255,255,255,0.12)',
                    overflow: 'hidden',
                    marginBottom: '20px',
                  }}
                >
                  <img 
                    src={AVATAR_URL}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'grayscale(30%) contrast(1.05)',
                    }}
                  />
                </motion.div>
                
                {/* Name */}
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '600',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                  textShadow: '0 0 30px rgba(255,255,255,0.2)',
                }}>
                  VOID_ARCHITECT
                </div>
                
                {/* Level & Class */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '5px 14px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '20px',
                    fontWeight: '500',
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '1px',
                  }}>
                    LVL 99
                  </span>
                  <span style={{ 
                    fontSize: '11px',
                    opacity: 0.4,
                    letterSpacing: '1px',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}>
                    ORIGIN
                  </span>
                </div>
                
                {/* Member since */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  opacity: 0.3,
                }}>
                  <Clock size={12} />
                  <span>Участник с <MonoNum>2024</MonoNum></span>
                </div>
              </div>
              
              {/* Divider */}
              <div style={{ 
                height: '1px', 
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                margin: '8px 0 24px 0',
              }} />
              
              {/* Stats */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '10px', 
                  letterSpacing: '2px', 
                  opacity: 0.3,
                  marginBottom: '16px',
                  fontWeight: '500',
                  fontFamily: '"JetBrains Mono", monospace',
                }}>
                  СТАТИСТИКА
                </div>
                <StatBar label="Резонанс" value={4850} max={5000} />
                <StatBar label="Репутация" value={99} max={100} />
                <StatBar label="Активность" value={92} max={100} />
              </div>
              
              {/* Achievements */}
              <div>
                <div style={{ 
                  fontSize: '10px', 
                  letterSpacing: '2px', 
                  opacity: 0.3,
                  marginBottom: '14px',
                  fontWeight: '500',
                  fontFamily: '"JetBrains Mono", monospace',
                }}>
                  ДОСТИЖЕНИЯ
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {[Star, Shield, Trophy, Gift, Target].map((Icon, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(255,255,255,0.15)'
                      }}
                      style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={18} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                    </motion.div>
                  ))}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  opacity: 0.3, 
                  marginTop: '12px',
                  fontFamily: '"JetBrains Mono", monospace',
                }}>
                  <MonoNum>24</MonoNum> из <MonoNum>24</MonoNum> получено
                </div>
              </div>
              
              {/* Spacer */}
              <div style={{ flex: 1 }} />
              
              {/* Logout */}
              <motion.button
                onClick={() => { logout(); onClose(); }}
                whileHover={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
                style={{
                  padding: '14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s ease',
                }}
              >
                Выйти
              </motion.button>
            </div>
            
            {/* ==========================================
                RIGHT PANEL: OPERATIONS
                ========================================== */}
            <div style={{
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
              }}>
                <div style={{ 
                  fontSize: '10px', 
                  letterSpacing: '2px', 
                  opacity: 0.3,
                  fontWeight: '500',
                  fontFamily: '"JetBrains Mono", monospace',
                }}>
                  БЫСТРЫЕ ДЕЙСТВИЯ
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ 
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.12)'
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    opacity: 0.5,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <X size={18} strokeWidth={1.5} />
                </motion.button>
              </div>
              
              {/* Action Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginBottom: '28px'
              }}>
                <ActionCard 
                  icon={Gift}
                  title="Забрать награды"
                  subtitle="3 новых предмета"
                  onClick={() => handleNavigate('/rewards')}
                  isNew={true}
                />
                <ActionCard 
                  icon={Target}
                  title="Ежедневные задания"
                  subtitle="2 из 5 выполнено"
                  onClick={() => handleNavigate('/daily')}
                />
              </div>
              
              {/* Navigation Label */}
              <div style={{ 
                fontSize: '10px', 
                letterSpacing: '2px', 
                opacity: 0.3,
                marginBottom: '16px',
                fontWeight: '500',
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                НАВИГАЦИЯ
              </div>
              
              {/* Navigation Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '12px',
                flex: 1
              }}>
                <NavTile icon={User} label="Профиль" onClick={() => handleNavigate('/profile')} />
                <NavTile icon={Bell} label="Уведомления" badge="3" onClick={() => handleNavigate('/notifications')} />
                <NavTile icon={Mail} label="Сообщения" onClick={() => handleNavigate('/chat')} />
                <NavTile icon={Package} label="Инвентарь" onClick={() => handleNavigate('/inventory')} />
                <NavTile icon={Trophy} label="Рейтинг" onClick={() => handleNavigate('/rating')} />
                <NavTile icon={Wallet} label="Баланс" onClick={() => handleNavigate('/wallet')} />
                <NavTile icon={Shield} label="Доверие" onClick={() => handleNavigate('/trust')} />
                <NavTile icon={Settings} label="Настройки" onClick={() => handleNavigate('/settings')} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuralHub;
