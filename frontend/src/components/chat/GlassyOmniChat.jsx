/**
 * GlassyOmniChat - Glassy Brain Edition
 * 
 * Дизайн: Акриловое полотно + чёрная зона + иконки СНИЗУ
 * Логика: Context Awareness, режимы, suggestions
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  Globe,
  Shield,
  ShoppingBag,
  ArrowUp,
  Mic,
  MicOff,
  Paperclip,
  ChevronDown,
  Loader2,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './GlassyOmniChat.css';

// --- КОНФИГУРАЦИЯ СТАТУСОВ ПОЛОСКИ ---
const STATUS_CONFIG = {
  idle: {
    color: 'rgba(255, 255, 255, 0.2)',
    glow: '0 0 15px rgba(255, 255, 255, 0.1)',
    text: 'SYSTEM ONLINE',
    animation: 'ghost-breath',
  },
  ai_processing: {
    color: 'rgba(255, 159, 67, 0.8)',
    glow: '0 0 25px rgba(255, 159, 67, 0.4)',
    text: 'NEURAL SYNC...',
    animation: 'shimmer',
  },
  ai_ready: {
    color: 'rgba(249, 115, 22, 1)',
    glow: '0 0 35px rgba(249, 115, 22, 0.6)',
    text: 'INSIGHT AVAILABLE',
    animation: 'pulse-fast',
  },
  message: {
    color: 'rgba(52, 211, 153, 0.9)',
    glow: '0 0 25px rgba(52, 211, 153, 0.4)',
    text: 'INCOMING TRANSMISSION',
    animation: 'heartbeat',
  },
  guild: {
    color: 'rgba(168, 85, 247, 0.9)',
    glow: '0 0 25px rgba(168, 85, 247, 0.4)',
    text: 'GUILD SIGNAL',
    animation: 'pulse-fast',
  },
  warning: {
    color: 'rgba(244, 63, 94, 0.9)',
    glow: '0 0 25px rgba(244, 63, 94, 0.4)',
    text: 'CONNECTION UNSTABLE',
    animation: 'glitch',
  },
};

// --- КОНФИГУРАЦИЯ РЕЖИМОВ ---
const MODES = {
  ai: { id: 'ai', icon: Bot, label: 'Glassy AI', color: '#f97316' },
  trade: { id: 'trade', icon: ShoppingBag, label: 'Маркет', color: '#10b981' },
  guilds: { id: 'guilds', icon: Shield, label: 'Гильдии', color: '#a855f7', requiresLevel: 5 },
  global: { id: 'global', icon: Globe, label: 'Глобальный', color: '#3b82f6' },
  support: { id: 'support', icon: Headphones, label: 'Поддержка', color: '#ef4444' },
};

// --- КОНТЕКСТЫ СТРАНИЦ ---
const PAGE_CONTEXTS = {
  'pc-builder': {
    mode: 'ai',
    greeting: 'Система активна. Я проанализировал твою сборку. Готов помочь с совместимостью.',
    suggestions: ['Проверить совместимость', 'Оптимизировать бюджет', 'Найти альтернативу'],
    status: 'analyzing'
  },
  'marketplace': {
    mode: 'trade',
    greeting: 'Маркет активен. Вижу товары вокруг тебя. Найти лучшую цену?',
    suggestions: ['Сравнить цены', 'Показать скидки', 'Проверить продавца'],
    status: 'idle'
  },
  'product': {
    mode: 'trade',
    greeting: 'Анализирую этот товар... Хочешь узнать историю цен или отзывы?',
    suggestions: ['История цен', 'Читать отзывы', 'Найти дешевле'],
    status: 'analyzing'
  },
  'glassy-swap': {
    mode: 'trade',
    greeting: 'Режим обмена. Проверю рейтинг любого продавца.',
    suggestions: ['Безопасная сделка', 'Проверить продавца', 'Мои обмены'],
    status: 'idle'
  },
  'default': {
    mode: 'ai',
    greeting: 'Привет! Я Glassy Mind. Чем могу помочь?',
    suggestions: ['Собрать ПК', 'Найти товар', 'Обменяться'],
    status: 'idle'
  }
};

const API_URL = '';

export default function GlassyOmniChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('ai');
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusType, setStatusType] = useState('idle');
  const [pageContext, setPageContext] = useState(PAGE_CONTEXTS.default);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [lineStatus, setLineStatus] = useState('idle'); // Статус полоски
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dockRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const lang = language === 'ru' ? 'ru' : 'en';
  const currentMode = MODES[activeMode];

  // --- CONTEXT AWARENESS ---
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let context = PAGE_CONTEXTS.default;
    
    if (path.includes('pc-builder') || path.includes('assembly')) {
      context = PAGE_CONTEXTS['pc-builder'];
    } else if (path.includes('product') || path.includes('category')) {
      context = PAGE_CONTEXTS['product'];
    } else if (path.includes('marketplace')) {
      context = PAGE_CONTEXTS['marketplace'];
    } else if (path.includes('glassy-swap') || path.includes('swap')) {
      context = PAGE_CONTEXTS['glassy-swap'];
    }
    
    setPageContext(context);
    setActiveMode(context.mode);
    setStatusType(context.status);
  }, [location]);

  // Приветствие при открытии
  useEffect(() => {
    if (isOpen && pageContext && !messages[activeMode]?.some(m => m.isGreeting)) {
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [activeMode]: [{
            id: Date.now(),
            type: 'bot',
            text: pageContext.greeting,
            isGreeting: true,
            suggestions: pageContext.suggestions,
            timestamp: new Date(),
          }]
        }));
      }, 300);
    }
  }, [isOpen, pageContext, activeMode]);

  const getStatusText = useCallback(() => {
    const texts = {
      idle: 'Готов',
      typing: 'Печатает...',
      analyzing: 'Анализирует...',
      listening: 'Слушаю...',
      uploading: 'Загрузка...',
      emergency: '🔴 ПРИОРИТЕТ',
    };
    if (isEmergencyMode) return texts.emergency;
    return texts[statusType] || texts.idle;
  }, [statusType, isEmergencyMode]);

  useEffect(() => {
    if (isListening) setStatusType('listening');
    else if (isUploading) setStatusType('uploading');
    else if (isTyping) setStatusType('typing');
    else setStatusType(pageContext?.status || 'idle');
  }, [isTyping, isListening, isUploading, pageContext]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMode]);

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

  // Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
      recognitionRef.current.onresult = (event) => {
        setInputValue(prev => prev + event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [lang]);

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeMode]: [...(prev[activeMode] || []), {
          id: Date.now(),
          type: 'user',
          text: `📎 ${file.name}`,
          timestamp: new Date(),
        }]
      }));
      setIsUploading(false);
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [activeMode]: [...(prev[activeMode] || []), {
            id: Date.now(),
            type: 'bot',
            text: `Файл "${file.name}" получен. Анализирую...`,
            timestamp: new Date(),
          }]
        }));
      }, 500);
    }, 1000);
    e.target.value = '';
  };

  const handleModeChange = (modeId) => {
    if (MODES[modeId].requiresLevel && (user?.level || 0) < MODES[modeId].requiresLevel) return;
    setActiveMode(modeId);
    setIsEmergencyMode(modeId === 'support');
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => sendMessage(suggestion), 100);
  };

  const sendMessage = useCallback(async (text) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    setMessages(prev => ({
      ...prev,
      [activeMode]: [...(prev[activeMode] || []), {
        id: Date.now(),
        type: 'user',
        text: messageText,
        timestamp: new Date(),
      }]
    }));

    setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      let response = 'Обрабатываю...';
      
      if (activeMode === 'ai') {
        try {
          const res = await fetch(`${API_URL}/api/mind/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText, context: { page: location.pathname } })
          });
          if (res.ok) {
            const data = await res.json();
            response = data.response || response;
          }
        } catch (e) {
          response = 'Сейчас проверю...';
        }
      } else if (activeMode === 'trade') {
        response = '💱 Ищу предложения...';
      } else if (activeMode === 'guilds') {
        response = '🛡️ Отправлено в гильдию';
      } else if (activeMode === 'global') {
        response = '🌍 Глобальный чат';
      } else if (activeMode === 'support') {
        response = '🔴 Оператор подключается...';
      }

      setMessages(prev => ({
        ...prev,
        [activeMode]: [...(prev[activeMode] || []), {
          id: Date.now(),
          type: 'bot',
          text: response,
          timestamp: new Date(),
        }]
      }));
      setIsTyping(false);
    }, 800);
  }, [inputValue, activeMode, location.pathname, lang]);

  const currentMessages = messages[activeMode] || [];
  const userLevel = user?.level || 0;

  return (
    <div className="ghost-dock-container" data-testid="glassy-omni-chat">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx,.txt" />

      <AnimatePresence mode="wait">
        {/* IDLE: Полоска */}
        {!isOpen && (
          <motion.div
            key="ghost-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`ghost-line ${statusType === 'analyzing' ? 'analyzing' : ''}`}
            onClick={() => setIsOpen(true)}
            data-testid="chat-idle-strip"
          >
            <div className="line-pulse" />
            <span className="line-label">Chat</span>
          </motion.div>
        )}

        {/* ACTIVE: Ghost Dock */}
        {isOpen && (
          <motion.div
            key="emergent-chat"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`emergent-chat-window ${isEmergencyMode ? 'emergency' : ''}`}
            ref={dockRef}
            data-testid="chat-expanded"
          >
            {/* Header в акриловой шапке */}
            <div className="acrylic-header-content">
              <div className={`emergent-status ${statusType}`} style={{ color: currentMode.color }}>
                <div className="status-dot" style={{ background: currentMode.color }} />
                <span>{getStatusText()}</span>
              </div>
              <button className="emergent-close" onClick={() => setIsOpen(false)} data-testid="chat-close-btn">
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Чёрная зона */}
            <div className="chat-black-zone">
              {/* Input */}
              <div className="emergent-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Сообщение ${currentMode.label}...`}
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
                        <div className="msg-avatar" style={{ borderColor: currentMode.color + '40' }}>
                          <Bot size={14} style={{ color: currentMode.color }} />
                        </div>
                      )}
                      <div className="msg-content">
                        <p>{msg.text}</p>
                        {msg.suggestions && (
                          <div className="suggestions">
                            {msg.suggestions.map((s, i) => (
                              <button key={i} onClick={() => handleSuggestionClick(s)} className="suggestion-btn">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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

              {/* Toolbar с иконками СНИЗУ */}
              <div className="chat-toolbar">
                <div className="toolbar-left">
                  {/* Attach */}
                  <button className={`toolbar-btn ${isUploading ? 'active' : ''}`} onClick={handleFileClick} disabled={isUploading} title="Прикрепить">
                    {isUploading ? <Loader2 size={18} className="spin" /> : <Paperclip size={18} />}
                  </button>
                  
                  {/* Mode Switchers */}
                  {Object.values(MODES).map((mode) => {
                    const isActive = activeMode === mode.id;
                    const isLocked = mode.requiresLevel && userLevel < mode.requiresLevel;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => !isLocked && handleModeChange(mode.id)}
                        className={`toolbar-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        style={isActive ? { background: mode.color + '30', color: mode.color } : {}}
                        title={`${mode.label}${isLocked ? ` (Ур. ${mode.requiresLevel}+)` : ''}`}
                        data-testid={`tab-${mode.id}`}
                      >
                        <mode.icon size={18} />
                        {isLocked && <span className="lock-badge">🔒</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="toolbar-right">
                  {/* Voice */}
                  <button className={`toolbar-btn ${isListening ? 'active listening' : ''}`} onClick={toggleVoiceInput} title="Голос">
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  {/* Send */}
                  <button className="toolbar-btn send" onClick={() => sendMessage()} disabled={!inputValue.trim() || isTyping} title="Отправить" data-testid="send-btn">
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
