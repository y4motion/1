import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const BadgeTooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            padding: '0.875rem 1rem',
            background:
              theme === 'minimal-mod'
                ? 'rgba(0, 0, 0, 0.98)'
                : theme === 'dark'
                  ? 'rgba(5, 5, 10, 0.98)'
                  : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: theme === 'minimal-mod' ? 'none' : 'blur(20px)',
            border:
              theme === 'minimal-mod'
                ? '1px solid rgba(241, 241, 241, 0.25)'
                : theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: theme === 'minimal-mod' ? '0' : '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            zIndex: 10001,
            fontSize: '0.8125rem',
            lineHeight: '1.5',
            color: theme === 'dark' ? '#fff' : '#1a1a1a',
            animation: 'scaleIn 0.15s ease-out',
            pointerEvents: 'none',
            fontFamily:
              theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
          }}
        >
          {content}
          {/* Arrow pointing up */}
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `6px solid ${theme === 'minimal-mod' ? 'rgba(241, 241, 241, 0.25)' : theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BadgeTooltip;
