import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Zap, MessageCircle, UserPlus, Share2, 
  MapPin, Link as LinkIcon, Calendar, Camera, Heart, 
  Trophy, Hexagon, Terminal, MoreHorizontal, Ghost,
  Star, Award, Eye, Flame
} from 'lucide-react';

// --- MOCK DATA ---
const USER = {
  name: "VOID_ARCHITECT",
  handle: "@void_architect",
  lvl: 99,
  bio: "Мы не покупаем железо. Мы создаём миры. // Ghost Founder",
  joined: "September 2024",
  location: "Neo-Tokyo Server",
  theme: "cyan", // 'cyan' | 'white' | 'red'
  cover: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2642&auto=format&fit=crop",
  avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
  guild: {
    name: "Ghost Walkers",
    rank: "Officer"
  },
  stats: {
    followers: "12.4K",
    trust: "98/100",
    trades: 432
  },
  inventory: [
    { name: "Ghost Keycaps", rarity: "legendary", color: "text-amber-400" },
    { name: "Holo Badge", rarity: "epic", color: "text-purple-400" },
    { name: "Void Deskmat", rarity: "rare", color: "text-cyan-400" },
    { name: "Cyber Frame", rarity: "legendary", color: "text-amber-400" },
  ],
  allies: [
    { id: 1, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    { id: 2, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    { id: 3, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    { id: 4, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
    { id: 5, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100" },
    { id: 6, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" },
    { id: 7, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100" },
    { id: 8, avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100" },
  ],
  feed: [
    { id: 1, img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800', likes: 120 },
    { id: 2, img: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=800', likes: 89 },
    { id: 3, img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', likes: 240 },
    { id: 4, img: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800', likes: 55 },
    { id: 5, img: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800', likes: 180 },
    { id: 6, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', likes: 320 },
  ]
};

const IdentityCore = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('FEED');

  // Theme Logic (Aura)
  const glowColor = USER.theme === 'cyan' ? 'shadow-[0_0_80px_rgba(6,182,212,0.15)]' : 'shadow-[0_0_80px_rgba(255,255,255,0.1)]';
  const accentColor = USER.theme === 'cyan' ? 'text-cyan-400' : 'text-white';
  const accentBorder = USER.theme === 'cyan' ? 'border-cyan-500/20' : 'border-white/20';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl"
        data-testid="identity-core-backdrop"
      />

      {/* MAIN CANVAS (Almost Full Screen - 95vw) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`fixed inset-0 z-[10000] flex items-center justify-center p-4`}
        data-testid="identity-core-container"
      >
        <div className={`relative w-[95vw] max-w-[1800px] h-[92vh] bg-black border border-white/10 rounded-[32px] overflow-hidden flex flex-col ${glowColor}`}>
          
          {/* CLOSE BTN */}
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 z-50 bg-black/50 backdrop-blur-md p-3 rounded-full border border-white/10 hover:bg-white/20 transition-all hover:rotate-90 duration-300"
            data-testid="identity-close-btn"
          >
            <X className="text-white" size={20} />
          </button>

          {/* === 1. HERO COVER (BATTLESTATION - FULL WIDTH) === */}
          <div className="h-[350px] w-full relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={USER.cover} 
              className="w-full h-full object-cover" 
              alt="Cover" 
            />
            
            {/* Cover Badges */}
            <div className="absolute top-6 left-6 z-20 flex gap-3">
              <div className={`px-4 py-2 bg-black/60 backdrop-blur-xl border ${accentBorder} rounded-full text-xs font-mono ${accentColor} flex items-center gap-2`}>
                <Camera size={12} /> PROJ: WHITE_VOID
              </div>
              <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-xs font-mono text-white/70 flex items-center gap-2">
                <Star size={12} /> FEATURED RIG
              </div>
            </div>
          </div>

          {/* === 2. PROFILE BAR (Avatar Overlap) === */}
          <div className="px-10 pb-6 border-b border-white/5 bg-black relative z-20">
            <div className="flex items-end justify-between -mt-20">
              
              {/* LEFT: AVATAR & INFO */}
              <div className="flex items-end gap-8">
                {/* BIG AVATAR (Overlapping) */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
                >
                  <div className={`w-48 h-48 rounded-[2.5rem] p-1 bg-black border-2 ${accentBorder} overflow-hidden relative z-10 ${glowColor}`}>
                    <img src={USER.avatar} className="w-full h-full object-cover rounded-[2.2rem]" alt="Avatar" />
                  </div>
                  {/* Guild Badge */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute -bottom-2 -right-2 bg-neutral-900 border border-white/10 px-3 py-2 rounded-xl z-20 shadow-xl flex items-center gap-2"
                  >
                    <Ghost className={`w-4 h-4 ${accentColor}`} />
                    <span className="text-xs font-mono text-white/70">{USER.guild.name}</span>
                  </motion.div>
                </motion.div>

                {/* NAMES */}
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 space-y-2"
                >
                  <h1 className="text-4xl font-bold text-white tracking-tight">{USER.name}</h1>
                  <div className="flex items-center gap-4 text-white/40 font-mono text-sm">
                    <span>{USER.handle}</span>
                    <span className={`flex items-center gap-1 ${accentColor}`}>
                      <Terminal size={12} /> LVL.{USER.lvl}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {USER.location}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT: ACTIONS */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 mb-4"
              >
                <button 
                  className="h-12 px-8 bg-white text-black font-bold rounded-xl tracking-wider hover:scale-105 transition-transform flex items-center gap-2"
                  data-testid="identity-follow-btn"
                >
                  <UserPlus size={18} /> FOLLOW
                </button>
                <button 
                  className="h-12 w-12 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
                  data-testid="identity-message-btn"
                >
                  <MessageCircle size={20} />
                </button>
                <button 
                  className="h-12 w-12 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
                  data-testid="identity-share-btn"
                >
                  <Share2 size={20} />
                </button>
                <button className="h-12 w-12 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </motion.div>
            </div>

            {/* BIO & STATS ROW */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-start justify-between"
            >
              <p className="max-w-2xl text-white/50 text-lg italic font-light border-l-2 border-white/10 pl-4">
                "{USER.bio}"
              </p>
              
              <div className="flex gap-10">
                {Object.entries(USER.stats).map(([key, val]) => (
                  <div key={key} className="text-right">
                    <div className="text-2xl font-bold text-white font-mono">{val}</div>
                    <div className="text-[10px] font-mono uppercase text-white/30 tracking-widest">{key}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* === 3. CONTENT GRID (SCROLLABLE) === */}
          <div className="flex-1 overflow-hidden flex bg-neutral-950/50">
            
            {/* LEFT SIDEBAR (Inventory/Trophies) - Ghost Style */}
            <div className="w-[280px] border-r border-white/5 p-6 overflow-y-auto no-scrollbar hidden xl:block">
              <h3 className="font-mono text-[10px] text-white/30 mb-6 uppercase tracking-[3px]">Rare Inventory</h3>
              <div className="space-y-3">
                {USER.inventory.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-center gap-4 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg border border-white/10 bg-transparent flex items-center justify-center ${item.color} group-hover:shadow-lg transition-shadow`}
                      style={{ 
                        boxShadow: item.rarity === 'legendary' 
                          ? '0 0 20px rgba(251,191,36,0.15)' 
                          : item.rarity === 'epic' 
                          ? '0 0 20px rgba(168,85,247,0.15)' 
                          : '0 0 20px rgba(6,182,212,0.1)'
                      }}
                    >
                      <Hexagon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.name}</div>
                      <div className={`text-[10px] uppercase font-mono ${item.color} opacity-70`}>{item.rarity}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Achievements Section */}
              <h3 className="font-mono text-[10px] text-white/30 mt-10 mb-6 uppercase tracking-[3px]">Trophy Case</h3>
              <div className="grid grid-cols-4 gap-2">
                {[Star, Shield, Trophy, Award, Zap, Eye, Flame, Ghost].map((Icon, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.05, type: "spring" }}
                    className="aspect-square rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <Icon size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* MAIN FEED - Takes most space */}
            <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
              {/* Tabs */}
              <div className="flex gap-8 border-b border-white/5 pb-4 mb-8 sticky top-0 bg-neutral-950/80 backdrop-blur-xl z-10 -mt-2 pt-2">
                {['FEED', 'REVIEWS', 'MEDIA', 'LIKES'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-bold tracking-widest transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                    data-testid={`tab-${tab.toLowerCase()}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className={`absolute -bottom-4 left-0 right-0 h-0.5 ${USER.theme === 'cyan' ? 'bg-cyan-400' : 'bg-white'}`}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Masonry Grid with Real Images */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {USER.feed.map((item, n) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + n * 0.08 }}
                    className={`${n % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'} rounded-2xl border border-white/5 hover:border-white/20 transition-all relative group overflow-hidden cursor-pointer`}
                  >
                    <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="flex items-center gap-4 text-white">
                        <span className="flex items-center gap-1 text-sm">
                          <Heart size={14} className={accentColor} /> {item.likes}
                        </span>
                        <span className="text-xs font-mono text-white/50">Setup Update v.{n + 1}.0</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDEBAR (Allies/Activity) - Ghost Style */}
            <div className="w-[280px] border-l border-white/5 p-6 hidden 2xl:block overflow-y-auto no-scrollbar">
              <h3 className="font-mono text-[10px] text-white/30 mb-6 uppercase tracking-[3px]">Guild Allies</h3>
              <div className="grid grid-cols-4 gap-2">
                {USER.allies.map((ally, n) => (
                  <motion.div 
                    key={ally.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + n * 0.05, type: "spring" }}
                    className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-white/20 cursor-pointer hover:scale-110 transition-all"
                  >
                    <img src={ally.avatar} className="w-full h-full object-cover" alt="" />
                  </motion.div>
                ))}
              </div>

              {/* Trade Button */}
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className={`w-full mt-10 py-4 border border-dashed ${accentBorder} rounded-xl text-xs font-mono ${accentColor} hover:bg-white/5 transition-all uppercase flex items-center justify-center gap-2`}
                data-testid="identity-trade-btn"
              >
                <Share2 size={14} /> Initiate Trade
              </motion.button>

              {/* Recent Activity */}
              <h3 className="font-mono text-[10px] text-white/30 mt-10 mb-6 uppercase tracking-[3px]">Recent Activity</h3>
              <div className="space-y-3">
                {['Liked a setup', 'Posted new media', 'Earned badge', 'Completed trade'].map((activity, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                    className="text-xs text-white/30 py-2 border-b border-white/5 last:border-0"
                  >
                    {activity}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IdentityCore;
