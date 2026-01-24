/**
 * NeuralHub.jsx - HOLOGRAPHIC FINISH v6.0
 * 
 * TACTICAL FUI with Glass Material & Glow Effects
 * The "Living Device" version
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Package, Gift, Target, 
  Trophy, Wallet, Shield, Activity, X, Cpu, 
  Eye, Zap, Mail, LayoutGrid, Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Cyberpunk Avatar URL
const AVATAR_URL = 'https://images.pexels.com/photos/27969612/pexels-photo-27969612.jpeg';

// Corner Brackets with glow
const CornerBrackets = () => (
  <>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '2px', background: 'linear-gradient(90deg, rgba(0,255,212,0.6), transparent)', boxShadow: '0 0 10px rgba(0,255,212,0.3)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '40px', background: 'linear-gradient(180deg, rgba(0,255,212,0.6), transparent)', boxShadow: '0 0 10px rgba(0,255,212,0.3)' }} />
    </div>
    <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '2px', background: 'linear-gradient(-90deg, rgba(0,255,212,0.6), transparent)', boxShadow: '0 0 10px rgba(0,255,212,0.3)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '2px', height: '40px', background: 'linear-gradient(180deg, rgba(0,255,212,0.6), transparent)', boxShadow: '0 0 10px rgba(0,255,212,0.3)' }} />
    </div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '2px', background: 'linear-gradient(90deg, rgba(0,255,212,0.6), transparent)', boxShadow: '0 0 10px rgba(0,255,212,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '2px', height: '40px', background: 'linear-gradient(0deg, rgba(0,255,212,0.6), transparent)', boxShadow: '0 0 10px rgba(0,255,212,0.3)' }} />
    </div>
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px' }}>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '2px', background: 'linear-gradient(-90deg, rgba(0,255,212,0.6), transparent)', boxShadow: '0 0 10px rgba(0,255,212,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '2px', height: '40px', background: 'linear-gradient(0deg, rgba(0,255,212,0.6), transparent)', boxShadow: '0 0 10px rgba(0,255,212,0.3)' }} />
    </div>
  </>
);

// Scanline animation - more visible
const ScanlineOverlay = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  }}>
    <motion.div
      animate={{ y: ['0%', '100%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      style={{
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0,255,212,0.15), transparent)',
        boxShadow: '0 0 20px rgba(0,255,212,0.2)',
      }}
    />
  </div>
);

// Grid pattern
const GridPattern = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,212,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,212,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
  }} />
);

// Tech label with glow option
const TechLabel = ({ children, glow, style = {} }) => (
  <span style={{
    fontSize: '8px',
    fontFamily: '"JetBrains Mono", monospace',
    letterSpacing: '2px',
    opacity: glow ? 0.8 : 0.3,
    color: glow ? '#00FFD4' : 'white',
    textShadow: glow ? '0 0 10px rgba(0,255,212,0.5)' : 'none',
    ...style
  }}>
    {children}
  </span>
);

// Fake QR Code
const FakeQR = () => (
  <div style={{
    width: '48px',
    height: '48px',
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    opacity: 0.4,
  }}>
    {Array.from({ length: 49 }).map((_, i) => (
      <div 
        key={i}
        style={{
          background: Math.random() > 0.5 ? 'rgba(0,255,212,0.6)' : 'transparent',
          aspectRatio: '1',
        }}
      />
    ))}
  </div>
);

// Barcode with glow
const Barcode = () => (
  <div style={{
    display: 'flex',
    gap: '1px',
    height: '18px',
    opacity: 0.35,
  }}>
    {Array.from({ length: 25 }).map((_, i) => (
      <div 
        key={i}
        style={{
          width: Math.random() > 0.5 ? '2px' : '1px',
          height: '100%',
          background: '#00FFD4',
          boxShadow: '0 0 3px rgba(0,255,212,0.3)',
        }}
      />
    ))}
  </div>
);

// Stat Bar with glow
const StatBar = ({ label, value, max, isAccent = false }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      marginBottom: '5px',
      fontSize: '9px',
      fontFamily: 'monospace',
      letterSpacing: '2px',
    }}>
      <span style={{ opacity: 0.4 }}>{label}</span>
      <span style={{ 
        color: isAccent ? '#00FFD4' : 'white',
        opacity: isAccent ? 1 : 0.6,
        textShadow: isAccent ? '0 0 8px rgba(0,255,212,0.5)' : 'none',
      }}>
        {value}/{max}
      </span>
    </div>
    <div style={{
      height: '3px',
      background: 'rgba(255,255,255,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value/max) * 100}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          height: '100%',
          background: isAccent 
            ? 'linear-gradient(90deg, #00FFD4, rgba(0,255,212,0.6))'
            : 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
          boxShadow: isAccent ? '0 0 15px rgba(0,255,212,0.5)' : 'none',
        }}
      />
    </div>
  </div>
);

// Navigation Block with hover glow
const NavBlock = ({ icon: Icon, label, sublabel, badge, onClick, isActive, wide }) => (
  <motion.button
    onClick={onClick}
    initial={false}
    whileHover={{ 
      backgroundColor: 'rgba(0,255,212,0.08)',
      borderColor: 'rgba(0,255,212,0.3)',
      scale: 1.02,
    }}
    whileTap={{ scale: 0.98 }}
    style={{
      padding: wide ? '20px 24px' : '18px 14px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: wide ? 'row' : 'column',
      alignItems: 'center',
      gap: wide ? '16px' : '10px',
      cursor: 'pointer',
      color: 'white',
      position: 'relative',
      fontFamily: 'inherit',
      gridColumn: wide ? 'span 2' : 'span 1',
      transition: 'all 0.2s ease',
    }}
  >
    {/* Active indicator with glow */}
    {isActive && (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: '#00FFD4',
          boxShadow: '0 0 15px rgba(0,255,212,0.6)',
        }}
      />
    )}
    
    <motion.div 
      whileHover={{ scale: 1.1 }}
      style={{
        width: wide ? '50px' : '42px',
        height: wide ? '50px' : '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <Icon size={wide ? 22 : 18} strokeWidth={1} style={{ opacity: 0.6 }} />
    </motion.div>
    
    <div style={{ 
      flex: wide ? 1 : 'none',
      textAlign: wide ? 'left' : 'center' 
    }}>
      <div style={{ 
        fontSize: wide ? '13px' : '10px', 
        fontWeight: '500',
        letterSpacing: '1px',
        marginBottom: sublabel ? '3px' : 0
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ 
          fontSize: '9px', 
          opacity: 0.35,
          fontFamily: 'monospace',
        }}>
          {sublabel}
        </div>
      )}
    </div>
    
    {badge && (
      <motion.span 
        animate={{ boxShadow: ['0 0 5px rgba(0,255,212,0.3)', '0 0 15px rgba(0,255,212,0.6)', '0 0 5px rgba(0,255,212,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: wide ? 'relative' : 'absolute',
          top: wide ? 'auto' : '10px',
          right: wide ? 'auto' : '10px',
          minWidth: '20px',
          height: '20px',
          padding: '0 6px',
          background: '#00FFD4',
          color: 'black',
          fontSize: '9px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
        }}
      >
        {badge}
      </motion.span>
    )}
  </motion.button>
);

// HOLOGRAPHIC NEURAL HUB
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
          {/* Backdrop with heavy blur */}
          <div 
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(25px)',
            }}
          />
          
          {/* HOLOGRAPHIC CONTAINER */}
          <motion.div
            ref={hubRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{
              position: 'relative',
              width: '1150px',
              height: '680px',
              
              // GLASS MATERIAL
              background: 'linear-gradient(135deg, rgba(10,10,15,0.95) 0%, rgba(5,5,10,0.85) 100%)',
              backdropFilter: 'blur(40px)',
              
              // GLOWING BORDER
              border: '1px solid rgba(0,255,212,0.15)',
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.05),
                0 0 60px -10px rgba(0,255,212,0.15),
                0 30px 60px -20px rgba(0,0,0,0.7),
                inset 0 1px 0 rgba(255,255,255,0.05)
              `,
              
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '320px 1fr',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              color: 'white',
            }}
            data-testid="neural-hub"
          >
            {/* Grid background */}
            <GridPattern />
            
            {/* Scanline */}
            <ScanlineOverlay />
            
            {/* Corner brackets with glow */}
            <CornerBrackets />
            
            {/* Tech labels */}
            <div style={{ position: 'absolute', top: '12px', left: '50px' }}>
              <TechLabel glow>SYS.ID: 99402-ARCH</TechLabel>
            </div>
            <div style={{ position: 'absolute', top: '12px', right: '60px' }}>
              <TechLabel>SYNC: STABLE</TechLabel>
            </div>
            <div style={{ position: 'absolute', bottom: '12px', left: '50px' }}>
              <TechLabel>NEURAL.HUB v6.0</TechLabel>
            </div>
            <div style={{ position: 'absolute', bottom: '12px', right: '60px' }}>
              <TechLabel glow>UPTIME: 403:27:14</TechLabel>
            </div>

            {/* ==========================================
                LEFT PANEL: IDENTITY
                ========================================== */}
            <div style={{
              padding: '50px 35px',
              background: 'rgba(0,0,0,0.3)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* REAL AVATAR with complex mask */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                marginBottom: '28px'
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
                    width: '130px',
                    height: '130px',
                    clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)',
                    border: '2px solid rgba(0,255,212,0.4)',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    position: 'relative',
                  }}
                >
                  <img 
                    src={AVATAR_URL}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'saturate(0.7) contrast(1.1)',
                    }}
                  />
                  {/* Overlay gradient */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 60%, rgba(0,255,212,0.1) 100%)',
                  }} />
                </motion.div>
                
                {/* Name with GLOW */}
                <motion.div 
                  style={{ 
                    fontSize: '18px', 
                    fontWeight: '600',
                    letterSpacing: '3px',
                    marginBottom: '8px',
                    textShadow: '0 0 20px rgba(255,255,255,0.4)',
                  }}
                >
                  VOID_ARCHITECT
                </motion.div>
                
                {/* Class with glow */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <motion.span 
                    animate={{ textShadow: ['0 0 5px rgba(0,255,212,0.5)', '0 0 15px rgba(0,255,212,0.8)', '0 0 5px rgba(0,255,212,0.5)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      fontSize: '10px',
                      padding: '4px 12px',
                      border: '1px solid rgba(0,255,212,0.4)',
                      fontFamily: 'monospace',
                      letterSpacing: '2px',
                      color: '#00FFD4',
                    }}
                  >
                    LVL.99
                  </motion.span>
                  <span style={{ 
                    fontSize: '10px',
                    opacity: 0.5,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                  }}>
                    [ ORIGIN ]
                  </span>
                </div>
                
                {/* QR and Barcode */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px',
                }}>
                  <FakeQR />
                  <div>
                    <Barcode />
                    <TechLabel style={{ marginTop: '6px', display: 'block' }}>
                      ID: 0xF7A9...2D4E
                    </TechLabel>
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div style={{ 
                height: '1px', 
                background: 'linear-gradient(90deg, transparent, rgba(0,255,212,0.2), transparent)',
                margin: '16px 0',
              }} />
              
              {/* Stats */}
              <div style={{ marginBottom: '20px' }}>
                <TechLabel style={{ display: 'block', marginBottom: '14px' }} glow>
                  SYSTEM.VITALS
                </TechLabel>
                <StatBar label="РЕЗОНАНС" value={4850} max={5000} isAccent={true} />
                <StatBar label="ЭНТРОПИЯ" value={8} max={100} />
                <StatBar label="ДОВЕРИЕ" value={99} max={100} />
              </div>
              
              {/* Achievements */}
              <div>
                <TechLabel style={{ display: 'block', marginBottom: '12px' }}>
                  ДОСТИЖЕНИЯ [24/24]
                </TechLabel>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px'
                }}>
                  {[Shield, Trophy, Zap, Database, LayoutGrid].map((Icon, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ 
                        borderColor: 'rgba(0,255,212,0.4)',
                        boxShadow: '0 0 10px rgba(0,255,212,0.2)'
                      }}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={14} strokeWidth={1} style={{ opacity: 0.5 }} />
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Spacer */}
              <div style={{ flex: 1 }} />
              
              {/* Disconnect */}
              <motion.button
                onClick={() => { logout(); onClose(); }}
                whileHover={{ 
                  backgroundColor: 'rgba(255,50,50,0.1)',
                  borderColor: 'rgba(255,50,50,0.3)'
                }}
                style={{
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  transition: 'all 0.2s ease',
                }}
              >
                <Eye size={14} strokeWidth={1} />
                ОТКЛЮЧИТЬСЯ
              </motion.button>
            </div>
            
            {/* ==========================================
                RIGHT PANEL: OPERATIONS
                ========================================== */}
            <div style={{
              padding: '50px 35px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Cpu size={14} strokeWidth={1} style={{ opacity: 0.5, color: '#00FFD4' }} />
                  <TechLabel style={{ fontSize: '10px' }} glow>ОПЕРАЦИИ</TechLabel>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    opacity: 0.5,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </motion.button>
              </div>
              
              {/* BENTO GRID */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '3px',
                flex: 1,
              }}>
                <NavBlock 
                  icon={Gift}
                  label="ЗАБРАТЬ НАГРАДЫ"
                  sublabel="3 предмета · DecryptionCube"
                  onClick={() => handleNavigate('/rewards')}
                  isActive={true}
                  badge="NEW"
                  wide
                />
                <NavBlock 
                  icon={Target}
                  label="ДЕЙЛИ ЛОГ"
                  sublabel="2/5 выполнено"
                  onClick={() => handleNavigate('/daily')}
                  wide
                />
                
                <NavBlock icon={User} label="ДОСЬЕ" onClick={() => handleNavigate('/profile')} />
                <NavBlock icon={Bell} label="СИГНАЛЫ" badge="3" onClick={() => handleNavigate('/notifications')} />
                <NavBlock icon={Mail} label="ПОЧТА" onClick={() => handleNavigate('/chat')} />
                <NavBlock icon={Package} label="ИНВЕНТАРЬ" onClick={() => handleNavigate('/inventory')} />
                <NavBlock icon={Trophy} label="РЕЙТИНГ" onClick={() => handleNavigate('/rating')} />
                <NavBlock icon={Wallet} label="БАЛАНС" onClick={() => handleNavigate('/wallet')} />
                <NavBlock icon={Shield} label="ДОВЕРИЕ" onClick={() => handleNavigate('/trust')} />
                <NavBlock icon={Settings} label="СИСТЕМА" onClick={() => handleNavigate('/settings')} />
              </div>
              
              {/* Footer */}
              <div style={{
                marginTop: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <TechLabel>SESSION: 0x7F2A...9B3C</TechLabel>
                <TechLabel glow>LATENCY: 12ms</TechLabel>
                <TechLabel>REGION: EU-WEST</TechLabel>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuralHub;
