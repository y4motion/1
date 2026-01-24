import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
  const { language } = useLanguage();
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [expandedPillar, setExpandedPillar] = useState(null);

  // Left pillars (3)
  const leftPillars = {
    HARDWARE: {
      label: 'HARDWARE',
      links: [
        { en: 'Components', ru: 'Комплектующие', path: '/marketplace' },
        { en: 'Peripherals', ru: 'Периферия', path: '/category/peripherals' },
        { en: 'Merch', ru: 'Мерч', path: '/category/merch' },
        { en: 'Limited Drops', ru: 'Лимитки', path: '/groupbuy' },
      ]
    },
    ECOSYSTEM: {
      label: 'ECOSYSTEM',
      links: [
        { en: 'PC Builder', ru: 'Сборка ПК', path: '/pc-builder' },
        { en: 'Minimal OS', ru: 'Minimal OS', path: '/mod' },
        { en: 'Drivers', ru: 'Драйверы', path: '/downloads' },
        { en: 'Neural Config', ru: 'ИИ Конфиг', path: '/chat' },
      ]
    },
    COMMUNITY: {
      label: 'COMMUNITY',
      links: [
        { en: 'The Feed', ru: 'Лента', path: '/community/network' },
        { en: 'Roadmap', ru: 'Roadmap', path: '/community/consensus' },
        { en: 'Guilds', ru: 'Гильдии', path: '/community' },
        { en: 'Leaderboard', ru: 'Рейтинг', path: '/rating' },
      ]
    },
  };

  // Right pillars (3)
  const rightPillars = {
    SUPPORT: {
      label: 'SUPPORT',
      links: [
        { en: 'Shipping & Returns', ru: 'Доставка и Возврат', path: '/shipping' },
        { en: 'Warranty', ru: 'Гарантия', path: '/warranty' },
        { en: 'FAQ', ru: 'FAQ', path: '/support' },
        { en: 'Contact Us', ru: 'Контакты', path: '/contact' },
      ]
    },
    SOCIALS: {
      label: 'SOCIALS',
      links: [
        { en: 'YouTube', ru: 'YouTube', path: '#' },
        { en: 'X (Twitter)', ru: 'X (Twitter)', path: '#' },
        { en: 'Instagram', ru: 'Instagram', path: '#' },
        { en: 'TikTok', ru: 'TikTok', path: '#' },
      ]
    },
    LEGAL: {
      label: 'LEGAL',
      links: [
        { en: 'Privacy', ru: 'Privacy', path: '/privacy' },
        { en: 'Terms', ru: 'Terms', path: '/accessibility' },
        { en: 'Cookies', ru: 'Cookies', path: '/cookies' },
      ]
    },
  };

  const leftKeys = Object.keys(leftPillars);
  const rightKeys = Object.keys(rightPillars);
  const allPillars = { ...leftPillars, ...rightPillars };

  const toggleMobilePillar = (key) => {
    setExpandedPillar(expandedPillar === key ? null : key);
  };

  // Render pillar with dropdown
  const renderPillar = (key, pillar, isLast = false) => (
    <React.Fragment key={key}>
      <div
        className="terminal-pillar"
        onMouseEnter={() => setHoveredPillar(key)}
        onMouseLeave={() => setHoveredPillar(null)}
      >
        <span className={`terminal-pillar-label ${hoveredPillar === key ? 'active' : ''}`}>
          {pillar.label}
        </span>

        {/* Hover Dropdown */}
        <AnimatePresence>
          {hoveredPillar === key && (
            <motion.div
              className="terminal-dropdown"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {pillar.links.map((link, i) => (
                <Link
                  key={i}
                  to={link.path}
                  className="terminal-dropdown-link"
                >
                  {link[language === 'ru' ? 'ru' : 'en']}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!isLast && <span className="terminal-dot">•</span>}
    </React.Fragment>
  );

  return (
    <footer className="ghost-terminal-footer">
      {/* Dot Grid Background */}
      <div className="terminal-dot-grid" />

      {/* Desktop Layout */}
      <div className="terminal-desktop">
        <div className="terminal-row">
          {/* Left 3 pillars */}
          <nav className="terminal-left">
            {leftKeys.map((key, i) => renderPillar(key, leftPillars[key], i === leftKeys.length - 1))}
          </nav>

          {/* Copyright center */}
          <div className="terminal-copyright">
            © 2026 MINIMAL MOD
          </div>

          {/* Right 3 pillars */}
          <nav className="terminal-right">
            {rightKeys.map((key, i) => renderPillar(key, rightPillars[key], i === rightKeys.length - 1))}
          </nav>
        </div>
      </div>

      {/* Mobile Layout - Accordion */}
      <div className="terminal-mobile">
        {[...leftKeys, ...rightKeys].map((key) => (
          <div key={key} className="terminal-accordion">
            <button
              className="terminal-accordion-trigger"
              onClick={() => toggleMobilePillar(key)}
            >
              <span>{allPillars[key].label}</span>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={`accordion-chevron ${expandedPillar === key ? 'expanded' : ''}`}
              />
            </button>

            <AnimatePresence>
              {expandedPillar === key && (
                <motion.div
                  className="terminal-accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {allPillars[key].links.map((link, i) => (
                    <Link
                      key={i}
                      to={link.path}
                      className="terminal-accordion-link"
                    >
                      {link[language === 'ru' ? 'ru' : 'en']}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Mobile copyright */}
        <div className="mobile-copyright">
          © 2026 MINIMAL MOD
        </div>
      </div>

      <style>{`
        .ghost-terminal-footer {
          position: relative;
          background: #000000;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1.25rem 2rem;
          overflow: visible;
        }

        /* Dot Grid */
        .terminal-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        /* Desktop */
        .terminal-desktop {
          position: relative;
          z-index: 1;
        }

        .terminal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .terminal-left,
        .terminal-right {
          display: flex;
          align-items: center;
        }

        .terminal-dot {
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.5rem;
          margin: 0 1rem;
          user-select: none;
        }

        .terminal-pillar {
          position: relative;
        }

        .terminal-pillar-label {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 0.625rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: color 0.15s ease;
          padding: 0.5rem 0;
        }

        .terminal-pillar-label:hover,
        .terminal-pillar-label.active {
          color: rgba(255, 255, 255, 0.9);
        }

        /* Copyright center */
        .terminal-copyright {
          font-family: 'SF Mono', monospace;
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.15);
        }

        /* Dropdown */
        .terminal-dropdown {
          position: absolute;
          bottom: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(8, 8, 8, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.375rem 0;
          min-width: 160px;
          backdrop-filter: blur(16px);
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
        }

        .terminal-dropdown::before {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(255, 255, 255, 0.08);
        }

        .terminal-dropdown-link {
          display: block;
          padding: 0.5rem 1rem;
          font-family: 'SF Mono', monospace;
          font-size: 0.5625rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: all 0.1s ease;
          white-space: nowrap;
        }

        .terminal-dropdown-link:hover {
          color: rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.04);
        }

        /* Mobile */
        .terminal-mobile {
          display: none;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .terminal-accordion {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .terminal-accordion:last-of-type {
          border-bottom: none;
        }

        .terminal-accordion-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0.875rem 0;
          background: none;
          border: none;
          font-family: 'SF Mono', monospace;
          font-size: 0.625rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .terminal-accordion-trigger:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        .accordion-chevron {
          transition: transform 0.2s ease;
          opacity: 0.5;
        }

        .accordion-chevron.expanded {
          transform: rotate(180deg);
        }

        .terminal-accordion-content {
          overflow: hidden;
          padding-bottom: 0.5rem;
        }

        .terminal-accordion-link {
          display: block;
          padding: 0.5rem 0 0.5rem 1rem;
          font-family: 'SF Mono', monospace;
          font-size: 0.5625rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .terminal-accordion-link:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .mobile-copyright {
          margin-top: 1rem;
          padding-top: 0.875rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          font-family: 'SF Mono', monospace;
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.15);
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ghost-terminal-footer {
            padding: 1rem 1.5rem;
          }

          .terminal-desktop {
            display: none;
          }

          .terminal-mobile {
            display: flex;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
