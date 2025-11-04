import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { X } from 'lucide-react';
import '../styles/glassmorphism.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await login(formData.email, formData.password, rememberMe);
      } else {
        result = await register(formData.email, formData.username, formData.password);
      }

      if (result.success) {
        onClose();
        setFormData({ email: '', username: '', password: '' });
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} OAuth coming soon! Use email/password for now.`);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({ email: '', username: '', password: '' });
  };

  // Social button style - matching Header acrylic buttons
  const socialButtonStyle = {
    padding: '0.875rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme === 'dark' ? '#fff' : '#1a1a1a'
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    background: 'transparent',
    color: theme === 'dark' ? '#fff' : '#1a1a1a',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'all 0.3s ease'
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease-out'
        }}
      />

      {/* Modal - Same style as Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '480px',
          padding: '2.5rem',
          borderRadius: '16px',
          zIndex: 9999,
          color: theme === 'dark' ? '#fff' : '#1a1a1a',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button - Header style */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: '6px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: theme === 'dark' ? '#fff' : '#1a1a1a'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = theme === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.background = theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1px solid transparent';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          letterSpacing: '0.5px'
        }}>
          {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
        </h2>
        <p style={{
          fontSize: '0.9375rem',
          opacity: 0.6,
          marginBottom: '2rem'
        }}>
          {mode === 'login' 
            ? 'Login to access your account' 
            : 'Register to start shopping'}
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            background: 'rgba(255, 59, 48, 0.1)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            color: '#ff3b30',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* Social Login Buttons - Header style */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            {/* Google */}
            <button
              onClick={() => handleSocialLogin('Google')}
              title="Sign in with Google"
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" opacity="0.6">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            {/* Apple */}
            <button
              onClick={() => handleSocialLogin('Apple')}
              title="Sign in with Apple"
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>

            {/* Yandex */}
            <button
              onClick={() => handleSocialLogin('Yandex')}
              title="Sign in with Yandex"
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" opacity="0.6">
                <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.096 17.946h-2.52v-7.561H11.18c-1.498 0-2.405-.843-2.405-2.24 0-1.469.907-2.336 2.405-2.336h5.396v2.117h-4.86c-.47 0-.674.228-.674.623 0 .408.204.623.673.623h2.381v9.774z"/>
              </svg>
            </button>

            {/* VK */}
            <button
              onClick={() => handleSocialLogin('VK')}
              title="Sign in with VK"
              style={socialButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" opacity="0.6">
                <path fill="currentColor" d="M12.785 16.241s.288-.032.436-.195c.136-.149.132-.43.132-.43s-.02-1.316.574-1.508c.586-.19 1.341 1.273 2.143 1.834.607.425 1.068.332 1.068.332l2.149-.03s1.124-.072.591-.98c-.044-.074-.312-.675-1.604-1.91-1.352-1.292-1.171-1.082.458-3.315.99-1.357 1.388-2.185 1.264-2.54-.118-.338-.847-.249-.847-.249l-2.42.015s-.18-.025-.313.057c-.13.08-.214.267-.214.267s-.383 1.05-.892 1.94c-1.073 1.877-1.503 1.977-1.68 1.86-.41-.273-.308-1.095-.308-1.678 0-1.826.269-2.586-.522-2.783-.263-.065-.457-.108-1.13-.115-.863-.009-1.593.003-2.006.211-.275.138-.487.446-.358.464.16.022.522.101.714.37.248.348.239 1.13.239 1.13s.143 2.15-.333 2.417c-.327.183-.775-.19-1.738-1.898-.493-.874-.866-1.84-.866-1.84s-.072-.181-.2-.278c-.155-.118-.372-.155-.372-.155l-2.299.015s-.345.01-.472.164c-.113.137-.009.42-.009.42s1.8 4.326 3.838 6.506c1.869 2.001 3.99 1.87 3.99 1.87h.964z"/>
              </svg>
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)'
            }} />
            <span style={{ fontSize: '0.875rem', opacity: 0.5 }}>or</span>
            <div style={{
              flex: 1,
              height: '1px',
              background: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)'
            }} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              opacity: 0.8
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              style={inputBaseStyle}
              onFocus={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid transparent'
                  : '1px solid rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'transparent'
                  : 'rgba(255, 255, 255, 0.5)';
              }}
            />
          </div>

          {/* Username (Register only) */}
          {mode === 'register' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                opacity: 0.8
              }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="cooluser123"
                style={inputBaseStyle}
                onFocus={(e) => {
                  e.currentTarget.style.border = theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.background = theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.03)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = theme === 'dark'
                    ? '1px solid transparent'
                    : '1px solid rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.background = theme === 'dark'
                    ? 'transparent'
                    : 'rgba(255, 255, 255, 0.5)';
                }}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              opacity: 0.8
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="••••••••"
              style={inputBaseStyle}
              onFocus={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = theme === 'dark'
                  ? '1px solid transparent'
                  : '1px solid rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.background = theme === 'dark'
                  ? 'transparent'
                  : 'rgba(255, 255, 255, 0.5)';
              }}
            />
          </div>

          {/* Remember Me (Login only) - Header style checkbox */}
          {mode === 'login' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Remember me
              </label>
            </div>
          )}

          {/* Submit Button - ONLY PURPLE ELEMENT */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              background: loading
                ? 'rgba(139, 92, 246, 0.1)'
                : 'rgba(139, 92, 246, 0.15)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '700',
              letterSpacing: '0.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading
                ? 'none'
                : '0 4px 12px rgba(139, 92, 246, 0.3)',
              opacity: loading ? 0.6 : 1,
              marginTop: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }
            }}
          >
            {loading ? 'PROCESSING...' : mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Toggle Mode - Header style link */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          opacity: 0.7
        }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: theme === 'dark' ? '#fff' : '#1a1a1a',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: 0.8
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              transform: translate(-50%, -40%);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
};

export default AuthModal;
