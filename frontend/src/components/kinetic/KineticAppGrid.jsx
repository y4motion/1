/**
 * KineticAppGrid.jsx - BENTO STYLE App Widgets Grid
 * 
 * Hierarchy: Builder широкий (2x1), остальные разные размеры
 * Glass Material: Acrylic Ghost style
 * Assembly Animation: staggered spring entrance
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cpu, Activity, Users, Trophy, Star, BookOpen, 
  Monitor, ArrowLeftRight, Package
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const springBouncy = { type: "spring", stiffness: 300, damping: 25 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9, rotateX: 10 },
  visible: { 
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: springBouncy
  }
};

// App configurations - BENTO SIZING
// size: 'wide' (2x1), 'tall' (1x2), 'large' (2x2), 'normal' (1x1)
const apps = [
  { 
    id: 'builder', 
    icon: Cpu, 
    title: 'PC BUILDER', 
    subtitle: 'AI-сборка с проверкой совместимости',
    link: '/pc-builder',
    badge: 'AI',
    size: 'wide', // 2x1 - широкий
    stats: { products: 48, categories: 8 }
  },
  { 
    id: 'market', 
    icon: Package, 
    title: 'MARKETPLACE', 
    subtitle: '2.4K товаров',
    link: '/marketplace',
    badge: 'HOT',
    badgePulse: true,
    size: 'normal',
    stats: null
  },
  { 
    id: 'feed', 
    icon: Activity, 
    title: 'COMMUNITY', 
    subtitle: '15.2K участников',
    link: '/community',
    badge: 'LIVE',
    badgePulse: true,
    size: 'normal',
    stats: null
  },
  { 
    id: 'os', 
    icon: Monitor, 
    title: 'MINIMAL OS', 
    subtitle: 'v2.0.4 • Stable',
    link: '/mod',
    badge: null,
    size: 'normal',
    stats: null
  },
  { 
    id: 'swap', 
    icon: ArrowLeftRight, 
    title: 'GLASSY SWAP', 
    subtitle: '156 активных',
    link: '/glassy-swap',
    badge: null,
    size: 'normal',
    stats: null
  },
  { 
    id: 'rating', 
    icon: Trophy, 
    title: 'LEADERBOARD', 
    subtitle: 'Top Builders',
    link: '/rating',
    badge: null,
    size: 'normal',
    stats: null
  },
  { 
    id: 'creators', 
    icon: Star, 
    title: 'CREATORS', 
    subtitle: '51 verified',
    link: '/creators',
    badge: null,
    size: 'normal',
    stats: null
  },
  { 
    id: 'guides', 
    icon: BookOpen, 
    title: 'GUIDES', 
    subtitle: '24 гайда',
    link: '/articles',
    badge: null,
    size: 'normal',
    stats: null
  }
];

const AppWidget = ({ app }) => {
  const Icon = app.icon;
  const isWide = app.size === 'wide';
  
  return (
    <motion.div 
      variants={itemVariants}
      className={app.size === 'wide' ? 'app-widget-wide' : ''}
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
          padding: '28px 32px',
        } : {}}>
          
          <div style={isWide ? { display: 'flex', alignItems: 'center', gap: '20px' } : {}}>
            {/* Icon */}
            <div className="app-icon" style={isWide ? {
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 0,
            } : {}}>
              <Icon size={isWide ? 28 : 28} strokeWidth={1} />
            </div>
            
            {/* Text */}
            <div>
              <div className="app-title" style={isWide ? { fontSize: '14px', marginBottom: '4px' } : {}}>
                {app.title}
              </div>
              <div className="app-subtitle" style={isWide ? { fontSize: '12px', maxWidth: '280px' } : {}}>
                {app.subtitle}
              </div>
            </div>
          </div>
          
          {/* Wide card stats */}
          {isWide && app.stats && (
            <div style={{ 
              display: 'flex', 
              gap: '24px',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              paddingLeft: '24px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  fontFamily: '"JetBrains Mono", monospace',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  {app.stats.products}
                </div>
                <div style={{ 
                  fontSize: '9px', 
                  opacity: 0.4, 
                  letterSpacing: '1px',
                  marginTop: '2px'
                }}>
                  PRODUCTS
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  fontFamily: '"JetBrains Mono", monospace',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  {app.stats.categories}
                </div>
                <div style={{ 
                  fontSize: '9px', 
                  opacity: 0.4, 
                  letterSpacing: '1px',
                  marginTop: '2px'
                }}>
                  CATEGORIES
                </div>
              </div>
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
    >
      {apps.map((app) => (
        <AppWidget key={app.id} app={app} />
      ))}
    </motion.div>
  );
};

export default KineticAppGrid;
