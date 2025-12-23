import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function LoadingScreen() {
  const { theme } = useTheme();
  
  return (
    <div 
      className="loading-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'light' ? '#ffffff' : '#0a0a0a',
        zIndex: 9999
      }}
    >
      <div className="glass-strong" style={{
        padding: '3rem',
        borderRadius: theme === 'minimal-mod' ? '0' : '12px',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        {/* Spinner */}
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(168, 85, 247, 0.2)',
          borderTop: '4px solid #a855f7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.5rem'
        }} />
        
        {/* Loading Text */}
        <p style={{
          fontSize: '1rem',
          opacity: 0.8,
          fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          Loading...
        </p>

        {/* Loading bar */}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'rgba(168, 85, 247, 0.2)',
          borderRadius: '2px',
          marginTop: '1rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '40%',
            height: '100%',
            background: '#a855f7',
            animation: 'loadingBar 1.5s ease-in-out infinite'
          }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(250%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
