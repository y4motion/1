/**
 * NeuralHub.jsx - TACTICAL FUI v5.0
 * 
 * Full-screen Future User Interface
 * Style: Star Citizen / Cyberpunk 2077 / Iron Man
 * 
 * STRICT MONOCHROME + CYAN ACCENT ONLY
 * Technical decoration: corners, grids, barcodes
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

// Corner Brackets - FUI decoration
const CornerBrackets = () => (
  <>
    {/* Top Left */}
    <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '2px', background: 'rgba(255,255,255,0.3)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '30px', background: 'rgba(255,255,255,0.3)' }} />
    </div>
    {/* Top Right */}
    <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '2px', background: 'rgba(255,255,255,0.3)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '2px', height: '30px', background: 'rgba(255,255,255,0.3)' }} />
    </div>
    {/* Bottom Left */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '2px', background: 'rgba(255,255,255,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '2px', height: '30px', background: 'rgba(255,255,255,0.3)' }} />
    </div>
    {/* Bottom Right */}
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px' }}>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '2px', background: 'rgba(255,255,255,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '2px', height: '30px', background: 'rgba(255,255,255,0.3)' }} />
    </div>
  </>
);

// Scanline animation overlay
const ScanlineOverlay = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    opacity: 0.03,
  }}>
    <motion.div
      animate={{ y: ['0%', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      style={{
        width: '100%',
        height: '4px',
        background: 'linear-gradient(180deg, transparent, white, transparent)',
      }}
    />
  </div>
);

// Grid background pattern
const GridPattern = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  }} />
);

// Tech text decoration
const TechLabel = ({ children, style = {} }) => (
  <span style={{
    fontSize: '8px',
    fontFamily: '"JetBrains Mono", monospace',
    letterSpacing: '2px',
    opacity: 0.25,
    ...style
  }}>
    {children}
  </span>
);

// Fake QR Code
const FakeQR = () => (
  <div style={{
    width: '50px',
    height: '50px',
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    opacity: 0.3,
  }}>
    {Array.from({ length: 49 }).map((_, i) => (
      <div 
        key={i}
        style={{
          background: Math.random() > 0.5 ? 'white' : 'transparent',
          aspectRatio: '1',
        }}
      />
    ))}
  </div>
);

// Barcode
const Barcode = () => (
  <div style={{
    display: 'flex',
    gap: '1px',
    height: '20px',
    opacity: 0.25,
  }}>
    {Array.from({ length: 30 }).map((_, i) => (
      <div 
        key={i}
        style={{
          width: Math.random() > 0.5 ? '2px' : '1px',
          height: '100%',
          background: 'white',
        }}
      />
    ))}
  </div>
);

// Stat Bar - Monochrome
const StatBar = ({ label, value, max, isAccent = false }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      marginBottom: '4px',
      fontSize: '9px',
      fontFamily: 'monospace',
      letterSpacing: '2px',
    }}>
      <span style={{ opacity: 0.4 }}>{label}</span>
      <span style={{ 
        opacity: isAccent ? 1 : 0.6,
        color: isAccent ? '#00FFD4' : 'white'
      }}>
        {value}/{max}
      </span>
    </div>
    <div style={{
      height: '3px',
      background: 'rgba(255,255,255,0.08)',
      position: 'relative',
    }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value/max) * 100}%` }}
        transition={{ duration: 1 }}
        style={{
          height: '100%',
          background: isAccent ? '#00FFD4' : 'rgba(255,255,255,0.5)',
          boxShadow: isAccent ? '0 0 10px #00FFD450' : 'none',
        }}
      />
    </div>
  </div>
);

// Navigation Block - Dense Bento style
const NavBlock = ({ icon: Icon, label, sublabel, badge, onClick, isActive, wide }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
    whileTap={{ scale: 0.98 }}
    style={{
      padding: wide ? '20px 24px' : '16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: wide ? 'row' : 'column',
      alignItems: wide ? 'center' : 'center',
      gap: wide ? '16px' : '10px',
      cursor: 'pointer',
      color: 'white',
      position: 'relative',
      fontFamily: 'inherit',
      gridColumn: wide ? 'span 2' : 'span 1',
    }}
  >
    {/* Active indicator */}
    {isActive && (
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '2px',
        background: '#00FFD4',
      }}
      />
    )}
    
    <div style={{
      width: wide ? '48px' : '40px',
      height: wide ? '48px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <Icon size={wide ? 22 : 18} strokeWidth={1} style={{ opacity: 0.7 }} />
    </div>
    
    <div style={{ 
      flex: wide ? 1 : 'none',
      textAlign: wide ? 'left' : 'center' 
    }}>
      <div style={{ 
        fontSize: wide ? '13px' : '10px', 
        fontWeight: '500',
        letterSpacing: '1px',
        marginBottom: sublabel ? '2px' : 0
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ 
          fontSize: '9px', 
          opacity: 0.3,
          fontFamily: 'monospace',
        }}>
          {sublabel}
        </div>
      )}
    </div>
    
    {badge && (
      <span style={{
        position: wide ? 'relative' : 'absolute',
        top: wide ? 'auto' : '8px',
        right: wide ? 'auto' : '8px',
        minWidth: '18px',
        height: '18px',
        padding: '0 5px',
        background: '#00FFD4',
        color: 'black',
        fontSize: '9px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
      }}>
        {badge}
      </span>
    )}
  </motion.button>
);

// TACTICAL HUD Component
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
          transition={{ duration: 0.2 }}
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
          <div 
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(20px)',
            }}
          />
          
          {/* TACTICAL HUD CONTAINER */}
          <motion.div
            ref={hubRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'relative',
              width: '1100px',
              height: '650px',
              background: 'rgba(5, 5, 5, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              color: 'white',
            }}
            data-testid="neural-hub"
          >
            {/* Grid background */}
            <GridPattern />
            
            {/* Scanline */}
            <ScanlineOverlay />
            
            {/* Corner brackets */}
            <CornerBrackets />
            
            {/* Tech labels - perimeter */}
            <div style={{ position: 'absolute', top: '8px', left: '40px' }}>
              <TechLabel>SYS.ID: 99402-ARCH</TechLabel>
            </div>
            <div style={{ position: 'absolute', top: '8px', right: '50px' }}>
              <TechLabel>SYNC: STABLE</TechLabel>
            </div>
            <div style={{ position: 'absolute', bottom: '8px', left: '40px' }}>
              <TechLabel>NEURAL.HUB v5.0</TechLabel>
            </div>
            <div style={{ position: 'absolute', bottom: '8px', right: '50px' }}>
              <TechLabel>UPTIME: 403:27:14</TechLabel>
            </div>

            {/* ==========================================
                LEFT PANEL: IDENTITY
                ========================================== */}
            <div style={{
              padding: '40px 30px',
              background: 'rgba(0,0,0,0.4)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Avatar - Square with clipped corners */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.15)',
                  clipPath: 'polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  position: 'relative',
                }}>
                  {/* Avatar content - monochrome icon */}
                  <User size={50} strokeWidth={1} style={{ opacity: 0.4 }} />
                  
                  {/* Corner accents */}
                  <div style={{ position: 'absolute', top: '8px', left: '8px', width: '8px', height: '8px', borderTop: '1px solid #00FFD4', borderLeft: '1px solid #00FFD4' }} />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '8px', height: '8px', borderBottom: '1px solid #00FFD4', borderRight: '1px solid #00FFD4' }} />
                </div>
                
                {/* Name */}
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  letterSpacing: '2px',
                  marginBottom: '6px'
                }}>
                  VOID_ARCHITECT
                </div>
                
                {/* Class */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '9px',
                    padding: '3px 10px',
                    border: '1px solid rgba(0,255,212,0.3)',
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    color: '#00FFD4',
                  }}>
                    LVL.99
                  </span>
                  <span style={{ 
                    fontSize: '9px',
                    opacity: 0.4,
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
                  gap: '12px',
                  marginTop: '8px'
                }}>
                  <FakeQR />
                  <div>
                    <Barcode />
                    <TechLabel style={{ marginTop: '4px', display: 'block' }}>
                      ID: 0xF7A9...2D4E
                    </TechLabel>
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div style={{ 
                height: '1px', 
                background: 'rgba(255,255,255,0.06)',
                margin: '16px 0'
              }} />
              
              {/* Stats */}
              <div style={{ marginBottom: '16px' }}>
                <TechLabel style={{ display: 'block', marginBottom: '12px' }}>
                  SYSTEM.VITALS
                </TechLabel>
                <StatBar label="РЕЗОНАНС" value={4850} max={5000} isAccent={true} />
                <StatBar label="ЭНТРОПИЯ" value={8} max={100} />
                <StatBar label="ДОВЕРИЕ" value={99} max={100} />
              </div>
              
              {/* Achievements - monochrome icons */}
              <div>
                <TechLabel style={{ display: 'block', marginBottom: '10px' }}>
                  ДОСТИЖЕНИЯ [24/24]
                </TechLabel>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px'
                }}>
                  {[Shield, Trophy, Zap, Database, LayoutGrid].map((Icon, i) => (
                    <div 
                      key={i}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <Icon size={14} strokeWidth={1} style={{ opacity: 0.5 }} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Spacer */}
              <div style={{ flex: 1 }} />
              
              {/* Disconnect */}
              <motion.button
                onClick={() => { logout(); onClose(); }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                style={{
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                }}
              >
                <Eye size={12} strokeWidth={1} />
                ОТКЛЮЧИТЬСЯ
              </motion.button>
            </div>
            
            {/* ==========================================
                RIGHT PANEL: OPERATIONS
                ========================================== */}
            <div style={{
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Cpu size={14} strokeWidth={1} style={{ opacity: 0.4 }} />
                  <TechLabel style={{ fontSize: '10px' }}>ОПЕРАЦИИ</TechLabel>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    opacity: 0.5,
                  }}
                >
                  <X size={14} strokeWidth={1} />
                </motion.button>
              </div>
              
              {/* BENTO GRID - Dense blocks */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '2px',
                flex: 1,
              }}>
                {/* Row 1: Action banners (wide) */}
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
                
                {/* Row 2-3: Navigation tiles */}
                <NavBlock 
                  icon={User} 
                  label="ДОСЬЕ" 
                  onClick={() => handleNavigate('/profile')}
                />
                <NavBlock 
                  icon={Bell} 
                  label="СИГНАЛЫ" 
                  badge="3"
                  onClick={() => handleNavigate('/notifications')}
                />
                <NavBlock 
                  icon={Mail} 
                  label="ПОЧТА" 
                  onClick={() => handleNavigate('/chat')}
                />
                <NavBlock 
                  icon={Package} 
                  label="ИНВЕНТАРЬ" 
                  onClick={() => handleNavigate('/inventory')}
                />
                <NavBlock 
                  icon={Trophy} 
                  label="РЕЙТИНГ" 
                  onClick={() => handleNavigate('/rating')}
                />
                <NavBlock 
                  icon={Wallet} 
                  label="БАЛАНС" 
                  onClick={() => handleNavigate('/wallet')}
                />
                <NavBlock 
                  icon={Shield} 
                  label="ДОВЕРИЕ" 
                  onClick={() => handleNavigate('/trust')}
                />
                <NavBlock 
                  icon={Settings} 
                  label="СИСТЕМА" 
                  onClick={() => handleNavigate('/settings')}
                />
              </div>
              
              {/* Footer tech info */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <TechLabel>SESSION: 0x7F2A...9B3C</TechLabel>
                <TechLabel>LATENCY: 12ms</TechLabel>
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
