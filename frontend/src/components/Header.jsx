import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Power, ShoppingCart, MessageCircle, User, Sun, Moon, Globe, X, 
  Trophy, Target, Gift, Wallet, Clock, Users, TrendingUp, Package, 
  Heart, Copy, Check, LogIn, Search, Settings, Volume2, VolumeX, Music, MousePointer
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
  const [activeTab, setActiveTab] = useState('overview');
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
                          { mode: 'on', icon: Volume2, label: language === 'ru' ? 'ВКЛ' : 'ON' },
                          { mode: 'off', icon: VolumeX, label: language === 'ru' ? 'ВЫКЛ' : 'OFF' }
                        ].map(({ mode, icon: Icon, label }) => (
                          <button
                            key={mode}
                            onClick={() => setSoundMode(mode)}
                            className="glass-subtle"
                            style={{
                              padding: '0.5rem',
                              borderRadius: theme === 'minimal-mod' ? '0' : '6px',
                              border: soundMode === mode 
                                ? (theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.3)' : '1px solid rgba(139, 92, 246, 0.5)')
                                : (theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)')),
                              background: soundMode === mode 
                                ? (theme === 'minimal-mod' ? 'transparent' : 'rgba(139, 92, 246, 0.1)')
                                : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
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
                                  ? 'rgba(241, 241, 241, 0.12)'
                                  : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)');
                              }
                            }}
                          >
                            <Icon size={18} className="icon-color" />
                            <span style={{ fontSize: '0.625rem', fontWeight: '600' }} className="icon-color">
                              {label}
                            </span>
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
                          borderRadius: '6px',
                          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
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
                        <option value="RUB" style={{ background: theme === 'dark' ? '#1a1a1a' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>RUB ₽</option>
                        <option value="USD" style={{ background: theme === 'dark' ? '#1a1a1a' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>USD $</option>
                        <option value="EUR" style={{ background: theme === 'dark' ? '#1a1a1a' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>EUR €</option>
                        <option value="CNY" style={{ background: theme === 'dark' ? '#1a1a1a' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>CNY ¥</option>
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

      {/* Enhanced LVL Menu with Tabs - Now opens from logo button (left side) */}
      {showLVLMenu && (
        <div 
          data-lvl-menu="true"
          className={theme === 'minimal-mod' ? '' : 'glass-strong'}
          style={{
            position: 'fixed',
            top: '5.5rem',
            left: '3rem',
            width: '480px',
            maxHeight: '600px',
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
          {/* User Header */}
          <div style={{ padding: '1.5rem', borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  {user?.username || mockUser.username}
                </div>
                <div style={{ opacity: 0.6, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ padding: '0.125rem 0.5rem', borderRadius: '12px', background: currentLevel.color, color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>
                    {currentLevel.name}
                  </span>
                  <span>{displayUser.xp} XP</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                <span style={{ fontSize: '1.25rem' }}>🔥</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>{displayUser.loginStreak}</span>
              </div>
            </div>
            <div>
              <div style={{ height: '8px', background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ height: '100%', width: `${((displayUser.xp / displayUser.nextLevelXP) * 100).toFixed(0)}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}dd)`, transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ opacity: 0.5, fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{displayUser.nextLevelXP - displayUser.xp} {t('user.xpToNextLevel')}</span>
                <span>{displayUser.level + 1}</span>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', padding: '0 0.5rem' }}>
            {[
              { id: 'overview', icon: User, label: 'Overview' },
              { id: 'achievements', icon: Trophy, label: t('user.achievements') },
              { id: 'quests', icon: Target, label: t('user.dailyQuests') },
              { id: 'rewards', icon: Gift, label: t('user.inventory') }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '0.75rem 0.5rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === tab.id ? `2px solid ${currentLevel.color}` : '2px solid transparent', opacity: activeTab === tab.id ? 1 : 0.5, transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <tab.icon size={18} />
                <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Compact content - just show current user info */}
          <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-subtle" style={{ padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Wallet size={16} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{t('user.bonusBalance')}</span>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFD700' }}>{mockUser.bonusBalance} 🪙</span>
                  </div>
                </div>
                
                <button onClick={() => canSpin && setShowSpinWheel(true)} className="glass" disabled={!canSpin} style={{ width: '100%', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', border: canSpin ? (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(200, 230, 255, 0.4)') : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.1)'), background: canSpin ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.2)'), cursor: canSpin ? 'pointer' : 'not-allowed', opacity: canSpin ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gift size={20} />
                    <span style={{ fontWeight: '600' }}>{t('user.spinWheel')}</span>
                    {canSpin && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)', animation: 'pulse 2s infinite' }} />}
                  </div>
                  {!canSpin && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{language === 'en' ? `Next spin in ${daysUntilSpin()} days` : `Следующее вращение через ${daysUntilSpin()} дней`}</span>}
                </button>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="glass-subtle" style={{ padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🏆</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{unlockedAchievements.length}/{achievements.length}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t('user.achievements')}</div>
                  </div>
                  <div className="glass-subtle" style={{ padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✅</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{completedQuests.length}/{dailyQuests.length}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t('user.dailyQuests')}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="text-link" style={{ justifyContent: 'space-between', display: 'flex', width: '100%', padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={16} />{t('user.cart')}</span>
                    {mockUser.cartItems > 0 && <span style={{ background: '#F44336', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>{mockUser.cartItems}</span>}
                  </button>
                  <button className="text-link" style={{ justifyContent: 'space-between', display: 'flex', width: '100%', padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageCircle size={16} />{t('user.messages')}</span>
                    {mockUser.messages > 0 && <span style={{ background: '#4CAF50', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>{mockUser.messages}</span>}
                  </button>
                </div>
                
                <div className="glass-subtle" style={{ padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>{t('user.referralCode')}</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '700', fontFamily: 'monospace' }}>{displayUser.referralCode}</div>
                    </div>
                    <button onClick={handleCopyReferralCode} className="theme-toggle" style={{ padding: '0.5rem' }}>
                      {copiedCode ? <Check size={18} color="#4CAF50" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {achievements.map(achievement => (
                  <div key={achievement.id} className="glass-subtle" style={{ padding: '1rem', borderRadius: '12px', opacity: achievement.unlocked ? 1 : 0.5, border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(200, 230, 255, 0.2)', background: achievement.unlocked ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.6)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.3)') }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.75rem', filter: achievement.unlocked ? 'none' : 'grayscale(100%)' }}>{achievement.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{language === 'en' ? achievement.name : achievement.nameRu}</span>
                          {achievement.unlocked && <span style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem', borderRadius: '6px', background: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.3)' }}>✓</span>}
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.5rem' }}>{language === 'en' ? achievement.description : achievement.descriptionRu}</div>
                        {!achievement.unlocked && achievement.progress !== undefined && (
                          <div>
                            <div style={{ height: '4px', background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                              <div style={{ height: '100%', width: `${(achievement.progress / achievement.total * 100)}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}dd)`, transition: 'width 0.3s ease' }} />
                            </div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>{achievement.progress}/{achievement.total}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Daily Quests Tab */}
            {activeTab === 'quests' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dailyQuests.map(quest => (
                  <div key={quest.id} className="glass-subtle" style={{ padding: '1rem', borderRadius: '12px', border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(200, 230, 255, 0.2)', background: quest.completed ? (theme === 'dark' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.1)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)') }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.5rem' }}>{quest.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>{language === 'en' ? quest.name : quest.nameRu}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.5rem' }}>{language === 'en' ? quest.description : quest.descriptionRu}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '6px', background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(quest.progress / quest.total * 100)}%`, background: quest.completed ? 'linear-gradient(90deg, #4CAF50, #45a049)' : `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}dd)`, transition: 'width 0.3s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.65rem', opacity: 0.5, minWidth: '40px' }}>{quest.progress}/{quest.total}</span>
                        </div>
                      </div>
                      {quest.completed ? <span style={{ fontSize: '1.25rem', color: '#4CAF50' }}>✓</span> : <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#FFD700', padding: '0.25rem 0.5rem', borderRadius: '6px', background: theme === 'dark' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)' }}>+{quest.xpReward}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Inventory Tab */}
            {activeTab === 'rewards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {inventoryItems.map(item => (
                  <div key={item.id} className="glass-subtle" style={{ padding: '1rem', borderRadius: '12px', border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(200, 230, 255, 0.2)', background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.75rem' }}>{item.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>{language === 'en' ? item.name : item.nameRu}</div>
                        {item.code && <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', padding: '0.25rem 0.5rem', borderRadius: '4px', background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', display: 'inline-block', marginBottom: '0.25rem' }}>{item.code}</div>}
                        {item.expiresAt && <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>{t('user.expiresIn')} {Math.ceil((new Date(item.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))} {t('user.days')}</div>}
                      </div>
                      {item.usable && <button className="glass" style={{ padding: '0.5rem 0.75rem', fontSize: '0.7rem', borderRadius: '6px', border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200, 230, 255, 0.3)', background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)', fontWeight: '600', cursor: 'pointer' }}>{t('user.useNow')}</button>}
                    </div>
                  </div>
                ))}
              </div>
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