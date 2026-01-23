/**
 * HomePage.jsx - KINETIC DOT-OS DASHBOARD
 * Ghost Protocol - Dynamic Living Interface
 * 
 * Style: Nothing aesthetics + Howard.le spring physics
 * Features: Floating Islands, Live Data, Spring Animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './home/HeroSection';
import ShopByCategory from './home/ShopByCategory';
import HotDealsAndPopular from './home/HotDealsAndPopular';
import LatestArticles from './home/LatestArticles';
import { useScrollRevealInit } from '../hooks/useScrollRevealInit';

// Kinetic Dot-OS Components
import { 
  ReviewDeck, 
  LiveTicker, 
  ActivePoll,
  KineticWidget,
  DotText,
  springConfig 
} from './kinetic';

import '../styles/glassmorphism.css';
import '../styles/animations.css';
import './kinetic/kinetic.css';

// Mock data for reviews
const REVIEWS = [
  {
    id: 1,
    text: "Glasspad изменил мой сетап. Идеальное скольжение, премиум ощущения.",
    author: "voidwalker",
    rating: 5
  },
  {
    id: 2,
    text: "Минимализм в лучшем виде. Кабели как искусство.",
    author: "darknode", 
    rating: 5
  },
  {
    id: 3,
    text: "Качество на высоте. Доставка быстрая, упаковка — отдельный кайф.",
    author: "synthwave",
    rating: 4
  }
];

// Mock news for ticker
const NEWS_ITEMS = [
  { id: 1, text: "НОВЫЙ DROP: VOID KEYCAPS УЖЕ В ПРОДАЖЕ" },
  { id: 2, text: "MINIMAL OS 2.1 — ОБНОВЛЕНИЕ ДОСТУПНО" },
  { id: 3, text: "COMMUNITY: 15K BUILDERS ПРИСОЕДИНИЛИСЬ" },
  { id: 4, text: "GLASSY SWAP: НОВЫЕ МОДЕЛИ ДЛЯ ОБМЕНА" },
  { id: 5, text: "ROADMAP Q1 2025: ГОЛОСОВАНИЕ ОТКРЫТО" },
];

// Mock poll data
const ROADMAP_POLL = {
  title: "ROADMAP Q1",
  totalVotes: 3847,
  options: [
    { id: 1, name: "Voice Support", votes: 1647, color: '#FF0000' },
    { id: 2, name: "Dark Theme+", votes: 1200, color: 'white' },
    { id: 3, name: "Mobile App", votes: 1000, color: 'white' }
  ]
};

export default function HomePage() {
  useScrollRevealInit();
  
  const handleReviewExpand = () => {
    // Navigate to full reviews page
    console.log('Navigate to reviews');
  };
  
  const handleNewsClick = (item) => {
    console.log('News clicked:', item.text);
  };
  
  const handleVote = (optionId) => {
    console.log('Voted for:', optionId);
  };

  return (
    <div 
      className="kinetic-home" 
      style={{ minHeight: '100vh', background: '#000' }}
      data-testid="kinetic-home"
    >
      {/* 1. Hero Section (Keep Original) */}
      <HeroSection />

      {/* 2. KINETIC DASHBOARD - Live Feed Zone */}
      <section className="kinetic-dashboard" data-testid="kinetic-dashboard">
        {/* Live Ticker - Full Width */}
        <motion.div 
          className="dashboard-ticker"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={springConfig}
          viewport={{ once: true }}
        >
          <LiveTicker 
            items={NEWS_ITEMS}
            speed={35}
            onItemClick={handleNewsClick}
          />
        </motion.div>

        {/* Floating Islands Row */}
        <div className="dashboard-islands">
          {/* Review Deck - Stacked Cards */}
          <motion.div
            className="island-wrapper island-reviews"
            initial={{ opacity: 0, y: 40, rotateX: -5 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <ReviewDeck 
              reviews={REVIEWS}
              onExpand={handleReviewExpand}
            />
          </motion.div>

          {/* Active Poll - Live Voting */}
          <motion.div
            className="island-wrapper island-poll"
            initial={{ opacity: 0, y: 40, rotateX: -5 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ ...springConfig, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ActivePoll 
              poll={ROADMAP_POLL}
              onVote={handleVote}
            />
          </motion.div>

          {/* Stats Widget */}
          <motion.div
            className="island-wrapper island-stats"
            initial={{ opacity: 0, y: 40, rotateX: -5 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ ...springConfig, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <KineticWidget className="stats-widget" glow>
              <DotText size="sm" color="muted">SYSTEM STATUS</DotText>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">15,847</span>
                  <DotText size="xs" color="muted">BUILDERS</DotText>
                </div>
                <div className="stat-item">
                  <span className="stat-number">3,240</span>
                  <DotText size="xs" color="muted">PRODUCTS</DotText>
                </div>
                <div className="stat-item">
                  <span className="stat-number">98.7%</span>
                  <DotText size="xs" color="muted">UPTIME</DotText>
                </div>
                <div className="stat-item">
                  <span className="stat-number">24/7</span>
                  <DotText size="xs" color="muted">SUPPORT</DotText>
                </div>
              </div>
            </KineticWidget>
          </motion.div>
        </div>
      </section>

      {/* 3. Shop by Category (Keep Original) */}
      <ShopByCategory />

      {/* 4. Hot Deals & Popular (Keep Original) */}
      <HotDealsAndPopular />

      {/* 5. Latest Articles (Keep Original) */}
      <LatestArticles />
    </div>
  );
}
