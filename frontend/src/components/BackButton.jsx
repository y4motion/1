import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function BackButton({ fallbackUrl = '/', label = 'Back' }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // Fallback to specific URL
      navigate(fallbackUrl);
    }
  };
  
  return (
    <button 
      onClick={handleBack}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: theme === 'minimal-mod' ? '0' : '8px',
        color: 'white',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.target.style.transform = 'translateX(-2px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'transparent';
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.transform = 'translateX(0)';
      }}
      aria-label={label}
    >
      <ArrowLeft size={20} />
      <span>{label}</span>
    </button>
  );
}
