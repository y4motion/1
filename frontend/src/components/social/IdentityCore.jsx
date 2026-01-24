import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Monitor, Mouse, X, Shield, Zap, 
  MessageCircle, UserPlus, Share2, Award, 
  Trophy, Flame, Hexagon, Grid, Image as ImageIcon,
  Star, Heart, Eye, Sparkles, Ghost
} from 'lucide-react';

// --- 1. MOCK DATA (THE PERSONA) ---
const USER_DATA = {
  username: "VOID_ARCHITECT",
  handle: "@void_architect",
  level: 99,
  class: "ARCHITECT",
  joined: "2024",
  manifesto: "\"Мы не покупаем железо. Мы создаём миры.\"",
  guild: {
    name: "Ghost Walkers",
    rank: "Officer",
    icon: <Ghost size={14} />
  },
  stats: {
    followers: "12.4K",
    reputation: "98/100",
    trades: 432
  },
  theme: "cyan", // Options: cyan, red, amber, purple
  allies: [
    { id: 1, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    { id: 2, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    { id: 3, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    { id: 4, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
    { id: 5, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100" },
    { id: 6, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" },
  ],
  battlestation: {
    name: "Project: WHITE_VOID",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2642&auto=format&fit=crop",
    specs: [
      { icon: <Cpu size={14} />, label: "i9-14900K" },
      { icon: <Sparkles size={14} />, label: "RTX 4090" },
      { icon: <Monitor size={14} />, label: "OLED G9" },
    ]
  },
  achievements: [
    { id: 1, name: "Founder", icon: <Star size={18} />, color: "text-amber-400", desc: "Один из первых" },
    { id: 2, name: "Bug Hunter", icon: <Eye size={18} />, color: "text-red-400", desc: "Нашёл 50+ багов" },
    { id: 3, name: "Whale", icon: <Trophy size={18} />, color: "text-purple-400", desc: "Потратил 1M+ RP" },
    { id: 4, name: "Verified", icon: <Shield size={18} />, color: "text-cyan-400", desc: "Проверенный продавец" },
    { id: 5, name: "Streamer", icon: <Zap size={18} />, color: "text-pink-400", desc: "10K+ подписчиков" },
    { id: 6, name: "Collector", icon: <Hexagon size={18} />, color: "text-emerald-400", desc: "100+ предметов" },
    { id: 7, name: "OG", icon: <Ghost size={18} />, color: "text-white", desc: "С нами с 2023" },
    { id: 8, name: "Elite", icon: <Award size={18} />, color: "text-yellow-400", desc: "Топ 1% рейтинга" },
  ],
  feed: [
    { id: 1, type: 'image', src: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800', likes: 120, comments: 24 },
    { id: 2, type: 'image', src: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=800', likes: 89, comments: 12 },
    { id: 3, type: 'image', src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', likes: 240, comments: 56 },
    { id: 4, type: 'image', src: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800', likes: 55, comments: 8 },
    { id: 5, type: 'image', src: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800', likes: 180, comments: 32 },
    { id: 6, type: 'image', src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', likes: 320, comments: 78 },
  ],
  wishlist: [
    { id: 1, name: "Ghost Keycaps V2", progress: 65, price: "4,500 RP" },
    { id: 2, name: "Void Deskmat XL", progress: 30, price: "2,800 RP" },
    { id: 3, name: "Neon Underglow Kit", progress: 90, price: "1,200 RP" },
  ],
  inventory: [
    { id: 1, name: "Rare: Cyber Frame", rarity: "legendary" },
    { id: 2, name: "Holo Badge 2024", rarity: "epic" },
    { id: 3, name: "Ghost Cursor", rarity: "rare" },
  ]
};

// --- 2. AURA SYSTEM (THEME LOGIC) ---
const THEMES = {
  cyan: {
    glow: "shadow-[0_0_100px_rgba(6,182,212,0.15)]",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    gradient: "from-cyan-500/20 via-transparent to-transparent",
    pulse: "animate-pulse-cyan"
  },
  red: {
    glow: "shadow-[0_0_100px_rgba(239,68,68,0.15)]",
    border: "border-red-500/20",
    text: "text-red-400",
    bg: "bg-red-500/10",
    gradient: "from-red-500/20 via-transparent to-transparent",
    pulse: "animate-pulse-red"
  },
  amber: {
    glow: "shadow-[0_0_100px_rgba(245,158,11,0.15)]",
    border: "border-amber-500/20",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    gradient: "from-amber-500/20 via-transparent to-transparent",
    pulse: "animate-pulse-amber"
  },
  purple: {
    glow: "shadow-[0_0_100px_rgba(168,85,247,0.15)]",
    border: "border-purple-500/20",
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    gradient: "from-purple-500/20 via-transparent to-transparent",
    pulse: "animate-pulse-purple"
  },
};

// --- 3. RARITY COLORS ---
const RARITY_COLORS = {
  legendary: "from-amber-500 to-orange-500",
  epic: "from-purple-500 to-pink-500",
  rare: "from-cyan-500 to-blue-500",
  common: "from-gray-500 to-gray-600"
};

const IdentityCore = ({ isOpen, onClose }) => {
  const theme = THEMES[USER_DATA.theme];
  const [activeTab, setActiveTab] = useState('FEED');
  const [hoveredAchievement, setHoveredAchievement] = useState(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl"
        data-testid="identity-core-backdrop"
      />
      
      {/* MAIN CONTAINER */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-5 z-[10000] flex items-center justify-center"
        data-testid="identity-core-container"
      >
        <div 
          className={`relative w-full h-full max-w-[1600px] bg-black/70 border ${theme.border} rounded-[32px] overflow-hidden flex flex-col lg:flex-row ${theme.glow}`}
          style={{ backdropFilter: 'blur(40px)' }}
        >
          {/* AURA GRADIENT OVERLAY */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none opacity-50`} />
          
          {/* CLOSE BUTTON */}
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 z-50 p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:rotate-90 group"
            data-testid="identity-core-close"
          >
            <X size={24} className="text-white/60 group-hover:text-white transition-colors" />
          </button>

          {/* === COLUMN 1: THE PILOT (LEFT - 25%) === */}
          <div className="w-full lg:w-[320px] border-r border-white/5 p-6 lg:p-8 flex flex-col relative bg-white/[0.02] shrink-0 overflow-y-auto no-scrollbar">
            
            {/* AVATAR */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className={`relative w-full aspect-square rounded-[2rem] overflow-hidden border-2 ${theme.border} mb-6 group`}
            >
              <img 
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800" 
                alt="Avatar" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              {/* Aura Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Guild Badge Overlay */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-xs font-mono text-white/80"
              >
                <span className={theme.text}>{USER_DATA.guild.icon}</span>
                <span>{USER_DATA.guild.name}</span>
                <span className="text-white/40">•</span>
                <span className={theme.text}>{USER_DATA.guild.rank}</span>
              </motion.div>
            </motion.div>

            {/* IDENTITY */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-1">{USER_DATA.username}</h1>
              <div className="flex items-center gap-2 text-white/40 font-mono text-sm mb-3">
                <span>{USER_DATA.handle}</span>
                <span>•</span>
                <span className={theme.text}>LVL.{USER_DATA.level}</span>
              </div>
              {/* MANIFESTO */}
              <p className="text-sm text-white/50 italic leading-relaxed border-l-2 border-white/10 pl-4">
                {USER_DATA.manifesto}
              </p>
            </motion.div>

            {/* SOCIAL STATS (GRID) */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-2 mb-6"
            >
              {[
                { label: "FOLLOWERS", val: USER_DATA.stats.followers },
                { label: "TRUST", val: USER_DATA.stats.reputation },
                { label: "TRADES", val: USER_DATA.stats.trades },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={`bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border ${theme.border} hover:bg-white/10 transition-all cursor-default`}
                >
                  <span className="text-lg font-bold text-white">{stat.val}</span>
                  <span className="text-[9px] text-white/40 font-mono tracking-wider">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* ALLIES (FRIENDS) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h3 className="text-[10px] font-mono text-white/40 mb-3 tracking-widest">ALLIES</h3>
              <div className="flex -space-x-2">
                {USER_DATA.allies.map((ally, i) => (
                  <motion.div
                    key={ally.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 border-black hover:border-white/30 hover:z-10 hover:scale-110 transition-all cursor-pointer`}
                  >
                    <img src={ally.avatar} alt="Ally" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="w-10 h-10 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-xs text-white/40 font-mono"
                >
                  +99
                </motion.div>
              </div>
            </motion.div>

            {/* ACTIONS */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 mt-auto"
            >
              <button 
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all ${theme.bg} ${theme.text} hover:brightness-150 flex items-center justify-center gap-2`}
                data-testid="identity-follow-btn"
              >
                <UserPlus size={16} />
                Follow
              </button>
              <div className="flex gap-3">
                <button 
                  className="flex-1 py-4 bg-white/5 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                  data-testid="identity-message-btn"
                >
                  <MessageCircle size={18} />
                </button>
                <button 
                  className="flex-1 py-4 bg-white/5 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                  data-testid="identity-share-btn"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* === COLUMN 2: THE MAIN STAGE (CENTER - 50%) === */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black/30">
            
            {/* HERO: BATTLESTATION */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full h-[280px] lg:h-[350px] relative shrink-0 group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10" />
              <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-30 z-10`} />
              <img 
                src={USER_DATA.battlestation.image} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Battlestation" 
              />
              
              <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8 z-20">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between mb-4"
                >
                  <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{USER_DATA.battlestation.name}</h2>
                  <span className={`px-3 py-1 ${theme.bg} backdrop-blur rounded-full text-xs font-mono ${theme.text} border ${theme.border}`}>
                    FEATURED RIG
                  </span>
                </motion.div>
                
                {/* SPECS ROW */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-2 lg:gap-4"
                >
                  {USER_DATA.battlestation.specs.map((spec, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 lg:px-4 py-2 rounded-lg border ${theme.border} hover:bg-black/70 transition-all`}
                    >
                      <span className={theme.text}>{spec.icon}</span>
                      <span className="text-xs lg:text-sm font-mono text-white">{spec.label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* TABS */}
            <div className={`flex items-center gap-6 lg:gap-8 px-6 lg:px-8 py-4 lg:py-5 border-b ${theme.border} sticky top-0 bg-black/90 backdrop-blur-xl z-30`}>
              {['FEED', 'REVIEWS', 'MEDIA'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs lg:text-sm font-bold tracking-widest transition-all relative ${
                    activeTab === tab 
                      ? `text-white` 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  data-testid={`tab-${tab.toLowerCase()}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className={`absolute -bottom-4 lg:-bottom-5 left-0 right-0 h-0.5 ${theme.bg.replace('/10', '')}`}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* FEED CONTENT (MASONRY-ISH) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {USER_DATA.feed.map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`group relative rounded-2xl overflow-hidden border ${theme.border} hover:border-white/30 transition-all cursor-pointer ${
                      i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'
                    }`}
                  >
                    <img src={item.src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Feed" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-4">
                      <div className="flex items-center gap-1 text-white text-sm">
                        <Heart size={14} className={theme.text} /> {item.likes}
                      </div>
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <MessageCircle size={14} /> {item.comments}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* === COLUMN 3: TROPHY ROOM (RIGHT - 25%) === */}
          <div className="w-full lg:w-[280px] border-l border-white/5 p-5 lg:p-6 bg-white/[0.02] flex flex-col gap-6 shrink-0 overflow-y-auto no-scrollbar">
            
            {/* ACHIEVEMENTS / TROPHY CASE */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-[10px] font-mono text-white/40 mb-4 tracking-widest">TROPHY CASE</h3>
              <div className="grid grid-cols-4 gap-2">
                {USER_DATA.achievements.map((ach, i) => (
                  <motion.div 
                    key={ach.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05, type: "spring" }}
                    onMouseEnter={() => setHoveredAchievement(ach)}
                    onMouseLeave={() => setHoveredAchievement(null)}
                    className={`aspect-square bg-white/5 rounded-xl flex items-center justify-center border ${theme.border} hover:bg-white/10 hover:scale-110 group cursor-pointer relative transition-all duration-300`}
                  >
                    <span className={ach.color}>{ach.icon}</span>
                    
                    {/* Tooltip */}
                    {hoveredAchievement?.id === ach.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 whitespace-nowrap z-50"
                      >
                        <div className={`text-xs font-bold ${ach.color}`}>{ach.name}</div>
                        <div className="text-[10px] text-white/50">{ach.desc}</div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* INVENTORY HIGHLIGHTS */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-[10px] font-mono text-white/40 mb-4 tracking-widest">RARE INVENTORY</h3>
              <div className="flex flex-col gap-2">
                {USER_DATA.inventory.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${RARITY_COLORS[item.rarity]} bg-opacity-10 border border-white/5 hover:border-white/20 transition-all cursor-pointer group`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${RARITY_COLORS[item.rarity]} flex items-center justify-center`}>
                      <Hexagon size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className={`text-[10px] capitalize bg-gradient-to-r ${RARITY_COLORS[item.rarity]} bg-clip-text text-transparent`}>
                        {item.rarity}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* WISHLIST */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex-1"
            >
              <h3 className="text-[10px] font-mono text-white/40 mb-4 tracking-widest">WISHLIST</h3>
              <div className="flex flex-col gap-3">
                {USER_DATA.wishlist.map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex gap-3 items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/10"
                  >
                    <div className={`w-10 h-10 ${theme.bg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <ImageIcon size={16} className={theme.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white mb-1 truncate">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                            className={`h-full ${theme.bg.replace('/10', '')} rounded-full`}
                          />
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">{item.progress}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* TRADE BUTTON */}
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className={`w-full py-4 border-2 border-dashed ${theme.border} rounded-xl text-xs font-mono ${theme.text} hover:bg-white/5 hover:border-solid transition-all uppercase flex items-center justify-center gap-2 group`}
              data-testid="identity-trade-btn"
            >
              <Share2 size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
              Initiate Trade
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IdentityCore;
