import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, Instagram, Youtube, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
  const { language } = useLanguage();
  const [expandedSection, setExpandedSection] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);

  // Footer navigation clusters
  const footerNav = {
    SYSTEM: {
      label: { en: 'SYSTEM', ru: 'СИСТЕМА' },
      links: [
        { en: 'Home', ru: 'Главная', path: '/' },
        { en: 'PC Builder', ru: 'Сборки', path: '/pc-builder' },
        { en: 'Mod', ru: 'Мод', path: '/mod' },
        { en: 'Marketplace', ru: 'Маркет', path: '/marketplace' },
      ]
    },
    COMMUNITY: {
      label: { en: 'COMMUNITY', ru: 'СООБЩЕСТВО' },
      links: [
        { en: 'Guild', ru: 'Гильдия', path: '/community' },
        { en: 'Network', ru: 'Сеть', path: '/community/network' },
        { en: 'Consensus', ru: 'Идеи', path: '/community/consensus' },
        { en: 'Creators', ru: 'Авторы', path: '/creators' },
      ]
    },
    SUPPORT: {
      label: { en: 'SUPPORT', ru: 'ПОДДЕРЖКА' },
      links: [
        { en: 'Contact', ru: 'Контакты', path: '/contact' },
        { en: 'FAQ', ru: 'FAQ', path: '/support' },
        { en: 'Suggest', ru: 'Предложить', path: '/suggest' },
      ]
    },
    LEGAL: {
      label: { en: 'LEGAL', ru: 'ПРАВОВОЕ' },
      links: [
        { en: 'Privacy', ru: 'Приватность', path: '/privacy' },
        { en: 'Cookies', ru: 'Куки', path: '/cookies' },
        { en: 'Terms', ru: 'Условия', path: '/accessibility' },
      ]
    },
    SOCIAL: {
      label: { en: 'SOCIAL', ru: 'СОЦСЕТИ' },
      links: [
        { en: 'Instagram', ru: 'Instagram', path: '#', icon: Instagram },
        { en: 'YouTube', ru: 'YouTube', path: '#', icon: Youtube },
        { en: 'X', ru: 'X', path: '#', icon: Twitter },
      ]
    },
  };

  const sectionKeys = Object.keys(footerNav);

  const toggleMobileSection = (key) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  return (
    <footer className="monolith-footer">
      {/* Dot Grid Background */}
      <div className="footer-dot-grid" />
      
      {/* Desktop: Single Line with Hover Dropdowns */}
      <div className="footer-desktop">
        <nav className="footer-nav-line">
          {sectionKeys.map((key, index) => (
            <React.Fragment key={key}>
              {index > 0 && <span className="footer-dot">•</span>}
              <div 
                className="footer-nav-item"
                onMouseEnter={() => setHoveredSection(key)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <span className="footer-nav-label">
                  {footerNav[key].label[language === 'ru' ? 'ru' : 'en']}
                </span>
                
                {/* Dropdown */}
                <AnimatePresence>
                  {hoveredSection === key && (
                    <motion.div
                      className="footer-dropdown"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {footerNav[key].links.map((link, i) => (
                        <Link 
                          key={i} 
                          to={link.path} 
                          className="footer-dropdown-link"
                        >
                          {link.icon && <link.icon size={12} strokeWidth={1.5} />}
                          <span>{link[language === 'ru' ? 'ru' : 'en']}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </React.Fragment>
          ))}
        </nav>
        
        {/* Copyright */}
        <div className="footer-copyright">
          <span>© 2024 GHOST PROTOCOL</span>
          <span className="footer-dot">•</span>
          <span>{language === 'ru' ? 'ВСЕ ПРАВА ЗАЩИЩЕНЫ' : 'ALL RIGHTS RESERVED'}</span>
        </div>
      </div>

      {/* Mobile: Accordion */}
      <div className="footer-mobile">
        {sectionKeys.map((key) => (
          <div key={key} className="footer-accordion-item">
            <button
              className="footer-accordion-trigger"
              onClick={() => toggleMobileSection(key)}
              aria-expanded={expandedSection === key}
            >
              <span>{footerNav[key].label[language === 'ru' ? 'ru' : 'en']}</span>
              <ChevronDown 
                size={14} 
                strokeWidth={1.5}
                className={`footer-accordion-icon ${expandedSection === key ? 'expanded' : ''}`}
              />
            </button>
            
            <AnimatePresence>
              {expandedSection === key && (
                <motion.div
                  className="footer-accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {footerNav[key].links.map((link, i) => (
                    <Link 
                      key={i} 
                      to={link.path} 
                      className="footer-accordion-link"
                    >
                      {link.icon && <link.icon size={12} strokeWidth={1.5} />}
                      <span>{link[language === 'ru' ? 'ru' : 'en']}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        
        {/* Mobile Copyright */}
        <div className="footer-mobile-copyright">
          © 2024 GHOST PROTOCOL
        </div>
      </div>

      <style>{`
        .monolith-footer {
          position: relative;
          background: #000000;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem 1.5rem;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
          overflow: hidden;
        }

        /* Dot Grid Background */
        .footer-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        /* Desktop Layout */
        .footer-desktop {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .footer-nav-line {
          display: flex;
          align-items: center;
          gap: 0;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-dot {
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.625rem;
          margin: 0 1rem;
          user-select: none;
        }

        .footer-nav-item {
          position: relative;
        }

        .footer-nav-label {
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: color 0.2s ease;
          padding: 0.5rem 0;
        }

        .footer-nav-item:hover .footer-nav-label {
          color: rgba(255, 255, 255, 0.9);
        }

        /* Dropdown */
        .footer-dropdown {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(10, 10, 10, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 0.5rem 0;
          min-width: 140px;
          margin-bottom: 0.5rem;
          backdrop-filter: blur(12px);
        }

        .footer-dropdown::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(255, 255, 255, 0.1);
        }

        .footer-dropdown-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.625rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .footer-dropdown-link:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.05);
        }

        /* Copyright */
        .footer-copyright {
          display: flex;
          align-items: center;
          gap: 0;
          font-size: 0.5625rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
        }

        .footer-copyright .footer-dot {
          margin: 0 0.75rem;
          font-size: 0.5rem;
        }

        /* Mobile Layout */
        .footer-mobile {
          display: none;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .footer-accordion-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-accordion-item:last-of-type {
          border-bottom: none;
        }

        .footer-accordion-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 1rem 0;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .footer-accordion-trigger:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .footer-accordion-icon {
          transition: transform 0.2s ease;
        }

        .footer-accordion-icon.expanded {
          transform: rotate(180deg);
        }

        .footer-accordion-content {
          overflow: hidden;
          padding-bottom: 0.5rem;
        }

        .footer-accordion-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0 0.625rem 1rem;
          font-size: 0.625rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .footer-accordion-link:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .footer-mobile-copyright {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.5625rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .footer-desktop {
            display: none;
          }
          
          .footer-mobile {
            display: flex;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
