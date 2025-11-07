import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const BadgeTooltip = ({ children, content, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const { theme } = useTheme();
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (position === 'right') {
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.right + 12
        });
      }
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        style={{ position: 'relative', display: 'inline-flex' }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: 'translateY(-50%)',
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
            fontFamily: theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit'
          }}
        >
          {content}
          {/* Arrow pointing left */}
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
        </div>
      )}
    </>
  );
};

export default BadgeTooltip;