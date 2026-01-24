import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();

  // Left links
  const leftLinks = [
    { en: 'PLAYGROUND', ru: 'ГЛАВНАЯ', path: '/' },
    { en: 'STORES', ru: 'МАГАЗИНЫ', path: '/marketplace' },
    { en: 'CONTACT', ru: 'КОНТАКТЫ', path: '/contact' },
    { en: 'CAREERS', ru: 'КАРЬЕРА', path: '/team' },
    { en: 'LEGAL', ru: 'ПРАВОВОЕ', path: '/privacy' },
  ];

  // Right links (social)
  const rightLinks = [
    { en: 'COMMUNITY', ru: 'СООБЩЕСТВО', path: '/community' },
    { en: 'INSTAGRAM', ru: 'INSTAGRAM', path: '#' },
    { en: 'YOUTUBE', ru: 'YOUTUBE', path: '#' },
    { en: 'X', ru: 'X', path: '#' },
    { en: 'TIKTOK', ru: 'TIKTOK', path: '#' },
  ];

  return (
    <footer className="nothing-footer">
      {/* Left links */}
      <nav className="footer-left">
        {leftLinks.map((link, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="footer-dot">•</span>}
            <Link to={link.path} className="footer-link">
              {link[language === 'ru' ? 'ru' : 'en']}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      {/* Right links */}
      <nav className="footer-right">
        {rightLinks.map((link, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="footer-dot">•</span>}
            <Link to={link.path} className="footer-link">
              {link[language === 'ru' ? 'ru' : 'en']}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      <style>{`
        .nothing-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2rem;
          background: #000000;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-left,
        .footer-right {
          display: flex;
          align-items: center;
        }

        .footer-link {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
          font-size: 0.625rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .footer-link:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .footer-dot {
          color: rgba(255, 255, 255, 0.25);
          font-size: 0.5rem;
          margin: 0 0.75rem;
          user-select: none;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .nothing-footer {
            flex-direction: column;
            gap: 1rem;
            padding: 1.25rem 1.5rem;
          }

          .footer-left,
          .footer-right {
            flex-wrap: wrap;
            justify-content: center;
          }

          .footer-dot {
            margin: 0 0.5rem;
          }

          .footer-link {
            font-size: 0.5625rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
