/**
 * KineticAppGrid.jsx - App Widgets Grid (4x2)
 * 
 * Replaces QuickAccessGrid with Kinetic style
 * Each widget shows live status and reacts to hover
 * Some widgets have Proximity Effect - dots scatter on mouse approach
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cpu, Activity, Users, Trophy, Star, BookOpen, 
  Monitor, ArrowLeftRight 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProximityDots } from './CodeAbyss';

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

// App configurations - STRICT MONOCHROME (Only white icons, red dots for indicators)
const apps = [
  { 
    id: 'builder', 
    icon: Cpu, 
    title: 'BUILDER', 
    subtitle: 'Собрать ПК',
    link: '/pc-builder',
    badge: 'AI',
    color: '#FFFFFF'
  },
  { 
    id: 'feed', 
    icon: Activity, 
    title: 'FEED', 
    subtitle: 'Сообщество',
    link: '/community',
    badge: 'LIVE',
    badgePulse: true,
    color: '#FFFFFF'
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
    link: '/glassy-swap',
    badge: null,
    color: '#FFFFFF'
  },
  { 
    id: 'rating', 
    icon: Trophy, 
    title: 'RATING', 
    subtitle: 'Рейтинг',
    link: '/rating',
    badge: null,
    color: '#FFFFFF'
  },
  { 
    id: 'creators', 
    icon: Star, 
    title: 'CREATORS', 
    subtitle: 'Авторы',
    link: '/creators',
    badge: null,
    color: '#FFFFFF'
  },
  { 
    id: 'guides', 
    icon: BookOpen, 
    title: 'GUIDES', 
    subtitle: 'Гайды',
    link: '/articles',
    badge: null,
    color: '#FFFFFF'
  },
  { 
    id: 'groupbuy', 
    icon: Users, 
    title: 'GROUP BUY', 
    subtitle: 'До -40%',
    link: '/groupbuy',
    badge: 'HOT',
    color: '#FFFFFF'
  }
];

const AppWidget = ({ app }) => {
  const Icon = app.icon;
  
  return (
    <motion.div variants={itemVariants}>
      <Link to={app.link} className="app-widget" data-testid={`app-${app.id}`}>
        <div className="app-widget-inner">
          {/* Icon - monochrome, thin stroke */}
          <div className="app-icon">
            <Icon size={28} strokeWidth={1} />
          </div>
          
          {/* Title */}
          <div className="app-title">{app.title}</div>
          <div className="app-subtitle">{app.subtitle}</div>
          
          {/* Badge - only red for LIVE, else muted */}
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
