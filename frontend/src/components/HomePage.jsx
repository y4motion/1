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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* App Grid (Always visible) */}
        <KineticAppGrid />

        {/* Live News Ticker - Compact 1/3 width */}
        {!isZenMode && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            marginBottom: '32px' 
          }}>
            <div style={{ width: '320px' }}>
              <LiveTicker items={NEWS_ITEMS} interval={4000} />
            </div>
          </div>
        )}

        {/* Kinetic Dashboard Row (Reviews + Poll + Network + Consensus) */}
        <div 
          className="dashboard-row"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            marginBottom: '40px'
          }}
        >
          <ReviewDeck />
          <ActivePoll poll={ROADMAP_POLL} />
          <NetworkPulse />
          <ConsensusPulse />
        </div>

        {/* Categories Bento Grid (Hidden in Zen Mode) */}
        {!isZenMode && <KineticCategories />}

        {/* Hot Deals Stack (Hidden in Zen Mode) */}
        {!isZenMode && <HotDealsStack />}
      </motion.main>

      {/* ====================================
          ZONE C: SYSTEM TELEMETRY
          ==================================== */}
      
      <TelemetryBar />
    </div>
  );
}
