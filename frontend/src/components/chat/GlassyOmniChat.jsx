/**
 * GlassyOmniChat - Ghost Dock
 * 
 * - Линия морфится в контуры чата
 * - Индикатор ВНЕ чата (над ним)
 * - Кнопки без обводок
 * - Клик снаружи закрывает
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
  const [isFocused, setIsFocused] = useState(false);
  const [statusType, setStatusType] = useState('idle');
  
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dockRef = useRef(null);

  const getStatusText = useCallback(() => {
    const texts = {
      ru: { idle: 'Готов помочь', typing: 'AI печатает...', analyzing: 'Анализирует...' },
      en: { idle: 'Ready to help', typing: 'AI is typing...', analyzing: 'Analyzing...' }
    };
    const lang = language === 'ru' ? 'ru' : 'en';
    return texts[lang][statusType] || texts[lang].idle;
  }, [statusType, language]);

  useEffect(() => {
    if (isTyping) setStatusType('typing');
    else if (aiStatus === 'analyzing') setStatusType('analyzing');
    else setStatusType('idle');
  }, [isTyping, aiStatus]);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('pc-builder') || path.includes('assembly')) {
      setActiveTab('ai');
      setAiStatus('analyzing');
    } else if (path.includes('marketplace') || path.includes('glassy-swap')) {
      setActiveTab('trade');
      setAiStatus('idle');
    } else {
      setAiStatus('idle');
    }
  }, [location, user?.level]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Клик снаружи закрывает
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && dockRef.current && !dockRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    setMessages(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), {
        id: Date.now(),
        type: 'user',
        text: inputValue,
        timestamp: new Date(),
      }]
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
          body: JSON.stringify({ message: inputValue, context: { page: location.pathname } })
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(prev => ({
            ...prev,
            [activeTab]: [...(prev[activeTab] || []), {
              id: Date.now(),
              type: 'bot',
              text: data.response || 'Понял.',
              timestamp: new Date(),
            }]
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
        
        {/* IDLE: Линия */}
        {!isOpen && (
          <motion.div
            key="ghost-line"
            layoutId="ghost-frame"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`ghost-line ${aiStatus === 'analyzing' ? 'analyzing' : ''}`}
            onClick={() => setIsOpen(true)}
          >
            <span className="line-label">Chat</span>
          </motion.div>
        )}

        {/* ACTIVE: Dock */}
        {isOpen && (
          <div className="ghost-dock-wrapper" ref={dockRef}>
            {/* Статус СНАРУЖИ над доком */}
            <motion.div 
              className={`dock-status-external ${statusType}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="status-dot" />
              <span>{getStatusText()}</span>
            </motion.div>

            {/* Dock с морфящимся контуром */}
            <motion.div
              layoutId="ghost-frame"
              className="ghost-dock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Glassmorphism контур со свечением */}
              <div className="dock-glow-border" />

              {/* Кнопка закрыть */}
              <button className="dock-close-btn" onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>

              {/* Input Area */}
              <div className="dock-input-area">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isFocused ? (language === 'ru' ? 'Введите сообщение...' : 'Type a message...') : ''}
                  rows={1}
                />
              </div>

              {/* Messages */}
              {currentMessages.length > 0 && (
                <div className="dock-messages">
                  {currentMessages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      className={`dock-msg ${msg.type}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {msg.type === 'bot' && <div className="msg-icon"><Bot size={14} /></div>}
                      <p>{msg.text}</p>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="dock-msg bot">
                      <div className="msg-icon"><Bot size={14} /></div>
                      <div className="typing-dots"><span /><span /><span /></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Bottom Controls */}
              <div className="dock-controls">
                <div className="dock-tabs">
                  {NAV_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isLocked = tab.requiresLevel && userLevel < tab.requiresLevel;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => !isLocked && setActiveTab(tab.id)}
                        className={`dock-tab ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        title={tab.label}
                      >
                        <tab.icon size={18} />
                        {isLocked && <span className="lock">🔒</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="dock-spacer" />

                <div className="dock-actions">
                  <button className="action-btn" title="Attach"><Paperclip size={18} /></button>
                  <button className="action-btn" title="Voice"><Mic size={18} /></button>
                  <button 
                    className="action-btn send"
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
