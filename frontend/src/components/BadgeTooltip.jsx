import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const BadgeTooltip = ({ children, content, position = 'right' }) => {
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
            position: 'fixed',
            left: position === 'right' ? 'auto' : '50%',
            transform: position === 'right' ? 'translateY(-50%)' : 'translateX(-50%)',
            width: '300px',
            padding: '0.875rem 1rem',
            background: theme === 'minimal-mod'
              ? 'rgba(0, 0, 0, 0.98)'
              : (theme === 'dark' ? 'rgba(10, 10, 15, 0.98)' : 'rgba(255, 255, 255, 0.98)'),
            backdropFilter: theme === 'minimal-mod' ? 'none' : 'blur(20px)',
            border: theme === 'minimal-mod'
              ? '1px solid rgba(241, 241, 241, 0.2)'
              : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.15)'),
            borderRadius: theme === 'minimal-mod' ? '0' : '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            zIndex: 10001,
            fontSize: '0.8125rem',
            lineHeight: '1.5',
            color: theme === 'dark' ? '#fff' : '#1a1a1a',
            animation: 'scaleIn 0.15s ease-out',
            pointerEvents: 'none',
            fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
            marginLeft: position === 'right' ? '12px' : undefined
          }}
        >
          {content}
          {/* Arrow pointing left */}
          {position === 'right' && (
            <div
              style={{
                position: 'absolute',
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: `6px solid ${theme === 'minimal-mod' ? 'rgba(241, 241, 241, 0.2)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)')}`
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BadgeTooltip;

