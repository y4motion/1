/**
 * KineticAppGrid.jsx - BENTO DASHBOARD
 * 
 * Русские названия, ZEN/AMBIENT в сетке как квадраты
 * Объединённые виджеты: Сообщество+Лента, Рейтинг+Roadmap
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cpu, Activity, Users, Trophy, Star, BookOpen, 
  Monitor, ArrowLeftRight, Package, Moon, Volume2, VolumeX,
  Wind, CloudRain, Flame, Trees, Waves, Target, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGhostStore } from '../../stores/useGhostStore';

const springBouncy = { type: "spring", stiffness: 300, damping: 25 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.92, rotateX: 8 },
  visible: { 
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: springBouncy
  }
};

// Sound presets
const SOUND_PRESETS = [
  { id: 'off', icon: VolumeX, name: 'ТИШИНА' },
  { id: 'rain', icon: CloudRain, name: 'ДОЖДЬ' },
  { id: 'forest', icon: Trees, name: 'ЛЕС' },
  { id: 'ocean', icon: Waves, name: 'ОКЕАН' },
  { id: 'fire', icon: Flame, name: 'ОГОНЬ' },
  { id: 'wind', icon: Wind, name: 'ВЕТЕР' },
];

// ============================================
// ZEN MODE WIDGET - Square
// ============================================
const ZenWidget = () => {
  const { isZenMode, setZenMode } = useGhostStore();
  
  return (
    <motion.div variants={itemVariants}>
      <button 
        onClick={() => setZenMode(!isZenMode)}
        className="app-widget"
        data-testid="zen-widget"
        style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <div className="app-widget-inner" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          minHeight: '120px',
          background: isZenMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.3s ease',
        }}>
          <Moon 
            size={28} 
            strokeWidth={1} 
            style={{ 
              marginBottom: '12px',
              opacity: isZenMode ? 1 : 0.5,
              color: 'white',
            }} 
          />
          <div style={{
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
          }}>
            ДЗЕН
          </div>
          <div style={{
            width: '32px',
            height: '4px',
            borderRadius: '2px',
            background: isZenMode ? 'white' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease',
          }} />
        </div>
      </button>
    </motion.div>
  );
};

// ============================================
// AMBIENT SOUND WIDGET - Square with swappable icons
// ============================================
const AmbientWidget = () => {
  const { soundPreset, setSoundPreset, soundEnabled, setSoundEnabled } = useGhostStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const cycleSound = () => {
    const nextIndex = (currentIndex + 1) % SOUND_PRESETS.length;
    setCurrentIndex(nextIndex);
    const preset = SOUND_PRESETS[nextIndex];
    
    if (preset.id === 'off') {
      setSoundEnabled(false);
    } else {
      setSoundPreset(preset.id);
      setSoundEnabled(true);
    }
  };
  
  const currentPreset = SOUND_PRESETS[currentIndex];
  const CurrentIcon = currentPreset.icon;
  const isActive = soundEnabled && currentPreset.id !== 'off';
  
  return (
    <motion.div variants={itemVariants}>
      <button 
        onClick={cycleSound}
        className="app-widget"
        data-testid="ambient-widget"
        style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <div className="app-widget-inner" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          minHeight: '120px',
          background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.3s ease',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPreset.id}
              initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.2 }}
              style={{ marginBottom: '12px' }}
            >
              <CurrentIcon 
                size={28} 
                strokeWidth={1} 
                style={{ 
                  opacity: isActive ? 1 : 0.5,
                  color: 'white',
                }} 
              />
            </motion.div>
          </AnimatePresence>
          <div style={{
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '4px',
          }}>
            ЗВУК
          </div>
          <div style={{
            fontSize: '9px',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.4)',
          }}>
            {currentPreset.name}
          </div>
        </div>
      </button>
    </motion.div>
  );
};

// ============================================
// STANDARD WIDGET COMPONENT
// ============================================
const AppWidget = ({ app }) => {
  const Icon = app.icon;
  const isWide = app.size === 'wide';
  
  return (
    <motion.div 
      variants={itemVariants}
      style={isWide ? { gridColumn: 'span 2' } : {}}
    >
      <Link 
        to={app.link} 
        className={`app-widget ${app.size || ''}`}
        data-testid={`app-${app.id}`}
      >
        <div className="app-widget-inner" style={isWide ? { 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '24px 28px',
        } : {}}>
          
          <div style={isWide ? { display: 'flex', alignItems: 'center', gap: '16px' } : {}}>
            <div className="app-icon" style={isWide ? {
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 0,
            } : {}}>
              <Icon size={isWide ? 24 : 28} strokeWidth={1} />
            </div>
            
            <div>
              <div className="app-title" style={isWide ? { fontSize: '13px', marginBottom: '2px' } : {}}>
                {app.title}
              </div>
              <div className="app-subtitle" style={isWide ? { fontSize: '11px' } : {}}>
                {app.subtitle}
              </div>
            </div>
          </div>
          
          {/* Wide card stats */}
          {isWide && app.stats && (
            <div style={{ 
              display: 'flex', 
              gap: '20px',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              paddingLeft: '20px',
            }}>
              {Object.entries(app.stats).map(([key, val]) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    fontFamily: '"JetBrains Mono", monospace',
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    {val}
                  </div>
                  <div style={{ 
                    fontSize: '8px', 
                    opacity: 0.4, 
                    letterSpacing: '0.5px',
                    marginTop: '2px',
                    textTransform: 'uppercase',
                  }}>
                    {key}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Badge */}
          {app.badge && (
            <span className={`app-badge ${app.badgePulse ? 'pulse' : ''}`}>
              {app.badgePulse && <span className="badge-dot" />}
              {app.badge}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

// ============================================
// COMBINED COMMUNITY+NETWORK WIDGET
// ============================================
const CommunityNetworkWidget = () => (
  <motion.div variants={itemVariants} style={{ gridColumn: 'span 2' }}>
    <Link to="/community" className="app-widget wide" data-testid="app-community">
      <div className="app-widget-inner" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users size={24} strokeWidth={1} style={{ opacity: 0.7 }} />
          </div>
          <div>
            <div className="app-title" style={{ fontSize: '13px', marginBottom: '2px' }}>
              СООБЩЕСТВО
            </div>
            <div className="app-subtitle" style={{ fontSize: '11px' }}>
              Лента • Посты • Обсуждения
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          paddingLeft: '20px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              fontFamily: '"JetBrains Mono", monospace',
              color: 'rgba(255,255,255,0.8)'
            }}>15.2K</div>
            <div style={{ fontSize: '8px', opacity: 0.4, letterSpacing: '0.5px' }}>УЧАСТНИКИ</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              fontFamily: '"JetBrains Mono", monospace',
              color: 'rgba(255,255,255,0.8)'
            }}>342</div>
            <div style={{ fontSize: '8px', opacity: 0.4, letterSpacing: '0.5px' }}>ОНЛАЙН</div>
          </div>
        </div>
        
        <span className="app-badge pulse">
          <span className="badge-dot" />
          LIVE
        </span>
      </div>
    </Link>
  </motion.div>
);

// ============================================
// COMBINED RATING+ROADMAP WIDGET
// ============================================
const RatingRoadmapWidget = () => (
  <motion.div variants={itemVariants} style={{ gridColumn: 'span 2' }}>
    <Link to="/rating" className="app-widget wide" data-testid="app-rating">
      <div className="app-widget-inner" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,159,67,0.1)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Trophy size={24} strokeWidth={1} style={{ opacity: 0.8, color: '#FF9F43' }} />
          </div>
          <div>
            <div className="app-title" style={{ fontSize: '13px', marginBottom: '2px' }}>
              РЕЙТИНГ & ROADMAP
            </div>
            <div className="app-subtitle" style={{ fontSize: '11px' }}>
              Лидеры • Голосования • Идеи
            </div>
          </div>
        </div>
        
        {/* Top idea preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
        }}>
          <div>
            <div style={{ 
              fontSize: '11px', 
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '4px',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              TOP ИДЕЯ
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
              Dark Theme V2
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(255,159,67,0.15)',
            borderRadius: '8px',
          }}>
            <ChevronUp size={14} style={{ color: '#FF9F43' }} />
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '600',
              color: '#FF9F43',
              fontFamily: '"JetBrains Mono", monospace',
            }}>1.2K</span>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          paddingLeft: '20px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              fontFamily: '"JetBrains Mono", monospace',
              color: 'rgba(255,255,255,0.8)'
            }}>Top 50</div>
            <div style={{ fontSize: '8px', opacity: 0.4, letterSpacing: '0.5px' }}>ЛИДЕРЫ</div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

// ============================================
// APP CONFIGURATIONS - РУССКИЕ НАЗВАНИЯ
// ============================================
const apps = [
  { 
    id: 'builder', 
    icon: Cpu, 
    title: 'СБОРКА ПК', 
    subtitle: 'AI-проверка совместимости',
    link: '/pc-builder',
    badge: 'AI',
    size: 'wide',
    stats: { товары: 48, категории: 8 }
  },
  { 
    id: 'market', 
    icon: Package, 
    title: 'МАРКЕТ', 
    subtitle: '2.4K товаров',
    link: '/marketplace',
    badge: 'HOT',
    badgePulse: true,
    size: 'normal',
  },
  { 
    id: 'os', 
    icon: Monitor, 
    title: 'МИНИМАЛ ОС', 
    subtitle: 'v2.0.4',
    link: '/mod',
    size: 'normal',
  },
  { 
    id: 'swap', 
    icon: ArrowLeftRight, 
    title: 'ОБМЕН', 
    subtitle: '156 активных',
    link: '/glassy-swap',
    size: 'normal',
  },
  { 
    id: 'creators', 
    icon: Star, 
    title: 'АВТОРЫ', 
    subtitle: '51 verified',
    link: '/creators',
    size: 'normal',
  },
  { 
    id: 'guides', 
    icon: BookOpen, 
    title: 'ГАЙДЫ', 
    subtitle: '24 статьи',
    link: '/articles',
    size: 'normal',
  },
];

// ============================================
// MAIN GRID COMPONENT
// ============================================
export const KineticAppGrid = ({ className = '' }) => {
  const { user } = useAuth();
  
  return (
    <motion.div 
      className={`kinetic-app-grid ${className}`}
      data-testid="kinetic-app-grid"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}
    >
      {/* Row 1: СБОРКА ПК (wide) + МАРКЕТ + МИНИМАЛ ОС */}
      <AppWidget app={apps[0]} />
      <AppWidget app={apps[1]} />
      <AppWidget app={apps[2]} />
      
      {/* Row 2: СООБЩЕСТВО (wide) + ОБМЕН + АВТОРЫ */}
      <CommunityNetworkWidget />
      <AppWidget app={apps[3]} />
      <AppWidget app={apps[4]} />
      
      {/* Row 3: РЕЙТИНГ & ROADMAP (wide) + ГАЙДЫ + ZEN */}
      <RatingRoadmapWidget />
      <AppWidget app={apps[5]} />
      <ZenWidget />
      
      {/* Row 4: AMBIENT (sound) - standalone */}
      <AmbientWidget />
    </motion.div>
  );
};

export default KineticAppGrid;
