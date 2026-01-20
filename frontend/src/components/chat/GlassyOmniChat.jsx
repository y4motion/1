/**
 * GlassyOmniChat - Emergent Style
 * 
 * Цельное акриловое полотно с чёрной зоной внутри
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Globe,
  Shield,
  ShoppingBag,
  ArrowUp,
  Mic,
  Paperclip,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './GlassyOmniChat.css';

const NAV_TABS = [
  { id: 'ai', icon: Bot, label: 'AI' },
  { id: 'global', icon: Globe, label: 'Global' },
  { id: 'guilds', icon: Shield, label: 'Guilds', requiresLevel: 5 },
  { id: 'trade', icon: ShoppingBag, label: 'Trade' },
];

const API_URL = '';

export default function GlassyOmniChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [aiStatus, setAiStatus] = useState('idle');
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [statusType, setStatusType] = useState('idle');
  
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dockRef = useRef(null);

  const getStatusText = useCallback(() => {
    const texts = {
      ru: {
        idle: 'Готов помочь',
        typing: 'AI печатает...',
        analyzing: 'Анализирует контекст...',
      },
      en: {
        idle: 'Agent is waiting...',
        typing: 'AI is typing...',
        analyzing: 'Analyzing context...',
      }
    };
    const lang = language === 'ru' ? 'ru' : 'en';
    return texts[lang][statusType] || texts[lang].idle;
  }, [statusType, language]);

  useEffect(() => {
    if (isTyping) {
      setStatusType('typing');
      setLastActivity(Date.now());
    } else if (aiStatus === 'analyzing') {
      setStatusType('analyzing');
    } else {
      setStatusType('idle');
    }
  }, [isTyping, aiStatus]);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('pc-builder') || path.includes('assembly')) {
      setActiveTab('ai');
      setAiStatus('analyzing');
    } else if (path.includes('marketplace') || path.includes('product')) {
      setActiveTab('trade');
      setAiStatus('idle');
    } else {
      setAiStatus('idle');
    }
  }, [location]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    const handleClickOutside = (e) => {
      if (isOpen && dockRef.current && !dockRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
                text: data.response || 'Понял. Чем помочь?',
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
    <div className="ghost-dock-container" data-testid="glassy-omni-chat">
      <AnimatePresence mode="wait">
        
        {/* === IDLE: Полоска (НЕ ТРОГАТЬ!) === */}
        {!isOpen && (
          <motion.div
            key="ghost-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`ghost-line ${aiStatus === 'analyzing' ? 'analyzing' : ''}`}
            onClick={() => setIsOpen(true)}
            data-testid="chat-idle-strip"
          >
            <div className="line-pulse" />
            <span className="line-label">Chat</span>
          </motion.div>
        )}

        {/* === ACTIVE: Цельное акриловое полотно === */}
        {isOpen && (
          <motion.div
            key="emergent-chat"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="emergent-chat-window"
            ref={dockRef}
            data-testid="chat-expanded"
          >
            {/* Header content в акриловой шапке */}
            <div className="acrylic-header-content">
              <div className={`emergent-status ${statusType}`}>
                <div className="status-dot" />
                <span>{getStatusText()}</span>
              </div>
              
              <button 
                className="emergent-close" 
                onClick={() => setIsOpen(false)}
                data-testid="chat-close-btn"
              >
                <X size={14} />
              </button>
            </div>

            {/* Чёрная зона в центре */}
            <div className="chat-black-zone">
              {/* Input */}
              <div className="emergent-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setLastActivity(Date.now());
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={language === 'ru' ? 'Сообщение агенту' : 'Message Agent'}
                  data-testid="chat-input"
                />
              </div>

              {/* Messages */}
              {currentMessages.length > 0 && (
                <div className="emergent-messages">
                  {currentMessages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      className={`emergent-msg ${msg.type}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {msg.type === 'bot' && (
                        <div className="msg-avatar">
                          <Bot size={14} />
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="emergent-msg bot">
                      <div className="msg-avatar"><Bot size={14} /></div>
                      <div className="typing-indicator"><span /><span /><span /></div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Toolbar */}
              <div className="chat-toolbar">
                <div className="toolbar-left">
                  <button className="toolbar-btn" title="Attach file" data-testid="attach-btn">
                    <Paperclip size={18} />
                  </button>
                  
                  {NAV_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isLocked = tab.requiresLevel && userLevel < tab.requiresLevel;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => !isLocked && setActiveTab(tab.id)}
                        className={`toolbar-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        title={tab.label}
                        data-testid={`tab-${tab.id}`}
                      >
                        <tab.icon size={18} />
                        {isLocked && <span className="lock-badge">🔒</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="toolbar-right">
                  <button className="toolbar-btn" title="Voice">
                    <Mic size={18} />
                  </button>
                  <button 
                    className="toolbar-btn send"
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    data-testid="send-btn"
                  >
                    <ArrowUp size={18} />
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
