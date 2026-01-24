import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Send, Paperclip, MoreVertical, Search, 
  Phone, Video, Image as ImageIcon, Users, Shield,
  ChevronDown, Smile, Mic, Settings, Bell, Pin,
  Archive, Trash2, Star, Check, CheckCheck, Ghost
} from 'lucide-react';

// --- MOCK CHATS ---
const CHATS = [
  { 
    id: 1, 
    name: "VOID_ARCHITECT", 
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
    lastMessage: "Offers: RTX 4090 за кейкапы...",
    time: "2m",
    online: true,
    unread: 2,
    verified: true
  },
  { 
    id: 2, 
    name: "NIGHTMARE_X", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    lastMessage: "Готов к обмену, напиши когда...",
    time: "15m",
    online: true,
    unread: 0,
    verified: false
  },
  { 
    id: 3, 
    name: "Ghost Support", 
    avatar: null,
    lastMessage: "Ваш вопрос решён! Спасибо...",
    time: "1h",
    online: true,
    unread: 0,
    verified: true,
    isSupport: true
  },
  { 
    id: 4, 
    name: "CYBER_PHOENIX", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    lastMessage: "Круто выглядит твой сетап!",
    time: "3h",
    online: false,
    unread: 0,
    verified: false
  },
];

// --- MOCK MESSAGES ---
const MESSAGES = [
  { id: 1, sender: 'them', text: "Привет! Видел твой сетап на главной. Огонь! 🔥", time: "14:32" },
  { id: 2, sender: 'them', text: "Где брал кейкапы Ghost? Давно ищу такие.", time: "14:32" },
  { id: 3, sender: 'me', text: "Привет! Это кастом с групбайка. GMK Ghost.", time: "14:35" },
  { id: 4, sender: 'me', text: "Могу скинуть ссылку на трейд если интересно.", time: "14:35" },
  { id: 5, sender: 'them', text: "Да, было бы круто! У меня есть RTX 4090 на обмен.", time: "14:38" },
  { id: 6, sender: 'me', text: "Оу, серьезное предложение. Давай обсудим детали.", time: "14:40", status: 'read' },
];

export const GhostMessenger = ({ isOpen, onClose }) => {
  const [activeChat, setActiveChat] = useState(CHATS[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MESSAGES);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'me',
      text: message,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }]);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* MESSENGER CONTAINER - FULL SCREEN */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed inset-4 z-[301] flex"
        onClick={(e) => e.stopPropagation()}
        data-testid="ghost-messenger"
      >
        <div className="w-full h-full bg-neutral-950 border border-white/10 rounded-[32px] overflow-hidden flex shadow-2xl shadow-cyan-500/5">
          
          {/* === LEFT SIDEBAR (CONTACTS) === */}
          <div className="w-[380px] border-r border-white/5 bg-black flex flex-col shrink-0">
            
            {/* HEADER */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center">
                  <Ghost size={20} className="text-black" />
                </div>
                <div>
                  <span className="font-bold text-white tracking-wide">GHOST LINK</span>
                  <div className="text-xs text-cyan-400 font-mono">ENCRYPTED.NET</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* SEARCH */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-white/20 transition-colors">
                <Search size={18} className="text-white/30" />
                <input 
                  placeholder="Search messages..." 
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {CHATS.map((chat) => (
                <motion.div 
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className={`p-4 border-b border-white/5 cursor-pointer flex gap-4 relative transition-all ${
                    activeChat.id === chat.id 
                      ? 'bg-white/[0.05] border-l-2 border-l-cyan-500' 
                      : 'border-l-2 border-l-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {chat.avatar ? (
                      <img src={chat.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-700/20 flex items-center justify-center border border-cyan-500/20">
                        <Ghost size={20} className="text-cyan-400" />
                      </div>
                    )}
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm truncate">{chat.name}</span>
                        {chat.verified && <Shield size={12} className="text-cyan-400" />}
                      </div>
                      <span className="text-white/30 text-xs font-mono">{chat.time}</span>
                    </div>
                    <p className="text-white/40 text-xs truncate">{chat.lastMessage}</p>
                  </div>

                  {/* Unread Badge */}
                  {chat.unread > 0 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-black text-xs font-bold">
                      {chat.unread}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* === MAIN CHAT AREA === */}
          <div className="flex-1 flex flex-col bg-neutral-900/50 relative">
            
            {/* CHAT HEADER */}
            <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-4">
                {activeChat.avatar ? (
                  <img src={activeChat.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-700/20 flex items-center justify-center border border-cyan-500/20">
                    <Ghost size={20} className="text-cyan-400" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">{activeChat.name}</span>
                    {activeChat.verified && <Shield size={14} className="text-cyan-400" />}
                  </div>
                  <div className={`text-xs font-mono flex items-center gap-1 ${activeChat.online ? 'text-green-400' : 'text-white/30'}`}>
                    <span className={`w-2 h-2 rounded-full ${activeChat.online ? 'bg-green-400' : 'bg-white/30'}`} />
                    {activeChat.online ? 'ONLINE' : 'OFFLINE'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <Phone size={20} />
                </button>
                <button className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <Video size={20} />
                </button>
                <button className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <MoreVertical size={20} />
                </button>
                <div className="w-px h-8 bg-white/10 mx-2" />
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                  data-testid="messenger-close"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* MESSAGES STREAM */}
            <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
              {/* Date Divider */}
              <div className="flex justify-center mb-8">
                <span className="px-4 py-1.5 bg-white/5 rounded-full text-xs font-mono text-white/30 border border-white/5">
                  TODAY
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-6">
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'me' && (
                      <img 
                        src={activeChat.avatar} 
                        className="w-8 h-8 rounded-full object-cover mr-3 mt-2 shrink-0" 
                        alt="" 
                      />
                    )}
                    <div className={`max-w-[60%] ${
                      msg.sender === 'me' 
                        ? 'bg-cyan-500/10 border-cyan-500/20 rounded-2xl rounded-tr-sm' 
                        : 'bg-white/5 border-white/5 rounded-2xl rounded-tl-sm'
                    } border p-4`}>
                      <p className="text-white/90 text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-2 mt-2 ${msg.sender === 'me' ? '' : 'justify-start'}`}>
                        <span className="text-[10px] text-white/30 font-mono">{msg.time}</span>
                        {msg.sender === 'me' && (
                          <CheckCheck size={14} className={msg.status === 'read' ? 'text-cyan-400' : 'text-white/30'} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-6 border-t border-white/5 bg-black/60 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-4">
                <button className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <Paperclip size={20} />
                </button>
                <button className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <ImageIcon size={20} />
                </button>
                
                <div className="flex-1 flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10 focus-within:border-cyan-500/30 transition-colors">
                  <input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                  />
                  <button className="text-white/30 hover:text-white transition-colors">
                    <Smile size={20} />
                  </button>
                </div>

                <button className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <Mic size={20} />
                </button>

                <motion.button 
                  onClick={handleSend}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 bg-cyan-500 text-black rounded-2xl flex items-center justify-center hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
                  data-testid="send-message-btn"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GhostMessenger;
