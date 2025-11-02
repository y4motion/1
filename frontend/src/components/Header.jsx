import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Power, ShoppingCart, MessageCircle, User, Sun, Moon, Globe, X } from 'lucide-react';
import { mockUser, categories } from '../mockData';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/glassmorphism.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCatalogPopup, setShowCatalogPopup] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const navLinks = [
    { name: 'HOME', path: '/', key: 'home' },
    { name: t('nav.marketplace'), path: '/marketplace', key: 'marketplace' },
    { name: t('nav.restock'), path: '/restock', key: 'restock' }
  ];

  const getLevelProgress = () => {
    return ((mockUser.xp / mockUser.nextLevelXP) * 100).toFixed(0);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setShowCatalogPopup(true);
  };

  const handleCategoryClick = (slug) => {
    setShowCatalogPopup(false);
    navigate(`/category/${slug}`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50" style={{ padding: '1rem 3rem' }}>
        <div className="glass" style={{ 
          borderRadius: '16px', 
          padding: '0.625rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left Group: Logo + Navigation Links (tightly grouped) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Logo - Left with Enhanced Pulsing */}
            <button
              onClick={handleLogoClick}
              className="pulse-glow-enhanced"
              style={{ 
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '6px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <Power size={24} className="icon-color" strokeWidth={2} />
            </button>

            {/* Navigation Links - Left-aligned, adjacent to logo */}
            <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  className={`text-link ${location.pathname === link.path ? 'active' : ''}`}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Language Toggle */}
            <button
              className="lang-toggle"
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
              style={{ padding: '0.375rem 0.625rem' }}
            >
              <Globe size={18} className="icon-color" />
              <span style={{ 
                marginLeft: '0.375rem', 
                fontSize: '0.75rem', 
                fontWeight: '600',
                letterSpacing: '0.5px'
              }} className="icon-color">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ padding: '0.375rem' }}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="icon-color" />
              ) : (
                <Moon size={18} className="icon-color" />
              )}
            </button>

            {/* LVL Button with Permanent Glass Background */}
            <div style={{ position: 'relative' }}>
              <button
                className="lvl-button-permanent"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}
              >
                <span style={{ fontSize: '0.875rem' }}>{t('user.level')} {mockUser.level}</span>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: theme === 'dark' ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.2)'
                }}>
                  <User size={16} className="icon-color" />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="glass-strong"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    minWidth: '280px',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    zIndex: 1000
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      color: theme === 'dark' ? 'white' : '#1a1a1a', 
                      fontSize: '1.25rem', 
                      fontWeight: '700',
                      marginBottom: '0.25rem' 
                    }}>
                      {mockUser.username}
                    </div>
                    <div style={{ 
                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', 
                      fontSize: '0.875rem' 
                    }}>
                      {t('user.level')} {mockUser.level} • {mockUser.xp} XP
                    </div>
                  </div>

                  {/* XP Progress Bar */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      height: '8px',
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${getLevelProgress()}%`,
                        background: 'linear-gradient(90deg, #2196F3, #21CBF3)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ 
                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', 
                      fontSize: '0.75rem',
                      marginTop: '0.25rem' 
                    }}>
                      {mockUser.nextLevelXP - mockUser.xp} {t('user.xpToNextLevel')}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="text-link" style={{ 
                      justifyContent: 'space-between',
                      display: 'flex',
                      width: '100%',
                      textAlign: 'left'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingCart size={16} />
                        {t('user.cart')}
                      </span>
                      {mockUser.cartItems > 0 && (
                        <span style={{
                          background: '#F44336',
                          color: 'white',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {mockUser.cartItems}
                        </span>
                      )}
                    </button>
                    <button className="text-link" style={{ 
                      justifyContent: 'space-between',
                      display: 'flex',
                      width: '100%',
                      textAlign: 'left'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageCircle size={16} />
                        {t('user.messages')}
                      </span>
                      {mockUser.messages > 0 && (
                        <span style={{
                          background: '#4CAF50',
                          color: 'white',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {mockUser.messages}
                        </span>
                      )}
                    </button>
                    <button className="text-link" style={{ width: '100%', textAlign: 'left' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} />
                        {t('user.accountSettings')}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Catalog Popup */}
      {showCatalogPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setShowCatalogPopup(false)}
        >
          <div
            className="glass-strong"
            style={{
              maxWidth: '800px',
              width: '100%',
              borderRadius: '16px',
              padding: '2.5rem',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCatalogPopup(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                transition: 'all 0.3s ease'
              }}
              className="theme-toggle"
            >
              <X size={24} className="icon-color" />
            </button>

            {/* Catalog Title */}
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              marginBottom: '2rem',
              letterSpacing: '1px'
            }}>
              {t('nav.catalog')}
            </h2>

            {/* Categories Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem'
            }}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="text-link"
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    width: '100%',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                  }}
                >
                  {t(`categories.${category.slug}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;