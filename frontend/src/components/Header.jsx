import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Power, ShoppingCart, MessageCircle, User, Sun, Moon, Globe, X, 
  Trophy, Target, Gift, Wallet, Clock, Users, TrendingUp, Package, 
  Heart, Copy, Check, LogIn, Search, Settings, Volume2, VolumeX, Music, MousePointer,
  Home, Bell, Mail, BookMarked, List, UserCircle, Edit3
} from 'lucide-react';
import { 
  mockUser, categories, achievements, dailyQuests, inventoryItems, 
  recentOrders, wishlist, products, leaderboard, userLevels 
} from '../mockData';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import SpinWheel from './SpinWheel';
import QuickCartPanel from './QuickCartPanel';
import BadgeTooltip from './BadgeTooltip';
import '../styles/glassmorphism.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLVLMenu, setShowLVLMenu] = useState(false); // LVL menu from logo button
  const [showCartPanel, setShowCartPanel] = useState(false); // Quick cart panel
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('menu');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [soundMode, setSoundMode] = useState('on'); // on, off
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { currency, setCurrency } = require('../contexts/CurrencyContext').useCurrency();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Refs for click outside detection
  const lvlMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const navLinks = [
    { name: t('nav.marketplace'), path: '/marketplace', key: 'marketplace' },
    { name: t('nav.restock'), path: '/restock', key: 'restock' },
    { name: language === 'ru' ? 'СБОРОЧНАЯ' : 'ASSEMBLY', path: '/pc-builder', key: 'pc-builder' },
    { name: t('nav.mod'), path: '/mod', key: 'mod' }
  ];

  const handleLogoClick = (e) => {
    e.preventDefault();
    // Only toggle LVL menu (catalog moved to MarketplacePage)
    setShowLVLMenu(!showLVLMenu);
  };

  const handleCategoryClick = (slug) => {
    setShowCatalogPopup(false);
    navigate(`/category/${slug}`);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode || mockUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSpinWin = (prize) => {
    console.log('Won prize:', prize);
    // Here you would update user's inventory/balance
  };

  const displayUser = user || mockUser; // Use real user or mock for demo
  const currentLevel = userLevels[displayUser.level];
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const completedQuests = dailyQuests.filter(q => q.completed);
  
  // Check if weekly spin is available (7 days passed)
  const canSpinWeekly = () => {
    if (!mockUser.lastSpinDate) return true;
    const lastSpin = new Date(mockUser.lastSpinDate);
    const now = new Date();
    const daysPassed = Math.floor((now - lastSpin) / (1000 * 60 * 60 * 24));
    return daysPassed >= 7;
  };
  
  const canSpin = canSpinWeekly() || mockUser.bonusSpinAvailable;
  const daysUntilSpin = () => {
    if (!mockUser.lastSpinDate) return 0;
    const lastSpin = new Date(mockUser.lastSpinDate);
    const now = new Date();
    const daysPassed = Math.floor((now - lastSpin) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysPassed);
  };

  // Get wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Settings menu
      if (showSettingsMenu) {
        const settingsMenu = event.target.closest('[data-settings-menu="true"]');
        const settingsButton = event.target.closest('button[title="Settings"]');
        if (!settingsMenu && !settingsButton) {
          setShowSettingsMenu(false);
        }
      }

      // For LVL menu: check if click is outside both the button and the menu
      if (showLVLMenu) {
        const lvlMenuElement = document.querySelector('[data-lvl-menu="true"]');
        const isClickInsideButton = lvlMenuRef.current && lvlMenuRef.current.contains(event.target);
        const isClickInsideMenu = lvlMenuElement && lvlMenuElement.contains(event.target);
        
        if (!isClickInsideButton && !isClickInsideMenu) {
          setShowLVLMenu(false);
        }
      }
      
      // For user menu: similar logic
      if (showUserMenu) {
        const userMenuElement = document.querySelector('[data-user-menu="true"]');
        const isClickInsideButton = userMenuRef.current && userMenuRef.current.contains(event.target);
        const isClickInsideMenu = userMenuElement && userMenuElement.contains(event.target);
        
        if (!isClickInsideButton && !isClickInsideMenu) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLVLMenu, showUserMenu, showSettingsMenu]);

  return (
    <>
      {/* Spin Wheel Modal */}
      {showSpinWheel && (
        <SpinWheel 
          onClose={() => setShowSpinWheel(false)}
          onWin={handleSpinWin}
        />
      )}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ padding: '1rem 3rem' }}>
        <div className={theme === 'minimal-mod' ? '' : 'glass'} style={{ 
          borderRadius: theme === 'minimal-mod' ? '0' : '16px',
          background: theme === 'minimal-mod' ? 'transparent' : undefined,
          border: theme === 'minimal-mod' ? 'none' : undefined,
          padding: '0.625rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* LEFT ZONE: Start + Logo + Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* "Start" Button (Level Menu) - EXTREME LEFT */}
            <div ref={lvlMenuRef}>
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
                  borderRadius: theme === 'minimal-mod' ? '0' : '6px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (theme !== 'minimal-mod') {
                    e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                title={t('nav.startMenu')}
              >
                <Power size={24} className="icon-color" strokeWidth={2} />
              </button>
            </div>

            {/* Logo - Return to Homepage */}
            <Link 
              to="/"
              className="text-link"
              style={{ 
                padding: '0.5rem 1rem'
              }}
            >
              {t('nav.home')}
            </Link>

            {/* Navigation Links */}
            <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  className="text-link"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT ZONE: Settings + Account + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Settings Multi-Button (1st from left in this zone) */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="theme-toggle"
                style={{ padding: '0.375rem' }}
              >
                <Settings size={18} className="icon-color" />
              </button>

              {/* Settings Dropdown Menu */}
              {showSettingsMenu && (
                <div 
                  data-settings-menu="true"
                  className={theme === 'minimal-mod' ? '' : 'glass-strong'}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '400px',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
                    backdropFilter: theme === 'minimal-mod' ? 'none' : undefined,
                    border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
                    padding: '0.875rem',
                    zIndex: 100,
                    fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  {/* Top Row: Sound + Currency */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {/* Sound Management - Simplified: On/Off */}
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '600', 
                        marginBottom: '0.375rem',
                        opacity: 0.7
                      }} className="icon-color">
                        {language === 'ru' ? 'ЗВУК' : 'SOUND'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                        {[
                          { mode: 'on', icon: Volume2 },
                          { mode: 'off', icon: VolumeX }
                        ].map(({ mode, icon: Icon }) => (
                          <button
                            key={mode}
                            onClick={() => setSoundMode(mode)}
                            className="glass-subtle"
                            style={{
                              padding: '0.5rem',
                              borderRadius: theme === 'minimal-mod' ? '0' : '6px',
                              border: soundMode === mode 
                                ? (theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.3)' : '1px solid rgba(139, 92, 246, 0.5)')
                                : (theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)')),
                              background: soundMode === mode 
                                ? (theme === 'minimal-mod' ? 'transparent' : 'rgba(139, 92, 246, 0.1)')
                                : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              if (soundMode !== mode && theme !== 'minimal-mod') {
                                e.currentTarget.style.background = theme === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.05)' 
                                  : 'rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.borderColor = theme === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.15)' 
                                  : 'rgba(0, 0, 0, 0.15)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (soundMode !== mode) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = theme === 'minimal-mod'
                                  ? 'rgba(241, 241, 241, 0.2)'
                                  : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)');
                              }
                            }}
                          >
                            <Icon size={18} className="icon-color" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Currency - Compact */}
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '600', 
                        marginBottom: '0.375rem',
                        opacity: 0.7
                      }} className="icon-color">
                        {language === 'ru' ? 'ВАЛЮТА' : 'CURRENCY'}
                      </div>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="glass-subtle icon-color"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: theme === 'minimal-mod' ? '0' : '6px',
                          border: theme === 'minimal-mod'
                            ? '1px solid rgba(241, 241, 241, 0.2)'
                            : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#ffffff' : '#1a1a1a'),
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (theme !== 'minimal-mod') {
                            e.currentTarget.style.background = theme === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.borderColor = theme === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = theme === 'minimal-mod'
                            ? 'rgba(241, 241, 241, 0.2)'
                            : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)');
                        }}
                      >
                        <option value="RUB" style={{ background: theme === 'minimal-mod' ? '#000000' : (theme === 'dark' ? '#1a1a1a' : '#ffffff'), color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#ffffff' : '#1a1a1a'), fontWeight: '600' }}>RUB ₽</option>
                        <option value="USD" style={{ background: theme === 'minimal-mod' ? '#000000' : (theme === 'dark' ? '#1a1a1a' : '#ffffff'), color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#ffffff' : '#1a1a1a'), fontWeight: '600' }}>USD $</option>
                        <option value="EUR" style={{ background: theme === 'minimal-mod' ? '#000000' : (theme === 'dark' ? '#1a1a1a' : '#ffffff'), color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#ffffff' : '#1a1a1a'), fontWeight: '600' }}>EUR €</option>
                        <option value="CNY" style={{ background: theme === 'minimal-mod' ? '#000000' : (theme === 'dark' ? '#1a1a1a' : '#ffffff'), color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#ffffff' : '#1a1a1a'), fontWeight: '600' }}>CNY ¥</option>
                      </select>
                    </div>
                  </div>

                  {/* Bottom Row: Language + Theme */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {/* Language - Compact */}
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '600', 
                        marginBottom: '0.375rem',
                        opacity: 0.7
                      }} className="icon-color">
                        {language === 'ru' ? 'ЯЗЫК' : 'LANGUAGE'}
                      </div>
                      <button
                        onClick={toggleLanguage}
                        className="glass-subtle"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem',
                          fontSize: '0.8rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.borderColor = theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.15)' 
                            : 'rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)' 
                            : 'rgba(0, 0, 0, 0.08)';
                        }}
                      >
                        <Globe size={14} className="icon-color" />
                        <span className="icon-color">
                          {language === 'en' ? 'EN' : language === 'ru' ? 'RU' : 'MIX'}
                        </span>
                      </button>
                    </div>

                    {/* Theme - Compact */}
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '600', 
                        marginBottom: '0.375rem',
                        opacity: 0.7
                      }} className="icon-color">
                        {language === 'ru' ? 'ТЕМА' : 'THEME'}
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="glass-subtle"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: theme === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.08)' 
                            : theme === 'light' 
                              ? '1px solid rgba(0, 0, 0, 0.08)'
                              : '1px solid rgba(241, 241, 241, 0.12)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem',
                          fontSize: '0.8rem',
                          fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : theme === 'light'
                              ? 'rgba(0, 0, 0, 0.05)'
                              : 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.15)' 
                            : theme === 'light'
                              ? 'rgba(0, 0, 0, 0.15)'
                              : 'rgba(241, 241, 241, 0.24)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)' 
                            : theme === 'light'
                              ? 'rgba(0, 0, 0, 0.08)'
                              : 'rgba(241, 241, 241, 0.12)';
                        }}
                      >
                        {theme === 'dark' ? (
                          <><Sun size={14} className="icon-color" /><span className="icon-color">{language === 'ru' ? 'Темная' : 'Dark'}</span></>
                        ) : theme === 'light' ? (
                          <><Moon size={14} className="icon-color" /><span className="icon-color">{language === 'ru' ? 'Светлая' : 'Light'}</span></>
                        ) : (
                          <><Power size={14} className="icon-color" /><span className="icon-color">{language === 'ru' ? 'Минимал Мод' : 'Minimal Mod'}</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account/Login Button (2nd from left in this zone) */}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowUserMenu(!showUserMenu);
                } else {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }
              }}
              className="theme-toggle"
              style={{ padding: '0.375rem' }}
            >
              <User size={18} className="icon-color" />
            </button>

            {/* Cart Button - EXTREME RIGHT (3rd from left in this zone) */}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowCartPanel(true);
                } else {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }
              }}
              className="theme-toggle"
              style={{ 
                padding: '0.375rem',
                position: 'relative'
              }}
            >
              <ShoppingCart size={18} className="icon-color" />
              {mockUser.cartItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '10px',
                  fontSize: '0.625rem',
                  fontWeight: '700',
                  minWidth: '16px',
                  textAlign: 'center'
                }}>
                  {mockUser.cartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Simplified LVL Menu - Twitter Style Navigation */}
      {showLVLMenu && (
        <div 
          data-lvl-menu="true"
          className={theme === 'minimal-mod' ? '' : 'glass-strong'}
          style={{
            position: 'fixed',
            top: '5.5rem',
            left: '3rem',
            width: '340px',
            borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            backdropFilter: theme === 'minimal-mod' ? 'none' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideDown 0.3s ease-out',
            fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
            color: theme === 'minimal-mod' ? '#f1f1f1' : (theme === 'dark' ? '#ffffff' : '#1a1a1a')
          }}
        >
          {/* User Header - Editable */}
          <div style={{ padding: '1.25rem', borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.875rem', marginBottom: '0.875rem' }}>
              {/* Avatar with edit button */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${currentLevel.color} 0%, ${currentLevel.color}99 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  border: `2px solid ${currentLevel.color}`,
                  position: 'relative'
                }}>
                  {displayUser.avatar || '👤'}
                </div>
                <button style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  border: `2px solid ${theme === 'dark' ? '#0a0a0b' : '#fafafa'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  fontSize: '10px',
                  transition: 'background 0.2s ease',
                  padding: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}
                title={language === 'ru' ? 'Изменить фото' : 'Change photo'}
                >
                  📷
                </button>
                {/* Online Status Indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 14,
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#4CAF50',
                  border: `2px solid ${theme === 'dark' ? '#0a0a0b' : '#fafafa'}`,
                  boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)'
                }} />
              </div>
              
              {/* Name and Status - Editable */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '1.0625rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username || mockUser.username}
                  </div>
                  <button style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#000'}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                  title={language === 'ru' ? 'Изменить имя' : 'Edit name'}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
                {/* Status Dropdown */}
                <select
                  defaultValue="online"
                  style={{
                    width: '100%',
                    padding: '0.375rem 0.5rem',
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.15)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'),
                    borderRadius: theme === 'minimal-mod' ? '0' : '6px',
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="online">🟢 {language === 'ru' ? 'В сети' : 'Online'}</option>
                  <option value="away">🟡 {language === 'ru' ? 'Отошел' : 'Away'}</option>
                  <option value="busy">🔴 {language === 'ru' ? 'Занят' : 'Busy'}</option>
                  <option value="offline">⚫ {language === 'ru' ? 'Не в сети' : 'Offline'}</option>
                </select>
              </div>
            </div>

            {/* Gamification Badges - Interactive with Rich Tooltips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Level Badge */}
              <BadgeTooltip
                content={
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      {language === 'ru' ? `Уровень ${displayUser.level} - ${currentLevel.name}` : `Level ${displayUser.level} - ${currentLevel.name}`}
                    </div>
                    <div style={{ marginBottom: '0.5rem', opacity: 0.8 }}>
                      {language === 'ru' ? 'Ваш текущий ранг в системе.' : 'Your current rank in the system.'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.375rem', fontWeight: '600' }}>
                      {language === 'ru' ? 'Преимущества уровня:' : 'Level benefits:'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: '1.6' }}>
                      • {language === 'ru' ? 'Эксклюзивные скидки' : 'Exclusive discounts'}<br/>
                      • {language === 'ru' ? 'Особые награды' : 'Special rewards'}<br/>
                      • {language === 'ru' ? 'Доступ к закрытым распродажам' : 'Access to private sales'}
                    </div>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                      💡 {language === 'ru' ? 'Повышайте уровень набирая XP!' : 'Level up by earning XP!'}
                    </div>
                  </div>
                }
              >
                <div 
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    background: `${currentLevel.color}20`,
                    border: `1px solid ${currentLevel.color}60`,
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: currentLevel.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${currentLevel.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span>🏆</span>
                  LVL {displayUser.level}
                </div>
              </BadgeTooltip>

              {/* XP Badge */}
              <BadgeTooltip
                content={
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      {language === 'ru' ? `Опыт: ${displayUser.xp} XP` : `Experience: ${displayUser.xp} XP`}
                    </div>
                    <div style={{ marginBottom: '0.5rem', opacity: 0.8 }}>
                      {language === 'ru' ? `До следующего уровня: ${displayUser.nextLevelXP - displayUser.xp} XP` : `To next level: ${displayUser.nextLevelXP - displayUser.xp} XP`}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.375rem', fontWeight: '600' }}>
                      {language === 'ru' ? 'Как получить XP:' : 'How to earn XP:'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: '1.6' }}>
                      • {language === 'ru' ? 'Покупки: +10 XP за каждый $1' : 'Purchases: +10 XP per $1'}<br/>
                      • {language === 'ru' ? 'Отзывы: +25 XP за отзыв' : 'Reviews: +25 XP per review'}<br/>
                      • {language === 'ru' ? 'Ежедневный вход: +5 XP' : 'Daily login: +5 XP'}<br/>
                      • {language === 'ru' ? 'Реферальная программа: +100 XP' : 'Referrals: +100 XP'}<br/>
                      • {language === 'ru' ? 'Достижения: +50-500 XP' : 'Achievements: +50-500 XP'}
                    </div>
                  </div>
                }
              >
                <div 
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    background: theme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span>⭐</span>
                  {displayUser.xp} XP
                </div>
              </BadgeTooltip>

              {/* Achievements Badge */}
              <BadgeTooltip
                position="right"
                content={
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      {language === 'ru' ? `Достижения: ${unlockedAchievements.length}/${achievements.length}` : `Achievements: ${unlockedAchievements.length}/${achievements.length}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem', fontWeight: '600' }}>
                      {language === 'ru' ? 'Разблокировано:' : 'Unlocked:'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: '1.5', marginBottom: '0.5rem' }}>
                      {unlockedAchievements.slice(0, 3).map((a, i) => (
                        <div key={i}>✓ {a.name}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.375rem', fontWeight: '600' }}>
                      {language === 'ru' ? 'Как разблокировать:' : 'How to unlock:'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: '1.6' }}>
                      • {language === 'ru' ? 'Выполняйте квесты' : 'Complete quests'}<br/>
                      • {language === 'ru' ? 'Совершайте покупки' : 'Make purchases'}<br/>
                      • {language === 'ru' ? 'Приглашайте друзей' : 'Invite friends'}
                    </div>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', textAlign: 'center' }}>
                      {language === 'ru' ? '👆 Нажмите для просмотра всех' : '👆 Click to view all'}
                    </div>
                  </div>
                }
              >
                <div 
                  onClick={() => { navigate('/profile?tab=achievements'); setShowLVLMenu(false); }}
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    background: theme === 'dark' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#FFD700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span>🎯</span>
                  {unlockedAchievements.length}/{achievements.length}
                </div>
              </BadgeTooltip>

              {/* Streak Badge */}
              <BadgeTooltip
                position="right"
                content={
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      {language === 'ru' ? `Серия входов: ${displayUser.loginStreak} дней 🔥` : `Login streak: ${displayUser.loginStreak} days 🔥`}
                    </div>
                    <div style={{ marginBottom: '0.5rem', opacity: 0.8 }}>
                      {language === 'ru' ? `Текущий бонус: +${displayUser.loginStreak * 5} XP в день` : `Current bonus: +${displayUser.loginStreak * 5} XP per day`}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.375rem', fontWeight: '600' }}>
                      {language === 'ru' ? 'Награды за серию:' : 'Streak rewards:'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: '1.6' }}>
                      {displayUser.loginStreak >= 7 ? '✅' : '🔒'} 7 {language === 'ru' ? 'дней: +50 XP бонус' : 'days: +50 XP bonus'}<br/>
                      {displayUser.loginStreak >= 14 ? '✅' : '🔒'} 14 {language === 'ru' ? 'дней: +150 XP + 100🪙' : 'days: +150 XP + 100🪙'}<br/>
                      {displayUser.loginStreak >= 30 ? '✅' : '🔒'} 30 {language === 'ru' ? 'дней: +500 XP + 500🪙' : 'days: +500 XP + 500🪙'}<br/>
                      {displayUser.loginStreak >= 100 ? '✅' : '🔒'} 100 {language === 'ru' ? 'дней: Эпическое достижение!' : 'days: Epic achievement!'}
                    </div>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255, 152, 0, 0.15)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', textAlign: 'center' }}>
                      ⚠️ {language === 'ru' ? 'Не пропускайте ни дня!' : 'Don\'t miss a single day!'}
                    </div>
                  </div>
                }
              >
                <div 
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    background: theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#FF9800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span>🔥</span>
                  {displayUser.loginStreak}d
                </div>
              </BadgeTooltip>

              {/* Coins Badge */}
              <BadgeTooltip
                position="right"
                content={
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      {language === 'ru' ? `Бонусные монеты: ${mockUser.bonusBalance}🪙` : `Bonus coins: ${mockUser.bonusBalance}🪙`}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.375rem', fontWeight: '600' }}>
                      {language === 'ru' ? 'Можно использовать для:' : 'Can be used for:'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: '1.6', marginBottom: '0.5rem' }}>
                      • {language === 'ru' ? 'Скидки (1🪙 = $0.01)' : 'Discounts (1🪙 = $0.01)'}<br/>
                      • {language === 'ru' ? 'Лутбоксы' : 'Lootboxes'}<br/>
                      • {language === 'ru' ? 'Аукционы' : 'Auctions'}<br/>
                      • {language === 'ru' ? 'Эксклюзивы' : 'Exclusive items'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.375rem', fontWeight: '600' }}>
                      {language === 'ru' ? 'Как получить:' : 'How to earn:'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: '1.6' }}>
                      • {language === 'ru' ? 'Квесты: +50-200🪙' : 'Quests: +50-200🪙'}<br/>
                      • {language === 'ru' ? 'Покупки: +1🪙/$1' : 'Purchases: +1🪙/$1'}<br/>
                      • {language === 'ru' ? 'Колесо фортуны: до 1000🪙' : 'Spin wheel: up to 1000🪙'}<br/>
                      • {language === 'ru' ? 'Рефералы: +500🪙' : 'Referrals: +500🪙'}
                    </div>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255, 215, 0, 0.15)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', textAlign: 'center' }}>
                      🎰 {language === 'ru' ? 'Нажмите для вращения колеса!' : 'Click to spin the wheel!'}
                    </div>
                  </div>
                }
              >
                <div 
                  onClick={() => setShowSpinWheel(true)}
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    background: theme === 'dark' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span>🪙</span>
                  {mockUser.bonusBalance}
                </div>
              </BadgeTooltip>
            </div>

            {/* Mini XP Progress Bar */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{
                height: '4px',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: theme === 'minimal-mod' ? '0' : '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${((displayUser.xp / displayUser.nextLevelXP) * 100).toFixed(0)}%`,
                  background: currentLevel.color,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.6875rem', opacity: 0.5, marginTop: '0.25rem', textAlign: 'right' }}>
                {displayUser.nextLevelXP - displayUser.xp} XP → LVL {displayUser.level + 1}
              </div>
            </div>
          </div>

          {/* Menu Items - Simple List */}
          <div style={{ padding: '0.5rem' }}>
            <Link to="/profile" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <UserCircle size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Профиль' : 'Profile'}</span>
            </Link>

            <Link to="/notifications" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'space-between', display: 'flex', width: '100%', padding: '0.875rem 1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Bell size={20} />
                <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Уведомления' : 'Notifications'}</span>
              </span>
              {19 > 0 && <span style={{ background: '#8b5cf6', color: 'white', padding: '0.125rem 0.5rem', borderRadius: theme === 'minimal-mod' ? '0' : '12px', fontSize: '0.75rem', fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>19</span>}
            </Link>

            <Link to="/chat" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'space-between', display: 'flex', width: '100%', padding: '0.875rem 1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mail size={20} />
                <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Сообщения' : 'Messages'}</span>
              </span>
              {mockUser.messages > 0 && <span style={{ background: '#4CAF50', color: 'white', padding: '0.125rem 0.5rem', borderRadius: theme === 'minimal-mod' ? '0' : '12px', fontSize: '0.75rem', fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>{mockUser.messages}</span>}
            </Link>

            <Link to="/bookmarks" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <BookMarked size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Закладки' : 'Bookmarks'}</span>
            </Link>

            <Link to="/lists" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <List size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Списки' : 'Lists'}</span>
            </Link>

            <Link to="/communities" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <Users size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Сообщества' : 'Communities'}</span>
            </Link>

            <button onClick={() => { setShowSettingsMenu(true); setShowLVLMenu(false); }} className="text-link" style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <Settings size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Настройки' : 'Settings'}</span>
            </button>

            {/* Logout */}
            {isAuthenticated && (
              <button onClick={() => { logout(); setShowLVLMenu(false); }} className="text-link" style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem', borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', marginTop: '0.5rem', paddingTop: '1rem' }}>
                <Power size={20} />
                <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Выйти' : 'Logout'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Cart Panel */}
      <QuickCartPanel 
        isOpen={showCartPanel}
        onClose={() => setShowCartPanel(false)}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;