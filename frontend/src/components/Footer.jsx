import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
  const { language, setLanguage } = useLanguage();
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [expandedPillar, setExpandedPillar] = useState(null);

  // The 5 Pillars
  const pillars = {
    SYSTEMS: {
      label: { en: 'SYSTEMS', ru: 'СИСТЕМЫ' },
      links: [
        { en: 'PC Builder', ru: 'Сборка ПК', path: '/pc-builder' },
        { en: 'AI Config', ru: 'ИИ Конфиг', path: '/chat' },
        { en: 'Minimal OS v2', ru: 'Minimal OS v2', path: '/mod' },
        { en: 'Benchmarks', ru: 'Бенчмарки', path: '/rating' },
      ]
    },
    ARMORY: {
      label: { en: 'ARMORY', ru: 'АРСЕНАЛ' },
      links: [
        { en: 'Hardware', ru: 'Железо', path: '/marketplace' },
        { en: 'Peripherals', ru: 'Периферия', path: '/category/peripherals' },
        { en: 'Limited Drops', ru: 'Лимитки', path: '/groupbuy' },
        { en: 'Glasspad', ru: 'Glasspad', path: '/glassy-swap' },
      ]
    },
    NETWORK: {
      label: { en: 'NETWORK', ru: 'СЕТЬ' },
      links: [
        { en: 'Ghost Feed', ru: 'Лента', path: '/community/network' },
        { en: 'Consensus', ru: 'Голосование', path: '/community/consensus' },
        { en: 'Monarchs', ru: 'Рейтинг', path: '/rating' },
        { en: 'Guilds', ru: 'Гильдии', path: '/community' },
      ]
    },
    SIGNAL: {
      label: { en: 'SIGNAL', ru: 'СИГНАЛ' },
      links: [
        { en: 'Server Status', ru: 'Статус', path: '/status' },
        { en: 'Order Track', ru: 'Трекинг', path: '/profile' },
        { en: 'Returns', ru: 'Возвраты', path: '/support' },
        { en: 'Contact', ru: 'Контакты', path: '/contact' },
      ]
    },
    PROTOCOL: {
      label: { en: 'PROTOCOL', ru: 'ПРОТОКОЛ' },
      links: [
        { en: 'Manifesto', ru: 'Манифест', path: '/team' },
        { en: 'Privacy', ru: 'Приватность', path: '/privacy' },
        { en: 'Terms', ru: 'Условия', path: '/accessibility' },
        { en: 'Imprint', ru: 'Импринт', path: '/ads' },
      ]
    },
  };

  const pillarKeys = Object.keys(pillars);

  const toggleMobilePillar = (key) => {
    setExpandedPillar(expandedPillar === key ? null : key);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  return (
    <footer className="ghost-terminal-footer">
      {/* Dot Grid Background */}
      <div className="terminal-dot-grid" />

      {/* Desktop: Single line with hover dropdowns */}
      <div className="terminal-desktop">
        <nav className="terminal-pillars">
          {pillarKeys.map((key, index) => (
            <React.Fragment key={key}>
              {index > 0 && <span className="terminal-dot">•</span>}
              <div
                className="terminal-pillar"
                onMouseEnter={() => setHoveredPillar(key)}
                onMouseLeave={() => setHoveredPillar(null)}
              >
                <span className={`terminal-pillar-label ${hoveredPillar === key ? 'active' : ''}`}>
                  {pillars[key].label[language === 'ru' ? 'ru' : 'en']}
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
                      {pillars[key].links.map((link, i) => (
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
            </React.Fragment>
          ))}
        </nav>

        {/* Bottom signature bar */}
        <div className="terminal-signature">
          <button className="terminal-lang-toggle" onClick={toggleLanguage}>
            <span className={language === 'ru' ? 'active' : ''}>[RU]</span>
            <span className="lang-separator">/</span>
            <span className={language === 'en' ? 'active' : ''}>EN</span>
          </button>

          <div className="terminal-copyright">
            <span>GHOST PROTOCOL</span>
            <span className="terminal-dot-small">•</span>
            <span>© 2024</span>
            <span className="terminal-dot-small">•</span>
            <span>EST. TOKYO—MOSCOW</span>
          </div>
        </div>
      </div>

      {/* Mobile: Accordion */}
      <div className="terminal-mobile">
        {pillarKeys.map((key) => (
          <div key={key} className="terminal-accordion">
            <button
              className="terminal-accordion-trigger"
              onClick={() => toggleMobilePillar(key)}
            >
              <span>{pillars[key].label[language === 'ru' ? 'ru' : 'en']}</span>
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
                  {pillars[key].links.map((link, i) => (
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

        {/* Mobile signature */}
        <div className="terminal-mobile-signature">
          <button className="terminal-lang-toggle" onClick={toggleLanguage}>
            <span className={language === 'ru' ? 'active' : ''}>[RU]</span>
            <span className="lang-separator">/</span>
            <span className={language === 'en' ? 'active' : ''}>EN</span>
          </button>
          <span className="mobile-copyright">GHOST PROTOCOL © 2024</span>
        </div>
      </div>

      <style>{`
        .ghost-terminal-footer {
          position: relative;
          background: #000000;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1.5rem 2rem;
          overflow: visible;
        }

        /* Dot Grid */
        .terminal-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        /* Desktop */
        .terminal-desktop {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          z-index: 1;
        }

        .terminal-pillars {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0;
        }

        .terminal-dot {
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.5rem;
          margin: 0 1.25rem;
          user-select: none;
        }

        .terminal-pillar {
          position: relative;
        }

        .terminal-pillar-label {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.15em;
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
          font-size: 0.625rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: all 0.1s ease;
        }

        .terminal-dropdown-link:hover {
          color: rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.04);
        }

        /* Signature Bar */
        .terminal-signature {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .terminal-lang-toggle {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          font-family: 'SF Mono', monospace;
          font-size: 0.5625rem;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.15s ease;
        }

        .terminal-lang-toggle:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .terminal-lang-toggle .active {
          color: rgba(255, 255, 255, 0.9);
        }

        .lang-separator {
          color: rgba(255, 255, 255, 0.2);
        }

        .terminal-copyright {
          display: flex;
          align-items: center;
          font-family: 'SF Mono', monospace;
          font-size: 0.5625rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
        }

        .terminal-dot-small {
          margin: 0 0.5rem;
          font-size: 0.375rem;
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
          font-size: 0.6875rem;
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
          font-size: 0.625rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .terminal-accordion-link:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .terminal-mobile-signature {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .mobile-copyright {
          font-family: 'SF Mono', monospace;
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.2);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ghost-terminal-footer {
            padding: 1.25rem 1.5rem;
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
