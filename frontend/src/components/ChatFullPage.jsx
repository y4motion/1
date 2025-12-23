import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Settings,
  Bot,
  User as UserIcon,
  Paperclip,
  Image as ImageIcon,
  Smile,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/glassmorphism.css';

const ChatFullPage = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const isNewChat = searchParams.get('new') === 'true';

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text:
        language === 'ru'
          ? 'Здравствуйте! Я AI-помощник Minimal Market. Чем могу помочь?'
          : "Hello! I'm Minimal Market AI assistant. How can I help you?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      sender: 'user',
      text:
        language === 'ru'
          ? 'Расскажите о ваших топовых видеокартах'
          : 'Tell me about your top GPUs',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 3,
      sender: 'bot',
      text:
        language === 'ru'
          ? 'Конечно! У нас есть отличные варианты:\n\n1. NVIDIA RTX 4090 - флагман для максимальной производительности\n2. AMD RX 7900 XTX - отличное соотношение цена/качество\n3. NVIDIA RTX 4070 Ti - идеально для 1440p\n\nВас интересует что-то конкретное?'
          : 'Sure! We have great options:\n\n1. NVIDIA RTX 4090 - flagship for maximum performance\n2. AMD RX 7900 XTX - great price/performance ratio\n3. NVIDIA RTX 4070 Ti - perfect for 1440p\n\nAre you looking for something specific?',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        text:
          language === 'ru'
            ? 'Спасибо за ваш вопрос! Я обрабатываю запрос...'
            : 'Thank you for your question! Processing your request...',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '5rem',
        background:
          theme === 'minimal-mod'
            ? 'rgba(0, 0, 0, 1)'
            : theme === 'dark'
              ? 'linear-gradient(135deg, #0a0a0b 0%, #151518 100%)'
              : 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
        fontFamily:
          theme === 'minimal-mod' ? '"SF Mono", Menlo, Consolas, Monaco, monospace' : 'inherit',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
          height: 'calc(100vh - 5rem)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className={theme === 'minimal-mod' ? '' : 'glass'}
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
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
            >
              <ArrowLeft size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}
              >
                🤖
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  }}
                >
                  Support AI
                </h2>
                <div
                  style={{
                    fontSize: '0.875rem',
                    opacity: 0.6,
                    marginTop: '0.125rem',
                  }}
                >
                  {language === 'ru' ? 'Всегда онлайн' : 'Always online'}
                </div>
              </div>
            </div>
          </div>

          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: theme === 'minimal-mod' ? '0' : '8px',
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
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div
          className={
            theme === 'minimal-mod' ? 'catalog-content-scroll' : 'glass catalog-content-scroll'
          }
          style={{
            flex: 1,
            padding: '1.5rem',
            borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
            overflowY: 'auto',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background:
                    message.sender === 'bot'
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                      : theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '1.25rem',
                }}
              >
                {message.sender === 'bot' ? <Bot size={20} color="#fff" /> : <UserIcon size={20} />}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    padding: '0.875rem 1.125rem',
                    borderRadius: theme === 'minimal-mod' ? '0' : '16px',
                    background:
                      message.sender === 'bot'
                        ? theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    color:
                      message.sender === 'bot' ? (theme === 'dark' ? '#fff' : '#1a1a1a') : '#fff',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    fontSize: '0.9375rem',
                    lineHeight: '1.5',
                  }}
                >
                  {message.text}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    opacity: 0.5,
                    paddingLeft: message.sender === 'user' ? 0 : '0.5rem',
                    paddingRight: message.sender === 'user' ? '0.5rem' : 0,
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString(
                    language === 'ru' ? 'ru-RU' : 'en-US',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              <div
                style={{
                  padding: '0.875rem 1.125rem',
                  borderRadius: theme === 'minimal-mod' ? '0' : '16px',
                  background:
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  gap: '0.375rem',
                }}
              >
                <span className="typing-dot" style={{ animationDelay: '0s' }}>
                  ●
                </span>
                <span className="typing-dot" style={{ animationDelay: '0.2s' }}>
                  ●
                </span>
                <span className="typing-dot" style={{ animationDelay: '0.4s' }}>
                  ●
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className={theme === 'minimal-mod' ? '' : 'glass'}
          style={{
            padding: '1.25rem',
            borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            background: theme === 'minimal-mod' ? 'rgba(0, 0, 0, 0.95)' : undefined,
            border: theme === 'minimal-mod' ? '1px solid rgba(241, 241, 241, 0.12)' : undefined,
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Attachments */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.625rem',
                  borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s ease',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color =
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
                }}
              >
                <Paperclip size={20} />
              </button>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.625rem',
                  borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s ease',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color =
                    theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
                }}
              >
                <ImageIcon size={20} />
              </button>
            </div>

            {/* Text Input */}
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'ru' ? 'Напишите сообщение...' : 'Type a message...'}
              rows={1}
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border:
                  theme === 'minimal-mod'
                    ? '1px solid rgba(241, 241, 241, 0.2)'
                    : theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                fontSize: '0.9375rem',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
                minHeight: '44px',
                maxHeight: '120px',
                overflowY: 'auto',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              style={{
                padding: '0.875rem 1.5rem',
                background: inputMessage.trim()
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                  : 'rgba(139, 92, 246, 0.3)',
                border: 'none',
                borderRadius: theme === 'minimal-mod' ? '0' : '12px',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9375rem',
                gap: '0.5rem',
                opacity: inputMessage.trim() ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (inputMessage.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Send size={18} />
              {language === 'ru' ? 'Отправить' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Add typing animation CSS */}
      <style>{`
        @keyframes typing-pulse {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
        .typing-dot {
          animation: typing-pulse 1.4s infinite;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default ChatFullPage;
