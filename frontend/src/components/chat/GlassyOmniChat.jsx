/**
 * GlassyOmniChat - Glassy Brain Edition
 * 
 * Механики:
 * - Context Awareness (привязка к страницам)
 * - Dynamic Dock (левая панель меняется по режиму)
 * - Разделение потоков: AI / Trade / Guilds / Global / Support
 * - Emergency Mode (красный интерфейс поддержки)
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
  X,
  Loader2,
  Headphones,
  Cpu,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './GlassyOmniChat.css';

// --- КОНФИГУРАЦИЯ РЕЖИМОВ ---
const MODES = {
  ai: { id: 'ai', icon: Bot, label: 'Glassy AI', color: '#f97316' },
  trade: { id: 'trade', icon: ShoppingBag, label: 'Market & Swap', color: '#10b981' },
  guilds: { id: 'guilds', icon: Shield, label: 'Guilds', color: '#a855f7', requiresLevel: 5 },
  global: { id: 'global', icon: Globe, label: 'Global', color: '#3b82f6' },
  support: { id: 'support', icon: Headphones, label: 'Support', color: '#ef4444' },
};

// --- MOCK ДАННЫЕ ---
const MOCK_CHATS = {
  trade: [
    { id: 1, name: 'NVIDIA Official', avatar: '🟢', verified: true, status: 'online', lastMsg: 'Your RTX 5090 is ready to ship.' },
    { id: 2, name: 'AlexMiner_99', avatar: '👤', verified: false, status: 'offline', lastMsg: 'Swap: 3060 → 4060?' },
    { id: 3, name: 'HyperPC', avatar: '🔵', verified: true, status: 'online', lastMsg: 'Discount approved.' },
    { id: 4, name: 'CryptoGamer', avatar: '💎', verified: false, status: 'online', lastMsg: 'Mining rig parts?' },
  ],
  guilds: [
    { id: 101, name: 'CyberSamurai', icon: '👹', unread: 5, members: 234 },
    { id: 102, name: 'Overclockers', icon: '⚡', unread: 0, members: 891 },
    { id: 103, name: 'RGB Masters', icon: '🌈', unread: 12, members: 456 },
  ]
};

// --- КОНТЕКСТЫ СТРАНИЦ ---
const PAGE_CONTEXTS = {
  'pc-builder': {
    mode: 'ai',
    greeting: { 
      ru: 'Система активна. Я проанализировал твою сборку. Готов помочь с совместимостью.', 
      en: 'System active. I analyzed your build. Ready to help with compatibility.' 
    },
    suggestions: { 
      ru: ['Проверь совместимость', 'Оптимизируй бюджет', 'Найди альтернативу'],
      en: ['Check compatibility', 'Optimize budget', 'Find alternative']
    },
    status: 'analyzing'
  },
  'marketplace': {
    mode: 'trade',
    greeting: { 
      ru: 'Маркет активен. Вижу товары вокруг тебя. Найти лучшую цену?', 
      en: 'Market active. I see products around you. Find best price?' 
    },
    suggestions: {
      ru: ['Сравни цены', 'Покажи скидки', 'Проверь продавца'],
      en: ['Compare prices', 'Show deals', 'Check seller']
    },
    status: 'idle'
  },
  'product': {
    mode: 'trade',
    greeting: { 
      ru: 'Анализирую этот товар... Хочешь узнать историю цен или отзывы?', 
      en: 'Analyzing this product... Want price history or reviews?' 
    },
    suggestions: {
      ru: ['История цен', 'Читать отзывы', 'Найти дешевле'],
      en: ['Price history', 'Read reviews', 'Find cheaper']
    },
    status: 'analyzing'
  },
  'glassy-swap': {
    mode: 'trade',
    greeting: { 
      ru: 'Режим обмена. Проверю рейтинг любого продавца.', 
      en: 'Swap mode. I\'ll check any seller\'s rating.' 
    },
    suggestions: {
      ru: ['Безопасная сделка', 'Проверить продавца', 'Мои обмены'],
      en: ['Safe trade', 'Check seller', 'My swaps']
    },
    status: 'idle'
  },
  'default': {
    mode: 'ai',
    greeting: { 
      ru: 'Привет! Я Glassy Mind. Чем могу помочь?', 
      en: 'Hi! I\'m Glassy Mind. How can I help?' 
    },
    suggestions: {
      ru: ['Собрать ПК', 'Найти товар', 'Обменяться'],
      en: ['Build PC', 'Find product', 'Trade']
    },
    status: 'idle'
  }
};

const API_URL = '';

export default function GlassyOmniChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('ai');
  const [activeSubChat, setActiveSubChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusType, setStatusType] = useState('idle');
  const [pageContext, setPageContext] = useState(PAGE_CONTEXTS.default);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  
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
            text: pageContext.greeting[lang],
            isGreeting: true,
            suggestions: pageContext.suggestions[lang],
            timestamp: new Date(),
          }]
        }));
      }, 300);
    }
  }, [isOpen, pageContext, activeMode, lang]);

  // Status text
  const getStatusText = useCallback(() => {
    const texts = {
      ru: {
        idle: 'Система готова',
        typing: 'Печатает...',
        analyzing: 'Анализирует...',
        listening: 'Слушаю...',
        uploading: 'Загрузка...',
        emergency: '🔴 ПРИОРИТЕТНАЯ ЛИНИЯ',
      },
      en: {
        idle: 'System ready',
        typing: 'Typing...',
        analyzing: 'Analyzing...',
        listening: 'Listening...',
        uploading: 'Uploading...',
        emergency: '🔴 PRIORITY LINE',
      }
    };
    if (isEmergencyMode) return texts[lang].emergency;
    return texts[lang][statusType] || texts[lang].idle;
  }, [statusType, lang, isEmergencyMode]);

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
  }, [messages, activeMode, activeSubChat]);

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
            text: lang === 'ru' ? `Файл "${file.name}" получен. Анализирую...` : `File "${file.name}" received. Analyzing...`,
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
    setActiveSubChat(null);
    setIsEmergencyMode(modeId === 'support');
    
    // Навигация для некоторых режимов
    if (modeId === 'trade' && !location.pathname.includes('swap') && !location.pathname.includes('marketplace')) {
      navigate('/glassy-swap');
    }
  };

  const handleSubChatSelect = (chatId) => {
    setActiveSubChat(chatId);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => sendMessage(suggestion), 100);
  };

  const clearContext = () => {
    setMessages(prev => ({ ...prev, [activeMode]: [] }));
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

    // Имитация ответа
    setTimeout(async () => {
      let response = lang === 'ru' ? 'Обрабатываю запрос...' : 'Processing...';
      
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
          response = lang === 'ru' ? 'Сейчас проверю и отвечу.' : 'Let me check.';
        }
      } else if (activeMode === 'trade') {
        response = lang === 'ru' ? '💱 Ищу подходящие предложения...' : '💱 Finding offers...';
      } else if (activeMode === 'guilds') {
        response = lang === 'ru' ? '🛡️ Сообщение отправлено в гильдию' : '🛡️ Message sent to guild';
      } else if (activeMode === 'global') {
        response = lang === 'ru' ? '🌍 Отправлено в глобальный чат' : '🌍 Sent to global chat';
      } else if (activeMode === 'support') {
        response = lang === 'ru' ? '🔴 Оператор подключится в течение минуты...' : '🔴 Operator will connect shortly...';
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
  const currentMode = MODES[activeMode];

  // --- RENDER SIDEBAR ---
  const renderSidebar = () => {
    if (activeMode === 'trade') {
      return MOCK_CHATS.trade.map((chat) => (
        <button
          key={chat.id}
          onClick={() => handleSubChatSelect(chat.id)}
          className={`sidebar-item ${activeSubChat === chat.id ? 'active' : ''}`}
          title={chat.name}
        >
          <span className="sidebar-avatar">{chat.avatar}</span>
          {chat.verified && <CheckCircle2 size={10} className="verified-badge" />}
        </button>
      ));
    }
    
    if (activeMode === 'guilds') {
      return MOCK_CHATS.guilds.map((guild) => (
        <button
          key={guild.id}
          onClick={() => handleSubChatSelect(guild.id)}
          className={`sidebar-item ${activeSubChat === guild.id ? 'active' : ''}`}
          title={guild.name}
        >
          <span className="sidebar-avatar">{guild.icon}</span>
          {guild.unread > 0 && <span className="unread-badge">{guild.unread}</span>}
        </button>
      ));
    }
    
    if (activeMode === 'ai') {
      return (
        <>
          <div className="sidebar-item ai-brain">
            <Cpu size={20} />
          </div>
          <button className="sidebar-item" onClick={clearContext} title={lang === 'ru' ? 'Сбросить контекст' : 'Clear context'}>
            <RotateCcw size={16} />
          </button>
          <button className="sidebar-item" title={lang === 'ru' ? 'Сохранить' : 'Save'}>
            <Save size={16} />
          </button>
        </>
      );
    }

    if (activeMode === 'support') {
      return (
        <div className="sidebar-item support-pulse">
          <AlertCircle size={20} />
        </div>
      );
    }

    return null;
  };

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
            <span className="line-label">SYSTEM ONLINE</span>
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
            {/* Header */}
            <div className="acrylic-header-content">
              <div className={`emergent-status ${statusType}`} style={{ color: isEmergencyMode ? '#ef4444' : currentMode.color }}>
                <div className="status-dot" style={{ background: isEmergencyMode ? '#ef4444' : currentMode.color }} />
                <span>{getStatusText()}</span>
              </div>
              <button className="emergent-close" onClick={() => setIsOpen(false)} data-testid="chat-close-btn">
                <X size={14} />
              </button>
            </div>

            {/* Чёрная зона */}
            <div className="chat-black-zone">
              <div className="chat-layout">
                {/* Left Sidebar */}
                <div className="chat-sidebar">
                  {/* Mode Switchers */}
                  <div className="mode-switchers">
                    {Object.values(MODES).map((mode) => {
                      const isActive = activeMode === mode.id;
                      const isLocked = mode.requiresLevel && userLevel < mode.requiresLevel;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => !isLocked && handleModeChange(mode.id)}
                          className={`mode-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                          style={{ '--mode-color': mode.color }}
                          title={`${mode.label}${isLocked ? ` (Lvl ${mode.requiresLevel}+)` : ''}`}
                        >
                          <mode.icon size={18} />
                          {isLocked && <span className="lock-badge">🔒</span>}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="sidebar-divider" />
                  
                  {/* Dynamic Icons */}
                  <div className="sidebar-dynamic">
                    {renderSidebar()}
                  </div>
                </div>

                {/* Main Chat Area */}
                <div className="chat-main">
                  {/* Channel Title */}
                  <div className="channel-title" style={{ color: currentMode.color }}>
                    // {currentMode.label.toUpperCase()} CHANNEL
                  </div>

                  {/* Input */}
                  <div className="emergent-input-area">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={`${lang === 'ru' ? 'Сообщение' : 'Message'} ${currentMode.label}...`}
                      data-testid="chat-input"
                    />
                  </div>

                  {/* Messages */}
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

                  {/* Toolbar */}
                  <div className="chat-toolbar">
                    <div className="toolbar-left">
                      <button className={`toolbar-btn ${isUploading ? 'active' : ''}`} onClick={handleFileClick} disabled={isUploading}>
                        {isUploading ? <Loader2 size={18} className="spin" /> : <Paperclip size={18} />}
                      </button>
                    </div>
                    <div className="toolbar-right">
                      <button className={`toolbar-btn ${isListening ? 'active listening' : ''}`} onClick={toggleVoiceInput}>
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                      <button className="toolbar-btn send" onClick={() => sendMessage()} disabled={!inputValue.trim() || isTyping}>
                        <ArrowUp size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
