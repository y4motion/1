/**
 * HomePage.jsx - GHOST OS DASHBOARD
 * 
 * Unified Bento Grid with all widgets
 * ZEN/AMBIENT as part of grid
 * Clean assembly animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './home/HeroSection';
import { useGhostStore } from '../stores/useGhostStore';

// Kinetic Components
import { 
  KineticAppGrid,
  ReviewDeck, 
  HotDealsStack,
  LiveTicker,
  TelemetryBar
} from './kinetic';

import '../styles/glassmorphism.css';
import '../styles/animations.css';
import './kinetic/kinetic.css';

// Mock data for ticker
const NEWS_ITEMS = [
  { id: 1, text: "НОВЫЙ DROP: VOID KEYCAPS УЖЕ В ПРОДАЖЕ" },
  { id: 2, text: "MINIMAL OS 2.1 — ОБНОВЛЕНИЕ ДОСТУПНО" },
  { id: 3, text: "СООБЩЕСТВО: 15K BUILDERS ПРИСОЕДИНИЛИСЬ" },
  { id: 4, text: "ОБМЕН: НОВЫЕ МОДЕЛИ ДЛЯ СВАПА" },
  { id: 5, text: "ROADMAP Q1 2025: ГОЛОСОВАНИЕ ОТКРЫТО" },
];

// Assembly animation variants
const assemblyContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    }
  }
};

const assemblyItem = {
  hidden: { 
    opacity: 0, 
    y: 25, 
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 250,
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
          ZONE A: HERO
          ==================================== */}
      <HeroSection />

      {/* ====================================
          ZONE B: KINETIC WORKSPACE
          ==================================== */}
      
      <motion.main 
        className="kinetic-workspace"
        style={{ 
          width: '100%',
          padding: '40px 32px 60px',
        }}
        variants={assemblyContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Live News Ticker - Full width */}
        {!isZenMode && (
          <motion.div 
            variants={assemblyItem}
            style={{ marginBottom: '28px' }}
          >
            <LiveTicker items={NEWS_ITEMS} interval={4000} />
          </motion.div>
        )}

        {/* Bento App Grid (includes ZEN, AMBIENT, all widgets) */}
        <motion.div variants={assemblyItem}>
          <KineticAppGrid />
        </motion.div>

        {/* Hot Deals - Horizontal scroll */}
        {!isZenMode && (
          <motion.div variants={assemblyItem}>
            <HotDealsStack />
          </motion.div>
        )}

        {/* Reviews Deck */}
        {!isZenMode && (
          <motion.div variants={assemblyItem}>
            <ReviewDeck />
          </motion.div>
        )}

        {/* ZEN MODE - Minimal view when active */}
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '40vh',
              textAlign: 'center',
              marginTop: '60px',
            }}
          >
            <div style={{ 
              fontSize: '11px', 
              letterSpacing: '4px', 
              opacity: 0.2,
              fontFamily: '"JetBrains Mono", monospace',
              marginBottom: '16px',
            }}>
              РЕЖИМ ДЗЕН
            </div>
            <div style={{ 
              fontSize: '64px', 
              fontWeight: '100', 
              letterSpacing: '16px',
              opacity: 0.08,
            }}>
              GHOST
            </div>
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
