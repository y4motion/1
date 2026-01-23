/**
 * ModPage - The Temple of System
 * Ghost Protocol Edition - Phase 3
 * 
 * Три слоя:
 * 1. THE FRIEZE - Монумент с кодом и эхо-сообщениями
 * 2. THE SPLIT GATE - Механика разрыва для Hidden Armory
 * 3. THE AMBER THREAD - Таймлайн истории
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { systemToast } from './system';
import {
  Cpu, Download, Heart, ChevronRight, ChevronLeft, Lock, Crown, Zap,
  Sparkles, Code, Palette, Monitor, X, Send, ArrowRight, ChevronsUp,
  ChevronsDown, ShoppingBag, Star, Eye,
} from 'lucide-react';
import './ModPage.css';

// === SOUND EFFECTS (Placeholders) ===
const playRumbleSound = () => {
  // TODO: Deep rumble when approaching gate
  console.log('🔊 Rumble...');
};

const playStoneSlide = () => {
  // TODO: Heavy stone sliding sound
  console.log('🔊 Stone slide...');
};

const playGateOpen = () => {
  // TODO: Ancient gate opening
  console.log('🔊 Gate opening...');
};

// === DATA ===
const MONUMENT_MESSAGES = [
  { id: 1, text: "We build the future, one pixel at a time", author: "Founder" },
  { id: 2, text: "Минимализм — это не меньше, это лучше", author: "Alex" },
  { id: 3, text: "Glass is not just material, it's philosophy", author: "Ghost" },
  { id: 4, text: "В каждой линии кода — душа создателя", author: "Dmitry" },
  { id: 5, text: "The quieter the mind, the louder the creation", author: "Zen" },
  { id: 6, text: "Build different. Think minimal.", author: "ModTeam" },
];

const TIMELINE_EVENTS = [
  { id: 'custom-era', year: '2021', title: 'Custom Era', description: 'Первые кастомные сборки.', image: '🖥️' },
  { id: 'glasspad', year: '2022', title: 'Glasspad Revolution', description: 'Линейка стеклянных ковриков.', image: '✨' },
  { id: 'marketplace', year: '2023', title: 'Marketplace Launch', description: 'Открытие маркетплейса.', image: '🛒' },
  { id: 'ai-era', year: '2024', title: 'AI Integration', description: 'Glassy Mind. Новая эра.', image: '🧠' },
];

const ARMORY_ARTIFACTS = [
  { id: 'glasspad-obsidian', name: 'Glasspad Obsidian', type: 'S-RANK', price: 149, description: 'Закалённое стекло. Абсолютный контроль.', glow: '#3b82f6', image: '🔮' },
  { id: 'sleeve-phantom', name: 'Sleeve: Phantom', type: 'A-RANK', price: 89, description: 'Рукав-призрак. Невидимая защита.', glow: '#8b5cf6', image: '👻' },
  { id: 'keycaps-void', name: 'Keycaps: Void Set', type: 'S-RANK', price: 199, description: 'Клавиши из бездны. PBT Double-shot.', glow: '#06b6d4', image: '⌨️' },
  { id: 'cablemod-amber', name: 'CableMod Amber', type: 'B-RANK', price: 69, description: 'Янтарный кабель. Оплётка парокорд.', glow: '#f59e0b', image: '🔌' },
  { id: 'deskmat-ruins', name: 'Deskmat: Ancient Ruins', type: 'A-RANK', price: 79, description: 'Коврик XL. Руины забытого храма.', glow: '#10b981', image: '🗿' },
];

const CONCEPT_PRINTS = [
  { id: 1, name: 'Circuit Dreams', votes: 234, image: '🔌' },
  { id: 2, name: 'Neon Geometry', votes: 189, image: '💠' },
  { id: 3, name: 'Minimal Wave', votes: 156, image: '🌊' },
  { id: 4, name: 'Ghost Pattern', votes: 298, image: '👻' },
];

const TOP_BUILDS = [
  { id: 1, name: 'Project Aurora', specs: 'RTX 4090 | i9-14900K', image: '🌌' },
  { id: 2, name: 'Silent Ghost', specs: 'RTX 4080 | R9 7950X', image: '👻' },
  { id: 3, name: 'Minimal Cube', specs: 'RTX 4070 Ti | i7-14700K', image: '📦' },
];

const ROADMAP_ITEMS = [
  { id: 1, name: 'AI Voice Module', progress: 70, status: 'in-progress' },
  { id: 2, name: 'Mousepad V2 (RGB)', progress: 45, status: 'in-progress' },
  { id: 3, name: 'Mobile App', progress: 20, status: 'planned' },
  { id: 4, name: 'VR Showroom', progress: 10, status: 'concept' },
];

const generateNoiseCode = () => {
  const chars = '01アイウエオ{}[]<>/\\|@#$%═║╔╗╚╝░▒▓█';
  return Array(200).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const ModPage = () => {
  const { user } = useAuth();
  const [showEtchModal, setShowEtchModal] = useState(false);
  const [etchText, setEtchText] = useState('');
  const [visibleMessage, setVisibleMessage] = useState(null);
  const [messagePosition, setMessagePosition] = useState({ x: 50, y: 50 });
  const [noiseLines, setNoiseLines] = useState([]);
  const [activeTimelineEvent, setActiveTimelineEvent] = useState(null);
  const [currentBuildIndex, setCurrentBuildIndex] = useState(0);
  const [votedPrints, setVotedPrints] = useState([]);
  const [boostedItems, setBoostedItems] = useState([]);
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [guardiansAwakened, setGuardiansAwakened] = useState(false);
  
  const containerRef = useRef(null);
  const gateRef = useRef(null);
  
  // === SCROLL TRACKING FOR GUARDIANS ===
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Guardians rotation based on scroll (0 -> 15deg when approaching gate)
  const leftGuardianRotate = useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0, 12]);
  const rightGuardianRotate = useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0, -12]);
  const guardiansScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.05]);
  const guardiansGlow = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  
  const userLevel = user?.level || 0;
  const hasAccess = userLevel >= 50 || user?.isPatron;

  // Detect when user approaches the gate
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v > 0.35 && !guardiansAwakened) {
        setGuardiansAwakened(true);
        playRumbleSound();
      } else if (v < 0.3 && guardiansAwakened) {
        setGuardiansAwakened(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, guardiansAwakened]);

  useEffect(() => {
    const lines = Array(10).fill(0).map((_, i) => ({
      id: i,
      text: generateNoiseCode(),
      speed: 30 + Math.random() * 50,
      top: i * 10,
    }));
    setNoiseLines(lines);
  }, []);

  useEffect(() => {
    const showMessage = () => {
      const msg = MONUMENT_MESSAGES[Math.floor(Math.random() * MONUMENT_MESSAGES.length)];
      // Случайная позиция в пределах hero секции
      const x = 20 + Math.random() * 60; // 20% - 80% по горизонтали
      const y = 25 + Math.random() * 50; // 25% - 75% по вертикали
      setMessagePosition({ x, y });
      setVisibleMessage(msg);
      setTimeout(() => setVisibleMessage(null), 4000);
    };
    showMessage();
    const interval = setInterval(showMessage, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleEtchSubmit = () => {
    if (etchText.trim()) {
      setShowEtchModal(false);
      setEtchText('');
    }
  };

  const handleVote = (printId) => {
    if (!votedPrints.includes(printId)) {
      setVotedPrints([...votedPrints, printId]);
    }
  };

  const handleBoost = (itemId) => {
    if (!boostedItems.includes(itemId) && userLevel >= 10) {
      setBoostedItems([...boostedItems, itemId]);
    }
  };

  const toggleArmory = () => {
    if (!isArmoryOpen) {
      playStoneSlide();
      setTimeout(playGateOpen, 300);
    }
    setIsArmoryOpen(!isArmoryOpen);
    setSelectedArtifact(null);
  };

  const openDirectLine = () => {
    window.dispatchEvent(new CustomEvent('openGlassyChat', { 
      detail: { mode: 'founders', golden: true } 
    }));
  };

  return (
    <div className={`mod-page temple ${isArmoryOpen ? 'armory-active' : ''}`} ref={containerRef}>
      
      {/* ========== LAYER 0: THE MANA AURA (Blue Depth Glow) ========== */}
      <div className="temple-mana-aura" />

      {/* ========== THE CONTENT PILLAR ========== */}
      
      {/* Upper Section */}
      <motion.div 
        className="upper-section"
        animate={{ 
          y: isArmoryOpen ? '-100%' : 0,
          opacity: isArmoryOpen ? 0 : 1
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* === THE FRIEZE (Hero) === */}
        <section className="monument-frieze">
          <div className="frieze-texture"></div>
          
          <div className="frieze-noise">
            {noiseLines.map((line) => (
              <div 
                key={line.id}
                className="noise-line rune-glow"
                style={{ top: `${line.top}%`, animationDuration: `${line.speed}s` }}
              >
                {line.text}
              </div>
            ))}
          </div>
          
          <AnimatePresence>
            {visibleMessage && (
              <motion.div
                className="monument-message carved"
                style={{ 
                  left: `${messagePosition.x}%`, 
                  top: `${messagePosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6 }}
              >
                <span className="message-text">"{visibleMessage.text}"</span>
                <span className="message-author">— {visibleMessage.author}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className="etch-button"
            onClick={() => setShowEtchModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Code size={16} />
            <span>ETCH YOUR LEGACY</span>
          </motion.button>

          <div className="frieze-title">
            <h1>THE TEMPLE OF SYSTEM</h1>
            <p className="carved-subtitle">Bow before the architecture of tomorrow</p>
          </div>
        </section>

        {/* === THE ORIGIN (Timeline) === */}
        <section className="origin-section">
          <h2 className="section-title stone-title">
            <span className="title-line"></span>
            THE ORIGIN
            <span className="title-line"></span>
          </h2>
          
          <div className="timeline-container">
            <div className="timeline-line amber-thread"></div>
            {TIMELINE_EVENTS.map((event, index) => (
              <motion.div
                key={event.id}
                className={`timeline-point ${activeTimelineEvent === event.id ? 'active' : ''}`}
                style={{ left: `${(index + 1) * 20}%` }}
                onMouseEnter={() => setActiveTimelineEvent(event.id)}
                onMouseLeave={() => setActiveTimelineEvent(null)}
                whileHover={{ scale: 1.3 }}
              >
                <div className="point-dot"></div>
                <span className="point-year">{event.year}</span>
                <AnimatePresence>
                  {activeTimelineEvent === event.id && (
                    <motion.div
                      className="timeline-card"
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                      <div className="card-icon">{event.image}</div>
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>
      </motion.div>

      {/* ========== LAYER 3: THE HIDDEN GATE ========== */}
      <motion.div 
        className={`armory-trigger ${isArmoryOpen ? 'open' : ''}`}
        ref={gateRef}
        animate={{ height: isArmoryOpen ? '85vh' : '80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Gate Trigger */}
        <motion.button 
          className="trigger-bar"
          onClick={toggleArmory}
          whileHover={{ scale: isArmoryOpen ? 1 : 1.02 }}
        >
          <div className="trigger-glow"></div>
          <div className="trigger-content">
            <Eye size={18} className="trigger-eye" />
            <div className="trigger-arrows">
              <ChevronsUp size={16} className={`chevron-icon ${isArmoryOpen ? 'flip' : ''}`} />
              <ChevronsDown size={16} className={`chevron-icon ${isArmoryOpen ? 'flip' : ''}`} />
            </div>
            <span className="trigger-text">
              {isArmoryOpen ? 'SEAL THE GATE' : 'ENTER THE ARMORY'}
            </span>
            <div className="trigger-arrows">
              <ChevronsUp size={16} className={`chevron-icon ${isArmoryOpen ? 'flip' : ''}`} />
              <ChevronsDown size={16} className={`chevron-icon ${isArmoryOpen ? 'flip' : ''}`} />
            </div>
            <Eye size={18} className="trigger-eye" />
          </div>
          <div className="trigger-pulse"></div>
        </motion.button>

        {/* === THE VOID SHOP === */}
        <AnimatePresence>
          {isArmoryOpen && (
            <motion.div 
              className="armory-interior void-shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="void-particles">
                {[...Array(30)].map((_, i) => (
                  <span key={i} className="void-particle" style={{
                    '--x': `${Math.random() * 100}%`,
                    '--y': `${Math.random() * 100}%`,
                    '--delay': `${Math.random() * 5}s`,
                    '--size': `${2 + Math.random() * 3}px`,
                  }} />
                ))}
              </div>
              
              <div className="blue-flames">
                <div className="flame flame-left"></div>
                <div className="flame flame-right"></div>
              </div>

              <div className="armory-header">
                <ShoppingBag size={28} />
                <h2>THE HIDDEN ARMORY</h2>
                <p>Artifacts of the System. Handle with reverence.</p>
              </div>

              {/* Infinite Carousel Effect */}
              <div className="artifacts-carousel infinite">
                <div className="carousel-track">
                  {[...ARMORY_ARTIFACTS, ...ARMORY_ARTIFACTS].map((artifact, index) => (
                    <motion.div
                      key={`${artifact.id}-${index}`}
                      className={`artifact-card ${selectedArtifact === artifact.id ? 'selected' : ''}`}
                      initial={{ opacity: 0, y: 80 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (index % 5) * 0.1 }}
                      onClick={() => setSelectedArtifact(selectedArtifact === artifact.id ? null : artifact.id)}
                      style={{ '--glow-color': artifact.glow }}
                    >
                      <div className="artifact-rank">{artifact.type}</div>
                      <div className="artifact-levitate">
                        <span className="artifact-icon">{artifact.image}</span>
                        <div className="artifact-flame"></div>
                      </div>
                      <h3 className="artifact-name">{artifact.name}</h3>
                      <p className="artifact-desc">{artifact.description}</p>
                      <div className="artifact-price">
                        <Star size={14} />
                        <span>${artifact.price}</span>
                      </div>
                      <motion.button 
                        className="acquire-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ACQUIRE
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Lower Section */}
      <motion.div 
        className="lower-section"
        animate={{ 
          y: isArmoryOpen ? '100%' : 0,
          opacity: isArmoryOpen ? 0 : 1
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* === THE ECOSYSTEM === */}
        <section className="ecosystem-section">
          <h2 className="section-title stone-title">
            <span className="title-line"></span>
            THE ECOSYSTEM
            <span className="title-line"></span>
          </h2>

          <div className="bento-grid">
            <motion.div className="bento-card bento-os stone-card" whileHover={{ scale: 1.02 }}>
              <div className="card-header"><Monitor size={24} /><span>MINIMAL OS</span></div>
              <div className="os-visual">
                <div className="os-logo">
                  <div className="logo-fragment"></div>
                  <div className="logo-fragment"></div>
                  <div className="logo-fragment"></div>
                  <div className="logo-fragment"></div>
                </div>
              </div>
              <p className="card-description">Облегчённая Windows. Максимальная производительность.</p>
              <motion.button className="download-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Download size={16} /><span>Download Build v2.0</span>
              </motion.button>
            </motion.div>

            <motion.div className="bento-card bento-lab stone-card" whileHover={{ scale: 1.02 }}>
              <div className="card-header"><Palette size={24} /><span>CONCEPT LAB</span></div>
              <div className="prints-gallery">
                {CONCEPT_PRINTS.map((print) => (
                  <div key={print.id} className="print-item">
                    <div className="print-preview">{print.image}</div>
                    <div className="print-info">
                      <span className="print-name">{print.name}</span>
                      <div className="print-votes">
                        <Heart size={14} fill={votedPrints.includes(print.id) ? '#f97316' : 'none'} color={votedPrints.includes(print.id) ? '#f97316' : 'currentColor'} />
                        <span>{print.votes + (votedPrints.includes(print.id) ? 1 : 0)}</span>
                      </div>
                    </div>
                    <button className={`vote-btn ${votedPrints.includes(print.id) ? 'voted' : ''}`} onClick={() => handleVote(print.id)} disabled={votedPrints.includes(print.id)}>
                      {votedPrints.includes(print.id) ? '✓' : 'VOTE'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="bento-card bento-works stone-card" whileHover={{ scale: 1.02 }}>
              <div className="card-header"><Cpu size={24} /><span>TOP WORKS</span></div>
              <div className="builds-slider">
                <AnimatePresence mode="wait">
                  <motion.div key={currentBuildIndex} className="build-slide" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                    <div className="build-icon">{TOP_BUILDS[currentBuildIndex].image}</div>
                    <h3>{TOP_BUILDS[currentBuildIndex].name}</h3>
                    <p>{TOP_BUILDS[currentBuildIndex].specs}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="slider-controls">
                  <button onClick={() => setCurrentBuildIndex((prev) => (prev - 1 + TOP_BUILDS.length) % TOP_BUILDS.length)}><ChevronLeft size={20} /></button>
                  <div className="slider-dots">{TOP_BUILDS.map((_, i) => (<span key={i} className={`dot ${i === currentBuildIndex ? 'active' : ''}`} />))}</div>
                  <button onClick={() => setCurrentBuildIndex((prev) => (prev + 1) % TOP_BUILDS.length)}><ChevronRight size={20} /></button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* === ROADMAP === */}
        <section className="roadmap-section">
          <h2 className="section-title stone-title"><span className="title-line"></span>THE ROADMAP<span className="title-line"></span></h2>
          <div className="roadmap-list">
            {ROADMAP_ITEMS.map((item) => (
              <motion.div key={item.id} className="roadmap-item stone-card" whileHover={{ x: 10 }}>
                <div className="item-header">
                  <span className="item-name">{item.name}</span>
                  <span className={`item-status ${item.status}`}>{item.status === 'in-progress' ? 'IN PROGRESS' : item.status === 'planned' ? 'PLANNED' : 'CONCEPT'}</span>
                </div>
                <div className="progress-bar">
                  <motion.div className="progress-fill" initial={{ width: 0 }} whileInView={{ width: `${item.progress}%` }} transition={{ duration: 1, delay: 0.2 }} />
                  <span className="progress-text">{item.progress}%</span>
                </div>
                <button className={`boost-btn ${boostedItems.includes(item.id) ? 'boosted' : ''}`} onClick={() => handleBoost(item.id)} disabled={boostedItems.includes(item.id) || userLevel < 10}>
                  <Zap size={14} /><span>{boostedItems.includes(item.id) ? 'BOOSTED' : 'BOOST'}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* === INNER CIRCLE === */}
        <section className="inner-circle-section">
          <div className="circle-container">
            <div className="circle-glow golden-glow"></div>
            <div className="circle-content">
              <Crown size={48} className="crown-icon golden-icon" />
              <h2>THE SYSTEM ADMIN</h2>
              <p>Direct channel to the architects</p>
              {hasAccess ? (
                <motion.button className="direct-line-btn golden-key" onClick={openDirectLine} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Sparkles size={18} /><span>OPEN DIRECT LINE</span><ArrowRight size={18} />
                </motion.button>
              ) : (
                <div className="access-denied">
                  <div className="locked-btn"><Lock size={18} /><span>LEVEL 50+ ONLY</span></div>
                  <p className="access-hint">Current level: {userLevel}</p>
                </div>
              )}
            </div>
            <div className="circle-particles">{[...Array(20)].map((_, i) => (<span key={i} className="particle golden-particle" style={{ '--delay': `${i * 0.5}s`, '--angle': `${i * 18}deg` }} />))}</div>
          </div>
        </section>
      </motion.div>

      {/* === ETCH MODAL === */}
      <AnimatePresence>
        {showEtchModal && (
          <motion.div className="etch-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEtchModal(false)}>
            <motion.div className="etch-modal stone-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowEtchModal(false)}><X size={20} /></button>
              <h3>ETCH YOUR LEGACY</h3>
              <p>Your words will echo through eternity</p>
              <div className="etch-input-container">
                <input type="text" value={etchText} onChange={(e) => setEtchText(e.target.value.slice(0, 100))} placeholder="Speak your truth..." maxLength={100} />
                <span className="char-count">{etchText.length}/100</span>
              </div>
              <motion.button className="etch-submit-btn" onClick={handleEtchSubmit} disabled={!etchText.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Send size={16} /><span>CARVE INTO STONE</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModPage;
