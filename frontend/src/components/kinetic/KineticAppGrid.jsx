/**
 * KineticAppGrid.jsx - App Widgets Grid (4x2)
 * 
 * Replaces QuickAccessGrid with Kinetic style
 * Each widget shows live status and reacts to hover
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cpu, Activity, Users, Trophy, Star, BookOpen, 
  Monitor, ArrowLeftRight 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const springBouncy = { type: "spring", stiffness: 400, damping: 20 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: springBouncy
  }
};

// App configurations
const apps = [
  { 
    id: 'builder', 
    icon: Cpu, 
    title: 'BUILDER', 
    subtitle: 'Собрать ПК',
    link: '/assembly',
    badge: 'AI',
    color: '#00FFD4'
  },
  { 
    id: 'feed', 
    icon: Activity, 
    title: 'FEED', 
    subtitle: 'Сообщество',
    link: '/feed',
    badge: 'LIVE',
    badgePulse: true,
    color: '#FF0000'
  },
  { 
    id: 'os', 
    icon: Monitor, 
    title: 'MINIMAL OS', 
    subtitle: 'v2.0.4',
    link: '/mod',
    badge: null,
    color: '#FFFFFF'
  },
  { 
    id: 'swap', 
    icon: ArrowLeftRight, 
    title: 'SWAP', 
    subtitle: 'Обменник',
    link: '/swap',
    badge: null,
    color: '#FF9F43'
  },
  { 
    id: 'rating', 
    icon: Trophy, 
    title: 'RATING', 
    subtitle: 'Рейтинг',
    link: '/rating',
    badge: null,
    color: '#FFD700'
  },
  { 
    id: 'creators', 
    icon: Star, 
    title: 'CREATORS', 
    subtitle: 'Авторы',
    link: '/creators',
    badge: null,
    color: '#A855F7'
  },
  { 
    id: 'guides', 
    icon: BookOpen, 
    title: 'GUIDES', 
    subtitle: 'Гайды',
    link: '/articles',
    badge: null,
    color: '#3B82F6'
  },
  { 
    id: 'groupbuy', 
    icon: Users, 
    title: 'GROUP BUY', 
    subtitle: 'До -40%',
    link: '/groupbuy',
    badge: 'HOT',
    color: '#EF4444'
  }
];

const AppWidget = ({ app }) => {
  const Icon = app.icon;
  
  return (
    <motion.div variants={itemVariants}>
      <Link to={app.link} className="app-widget" data-testid={`app-${app.id}`}>
        <div className="app-widget-inner">
          {/* Glow background */}
          <div 
            className="app-glow" 
            style={{ background: `radial-gradient(circle at 50% 50%, ${app.color}15 0%, transparent 70%)` }} 
          />
          
          {/* Icon */}
          <div className="app-icon" style={{ color: app.color }}>
            <Icon size={28} strokeWidth={1.5} />
          </div>
          
          {/* Title */}
          <div className="app-title">{app.title}</div>
          <div className="app-subtitle">{app.subtitle}</div>
          
          {/* Badge */}
          {app.badge && (
            <span className={`app-badge ${app.badgePulse ? 'pulse' : ''}`}>
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
