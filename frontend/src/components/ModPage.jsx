/**
 * ModPage.jsx - THE TEMPLE OF SYSTEM
 * Ghost Protocol - Phase 3: Temple Architecture
 * 
 * Structure:
 * 1. THE FRIEZE (45vh) - Monument with running code
 * 2. THE SPLIT GATE - World-splitting animation
 * 3. THE VOID SHOP - Levitating products in darkness
 * 4. ORIGIN TIMELINE - Amber thread history
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { systemToast } from './system';
import { playVoidOpen, playHoverBlip } from './system/SystemAudio';
import {
  Lock, Unlock, ShoppingBag, Star, ChevronDown, ChevronUp,
  Cpu, Code, Eye, Sparkles, Crown, ArrowRight, X
} from 'lucide-react';
import './ModPage.css';

// === MOCK DATA ===
const VOID_PRODUCTS = [
  { id: 1, name: 'QUANTUM CORE', price: 2500, rarity: 'legendary', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400' },
  { id: 2, name: 'NEURAL LINK', price: 1800, rarity: 'epic', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { id: 3, name: 'VOID SHARD', price: 900, rarity: 'rare', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400' },
  { id: 4, name: 'DATA CRYSTAL', price: 450, rarity: 'uncommon', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400' },
  { id: 5, name: 'ECHO FRAGMENT', price: 200, rarity: 'common', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400' },
];

const TIMELINE_EVENTS = [
  { id: 1, year: '2024', title: 'GENESIS', desc: 'System initialization' },
  { id: 2, year: '2024', title: 'FIRST WAVE', desc: 'Early adopters joined' },
  { id: 3, year: '2025', title: 'VOID OPENS', desc: 'Hidden armory revealed' },
  { id: 4, year: '2025', title: 'RESONANCE', desc: 'Trust system activated' },
];

const LEGACY_PHRASES = [
  'LEGACY', 'FUTURE', 'VOID', 'SYSTEM', 'TRUST', 'ECHO', 'SIGNAL'
];

// === COMPONENTS ===

// Running Code Matrix Effect
const CodeStream = () => {
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    const generateLine = () => {
      const chars = 'ABCDEF0123456789{}[]<>/\\|';
      let line = '';
      for (let i = 0; i < 60; i++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      return line;
    };
    
    const interval = setInterval(() => {
      setLines(prev => {
        const newLines = [...prev, generateLine()];
        return newLines.slice(-20);
      });
    }, 150);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="code-stream">
      {lines.map((line, i) => (
        <div 
          key={i} 
          className="code-line"
          style={{ opacity: 0.03 + (i / lines.length) * 0.07 }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

// Floating Legacy Phrases
const LegacyEchoes = () => {
  const [activePhrase, setActivePhrase] = useState(null);
  
  useEffect(() => {
    const showPhrase = () => {
      const phrase = LEGACY_PHRASES[Math.floor(Math.random() * LEGACY_PHRASES.length)];
      setActivePhrase(phrase);
      setTimeout(() => setActivePhrase(null), 2000);
    };
    
    const interval = setInterval(showPhrase, 4000);
    showPhrase();
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnimatePresence>
      {activePhrase && (
        <motion.div
          className="legacy-echo"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 0.15, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.8 }}
        >
          {activePhrase}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Void Product Card (Floating)
const VoidProduct = ({ product, isBlurred, onHover }) => {
  const rarityColors = {
    legendary: '#FFD700',
    epic: '#9F7AEA',
    rare: '#00FFD4',
    uncommon: '#4ADE80',
    common: '#94A3B8'
  };
  
  return (
    <motion.div
      className={`void-product ${isBlurred ? 'blurred' : ''}`}
      onMouseEnter={() => {
        playHoverBlip();
        onHover?.(product.id);
      }}
      onMouseLeave={() => onHover?.(null)}
      whileHover={!isBlurred ? { scale: 1.08, y: -10 } : {}}
      animate={{ y: [0, -8, 0] }}
      transition={{ 
        y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: 0.3 }
      }}
      style={{ '--rarity-color': rarityColors[product.rarity] }}
    >
      <div className="void-product-glow" />
      <img src={product.image} alt={product.name} className="void-product-image" />
      <div className="void-product-info">
        <span className="void-product-name">{product.name}</span>
        <span className="void-product-price">{product.price} RP</span>
      </div>
      {isBlurred && (
        <div className="void-product-lock">
          <Lock size={24} />
          <span>TRUST 400+</span>
        </div>
      )}
    </motion.div>
  );
};

// Timeline Node
const TimelineNode = ({ event, index }) => (
  <motion.div
    className="timeline-node"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.15 }}
    viewport={{ once: true }}
  >
    <div className="timeline-dot" />
    <div className="timeline-content">
      <span className="timeline-year">{event.year}</span>
      <h4 className="timeline-title">{event.title}</h4>
      <p className="timeline-desc">{event.desc}</p>
    </div>
  </motion.div>
);

// === MAIN COMPONENT ===
const ModPage = () => {
  const { user } = useAuth();
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // User stats (mock or real)
  const userTrustScore = user?.trust_score || 500;
  const hasVoidAccess = userTrustScore >= 400;
  
  const toggleVoid = () => {
    if (!isVoidOpen) {
      playVoidOpen();
      systemToast.access('VOID GATE: OPENING...');
      setTimeout(() => {
        systemToast.info('ARMORY UNLOCKED');
      }, 800);
    } else {
      systemToast.info('VOID SEALED');
    }
    setIsVoidOpen(!isVoidOpen);
  };
  
  const handleProductClick = (product) => {
    if (!hasVoidAccess) {
      systemToast.denied(`TRUST ${userTrustScore}/400 — ACCESS BLOCKED`);
      return;
    }
    systemToast.success(`${product.name} ADDED TO CART`);
  };

  return (
    <div className="mod-temple" data-testid="mod-temple">
      {/* === THE FRIEZE (Monument) === */}
      <motion.section 
        className="frieze-section"
        animate={{ 
          y: isVoidOpen ? -400 : 0,
          opacity: isVoidOpen ? 0.3 : 1
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="frieze-noise" />
        <CodeStream />
        <LegacyEchoes />
        
        <div className="frieze-content">
          <motion.h1 
            className="frieze-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            THE MONUMENT
          </motion.h1>
          <motion.p 
            className="frieze-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.6 }}
          >
            WHERE LEGACY IS CARVED
          </motion.p>
        </div>
      </motion.section>

      {/* === THE SPLIT GATE === */}
      <motion.div 
        className="split-gate"
        animate={{ 
          scaleY: isVoidOpen ? 0.5 : 1,
          opacity: isVoidOpen ? 0 : 1
        }}
        transition={{ duration: 0.5 }}
      >
        <button 
          className="gate-trigger"
          onClick={toggleVoid}
          data-testid="void-gate-trigger"
        >
          <span className="gate-line" />
          <span className="gate-text">
            {isVoidOpen ? (
              <>
                <ChevronUp size={16} />
                SEAL VOID
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                ACCESS VOID ARMORY
                <ChevronDown size={16} />
              </>
            )}
          </span>
          <span className="gate-line" />
        </button>
      </motion.div>

      {/* === THE VOID SHOP === */}
      <AnimatePresence>
        {isVoidOpen && (
          <motion.section
            className="void-shop"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            data-testid="void-shop"
          >
            <div className="void-background" />
            
            <div className="void-header">
              <h2>VOID ARMORY</h2>
              {!hasVoidAccess && (
                <span className="void-warning">
                  <Lock size={14} /> TRUST SCORE TOO LOW — ITEMS LOCKED
                </span>
              )}
            </div>
            
            <div className="void-products-carousel">
              {VOID_PRODUCTS.map(product => (
                <VoidProduct
                  key={product.id}
                  product={product}
                  isBlurred={!hasVoidAccess}
                  onHover={setHoveredProduct}
                />
              ))}
            </div>
            
            <button 
              className="void-close"
              onClick={toggleVoid}
            >
              <X size={16} />
              CLOSE VOID
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {/* === ORIGIN TIMELINE === */}
      <motion.section 
        className="timeline-section"
        animate={{ 
          y: isVoidOpen ? 400 : 0,
          opacity: isVoidOpen ? 0.3 : 1
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="amber-thread" />
        
        <div className="timeline-header">
          <h2>ORIGIN THREAD</h2>
          <p>The path we carved</p>
        </div>
        
        <div className="timeline-nodes">
          {TIMELINE_EVENTS.map((event, i) => (
            <TimelineNode key={event.id} event={event} index={i} />
          ))}
        </div>
      </motion.section>

      {/* === INNER CIRCLE (Founders) === */}
      <section className="inner-circle-section">
        <div className="circle-glow" />
        <Crown size={48} className="circle-icon" />
        <h2>THE SYSTEM ADMIN</h2>
        <p>Direct channel to the architects</p>
        
        {userTrustScore >= 700 ? (
          <motion.button 
            className="direct-line-btn accessible"
            onClick={() => {
              systemToast.success('CONNECTION ESTABLISHED');
              window.dispatchEvent(new CustomEvent('openGlassyChat', { 
                detail: { mode: 'founders', golden: true } 
              }));
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles size={18} />
            OPEN DIRECT LINE
            <ArrowRight size={18} />
          </motion.button>
        ) : (
          <div className="access-blocked">
            <motion.div 
              className="locked-indicator"
              onClick={() => systemToast.denied(`TRUST ${userTrustScore}/700 REQUIRED`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock size={18} />
              TRUST 700+ ONLY
            </motion.div>
            <span className="trust-progress">
              Current: {userTrustScore}/700
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default ModPage;
