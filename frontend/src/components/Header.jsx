import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Power, ShoppingCart, MessageCircle, User, Sun, Moon, Globe, X, 
  Trophy, Target, Gift, Wallet, Clock, Users, TrendingUp, Package, 
  Heart, Copy, Check
} from 'lucide-react';
import { 
  mockUser, categories, achievements, dailyQuests, inventoryItems, 
  recentOrders, wishlist, products, leaderboard, userLevels 
} from '../mockData';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import SpinWheel from './SpinWheel';
import '../styles/glassmorphism.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCatalogPopup, setShowCatalogPopup] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const navLinks = [
    { name: 'HOME', path: '/', key: 'home' },
    { name: t('nav.marketplace'), path: '/marketplace', key: 'marketplace' },
    { name: t('nav.restock'), path: '/restock', key: 'restock' }
  ];

  const handleLogoClick = (e) => {
    e.preventDefault();
    setShowCatalogPopup(true);
  };

  const handleCategoryClick = (slug) => {
    setShowCatalogPopup(false);
    navigate(`/category/${slug}`);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(mockUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSpinWin = (prize) => {
    console.log('Won prize:', prize);
    // Here you would update user's inventory/balance
  };

  const currentLevel = userLevels[mockUser.level];
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
                  className="text-link"
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
            <div>
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
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced User Dropdown Menu with Tabs - Outside header for proper backdrop-filter */}
      {showUserMenu && (
        <div 
          className="glass-strong"
          style={{
            position: 'fixed',
            top: '5.5rem',
            right: '3rem',
            width: '480px',
            maxHeight: '600px',
            borderRadius: '16px',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          {/* User Header */}
          <div style={{ padding: '1.5rem', borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  {mockUser.username}
                </div>
                <div style={{ opacity: 0.6, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ padding: '0.125rem 0.5rem', borderRadius: '12px', background: currentLevel.color, color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>
                    {currentLevel.name}
                  </span>
                  <span>{mockUser.xp} XP</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                <span style={{ fontSize: '1.25rem' }}>🔥</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>{mockUser.loginStreak}</span>
              </div>
            </div>
            <div>
              <div style={{ height: '8px', background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ height: '100%', width: `${((mockUser.xp / mockUser.nextLevelXP) * 100).toFixed(0)}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}dd)`, transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ opacity: 0.5, fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{mockUser.nextLevelXP - mockUser.xp} {t('user.xpToNextLevel')}</span>
                <span>{mockUser.level + 1}</span>
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
          <div style={{ padding: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>User menu content</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem' }}>Full menu in Phase 2</p>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Dropdown - Vertical List */}
      {showCatalogPopup && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998
            }}
            onClick={() => setShowCatalogPopup(false)}
          />
          
          {/* Vertical Catalog List */}
          <div
            className="glass-strong"
            style={{
              position: 'fixed',
              top: '5rem',
              left: '3rem',
              width: '280px',
              borderRadius: '16px',
              padding: '1rem',
              zIndex: 9999,
              animation: 'slideDown 0.3s ease-out',
              overflow: 'hidden'
            }}
          >
            {/* Title */}
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              marginBottom: '0.75rem',
              padding: '0.5rem 0',
              opacity: 0.6,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {t('nav.catalog')}
            </div>

            {/* Categories List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="text-link"
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    width: '100%',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '8px',
                    background: 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(200, 230, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {t(`categories.${category.slug}`)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;