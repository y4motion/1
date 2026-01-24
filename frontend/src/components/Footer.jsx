import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Youtube, Twitter, Instagram, Music2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
  const { language } = useLanguage();
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [expandedPillar, setExpandedPillar] = useState(null);

  // The 5 Pillars - Tech Brand Style
  const pillars = {
    HARDWARE: {
      label: { en: 'HARDWARE', ru: 'HARDWARE' },
      links: [
        { en: 'Components', ru: 'Комплектующие', path: '/marketplace' },
        { en: 'Peripherals', ru: 'Периферия', path: '/category/peripherals' },
        { en: 'Merch', ru: 'Мерч', path: '/category/merch' },
        { en: 'Limited Drops', ru: 'Лимитки', path: '/groupbuy' },
      ]
    },
    ECOSYSTEM: {
      label: { en: 'ECOSYSTEM', ru: 'ECOSYSTEM' },
      links: [
        { en: 'PC Builder', ru: 'Сборка ПК', path: '/pc-builder' },
        { en: 'Minimal OS', ru: 'Minimal OS', path: '/mod' },
        { en: 'Drivers', ru: 'Драйверы', path: '/downloads' },
        { en: 'Neural Config', ru: 'ИИ Конфиг', path: '/chat' },
      ]
    },
    COMMUNITY: {
      label: { en: 'COMMUNITY', ru: 'COMMUNITY' },
      links: [
        { en: 'The Feed', ru: 'Лента', path: '/community/network' },
        { en: 'Roadmap', ru: 'Roadmap', path: '/community/consensus' },
        { en: 'Guilds', ru: 'Гильдии', path: '/community' },
        { en: 'Leaderboard', ru: 'Рейтинг', path: '/rating' },
      ]
    },
    SUPPORT: {
      label: { en: 'SUPPORT', ru: 'SUPPORT' },
      links: [
        { en: 'Shipping & Returns', ru: 'Доставка и Возврат', path: '/shipping' },
        { en: 'Warranty', ru: 'Гарантия', path: '/warranty' },
        { en: 'FAQ', ru: 'FAQ', path: '/support' },
        { en: 'Contact Us', ru: 'Контакты', path: '/contact' },
      ]
    },
  };

  // Social links with icons
  const socials = [
    { name: 'YouTube', icon: Youtube, url: '#' },
    { name: 'X', icon: Twitter, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'TikTok', icon: Music2, url: '#' },
  ];

  // Legal links
  const legalLinks = [
    { en: 'Privacy', ru: 'Privacy', path: '/privacy' },
    { en: 'Terms', ru: 'Terms', path: '/accessibility' },
    { en: 'Cookies', ru: 'Cookies', path: '/cookies' },
  ];

  const pillarKeys = Object.keys(pillars);

  const toggleMobilePillar = (key) => {
    setExpandedPillar(expandedPillar === key ? null : key);
  };

  return (
    <footer className="ghost-terminal-footer">
      {/* Dot Grid Background */}
      <div className="terminal-dot-grid" />

      {/* Desktop Layout */}
      <div className="terminal-desktop">
        {/* Main pillars row - centered */}
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

          {/* SOCIALS - icons with spacing */}
          <span className="terminal-dot">•</span>
          <div className="terminal-socials">
            <span className="terminal-pillar-label">SOCIALS</span>
            <div className="socials-icons">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  className="social-icon-link"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon size={14} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom bar: Copyright LEFT, Legal RIGHT */}
        <div className="terminal-bottom-bar">
          <div className="terminal-copyright">
            © 2026 MINIMAL MOD
          </div>

          <div className="terminal-legal">
            {legalLinks.map((link, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="legal-dot">•</span>}
                <Link to={link.path} className="legal-link">
                  {link[language === 'ru' ? 'ru' : 'en']}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Accordion */}
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

        {/* Mobile Socials */}
        <div className="mobile-socials">
          <span className="mobile-socials-label">SOCIALS</span>
          <div className="mobile-socials-icons">
            {socials.map((social, i) => (
              <a
                key={i}
                href={social.url}
                className="social-icon-link"
                aria-label={social.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                <social.icon size={16} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="mobile-bottom-bar">
          <div className="terminal-copyright">© 2026 MINIMAL MOD</div>
          <div className="terminal-legal">
            {legalLinks.map((link, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="legal-dot">•</span>}
                <Link to={link.path} className="legal-link">
                  {link[language === 'ru' ? 'ru' : 'en']}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ghost-terminal-footer {
          position: relative;
          background: #000000;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1.5rem 2rem 1rem;
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
          display: flex;
          flex-direction: column;
          gap: 1rem;
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

        /* Socials inline with spacing */
        .terminal-socials {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .terminal-socials .terminal-pillar-label {
          cursor: default;
        }

        .socials-icons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .social-icon-link {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.35);
          transition: color 0.15s ease;
          padding: 0.25rem;
        }

        .social-icon-link:hover {
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
          min-width: 180px;
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

        /* Bottom Bar - Copyright LEFT, Legal RIGHT */
        .terminal-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.875rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .terminal-copyright {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.15);
        }

        .terminal-legal {
          display: flex;
          align-items: center;
        }

        .legal-link {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.15);
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .legal-link:hover {
          color: rgba(255, 255, 255, 0.4);
        }

        .legal-dot {
          color: rgba(255, 255, 255, 0.08);
          font-size: 6px;
          margin: 0 0.5rem;
          user-select: none;
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

        /* Mobile Socials */
        .mobile-socials {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .mobile-socials-label {
          font-family: 'SF Mono', monospace;
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        .mobile-socials-icons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* Mobile Bottom Bar */
        .mobile-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 0.875rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ghost-terminal-footer {
            padding: 1.25rem 1.5rem 1rem;
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
