/**
 * GlassyOmniChat - Strict Context Isolation
 * 
 * Каждая вкладка имеет УНИКАЛЬНЫЙ контент:
 * - AI: Проактивный ангел, советы по сборке
 * - Trade: Пассивный маркет, диалоги с продавцами
 * - Guilds: Чат гильдии
 * - Support: Реактивная поддержка, ждёт жалобы
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
  Package,
  AlertTriangle,
  Users,
  Calendar,
  Vote,
  MessageSquare,
  History,
  UserPlus,
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

// --- СТРОГО ИЗОЛИРОВАННЫЕ КОНТЕКСТЫ ДЛЯ КАЖДОЙ ВКЛАДКИ ---
const CONTEXT_CONFIG = {
  ai: {
    // ПРОАКТИВНЫЙ - единственный кто пишет первым
    proactive: true,
    initialMessage: null, // Устанавливается динамически на основе страницы
    placeholder: 'Спросить Glassy AI...',
    chips: [
      { text: 'Оптимизировать бюджет', icon: null },
      { text: 'Проверить совместимость', icon: null },
      { text: 'Найти альтернативу', icon: null },
    ],
    emptyState: null,
  },
  trade: {
    // ПАССИВНЫЙ - список диалогов
    proactive: false,
    initialMessage: null,
    placeholder: 'Написать продавцу...',
    chips: [
      { text: 'Статус заказа', icon: Package },
      { text: 'Открыть спор', icon: AlertTriangle },
      { text: 'История покупок', icon: History },
    ],
    emptyState: 'Выберите продавца или товар для начала диалога',
  },
  guilds: {
    // ЧАТ ГИЛЬДИИ
    proactive: false,
    initialMessage: null,
    placeholder: 'Сообщение гильдии...',
    chips: [
      { text: 'Создать пати', icon: Users },
      { text: 'Доска объявлений', icon: Calendar },
      { text: 'Голосование', icon: Vote },
    ],
    emptyState: 'Выберите гильдию для общения',
  },
  global: {
    // ГЛОБАЛЬНЫЙ ЧАТ
    proactive: false,
    initialMessage: null,
    placeholder: 'Глобальное сообщение...',
    chips: [
      { text: 'Найти игроков', icon: UserPlus },
      { text: 'Объявление', icon: MessageSquare },
    ],
    emptyState: 'Глобальный чат сообщества',
  },
  support: {
    // СТРОГО РЕАКТИВНЫЙ - молчит и ждёт
    proactive: false,
    initialMessage: 'Служба поддержки Glassy. Опишите проблему или выберите категорию.',
    placeholder: 'Опишите вашу проблему...',
    chips: [
      { text: 'Не пришёл товар', icon: Package },
      { text: 'Баг на сайте', icon: AlertTriangle },
      { text: 'Позвать оператора', icon: Headphones },
    ],
    emptyState: null,
  },
};

// --- AI КОНТЕКСТЫ ПО СТРАНИЦАМ (только для AI вкладки) ---
const AI_PAGE_CONTEXTS = {
  'pc-builder': {
    greeting: 'Система активна. Я проанализировал твою сборку. Готов помочь с совместимостью.',
    chips: ['Проверить совместимость', 'Оптимизировать бюджет', 'Найти альтернативу'],
  },
  'marketplace': {
    greeting: 'Вижу товары вокруг тебя. Помогу найти лучшую цену или сравнить характеристики.',
    chips: ['Сравнить цены', 'Найти похожее', 'Проверить отзывы'],
  },
  'product': {
    greeting: 'Анализирую этот товар. Могу показать историю цен или найти альтернативы.',
    chips: ['История цен', 'Альтернативы', 'Отзывы'],
  },
  'default': {
    greeting: 'Привет! Я Glassy Mind. Чем могу помочь?',
    chips: ['Собрать ПК', 'Найти товар', 'Помощь'],
  },
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
  const [lineStatus, setLineStatus] = useState('idle');
  const [aiContext, setAiContext] = useState(AI_PAGE_CONTEXTS.default);
  const [hasGreeted, setHasGreeted] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dockRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const currentMode = MODES[activeMode];
  const currentContext = CONTEXT_CONFIG[activeMode];
  const currentMessages = messages[activeMode] || [];
  const userLevel = user?.level || 0;
  const lineConfig = STATUS_CONFIG[lineStatus] || STATUS_CONFIG.idle;

  // --- Определение AI контекста по странице ---
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let context = AI_PAGE_CONTEXTS.default;
    let status = 'idle';
    
    if (path.includes('pc-builder') || path.includes('assembly')) {
      context = AI_PAGE_CONTEXTS['pc-builder'];
      status = 'ai_processing';
    } else if (path.includes('product') || path.includes('category')) {
      context = AI_PAGE_CONTEXTS['product'];
      status = 'ai_processing';
    } else if (path.includes('marketplace')) {
      context = AI_PAGE_CONTEXTS['marketplace'];
      status = 'idle';
    }
    
    setAiContext(context);
    setLineStatus(status);
  }, [location]);

  // --- AI приветствие (ТОЛЬКО для AI вкладки, ТОЛЬКО один раз) ---
  useEffect(() => {
    if (isOpen && activeMode === 'ai' && !hasGreeted.ai && aiContext) {
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          ai: [{
            id: Date.now(),
            type: 'bot',
            text: aiContext.greeting,
            chips: aiContext.chips,
            timestamp: new Date(),
          }]
        }));
        setHasGreeted(prev => ({ ...prev, ai: true }));
      }, 300);
    }
  }, [isOpen, activeMode, aiContext, hasGreeted.ai]);

  // --- Support приветствие (ТОЛЬКО при первом открытии Support) ---
  useEffect(() => {
    if (isOpen && activeMode === 'support' && !hasGreeted.support) {
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          support: [{
            id: Date.now(),
            type: 'bot',
            text: CONTEXT_CONFIG.support.initialMessage,
            chips: CONTEXT_CONFIG.support.chips.map(c => c.text),
            timestamp: new Date(),
          }]
        }));
        setHasGreeted(prev => ({ ...prev, support: true }));
      }, 300);
    }
  }, [isOpen, activeMode, hasGreeted.support]);

  // --- Фокус на input ---
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeMode]);

  // --- Scroll to bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMode]);

  // --- Keyboard & Click outside ---
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

  // --- Web Speech API ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.onresult = (event) => {
        setInputValue(prev => prev + event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

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
    }, 1000);
    e.target.value = '';
  };

  const handleModeChange = (modeId) => {
    if (MODES[modeId].requiresLevel && userLevel < MODES[modeId].requiresLevel) return;
    setActiveMode(modeId);
    
    // Обновляем статус полоски
    if (modeId === 'support') {
      setLineStatus('warning');
    } else if (modeId === 'guilds') {
      setLineStatus('guild');
    } else if (modeId === 'trade') {
      setLineStatus('message');
    } else {
      setLineStatus(location.pathname.includes('pc-builder') ? 'ai_processing' : 'idle');
    }
  };

  const handleChipClick = (chipText) => {
    setInputValue(chipText);
    setTimeout(() => sendMessage(chipText), 100);
  };

  const getStatusText = useCallback(() => {
    const texts = {
      ai: 'Анализирует...',
      trade: 'Маркет',
      guilds: 'Гильдия',
      global: 'Глобальный',
      support: 'Поддержка',
    };
    return texts[activeMode] || 'Готов';
  }, [activeMode]);

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
      let response = '';
      let chips = null;
      
      // ИЗОЛИРОВАННЫЕ ОТВЕТЫ ДЛЯ КАЖДОГО РЕЖИМА
      switch (activeMode) {
        case 'ai':
          try {
            const res = await fetch(`${API_URL}/api/mind/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: messageText, context: { page: location.pathname } })
            });
            if (res.ok) {
              const data = await res.json();
              response = data.response || 'Сейчас проверю...';
            } else {
              response = 'Обрабатываю запрос...';
            }
          } catch (e) {
            response = 'Анализирую данные...';
          }
          chips = aiContext.chips;
          break;
          
        case 'trade':
          response = '💱 Проверяю информацию по вашему запросу...';
          chips = ['Статус заказа', 'Связаться с продавцом'];
          break;
          
        case 'guilds':
          response = '🛡️ Сообщение отправлено в гильдию';
          chips = ['Участники онлайн', 'События'];
          break;
          
        case 'global':
          response = '🌍 Сообщение в глобальном чате';
          break;
          
        case 'support':
          response = '🎧 Ваше обращение зарегистрировано. Оператор подключится в ближайшее время.';
          chips = ['Уточнить статус', 'Позвать оператора'];
          break;
          
        default:
          response = 'Принято';
      }

      setMessages(prev => ({
        ...prev,
        [activeMode]: [...(prev[activeMode] || []), {
          id: Date.now(),
          type: 'bot',
          text: response,
          chips: chips,
          timestamp: new Date(),
        }]
      }));
      setIsTyping(false);
    }, 800);
  }, [inputValue, activeMode, location.pathname, aiContext]);

  // --- RENDER: Уникальные чипсы для каждого режима ---
  const renderChips = () => {
    const chips = currentContext.chips;
    if (!chips || chips.length === 0) return null;
    
    return (
      <div className="context-chips">
        {chips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleChipClick(typeof chip === 'string' ? chip : chip.text)}
            className="chip-btn"
            style={{ borderColor: currentMode.color + '40' }}
          >
            {chip.icon && <chip.icon size={12} />}
            <span>{typeof chip === 'string' ? chip : chip.text}</span>
          </button>
        ))}
      </div>
    );
  };

  // --- RENDER: Empty state для пассивных вкладок ---
  const renderEmptyState = () => {
    if (currentMessages.length > 0) return null;
    if (!currentContext.emptyState) return null;
    
    return (
      <div className="empty-state" style={{ color: currentMode.color + '80' }}>
        <currentMode.icon size={32} style={{ opacity: 0.3 }} />
        <p>{currentContext.emptyState}</p>
      </div>
    );
  };

  return (
    <div className="ghost-dock-container" data-testid="glassy-omni-chat">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx,.txt" />

      <AnimatePresence mode="wait">
        {/* IDLE: Призрачный Горизонт */}
        {!isOpen && (
          <motion.div
            key="ghost-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ghost-line-container"
            onClick={() => setIsOpen(true)}
            data-testid="chat-idle-strip"
          >
            <div 
              className={`ghost-line ${lineConfig.animation}`}
              style={{ 
                background: `linear-gradient(90deg, transparent 0%, ${lineConfig.color} 30%, ${lineConfig.color} 70%, transparent 100%)`,
                boxShadow: lineConfig.glow 
              }}
            />
            <span className="ghost-line-text">{lineConfig.text}</span>
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
            className={`emergent-chat-window ${activeMode === 'support' ? 'emergency' : ''}`}
            ref={dockRef}
            data-testid="chat-expanded"
          >
            {/* Header */}
            <div className="acrylic-header-content">
              <div className="emergent-status" style={{ color: currentMode.color }}>
                <div className="status-dot" style={{ background: currentMode.color }} />
                <span>{getStatusText()}</span>
              </div>
              <button className="emergent-close" onClick={() => setIsOpen(false)} data-testid="chat-close-btn">
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Чёрная зона */}
            <div className="chat-black-zone">
              {/* Input с уникальным placeholder */}
              <div className="emergent-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={currentContext.placeholder}
                  data-testid="chat-input"
                />
              </div>

              {/* Messages */}
              <div className="emergent-messages">
                {renderEmptyState()}
                
                {currentMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`emergent-msg ${msg.type}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {msg.type === 'bot' && (
                      <div className="msg-avatar" style={{ borderColor: currentMode.color + '40' }}>
                        <currentMode.icon size={14} style={{ color: currentMode.color }} />
                      </div>
                    )}
                    <div className="msg-content">
                      <p>{msg.text}</p>
                      {msg.chips && (
                        <div className="msg-chips">
                          {msg.chips.map((chip, i) => (
                            <button key={i} onClick={() => handleChipClick(chip)} className="chip-btn-small">
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <div className="emergent-msg bot">
                    <div className="msg-avatar" style={{ borderColor: currentMode.color + '40' }}>
                      <currentMode.icon size={14} style={{ color: currentMode.color }} />
                    </div>
                    <div className="typing-indicator"><span /><span /><span /></div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Контекстные чипсы */}
              {renderChips()}

              {/* Toolbar */}
              <div className="chat-toolbar">
                <div className="toolbar-left">
                  <button className={`toolbar-btn ${isUploading ? 'active' : ''}`} onClick={handleFileClick} disabled={isUploading} title="Прикрепить">
                    {isUploading ? <Loader2 size={18} className="spin" /> : <Paperclip size={18} />}
                  </button>
                  
                  {Object.values(MODES).map((mode) => {
                    const isActive = activeMode === mode.id;
                    const isLocked = mode.requiresLevel && userLevel < mode.requiresLevel;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => !isLocked && handleModeChange(mode.id)}
                        className={`toolbar-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${mode.id === 'support' && isActive ? 'support-active' : ''}`}
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
                  <button className={`toolbar-btn ${isListening ? 'active listening' : ''}`} onClick={toggleVoiceInput} title="Голос">
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
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
