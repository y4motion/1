import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ChatWindow from './ChatWindow';
import '../styles/chatWidget.css';

const FloatingChatWidget = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const audioRef = useRef(null);

  // Retro flicker animation on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1200); // Match retro-flicker-in animation duration
    return () => clearTimeout(timer);
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  // Handle new message (for notification sound)
  const handleNewMessage = (message) => {
    if (message.sender === 'bot' && !isOpen) {
      setUnreadCount(prev => prev + 1);
      playNotificationSound();
    }
  };

  // Open/close chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Clear unread when opening
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          onClose={() => setIsOpen(false)}
          onNewMessage={handleNewMessage}
        />
      )}

      {/* Floating Button - Retro TV Style */}
      <button
        onClick={toggleChat}
        className={`retro-flicker-button ${!hasAnimated ? 'retro-flicker-in' : ''}`}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          border: theme === 'dark' ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(0, 0, 0, 0.3)',
          background: theme === 'dark' ? 'rgba(20, 20, 30, 0.9)' : 'rgba(240, 240, 245, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '12px',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: theme === 'dark' 
            ? '0 4px 16px rgba(0, 0, 0, 0.5)' 
            : '0 4px 16px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
          minWidth: isOpen ? '48px' : '180px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? '0 6px 20px rgba(0, 0, 0, 0.7)'
            : '0 6px 20px rgba(0, 0, 0, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? '0 4px 16px rgba(0, 0, 0, 0.5)'
            : '0 4px 16px rgba(0, 0, 0, 0.15)';
        }}
      >
        {isOpen ? (
          <X size={24} strokeWidth={2} color={theme === 'dark' ? '#fff' : '#000'} />
        ) : (
          <>
            {/* Book Icon */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path 
                d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20M4 19.5C4 20.8807 5.11929 22 6.5 22H20V2H6.5C5.11929 2 4 3.11929 4 4.5V19.5Z" 
                stroke={theme === 'dark' ? '#fff' : '#000'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M12 6L12 13M12 13L9 10M12 13L15 10" 
                stroke={theme === 'dark' ? '#fff' : '#000'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Separator */}
            <div style={{
              width: '1px',
              height: '28px',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
            }} />
            
            {/* Text */}
            <span className="retro-button-text" style={{
              fontSize: '14px',
              fontWeight: '600',
              color: theme === 'dark' ? '#fff' : '#000',
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px'
            }}>
              Beta Sign-Up
            </span>
            
            {/* Arrow */}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
              style={{ 
                marginLeft: 'auto',
                opacity: 0.6,
                flexShrink: 0
              }}
            >
              <path 
                d="M6 3L11 8L6 13" 
                stroke={theme === 'dark' ? '#fff' : '#000'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                  animation: 'pulse-badge 2s ease-in-out infinite'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Hidden audio element for notification sound */}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIGmi77eefTRAMUKbj8LZkHAU3kdfy0HosBSR3yPDdj0AKEl+06uymVRQJRp/g8r5tIQUrgs7y2Ys3CAAAAAAAAAAAAAAAAAAA"
        preload="auto"
      />
    </>
  );
};

export default FloatingChatWidget;
