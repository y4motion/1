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
            width: '320px',
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
          {/* User Header - Compact */}
          <div style={{ padding: '1.25rem', borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${currentLevel.color} 0%, ${currentLevel.color}99 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                border: `2px solid ${currentLevel.color}`
              }}>
                {displayUser.avatar || '👤'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username || mockUser.username}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  @{(user?.username || mockUser.username).toLowerCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items - Simple List */}
          <div style={{ padding: '0.5rem' }}>
            <Link to="/" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <Home size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Главная' : 'Home'}</span>
            </Link>

            <button className="text-link" style={{ justifyContent: 'space-between', display: 'flex', width: '100%', padding: '0.875rem 1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Bell size={20} />
                <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Уведомления' : 'Notifications'}</span>
              </span>
              {19 > 0 && <span style={{ background: '#8b5cf6', color: 'white', padding: '0.125rem 0.5rem', borderRadius: theme === 'minimal-mod' ? '0' : '12px', fontSize: '0.75rem', fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>19</span>}
            </button>

            <Link to="/chat" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'space-between', display: 'flex', width: '100%', padding: '0.875rem 1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mail size={20} />
                <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Сообщения' : 'Messages'}</span>
              </span>
              {mockUser.messages > 0 && <span style={{ background: '#4CAF50', color: 'white', padding: '0.125rem 0.5rem', borderRadius: theme === 'minimal-mod' ? '0' : '12px', fontSize: '0.75rem', fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>{mockUser.messages}</span>}
            </Link>

            <button className="text-link" style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <BookMarked size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Закладки' : 'Bookmarks'}</span>
            </button>

            <button className="text-link" style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <List size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Списки' : 'Lists'}</span>
            </button>

            <button className="text-link" style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <Users size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Сообщества' : 'Communities'}</span>
            </button>

            <Link to="/profile" className="text-link" onClick={() => setShowLVLMenu(false)} style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <UserCircle size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Профиль' : 'Profile'}</span>
            </Link>

            <button onClick={() => { setShowSettingsMenu(true); setShowLVLMenu(false); }} className="text-link" style={{ justifyContent: 'flex-start', display: 'flex', width: '100%', padding: '0.875rem 1rem', gap: '1rem' }}>
              <Settings size={20} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{language === 'ru' ? 'Настройки' : 'Settings'}</span>
            </button>
          </div>

          {/* Level Info - Compact */}
          <div style={{
            padding: '1rem',
            margin: '0.5rem',
            borderRadius: theme === 'minimal-mod' ? '0' : '8px',
            background: `${currentLevel.color}15`,
            border: `1px solid ${currentLevel.color}50`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '600' }}>
                {currentLevel.name} • LVL {displayUser.level}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {displayUser.xp} XP
              </div>
            </div>
            <div style={{
              height: '6px',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              borderRadius: theme === 'minimal-mod' ? '0' : '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${((displayUser.xp / displayUser.nextLevelXP) * 100).toFixed(0)}%`,
                background: currentLevel.color,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.375rem', textAlign: 'right' }}>
              {displayUser.nextLevelXP - displayUser.xp} XP {language === 'ru' ? 'до LVL' : 'to LVL'} {displayUser.level + 1}
            </div>
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