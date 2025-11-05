import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ChatWindow from './ChatWindow';
import '../styles/chatWidget.css';
import '../styles/glassmorphism.css';

const FloatingChatWidget = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const audioRef = useRef(null);
  const chatButtonRef = useRef(null);

  // Retro flicker animation on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1200); // Match retro-flicker-in animation duration
    return () => clearTimeout(timer);
  }, []);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen) {
        const chatWindow = event.target.closest('[data-chat-window="true"]');
        const chatButton = chatButtonRef.current && chatButtonRef.current.contains(event.target);
        
        if (!chatWindow && !chatButton) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

      {/* Floating Button - Glassmorphism Style matching Header */}
      <button
        ref={chatButtonRef}
        onClick={toggleChat}
        className={`retro-flicker-button glass ${!hasAnimated ? 'retro-flicker-in' : ''}`}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '0.625rem 1rem',
          borderRadius: '12px',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.3s ease',
          minWidth: isOpen ? '48px' : '160px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.background = theme === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.85)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = theme === 'dark'
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(255, 255, 255, 0.7)';
        }}
      >
        {isOpen ? (
          <X size={18} className="icon-color" strokeWidth={2} />
        ) : (
          <>
            {/* Message Icon */}
            <MessageCircle size={18} className="icon-color" strokeWidth={2} style={{ flexShrink: 0 }} />
            
            {/* Separator */}
            <div style={{
              width: '1px',
              height: '20px',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }} />
            
            {/* Text */}
            <span className="retro-button-text" style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap'
            }}>
              SUPPORT
            </span>
            
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
