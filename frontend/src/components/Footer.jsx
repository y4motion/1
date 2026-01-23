import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { HelpCircle, Mail, MapPin, ChevronDown } from 'lucide-react';

const Footer = () => {
  const { language } = useLanguage();
  const [showLanguages, setShowLanguages] = useState(false);

  // Main navigation categories (center - big dot-matrix style)
  const mainCategories = [
    { en: 'OFFERS', ru: 'АКЦИИ', path: '/marketplace' },
    { en: 'SHOP ALL', ru: 'КАТАЛОГ', path: '/marketplace' },
    { en: 'BUILDS', ru: 'СБОРКИ', path: '/pc-builder' },
    { en: 'SWAP', ru: 'ОБМЕН', path: '/glassy-swap' },
    { en: 'COMMUNITY', ru: 'ГИЛЬДИЯ', path: '/community' },
    { en: 'MOD', ru: 'МОД', path: '/mod' },
  ];

  // Bottom left links
  const bottomLeftLinks = [
    { en: 'PLAYGROUND', ru: 'ГЛАВНАЯ', path: '/' },
    { en: 'STORES', ru: 'МАГАЗИНЫ', path: '/marketplace' },
    { en: 'CONTACT', ru: 'КОНТАКТЫ', path: '/contact' },
    { en: 'CAREERS', ru: 'КАРЬЕРА', path: '/team' },
    { en: 'LEGAL', ru: 'ПРАВОВОЕ', path: '/privacy' },
  ];

  // Bottom right links (social)
  const bottomRightLinks = [
    { en: 'COMMUNITY', ru: 'СООБЩЕСТВО', path: '/community' },
    { en: 'INSTAGRAM', ru: 'INSTAGRAM', path: '#' },
    { en: 'YOUTUBE', ru: 'YOUTUBE', path: '#' },
    { en: 'X', ru: 'X', path: '#' },
    { en: 'TIKTOK', ru: 'TIKTOK', path: '#' },
  ];

  return (
    <footer className="nothing-footer">
      {/* Dot Grid Background */}
      <div className="footer-dot-grid" />
      
      {/* Main Categories - Center (Dot Matrix Style) */}
      <nav className="footer-main-nav">
        {mainCategories.map((cat, i) => (
          <Link 
            key={i} 
            to={cat.path} 
            className="footer-main-link"
          >
            {cat[language === 'ru' ? 'ru' : 'en']}
          </Link>
        ))}
      </nav>

      {/* Center Block - Support, Newsletter, Store, Languages */}
      <div className="footer-center-block">
        <Link to="/support" className="footer-center-item">
          <span>SUPPORT</span>
          <HelpCircle size={16} strokeWidth={1.5} />
        </Link>
        
        <Link to="/news" className="footer-center-item">
          <span>NEWSLETTER</span>
          <Mail size={16} strokeWidth={1.5} />
        </Link>
        
        <div className="footer-center-item">
          <span>STORE: RUSSIA</span>
          <MapPin size={16} strokeWidth={1.5} />
        </div>
        
        <button 
          className="footer-center-item footer-lang-btn"
          onClick={() => setShowLanguages(!showLanguages)}
        >
          <span>LANGUAGES: {language === 'ru' ? 'RU' : 'EN'}</span>
          <ChevronDown size={16} strokeWidth={1.5} className={showLanguages ? 'rotated' : ''} />
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        {/* Left links */}
        <nav className="footer-bottom-left">
          {bottomLeftLinks.map((link, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="footer-separator">•</span>}
              <Link to={link.path} className="footer-bottom-link">
                {link[language === 'ru' ? 'ru' : 'en']}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        {/* Right links (social) */}
        <nav className="footer-bottom-right">
          {bottomRightLinks.map((link, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="footer-separator">•</span>}
              <Link to={link.path} className="footer-bottom-link">
                {link[language === 'ru' ? 'ru' : 'en']}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <style>{`
        .nothing-footer {
          position: relative;
          background: #000000;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          overflow: hidden;
        }

        /* Dot Grid Background - matches Nothing style */
        .footer-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Main Navigation - Big Dot Matrix Links */
        .footer-main-nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 4rem;
          position: relative;
          z-index: 1;
        }

        .footer-main-link {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          padding: 0.5rem 1rem;
          transition: all 0.2s ease;
          /* Dot-matrix effect */
          text-shadow: 
            0 0 1px rgba(255,255,255,0.5),
            0 0 2px rgba(255,255,255,0.3);
        }

        .footer-main-link:hover {
          color: #ffffff;
          text-shadow: 
            0 0 10px rgba(255,255,255,0.5),
            0 0 20px rgba(255,255,255,0.3);
        }

        /* Center Block */
        .footer-center-block {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          min-width: 280px;
          margin-bottom: 4rem;
          position: relative;
          z-index: 1;
        }

        .footer-center-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          font-family: 'SF Mono', monospace;
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.15s ease;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          cursor: pointer;
        }

        .footer-center-item:last-child {
          border-bottom: none;
        }

        .footer-center-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }

        .footer-lang-btn .rotated {
          transform: rotate(180deg);
        }

        /* Bottom Bar */
        .footer-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          z-index: 1;
        }

        .footer-bottom-left,
        .footer-bottom-right {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .footer-bottom-link {
          font-family: 'SF Mono', monospace;
          font-size: 0.625rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          transition: color 0.15s ease;
          padding: 0.25rem 0;
        }

        .footer-bottom-link:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .footer-separator {
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.5rem;
          margin: 0 0.75rem;
          user-select: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nothing-footer {
            min-height: auto;
            padding: 6rem 1.5rem 8rem;
          }

          .footer-main-nav {
            gap: 0;
            margin-bottom: 3rem;
          }

          .footer-main-link {
            font-size: 1.25rem;
            padding: 0.4rem 0.5rem;
          }

          .footer-center-block {
            min-width: 100%;
            max-width: 320px;
            margin-bottom: 2rem;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem 1.5rem 1.5rem;
          }

          .footer-bottom-left,
          .footer-bottom-right {
            flex-wrap: wrap;
            justify-content: center;
          }

          .footer-separator {
            margin: 0 0.5rem;
          }

          .footer-bottom-link {
            font-size: 0.5625rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
