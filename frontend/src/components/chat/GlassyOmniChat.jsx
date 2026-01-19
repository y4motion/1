/**
 * GlassyOmniChat - "Дышащая полоска" с морфингом
 * 
 * Agar Acrylic Style - глубокий матовый пластик с подсветкой
 * 
 * STATE 1: Breathing Strip (Idle) - широкая пульсирующая полоска
 * STATE 2: Expanded HUD - "вырастает" из полоски с плавным морфингом
 * INPUT ISLAND: Отдельный "островок" для ввода
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Globe,
  Shield,
  ShoppingBag,
  Cpu,
  Activity,
  X,
  Send,
  Mic,
  Sparkles,
  AlertTriangle,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SmartChannelSwitcher from './SmartChannelSwitcher';
import './GlassyOmniChat.css';

// --- TAB DEFINITIONS ---
const TABS = [
  { id: 'ai', icon: Bot, label: 'Glassy AI', labelRu: 'ИИ Помощник', color: 'text-purple-400', bgColor: '#8b5cf6' },
  { id: 'global', icon: Globe, label: 'Global', labelRu: 'Общий', color: 'text-blue-400', bgColor: '#3b82f6' },
  { id: 'guilds', icon: Shield, label: 'Guilds', labelRu: 'Гильдии', color: 'text-amber-400', bgColor: '#f59e0b', requiresLevel: 5 },
  { id: 'trade', icon: ShoppingBag, label: 'Trade', labelRu: 'Торговля', color: 'text-emerald-400', bgColor: '#22c55e' },
  { id: 'support', icon: Headphones, label: 'Support', labelRu: 'Поддержка', color: 'text-red-400', bgColor: '#ef4444', hidden: true },
];

// API URL
const API_URL = '';

export default function GlassyOmniChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [aiStatus, setAiStatus] = useState('idle'); // idle, analyzing, ready
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);

  // Context Awareness Logic
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('pc-builder') || path.includes('assembly')) {
      setActiveTab('ai');
      setAiStatus('analyzing');
    } else if (path.includes('marketplace') || path.includes('product')) {
      setActiveTab('trade');
      setAiStatus('idle');
    } else if (path.includes('glassy-swap')) {
      setActiveTab('trade');
      setAiStatus('idle');
    } else if (path.includes('mod') || path.includes('mods')) {
      const userLevel = user?.level || 0;
      setActiveTab(userLevel >= 5 ? 'guilds' : 'global');
      setAiStatus('idle');
    } else {
      setAiStatus('idle');
    }
  }, [location, user?.level]);

  // Support Trigger
  const triggerSupport = useCallback((reason = 'User requested support') => {
    setActiveTab('support');
    setIsOpen(true);
    setMessages(prev => ({
      ...prev,
      support: [
        ...(prev.support || []),
        { id: Date.now(), type: 'system', text: `Support session started: ${reason}`, timestamp: new Date() }
      ]
    }));
  }, []);

  // Expose trigger globally
  useEffect(() => {
    window.triggerGlassySupport = triggerSupport;
    return () => { delete window.triggerGlassySupport; };
  }, [triggerSupport]);

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
                text: data.response || 'Я понял. Чем ещё могу помочь?',
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

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];
  const currentMessages = messages[activeTab] || [];
  const userLevel = user?.level || 0;

  // Activity bars for visual flourish
  const activityBars = [...Array(5)].map((_, i) => ({
    height: Math.random() * 100,
    delay: i * 0.1
  }));

  return (
    <div 
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center items-end pointer-events-none"
      data-testid="glassy-omni-chat"
    >
      <AnimatePresence mode="wait">
        
        {/* === STATE 1: BREATHING STRIP (IDLE) === */}
        {!isOpen && (
          <motion.div
            layoutId="glassy-chat"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto cursor-pointer group"
          >
            {/* The Strip Container - Ethereal Artifact */}
            <div className={`agar-acrylic breathing-border ${aiStatus === 'analyzing' ? 'analyzing' : ''} h-12 w-[420px] rounded-[2rem] flex items-center justify-between px-6 transition-all duration-500 group-hover:w-[440px] group-hover:scale-[1.02]`}>
              
              {/* Left: Status Indicator - Amber when thinking */}
              <div className="flex items-center gap-3">
                <div 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${aiStatus === 'analyzing' ? 'animate-pulse' : ''}`}
                  style={{ 
                    backgroundColor: aiStatus === 'analyzing' ? '#FF9F43' : '#22c55e',
                    boxShadow: aiStatus === 'analyzing' 
                      ? '0 0 12px #FF9F43, 0 0 24px rgba(255, 159, 67, 0.4)' 
                      : '0 0 8px #22c55e' 
                  }} 
                />
                <span className="text-[11px] font-mono text-white/50 tracking-[0.15em] uppercase">
                  {aiStatus === 'analyzing' ? 'AI PROCESSING...' : 'ONLINE'}
                </span>
              </div>

              {/* Center: Subtle Activity Graph - Amber tint when active */}
              <div className="flex gap-[3px] h-3 items-end opacity-40">
                {activityBars.map((bar, i) => (
                  <div 
                    key={i} 
                    className="w-[3px] rounded-t-sm animate-pulse" 
                    style={{ 
                      height: `${bar.height}%`, 
                      animationDelay: `${bar.delay}s`,
                      backgroundColor: aiStatus === 'analyzing' ? '#FF9F43' : 'rgba(255,255,255,0.6)'
                    }} 
                  />
                ))}
              </div>

              {/* Right: Context Icon */}
              <div className="text-white/30">
                <Cpu size={14} />
              </div>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          </motion.div>
        )}

        {/* === STATE 2: EXPANDED HUD (OPEN) === */}
        {isOpen && (
          <div className="pointer-events-auto relative">
             {/* Main Window */}
            <motion.div
              layoutId="glassy-chat"
              className="agar-acrylic w-[500px] h-[600px] rounded-[2rem] overflow-hidden flex flex-col relative mb-4"
            >
              {/* Header / Tabs - Ethereal style */}
              <div className="h-16 border-b border-white/[0.06] flex items-center justify-between px-5 bg-white/[0.02]">
                <div className="flex gap-2">
                  {TABS.filter(t => !t.hidden).map((tab) => {
                    const isLocked = tab.requiresLevel && userLevel < tab.requiresLevel;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => !isLocked && setActiveTab(tab.id)}
                        disabled={isLocked}
                        className={`p-2 rounded-xl transition-all relative ${
                          activeTab === tab.id 
                            ? 'bg-white/10 text-white' 
                            : isLocked 
                              ? 'text-white/20 cursor-not-allowed' 
                              : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        <tab.icon size={20} className={activeTab === tab.id ? tab.color : ''} />
                        {activeTab === tab.id && (
                          <motion.div 
                            layoutId="tab-glow" 
                            className="absolute inset-0 rounded-xl bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                          />
                        )}
                        {isLocked && <span className="absolute -top-1 -right-1 text-[8px]">🔒</span>}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-white/30 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Smart Channel Switcher for Guilds/Trade */}
              {(activeTab === 'guilds' || activeTab === 'trade') && (
                <SmartChannelSwitcher
                  mode={activeTab}
                  activeChannel={null}
                  onChannelChange={() => {}}
                  userLevel={userLevel}
                />
              )}

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {currentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                      <Sparkles size={28} className="text-amber-400/80" />
                    </div>
                    <p className="text-white/50 text-sm max-w-[250px]">
                      {activeTab === 'ai' 
                        ? (language === 'ru' ? 'Спросите меня о совместимости ПК' : 'Ask me about PC compatibility')
                        : (language === 'ru' ? 'Нет сообщений' : 'No messages yet')
                      }
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.type === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                          <Bot size={16} className="text-amber-400" />
                        </div>
                      )}
                      <div className="flex-1 max-w-[80%]">
                        {msg.type === 'bot' && (
                          <div className="text-[10px] text-amber-400/60 mb-1 font-mono tracking-wider">GLASSY MIND</div>
                        )}
                        <div className={`p-4 rounded-[1.25rem] text-sm leading-relaxed ${
                          msg.type === 'user' 
                            ? 'bg-white/[0.08] border border-white/[0.1] text-white ml-auto' 
                            : 'bg-white/[0.03] border border-white/[0.06] text-gray-200'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-white/30 mt-1 block">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                
                {isTyping && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Bot size={16} className="text-amber-400" />
                    </div>
                    <div className="p-4 rounded-[1.25rem] bg-white/[0.03] border border-white/[0.06] flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Support Mode Warning */}
              {activeTab === 'support' && (
                <div className="flex items-center justify-center gap-2 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs font-semibold">
                  <AlertTriangle size={14} />
                  <span>{language === 'ru' ? 'Экстренная линия поддержки' : 'Emergency Support Line'}</span>
                </div>
              )}

              {/* Decorative Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </motion.div>

            {/* Input Island (Detached) - Like a Keyboard Spacebar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
              className="agar-acrylic h-14 w-[480px] mx-auto rounded-[2rem] flex items-center px-3 gap-2"
            >
               <button className="p-3 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all">
                 <Mic size={20} />
               </button>
               <input 
                 type="text" 
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                 placeholder={language === 'ru' ? 'Спросить Glassy AI или написать в чат...' : 'Ask Glassy AI or chat with guild...'} 
                 className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm"
               />
               <button 
                 onClick={sendMessage}
                 disabled={!inputValue.trim()}
                 className="p-3 rounded-full bg-white/[0.08] text-white/80 hover:bg-amber-500/80 hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,159,67,0.4)] disabled:opacity-30 disabled:cursor-not-allowed"
               >
                 <Send size={18} />
               </button>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
