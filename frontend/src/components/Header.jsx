import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Power, ShoppingCart, MessageCircle, User, Sun, Moon, Globe } from 'lucide-react';
import { mockUser } from '../mockData';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/glassmorphism.css';

const Header = () => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('nav.catalog'), path: '/catalog' },
    { name: t('nav.proGamer'), path: '/pro-gamer' },
    { name: t('nav.creator'), path: '/creator' },
    { name: t('nav.user'), path: '/user' },
    { name: t('nav.marketplace'), path: '/marketplace' },
    { name: t('nav.restock'), path: '/restock' }
  ];

  const getLevelProgress = () => {
    return ((mockUser.xp / mockUser.nextLevelXP) * 100).toFixed(0);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ padding: '1.5rem 3rem' }}>
      <div className="glass" style={{ 
        borderRadius: '16px', 
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo - Left */}
        <Link to="/" className="pulse-glow" style={{ textDecoration: 'none' }}>
          <Power size={28} className="icon-color" strokeWidth={2} />
        </Link>

        {/* Navigation Links - Center */}
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Language Toggle */}
          <button
            className="lang-toggle"
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
          >
            <Globe size={20} className="icon-color" />
            <span style={{ 
              marginLeft: '0.5rem', 
              fontSize: '0.875rem', 
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
          >
            {theme === 'dark' ? (
              <Sun size={20} className="icon-color" />
            ) : (
              <Moon size={20} className="icon-color" />
            )}
          </button>

          {/* LVL Button */}
          <div style={{ position: 'relative' }}>
            <button
              className="lvl-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <span>{t('user.level')} {mockUser.level}</span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: theme === 'dark' ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.2)'
              }}>
                <User size={18} className="icon-color" />
              </div>
            </button>

            {/* User Dropdown Menu (Mock) */}
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
  );
};

export default Header;
