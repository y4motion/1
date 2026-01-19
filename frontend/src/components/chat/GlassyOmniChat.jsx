/**
 * GlassyOmniChat - Ghost Deck + Thin Line Concept
 * 
 * IDLE: Тончайшая (2px) едва заметная пульсирующая линия + "Chat" при hover
 * ACTIVE: Панель выезжает снизу (~280px), как твоё окно чата Emergent
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
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [aiStatus, setAiStatus] = useState('idle'); // idle | analyzing
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);

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
    setIsOpen(true);
  }, []);

  useEffect(() => {
    window.triggerGlassySupport = triggerSupport;
    return () => { delete window.triggerGlassySupport; };
  }, [triggerSupport]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

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
    >
      <AnimatePresence mode="wait">
        
        {/* === IDLE: Тонкая пульсирующая линия с "Chat" === */}
        {!isOpen && (
          <motion.div
            key="thin-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className={`thin-chat-line ${aiStatus === 'analyzing' ? 'analyzing' : ''} ${isHovered ? 'hovered' : ''}`}
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Центр - текст Chat */}
            <span className="line-text">
              {aiStatus === 'analyzing' 
                ? (language === 'ru' ? 'Анализирую...' : 'Analyzing...') 
                : 'Chat'}
            </span>
          </motion.div>
        )}

        {/* === ACTIVE: Компактная панель снизу === */}
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="chat-panel"
          >
            {/* Верхняя грань */}
            <div className="panel-top-edge" />
            
            {/* Header с tabs */}
            <div className="panel-header">
              <div className="panel-tabs">
                {TABS.map((tab) => {
                  const isLocked = tab.requiresLevel && userLevel < tab.requiresLevel;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => !isLocked && setActiveTab(tab.id)}
                      disabled={isLocked}
                      className={`panel-tab ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                      style={{ '--tab-color': tab.color }}
                    >
                      <tab.icon size={16} />
                      <span>{language === 'ru' ? tab.labelRu : tab.label}</span>
                      {isLocked && <span className="lock">🔒</span>}
                    </button>
                  );
                })}
              </div>
              <button className="panel-close" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="panel-messages">
              {currentMessages.length === 0 ? (
                <div className="panel-empty">
                  <Sparkles size={20} className="text-amber-400/60" />
                  <p>
                    {activeTab === 'ai' 
                      ? (language === 'ru' ? 'Спросите о ПК' : 'Ask about PC')
                      : (language === 'ru' ? 'Нет сообщений' : 'No messages')
                    }
                  </p>
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div key={msg.id} className={`panel-message ${msg.type}`}>
                    {msg.type === 'bot' && (
                      <div className="msg-avatar">
                        <Bot size={12} />
                      </div>
                    )}
                    <div className="msg-bubble">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="panel-message bot">
                  <div className="msg-avatar"><Bot size={12} /></div>
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="panel-input">
              <button className="input-mic"><Mic size={16} /></button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={language === 'ru' ? 'Сообщение...' : 'Message...'}
              />
              <button 
                className="input-send"
                onClick={sendMessage}
                disabled={!inputValue.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
