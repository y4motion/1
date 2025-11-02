import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/glassmorphism.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
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
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.email, formData.username, formData.password);
      }

      if (result.success) {
        onClose();
        setFormData({ email: '', username: '', password: '' });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      
      {/* Modal */}
      <div 
        className="glass-strong relative w-full max-w-md rounded-2xl p-8 shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-6">
          {mode === 'login' ? t('login') : t('register')}
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg glass-strong border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-white/80 text-sm mb-2">{t('username')}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg glass-strong border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="cooluser123"
              />
            </div>
          )}

          <div>
            <label className="block text-white/80 text-sm mb-2">{t('password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg glass-strong border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg glass-strong border border-white/20 text-white font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('loading') : (mode === 'login' ? t('login') : t('register'))}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            {mode === 'login' ? t('needAccount') : t('haveAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
