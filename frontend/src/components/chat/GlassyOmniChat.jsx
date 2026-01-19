/**
 * GlassyOmniChat - Ghost Dock (Open U-Console)
 * 
 * IDLE: Тончайшая нить (1-2px), 100% ширины, импульс по центру
 * ACTIVE: U-образная открытая чаша без верхней границы
 *         Свет разъезжается из центра по бокам
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Globe,
  Shield,
  ShoppingBag,
  Send,
  Mic,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './GlassyOmniChat.css';

// --- NAV CUBES ---
const NAV_CUBES = [
  { id: 'ai', icon: Bot, label: 'AI', color: '#FF9F43' },
  { id: 'global', icon: Globe, label: 'Global', color: '#3b82f6' },
  { id: 'guilds', icon: Shield, label: 'Guilds', color: '#f59e0b', requiresLevel: 5 },
  { id: 'trade', icon: ShoppingBag, label: 'Trade', color: '#22c55e' },
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
                text: data.response || 'Понял. Чем ещё помочь?',
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

  // Sort cubes - active first
  const sortedCubes = [...NAV_CUBES].sort((a, b) => {
    if (a.id === activeTab) return -1;
    if (b.id === activeTab) return 1;
    return 0;
  });

  const currentMessages = messages[activeTab] || [];
  const userLevel = user?.level || 0;

  return (
    <div className="ghost-dock-container" data-testid="glassy-omni-chat">
      <AnimatePresence mode="wait">
        
        {/* === IDLE: Тончайшая нить с импульсом === */}
        {!isOpen && (
          <motion.div
            key="ghost-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`ghost-line ${aiStatus === 'analyzing' ? 'analyzing' : ''}`}
            onClick={() => setIsOpen(true)}
          >
            {/* Импульс по центру */}
            <div className="line-pulse" />
            {/* Текст Chat */}
            <span className="line-label">Chat</span>
          </motion.div>
        )}

        {/* === ACTIVE: Ghost Dock (U-Shape) === */}
        {isOpen && (
          <motion.div
            key="ghost-dock"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="ghost-dock"
          >
            {/* U-Shape Light Border */}
            <div className="dock-u-border">
              <div className="u-left" />
              <div className="u-bottom" />
              <div className="u-right" />
            </div>

            {/* Chat Messages - fade to top */}
            <div className="dock-messages">
              {currentMessages.length === 0 ? (
                <div className="dock-empty">
                  <Sparkles size={18} />
                  <span>{language === 'ru' ? 'Спросите что угодно' : 'Ask anything'}</span>
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    className={`dock-message ${msg.type}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {msg.type === 'bot' && (
                      <div className="msg-icon">
                        <Bot size={12} />
                      </div>
                    )}
                    <p>{msg.text}</p>
                  </motion.div>
                ))
              )}
              
              {isTyping && (
                <div className="dock-message bot typing">
                  <div className="msg-icon"><Bot size={12} /></div>
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Control Bar */}
            <div className="dock-controls">
              {/* Navigation Cubes - Dynamic */}
              <LayoutGroup>
                <div className="nav-cubes">
                  {sortedCubes.map((cube) => {
                    const isActive = activeTab === cube.id;
                    const isLocked = cube.requiresLevel && userLevel < cube.requiresLevel;
                    return (
                      <motion.button
                        key={cube.id}
                        layoutId={cube.id}
                        onClick={() => !isLocked && setActiveTab(cube.id)}
                        className={`nav-cube ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        style={{ '--cube-color': cube.color }}
                        whileHover={{ scale: isLocked ? 1 : 1.1 }}
                        whileTap={{ scale: isLocked ? 1 : 0.95 }}
                      >
                        <cube.icon size={16} />
                        {isLocked && <span className="lock">🔒</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>

              {/* Input */}
              <div className="dock-input">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={language === 'ru' ? 'Сообщение...' : 'Message...'}
                />
                <button className="input-mic"><Mic size={16} /></button>
                <button 
                  className="input-send"
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Close hint */}
              <button className="dock-close" onClick={() => setIsOpen(false)}>
                Esc
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
