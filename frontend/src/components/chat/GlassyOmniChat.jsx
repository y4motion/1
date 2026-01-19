/**
 * GlassyOmniChat - Ghost Dock (Emergent Style)
 * 
 * - Чат "растворяется" вверх через mask-image
 * - Иконки слева, крупные, монохромные
 * - Автоматическая высота от контента
 * - Пульсация border-top оранжевым
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
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './GlassyOmniChat.css';

// --- NAV TABS ---
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
  
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

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
        
        {/* === IDLE: Тонкая пульсирующая линия === */}
        {!isOpen && (
          <motion.div
            key="ghost-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`ghost-line ${aiStatus === 'analyzing' ? 'analyzing' : ''}`}
            onClick={() => setIsOpen(true)}
          >
            <div className="line-pulse" />
            <span className="line-label">Chat</span>
          </motion.div>
        )}

        {/* === ACTIVE: Ghost Dock === */}
        {isOpen && (
          <motion.div
            key="ghost-dock"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="ghost-dock"
          >
            {/* Messages - растворяются вверх */}
            {currentMessages.length > 0 && (
              <div className="dock-messages">
                {currentMessages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    className={`dock-msg ${msg.type}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {msg.type === 'bot' && (
                      <div className="msg-icon">
                        <Bot size={14} />
                      </div>
                    )}
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

            {/* Empty state */}
            {currentMessages.length === 0 && (
              <div className="dock-empty">
                <Sparkles size={16} />
                <span>{language === 'ru' ? 'Спросите что угодно' : 'Ask anything'}</span>
              </div>
            )}

            {/* Control Row: Tabs + Input */}
            <div className="dock-controls">
              {/* Tabs - слева, крупные, монохромные */}
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
                      <tab.icon size={20} />
                      {isLocked && <span className="lock">🔒</span>}
                    </button>
                  );
                })}
              </div>

              {/* Input - справа, прозрачное */}
              <div className="dock-input">
                <button className="input-btn attach" title="Attach file">
                  <Paperclip size={18} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={language === 'ru' ? 'Сообщение...' : 'Message...'}
                />
                <button className="input-btn mic"><Mic size={18} /></button>
                <button 
                  className="input-btn send"
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
