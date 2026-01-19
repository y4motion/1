/**
 * GlassyOmniChat - Ghost Deck Concept
 * 
 * Концепция "Призрачная Дека":
 * - IDLE: Тончайшая (2px) пульсирующая линия внизу экрана
 * - HOVER: Линия вырастает в статус-бар (40px)
 * - ACTIVE: Панель выезжает снизу (~300px), как выдвижной ящик
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Globe,
  Shield,
  ShoppingBag,
  X,
  Send,
  Mic,
  Sparkles,
  AlertTriangle,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SmartChannelSwitcher from './SmartChannelSwitcher';
import './GlassyOmniChat.css';

// --- TAB DEFINITIONS ---
const TABS = [
  { id: 'ai', icon: Bot, label: 'AI', labelRu: 'ИИ', color: '#FF9F43' },
  { id: 'global', icon: Globe, label: 'Global', labelRu: 'Общий', color: '#3b82f6' },
  { id: 'guilds', icon: Shield, label: 'Guilds', labelRu: 'Гильдии', color: '#f59e0b', requiresLevel: 5 },
  { id: 'trade', icon: ShoppingBag, label: 'Trade', labelRu: 'Торговля', color: '#22c55e' },
];

const API_URL = '';

export default function GlassyOmniChat() {
  // States: 'idle' | 'hover' | 'active'
  const [deckState, setDeckState] = useState('idle');
  const [activeTab, setActiveTab] = useState('ai');
  const [aiStatus, setAiStatus] = useState('idle'); // idle | analyzing
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Context Awareness
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('pc-builder') || path.includes('assembly')) {
      setActiveTab('ai');
      setAiStatus('analyzing');
    } else if (path.includes('marketplace') || path.includes('product') || path.includes('glassy-swap')) {
      setActiveTab('trade');
      setAiStatus('idle');
    } else {
      setAiStatus('idle');
    }
  }, [location, user?.level]);

  // Support Trigger
  const triggerSupport = useCallback((reason = 'User requested support') => {
    setActiveTab('support');
    setDeckState('active');
  }, []);

  useEffect(() => {
    window.triggerGlassySupport = triggerSupport;
    return () => { delete window.triggerGlassySupport; };
  }, [triggerSupport]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Handle hover zone
  const handleMouseEnter = () => {
    if (deckState === 'idle') {
      setDeckState('hover');
    }
  };

  const handleMouseLeave = () => {
    if (deckState === 'hover') {
      setDeckState('idle');
    }
  };

  const handleClick = () => {
    setDeckState('active');
  };

  const handleClose = () => {
    setDeckState('idle');
  };

  // Send message
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
      [activeTab]: [...(prev[activeTab] || []), newMessage]
    }));

    setInputValue('');
    setIsTyping(true);

    if (activeTab === 'ai') {
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
            [activeTab]: [
              ...(prev[activeTab] || []),
              {
                id: Date.now(),
                type: 'bot',
                text: data.response || 'Я понял. Чем ещё могу помочь?',
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
  }, [inputValue, activeTab, location.pathname]);

  const currentMessages = messages[activeTab] || [];
  const userLevel = user?.level || 0;

  return (
    <div 
      className="ghost-deck-container"
      data-testid="glassy-omni-chat"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        
        {/* === STATE 1: IDLE - Тончайшая пульсирующая линия === */}
        {deckState === 'idle' && (
          <motion.div
            key="idle-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="ghost-line"
            onClick={handleClick}
          />
        )}

        {/* === STATE 2: HOVER - Линия вырастает в статус-бар === */}
        {deckState === 'hover' && (
          <motion.div
            key="hover-bar"
            initial={{ height: 2, opacity: 0.5 }}
            animate={{ height: 44, opacity: 1 }}
            exit={{ height: 2, opacity: 0.5 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="ghost-status-bar"
            onClick={handleClick}
          >
            <div className="status-bar-content">
              <div className="status-left">
                <div 
                  className={`status-dot ${aiStatus === 'analyzing' ? 'analyzing' : ''}`}
                />
                <span className="status-text">
                  {aiStatus === 'analyzing' ? 'AI PROCESSING' : 'SYSTEM ONLINE'}
                </span>
              </div>
              <div className="status-hint">
                <span>Click to open</span>
                <ChevronDown size={14} className="animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}

        {/* === STATE 3: ACTIVE - Панель выезжает снизу === */}
        {deckState === 'active' && (
          <motion.div
            key="active-deck"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="ghost-deck-panel"
          >
            {/* Верхняя грань панели */}
            <div className="deck-top-edge" />
            
            {/* Основной контент */}
            <div className="deck-content">
              
              {/* Левая колонка: Tabs + Navigation */}
              <div className="deck-sidebar">
                {/* Close button */}
                <button 
                  className="deck-close-btn"
                  onClick={handleClose}
                >
                  <X size={18} />
                </button>

                {/* Tabs */}
                <div className="deck-tabs">
                  {TABS.map((tab) => {
                    const isLocked = tab.requiresLevel && userLevel < tab.requiresLevel;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => !isLocked && setActiveTab(tab.id)}
                        disabled={isLocked}
                        className={`deck-tab ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        style={{ '--tab-color': tab.color }}
                      >
                        <tab.icon size={18} />
                        <span className="tab-label">
                          {language === 'ru' ? tab.labelRu : tab.label}
                        </span>
                        {isLocked && <span className="lock-icon">🔒</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Channel Switcher for Guilds/Trade */}
                {(activeTab === 'guilds' || activeTab === 'trade') && (
                  <div className="deck-channels">
                    <SmartChannelSwitcher
                      mode={activeTab}
                      activeChannel={null}
                      onChannelChange={() => {}}
                      userLevel={userLevel}
                    />
                  </div>
                )}
              </div>

              {/* Правая колонка: Chat */}
              <div className="deck-chat">
                {/* Messages */}
                <div className="deck-messages">
                  {currentMessages.length === 0 ? (
                    <div className="deck-empty">
                      <Sparkles size={24} className="text-amber-400/60" />
                      <p>
                        {activeTab === 'ai' 
                          ? (language === 'ru' ? 'Спросите о совместимости ПК' : 'Ask about PC compatibility')
                          : (language === 'ru' ? 'Нет сообщений' : 'No messages yet')
                        }
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((msg) => (
                      <div key={msg.id} className={`deck-message ${msg.type}`}>
                        {msg.type === 'bot' && (
                          <div className="message-avatar">
                            <Bot size={14} />
                          </div>
                        )}
                        <div className="message-bubble">
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isTyping && (
                    <div className="deck-message bot">
                      <div className="message-avatar">
                        <Bot size={14} />
                      </div>
                      <div className="typing-dots">
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input - встроен в панель */}
                <div className="deck-input">
                  <button className="input-action">
                    <Mic size={18} />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={language === 'ru' ? 'Введите сообщение...' : 'Type a message...'}
                  />
                  <button 
                    className="input-send"
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
