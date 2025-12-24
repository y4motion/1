import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Minimal loading screen - no spinners, just clean fade
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
        background: '#000000',
        zIndex: 9997, // Lower than AI overlay (9998)
      }}
    >
      {/* Minimal text indicator */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
        }}
      >
        <p
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.15em',
            animation: 'fadeInOut 1.5s ease-in-out infinite',
          }}
        >
          INITIALIZING...
        </p>
      </div>

      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
