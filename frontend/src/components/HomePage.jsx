/**
 * HomePage.jsx - GHOST OS COCKPIT
 * 
 * Bento Dashboard with Assembly Animation
 * Dense, hierarchical layout — not a launcher grid
 * 
 * Style: Acrylic Ghost / Clean Future
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Cpu, Activity, ArrowLeftRight, Trophy, Star, 
  BookOpen, Monitor, Users, TrendingUp, Package, Zap,
  ChevronRight, Play, Clock, Eye, Heart, MessageSquare,
  Target, Gift, Sparkles, BarChart3, Layers, Moon, Volume2
} from 'lucide-react';
import { useGhostStore } from '../stores/useGhostStore';
import { TelemetryBar } from './kinetic';

import '../styles/glassmorphism.css';
import '../styles/animations.css';

// ============================================
// ANIMATION CONFIGS
// ============================================

const assemblyContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    }
  }
};

const assemblyItem = {
  hidden: { 
    opacity: 0, 
    y: 40, 
    scale: 0.85,
    rotateX: 15,
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      mass: 1,
    }
  }
};

const heroAssembly = {
  hidden: { opacity: 0, y: -30, scale: 0.95 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 20, delay: 0 }
  }
};

// ============================================
// GLASS CARD COMPONENT
// ============================================

const GlassCard = ({ children, className = '', style = {}, onClick, href, ...props }) => {
  const baseStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    ...style,
  };
  
  const Component = href ? Link : onClick ? 'button' : 'div';
  const linkProps = href ? { to: href } : {};
  
  return (
    <motion.div
      variants={assemblyItem}
      whileHover={{ 
        background: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        y: -2,
      }}
      style={baseStyle}
      {...props}
    >
      <Component 
        {...linkProps} 
        onClick={onClick}
        style={{ 
          display: 'block', 
          height: '100%', 
          textDecoration: 'none',
          color: 'inherit',
          background: 'transparent',
          border: 'none',
          cursor: href || onClick ? 'pointer' : 'default',
          width: '100%',
          textAlign: 'left',
        }}
        className={className}
      >
        {children}
      </Component>
    </motion.div>
  );
};

// ============================================
// HERO SEARCH SECTION
// ============================================

const HeroSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { isZenMode, setZenMode, soundEnabled, setSoundEnabled } = useGhostStore();
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(query)}`);
    }
  };
  
  return (
    <motion.div 
      variants={heroAssembly}
      style={{
        marginBottom: '24px',
      }}
    >
      {/* Main Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
        <div style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <Search size={24} strokeWidth={1.5} style={{ opacity: 0.4 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск товаров, гайдов, пользователей..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '18px',
              color: 'white',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
            }}
            data-testid="hero-search-input"
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.3,
            fontSize: '12px',
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            <kbd style={{
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '6px',
            }}>⌘K</kbd>
          </div>
        </div>
      </form>
      
      {/* Control Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
      }}>
        {/* Status Ticker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          fontSize: '11px',
          fontFamily: '"JetBrains Mono", monospace',
          opacity: 0.4,
          letterSpacing: '1px',
        }}>
          <span><span style={{ color: '#4CAF50' }}>●</span> ONLINE</span>
          <span>USERS: <span style={{ opacity: 0.7 }}>2,847</span></span>
          <span>ORDERS: <span style={{ opacity: 0.7 }}>156</span></span>
          <span>DROP: <span style={{ color: '#FF5722', opacity: 1 }}>VOID KEYCAPS</span></span>
        </div>
        
        {/* Quick Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZenMode(!isZenMode)}
            style={{
              padding: '8px 16px',
              background: isZenMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            <Moon size={14} />
            ZEN
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px 16px',
              background: soundEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            <Volume2 size={14} />
            AMBIENT
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// BENTO WIDGETS
// ============================================

// BUILDER Widget (2x1) - Wide
const BuilderWidget = () => (
  <GlassCard href="/pc-builder" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '12px' 
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Cpu size={24} strokeWidth={1.5} style={{ opacity: 0.7 }} />
          </div>
          <div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              letterSpacing: '1px',
              marginBottom: '2px',
            }}>
              PC BUILDER
            </div>
            <div style={{ 
              fontSize: '11px', 
              opacity: 0.4,
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              AI-POWERED ASSEMBLY
            </div>
          </div>
        </div>
        <div style={{ 
          fontSize: '13px', 
          opacity: 0.5,
          maxWidth: '280px',
          lineHeight: 1.5,
        }}>
          Собери идеальный ПК с проверкой совместимости и AI-рекомендациями
        </div>
      </div>
      
      {/* Mini Preview - Component Icons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        opacity: 0.3,
      }}>
        {['CPU', 'GPU', 'RAM'].map((part, i) => (
          <div key={i} style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            {part}
          </div>
        ))}
      </div>
    </div>
    
    {/* Stats Row */}
    <div style={{ 
      display: 'flex', 
      gap: '24px', 
      marginTop: '20px',
      paddingTop: '16px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div>
        <div style={{ fontSize: '20px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace' }}>48</div>
        <div style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '1px' }}>PRODUCTS</div>
      </div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace' }}>8</div>
        <div style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '1px' }}>CATEGORIES</div>
      </div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace' }}>99%</div>
        <div style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '1px' }}>COMPAT</div>
      </div>
    </div>
  </GlassCard>
);

// MARKET Widget (2x2) - Large Square with Carousel
const MarketWidget = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { title: 'VOID KEYCAPS', subtitle: 'Новый дроп', tag: 'HOT', img: '⌨️' },
    { title: 'RTX 5090', subtitle: 'В наличии', tag: 'NEW', img: '🎮' },
    { title: 'CUSTOM CABLES', subtitle: 'Коллекция', tag: 'SALE', img: '🔌' },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <GlassCard href="/marketplace" style={{ padding: 0, height: '100%' }}>
      <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={20} strokeWidth={1.5} style={{ opacity: 0.6 }} />
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              letterSpacing: '1px' 
            }}>MARKETPLACE</span>
          </div>
          <div style={{
            padding: '4px 10px',
            background: '#FF5722',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '1px',
          }}>
            {slides[activeSlide].tag}
          </div>
        </div>
        
        {/* Featured Product */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ 
                fontSize: '64px', 
                marginBottom: '16px',
                filter: 'grayscale(0.3)',
              }}>
                {slides[activeSlide].img}
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                letterSpacing: '2px',
                marginBottom: '8px',
              }}>
                {slides[activeSlide].title}
              </div>
              <div style={{ 
                fontSize: '13px', 
                opacity: 0.5,
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                {slides[activeSlide].subtitle}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Slide Indicators */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px',
          marginTop: '20px',
        }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === activeSlide ? '24px' : '8px',
                height: '4px',
                borderRadius: '2px',
                background: i === activeSlide ? 'white' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
        
        {/* Quick Stats */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace' }}>2.4K</div>
            <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '1px' }}>PRODUCTS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace' }}>847</div>
            <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '1px' }}>SELLERS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace' }}>15K</div>
            <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '1px' }}>ORDERS</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// COMMUNITY Widget (1x2) - Tall with Featured Post
const CommunityWidget = () => (
  <GlassCard href="/community" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
    {/* Header */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Users size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
        <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>COMMUNITY</span>
      </div>
      <div style={{
        width: '8px',
        height: '8px',
        background: '#4CAF50',
        borderRadius: '50%',
        boxShadow: '0 0 10px #4CAF50',
      }} />
    </div>
    
    {/* Featured Post Preview */}
    <div style={{ 
      flex: 1,
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Post Image */}
      <div style={{
        height: '120px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: '12px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
      }}>
        🖥️
      </div>
      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
        White Setup 2024
      </div>
      <div style={{ 
        fontSize: '11px', 
        opacity: 0.4,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>@ghost_user</span>
        <span>•</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Heart size={10} /> 847
        </span>
      </div>
    </div>
    
    {/* Stats */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      padding: '12px 0',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div>
        <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace' }}>15.2K</div>
        <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '1px' }}>MEMBERS</div>
      </div>
      <div>
        <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: '"JetBrains Mono", monospace' }}>342</div>
        <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '1px' }}>ONLINE</div>
      </div>
    </div>
  </GlassCard>
);

// ROADMAP Widget with Active Voting
const RoadmapWidget = () => (
  <GlassCard href="/voting" style={{ padding: '24px' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Target size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
        <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>ROADMAP</span>
      </div>
      <span style={{ 
        fontSize: '10px', 
        opacity: 0.4,
        fontFamily: '"JetBrains Mono", monospace',
      }}>Q1 2025</span>
    </div>
    
    {/* Active Idea */}
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      padding: '16px',
    }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
        Dark Theme V2
      </div>
      
      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '85%' }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '11px',
        opacity: 0.5,
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        <span>85% COMPLETE</span>
        <span>1,247 VOTES</span>
      </div>
    </div>
  </GlassCard>
);

// SWAP Widget
const SwapWidget = () => (
  <GlassCard href="/glassy-swap" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{
        width: '44px',
        height: '44px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ArrowLeftRight size={20} strokeWidth={1.5} style={{ opacity: 0.7 }} />
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '1px' }}>GLASSY SWAP</div>
        <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>P2P EXCHANGE</div>
      </div>
    </div>
    
    <div style={{ 
      display: 'flex', 
      gap: '16px',
      fontSize: '11px',
      opacity: 0.5,
    }}>
      <div>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '14px', opacity: 1 }}>156</span>
        <span style={{ marginLeft: '4px' }}>active</span>
      </div>
      <div>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '14px', opacity: 1 }}>2.4K</span>
        <span style={{ marginLeft: '4px' }}>total</span>
      </div>
    </div>
  </GlassCard>
);

// RATING Widget
const RatingWidget = () => (
  <GlassCard href="/rating" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{
        width: '44px',
        height: '44px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Trophy size={20} strokeWidth={1.5} style={{ opacity: 0.7 }} />
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '1px' }}>LEADERBOARD</div>
        <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>TOP BUILDERS</div>
      </div>
    </div>
    
    {/* Top 3 Mini List */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {['VOID_ARCH', 'N1GHTM4R3', 'GHOST'].map((name, i) => (
        <div key={i} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '11px',
        }}>
          <span style={{ 
            width: '16px', 
            opacity: 0.4,
            fontFamily: '"JetBrains Mono", monospace',
          }}>{i + 1}</span>
          <span style={{ opacity: 0.7 }}>{name}</span>
        </div>
      ))}
    </div>
  </GlassCard>
);

// GUIDES Widget
const GuidesWidget = () => (
  <GlassCard href="/articles" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <BookOpen size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
      <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>GUIDES</span>
    </div>
    
    <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '12px' }}>
      Гайд по сборке Mini-ITX
    </div>
    
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: '12px',
      fontSize: '10px',
      opacity: 0.4,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Eye size={10} /> 2.4K
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={10} /> 12 min
      </span>
    </div>
  </GlassCard>
);

// CREATORS Widget
const CreatorsWidget = () => (
  <GlassCard href="/creators" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <Star size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
      <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>CREATORS</span>
    </div>
    
    {/* Avatar Stack */}
    <div style={{ display: 'flex', marginBottom: '12px' }}>
      {[1, 2, 3, 4].map((_, i) => (
        <div key={i} style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: `rgba(255,255,255,${0.1 - i * 0.02})`,
          border: '2px solid #020202',
          marginLeft: i > 0 ? '-8px' : 0,
        }} />
      ))}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        border: '2px solid #020202',
        marginLeft: '-8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        +47
      </div>
    </div>
    
    <div style={{ fontSize: '10px', opacity: 0.4 }}>
      51 verified creators
    </div>
  </GlassCard>
);

// MINIMAL OS Widget
const MinimalOSWidget = () => (
  <GlassCard href="/mod" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{
        width: '44px',
        height: '44px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Monitor size={20} strokeWidth={1.5} style={{ opacity: 0.7 }} />
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '1px' }}>MINIMAL OS</div>
        <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>v2.0.4</div>
      </div>
    </div>
    
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: '8px',
      fontSize: '11px',
    }}>
      <div style={{
        padding: '4px 8px',
        background: 'rgba(76, 175, 80, 0.2)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '6px',
        color: '#4CAF50',
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        STABLE
      </div>
      <span style={{ opacity: 0.4 }}>12.8K downloads</span>
    </div>
  </GlassCard>
);

// ============================================
// MAIN HOMEPAGE
// ============================================

export default function HomePage() {
  const { isZenMode } = useGhostStore();

  return (
    <div 
      className="ghost-os-dashboard" 
      style={{ 
        minHeight: '100vh', 
        background: 'transparent',
        paddingTop: '20px',
      }}
      data-testid="ghost-os-dashboard"
    >
      <motion.main 
        className="kinetic-workspace"
        style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '20px 24px 60px' 
        }}
        variants={assemblyContainer}
        initial="hidden"
        animate="visible"
      >
        {/* HERO SEARCH */}
        <HeroSearch />
        
        {/* BENTO GRID */}
        {!isZenMode && (
          <div 
            style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'auto auto auto',
              gap: '16px',
            }}
          >
            {/* Row 1: Builder (2x1) + Community (1x2 spanning 2 rows) + Market (2x2 spanning 2 rows) */}
            <div style={{ gridColumn: 'span 2' }}>
              <BuilderWidget />
            </div>
            
            <div style={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
              <CommunityWidget />
            </div>
            
            <div style={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
              <MarketWidget />
            </div>
            
            {/* Row 2: Roadmap + Swap */}
            <div style={{ gridColumn: 'span 1' }}>
              <RoadmapWidget />
            </div>
            
            <div style={{ gridColumn: 'span 1' }}>
              <SwapWidget />
            </div>
            
            {/* Row 3: Rating + Guides + Creators + MinimalOS */}
            <div style={{ gridColumn: 'span 1' }}>
              <RatingWidget />
            </div>
            
            <div style={{ gridColumn: 'span 1' }}>
              <GuidesWidget />
            </div>
            
            <div style={{ gridColumn: 'span 1' }}>
              <CreatorsWidget />
            </div>
            
            <div style={{ gridColumn: 'span 1' }}>
              <MinimalOSWidget />
            </div>
          </div>
        )}
        
        {/* ZEN MODE - Minimal View */}
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
            }}
          >
            <div style={{ 
              fontSize: '12px', 
              letterSpacing: '4px', 
              opacity: 0.3,
              fontFamily: '"JetBrains Mono", monospace',
              marginBottom: '16px',
            }}>
              ZEN MODE ACTIVE
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '200', 
              letterSpacing: '8px',
              opacity: 0.1,
            }}>
              GHOST
            </div>
          </motion.div>
        )}
      </motion.main>

      {/* TELEMETRY BAR */}
      <TelemetryBar />
    </div>
  );
}
