import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const EditProfileModal = ({ isOpen, onClose, currentUser, onSave }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    website: currentUser?.website || '',
    avatar: currentUser?.avatar || '👤',
  });

  const avatarOptions = [
    '👤',
    '🎮',
    '🎯',
    '🚀',
    '⚡',
    '🔥',
    '💎',
    '🎨',
    '🦾',
    '🤖',
    '👾',
    '🎪',
    '🌟',
    '💫',
    '🌈',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className={theme === 'minimal-mod' ? '' : 'glass-strong'}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '550px',
          borderRadius: theme === 'minimal-mod' ? '0' : '16px',
          background:
            theme === 'minimal-mod'
              ? 'rgba(0, 0, 0, 0.98)'
              : theme === 'dark'
                ? 'rgba(10, 10, 15, 0.98)'
                : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: theme === 'minimal-mod' ? 'none' : 'blur(30px)',
          border:
            theme === 'minimal-mod'
              ? '1px solid rgba(241, 241, 241, 0.12)'
              : theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: theme === 'minimal-mod' ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.4)',
          fontFamily:
            theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
          animation: 'scaleIn 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom:
              theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
            {language === 'ru' ? 'Редактировать профиль' : 'Edit Profile'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: theme === 'minimal-mod' ? '0' : '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
              color: theme === 'dark' ? '#fff' : '#1a1a1a',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Avatar Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                opacity: 0.8,
              }}
            >
              {language === 'ru' ? 'Аватар' : 'Avatar'}
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '0.5rem',
              }}
            >
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: emoji })}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background:
                      formData.avatar === emoji
                        ? 'rgba(139, 92, 246, 0.2)'
                        : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.03)',
                    border:
                      formData.avatar === emoji
                        ? '2px solid #8b5cf6'
                        : theme === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (formData.avatar !== emoji) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                opacity: 0.8,
              }}
            >
              {language === 'ru' ? 'Имя пользователя' : 'Username'}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border:
                  theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                fontSize: '0.9375rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
              }
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                opacity: 0.8,
              }}
            >
              {language === 'ru' ? 'О себе' : 'Bio'}
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              maxLength={160}
              placeholder={language === 'ru' ? 'Расскажите о себе...' : 'Tell us about yourself...'}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border:
                  theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                fontSize: '0.9375rem',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
              }
            />
            <div
              style={{
                fontSize: '0.75rem',
                opacity: 0.5,
                textAlign: 'right',
                marginTop: '0.25rem',
              }}
            >
              {formData.bio.length}/160
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                opacity: 0.8,
              }}
            >
              {language === 'ru' ? 'Местоположение' : 'Location'}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={language === 'ru' ? 'Москва, Россия' : 'New York, USA'}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border:
                  theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                fontSize: '0.9375rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
              }
            />
          </div>

          {/* Website */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                opacity: 0.8,
              }}
            >
              {language === 'ru' ? 'Веб-сайт' : 'Website'}
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border:
                  theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                fontSize: '0.9375rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
              }
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: 'transparent',
                border:
                  theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: '#fff',
                transition: 'all 0.2s ease',
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
              {language === 'ru' ? 'Сохранить' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
