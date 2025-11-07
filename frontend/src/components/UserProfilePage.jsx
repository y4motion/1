import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Edit2, Trophy, Target, Gift, TrendingUp, Calendar, MapPin, Link as LinkIcon, Check, Copy, Mail, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { mockUser, userLevels, achievements, dailyQuests } from '../mockData';
import EditProfileModal from './EditProfileModal';
import '../styles/glassmorphism.css';

const UserProfilePage = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || mockUser.username,
    bio: mockUser.bio || (language === 'ru' ? 'Любитель игр и технологий' : 'Gaming and tech enthusiast'),
    location: mockUser.location || 'Moscow, Russia',
    website: mockUser.website || '',
    avatar: mockUser.avatar || '🎮'
  });

  const displayUser = user || mockUser;
  const currentLevel = userLevels[displayUser.level];
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const completedQuests = dailyQuests.filter(q => q.completed);

  const handleSaveProfile = (newData) => {
    setProfileData(newData);
    // TODO: Save to backend
    console.log('Profile updated:', newData);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(displayUser.referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '5rem',
        background: theme === 'minimal-mod'
          ? 'rgba(0, 0, 0, 1)'
          : (theme === 'dark' ? 'linear-gradient(135deg, #0a0a0b 0%, #151518 100%)' : 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'),
        fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit'
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: theme === 'minimal-mod' ? '0' : '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            color: theme === 'dark' ? '#fff' : '#1a1a1a',
            fontSize: '0.875rem',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <ArrowLeft size={20} />
          {language === 'ru' ? 'Назад' : 'Back'}
        </button>

        {/* Profile Header Card */}
        <div
          className={theme === 'minimal-mod' ? '' : 'glass'}
          style={{
            borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
            padding: '2rem',
            marginBottom: '1.5rem'
          }}
        >
          {/* Avatar and Basic Info */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${currentLevel.color} 0%, ${currentLevel.color}99 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                border: `3px solid ${currentLevel.color}`,
                position: 'relative'
              }}>
                {displayUser.avatar || '👤'}
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
              >
                <Camera size={18} />
              </button>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div>
                  <h1 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    marginBottom: '0.25rem'
                  }}>
                    {displayUser.username}
                  </h1>
                  <div style={{ opacity: 0.6, fontSize: '0.875rem' }}>
                    @{displayUser.username.toLowerCase()}
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  style={{
                  padding: '0.625rem 1.25rem',
                  background: 'transparent',
                  border: theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)'),
                  borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                >
                  <Edit2 size={16} />
                  {language === 'ru' ? 'Редактировать' : 'Edit Profile'}
                </button>
              </div>

              {/* Level Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.875rem',
                borderRadius: theme === 'minimal-mod' ? '0' : '20px',
                background: `${currentLevel.color}20`,
                border: `1px solid ${currentLevel.color}`,
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>🏆</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: currentLevel.color }}>
                  {currentLevel.name}
                </span>
                <span style={{ opacity: 0.7, fontSize: '0.875rem' }}>
                  LVL {displayUser.level}
                </span>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ fontWeight: '700' }}>{displayUser.xp}</span>
                  <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>XP</span>
                </div>
                <div>
                  <span style={{ fontWeight: '700' }}>{unlockedAchievements.length}</span>
                  <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>
                    {language === 'ru' ? 'Достижения' : 'Achievements'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1rem' }}>🔥</span>
                  <span style={{ fontWeight: '700' }}>{displayUser.loginStreak}</span>
                  <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>
                    {language === 'ru' ? 'дней' : 'days'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profileData.bio && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: theme === 'minimal-mod' ? '0' : '8px',
              borderLeft: `3px solid ${currentLevel.color}`
            }}>
              <div style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
                {profileData.bio}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.875rem',
            opacity: 0.7
          }}>
            {profileData.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} />
                {profileData.location}
              </div>
            )}
            {profileData.website && (
              <a 
                href={profileData.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#8b5cf6',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <LinkIcon size={16} />
                {profileData.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} />
              {language === 'ru' ? 'Присоединился' : 'Joined'} {new Date(displayUser.joinedDate || '2024-01-01').toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Referral Code */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: theme === 'minimal-mod' ? '0' : '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                {language === 'ru' ? 'Реферальный код' : 'Referral Code'}
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                fontFamily: 'monospace',
                color: '#8b5cf6'
              }}>
                {displayUser.referralCode}
              </div>
            </div>
            <button
              onClick={handleCopyReferral}
              style={{
                padding: '0.625rem 1rem',
                background: copiedReferral ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                border: copiedReferral ? '1px solid #4CAF50' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)'),
                borderRadius: theme === 'minimal-mod' ? '0' : '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: copiedReferral ? '#4CAF50' : (theme === 'dark' ? '#fff' : '#1a1a1a'),
                fontSize: '0.8125rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              {copiedReferral ? <Check size={16} /> : <Copy size={16} />}
              {copiedReferral ? (language === 'ru' ? 'Скопировано!' : 'Copied!') : (language === 'ru' ? 'Копировать' : 'Copy')}
            </button>
          </div>
        </div>

        {/* XP Progress */}
        <div
          className={theme === 'minimal-mod' ? '' : 'glass'}
          style={{
            borderRadius: theme === 'minimal-mod' ? '0' : '12px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{language === 'ru' ? 'Прогресс до следующего уровня' : 'Progress to Next Level'}</span>
            <span style={{ color: currentLevel.color }}>
              {((displayUser.xp / displayUser.nextLevelXP) * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <div style={{
              height: '12px',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              borderRadius: theme === 'minimal-mod' ? '0' : '6px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                height: '100%',
                width: `${((displayUser.xp / displayUser.nextLevelXP) * 100).toFixed(0)}%`,
                background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}dd)`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ opacity: 0.5, fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{displayUser.nextLevelXP - displayUser.xp} XP {language === 'ru' ? 'до следующего уровня' : 'to next level'}</span>
              <span>Level {displayUser.level + 1}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={theme === 'minimal-mod' ? '' : 'glass'}
          style={{
            borderRadius: theme === 'minimal-mod' ? '0' : '12px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
            padding: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.5rem'
          }}
        >
          {[
            { id: 'stats', label: language === 'ru' ? 'Статистика' : 'Stats', icon: TrendingUp },
            { id: 'achievements', label: language === 'ru' ? 'Достижения' : 'Achievements', icon: Trophy },
            { id: 'quests', label: language === 'ru' ? 'Квесты' : 'Quests', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: activeTab === tab.id
                  ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)')
                  : 'transparent',
                border: 'none',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'background 0.2s ease',
                opacity: activeTab === tab.id ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className={theme === 'minimal-mod' ? '' : 'glass'}
          style={{
            borderRadius: theme === 'minimal-mod' ? '0' : '12px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
            padding: '1.5rem'
          }}
        >
          {activeTab === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-subtle" style={{ padding: '1.25rem', borderRadius: theme === 'minimal-mod' ? '0' : '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{unlockedAchievements.length}/{achievements.length}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{language === 'ru' ? 'Достижения' : 'Achievements'}</div>
              </div>
              <div className="glass-subtle" style={{ padding: '1.25rem', borderRadius: theme === 'minimal-mod' ? '0' : '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{completedQuests.length}/{dailyQuests.length}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{language === 'ru' ? 'Квесты сегодня' : 'Quests Today'}</div>
              </div>
              <div className="glass-subtle" style={{ padding: '1.25rem', borderRadius: theme === 'minimal-mod' ? '0' : '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{displayUser.bonusBalance}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{language === 'ru' ? 'Бонусные монеты' : 'Bonus Coins'}</div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="glass-subtle"
                  style={{
                    padding: '1rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                    opacity: achievement.unlocked ? 1 : 0.4,
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{achievement.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {achievement.name}
                      {achievement.unlocked && <Check size={16} color="#4CAF50" />}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'quests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dailyQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="glass-subtle"
                  style={{
                    padding: '1rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{quest.icon}</span>
                      {quest.name}
                      {quest.completed && <Check size={16} color="#4CAF50" />}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>{quest.description}</div>
                    {/* Progress bar */}
                    <div style={{
                      height: '6px',
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(quest.progress / quest.requirement) * 100}%`,
                        background: quest.completed ? '#4CAF50' : '#8b5cf6',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.25rem' }}>
                      {quest.progress}/{quest.requirement}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    background: 'rgba(255, 215, 0, 0.15)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#FFD700',
                    whiteSpace: 'nowrap'
                  }}>
                    +{quest.reward} XP
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentUser={profileData}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default UserProfilePage;
