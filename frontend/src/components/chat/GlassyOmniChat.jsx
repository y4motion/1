/**
 * GlassyOmniChat - Emergent Style
 * 
 * Функциональные кнопки:
 * - Paperclip: прикрепить файл
 * - AI/Global/Guilds/Trade: переключение режимов
 * - Mic: голосовой ввод (Web Speech API)
 * - Send: отправка сообщения
 * 
 * Контекстная привязка к вкладкам сайта
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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './GlassyOmniChat.css';

const NAV_TABS = [
  { id: 'ai', icon: Bot, label: 'AI Assistant', path: null },
  { id: 'global', icon: Globe, label: 'Global Chat', path: '/community' },
  { id: 'guilds', icon: Shield, label: 'Guilds', path: '/guilds', requiresLevel: 5 },
  { id: 'trade', icon: ShoppingBag, label: 'Trade', path: '/glassy-swap' },
];

// Контекстные подсказки для разных страниц
const PAGE_CONTEXTS = {
  '/pc-builder': {
    greeting: { ru: 'Я помогу собрать ПК. Какой у тебя бюджет?', en: 'I\'ll help build your PC. What\'s your budget?' },
    suggestions: { 
      ru: ['Подбери видеокарту до 50к', 'Проверь совместимость', 'Оптимизируй сборку'],
      en: ['Find GPU under $500', 'Check compatibility', 'Optimize build']
    }
  },
  '/marketplace': {
    greeting: { ru: 'Ищешь что-то конкретное? Помогу найти лучшие предложения.', en: 'Looking for something specific? I\'ll find the best deals.' },
    suggestions: {
      ru: ['Найди RTX 4070', 'Покажи скидки', 'Сравни цены'],
      en: ['Find RTX 4070', 'Show deals', 'Compare prices']
    }
  },
  '/glassy-swap': {
    greeting: { ru: 'Готов к обмену? Проверю рейтинг продавца.', en: 'Ready to trade? I\'ll check seller ratings.' },
    suggestions: {
      ru: ['Безопасная сделка', 'Проверить продавца', 'История обменов'],
      en: ['Safe trade', 'Check seller', 'Trade history']
    }
  },
  '/': {
    greeting: { ru: 'Привет! Чем могу помочь?', en: 'Hi! How can I help?' },
    suggestions: {
      ru: ['Собрать ПК', 'Найти товар', 'Обменяться'],
      en: ['Build PC', 'Find product', 'Trade']
    }
  }
};

const API_URL = '';

export default function GlassyOmniChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [aiStatus, setAiStatus] = useState('idle');
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusType, setStatusType] = useState('idle');
  const [pageContext, setPageContext] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dockRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Определение контекста страницы
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let context = PAGE_CONTEXTS['/'];
    
    if (path.includes('pc-builder') || path.includes('assembly')) {
      context = PAGE_CONTEXTS['/pc-builder'];
      setActiveTab('ai');
      setAiStatus('analyzing');
    } else if (path.includes('marketplace') || path.includes('product') || path.includes('category')) {
      context = PAGE_CONTEXTS['/marketplace'];
      setActiveTab('ai');
      setAiStatus('idle');
    } else if (path.includes('glassy-swap') || path.includes('trade')) {
      context = PAGE_CONTEXTS['/glassy-swap'];
      setActiveTab('trade');
      setAiStatus('idle');
    } else if (path.includes('guilds') || path.includes('community')) {
      setActiveTab('global');
      setAiStatus('idle');
    } else {
      setAiStatus('idle');
    }
    
    setPageContext(context);
  }, [location]);

  // Приветственное сообщение при открытии на новой странице
  useEffect(() => {
    if (isOpen && pageContext && !messages[activeTab]?.length) {
      const lang = language === 'ru' ? 'ru' : 'en';
      const greeting = pageContext.greeting[lang];
      
      // Добавляем приветствие от бота
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [activeTab]: [{
            id: Date.now(),
            type: 'bot',
            text: greeting,
            timestamp: new Date(),
          }]
        }));
      }, 300);
    }
  }, [isOpen, pageContext, activeTab]);

  const getStatusText = useCallback(() => {
    const texts = {
      ru: {
        idle: 'Готов помочь',
        typing: 'AI печатает...',
        analyzing: 'Анализирует контекст...',
        listening: 'Слушаю...',
        uploading: 'Загрузка файла...',
      },
      en: {
        idle: 'Agent is waiting...',
        typing: 'AI is typing...',
        analyzing: 'Analyzing context...',
        listening: 'Listening...',
        uploading: 'Uploading file...',
      }
    };
    const lang = language === 'ru' ? 'ru' : 'en';
    return texts[lang][statusType] || texts[lang].idle;
  }, [statusType, language]);

  useEffect(() => {
    if (isListening) {
      setStatusType('listening');
    } else if (isUploading) {
      setStatusType('uploading');
    } else if (isTyping) {
      setStatusType('typing');
    } else if (aiStatus === 'analyzing') {
      setStatusType('analyzing');
    } else {
      setStatusType('idle');
    }
  }, [isTyping, aiStatus, isListening, isUploading]);

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

  // Инициализация Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'ru' ? 'ru-RU' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  // Голосовой ввод
  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      alert(language === 'ru' ? 'Голосовой ввод не поддерживается' : 'Voice input not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, language]);

  // Прикрепление файла
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Имитация загрузки файла
    setTimeout(() => {
      const fileMsg = {
        id: Date.now(),
        type: 'user',
        text: `📎 ${file.name}`,
        isFile: true,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        timestamp: new Date(),
      };
      
      setMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), fileMsg]
      }));
      
      setIsUploading(false);
      
      // Ответ бота
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), {
            id: Date.now(),
            type: 'bot',
            text: language === 'ru' 
              ? `Получил файл "${file.name}". Анализирую...`
              : `Received file "${file.name}". Analyzing...`,
            timestamp: new Date(),
          }]
        }));
      }, 500);
    }, 1000);
    
    e.target.value = '';
  };

  // Переключение вкладки с навигацией
  const handleTabChange = (tab) => {
    if (tab.requiresLevel && (user?.level || 0) < tab.requiresLevel) {
      return;
    }
    
    setActiveTab(tab.id);
    
    // Навигация на соответствующую страницу
    if (tab.path && location.pathname !== tab.path) {
      navigate(tab.path);
    }
  };

  // Отправка сообщения
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
            context: { 
              page: location.pathname,
              language: language
            }
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
                text: data.response || (language === 'ru' ? 'Понял. Чем ещё помочь?' : 'Got it. Anything else?'),
                timestamp: new Date(),
              }
            ]
          }));
        } else {
          // Fallback ответ
          setMessages(prev => ({
            ...prev,
            [activeTab]: [
              ...(prev[activeTab] || []),
              {
                id: Date.now(),
                type: 'bot',
                text: language === 'ru' ? 'Обрабатываю запрос...' : 'Processing request...',
                timestamp: new Date(),
              }
            ]
          }));
        }
      } catch (error) {
        console.error('Chat error:', error);
        setMessages(prev => ({
          ...prev,
          [activeTab]: [
            ...(prev[activeTab] || []),
            {
              id: Date.now(),
              type: 'bot',
              text: language === 'ru' ? 'Сейчас проверю и отвечу.' : 'Let me check and respond.',
              timestamp: new Date(),
            }
          ]
        }));
      }
    } else {
      // Для других вкладок - имитация
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [activeTab]: [
            ...(prev[activeTab] || []),
            {
              id: Date.now(),
              type: 'bot',
              text: activeTab === 'global' 
                ? (language === 'ru' ? '🌍 Сообщение отправлено в глобальный чат' : '🌍 Message sent to global chat')
                : activeTab === 'trade'
                ? (language === 'ru' ? '💱 Ищу подходящие предложения...' : '💱 Finding matching offers...')
                : (language === 'ru' ? 'Принято!' : 'Received!'),
              timestamp: new Date(),
            }
          ]
        }));
      }, 500);
    }

    setIsTyping(false);
  }, [inputValue, activeTab, location.pathname, language]);

  const currentMessages = messages[activeTab] || [];
  const userLevel = user?.level || 0;

  return (
    <div className="ghost-dock-container" data-testid="glassy-omni-chat">
      {/* Скрытый input для файлов */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

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
                  onChange={(e) => setInputValue(e.target.value)}
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
                  {/* Прикрепить файл */}
                  <button 
                    className={`toolbar-btn ${isUploading ? 'active' : ''}`}
                    onClick={handleFileClick}
                    disabled={isUploading}
                    title={language === 'ru' ? 'Прикрепить файл' : 'Attach file'}
                    data-testid="attach-btn"
                  >
                    {isUploading ? <Loader2 size={18} className="spin" /> : <Paperclip size={18} />}
                  </button>
                  
                  {/* Режимы чата */}
                  {NAV_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isLocked = tab.requiresLevel && userLevel < tab.requiresLevel;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab)}
                        className={`toolbar-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        title={`${tab.label}${isLocked ? ` (Level ${tab.requiresLevel}+)` : ''}`}
                        data-testid={`tab-${tab.id}`}
                      >
                        <tab.icon size={18} />
                        {isLocked && <span className="lock-badge">🔒</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="toolbar-right">
                  {/* Голосовой ввод */}
                  <button 
                    className={`toolbar-btn ${isListening ? 'active listening' : ''}`}
                    onClick={toggleVoiceInput}
                    title={language === 'ru' ? 'Голосовой ввод' : 'Voice input'}
                    data-testid="voice-btn"
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  
                  {/* Отправить */}
                  <button 
                    className="toolbar-btn send"
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    title={language === 'ru' ? 'Отправить' : 'Send'}
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
