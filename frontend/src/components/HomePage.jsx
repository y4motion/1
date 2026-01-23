/**
 * HomePage.jsx - KINETIC DOT-OS FLUID DASHBOARD
 * 
 * Implements: /app/design/KINETIC_UI_SPEC.md
 * - Fluid flex layout with motion.div layout prop
 * - Stagger entrance animations
 * - Smart widget resizing
 */

import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import HeroSection from './home/HeroSection';
import ShopByCategory from './home/ShopByCategory';
import HotDealsAndPopular from './home/HotDealsAndPopular';
import LatestArticles from './home/LatestArticles';
import { useScrollRevealInit } from '../hooks/useScrollRevealInit';

// Kinetic Components
import { 
  ReviewDeck, 
  LiveTicker, 
  ActivePoll,
  KineticWidget,
  DotText
} from './kinetic';

import '../styles/glassmorphism.css';
import '../styles/animations.css';
import './kinetic/kinetic.css';

// Spring presets from spec
const springSmooth = { type: "spring", stiffness: 300, damping: 30 };

// Stagger container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: springSmooth
  }
};

// Mock data
const NEWS_ITEMS = [
  { id: 1, text: "НОВЫЙ DROP: VOID KEYCAPS УЖЕ В ПРОДАЖЕ" },
  { id: 2, text: "MINIMAL OS 2.1 — ОБНОВЛЕНИЕ ДОСТУПНО" },
  { id: 3, text: "COMMUNITY: 15K BUILDERS ПРИСОЕДИНИЛИСЬ" },
  { id: 4, text: "GLASSY SWAP: НОВЫЕ МОДЕЛИ ДЛЯ ОБМЕНА" },
  { id: 5, text: "ROADMAP Q1 2025: ГОЛОСОВАНИЕ ОТКРЫТО" },
];

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

  return (
    <div 
      className="kinetic-home" 
      style={{ minHeight: '100vh', background: '#000' }}
      data-testid="kinetic-home"
    >
      {/* Hero Section */}
      <HeroSection />

      {/* KINETIC DASHBOARD - Fluid Layout */}
      <LayoutGroup>
        <motion.section 
          className="kinetic-dashboard"
          data-testid="kinetic-dashboard"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Live Ticker - Full Width */}
          <motion.div 
            variants={itemVariants}
            className="dashboard-row full-width"
          >
            <LiveTicker 
              items={NEWS_ITEMS}
              speed={35}
            />
          </motion.div>

          {/* Fluid Bento Grid */}
          <motion.div 
            layout
            className="fluid-bento"
          >
            {/* Review Deck - 3 State Animation */}
            <motion.div
              layout
              variants={itemVariants}
              className="bento-island bento-reviews"
            >
              <ReviewDeck />
            </motion.div>

            {/* Active Poll */}
            <motion.div
              layout
              variants={itemVariants}
              className="bento-island bento-poll"
            >
              <ActivePoll poll={ROADMAP_POLL} />
            </motion.div>

            {/* System Stats - Morphable Widget */}
            <motion.div
              layout
              variants={itemVariants}
              className="bento-island bento-stats"
            >
              <KineticWidget className="stats-island" glow>
                <div className="stats-header">
                  <DotText size="sm" color="muted">SYSTEM STATUS</DotText>
                  <span className="status-online">
                    <span className="pulse-dot" />
                    ONLINE
                  </span>
                </div>
                <div className="stats-numbers">
                  <div className="stat-block">
                    <span className="stat-big">15,847</span>
                    <DotText size="xs" color="muted">BUILDERS</DotText>
                  </div>
                  <div className="stat-block">
                    <span className="stat-big">3,240</span>
                    <DotText size="xs" color="muted">PRODUCTS</DotText>
                  </div>
                  <div className="stat-block">
                    <span className="stat-big">98.7%</span>
                    <DotText size="xs" color="muted">UPTIME</DotText>
                  </div>
                  <div className="stat-block">
                    <span className="stat-big">24/7</span>
                    <DotText size="xs" color="muted">SUPPORT</DotText>
                  </div>
                </div>
              </KineticWidget>
            </motion.div>
          </motion.div>
        </motion.section>
      </LayoutGroup>

      {/* Original Sections */}
      <ShopByCategory />
      <HotDealsAndPopular />
      <LatestArticles />
    </div>
  );
}
