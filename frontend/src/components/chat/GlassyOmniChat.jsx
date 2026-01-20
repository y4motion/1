/**
 * GlassyOmniChat - Ghost Dock v2.0
 * 
 * Полная интеграция с Glassy Mind:
 * - Подписка на Rules Engine события
 * - Context Data Injection (товар, сборка)
 * - State Persistence (черновики между табами)
 * - Sound Design hooks
 * - Hotkeys (Ctrl+Space)
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
  Share2,
  CheckCircle,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  playClickSound, 
  playHoverSound, 
  playMessageSound,
  playOpenSound,
  playCloseSound 
} from '../../utils/glassySound';
import './GlassyOmniChat.css';

// --- КОНФИГУРАЦИЯ СТАТУСОВ ПОЛОСКИ ---
const STATUS_CONFIG = {
  idle: {
    color: 'rgba(255, 255, 255, 0.9)',
    glow: '0 0 25px rgba(255, 255, 255, 0.5)',
    text: 'SYSTEM ONLINE',
    animation: 'ghost-breath',
  },
  ai_processing: {
    color: 'rgba(255, 159, 67, 0.9)',
    glow: '0 0 30px rgba(255, 159, 67, 0.5)',
    text: 'NEURAL SYNC...',
    animation: 'shimmer',
  },
  ai_ready: {
    color: 'rgba(249, 115, 22, 1)',
    glow: '0 0 40px rgba(249, 115, 22, 0.7)',
    text: 'INSIGHT AVAILABLE',
    animation: 'pulse-fast',
  },
  message: {
    color: 'rgba(52, 211, 153, 0.95)',
    glow: '0 0 30px rgba(52, 211, 153, 0.5)',
    text: 'INCOMING TRANSMISSION',
    animation: 'heartbeat',
  },
  guild: {
    color: 'rgba(168, 85, 247, 0.95)',
    glow: '0 0 30px rgba(168, 85, 247, 0.5)',
    text: 'GUILD SIGNAL',
    animation: 'pulse-fast',
  },
  warning: {
    color: 'rgba(244, 63, 94, 0.95)',
    glow: '0 0 30px rgba(244, 63, 94, 0.5)',
    text: 'SUPPORT ACTIVE',
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
const getContextConfig = (pageContext) => ({
  ai: {
    proactive: true,
    placeholder: 'Спросить Glassy AI...',
    chips: pageContext?.pcBuild ? [
      { text: 'Проверить мою сборку', icon: CheckCircle, action: 'check_build' },
      { text: 'Оптимизировать бюджет', icon: null, action: 'optimize' },
      { text: 'Найти альтернативу', icon: null, action: 'alternative' },
    ] : [
      { text: 'Собрать ПК', icon: null },
      { text: 'Найти товар', icon: null },
      { text: 'Помощь', icon: null },
    ],
    emptyState: null,
  },
  trade: {
    proactive: false,
    placeholder: pageContext?.product 
      ? `Написать о "${pageContext.product.name?.slice(0, 30)}..."` 
      : 'Написать продавцу...',
    chips: pageContext?.product ? [
      { text: `Спросить о ${pageContext.product.name?.slice(0, 20) || 'товаре'}`, icon: MessageSquare, action: 'ask_product' },
      { text: 'Предложить цену', icon: null, action: 'offer_price' },
    ] : [
      { text: 'Статус заказа', icon: Package },
      { text: 'Открыть спор', icon: AlertTriangle },
      { text: 'История покупок', icon: History },
    ],
    emptyState: 'Выберите продавца или товар для начала диалога',
  },
  guilds: {
    proactive: false,
    placeholder: 'Сообщение гильдии...',
    chips: [
      { text: 'Создать пати', icon: Users },
      { text: 'Доска объявлений', icon: Calendar },
      { text: 'Голосование', icon: Vote },
      ...(pageContext?.pcBuild ? [{ text: 'Поделиться сборкой', icon: Share2, action: 'share_build' }] : []),
    ],
    emptyState: 'Выберите гильдию для общения',
  },
  global: {
    proactive: false,
    placeholder: 'Глобальное сообщение...',
    chips: [
      { text: 'Найти игроков', icon: UserPlus },
      { text: 'Объявление', icon: MessageSquare },
    ],
    emptyState: 'Глобальный чат сообщества',
  },
  support: {
    proactive: false,
    initialMessage: 'Служба поддержки Glassy. Опишите проблему или выберите категорию.',
    placeholder: 'Опишите вашу проблему...',
    chips: [
      { text: 'Не пришёл товар', icon: Package },
      { text: 'Баг на сайте', icon: AlertTriangle, action: 'report_bug' },
      { text: 'Скриншот проблемы', icon: Camera, action: 'attach_screenshot' },
      { text: 'Позвать оператора', icon: Headphones },
    ],
    emptyState: null,
  },
});

// --- AI КОНТЕКСТЫ ПО СТРАНИЦАМ ---
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

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function GlassyOmniChat() {
  // --- CORE STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('ai');
  const [messages, setMessages] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lineStatus, setLineStatus] = useState('idle');
  const [aiContext, setAiContext] = useState(AI_PAGE_CONTEXTS.default);
  const [hasGreeted, setHasGreeted] = useState({});
  
  // --- STATE PERSISTENCE: Черновики для каждого таба ---
  const [drafts, setDrafts] = useState({
    ai: '',
    trade: '',
    guilds: '',
    global: '',
    support: '',
  });
  
  // --- PAGE CONTEXT DATA (товар, сборка) ---
  const [pageContext, setPageContext] = useState({
    product: null,
    pcBuild: null,
  });
  
  // --- RULES ENGINE STATE ---
  const [pendingInsight, setPendingInsight] = useState(null);
  
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
  const currentContext = getContextConfig(pageContext)[activeMode];
  const currentMessages = messages[activeMode] || [];
  const userLevel = user?.level || 0;
  const lineConfig = STATUS_CONFIG[lineStatus] || STATUS_CONFIG.idle;
  const inputValue = drafts[activeMode] || '';

  // --- HOTKEYS: Ctrl+Space / Cmd+/ для открытия/закрытия ---
  useEffect(() => {
    const handleHotkey = (e) => {
      if ((e.ctrlKey && e.code === 'Space') || (e.metaKey && e.code === 'Slash')) {
        e.preventDefault();
        playClickSound();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, [isOpen]);

  // --- RULES ENGINE: Подписка на события Glassy Mind ---
  useEffect(() => {
    const handleRulesEvent = (event) => {
      const { type, data } = event.detail || {};
      
      switch (type) {
        case 'READY_TO_INTERVENE':
          // Янтарная полоска + текст INSIGHT AVAILABLE
          setLineStatus('ai_ready');
          setPendingInsight(data?.message || 'Вижу сложности. Подсказать?');
          playMessageSound();
          
          // Если чат открыт в AI режиме - сразу показать сообщение
          if (isOpen && activeMode === 'ai' && data?.message) {
            setMessages(prev => ({
              ...prev,
              ai: [...(prev.ai || []), {
                id: Date.now(),
                type: 'bot',
                text: data.message,
                chips: data.chips || ['Да, помоги', 'Нет, я разберусь'],
                timestamp: new Date(),
                isInsight: true,
              }]
            }));
          }
          break;
          
        case 'NEW_MESSAGE':
          setLineStatus('message');
          playMessageSound();
          break;
          
        case 'GUILD_ACTIVITY':
          if (!isOpen) setLineStatus('guild');
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('glassyMindEvent', handleRulesEvent);
    return () => window.removeEventListener('glassyMindEvent', handleRulesEvent);
  }, [isOpen, activeMode]);

  // --- PAGE CONTEXT: Извлечение данных страницы ---
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let context = AI_PAGE_CONTEXTS.default;
    let status = 'idle';
    let newPageContext = { product: null, pcBuild: null };
    
    if (path.includes('pc-builder') || path.includes('assembly')) {
      context = AI_PAGE_CONTEXTS['pc-builder'];
      status = 'ai_processing';
      
      // Попытка получить текущую сборку из localStorage или window
      try {
        const savedBuild = localStorage.getItem('pcBuilderState');
        if (savedBuild) {
          newPageContext.pcBuild = JSON.parse(savedBuild);
        }
      } catch (e) {}
      
    } else if (path.includes('product/')) {
      context = AI_PAGE_CONTEXTS['product'];
      status = 'ai_processing';
      
      // Получить данные товара из window (если ProductDetailPage их экспортирует)
      if (window.__GLASSY_PRODUCT_CONTEXT__) {
        newPageContext.product = window.__GLASSY_PRODUCT_CONTEXT__;
      }
      
    } else if (path.includes('marketplace') || path.includes('category')) {
      context = AI_PAGE_CONTEXTS['marketplace'];
      status = 'idle';
    }
    
    setAiContext(context);
    setPageContext(newPageContext);
    
    // Не перезаписывать статус если есть pending insight
    if (!pendingInsight) {
      setLineStatus(status);
    }
  }, [location, pendingInsight]);

  // --- AI GREETING (только для AI вкладки, только один раз) ---
  useEffect(() => {
    if (isOpen && activeMode === 'ai' && !hasGreeted.ai && aiContext) {
      setTimeout(() => {
        const greetingMessage = {
          id: Date.now(),
          type: 'bot',
          text: aiContext.greeting,
          chips: aiContext.chips,
          timestamp: new Date(),
        };
        
        // Если есть pending insight - добавить его тоже
        const messagesToAdd = pendingInsight 
          ? [greetingMessage, {
              id: Date.now() + 1,
              type: 'bot',
              text: pendingInsight,
              chips: ['Да, помоги', 'Нет, я разберусь'],
              timestamp: new Date(),
              isInsight: true,
            }]
          : [greetingMessage];
        
        setMessages(prev => ({
          ...prev,
          ai: messagesToAdd
        }));
        setHasGreeted(prev => ({ ...prev, ai: true }));
        setPendingInsight(null);
      }, 300);
    }
  }, [isOpen, activeMode, aiContext, hasGreeted.ai, pendingInsight]);

  // --- SUPPORT GREETING ---
  useEffect(() => {
    if (isOpen && activeMode === 'support' && !hasGreeted.support) {
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          support: [{
            id: Date.now(),
            type: 'bot',
            text: getContextConfig(pageContext).support.initialMessage,
            chips: getContextConfig(pageContext).support.chips.map(c => c.text),
            timestamp: new Date(),
          }]
        }));
        setHasGreeted(prev => ({ ...prev, support: true }));
      }, 300);
    }
  }, [isOpen, activeMode, hasGreeted.support, pageContext]);

  // --- FOCUS INPUT ---
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeMode]);

  // --- SCROLL TO BOTTOM ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMode]);

  // --- CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && dockRef.current && !dockRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // --- WEB SPEECH API ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setDrafts(prev => ({ ...prev, [activeMode]: (prev[activeMode] || '') + transcript }));
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [activeMode]);

  // --- INPUT HANDLER (с сохранением черновика) ---
  const handleInputChange = useCallback((e) => {
    setDrafts(prev => ({ ...prev, [activeMode]: e.target.value }));
  }, [activeMode]);

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) return;
    playClickSound();
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleFileClick = () => {
    playClickSound();
    fileInputRef.current?.click();
  };

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
    playClickSound();
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

  // --- CHIP ACTIONS ---
  const handleChipClick = useCallback((chip) => {
    const chipText = typeof chip === 'string' ? chip : chip.text;
    const chipAction = typeof chip === 'object' ? chip.action : null;
    
    playClickSound();
    
    // Специальные действия
    switch (chipAction) {
      case 'check_build':
        if (pageContext.pcBuild) {
          const buildSummary = `Моя сборка: ${JSON.stringify(pageContext.pcBuild, null, 2)}`;
          setDrafts(prev => ({ ...prev, [activeMode]: buildSummary }));
          setTimeout(() => sendMessage(buildSummary), 100);
        } else {
          sendMessage('Проверь мою текущую сборку на совместимость');
        }
        return;
        
      case 'share_build':
        if (pageContext.pcBuild) {
          sendMessage(`🖥️ Делюсь сборкой:\n${JSON.stringify(pageContext.pcBuild, null, 2)}`);
        }
        return;
        
      case 'ask_product':
        if (pageContext.product) {
          sendMessage(`Вопрос о товаре "${pageContext.product.name}"`);
        }
        return;
        
      case 'report_bug':
        sendMessage('Хочу сообщить о баге на сайте');
        return;
        
      case 'attach_screenshot':
        handleFileClick();
        return;
        
      default:
        setDrafts(prev => ({ ...prev, [activeMode]: chipText }));
        setTimeout(() => sendMessage(chipText), 100);
    }
  }, [pageContext, activeMode]);

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

  // --- SEND MESSAGE ---
  const sendMessage = useCallback(async (text) => {
    const messageText = text || drafts[activeMode];
    if (!messageText?.trim()) return;

    playClickSound();
    
    setMessages(prev => ({
      ...prev,
      [activeMode]: [...(prev[activeMode] || []), {
        id: Date.now(),
        type: 'user',
        text: messageText,
        timestamp: new Date(),
      }]
    }));

    setDrafts(prev => ({ ...prev, [activeMode]: '' }));
    setIsTyping(true);

    setTimeout(async () => {
      let response = '';
      let chips = null;
      
      switch (activeMode) {
        case 'ai':
          try {
            const res = await fetch(`${API_URL}/api/mind/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                message: messageText, 
                context: { 
                  page: location.pathname,
                  product: pageContext.product,
                  pcBuild: pageContext.pcBuild,
                } 
              })
            });
            if (res.ok) {
              const data = await res.json();
              response = data.response || 'Сейчас проверю...';
              chips = data.chips;
            } else {
              response = 'Обрабатываю запрос...';
            }
          } catch (e) {
            response = 'Анализирую данные...';
          }
          chips = chips || aiContext.chips;
          break;
          
        case 'trade':
          response = pageContext.product 
            ? `💱 Сообщение о "${pageContext.product.name}" отправлено продавцу`
            : '💱 Проверяю информацию по вашему запросу...';
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

      playMessageSound();
      
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
  }, [drafts, activeMode, location.pathname, aiContext, pageContext]);

  // --- RENDER: Контекстные чипсы ---
  const renderChips = () => {
    const chips = currentContext?.chips;
    if (!chips || chips.length === 0) return null;
    
    return (
      <div className="context-chips">
        {chips.map((chip, i) => {
          const ChipIcon = typeof chip === 'object' ? chip.icon : null;
          const chipText = typeof chip === 'string' ? chip : chip.text;
          
          return (
            <button
              key={i}
              onClick={() => handleChipClick(chip)}
              onMouseEnter={playHoverSound}
              className="chip-btn"
              style={{ borderColor: currentMode.color + '40' }}
              data-testid={`chip-${i}`}
            >
              {ChipIcon && <ChipIcon size={12} />}
              <span>{chipText}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // --- RENDER: Empty state ---
  const renderEmptyState = () => {
    if (currentMessages.length > 0) return null;
    if (!currentContext?.emptyState) return null;
    
    return (
      <div className="empty-state" style={{ color: currentMode.color + '80' }}>
        <currentMode.icon size={32} style={{ opacity: 0.3 }} />
        <p>{currentContext.emptyState}</p>
      </div>
    );
  };

  return (
    <div className="ghost-dock-container" data-testid="glassy-omni-chat">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept="image/*,.pdf,.doc,.docx,.txt" 
      />

      <AnimatePresence mode="wait">
        {/* IDLE: Призрачный Горизонт */}
        {!isOpen && (
          <motion.div
            key="ghost-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ghost-line-container"
            onClick={() => { playClickSound(); setIsOpen(true); }}
            data-testid="chat-idle-strip"
          >
            <div 
              className={`ghost-line ${lineConfig.animation}`}
              style={{ 
                background: `linear-gradient(90deg, transparent 0%, ${lineConfig.color} 25%, ${lineConfig.color} 50%, ${lineConfig.color} 75%, transparent 100%)`,
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
              <button 
                className="emergent-close" 
                onClick={() => { playClickSound(); setIsOpen(false); }} 
                data-testid="chat-close-btn"
              >
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
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={currentContext?.placeholder || 'Введите сообщение...'}
                  data-testid="chat-input"
                />
              </div>

              {/* Messages */}
              <div className="emergent-messages">
                {renderEmptyState()}
                
                {currentMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`emergent-msg ${msg.type} ${msg.isInsight ? 'insight' : ''}`}
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
                            <button 
                              key={i} 
                              onClick={() => handleChipClick(chip)} 
                              onMouseEnter={playHoverSound}
                              className="chip-btn-small"
                            >
                              {typeof chip === 'string' ? chip : chip.text}
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

              {/* Контекстные чипсы - только если нет сообщений */}
              {currentMessages.length === 0 && renderChips()}

              {/* Toolbar */}
              <div className="chat-toolbar">
                <div className="toolbar-left">
                  <button 
                    className={`toolbar-btn ${isUploading ? 'active' : ''}`} 
                    onClick={handleFileClick} 
                    onMouseEnter={playHoverSound}
                    disabled={isUploading} 
                    title="Прикрепить"
                    data-testid="attach-btn"
                  >
                    {isUploading ? <Loader2 size={18} className="spin" /> : <Paperclip size={18} />}
                  </button>
                  
                  {Object.values(MODES).map((mode) => {
                    const isActive = activeMode === mode.id;
                    const isLocked = mode.requiresLevel && userLevel < mode.requiresLevel;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => !isLocked && handleModeChange(mode.id)}
                        onMouseEnter={playHoverSound}
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
                  <button 
                    className={`toolbar-btn ${isListening ? 'active listening' : ''}`} 
                    onClick={toggleVoiceInput}
                    onMouseEnter={playHoverSound}
                    title="Голос"
                    data-testid="voice-btn"
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button 
                    className="toolbar-btn send" 
                    onClick={() => sendMessage()} 
                    onMouseEnter={playHoverSound}
                    disabled={!inputValue?.trim() || isTyping} 
                    title="Отправить (Enter)"
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
