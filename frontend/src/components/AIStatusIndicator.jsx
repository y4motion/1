import React from 'react';

export default function AIStatusIndicator() {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '200px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        background: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        borderRadius: '20px',
        transition: 'all 0.3s',
        cursor: 'pointer',
        zIndex: 100
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
          animation: 'statusPulse 2s ease-in-out infinite'
        }}
      />
      {isHovered && (
        <span
          style={{
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}
        >
          Core AI online · Всегда рядом
        </span>
      )}

      <style jsx>{`
        @keyframes statusPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
