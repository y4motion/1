import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  X, Send, Paperclip, MoreVertical, Search, 
  Phone, Video, Image as ImageIcon, Shield,
  Smile, Mic, MicOff, Settings, CheckCheck, Ghost,
  Lock, Wifi, Signal, Bot, Users, Headphones,
  MessageSquare, Sparkles, Globe, ShoppingBag,
  ArrowUp, Loader2, ChevronDown, FileText, Archive, Music
} from 'lucide-react';

// === MODES CONFIG (same as GlassyOmniChat) ===
const MODES = {
  ai: { id: 'ai', icon: Bot, label: 'AI', color: '#f97316' },
  messages: { id: 'messages', icon: MessageSquare, label: 'Сообщения', color: '#10b981' },
  guilds: { id: 'guilds', icon: Shield, label: 'Гильдии', color: '#a855f7' },
  global: { id: 'global', icon: Globe, label: 'Глобальный', color: '#3b82f6' },
  support: { id: 'support', icon: Headphones, label: 'Поддержка', color: '#ef4444' },
};

// === ATTACH TYPES ===
const ATTACH_TYPES = [
  { id: 'photo', icon: ImageIcon, label: 'Фото', accept: 'image/*', color: '#10b981' },
  { id: 'video', icon: Video, label: 'Видео', accept: 'video/*', color: '#8b5cf6' },
  { id: 'audio', icon: Music, label: 'Аудио', accept: 'audio/*', color: '#f59e0b' },
  { id: 'document', icon: FileText, label: 'Документ', accept: '.pdf,.doc,.docx', color: '#3b82f6' },
  { id: 'archive', icon: Archive, label: 'Архив', accept: '.zip,.rar', color: '#6b7280' },
];

// --- MOCK CHATS ---
const CHATS = {
  messages: [
    { id: 1, name: "VOID_ARCHITECT", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100", lastMessage: "RTX 4090 за кейкапы...", time: "2m", online: true, unread: 2, verified: true, trust: 847 },
    { id: 2, name: "NIGHTMARE_X", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", lastMessage: "Готов к обмену...", time: "15m", online: true, unread: 0, trust: 312 },
    { id: 3, name: "CYBER_PHOENIX", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", lastMessage: "Круто выглядит!", time: "3h", online: false, unread: 0, trust: 156 },
  ],
  ai: [{ id: 'ai-assistant', name: "Ghost AI", avatar: null, lastMessage: "Чем помочь?", time: "now", online: true, isAI: true, trust: 999 }],
  guilds: [{ id: 'general', name: "# Общий чат", lastMessage: "Новые свитчи?", time: "5m", unread: 12, isChannel: true }],
  global: [{ id: 'global-chat', name: "Глобальный", lastMessage: "Всем привет!", time: "1m", unread: 5, isChannel: true }],
  support: [{ id: 'support-main', name: "Ghost Support", lastMessage: "Вопрос решён!", time: "1h", online: true, isSupport: true, trust: 999 }],
};

// --- MOCK MESSAGES ---
const MESSAGES = {
  1: [
    { id: 1, sender: 'them', text: "Привет! Видел твой сетап. Огонь!", time: "14:32", encrypted: true },
    { id: 2, sender: 'them', text: "Где брал кейкапы Ghost?", time: "14:32", encrypted: true },
    { id: 3, sender: 'me', text: "Это кастом с групбайка. GMK Ghost.", time: "14:35", encrypted: true },
    { id: 4, sender: 'me', text: "Могу скинуть ссылку на трейд.", time: "14:35", encrypted: true },
    { id: 5, sender: 'them', text: "У меня RTX 4090 на обмен.", time: "14:38", encrypted: true },
    { id: 6, sender: 'me', text: "Давай обсудим детали.", time: "14:40", status: 'read', encrypted: true },
  ],
  'ai-assistant': [{ id: 1, sender: 'them', text: "Привет! Я Ghost AI. Чем помочь?", time: "now", isAI: true }],
  'general': [{ id: 1, sender: 'user1', name: 'CYBER_X', text: "Кто тестил Gateron Oil Kings?", time: "14:50" }],
  'global-chat': [{ id: 1, sender: 'user1', name: 'ANON', text: "Всем привет!", time: "15:00" }],
  'support-main': [{ id: 1, sender: 'them', text: "Здравствуйте! Чем могу помочь?", time: "12:00", isSupport: true }],
};

export const GhostMessenger = ({ isOpen, onClose, initData }) => {
  const location = useLocation();
  const [activeMode, setActiveMode] = useState('messages');
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentMode = MODES[activeMode];

  // Initialize with data
  useEffect(() => {
    if (initData?.activeTab && MODES[initData.activeTab]) {
      setActiveMode(initData.activeTab);
    }
  }, [initData]);

  // Set default chat when mode changes
  useEffect(() => {
    const chats = CHATS[activeMode] || [];
    if (chats.length > 0 && (!activeChat || !chats.find(c => c.id === activeChat?.id))) {
      setActiveChat(chats[0]);
    }
  }, [activeMode, activeChat]);

  // Scroll & Focus
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChat]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen, activeMode]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !activeChat) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: message,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      encrypted: true
    };
    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
    }));
    setMessage('');
    
    // Simulate response
    if (activeMode === 'ai') {
      setIsTyping(true);
      setTimeout(() => {
        setChatMessages(prev => ({
          ...prev,
          [activeChat.id]: [...(prev[activeChat.id] || []), {
            id: Date.now(),
            sender: 'them',
            text: 'Анализирую запрос...',
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            isAI: true
          }]
        }));
        setIsTyping(false);
      }, 1000);
    }
  }, [message, activeChat, activeMode]);

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
  };

  const currentChats = CHATS[activeMode] || [];
  const currentMessages = activeChat ? (chatMessages[activeChat.id] || []) : [];
  const totalUnread = (modeId) => CHATS[modeId]?.reduce((sum, c) => sum + (c.unread || 0), 0) || 0;

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
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            boxShadow: '0 0 100px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          
          {/* === LEFT SIDEBAR === */}
          <div 
            className="w-[320px] flex flex-col shrink-0"
            style={{ background: 'rgba(255, 255, 255, 0.02)', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}
          >
            {/* HEADER */}
            <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${currentMode.color}20`, border: `1px solid ${currentMode.color}40` }}
                >
                  <currentMode.icon size={18} style={{ color: currentMode.color }} />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{currentMode.label}</div>
                  <div className="text-[10px] text-white/40 font-mono">GHOST LINK v2.0</div>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-3">
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                <Search size={14} className="text-white/20" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..." 
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* CONTACTS LIST */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-2">
              {currentChats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`mx-1 mb-1 p-3 cursor-pointer flex gap-3 relative transition-all rounded-xl ${activeChat?.id === chat.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`}
                  style={{ borderLeft: activeChat?.id === chat.id ? `2px solid ${currentMode.color}` : '2px solid transparent' }}
                >
                  <div className="relative">
                    {chat.avatar ? (
                      <img src={chat.avatar} className="w-10 h-10 rounded-xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.1)' }} alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${currentMode.color}15`, border: `1px solid ${currentMode.color}30` }}>
                        {chat.isAI ? <Sparkles size={16} className="text-purple-400" /> : chat.isChannel ? <Users size={16} className="text-blue-400" /> : <Ghost size={16} style={{ color: currentMode.color }} />}
                      </div>
                    )}
                    {chat.online && !chat.isChannel && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: '#00ff88', border: '2px solid rgba(0,0,0,0.8)' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-white font-medium text-sm truncate">{chat.name}</span>
                      <span className="text-white/20 text-[10px] font-mono">{chat.time}</span>
                    </div>
                    <p className="text-white/30 text-xs truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: currentMode.color, color: '#000' }}>
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))}
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
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${currentMode.color}15`, border: `1px solid ${currentMode.color}30` }}>
                      {activeChat.isAI ? <Sparkles size={18} className="text-purple-400" /> : <Ghost size={18} style={{ color: currentMode.color }} />}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{activeChat.name}</span>
                      {activeChat.verified && <Shield size={12} className="text-cyan-400" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className={activeChat.online ? 'text-green-400' : 'text-white/25'}>{activeChat.online ? 'ONLINE' : 'OFFLINE'}</span>
                      {activeChat.trust && <span className="text-white/30">• TRUST: {activeChat.trust}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!activeChat.isChannel && !activeChat.isAI && (
                    <>
                      <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white"><Phone size={16} /></button>
                      <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white"><Video size={16} /></button>
                    </>
                  )}
                  <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white"><MoreVertical size={16} /></button>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            <div className="flex-1 p-5 overflow-y-auto no-scrollbar">
              {activeChat ? (
                <>
                  <div className="flex justify-center mb-6">
                    <span className="px-3 py-1 text-[9px] font-mono text-white/25" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>// TODAY</span>
                  </div>
                  <div className="space-y-3">
                    {currentMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender !== 'me' && (
                          <div className="max-w-[65%]">
                            <div className="flex items-center gap-2 mb-1 ml-1">
                              {msg.name && <span className="text-[10px] font-medium" style={{ color: currentMode.color }}>{msg.name}</span>}
                              {msg.encrypted && <Lock size={8} className="text-white/20" />}
                              <span className="text-[9px] font-mono text-white/20">{msg.time}</span>
                            </div>
                            <div className="p-3" style={{ background: msg.isAI ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${msg.isAI ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '0 10px 10px 0' }}>
                              <p className="text-white/85 text-sm">{msg.text}</p>
                            </div>
                          </div>
                        )}
                        {msg.sender === 'me' && (
                          <div className="max-w-[65%]">
                            <div className="flex items-center justify-end gap-2 mb-1 mr-1">
                              <span className="text-[9px] font-mono text-white/15">{msg.time}</span>
                              {msg.status === 'read' && <CheckCheck size={10} style={{ color: currentMode.color }} />}
                            </div>
                            <div className="p-3" style={{ background: `${currentMode.color}10`, borderRight: `2px solid ${currentMode.color}60`, borderRadius: '10px 0 0 10px' }}>
                              <p className="text-white/90 text-sm">{msg.text}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="p-3 flex gap-1" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0 10px 10px 0' }}>
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
                    <Ghost size={40} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/25 text-sm font-mono">Select a conversation</p>
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
                className="flex items-center gap-2 px-4 py-2 mb-3"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={activeChat?.isAI ? 'Спросить AI...' : 'Написать сообщение...'}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                  style={{ minHeight: '24px' }}
                />
              </div>

              {/* Toolbar - Same as GlassyOmniChat */}
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
                          style={{ background: 'rgba(20,20,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
                        >
                          {ATTACH_TYPES.map((type) => (
                            <button key={type.id} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 text-sm transition-all">
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
                    const unread = totalUnread(mode.id);
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleModeChange(mode.id)}
                        className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isActive ? '' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                        style={isActive ? { background: `${mode.color}30`, color: mode.color } : {}}
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
                  {/* Voice */}
                  <button 
                    onClick={() => setIsListening(!isListening)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  {/* Send */}
                  <button 
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: message.trim() ? currentMode.color : 'rgba(255,255,255,0.05)',
                      color: message.trim() ? '#000' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>

              {/* Status Line */}
              <div className="flex justify-center mt-2">
                <span className="text-[8px] font-mono text-white/15 tracking-widest">E2E ENCRYPTED • GHOST PROTOCOL</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GhostMessenger;
