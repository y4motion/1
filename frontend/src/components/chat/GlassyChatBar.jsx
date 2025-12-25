import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  Paperclip,
  Bot,
  Users,
  MessageSquare,
  Headphones,
  Sparkles,
  MoreVertical,
  Minimize2,
  Maximize2,
  GripHorizontal,
  ExternalLink,
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

// Panel modes
const PANEL_MODES = {
  COLLAPSED: 'collapsed',
  MINI: 'mini',      // 50% height
  EXPANDED: 'expanded', // 75% height
  FULLSCREEN: 'fullscreen', // 100% height
};

const GlassyChatBar = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  // Panel State
  const [panelMode, setPanelMode] = useState(PANEL_MODES.COLLAPSED);
  const [customHeight, setCustomHeight] = useState(null); // For drag resize
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [peekMessage, setPeekMessage] = useState(null);
  
  // Chat State
  const [activeTab, setActiveTab] = useState('ai');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({ ai: 0, messages: 0, community: 0, support: 0 });
  const [lastMessageSource, setLastMessageSource] = useState(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Refs
  const wsRef = useRef(null);
  const wsInitialized = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const panelRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  const autoCollapseTimerRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // ========================================
  // AUTO-COLLAPSE LOGIC
  // ========================================
  
  const resetAutoCollapseTimer = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
    }
  }, []);

  // Track user interaction
  const handleInteraction = useCallback(() => {
    resetAutoCollapseTimer();
  }, [resetAutoCollapseTimer]);

  // Auto-collapse on scroll after 15s of inactivity
  useEffect(() => {
    if (panelMode === PANEL_MODES.COLLAPSED) return;

    const handleScroll = () => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceLastInteraction > 15000) { // 15 seconds
        setPanelMode(PANEL_MODES.COLLAPSED);
        setCustomHeight(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [panelMode]);

  // ========================================
  // GESTURE HANDLERS
  // ========================================

  // Touch start for swipe detection
  const touchStartRef = useRef({ y: 0, time: 0 });

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartRef.current.y - e.changedTouches[0].clientY;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Swipe up from collapsed bar
    if (panelMode === PANEL_MODES.COLLAPSED && deltaY > 50 && deltaTime < 300) {
      setPanelMode(PANEL_MODES.EXPANDED);
      handleInteraction();
    }
    // Swipe down from expanded panel
    else if (panelMode !== PANEL_MODES.COLLAPSED && deltaY < -50 && deltaTime < 300) {
      setPanelMode(PANEL_MODES.COLLAPSED);
      setCustomHeight(null);
    }
  };

  // Double tap to toggle mini/fullscreen
  const lastTapRef = useRef(0);
  
  const handleHeaderDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      if (panelMode === PANEL_MODES.FULLSCREEN) {
        setPanelMode(PANEL_MODES.MINI);
      } else {
        setPanelMode(PANEL_MODES.FULLSCREEN);
      }
      setCustomHeight(null);
      handleInteraction();
    }
    lastTapRef.current = now;
  };

  // ========================================
  // DRAG RESIZE
  // ========================================

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    dragStartHeight.current = panelRef.current?.offsetHeight || window.innerHeight * 0.75;
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    
    const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const deltaY = dragStartY.current - currentY;
    const newHeight = Math.min(
      Math.max(dragStartHeight.current + deltaY, window.innerHeight * 0.3),
      window.innerHeight * 0.95
    );
    
    setCustomHeight(newHeight);
    setPanelMode(PANEL_MODES.EXPANDED); // Switch to expanded mode when dragging
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
    handleInteraction();
  }, [handleDragMove, handleInteraction]);

  // ========================================
  // EXTERNAL OPEN EVENT
  // ========================================

  useEffect(() => {
    const handleOpenChat = (event) => {
      setPanelMode(PANEL_MODES.EXPANDED);
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
      }
      handleInteraction();
    };
    
    window.addEventListener('openGlassyChat', handleOpenChat);
    return () => window.removeEventListener('openGlassyChat', handleOpenChat);
  }, [handleInteraction]);

  // ========================================
  // SPEECH RECOGNITION
  // ========================================

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
      
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [language]);

  // ========================================
  // WEBSOCKET
  // ========================================

  const addMessage = useCallback((tab, message) => {
    setMessages(prev => {
      const tabMessages = prev[tab] || [];
      if (message.id && tabMessages.some(m => m.id === message.id)) {
        return prev;
      }
      return { ...prev, [tab]: [...tabMessages, message] };
    });
  }, []);

  useEffect(() => {
    if (wsInitialized.current) return;
    wsInitialized.current = true;
    
    const storedSessionId = localStorage.getItem('glassy_chat_session');
    const newSessionId = storedSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!storedSessionId) {
      localStorage.setItem('glassy_chat_session', newSessionId);
    }
    setSessionId(newSessionId);

    let systemMessageReceived = false;
    
    const connectWebSocket = () => {
      const ws = new WebSocket(`${WS_URL}/api/ws/support-chat/${newSessionId}`);
      
      ws.onopen = () => console.log('GlassyChatBar WebSocket connected');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'system') {
          if (!systemMessageReceived) {
            systemMessageReceived = true;
            addMessage('ai', {
              id: Date.now(),
              sender: 'bot',
              text: data.message,
              timestamp: new Date(data.timestamp),
            });
          }
        } else if (data.type === 'bot_message') {
          setIsTyping(false);
          const newMsg = {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          };
          addMessage('ai', newMsg);
          
          // Update unread + indicators
          setUnreadCounts(prev => ({ ...prev, ai: prev.ai + 1 }));
          setLastMessageSource('ai');
          setHasNewMessage(true);
          
          // Show peek preview if collapsed
          if (panelMode === PANEL_MODES.COLLAPSED) {
            setPeekMessage(data.message.text?.substring(0, 60) + '...');
            setTimeout(() => setPeekMessage(null), 3000);
          }
          
          setTimeout(() => {
            setLastMessageSource(null);
            setHasNewMessage(false);
          }, 5000);
        }
      };
      
      ws.onerror = (error) => console.error('WebSocket error:', error);
      ws.onclose = () => setTimeout(connectWebSocket, 3000);
      
      wsRef.current = ws;
    };
    
    connectWebSocket();
    
    return () => wsRef.current?.close();
  }, [addMessage, panelMode]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Clear unread when tab is active
  useEffect(() => {
    if (panelMode !== PANEL_MODES.COLLAPSED) {
      setUnreadCounts(prev => ({ ...prev, [activeTab]: 0 }));
    }
  }, [activeTab, panelMode]);

  // ========================================
  // CONTEXT DETECTION
  // ========================================

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

  // ========================================
  // MESSAGE HANDLERS
  // ========================================

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };
    
    addMessage(activeTab, userMessage);
    
    wsRef.current.send(JSON.stringify({
      message: inputMessage,
      user_id: user?.id || null,
      language: language,
      context: { tab: activeTab, page: getPageContext() }
    }));
    
    setInputMessage('');
    setIsTyping(true);
    handleInteraction();
  };

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
    handleInteraction();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ========================================
  // MENU ACTIONS
  // ========================================

  const handleMenuAction = (action) => {
    setShowMenu(false);
    switch (action) {
      case 'collapse':
        setPanelMode(PANEL_MODES.COLLAPSED);
        setCustomHeight(null);
        break;
      case 'mini':
        setPanelMode(PANEL_MODES.MINI);
        setCustomHeight(null);
        break;
      case 'fullscreen':
        setPanelMode(PANEL_MODES.FULLSCREEN);
        setCustomHeight(null);
        break;
      case 'popout':
        // Open in new window (if supported)
        const chatUrl = `${window.location.origin}/chat?popout=true`;
        window.open(chatUrl, 'GlassyChat', 'width=400,height=600,resizable=yes');
        break;
      default:
        break;
    }
    handleInteraction();
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest('.panel-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const currentMessages = messages[activeTab] || [];
  const pageContext = getPageContext();
  const isMinimalMod = theme === 'minimal-mod';
  const isDark = theme === 'dark' || isMinimalMod;
  const showElements = isHovered || totalUnread > 0 || hasNewMessage;
  
  const getIndicatorClass = () => {
    if (unreadCounts.support > 0) return 'indicator-support';
    if (unreadCounts.ai > 0 || lastMessageSource === 'ai') return 'indicator-ai';
    if (unreadCounts.community > 0 || lastMessageSource === 'community') return 'indicator-community';
    if (lastMessageSource === 'user') return 'indicator-user';
    return '';
  };

  const getPanelHeight = () => {
    if (customHeight) return `${customHeight}px`;
    switch (panelMode) {
      case PANEL_MODES.MINI: return '50vh';
      case PANEL_MODES.FULLSCREEN: return '100vh';
      case PANEL_MODES.EXPANDED: return '75vh';
      default: return 'auto';
    }
  };

  const isCollapsed = panelMode === PANEL_MODES.COLLAPSED;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`glassy-chat-bar ${panelMode} ${isMinimalMod ? 'minimal-mod' : ''} ${hasNewMessage ? 'has-new-message' : ''} ${isTyping ? 'ai-typing' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        '--chat-bg': isDark ? 'rgba(10, 10, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        '--chat-border': isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        '--chat-text': isDark ? '#ffffff' : '#1a1a1a',
        '--chat-text-muted': isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        '--chat-accent': '#8b5cf6',
        '--panel-height': getPanelHeight(),
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ========== COLLAPSED BAR ========== */}
      {isCollapsed && (
        <div 
          className="chat-collapsed-bar"
          onClick={() => {
            setPanelMode(PANEL_MODES.EXPANDED);
            handleInteraction();
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Center section - text only on hover */}
          <div className="bar-center">
            <span className={`status-text ${isHovered ? 'visible' : ''}`}>
              Chat
            </span>
          </div>
          
          {/* Right section - mic only on hover */}
          <div className={`bar-right ${isHovered ? 'visible' : ''}`}>
            <button
              className={`voice-btn ${isRecording ? 'recording' : ''} ${!speechSupported ? 'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleVoiceInput();
              }}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
          
          {/* Peek Preview */}
          {peekMessage && (
            <div className="peek-preview">
              <Bot size={14} />
              <span>{peekMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* ========== EXPANDED PANEL ========== */}
          )}
        </div>
      )}

      {/* ========== EXPANDED PANEL ========== */}
      {!isCollapsed && (
        <div 
          ref={panelRef}
          className="chat-expanded-panel"
          style={{ height: getPanelHeight() }}
          onClick={handleInteraction}
        >
          {/* Drag Handle */}
          <div 
            className={`drag-handle ${isDragging ? 'active' : ''}`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onClick={handleHeaderDoubleTap}
          >
            <GripHorizontal size={20} className="grip-icon" />
          </div>
          
          {/* Header with Tabs */}
          <div className="chat-header">
            <div className="chat-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`chat-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    handleInteraction();
                  }}
                >
                  <tab.icon size={16} />
                  <span>{tab.label[language] || tab.label.en}</span>
                  {unreadCounts[tab.id] > 0 && (
                    <span className="tab-badge">{unreadCounts[tab.id]}</span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Menu Button */}
            <div className="panel-menu">
              <button 
                className="menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreVertical size={18} />
              </button>
              
              {showMenu && (
                <div className="menu-dropdown">
                  <button onClick={() => handleMenuAction('collapse')}>
                    <Minimize2 size={14} />
                    <span>{language === 'ru' ? 'Свернуть' : 'Collapse'}</span>
                  </button>
                  <button onClick={() => handleMenuAction('mini')}>
                    <span className="mini-icon">½</span>
                    <span>{language === 'ru' ? 'Мини-режим' : 'Mini Mode'}</span>
                  </button>
                  <button onClick={() => handleMenuAction('fullscreen')}>
                    <Maximize2 size={14} />
                    <span>{language === 'ru' ? 'На весь экран' : 'Full Screen'}</span>
                  </button>
                  <div className="menu-divider" />
                  <button onClick={() => handleMenuAction('popout')}>
                    <ExternalLink size={14} />
                    <span>{language === 'ru' ? 'Открепить' : 'Pop Out'}</span>
                  </button>
                </div>
              )}
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
            <>
              {/* Chat Area */}
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
                      <div className="message-bubble">{msg.text}</div>
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
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleInteraction();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'ru' ? 'Напишите сообщение...' : 'Type a message...'}
                  rows={1}
                />
                
                <button
                  className={`voice-btn-input ${isRecording ? 'recording' : ''} ${!speechSupported ? 'disabled' : ''}`}
                  onClick={handleVoiceInput}
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
