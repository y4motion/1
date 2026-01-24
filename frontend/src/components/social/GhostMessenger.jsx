import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  X, Send, Paperclip, MoreVertical, Search, 
  Phone, Video, Image as ImageIcon, Shield,
  Smile, Mic, Settings, CheckCheck, Ghost,
  Lock, Wifi, Signal, Bot, Users, Headphones,
  MessageSquare, Sparkles, ChevronDown
} from 'lucide-react';

// --- TAB CONFIGURATION WITH PRIORITIES ---
const BASE_TABS = [
  { id: 'messages', icon: MessageSquare, label: 'Сообщения', basePriority: 1 },
  { id: 'ai', icon: Bot, label: 'AI Ассистент', basePriority: 2 },
  { id: 'community', icon: Users, label: 'Сообщество', basePriority: 3 },
  { id: 'support', icon: Headphones, label: 'Поддержка', basePriority: 4 },
];

// --- MOCK CHATS ---
const CHATS = {
  messages: [
    { 
      id: 1, 
      name: "VOID_ARCHITECT", 
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
      lastMessage: "Offers: RTX 4090 за кейкапы...",
      time: "2m",
      online: true,
      unread: 2,
      verified: true,
      trust: 847
    },
    { 
      id: 2, 
      name: "NIGHTMARE_X", 
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      lastMessage: "Готов к обмену, напиши когда...",
      time: "15m",
      online: true,
      unread: 0,
      verified: false,
      trust: 312
    },
    { 
      id: 3, 
      name: "CYBER_PHOENIX", 
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      lastMessage: "Круто выглядит твой сетап!",
      time: "3h",
      online: false,
      unread: 0,
      verified: false,
      trust: 156
    },
    { 
      id: 4, 
      name: "DARK_MATTER", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      lastMessage: "Отправил трек-номер в ЛС",
      time: "1d",
      online: false,
      unread: 0,
      verified: true,
      trust: 623
    },
  ],
  ai: [
    { 
      id: 'ai-assistant', 
      name: "Ghost AI", 
      avatar: null,
      lastMessage: "Чем могу помочь?",
      time: "now",
      online: true,
      unread: 0,
      verified: true,
      isAI: true,
      trust: 999
    },
  ],
  community: [
    { 
      id: 'general', 
      name: "# Общий чат", 
      avatar: null,
      lastMessage: "Кто-нибудь тестил новые свитчи?",
      time: "5m",
      online: true,
      unread: 12,
      isChannel: true
    },
    { 
      id: 'trades', 
      name: "# Трейды", 
      avatar: null,
      lastMessage: "WTS: GMK Oblivion R2",
      time: "12m",
      online: true,
      unread: 3,
      isChannel: true
    },
  ],
  support: [
    { 
      id: 'support-main', 
      name: "Ghost Support", 
      avatar: null,
      lastMessage: "Ваш вопрос решён! Спасибо...",
      time: "1h",
      online: true,
      unread: 0,
      verified: true,
      isSupport: true,
      trust: 999
    },
  ]
};

// --- MOCK MESSAGES ---
const MESSAGES = {
  1: [
    { id: 1, sender: 'them', text: "Привет! Видел твой сетап на главной. Огонь!", time: "14:32", encrypted: true },
    { id: 2, sender: 'them', text: "Где брал кейкапы Ghost? Давно ищу такие.", time: "14:32", encrypted: true },
    { id: 3, sender: 'me', text: "Привет! Это кастом с групбайка. GMK Ghost.", time: "14:35", encrypted: true },
    { id: 4, sender: 'me', text: "Могу скинуть ссылку на трейд если интересно.", time: "14:35", encrypted: true },
    { id: 5, sender: 'them', text: "Да, было бы круто! У меня есть RTX 4090 на обмен.", time: "14:38", encrypted: true },
    { id: 6, sender: 'me', text: "Оу, серьезное предложение. Давай обсудим детали.", time: "14:40", status: 'read', encrypted: true },
  ],
  'ai-assistant': [
    { id: 1, sender: 'them', text: "Привет! Я Ghost AI. Могу помочь с поиском товаров, сравнением цен и настройкой сборки.", time: "now", isAI: true },
  ],
  'general': [
    { id: 1, sender: 'user1', name: 'CYBER_X', text: "Кто-нибудь тестил новые Gateron Oil Kings?", time: "14:50" },
    { id: 2, sender: 'user2', name: 'VOID_M', text: "Да, звук отличный, но немного scratchy", time: "14:52" },
  ],
  'support-main': [
    { id: 1, sender: 'them', text: "Здравствуйте! Чем могу помочь?", time: "12:00", isSupport: true },
  ]
};

export const GhostMessenger = ({ isOpen, onClose, initData }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('messages');
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [tabPriorities, setTabPriorities] = useState({
    messages: 1, ai: 2, community: 3, support: 4
  });
  const messagesEndRef = useRef(null);

  // Initialize with data from GlassyChatBar
  useEffect(() => {
    if (initData) {
      if (initData.activeTab && BASE_TABS.find(t => t.id === initData.activeTab)) {
        setActiveTab(initData.activeTab);
      }
    }
  }, [initData]);

  // Set default chat when tab changes
  useEffect(() => {
    const chats = CHATS[activeTab] || [];
    if (chats.length > 0 && (!activeChat || !chats.find(c => c.id === activeChat?.id))) {
      setActiveChat(chats[0]);
    }
  }, [activeTab]);

  // Initialize messages
  useEffect(() => {
    setChatMessages(MESSAGES);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChat]);

  // Dynamic tab sorting based on context
  const sortedTabs = useMemo(() => {
    const context = location.pathname;
    const priorities = { ...tabPriorities };
    
    // Boost priority based on page context
    if (context.startsWith('/glassy-swap')) {
      priorities.messages = 0;
      priorities.community = 1;
    } else if (context.startsWith('/pc-builder')) {
      priorities.ai = 0;
      priorities.support = 1;
    } else if (context.includes('/product/')) {
      priorities.community = 0;
      priorities.ai = 1;
    }
    
    // Boost tabs with unread
    Object.keys(CHATS).forEach(tabId => {
      const unread = CHATS[tabId]?.reduce((sum, c) => sum + (c.unread || 0), 0) || 0;
      if (unread > 0) {
        priorities[tabId] = Math.max(0, (priorities[tabId] || 5) - 2);
      }
    });
    
    return [...BASE_TABS].sort((a, b) => {
      const pA = priorities[a.id] ?? a.basePriority;
      const pB = priorities[b.id] ?? b.basePriority;
      return pA - pB;
    });
  }, [location.pathname, tabPriorities]);

  const handleSend = () => {
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
  };

  const currentChats = CHATS[activeTab] || [];
  const currentMessages = activeChat ? (chatMessages[activeChat.id] || []) : [];
  const totalUnread = (tabId) => CHATS[tabId]?.reduce((sum, c) => sum + (c.unread || 0), 0) || 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* HOLOGRAPHIC BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300]"
        onClick={onClose}
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(24px)',
        }}
      />

      {/* GHOST LINK TERMINAL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-4 z-[301] flex"
        onClick={(e) => e.stopPropagation()}
        data-testid="ghost-messenger"
      >
        {/* MAIN GLASS CONTAINER */}
        <div 
          className="w-full h-full flex overflow-hidden"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            boxShadow: `
              0 0 100px rgba(0, 0, 0, 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 0.05),
              0 0 60px rgba(0, 255, 212, 0.03)
            `,
          }}
        >
          
          {/* === LEFT SIDEBAR === */}
          <div 
            className="w-[340px] flex flex-col shrink-0"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            
            {/* HEADER - GHOST LINK */}
            <div 
              className="p-5 flex justify-between items-center"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 212, 0.2) 0%, rgba(0, 255, 212, 0.05) 100%)',
                    border: '1px solid rgba(0, 255, 212, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 255, 212, 0.15)',
                  }}
                >
                  <Ghost size={20} className="text-cyan-400" />
                </div>
                <div>
                  <div className="font-bold text-white tracking-wider text-sm">GHOST LINK</div>
                  <div className="text-[10px] text-cyan-400/70 font-mono flex items-center gap-1.5">
                    <Signal size={10} />
                    <span>QUANTUM.ENCRYPTED</span>
                  </div>
                </div>
              </div>
              <button 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings size={18} />
              </button>
            </div>

            {/* DYNAMIC TABS */}
            <div 
              className="flex gap-1 p-3 overflow-x-auto no-scrollbar"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              {sortedTabs.map((tab, index) => {
                const unread = totalUnread(tab.id);
                const isActive = activeTab === tab.id;
                const isPriority = index === 0;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                    style={{
                      order: index,
                      borderLeft: isPriority && !isActive ? '2px solid rgba(0, 255, 212, 0.4)' : 'none',
                    }}
                  >
                    <tab.icon size={14} />
                    <span className="text-xs font-medium">{tab.label}</span>
                    {unread > 0 && (
                      <span 
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded"
                        style={{
                          background: 'rgba(0, 255, 212, 0.9)',
                          color: '#000',
                        }}
                      >
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* SEARCH */}
            <div className="p-4">
              <div 
                className="flex items-center gap-3 px-4 py-3 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                }}
              >
                <Search size={16} className="text-white/20" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..." 
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20 font-mono"
                />
              </div>
            </div>

            {/* CONTACTS LIST */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-2">
              {currentChats.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((chat) => (
                <motion.div 
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  whileHover={{ x: 4 }}
                  className={`mx-2 mb-1 p-3 cursor-pointer flex gap-3 relative transition-all rounded-xl ${
                    activeChat?.id === chat.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                  }`}
                  style={{
                    borderLeft: activeChat?.id === chat.id 
                      ? '2px solid rgba(0, 255, 212, 0.7)' 
                      : '2px solid transparent',
                  }}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {chat.avatar ? (
                      <img 
                        src={chat.avatar} 
                        className="w-11 h-11 rounded-xl object-cover" 
                        style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                        alt="" 
                      />
                    ) : (
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background: chat.isAI 
                            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)'
                            : chat.isChannel 
                              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(0, 255, 212, 0.15) 0%, rgba(0, 255, 212, 0.05) 100%)',
                          border: `1px solid ${chat.isAI ? 'rgba(168, 85, 247, 0.3)' : chat.isChannel ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 255, 212, 0.2)'}`,
                        }}
                      >
                        {chat.isAI ? <Sparkles size={18} className="text-purple-400" /> :
                         chat.isChannel ? <Users size={18} className="text-blue-400" /> :
                         <Ghost size={18} className="text-cyan-400" />}
                      </div>
                    )}
                    {chat.online && !chat.isChannel && (
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                        style={{
                          background: '#00ff88',
                          border: '2px solid rgba(0, 0, 0, 0.8)',
                          boxShadow: '0 0 8px rgba(0, 255, 136, 0.5)',
                        }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-semibold text-sm truncate">{chat.name}</span>
                        {chat.verified && <Shield size={11} className="text-cyan-400" />}
                      </div>
                      <span className="text-white/20 text-[10px] font-mono">{chat.time}</span>
                    </div>
                    <p className="text-white/30 text-xs truncate">{chat.lastMessage}</p>
                  </div>

                  {/* Unread Badge */}
                  {chat.unread > 0 && (
                    <div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: 'rgba(0, 255, 212, 0.9)',
                        color: '#000',
                        boxShadow: '0 0 10px rgba(0, 255, 212, 0.4)',
                      }}
                    >
                      {chat.unread}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* === MAIN CHAT AREA === */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            
            {/* Subtle Grid Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
            
            {/* CHAT HEADER */}
            {activeChat && (
              <div 
                className="h-20 flex items-center justify-between px-6 shrink-0"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center gap-4">
                  {activeChat.avatar ? (
                    <img 
                      src={activeChat.avatar} 
                      className="w-12 h-12 rounded-xl object-cover"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      alt="" 
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: activeChat.isAI 
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(0, 255, 212, 0.15) 0%, rgba(0, 255, 212, 0.05) 100%)',
                        border: `1px solid ${activeChat.isAI ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 255, 212, 0.2)'}`,
                      }}
                    >
                      {activeChat.isAI ? <Sparkles size={22} className="text-purple-400" /> : 
                       <Ghost size={22} className="text-cyan-400" />}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{activeChat.name}</span>
                      {activeChat.verified && <Shield size={14} className="text-cyan-400" />}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className={`flex items-center gap-1 ${activeChat.online ? 'text-green-400' : 'text-white/25'}`}>
                        <Wifi size={10} />
                        {activeChat.online ? 'CONNECTED' : 'OFFLINE'}
                      </span>
                      {activeChat.trust && (
                        <>
                          <span className="text-white/20">|</span>
                          <span className="text-cyan-400/60">TRUST: {activeChat.trust}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {!activeChat.isChannel && !activeChat.isAI && (
                    <>
                      <button className="w-11 h-11 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                        <Phone size={18} />
                      </button>
                      <button className="w-11 h-11 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                        <Video size={18} />
                      </button>
                    </>
                  )}
                  <button className="w-11 h-11 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                    <MoreVertical size={18} />
                  </button>
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <button 
                    onClick={onClose}
                    className="w-11 h-11 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-all"
                    data-testid="messenger-close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* MESSAGES STREAM */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
              {activeChat ? (
                <>
                  {/* Date Divider */}
                  <div className="flex justify-center mb-8">
                    <span 
                      className="px-4 py-1.5 text-[10px] font-mono text-white/30"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                      }}
                    >
                      // TODAY — SESSION ACTIVE
                    </span>
                  </div>

                  {/* Messages - DATA SHARDS */}
                  <div className="space-y-4">
                    {currentMessages.map((msg) => (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* INCOMING DATA SHARD */}
                        {msg.sender !== 'me' && (
                          <div className="max-w-[65%]">
                            {/* Meta Header */}
                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                              {msg.name && <span className="text-[10px] font-medium text-cyan-400/70">{msg.name}</span>}
                              {msg.encrypted && <Lock size={9} className="text-white/20" />}
                              <span className="text-[9px] font-mono text-white/20 tracking-wider">
                                {msg.isAI ? 'AI RESPONSE' : msg.encrypted ? 'ENCRYPTED' : 'MSG'}
                              </span>
                              <span className="text-[9px] font-mono text-white/15">{msg.time}</span>
                            </div>
                            {/* Message Shard */}
                            <div 
                              className="p-4"
                              style={{
                                background: msg.isAI 
                                  ? 'rgba(168, 85, 247, 0.08)' 
                                  : 'rgba(255, 255, 255, 0.03)',
                                borderLeft: msg.isAI 
                                  ? '2px solid rgba(168, 85, 247, 0.4)' 
                                  : '2px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '0 12px 12px 0',
                              }}
                            >
                              <p className="text-white/85 text-sm leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* OUTGOING DATA SHARD */}
                        {msg.sender === 'me' && (
                          <div className="max-w-[65%]">
                            {/* Meta Header */}
                            <div className="flex items-center justify-end gap-2 mb-1.5 mr-1">
                              <span className="text-[9px] font-mono text-white/15">{msg.time}</span>
                              <span className="text-[9px] font-mono text-cyan-400/40 tracking-wider">SENT</span>
                              {msg.status === 'read' && <CheckCheck size={11} className="text-cyan-400" />}
                            </div>
                            {/* Message Shard */}
                            <div 
                              className="p-4"
                              style={{
                                background: 'rgba(0, 255, 212, 0.06)',
                                borderRight: '2px solid rgba(0, 255, 212, 0.4)',
                                borderRadius: '12px 0 0 12px',
                              }}
                            >
                              <p className="text-white/90 text-sm leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Ghost size={48} className="text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 text-sm font-mono">Select a conversation</p>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT AREA - FLOATING CAPSULE */}
            {activeChat && (
              <div className="p-6 shrink-0">
                <div 
                  className="flex items-center gap-3 p-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Left Actions */}
                  <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                    <Paperclip size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                    <ImageIcon size={18} />
                  </button>
                  
                  {/* Input Field */}
                  <div className="flex-1 flex items-center gap-2 px-4">
                    <input 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={activeChat.isAI ? "Ask AI..." : "Transmit message..."} 
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-white/25 text-sm"
                    />
                    <button className="text-white/25 hover:text-white/50 transition-all">
                      <Smile size={18} />
                    </button>
                  </div>

                  {/* Right Actions */}
                  <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                    <Mic size={18} />
                  </button>

                  {/* Send Button */}
                  <motion.button 
                    onClick={handleSend}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: message.trim() 
                        ? 'linear-gradient(135deg, rgba(0, 255, 212, 0.9) 0%, rgba(0, 200, 170, 0.9) 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: message.trim() ? '#000' : 'rgba(255, 255, 255, 0.3)',
                      boxShadow: message.trim() ? '0 0 20px rgba(0, 255, 212, 0.3)' : 'none',
                    }}
                    data-testid="send-message-btn"
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
                
                {/* Status Line */}
                <div className="flex justify-center mt-3">
                  <span className="text-[9px] font-mono text-white/15 tracking-widest">
                    // E2E ENCRYPTED • GHOST PROTOCOL v2.0
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GhostMessenger;
