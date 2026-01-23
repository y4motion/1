/**
 * CommunityHub.jsx - Main Community Landing Page
 * 
 * Hub for:
 * - The Network (Feed)
 * - The Consensus (Ideas)
 * - Hall of Monarchs (Leaderboards)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, Lightbulb, Trophy, ChevronRight, 
  TrendingUp, Users, Flame, Star
} from 'lucide-react';
import '../../components/social/social.css';

const springSmooth = { type: "spring", stiffness: 300, damping: 30 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: springSmooth
  }
};

// Hub cards configuration
const hubSections = [
  {
    id: 'network',
    title: 'THE NETWORK',
    subtitle: 'Лента сообщества',
    description: 'Посты, гайды, обзоры железа и софта. Делись своими билдами.',
    icon: Activity,
    path: '/community/network',
    color: '#00FFD4',
    stats: { label: 'POSTS', value: '2.4K' },
    badge: 'LIVE'
  },
  {
    id: 'consensus',
    title: 'THE CONSENSUS',
    subtitle: 'Биржа идей',
    description: 'Предлагай идеи, голосуй за лучшие. Победители воплощаются в жизнь.',
    icon: Lightbulb,
    path: '/community/consensus',
    color: '#FF9F43',
    stats: { label: 'IDEAS', value: '847' },
    badge: 'RP'
  },
  {
    id: 'monarchs',
    title: 'HALL OF MONARCHS',
    subtitle: 'Зал славы',
    description: 'Рейтинги, достижения, легенды сообщества.',
    icon: Trophy,
    path: '/community/monarchs',
    color: '#FFD700',
    stats: { label: 'RANKED', value: '15K' },
    badge: null
  }
];

const HubCard = ({ section }) => {
  const Icon = section.icon;
  const navigate = useNavigate();
  
  return (
    <motion.div 
      variants={itemVariants}
      className="hub-card"
      onClick={() => navigate(section.path)}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="hub-card-inner">
        {/* Glow */}
        <div 
          className="hub-glow"
          style={{ background: `radial-gradient(circle at 30% 30%, ${section.color}15 0%, transparent 60%)` }}
        />
        
        {/* Badge */}
        {section.badge && (
          <span className={`hub-badge ${section.badge === 'LIVE' ? 'live' : ''}`}>
            {section.badge === 'LIVE' && <span className="live-dot" />}
            {section.badge}
          </span>
        )}
        
        {/* Icon */}
        <div className="hub-icon" style={{ color: section.color }}>
          <Icon size={36} strokeWidth={1.5} />
        </div>
        
        {/* Content */}
        <h2 className="hub-title">{section.title}</h2>
        <p className="hub-subtitle">{section.subtitle}</p>
        <p className="hub-description">{section.description}</p>
        
        {/* Stats */}
        <div className="hub-stats">
          <span className="stats-value">{section.stats.value}</span>
          <span className="stats-label">{section.stats.label}</span>
        </div>
        
        {/* Arrow */}
        <div className="hub-arrow">
          <ChevronRight size={20} />
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunityHub() {
  return (
    <div className="community-hub" data-testid="community-hub">
      {/* Header */}
      <motion.header 
        className="hub-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSmooth}
      >
        <div className="hub-header-content">
          <h1 className="hub-main-title">COMMUNITY</h1>
          <p className="hub-main-subtitle">
            Социальное ядро Ghost Protocol
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="hub-quick-stats">
          <div className="quick-stat">
            <Users size={16} />
            <span>15,847 участников</span>
          </div>
          <div className="quick-stat online">
            <span className="online-dot" />
            <span>432 онлайн</span>
          </div>
        </div>
      </motion.header>
      
      {/* Hub Cards Grid */}
      <motion.div 
        className="hub-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {hubSections.map(section => (
          <HubCard key={section.id} section={section} />
        ))}
      </motion.div>
      
      {/* Bottom CTA */}
      <motion.div 
        className="hub-cta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>Нужен уровень 5 для публикаций • Уровень 10 для идей</p>
      </motion.div>
    </div>
  );
}
