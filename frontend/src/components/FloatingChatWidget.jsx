import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ChatWindow from './ChatWindow';
import '../styles/chatWidget.css';

const FloatingChatWidget = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const audioRef = useRef(null);

  // Bounce animation on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 500);
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

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`floating-chat-button ${!hasAnimated ? 'bounce-in' : ''}`}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '1px solid transparent',
          background: theme === 'dark' 
            ? 'rgba(139, 92, 246, 0.2)' 
            : 'rgba(139, 92, 246, 0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          color: '#fff'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
          e.currentTarget.style.background = theme === 'dark'
            ? 'rgba(139, 92, 246, 0.3)'
            : 'rgba(139, 92, 246, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
          e.currentTarget.style.background = theme === 'dark'
            ? 'rgba(139, 92, 246, 0.2)'
            : 'rgba(139, 92, 246, 0.15)';
        }}
      >
        {isOpen ? (
          <X size={28} strokeWidth={2.5} />
        ) : (
          <>
            <MessageCircle size={28} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
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
