import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ChevronUp, Edit, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/glassmorphism.css';

const FloatingChatWidget = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2); // Mock unread count
  const widgetRef = useRef(null);

  // Mock conversations
  const [conversations] = useState([
    {
      id: 1,
      name: 'Support AI',
      lastMessage: language === 'ru' ? 'Здравствуйте! Чем могу помочь?' : 'Hello! How can I help?',
      time: '2m',
      unread: 1,
      avatar: '🤖',
    },
    {
      id: 2,
      name: language === 'ru' ? 'Продавец GeekStore' : 'GeekStore Seller',
      lastMessage: language === 'ru' ? 'Ваш заказ готов к отправке' : 'Your order is ready to ship',
      time: '1h',
      unread: 1,
      avatar: '🏪',
    },
    {
      id: 3,
      name: language === 'ru' ? 'Команда поддержки' : 'Support Team',
      lastMessage: language === 'ru' ? 'Спасибо за обращение!' : 'Thanks for reaching out!',
      time: '3h',
      unread: 0,
      avatar: '💬',
    },
  ]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const handleOpenFullChat = () => {
    navigate('/chat');
  };

  const handleNewMessage = () => {
    navigate('/chat?new=true');
  };

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 999,
        fontFamily:
          theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
      }}
    >
      {/* Expanded Mini Chat */}
      {isExpanded && (
        <div
          className={theme === 'minimal-mod' ? '' : 'glass-strong'}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: 0,
            width: '360px',
            height: '480px',
            borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            background:
              theme === 'minimal-mod'
                ? 'rgba(0, 0, 0, 0.98)'
                : theme === 'dark'
                  ? 'rgba(10, 10, 15, 0.98)'
                  : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: theme === 'minimal-mod' ? 'none' : 'blur(30px)',
            border:
              theme === 'minimal-mod'
                ? '1px solid rgba(241, 241, 241, 0.12)'
                : theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: theme === 'minimal-mod' ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'smoothSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom:
                theme === 'minimal-mod'
                  ? '1px solid rgba(241, 241, 241, 0.12)'
                  : theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: theme === 'dark' ? '#fff' : '#1a1a1a',
                }}
              >
                {language === 'ru' ? 'Сообщения' : 'Messages'}
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#8b5cf6',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.125rem 0.5rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                    minWidth: '20px',
                    textAlign: 'center',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={handleNewMessage}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.375rem',
                borderRadius: theme === 'minimal-mod' ? '0' : '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title={language === 'ru' ? 'Новое сообщение' : 'New message'}
            >
              <Edit size={18} />
            </button>
          </div>

          {/* Conversations List */}
          <div
            className="catalog-content-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.5rem',
            }}
          >
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  transition: 'background 0.2s ease',
                  textAlign: 'left',
                  color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  marginBottom: '0.25rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}
                >
                  {conv.avatar}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: conv.unread > 0 ? '700' : '500',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conv.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        opacity: 0.6,
                        marginLeft: '0.5rem',
                      }}
                    >
                      {conv.time}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      opacity: conv.unread > 0 ? 1 : 0.7,
                      fontWeight: conv.unread > 0 ? '600' : '400',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {conv.lastMessage}
                  </div>
                </div>

                {/* Unread badge */}
                {conv.unread > 0 && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                      flexShrink: 0,
                      marginTop: '0.25rem',
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Footer - Open Full Chat Button */}
          <div
            style={{
              padding: '1rem',
              borderTop:
                theme === 'minimal-mod'
                  ? '1px solid rgba(241, 241, 241, 0.12)'
                  : theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <button
              onClick={handleOpenFullChat}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border:
                  theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#8b5cf6',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
              }}
            >
              <Maximize2 size={16} />
              {language === 'ru' ? 'Чат (Бета)' : 'Chat (Beta)'}
            </button>
          </div>
        </div>
      )}

      {/* Collapsed Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={theme === 'minimal-mod' ? '' : 'glass-strong'}
        style={{
          width: isExpanded ? '360px' : '200px',
          padding: '1rem 1.25rem',
          background:
            theme === 'minimal-mod'
              ? 'rgba(0, 0, 0, 0.95)'
              : theme === 'dark'
                ? 'rgba(10, 10, 15, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: theme === 'minimal-mod' ? 'none' : 'blur(20px)',
          border:
            theme === 'minimal-mod'
              ? '1px solid rgba(241, 241, 241, 0.12)'
              : theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: theme === 'minimal-mod' ? '0' : '30px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: theme === 'minimal-mod' ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
          color: theme === 'dark' ? '#fff' : '#1a1a1a',
          fontWeight: '600',
          fontSize: '0.9375rem',
        }}
        onMouseEnter={(e) => {
          if (!isExpanded && theme !== 'minimal-mod') {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow =
            theme === 'minimal-mod' ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.2)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageCircle size={20} />
          <span>{language === 'ru' ? 'Сообщения' : 'Messages'}</span>
          {unreadCount > 0 && (
            <span
              style={{
                background: '#8b5cf6',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.125rem 0.5rem',
                borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <ChevronUp
          size={20}
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>
    </div>
  );
};

export default FloatingChatWidget;
