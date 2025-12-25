import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Mic,
  MicOff,
  Send,
  Paperclip,
  X,
  Bot,
  Users,
  MessageSquare,
  Headphones,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import './GlassyChatBar.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const WS_URL = API_URL.replace('http', 'ws');

// Tab configuration
const TABS = [
  { id: 'ai', icon: Bot, label: { en: 'AI', ru: 'AI' } },
  { id: 'messages', icon: MessageSquare, label: { en: 'Messages', ru: 'Сообщения' } },
  { id: 'community', icon: Users, label: { en: 'Community', ru: 'Сообщество' } },
  { id: 'support', icon: Headphones, label: { en: 'Support', ru: 'Поддержка' } },
];

const GlassyChatBar = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({ ai: 0, messages: 0, community: 0, support: 0 });

  // Refs
  const wsRef = useRef(null);
  const wsInitialized = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Listen for external open events (from /chat redirect)
  useEffect(() => {
    const handleOpenChat = (event) => {
      setIsExpanded(true);
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
      }
    };
    
    window.addEventListener('openGlassyChat', handleOpenChat);
    return () => window.removeEventListener('openGlassyChat', handleOpenChat);
  }, []);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'ru' ? 'ru-RU' : 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language]);

  // Add message to specific tab (with deduplication)
  const addMessage = useCallback((tab, message) => {
    setMessages(prev => {
      const tabMessages = prev[tab] || [];
      // Prevent duplicate messages by checking id
      if (message.id && tabMessages.some(m => m.id === message.id)) {
        return prev;
      }
      return {
        ...prev,
        [tab]: [...tabMessages, message]
      };
    });
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (wsInitialized.current) return;
    wsInitialized.current = true;
    
    const storedSessionId = localStorage.getItem('glassy_chat_session');
    const newSessionId = storedSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!storedSessionId) {
      localStorage.setItem('glassy_chat_session', newSessionId);
    }
    setSessionId(newSessionId);

    // Connect WebSocket
    let systemMessageReceived = false;
    
    const connectWebSocket = () => {
      const ws = new WebSocket(`${WS_URL}/api/ws/support-chat/${newSessionId}`);
      
      ws.onopen = () => {
        console.log('GlassyChatBar WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'system') {
          // Prevent duplicate system messages on reconnect
          if (!systemMessageReceived) {
            systemMessageReceived = true;
            addMessage('ai', {
              id: Date.now(),
              sender: 'bot',
              text: data.message,
              timestamp: new Date(data.timestamp),
            });
          }
        } else if (data.type === 'user_message') {
          // Already added locally
        } else if (data.type === 'bot_message') {
          setIsTyping(false);
          addMessage('ai', {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          });
          
          // Update unread if not expanded + trigger new message animation
          setUnreadCounts(prev => ({ ...prev, ai: prev.ai + 1 }));
          setHasNewMessage(true);
          setTimeout(() => setHasNewMessage(false), 3000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current = ws;
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [addMessage]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Clear unread when tab is active
  useEffect(() => {
    if (isExpanded) {
      setUnreadCounts(prev => ({ ...prev, [activeTab]: 0 }));
    }
  }, [activeTab, isExpanded]);

  // Get context based on current page
  const getPageContext = useCallback(() => {
    const path = location.pathname;
    
    if (path.startsWith('/product/')) {
      const productId = path.split('/')[2];
      return { type: 'product', id: productId, label: language === 'ru' ? 'Вопросы о товаре' : 'Product Questions' };
    }
    if (path.startsWith('/marketplace')) {
      return { type: 'marketplace', label: language === 'ru' ? 'Обсуждение маркетплейса' : 'Marketplace Discussion' };
    }
    if (path.startsWith('/glassy-swap')) {
      return { type: 'swap', label: language === 'ru' ? 'Обмен и продажа' : 'Swap & Trade' };
    }
    if (path.startsWith('/pc-builder')) {
      return { type: 'pcbuilder', label: language === 'ru' ? 'Помощь со сборкой' : 'Build Help' };
    }
    
    return { type: 'general', label: language === 'ru' ? 'Общий чат' : 'General Chat' };
  }, [location.pathname, language]);

  // Send message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };
    
    // Add to current tab
    addMessage(activeTab, userMessage);
    
    // Send via WebSocket
    wsRef.current.send(JSON.stringify({
      message: inputMessage,
      user_id: user?.id || null,
      language: language,
      context: {
        tab: activeTab,
        page: getPageContext()
      }
    }));
    
    setInputMessage('');
    setIsTyping(true);
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!speechSupported) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = language === 'ru' ? 'ru-RU' : 'en-US';
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Total unread count
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // Current tab messages
  const currentMessages = messages[activeTab] || [];
  
  // Page context for community tab
  const pageContext = getPageContext();

  const isMinimalMod = theme === 'minimal-mod';
  const isDark = theme === 'dark' || isMinimalMod;

  return (
    <div
      className={`glassy-chat-bar ${isExpanded ? 'expanded' : 'collapsed'} ${isFullscreen ? 'fullscreen' : ''} ${isMinimalMod ? 'minimal-mod' : ''}`}
      style={{
        '--chat-bg': isDark ? 'rgba(10, 10, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        '--chat-border': isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        '--chat-text': isDark ? '#ffffff' : '#1a1a1a',
        '--chat-text-muted': isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        '--chat-accent': '#8b5cf6',
      }}
    >
      {/* Collapsed Bar */}
      <div 
        className="chat-collapsed-bar"
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="chat-bar-left">
          <div className="chat-icon-wrapper">
            <MessageCircle size={20} />
            {totalUnread > 0 && (
              <span className="unread-badge">{totalUnread > 9 ? '9+' : totalUnread}</span>
            )}
          </div>
        </div>
        
        <div className="chat-bar-center">
          <span className="online-dot" />
          <span className="status-text">
            Core AI {language === 'ru' ? 'онлайн' : 'online'}
          </span>
        </div>
        
        <div className="chat-bar-right">
          <button
            className={`voice-btn ${isRecording ? 'recording' : ''} ${!speechSupported ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleVoiceInput();
            }}
            title={!speechSupported ? (language === 'ru' ? 'Голосовой ввод недоступен' : 'Voice input not available') : ''}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="chat-expanded-panel">
          {/* Tabs */}
          <div className="chat-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`chat-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                <span>{tab.label[language] || tab.label.en}</span>
                {unreadCounts[tab.id] > 0 && (
                  <span className="tab-badge">{unreadCounts[tab.id]}</span>
                )}
              </button>
            ))}
            
            <div className="tab-actions">
              <button
                className="fullscreen-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Minimize' : 'Maximize'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                className="close-btn"
                onClick={() => setIsExpanded(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Context Header for Community */}
          {activeTab === 'community' && (
            <div className="context-header">
              <Sparkles size={14} />
              <span>{pageContext.label}</span>
            </div>
          )}

          {/* Messages Tab - Coming Soon */}
          {activeTab === 'messages' ? (
            <div className="coming-soon-container">
              <div className="coming-soon-card">
                <MessageSquare size={48} strokeWidth={1.5} />
                <h3>{language === 'ru' ? 'Личные сообщения' : 'Private Messages'}</h3>
                <p>
                  {language === 'ru' 
                    ? 'Личные чаты с продавцами и друзьями появятся скоро. Следите за обновлениями!'
                    : 'Private chats with sellers and friends coming soon. Stay tuned!'}
                </p>
                <div className="coming-soon-badge">
                  {language === 'ru' ? 'Скоро' : 'Coming Soon'}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Area */
            <>
              <div className="chat-messages">
                {currentMessages.length === 0 && (
                  <div className="empty-chat">
                    <Bot size={40} strokeWidth={1.5} />
                    <p>
                      {activeTab === 'ai' && (language === 'ru' 
                        ? 'Привет! Я Core AI. Спроси меня о чём угодно — помогу с выбором, сборкой ПК или просто поболтаем.'
                        : "Hi! I'm Core AI. Ask me anything — I'll help with recommendations, PC builds, or just chat.")}
                      {activeTab === 'community' && (language === 'ru'
                        ? `${pageContext.label}. Задай вопрос сообществу или Core AI ответит первым!`
                        : `${pageContext.label}. Ask the community or Core AI will answer first!`)}
                      {activeTab === 'support' && (language === 'ru'
                        ? 'Служба поддержки. Опишите вашу проблему, и мы поможем!'
                        : 'Support team. Describe your issue and we\'ll help!')}
                    </p>
                  </div>
                )}
                
                {currentMessages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}
                  >
                    <div className="message-avatar">
                      {msg.sender === 'bot' ? <Bot size={18} /> : <span>👤</span>}
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">
                        {msg.text}
                      </div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="message bot">
                    <div className="message-avatar">
                      <Bot size={18} />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                <button className="attach-btn" title={language === 'ru' ? 'Прикрепить файл' : 'Attach file'}>
                  <Paperclip size={18} />
                </button>
                
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'ru' ? 'Напишите сообщение...' : 'Type a message...'}
                  rows={1}
                />
                
                <button
                  className={`voice-btn-input ${isRecording ? 'recording' : ''} ${!speechSupported ? 'disabled' : ''}`}
                  onClick={handleVoiceInput}
                  title={!speechSupported ? (language === 'ru' ? 'Голосовой ввод недоступен' : 'Voice input not available') : ''}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlassyChatBar;
