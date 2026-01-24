/**
 * HomePage.jsx - GHOST OS DASHBOARD
 * 
 * THE REALITY ASSEMBLY
 * "Chaos to Order" - Doctor Strange Style
 * 
 * Structure:
 * - LAYER 0: Code Abyss (Living Background)
 * - ZONE A: Hero + Control Strip
 * - ZONE B: Kinetic Workspace (Status, Apps, Dashboard, Categories, Deals)
 * - ZONE C: Telemetry Bar
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import HeroSection from './home/HeroSection';
import { useGhostStore } from '../stores/useGhostStore';

// Kinetic Components
import { 
  // Background
  CodeAbyss,
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

// CHAOS TO ORDER - Random starting positions for widgets
const generateChaosPosition = () => ({
  x: (Math.random() - 0.5) * 200,  // -100 to 100
  y: 50 + Math.random() * 100,      // 50 to 150
  rotate: (Math.random() - 0.5) * 10, // -5 to 5 degrees
  scale: 0.9,
  opacity: 0
});

// Animation variants for the magical assembly
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
      when: "beforeChildren"
    }
  }
};

// Individual widget animation - Chaos to Order
const widgetVariants = {
  hidden: () => ({
    ...generateChaosPosition(),
  }),
  visible: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 0.8,
    }
  }
};

// Magnetic lock effect - subtle bounce at the end
const magneticLockVariants = {
  hidden: (custom) => ({
    x: custom?.x ?? (Math.random() - 0.5) * 150,
    y: custom?.y ?? 60 + Math.random() * 80,
    rotate: custom?.rotate ?? (Math.random() - 0.5) * 8,
    scale: 0.92,
    opacity: 0,
    filter: 'blur(4px)'
  }),
  visible: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      mass: 0.7,
    }
  }
};

// AssemblyWidget - Wrapper for chaos-to-order animation
const AssemblyWidget = ({ children, delay = 0, customStart }) => (
  <motion.div
    variants={magneticLockVariants}
    custom={customStart}
    style={{ willChange: 'transform, opacity, filter' }}
  >
    {children}
  </motion.div>
);

export default function HomePage() {
  const { isZenMode } = useGhostStore();

  // Generate stable random positions for each widget
  const chaosPositions = useMemo(() => ({
    appGrid: { x: -80, y: 100, rotate: -3 },
    ticker: { x: 120, y: 60, rotate: 4 },
    reviews: { x: -100, y: 80, rotate: -5 },
    poll: { x: 60, y: 120, rotate: 3 },
    network: { x: 140, y: 70, rotate: -4 },
    consensus: { x: -120, y: 90, rotate: 5 },
    categories: { x: 0, y: 150, rotate: -2 },
    deals: { x: -60, y: 130, rotate: 4 },
  }), []);

  return (
    <div 
      className="ghost-os-dashboard" 
      style={{ 
        minHeight: '100vh', 
        background: '#050505',
        position: 'relative',
        overflow: 'hidden'
      }}
      data-testid="ghost-os-dashboard"
    >
      {/* ====================================
          LAYER 0: THE CODE ABYSS
          Living parallax background
          ==================================== */}
      <CodeAbyss />

      {/* ====================================
          ZONE A: HERO & CONTROL DECK
          ==================================== */}
      
      {/* Hero Section (Search + Video Background) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />
      </div>

      {/* ====================================
          ZONE B: KINETIC WORKSPACE
          Chaos to Order Assembly
          ==================================== */}
      
      <motion.main 
        className="kinetic-workspace"
        style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '40px 24px',
          position: 'relative',
          zIndex: 1,
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* App Grid (Always visible) */}
        <AssemblyWidget customStart={chaosPositions.appGrid}>
          <KineticAppGrid />
        </AssemblyWidget>

        {/* Live News Ticker - Compact 1/3 width */}
        {!isZenMode && (
          <AssemblyWidget customStart={chaosPositions.ticker}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-start',
              marginBottom: '32px' 
            }}>
              <div style={{ width: '320px' }}>
                <LiveTicker items={NEWS_ITEMS} interval={4000} />
              </div>
            </div>
          </AssemblyWidget>
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
          <AssemblyWidget customStart={chaosPositions.reviews}>
            <ReviewDeck />
          </AssemblyWidget>
          
          <AssemblyWidget customStart={chaosPositions.poll}>
            <ActivePoll poll={ROADMAP_POLL} />
          </AssemblyWidget>
          
          <AssemblyWidget customStart={chaosPositions.network}>
            <NetworkPulse />
          </AssemblyWidget>
          
          <AssemblyWidget customStart={chaosPositions.consensus}>
            <ConsensusPulse />
          </AssemblyWidget>
        </div>

        {/* Categories Bento Grid (Hidden in Zen Mode) */}
        {!isZenMode && (
          <AssemblyWidget customStart={chaosPositions.categories}>
            <KineticCategories />
          </AssemblyWidget>
        )}

        {/* Hot Deals Stack (Hidden in Zen Mode) */}
        {!isZenMode && (
          <AssemblyWidget customStart={chaosPositions.deals}>
            <HotDealsStack />
          </AssemblyWidget>
        )}
      </motion.main>

      {/* ====================================
          ZONE C: SYSTEM TELEMETRY
          ==================================== */}
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <TelemetryBar />
      </motion.div>
    </div>
  );
}
