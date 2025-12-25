import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AIFloatingButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered
          ? '0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.1)'
          : '0 0 20px rgba(255, 255, 255, 0.2)',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        zIndex: 1001,
        animation: 'pulse 2s ease-in-out infinite'
      }}
      aria-label="Open Core AI"
    >
      <MessageCircle size={28} strokeWidth={2} />
      
      {isHovered && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'white',
            pointerEvents: 'none'
          }}
        >
          Спроси меня о чём угодно
        </span>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </button>
  );
}
