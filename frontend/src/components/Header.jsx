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

              {/* Enhanced User Dropdown Menu with Tabs */}
              {showUserMenu && (
                <div 
                  className="glass-strong"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '480px',
                    maxHeight: '600px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    border: theme === 'dark' 
                      ? '1px solid rgba(255, 255, 255, 0.1)' 
                      : '1px solid rgba(200, 230, 255, 0.3)',
                    background: theme === 'dark'
                      ? 'rgba(10, 10, 11, 0.85)'
                      : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    boxShadow: theme === 'dark'
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(200, 230, 255, 0.3)'
                  }}
                >
                  {/* User Header */}
                  <div style={{ padding: '1.5rem', borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700',
                          marginBottom: '0.25rem' 
                        }}>
                          {mockUser.username}
                        </div>
                        <div style={{ 
                          opacity: 0.6,
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ 
                            padding: '0.125rem 0.5rem',
                            borderRadius: '12px',
                            background: currentLevel.color,
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {currentLevel.name}
                          </span>
                          <span>{mockUser.xp} XP</span>
                        </div>
                      </div>
                      
                      {/* Streak Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        background: theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)',
                        border: '1px solid rgba(255, 152, 0, 0.3)'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>🔥</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>{mockUser.loginStreak}</span>
                      </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div>
                      <div style={{
                        height: '8px',
                        background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${((mockUser.xp / mockUser.nextLevelXP) * 100).toFixed(0)}%`,
                          background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}dd)`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ 
                        opacity: 0.5,
                        fontSize: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>{mockUser.nextLevelXP - mockUser.xp} {t('user.xpToNextLevel')}</span>
                        <span>{mockUser.level + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ 
                    display: 'flex', 
                    borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    padding: '0 0.5rem'
                  }}>
                    {[
                      { id: 'overview', icon: User, label: 'Overview' },
                      { id: 'achievements', icon: Trophy, label: t('user.achievements') },
                      { id: 'quests', icon: Target, label: t('user.dailyQuests') },
                      { id: 'rewards', icon: Gift, label: t('user.inventory') }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem 0.5rem',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          borderBottom: activeTab === tab.id ? `2px solid ${currentLevel.color}` : '2px solid transparent',
                          opacity: activeTab === tab.id ? 1 : 0.5,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <tab.icon size={18} />
                        <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div style={{ 
                    padding: '1rem', 
                    maxHeight: '400px', 
                    overflowY: 'auto'
                  }}>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Wallet */}
                        <div className="glass-subtle" style={{ padding: '1rem', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Wallet size={16} />
                              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{t('user.bonusBalance')}</span>
                            </div>
                            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFD700' }}>
                              {mockUser.bonusBalance} 🪙
                            </span>
                          </div>
                        </div>

                        {/* Spin Wheel Button */}
                        <button
                          onClick={() => canSpin && setShowSpinWheel(true)}
                          className="glass"
                          style={{
                            width: '100%',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            position: 'relative',
                            borderRadius: '12px',
                            border: canSpin 
                              ? (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(200, 230, 255, 0.4)')
                              : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.1)'),
                            background: canSpin
                              ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)')
                              : (theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.2)'),
                            cursor: canSpin ? 'pointer' : 'not-allowed',
                            opacity: canSpin ? 1 : 0.5,
                            transition: 'all 0.3s ease'
                          }}
                          disabled={!canSpin}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Gift size={20} />
                            <span style={{ fontWeight: '600' }}>{t('user.spinWheel')}</span>
                            {canSpin && (
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#4CAF50',
                                boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)',
                                animation: 'pulse 2s infinite'
                              }} />
                            )}
                          </div>
                          {!canSpin && (
                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                              {mockUser.bonusSpinAvailable 
                                ? (language === 'en' ? 'Bonus spin after purchase!' : 'Бонусное вращение после покупки!')
                                : (language === 'en' ? `Next spin in ${daysUntilSpin()} days` : `Следующее вращение через ${daysUntilSpin()} дней`)
                              }
                            </span>
                          )}
                        </button>

                        {/* Quick Stats */}
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

                        {/* Quick Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button className="text-link" style={{ 
                            justifyContent: 'space-between',
                            display: 'flex',
                            width: '100%',
                            padding: '0.75rem 1rem'
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
                            padding: '0.75rem 1rem'
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
                        </div>

                        {/* Referral Code */}
                        <div className="glass-subtle" style={{ padding: '1rem', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>
                                {t('user.referralCode')}
                              </div>
                              <div style={{ fontSize: '1.125rem', fontWeight: '700', fontFamily: 'monospace' }}>
                                {mockUser.referralCode}
                              </div>
                            </div>
                            <button
                              onClick={handleCopyReferralCode}
                              className="theme-toggle"
                              style={{ padding: '0.5rem' }}
                            >
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
                          <div 
                            key={achievement.id}
                            className="glass-subtle" 
                            style={{ 
                              padding: '1rem', 
                              borderRadius: '12px',
                              opacity: achievement.unlocked ? 1 : 0.5,
                              position: 'relative',
                              border: theme === 'dark' 
                                ? '1px solid rgba(255, 255, 255, 0.08)' 
                                : '1px solid rgba(200, 230, 255, 0.2)',
                              background: achievement.unlocked 
                                ? (theme === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.04)' 
                                    : 'rgba(255, 255, 255, 0.6)')
                                : (theme === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.02)' 
                                    : 'rgba(255, 255, 255, 0.3)')
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <div style={{ 
                                fontSize: '1.75rem',
                                filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
                              }}>
                                {achievement.icon}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  fontSize: '0.875rem', 
                                  fontWeight: '600', 
                                  marginBottom: '0.25rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}>
                                  <span>{language === 'en' ? achievement.name : achievement.nameRu}</span>
                                  {achievement.unlocked && (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      padding: '0.125rem 0.5rem',
                                      borderRadius: '6px',
                                      background: 'rgba(76, 175, 80, 0.15)',
                                      color: '#4CAF50',
                                      border: '1px solid rgba(76, 175, 80, 0.3)'
                                    }}>
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                                  {language === 'en' ? achievement.description : achievement.descriptionRu}
                                </div>
                                {!achievement.unlocked && achievement.progress !== undefined && (
                                  <div>
                                    <div style={{
                                      height: '4px',
                                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                                      borderRadius: '2px',
                                      overflow: 'hidden',
                                      marginBottom: '0.25rem'
                                    }}>
                                      <div style={{
                                        height: '100%',
                                        width: `${(achievement.progress / achievement.total * 100)}%`,
                                        background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}dd)`,
                                        transition: 'width 0.3s ease'
                                      }} />
                                    </div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>
                                      {achievement.progress}/{achievement.total}
                                    </div>
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
                          <div 
                            key={quest.id}
                            className="glass-subtle" 
                            style={{ 
                              padding: '1rem', 
                              borderRadius: '12px',
                              border: theme === 'dark' 
                                ? '1px solid rgba(255, 255, 255, 0.08)' 
                                : '1px solid rgba(200, 230, 255, 0.2)',
                              background: quest.completed
                                ? (theme === 'dark' 
                                    ? 'rgba(76, 175, 80, 0.08)' 
                                    : 'rgba(76, 175, 80, 0.1)')
                                : (theme === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.03)' 
                                    : 'rgba(255, 255, 255, 0.5)')
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <div style={{ fontSize: '1.5rem' }}>{quest.icon}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                  {language === 'en' ? quest.name : quest.nameRu}
                                </div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                                  {language === 'en' ? quest.description : quest.descriptionRu}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{
                                    flex: 1,
                                    height: '6px',
                                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      height: '100%',
                                      width: `${(quest.progress / quest.total * 100)}%`,
                                      background: quest.completed 
                                        ? 'linear-gradient(90deg, #4CAF50, #45a049)' 
                                        : `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}dd)`,
                                      transition: 'width 0.3s ease'
                                    }} />
                                  </div>
                                  <span style={{ fontSize: '0.65rem', opacity: 0.5, minWidth: '40px' }}>
                                    {quest.progress}/{quest.total}
                                  </span>
                                </div>
                              </div>
                              {quest.completed ? (
                                <span style={{ 
                                  fontSize: '1.25rem',
                                  color: '#4CAF50'
                                }}>
                                  ✓
                                </span>
                              ) : (
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  fontWeight: '600',
                                  color: '#FFD700',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  background: theme === 'dark' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)'
                                }}>
                                  +{quest.xpReward}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inventory/Rewards Tab */}
                    {activeTab === 'rewards' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {inventoryItems.map(item => (
                          <div 
                            key={item.id}
                            className="glass-subtle" 
                            style={{ 
                              padding: '1rem', 
                              borderRadius: '12px',
                              border: theme === 'dark' 
                                ? '1px solid rgba(255, 255, 255, 0.08)' 
                                : '1px solid rgba(200, 230, 255, 0.2)',
                              background: theme === 'dark' 
                                ? 'rgba(255, 255, 255, 0.03)' 
                                : 'rgba(255, 255, 255, 0.5)'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <div style={{ fontSize: '1.75rem' }}>{item.icon}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                  {language === 'en' ? item.name : item.nameRu}
                                </div>
                                {item.code && (
                                  <div style={{ 
                                    fontSize: '0.7rem', 
                                    fontFamily: 'monospace',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    display: 'inline-block',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {item.code}
                                  </div>
                                )}
                                {item.expiresAt && (
                                  <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>
                                    {t('user.expiresIn')} {Math.ceil((new Date(item.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))} {t('user.days')}
                                  </div>
                                )}
                              </div>
                              {item.usable && (
                                <button 
                                  className="glass" 
                                  style={{ 
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '0.7rem',
                                    borderRadius: '6px',
                                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200, 230, 255, 0.3)',
                                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {t('user.useNow')}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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
              border: theme === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(200, 230, 255, 0.3)',
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 8px 32px rgba(200, 230, 255, 0.3)'
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