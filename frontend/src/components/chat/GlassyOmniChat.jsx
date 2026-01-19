/**
 * GlassyOmniChat - The Ultimate Chat Hub
 * 
 * Единый центр коммуникации:
 * - AI Assistant (PC Builder advisor)
 * - Community (Global + Guilds)
 * - Commerce (Sellers + Swap users)
 * - Support (Red Line - emergency)
 * 
 * Features:
 * - Collapsible status bar ↔ full window
 * - Smart channel switching with bubbles
 * - Context-aware auto-switching
 * - Glassmorphism design
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Globe,
  Shield,
  ShoppingBag,
  Headphones,
  ChevronUp,
  ChevronDown,
  Send,
  Mic,
  Paperclip,
  X,
  Sparkles,
  Users,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SmartChannelSwitcher from './SmartChannelSwitcher';
import './GlassyOmniChat.css';

// Chat modes
const CHAT_MODES = {
  AI: 'ai',
  GLOBAL: 'global',
  GUILDS: 'guilds',
  TRADE: 'trade',
  SUPPORT: 'support',
};

// Mode configurations
const MODE_CONFIG = {
  [CHAT_MODES.AI]: {
    icon: Bot,
    label: 'AI Assistant',
    labelRu: 'ИИ Помощник',
    color: '#8b5cf6',
    description: 'Tech advisor & compatibility expert',
  },
  [CHAT_MODES.GLOBAL]: {
    icon: Globe,
    label: 'Global Chat',
    labelRu: 'Общий чат',
    color: '#22c55e',
    description: 'Community discussions',
  },
  [CHAT_MODES.GUILDS]: {
    icon: Shield,
    label: 'Guilds',
    labelRu: 'Гильдии',
    color: '#3b82f6',
    description: 'Your private groups',
    requiresLevel: 5,
  },
  [CHAT_MODES.TRADE]: {
    icon: ShoppingBag,
    label: 'Trade',
    labelRu: 'Торговля',
    color: '#f59e0b',
    description: 'Seller & buyer chats',
  },
  [CHAT_MODES.SUPPORT]: {
    icon: Headphones,
    label: 'Support',
    labelRu: 'Поддержка',
    color: '#ef4444',
    description: 'Emergency assistance',
    hidden: true,
  },
};

// API URL
const API_URL = '';

const GlassyOmniChat = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  
  // Core states
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState(CHAT_MODES.AI);
  const [activeChannel, setActiveChannel] = useState(null); // For guilds/trade sub-channels
  
  // Chat states
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [statusText, setStatusText] = useState('Ready');
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Status bar animation state
  const [statusDots, setStatusDots] = useState([false, false, false]);
  
  // ==================== CONTEXT AWARENESS ====================
  
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    
    // Auto-switch based on route
    if (path.includes('/pc-builder') || path.includes('/assembly')) {
      setActiveMode(CHAT_MODES.AI);
      setStatusText('AI: Ready to help');
    } else if (path.includes('/marketplace') || path.includes('/product')) {
      setActiveMode(CHAT_MODES.TRADE);
      setStatusText('Trade: Browse sellers');
    } else if (path.includes('/mod') || path.includes('/mods')) {
      // Check level for mods section
      const userLevel = user?.level || 0;
      if (userLevel >= 10) {
        setActiveMode(CHAT_MODES.GUILDS);
        setStatusText('Guilds: Mod community');
      } else {
        setActiveMode(CHAT_MODES.GLOBAL);
        setStatusText('Level 10+ required for Guilds');
      }
    } else if (path.includes('/feed') || path.includes('/community')) {
      setActiveMode(CHAT_MODES.GLOBAL);
      setStatusText('Global: Community chat');
    } else if (path.includes('/glassy-swap')) {
      setActiveMode(CHAT_MODES.TRADE);
      setStatusText('Trade: Swap negotiations');
    }
  }, [location.pathname, user?.level]);
  
  // ==================== STATUS BAR ANIMATION ====================
  
  useEffect(() => {
    if (isExpanded) return;
    
    // Animate dots when collapsed
    const interval = setInterval(() => {
      setStatusDots(prev => {
        const newDots = [...prev];
        const activeIndex = newDots.findIndex(d => d);
        if (activeIndex === -1) {
          newDots[0] = true;
        } else if (activeIndex < 2) {
          newDots[activeIndex] = false;
          newDots[activeIndex + 1] = true;
        } else {
          newDots[2] = false;
        }
        return newDots;
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isExpanded]);
  
  // ==================== SUPPORT TRIGGER ====================
  
  const triggerSupport = useCallback((reason = 'User requested support') => {
    setActiveMode(CHAT_MODES.SUPPORT);
    setIsExpanded(true);
    setStatusText(`Support: ${reason}`);
    
    // Add system message
    setMessages(prev => ({
      ...prev,
      [CHAT_MODES.SUPPORT]: [
        ...(prev[CHAT_MODES.SUPPORT] || []),
        {
          id: Date.now(),
          type: 'system',
          text: `Support session started: ${reason}`,
          timestamp: new Date(),
        }
      ]
    }));
  }, []);
  
  // Expose trigger globally for other components
  useEffect(() => {
    window.triggerGlassySupport = triggerSupport;
    return () => { delete window.triggerGlassySupport; };
  }, [triggerSupport]);
  
  // ==================== MESSAGE HANDLING ====================
  
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => ({
      ...prev,
      [activeMode]: [...(prev[activeMode] || []), newMessage]
    }));
    
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response for AI mode
    if (activeMode === CHAT_MODES.AI) {
      try {
        const response = await fetch(`${API_URL}/api/mind/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          body: JSON.stringify({
            message: inputValue,
            context: { page: location.pathname }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(prev => ({
            ...prev,
            [activeMode]: [
              ...(prev[activeMode] || []),
              {
                id: Date.now(),
                type: 'bot',
                text: data.response || 'I understand. How can I help further?',
                timestamp: new Date(),
              }
            ]
          }));
        }
      } catch (error) {
        console.error('Chat error:', error);
      }
    }
    
    setIsTyping(false);
  }, [inputValue, activeMode, location.pathname]);
  
  // ==================== SCROLL TO BOTTOM ====================
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMode]);
  
  // ==================== CHANNEL CHANGE ====================
  
  const handleChannelChange = useCallback((channel) => {
    setActiveChannel(channel);
    // Could load channel-specific messages here
  }, []);
  
  // ==================== RENDER ====================
  
  const currentModeConfig = MODE_CONFIG[activeMode];
  const CurrentModeIcon = currentModeConfig.icon;
  const currentMessages = messages[activeMode] || [];
  
  // Check if user has access to guilds
  const userLevel = user?.level || 0;
  const canAccessGuilds = userLevel >= (MODE_CONFIG[CHAT_MODES.GUILDS].requiresLevel || 0);
  
  return (
    <div 
      className={`glassy-omni-chat ${isExpanded ? 'expanded' : 'collapsed'} mode-${activeMode}`}
      data-testid="glassy-omni-chat"
    >
      {/* ==================== COLLAPSED STATE (Status Bar) ==================== */}
      {!isExpanded && (
        <div 
          className="omni-status-bar"
          onClick={() => setIsExpanded(true)}
        >
          <div className="status-left">
            <CurrentModeIcon size={14} style={{ color: currentModeConfig.color }} />
            <span className="status-text">{statusText}</span>
          </div>
          
          <div className="status-dots">
            {statusDots.map((active, i) => (
              <span 
                key={i} 
                className={`dot ${active ? 'active' : ''}`}
                style={{ backgroundColor: active ? currentModeConfig.color : undefined }}
              />
            ))}
          </div>
          
          <div className="status-right">
            <ChevronUp size={14} />
          </div>
        </div>
      )}
      
      {/* ==================== EXPANDED STATE (Full Window) ==================== */}
      {isExpanded && (
        <div className="omni-window">
          {/* Header */}
          <div className="omni-header">
            <div className="header-title">
              <CurrentModeIcon size={18} style={{ color: currentModeConfig.color }} />
              <span>
                {language === 'ru' ? currentModeConfig.labelRu : currentModeConfig.label}
              </span>
              {activeChannel && (
                <span className="channel-badge">{activeChannel.name}</span>
              )}
            </div>
            <button 
              className="close-btn" 
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown size={18} />
            </button>
          </div>
          
          {/* Mode Tabs */}
          <div className="omni-tabs">
            {Object.entries(MODE_CONFIG)
              .filter(([_, config]) => !config.hidden)
              .map(([mode, config]) => {
                const Icon = config.icon;
                const isActive = activeMode === mode;
                const isLocked = mode === CHAT_MODES.GUILDS && !canAccessGuilds;
                
                return (
                  <button
                    key={mode}
                    className={`tab-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => !isLocked && setActiveMode(mode)}
                    disabled={isLocked}
                    style={{ 
                      '--tab-color': config.color,
                      borderColor: isActive ? config.color : 'transparent'
                    }}
                    title={isLocked ? `Level ${config.requiresLevel}+ required` : config.description}
                  >
                    <Icon size={16} />
                    {isLocked && <span className="lock-badge">🔒</span>}
                  </button>
                );
              })}
          </div>
          
          {/* Smart Channel Switcher (for Guilds/Trade) */}
          {(activeMode === CHAT_MODES.GUILDS || activeMode === CHAT_MODES.TRADE) && (
            <SmartChannelSwitcher
              mode={activeMode}
              activeChannel={activeChannel}
              onChannelChange={handleChannelChange}
              userLevel={userLevel}
            />
          )}
          
          {/* Messages Area */}
          <div className="omni-messages">
            {currentMessages.length === 0 ? (
              <div className="empty-state">
                <Sparkles size={32} style={{ color: currentModeConfig.color }} />
                <p>
                  {activeMode === CHAT_MODES.AI 
                    ? (language === 'ru' ? 'Спросите меня о совместимости ПК' : 'Ask me about PC compatibility')
                    : (language === 'ru' ? 'Нет сообщений' : 'No messages yet')
                  }
                </p>
              </div>
            ) : (
              currentMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.type}`}
                >
                  {msg.type === 'bot' && (
                    <div className="message-avatar">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="message-avatar">
                  <Bot size={14} />
                </div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="omni-input">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={
                activeMode === CHAT_MODES.AI 
                  ? (language === 'ru' ? 'Спросить ИИ...' : 'Ask AI...')
                  : (language === 'ru' ? 'Написать сообщение...' : 'Type a message...')
              }
            />
            <div className="input-actions">
              <button className="action-btn" title="Attach file">
                <Paperclip size={16} />
              </button>
              <button className="action-btn" title="Voice input">
                <Mic size={16} />
              </button>
              <button 
                className="send-btn"
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                style={{ backgroundColor: currentModeConfig.color }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          
          {/* Support Mode Warning */}
          {activeMode === CHAT_MODES.SUPPORT && (
            <div className="support-banner">
              <AlertTriangle size={14} />
              <span>{language === 'ru' ? 'Экстренная линия поддержки' : 'Emergency Support Line'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlassyOmniChat;
