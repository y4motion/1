/**
 * GhostMessenger.jsx - Full Communication Hub
 * 
 * Структура "ДОМ" - расширенная версия мини-чата:
 * 
 * 🟠 AI - Glassy AI помощник
 * 🟢 TRADE (Маркет) - Переписка с продавцами
 *    └── Активные сделки
 *    └── История
 *    └── Споры
 * 🟣 GUILDS (Гильдии) - Гильдейские чаты
 *    └── Мои гильдии
 *    └── Приглашения
 * 🔵 GLOBAL (Глобальный) - Сообщество
 *    └── Общий чат
 *    └── Личные сообщения (ЛС)
 *    └── Объявления
 * 🔴 SUPPORT (Поддержка) - Тех. поддержка
 *    └── Активные тикеты
 *    └── История
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Paperclip, MoreVertical, Search, 
  Phone, Video, Image as ImageIcon, Shield,
  Smile, Mic, MicOff, Settings, CheckCheck, Ghost,
  Lock, Wifi, Bot, Users, Headphones,
  MessageSquare, Sparkles, Globe, ShoppingBag,
  ArrowUp, FileText, Archive, Music, Package,
  AlertTriangle, History, UserPlus, Mail, Hash,
  ChevronRight, Plus, Bell, Star
} from 'lucide-react';

// === MODES CONFIG (synced with GlassyOmniChat) ===
const MODES = {
  ai: { id: 'ai', icon: Bot, label: 'Glassy AI', color: '#f97316' },
  trade: { id: 'trade', icon: ShoppingBag, label: 'Маркет', color: '#10b981' },
  guilds: { id: 'guilds', icon: Shield, label: 'Гильдии', color: '#a855f7' },
  global: { id: 'global', icon: Globe, label: 'Глобальный', color: '#3b82f6' },
  support: { id: 'support', icon: Headphones, label: 'Поддержка', color: '#ef4444' },
};

// === SUBFOLDERS FOR EACH MODE ===
const MODE_SUBFOLDERS = {
  ai: [
    { id: 'assistant', label: 'Ассистент', icon: Bot },
  ],
  trade: [
    { id: 'active', label: 'Активные сделки', icon: Package, badge: 2 },
    { id: 'history', label: 'История', icon: History },
    { id: 'disputes', label: 'Споры', icon: AlertTriangle },
  ],
  guilds: [
    { id: 'my-guilds', label: 'Мои гильдии', icon: Shield },
    { id: 'invites', label: 'Приглашения', icon: Mail, badge: 1 },
  ],
  global: [
    { id: 'general', label: 'Общий чат', icon: Hash },
    { id: 'direct', label: 'Личные сообщения', icon: MessageSquare, badge: 3 },
    { id: 'announcements', label: 'Объявления', icon: Bell },
  ],
  support: [
    { id: 'active-tickets', label: 'Активные тикеты', icon: Headphones },
    { id: 'ticket-history', label: 'История', icon: History },
  ],
};

// === ATTACH TYPES ===
const ATTACH_TYPES = [
  { id: 'photo', icon: ImageIcon, label: 'Фото', color: '#10b981' },
  { id: 'video', icon: Video, label: 'Видео', color: '#8b5cf6' },
  { id: 'audio', icon: Music, label: 'Аудио', color: '#f59e0b' },
  { id: 'document', icon: FileText, label: 'Документ', color: '#3b82f6' },
  { id: 'archive', icon: Archive, label: 'Архив', color: '#6b7280' },
];

// === MOCK DATA ===
const MOCK_CHATS = {
  // TRADE - Маркет (продавцы)
  'trade-active': [
    { id: 't1', name: 'TechSeller_PRO', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', lastMessage: 'Отправил трек-номер', time: '5m', online: true, unread: 1, trust: 847, deal: 'RTX 4090' },
    { id: 't2', name: 'KeyboardMaster', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', lastMessage: 'Готов к обмену', time: '1h', online: true, unread: 0, trust: 623, deal: 'GMK Keycaps' },
  ],
  'trade-history': [
    { id: 't3', name: 'OldSeller', avatar: null, lastMessage: 'Сделка завершена ✓', time: '2d', online: false, completed: true },
  ],
  'trade-disputes': [],
  
  // GUILDS - Гильдии
  'guilds-my-guilds': [
    { id: 'g1', name: '🎮 PC Masters', avatar: null, lastMessage: 'Новый турнир!', time: '10m', members: 1247, isGuild: true },
    { id: 'g2', name: '⌨️ Keyboard Enthusiasts', avatar: null, lastMessage: 'Групбай открыт', time: '2h', members: 892, isGuild: true },
  ],
  'guilds-invites': [
    { id: 'g3', name: '🔧 Modders United', avatar: null, lastMessage: 'Приглашение от VOID_X', time: '1d', isInvite: true },
  ],
  
  // GLOBAL - Глобальный
  'global-general': [
    { id: 'gen', name: '# Общий чат', avatar: null, lastMessage: 'Кто тестил новые свитчи?', time: '2m', isChannel: true, online: 847 },
  ],
  'global-direct': [
    { id: 'd1', name: 'VOID_ARCHITECT', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', lastMessage: 'Привет! Видел твой сетап', time: '15m', online: true, unread: 2 },
    { id: 'd2', name: 'CYBER_PHOENIX', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', lastMessage: 'Круто выглядит!', time: '3h', online: false, unread: 0 },
    { id: 'd3', name: 'DARK_MATTER', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', lastMessage: 'Спасибо за помощь', time: '1d', online: false, unread: 1 },
  ],
  'global-announcements': [
    { id: 'ann', name: '📢 Объявления', avatar: null, lastMessage: 'Обновление платформы v2.0', time: '6h', isChannel: true, pinned: true },
  ],
  
  // AI
  'ai-assistant': [
    { id: 'ai', name: 'Ghost AI', avatar: null, lastMessage: 'Чем могу помочь?', time: 'now', online: true, isAI: true },
  ],
  
  // SUPPORT
  'support-active-tickets': [
    { id: 's1', name: 'Тикет #4521', avatar: null, lastMessage: 'Оператор подключился', time: '30m', status: 'active', isTicket: true },
  ],
  'support-ticket-history': [
    { id: 's2', name: 'Тикет #4412', avatar: null, lastMessage: 'Решено ✓', time: '3d', status: 'resolved', isTicket: true },
  ],
};

const MOCK_MESSAGES = {
  'd1': [
    { id: 1, sender: 'them', text: 'Привет! Видел твой сетап на главной. Огонь!', time: '14:32' },
    { id: 2, sender: 'them', text: 'Где брал кейкапы Ghost?', time: '14:32' },
    { id: 3, sender: 'me', text: 'Привет! Это кастом с групбайка. GMK Ghost.', time: '14:35' },
    { id: 4, sender: 'me', text: 'Могу скинуть ссылку на трейд.', time: '14:35', status: 'read' },
  ],
  't1': [
    { id: 1, sender: 'them', text: 'Здравствуйте! RTX 4090 в наличии.', time: '10:00' },
    { id: 2, sender: 'me', text: 'Отлично! Готов к сделке.', time: '10:15' },
    { id: 3, sender: 'them', text: 'Отправил трек-номер в ЛС', time: '11:30' },
  ],
  'ai': [
    { id: 1, sender: 'them', text: 'Привет! Я Ghost AI — твой персональный ассистент. Могу помочь с поиском товаров, сравнением цен, настройкой сборки ПК и многим другим.', time: 'now', isAI: true },
  ],
  'gen': [
    { id: 1, sender: 'user1', name: 'CYBER_X', text: 'Кто-нибудь тестил Gateron Oil Kings?', time: '14:50' },
    { id: 2, sender: 'user2', name: 'VOID_M', text: 'Да, звук отличный, но немного scratchy', time: '14:52' },
    { id: 3, sender: 'user3', name: 'GHOST_99', text: 'Лучше взять Ink Black v2', time: '14:55' },
  ],
  'g1': [
    { id: 1, sender: 'system', text: '🎮 Новый турнир по CS2 стартует через 3 дня!', time: '12:00', isSystem: true },
    { id: 2, sender: 'user1', name: 'ADMIN', text: 'Регистрация открыта', time: '12:05' },
  ],
  's1': [
    { id: 1, sender: 'them', text: 'Здравствуйте! Опишите вашу проблему.', time: '10:00', isSupport: true },
    { id: 2, sender: 'me', text: 'Не могу оплатить заказ', time: '10:05' },
    { id: 3, sender: 'them', text: 'Оператор подключился к чату', time: '10:30', isSystem: true },
  ],
};

export const GhostMessenger = ({ isOpen, onClose, initData }) => {
  const [activeMode, setActiveMode] = useState('global');
  const [activeSubfolder, setActiveSubfolder] = useState('direct');
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentMode = MODES[activeMode];
  const subfolders = MODE_SUBFOLDERS[activeMode] || [];
  const chatKey = `${activeMode}-${activeSubfolder}`;
  const currentChats = MOCK_CHATS[chatKey] || [];

  // Initialize from mini-chat
  useEffect(() => {
    if (initData?.activeTab && MODES[initData.activeTab]) {
      setActiveMode(initData.activeTab);
      const subs = MODE_SUBFOLDERS[initData.activeTab] || [];
      if (subs.length > 0) {
        setActiveSubfolder(subs[0].id);
      }
    }
  }, [initData]);

  // Auto-select first subfolder when mode changes
  useEffect(() => {
    const subs = MODE_SUBFOLDERS[activeMode] || [];
    if (subs.length > 0 && !subs.find(s => s.id === activeSubfolder)) {
      setActiveSubfolder(subs[0].id);
    }
  }, [activeMode, activeSubfolder]);

  // Auto-select first chat
  useEffect(() => {
    if (currentChats.length > 0 && (!activeChat || !currentChats.find(c => c.id === activeChat?.id))) {
      setActiveChat(currentChats[0]);
    }
  }, [currentChats, activeChat]);

  // Scroll & Focus
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChat]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, activeMode]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !activeChat) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: message,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
    }));
    setMessage('');
    
    // Simulate AI response
    if (activeChat.isAI) {
      setIsTyping(true);
      setTimeout(() => {
        setChatMessages(prev => ({
          ...prev,
          [activeChat.id]: [...(prev[activeChat.id] || []), {
            id: Date.now(),
            sender: 'them',
            text: 'Анализирую ваш запрос... Готов помочь!',
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            isAI: true
          }]
        }));
        setIsTyping(false);
      }, 1200);
    }
  }, [message, activeChat]);

  const currentMessages = activeChat ? (chatMessages[activeChat.id] || []) : [];
  const getTotalUnread = (modeId) => {
    let total = 0;
    const subs = MODE_SUBFOLDERS[modeId] || [];
    subs.forEach(sub => {
      const chats = MOCK_CHATS[`${modeId}-${sub.id}`] || [];
      total += chats.reduce((sum, c) => sum + (c.unread || 0), 0);
    });
    return total;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300]"
        onClick={onClose}
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(24px)' }}
      />

      {/* MAIN CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-4 z-[301] flex"
        onClick={(e) => e.stopPropagation()}
        data-testid="ghost-messenger"
      >
        <div 
          className="w-full h-full flex overflow-hidden"
          style={{
            background: 'rgba(5, 5, 8, 0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            boxShadow: '0 0 100px rgba(0, 0, 0, 0.8)',
          }}
        >
          
          {/* === MODE RAIL (Left Edge) === */}
          <div 
            className="w-[72px] flex flex-col items-center py-4 gap-2 shrink-0"
            style={{ background: 'rgba(0,0,0,0.4)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
          >
            {Object.values(MODES).map((mode) => {
              const isActive = activeMode === mode.id;
              const unread = getTotalUnread(mode.id);
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: isActive ? `${mode.color}25` : 'transparent',
                    color: isActive ? mode.color : 'rgba(255,255,255,0.4)',
                    border: isActive ? `1px solid ${mode.color}40` : '1px solid transparent',
                  }}
                  title={mode.label}
                >
                  <mode.icon size={22} />
                  {unread > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: mode.color, color: '#000' }}
                    >
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
              );
            })}
            
            <div className="flex-1" />
            
            {/* Settings */}
            <button className="w-12 h-12 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
              <Settings size={20} />
            </button>
          </div>

          {/* === SUBFOLDER PANEL === */}
          <div 
            className="w-[200px] flex flex-col shrink-0"
            style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Mode Header */}
            <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <currentMode.icon size={18} style={{ color: currentMode.color }} />
                <span className="font-semibold text-white">{currentMode.label}</span>
              </div>
            </div>

            {/* Subfolders */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              {subfolders.map((sub) => {
                const isActive = activeSubfolder === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubfolder(sub.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <sub.icon size={16} />
                    <span className="flex-1 text-left text-sm">{sub.label}</span>
                    {sub.badge && (
                      <span 
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{ background: currentMode.color, color: '#000' }}
                      >
                        {sub.badge}
                      </span>
                    )}
                    <ChevronRight size={14} className="opacity-30" />
                  </button>
                );
              })}
            </div>

            {/* New Chat Button */}
            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: `${currentMode.color}20`, color: currentMode.color, border: `1px solid ${currentMode.color}30` }}
              >
                <Plus size={16} />
                <span>Новый чат</span>
              </button>
            </div>
          </div>

          {/* === CHATS LIST === */}
          <div 
            className="w-[280px] flex flex-col shrink-0"
            style={{ background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Search */}
            <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <Search size={14} className="text-white/20" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..." 
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Chats */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {currentChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/20">
                  <Ghost size={32} className="mb-2 opacity-30" />
                  <span className="text-sm">Нет чатов</span>
                </div>
              ) : (
                currentChats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((chat) => (
                  <div 
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    className={`p-3 cursor-pointer flex gap-3 transition-all ${
                      activeChat?.id === chat.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                    }`}
                    style={{ borderLeft: activeChat?.id === chat.id ? `3px solid ${currentMode.color}` : '3px solid transparent' }}
                  >
                    <div className="relative shrink-0">
                      {chat.avatar ? (
                        <img src={chat.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ background: `${currentMode.color}15` }}
                        >
                          {chat.isGuild ? '🛡️' : chat.isChannel ? '#' : chat.isAI ? '🤖' : chat.isTicket ? '🎫' : chat.isInvite ? '✉️' : '👤'}
                        </div>
                      )}
                      {chat.online && !chat.isChannel && !chat.isGuild && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full" style={{ background: '#00ff88', border: '2px solid rgba(5,5,8,0.95)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-white font-medium text-sm truncate">{chat.name}</span>
                        <span className="text-white/20 text-[10px]">{chat.time}</span>
                      </div>
                      <p className="text-white/40 text-xs truncate">{chat.lastMessage}</p>
                      {chat.deal && <span className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: `${currentMode.color}20`, color: currentMode.color }}>{chat.deal}</span>}
                      {chat.members && <span className="text-[10px] text-white/30">{chat.members} участников</span>}
                      {chat.online && chat.isChannel && <span className="text-[10px] text-green-400">{chat.online} онлайн</span>}
                    </div>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: currentMode.color, color: '#000' }}>
                        {chat.unread}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* === MAIN CHAT AREA === */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            
            {/* CHAT HEADER */}
            {activeChat && (
              <div className="h-16 flex items-center justify-between px-5 shrink-0" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  {activeChat.avatar ? (
                    <img src={activeChat.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${currentMode.color}15` }}>
                      {activeChat.isAI ? '🤖' : activeChat.isGuild ? '🛡️' : activeChat.isChannel ? '#' : '👤'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{activeChat.name}</span>
                      {activeChat.trust && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,255,212,0.1)', color: '#00ffd4' }}>TRUST: {activeChat.trust}</span>}
                    </div>
                    <div className="text-[11px] text-white/40">
                      {activeChat.online ? <span className="text-green-400">● Онлайн</span> : activeChat.members ? `${activeChat.members} участников` : 'Оффлайн'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!activeChat.isChannel && !activeChat.isAI && !activeChat.isGuild && (
                    <>
                      <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white"><Phone size={16} /></button>
                      <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white"><Video size={16} /></button>
                    </>
                  )}
                  <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white"><Star size={16} /></button>
                  <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white"><MoreVertical size={16} /></button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400"><X size={18} /></button>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            <div className="flex-1 p-5 overflow-y-auto no-scrollbar">
              {activeChat ? (
                <>
                  <div className="flex justify-center mb-6">
                    <span className="px-3 py-1 text-[9px] font-mono text-white/20" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>// СЕГОДНЯ</span>
                  </div>
                  <div className="space-y-3">
                    {currentMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.isSystem ? 'justify-center' : 'justify-start'}`}>
                        {msg.isSystem ? (
                          <span className="text-[11px] text-white/30 px-3 py-1" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>{msg.text}</span>
                        ) : msg.sender !== 'me' ? (
                          <div className="max-w-[65%]">
                            <div className="flex items-center gap-2 mb-1 ml-1">
                              {msg.name && <span className="text-[11px] font-medium" style={{ color: currentMode.color }}>{msg.name}</span>}
                              <span className="text-[10px] text-white/20">{msg.time}</span>
                            </div>
                            <div className="p-3" style={{ background: msg.isAI ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${msg.isAI ? '#f97316' : 'rgba(255,255,255,0.15)'}`, borderRadius: '0 12px 12px 0' }}>
                              <p className="text-white/85 text-sm leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="max-w-[65%]">
                            <div className="flex items-center justify-end gap-2 mb-1 mr-1">
                              <span className="text-[10px] text-white/15">{msg.time}</span>
                              {msg.status === 'read' && <CheckCheck size={12} style={{ color: currentMode.color }} />}
                            </div>
                            <div className="p-3" style={{ background: `${currentMode.color}10`, borderRight: `2px solid ${currentMode.color}60`, borderRadius: '12px 0 0 12px' }}>
                              <p className="text-white/90 text-sm leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="p-3 flex gap-1" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0 12px 12px 0' }}>
                          <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <currentMode.icon size={40} className="mx-auto mb-3" style={{ color: currentMode.color, opacity: 0.3 }} />
                    <p className="text-white/25 text-sm">Выберите чат</p>
                  </div>
                </div>
              )}
            </div>

            {/* === UNIFIED BOTTOM TOOLBAR (GlassyOmniChat Style) === */}
            <div 
              className="shrink-0"
              style={{ 
                background: 'linear-gradient(180deg, rgba(10,10,12,0.95) 0%, rgba(5,5,7,0.98) 100%)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '12px 16px',
              }}
            >
              {/* Input Area */}
              <div 
                className="flex items-center gap-2 px-4 py-2.5 mb-3"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={activeChat?.isAI ? 'Спросить AI...' : activeMode === 'trade' ? 'Написать продавцу...' : 'Написать сообщение...'}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Attach */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Paperclip size={18} />
                    </button>
                    <AnimatePresence>
                      {showAttachMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute bottom-full left-0 mb-2 p-2 rounded-xl"
                          style={{ background: 'rgba(20,20,25,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
                        >
                          {ATTACH_TYPES.map((type) => (
                            <button key={type.id} onClick={() => setShowAttachMenu(false)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 text-sm transition-all">
                              <type.icon size={16} style={{ color: type.color }} />
                              <span>{type.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mode Tabs */}
                  {Object.values(MODES).map((mode) => {
                    const isActive = activeMode === mode.id;
                    const unread = getTotalUnread(mode.id);
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                        style={isActive ? { background: `${mode.color}30`, color: mode.color } : { color: 'rgba(255,255,255,0.4)' }}
                        title={mode.label}
                      >
                        <mode.icon size={18} />
                        {unread > 0 && !isActive && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: mode.color, color: '#000' }}>
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsListening(!isListening)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: message.trim() ? currentMode.color : 'rgba(255,255,255,0.05)', color: message.trim() ? '#000' : 'rgba(255,255,255,0.3)' }}
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-center mt-2">
                <span className="text-[8px] font-mono text-white/15 tracking-widest">E2E ENCRYPTED • GHOST PROTOCOL v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GhostMessenger;
