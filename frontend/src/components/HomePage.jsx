/**
 * HomePage.jsx - GHOST OS DASHBOARD
 * 
 * Structure:
 * - ZONE A: Hero + Control Strip
 * - ZONE B: Kinetic Workspace (Status, Apps, Dashboard, Categories, Deals)
 * - ZONE C: Telemetry Bar
 */

import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './home/HeroSection';
import { useGhostStore } from '../stores/useGhostStore';

// Kinetic Components
import { 
  // Workspace
  KineticAppGrid,
  ReviewDeck, 
  ActivePoll,
  KineticCategories,
  HotDealsStack,
  LiveTicker,
  // Telemetry
  TelemetryBar
} from './kinetic';

// Social
import { NetworkPulse, ConsensusPulse } from './social';

import '../styles/glassmorphism.css';
import '../styles/animations.css';
import './kinetic/kinetic.css';

// Mock data for widgets
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

// Assembly animation variants
const assemblyContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const assemblyItem = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    scale: 0.9,
    rotateX: 10,
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
    }
  }
};

export default function HomePage() {
  const { isZenMode } = useGhostStore();

  return (
    <div 
      className="ghost-os-dashboard" 
      style={{ minHeight: '100vh', background: 'transparent' }}
      data-testid="ghost-os-dashboard"
    >
      {/* ====================================
          ZONE A: HERO & CONTROL DECK
          ==================================== */}
      
      {/* Hero Section (Search + Video Background) */}
      <HeroSection />

      {/* ====================================
          ZONE B: KINETIC WORKSPACE
          ==================================== */}
      
      <motion.main 
        className="kinetic-workspace"
        style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '40px 24px' 
        }}
        variants={assemblyContainer}
        initial="hidden"
        animate="visible"
      >
        {/* App Grid (Always visible) - with assembly animation */}
        <motion.div variants={assemblyItem}>
          <KineticAppGrid />
        </motion.div>

        {/* Live News Ticker - Full width now */}
        {!isZenMode && (
          <motion.div 
            variants={assemblyItem}
            style={{ marginBottom: '32px' }}
          >
            <LiveTicker items={NEWS_ITEMS} interval={4000} />
          </motion.div>
        )}

        {/* Kinetic Dashboard Row (Reviews + Poll + Network + Consensus) */}
        <motion.div 
          className="dashboard-row"
          variants={assemblyItem}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '16px',
            marginBottom: '32px'
          }}
        >
          <ReviewDeck />
          <ActivePoll poll={ROADMAP_POLL} />
          <NetworkPulse />
          <ConsensusPulse />
        </motion.div>

        {/* Categories Bento Grid (Hidden in Zen Mode) */}
        {!isZenMode && (
          <motion.div variants={assemblyItem}>
            <KineticCategories />
          </motion.div>
        )}

        {/* Hot Deals Stack (Hidden in Zen Mode) */}
        {!isZenMode && (
          <motion.div variants={assemblyItem}>
            <HotDealsStack />
          </motion.div>
        )}
      </motion.main>

      {/* ====================================
          ZONE C: SYSTEM TELEMETRY
          ==================================== */}
      
      <TelemetryBar />
    </div>
  );
}
