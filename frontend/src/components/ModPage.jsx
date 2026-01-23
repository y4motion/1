/**
 * ModPage.jsx - THE TEMPLE OF MINIMAL MOD
 * Ghost Protocol - Phase 3: Monument Resurrection
 * 
 * Structure:
 * 1. THE MONUMENT - Header with Etch Legacy
 * 2. THE SPLIT GATE - Brand exclusives shop
 * 3. ORIGIN TIMELINE - Amber thread
 * 4. THE ECOSYSTEM - Bento grid hub
 * 5. INNER CIRCLE - Founders access
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { systemToast } from './system';
import { playVoidOpen, playHoverBlip, playAccessDenied } from './system/SystemAudio';
import {
  Lock, Unlock, ShoppingBag, Star, ChevronDown, ChevronUp,
  Cpu, Code, Eye, Sparkles, Crown, ArrowRight, X, Download,
  Heart, ThumbsUp, Monitor, Palette, Layers, Send, Edit3
} from 'lucide-react';
import './ModPage.css';

// === CIVILIZATION CODE SYMBOLS ===
const SYMBOLS = [
  // Hex
  '0x', 'FF', 'A1', 'B2', 'C3', 'D4', 'E5', '00', '7F', '3A',
  // Runes
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ',
  // Cyrillic
  'Ж', 'Ф', 'Ы', 'Щ', 'Э', 'Ю', 'Я', 'Ц', 'Ч', 'Ш',
  // Japanese
  '無', '空', '道', '魂', '力', '光', '影', '龍', '神', '心',
  // Greek
  'Ω', 'Σ', 'Δ', 'Ψ', 'Φ', 'Λ', 'Π', 'Θ',
  // Misc
  '◈', '◉', '◎', '▣', '▤', '⬡', '⬢', '◇', '◆'
];

// === BRAND PRODUCTS ===
const BRAND_PRODUCTS = [
  { 
    id: 1, 
    name: 'GLASSPAD 2024', 
    price: 4900, 
    category: 'PERIPHERAL',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    desc: 'Tempered glass mousepad. Zero friction.'
  },
  { 
    id: 2, 
    name: 'MINIMAL SLEEVE', 
    price: 2900, 
    category: 'MERCH',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400',
    desc: 'Premium neoprene laptop sleeve.'
  },
  { 
    id: 3, 
    name: 'CUSTOM CABLE', 
    price: 1900, 
    category: 'CABLE',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    desc: 'Coiled USB-C. Your colors.'
  },
  { 
    id: 4, 
    name: 'VOID KEYCAPS', 
    price: 3500, 
    category: 'KEYCAPS',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
    desc: 'PBT doubleshot. Dark theme.'
  },
  { 
    id: 5, 
    name: 'ECHO MAT', 
    price: 1500, 
    category: 'DESKMAT',
    image: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=400',
    desc: '900x400mm premium desk mat.'
  },
];

// === CONCEPT PRINTS ===
const CONCEPT_PRINTS = [
  { id: 1, name: 'VOID CARPET', votes: 847, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300' },
  { id: 2, name: 'SIGNAL RUG', votes: 623, image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300' },
  { id: 3, name: 'MONO SLEEVE', votes: 512, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' },
];

// === TOP BUILDS ===
const TOP_BUILDS = [
  { id: 1, name: 'PHANTOM X', author: 'voidwalker', image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300' },
  { id: 2, name: 'ARCTIC MONO', author: 'frostbyte', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300' },
  { id: 3, name: 'OBSIDIAN', author: 'darknode', image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300' },
];

// === TIMELINE EVENTS ===
const TIMELINE_EVENTS = [
  { id: 1, year: '2023', title: 'GENESIS', desc: 'Brand initialization' },
  { id: 2, year: '2024', title: 'FIRST DROP', desc: 'Glasspad release' },
  { id: 3, year: '2024', title: 'COMMUNITY', desc: '10K builders joined' },
  { id: 4, year: '2025', title: 'VOID ERA', desc: 'System protocol active' },
];

const LEGACY_PHRASES = ['LEGACY', 'FUTURE', 'VOID', 'MINIMAL', 'SYSTEM', 'MOD', 'BUILD'];

// === COMPONENTS ===

// Civilization Code Stream
const CivilizationCode = () => {
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    const generateLine = () => {
      let line = '';
      for (let i = 0; i < 40; i++) {
        line += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] + ' ';
      }
      return line;
    };
    
    // Initialize with some lines
    setLines(Array(15).fill(null).map(() => generateLine()));
    
    const interval = setInterval(() => {
      setLines(prev => {
        const newLines = [...prev.slice(1), generateLine()];
        return newLines;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="civilization-code">
      {lines.map((line, i) => (
        <div 
          key={i} 
          className="code-line"
          style={{ opacity: 0.02 + (i / lines.length) * 0.06 }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

// Legacy Echoes
const LegacyEchoes = () => {
  const [activePhrase, setActivePhrase] = useState(null);
  
  useEffect(() => {
    const showPhrase = () => {
      const phrase = LEGACY_PHRASES[Math.floor(Math.random() * LEGACY_PHRASES.length)];
      setActivePhrase(phrase);
      setTimeout(() => setActivePhrase(null), 2500);
    };
    
    const interval = setInterval(showPhrase, 5000);
    setTimeout(showPhrase, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnimatePresence>
      {activePhrase && (
        <motion.div
          className="legacy-echo"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 0.08, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ duration: 1 }}
        >
          {activePhrase}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Etch Legacy Button with Glitch
const EtchButton = ({ userLevel, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const canEtch = userLevel >= 80;
  
  return (
    <motion.button
      className={`etch-button ${isHovered ? 'glitch-hover' : ''} ${!canEtch ? 'locked' : ''}`}
      onMouseEnter={() => { setIsHovered(true); playHoverBlip(); }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: canEtch ? 1.02 : 1 }}
      whileTap={{ scale: canEtch ? 0.98 : 1 }}
    >
      <span className="etch-bracket">[</span>
      <Edit3 size={14} />
      <span className="etch-text" data-text="ETCH YOUR LEGACY">ETCH YOUR LEGACY</span>
      <span className="etch-bracket">]</span>
      {!canEtch && <Lock size={12} className="etch-lock" />}
    </motion.button>
  );
};

// Brand Product Card
const BrandProduct = ({ product, isBlurred, onHover }) => (
  <motion.div
    className={`brand-product ${isBlurred ? 'blurred' : ''}`}
    onMouseEnter={() => { playHoverBlip(); onHover?.(product.id); }}
    onMouseLeave={() => onHover?.(null)}
    whileHover={!isBlurred ? { y: -12, scale: 1.02 } : {}}
    animate={{ y: [0, -6, 0] }}
    transition={{ 
      y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
      scale: { duration: 0.2 }
    }}
  >
    <div className="product-glow" />
    <div className="product-image-wrap">
      <img src={product.image} alt={product.name} className="product-image" />
      <span className="product-category">{product.category}</span>
    </div>
    <div className="product-info">
      <h4 className="product-name">{product.name}</h4>
      <p className="product-desc">{product.desc}</p>
      <span className="product-price">₽{product.price.toLocaleString()}</span>
    </div>
    {isBlurred && (
      <div className="product-lock-overlay">
        <Lock size={24} />
        <span>TRUST 400+</span>
      </div>
    )}
  </motion.div>
);

// Horizontal Timeline Node with Neural Impulses
const TimelineNode = ({ event, index, isLast }) => (
  <motion.div
    className="h-timeline-node"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.15 }}
    viewport={{ once: true }}
  >
    <div className="h-node-dot">
      <div className="dot-core" />
      <div className="dot-pulse" />
    </div>
    <div className="h-node-content">
      <span className="h-node-year">{event.year}</span>
      <h4 className="h-node-title">{event.title}</h4>
      <p className="h-node-desc">{event.desc}</p>
    </div>
    {/* Neural Thread - random impulse sparks */}
    {!isLast && (
      <div className="soul-thread">
        <div className="thread-line" />
        <div className="thread-pulse" />
      </div>
    )}
  </motion.div>
);

// Concept Print Card
const ConceptPrint = ({ print, onVote, hasVoted }) => (
  <motion.div 
    className="concept-print"
    whileHover={{ scale: 1.03 }}
  >
    <img src={print.image} alt={print.name} />
    <div className="print-overlay">
      <h5>{print.name}</h5>
      <button 
        className={`vote-btn ${hasVoted ? 'voted' : ''}`}
        onClick={() => onVote(print.id)}
      >
        <Heart size={14} fill={hasVoted ? 'currentColor' : 'none'} />
        <span>{print.votes + (hasVoted ? 1 : 0)}</span>
      </button>
    </div>
  </motion.div>
);

// Build Card
const BuildCard = ({ build }) => (
  <motion.div 
    className="build-card"
    whileHover={{ scale: 1.02 }}
  >
    <img src={build.image} alt={build.name} />
    <div className="build-info">
      <h5>{build.name}</h5>
      <span>by @{build.author}</span>
    </div>
  </motion.div>
);

// Etch Modal
const EtchModal = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  
  if (!isOpen) return null;
  
  return (
    <motion.div 
      className="etch-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="etch-modal"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <h3>CARVE YOUR LEGACY</h3>
        <p>Your words will echo in the Monument forever.</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter your legacy message..."
          maxLength={140}
        />
        <div className="etch-modal-actions">
          <button className="etch-cancel" onClick={onClose}>CANCEL</button>
          <button 
            className="etch-submit" 
            onClick={() => { onSubmit(text); setText(''); }}
            disabled={!text.trim()}
          >
            <Send size={14} />
            ETCH
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// === MAIN COMPONENT ===
const ModPage = () => {
  const { user } = useAuth();
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [showEtchModal, setShowEtchModal] = useState(false);
  const [votedPrints, setVotedPrints] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // User stats
  const userLevel = user?.level || 25;
  const userTrustScore = user?.trust_score || 500;
  const hasVoidAccess = userTrustScore >= 400;
  const canEtch = userLevel >= 80;
  
  const toggleVoid = () => {
    if (!isVoidOpen) {
      playVoidOpen();
      systemToast.access('VOID GATE: OPENING...');
      setTimeout(() => systemToast.info('MINIMAL MOD EXCLUSIVES'), 800);
    } else {
      systemToast.info('VOID SEALED');
    }
    setIsVoidOpen(!isVoidOpen);
  };
  
  const handleEtchClick = () => {
    if (!canEtch) {
      playAccessDenied();
      systemToast.denied(`REQ: LVL 80 MONARCH (Current: ${userLevel})`);
      return;
    }
    setShowEtchModal(true);
  };
  
  const handleEtchSubmit = (text) => {
    if (text.trim()) {
      systemToast.success('LEGACY CARVED INTO STONE');
      setShowEtchModal(false);
    }
  };
  
  const handleVote = (printId) => {
    if (!votedPrints.includes(printId)) {
      setVotedPrints([...votedPrints, printId]);
      systemToast.rp(5);
    }
  };

  return (
    <div className="mod-temple cartenon-abyss" data-testid="mod-temple">
      
      {/* === THE MONUMENT === */}
      <motion.section 
        className="monument-section"
        animate={{ 
          y: isVoidOpen ? -450 : 0,
          opacity: isVoidOpen ? 0.2 : 1
        }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="monument-noise" />
        <CivilizationCode />
        <LegacyEchoes />
        
        <div className="monument-content">
          <motion.h1 
            className="monument-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            THE MONUMENT
          </motion.h1>
          <motion.p 
            className="monument-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5 }}
          >
            WHERE LEGACY IS CARVED
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <EtchButton userLevel={userLevel} onClick={handleEtchClick} />
          </motion.div>
        </div>
      </motion.section>

      {/* === THE SPLIT GATE === */}
      <motion.div 
        className="split-gate"
        animate={{ 
          scaleY: isVoidOpen ? 0 : 1,
          opacity: isVoidOpen ? 0 : 1
        }}
        transition={{ duration: 0.4 }}
      >
        <button className="gate-trigger" onClick={toggleVoid}>
          <span className="gate-line" />
          <span className="gate-text">
            {isVoidOpen ? (
              <><ChevronUp size={14} /> SEAL VOID <ChevronUp size={14} /></>
            ) : (
              <><ChevronDown size={14} /> ACCESS VOID ARMORY <ChevronDown size={14} /></>
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
          >
            <div className="void-abyss" />
            
            <div className="void-header">
              <span className="void-label">MINIMAL MOD EXCLUSIVES</span>
              <h2>VOID ARMORY</h2>
              {!hasVoidAccess && (
                <span className="void-warning">
                  <Lock size={12} /> LOW TRUST — ITEMS LOCKED
                </span>
              )}
            </div>
            
            <div className="void-products">
              {BRAND_PRODUCTS.map(product => (
                <BrandProduct
                  key={product.id}
                  product={product}
                  isBlurred={!hasVoidAccess}
                  onHover={setHoveredProduct}
                />
              ))}
            </div>
            
            <button className="void-close" onClick={toggleVoid}>
              <X size={14} /> CLOSE VOID
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {/* === THE ECOSYSTEM (BENTO GRID) === */}
      <section className="ecosystem-section">
        <div className="ecosystem-header">
          <h2>THE ECOSYSTEM</h2>
          <p>Tools. Concepts. Community.</p>
        </div>
        
        <div className="bento-grid">
          {/* Block 1: Minimal OS */}
          <motion.div 
            className="bento-card bento-os"
            whileHover={{ scale: 1.01 }}
          >
            <div className="bento-icon">
              <Monitor size={32} />
            </div>
            <h3>MINIMAL OS</h3>
            <p>Custom Windows theme. Dark. Clean. Yours.</p>
            <button 
              className="bento-action"
              onClick={() => systemToast.success('DOWNLOAD STARTED')}
            >
              <Download size={14} />
              DOWNLOAD v2.0
            </button>
          </motion.div>
          
          {/* Block 2: Concept Lab */}
          <motion.div 
            className="bento-card bento-lab"
            whileHover={{ scale: 1.01 }}
          >
            <div className="bento-icon">
              <Palette size={32} />
            </div>
            <h3>CONCEPT LAB</h3>
            <p>Vote for the next drop</p>
            <div className="concept-prints-grid">
              {CONCEPT_PRINTS.map(print => (
                <ConceptPrint
                  key={print.id}
                  print={print}
                  hasVoted={votedPrints.includes(print.id)}
                  onVote={handleVote}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Block 3: Top Builds */}
          <motion.div 
            className="bento-card bento-builds"
            whileHover={{ scale: 1.01 }}
          >
            <div className="bento-icon">
              <Layers size={32} />
            </div>
            <h3>TOP BUILDS</h3>
            <p>Community masterpieces</p>
            <div className="builds-grid">
              {TOP_BUILDS.map(build => (
                <BuildCard key={build.id} build={build} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* === INNER CIRCLE === */}
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
            <Sparkles size={16} />
            OPEN DIRECT LINE
            <ArrowRight size={16} />
          </motion.button>
        ) : (
          <div className="access-blocked">
            <motion.div 
              className="locked-indicator"
              onClick={() => systemToast.denied(`TRUST ${userTrustScore}/700 REQUIRED`)}
              whileHover={{ scale: 1.02 }}
            >
              <Lock size={16} />
              TRUST 700+ ONLY
            </motion.div>
            <span className="trust-progress">Current: {userTrustScore}/700</span>
          </div>
        )}
      </section>

      {/* === ORIGIN THREAD (Horizontal) === */}
      <section className="h-timeline-section">
        <div className="h-timeline-header">
          <h2>ORIGIN THREAD</h2>
          <p>The path we carved</p>
        </div>
        
        <div className="h-timeline-track">
          <div className="h-timeline-nodes">
            {TIMELINE_EVENTS.map((event, i) => (
              <TimelineNode 
                key={event.id} 
                event={event} 
                index={i} 
                isLast={i === TIMELINE_EVENTS.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Etch Modal */}
      <AnimatePresence>
        {showEtchModal && (
          <EtchModal
            isOpen={showEtchModal}
            onClose={() => setShowEtchModal(false)}
            onSubmit={handleEtchSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModPage;
