import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Zap, MessageSquare, UserPlus, Share2, 
  MapPin, Terminal, Camera, Heart, Trophy, Hexagon, 
  Ghost, Star, Award, Eye, Flame, MoreHorizontal
} from 'lucide-react';
import { GhostMessenger } from './GhostMessenger';

// --- MOCK DATA ---
const USER = {
  name: "VOID_ARCHITECT",
  handle: "@void_architect",
  lvl: 99,
  bio: "Мы не покупаем железо. Мы создаём миры. // Ghost Founder",
  joined: "September 2024",
  location: "Neo-Tokyo Server",
  theme: "cyan",
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
    { name: "Ghost Keycaps", rarity: "legendary" },
    { name: "Holo Badge", rarity: "epic" },
    { name: "Void Deskmat", rarity: "rare" },
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
  const [messengerOpen, setMessengerOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* BACKDROP - PURE BLACK */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black"
        data-testid="identity-backdrop"
      />

      {/* MAIN CONTAINER - FORCE FULL WIDTH (98vw) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed inset-0 z-[201] flex items-center justify-center"
        data-testid="identity-container"
      >
        <div className="w-[98vw] h-[95vh] bg-black border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10">
          
          {/* CLOSE BUTTON */}
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 z-50 bg-black/60 backdrop-blur-xl p-4 rounded-full border border-white/10 hover:bg-white/20 hover:rotate-90 transition-all duration-300"
            data-testid="identity-close"
          >
            <X className="text-white" size={24} />
          </button>

          {/* === HUGE COVER (40vh) === */}
          <div className="h-[40vh] w-full relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={USER.cover} 
              className="w-full h-full object-cover" 
              alt="Cover"
            />
            
            {/* Cover Badges */}
            <div className="absolute top-8 left-10 z-20 flex gap-3">
              <div className="px-5 py-2.5 bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-full text-sm font-mono text-cyan-400 flex items-center gap-2">
                <Camera size={14} /> PROJ: WHITE_VOID
              </div>
              <div className="px-5 py-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-sm font-mono text-white/70 flex items-center gap-2">
                <Star size={14} /> FEATURED RIG
              </div>
            </div>
          </div>

          {/* === PROFILE BAR (HUGE AVATAR OVERLAP) === */}
          <div className="px-12 pb-10 border-b border-white/5 bg-black relative z-20">
            <div className="flex items-end justify-between -mt-32">
              
              {/* LEFT: GIANT AVATAR & INFO */}
              <div className="flex items-end gap-10">
                {/* AVATAR: w-64 h-64 (256px) - ГИГАНТСКИЙ */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative group"
                >
                  <div className="w-64 h-64 rounded-[3rem] p-1.5 bg-black border-2 border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/20">
                    <img 
                      src={USER.avatar} 
                      className="w-full h-full object-cover rounded-[2.8rem] transition-transform duration-700 group-hover:scale-105" 
                      alt="Avatar"
                    />
                  </div>
                  {/* Guild Badge */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute bottom-4 right-4 bg-black border border-white/20 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-30"
                  >
                    <Ghost className="text-cyan-400 w-6 h-6" />
                    <div>
                      <div className="text-white font-bold text-sm">{USER.guild.name}</div>
                      <div className="text-white/40 text-xs font-mono">{USER.guild.rank}</div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* NAMES - HUGE TYPOGRAPHY */}
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 space-y-3"
                >
                  <h1 className="text-6xl font-bold text-white tracking-tighter">{USER.name}</h1>
                  <div className="flex items-center gap-6 text-white/50 font-mono text-lg">
                    <span>{USER.handle}</span>
                    <span className="text-cyan-400 flex items-center gap-2">
                      <Terminal size={16} /> LVL.{USER.lvl}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={16} /> {USER.location}
                    </span>
                  </div>
                  {/* BIO */}
                  <p className="max-w-2xl text-white/40 text-lg italic border-l-2 border-white/10 pl-4 mt-4">
                    "{USER.bio}"
                  </p>
                </motion.div>
              </div>

              {/* RIGHT: ACTIONS */}
              <motion.div 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 mb-6"
              >
                <button className="h-16 px-10 bg-white text-black text-lg font-bold rounded-2xl tracking-wider hover:scale-105 transition-transform flex items-center gap-3">
                  <UserPlus size={20} /> FOLLOW
                </button>
                <button 
                  onClick={() => setMessengerOpen(true)}
                  className="h-16 px-10 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-lg font-bold rounded-2xl tracking-wider hover:bg-cyan-500/20 transition-all flex items-center gap-3"
                  data-testid="identity-message-btn"
                >
                  <MessageSquare size={20} /> MESSAGE
                </button>
                <button className="h-16 w-16 border border-white/20 rounded-2xl flex items-center justify-center text-white/60 hover:bg-white/10 transition-all">
                  <Share2 size={22} />
                </button>
                <button className="h-16 w-16 border border-white/20 rounded-2xl flex items-center justify-center text-white/60 hover:bg-white/10 transition-all">
                  <MoreHorizontal size={22} />
                </button>
              </motion.div>
            </div>

            {/* STATS ROW */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end mt-6 gap-12"
            >
              {Object.entries(USER.stats).map(([key, val]) => (
                <div key={key} className="text-right">
                  <div className="text-3xl font-bold text-white font-mono">{val}</div>
                  <div className="text-xs font-mono uppercase text-white/30 tracking-widest">{key}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* === CONTENT GRID === */}
          <div className="flex-1 bg-white/[0.02] p-10 grid grid-cols-4 gap-8 overflow-y-auto no-scrollbar">
            
            {/* FEED (MASONRY STYLE - 3 COLS) */}
            <div className="col-span-3 grid grid-cols-3 gap-4 h-fit">
              {USER.feed.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`rounded-2xl bg-white/5 border border-white/5 overflow-hidden cursor-pointer group relative ${
                    i === 0 ? 'col-span-2 row-span-2 aspect-video' : 'aspect-square'
                  }`}
                >
                  <img 
                    src={item.img} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="flex items-center gap-2 text-white text-sm">
                      <Heart size={16} className="text-cyan-400" /> {item.likes}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* SIDEBAR */}
            <div className="col-span-1 space-y-6">
              {/* RARE LOOT */}
              <motion.div 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="p-6 rounded-3xl border border-white/5 bg-black/40"
              >
                <h3 className="font-mono text-xs text-white/40 mb-6 tracking-widest">RARE LOOT</h3>
                <div className="space-y-3">
                  {USER.inventory.map((item, i) => (
                    <div 
                      key={i} 
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center gap-4 cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center ${
                        item.rarity === 'legendary' ? 'text-amber-400' : 
                        item.rarity === 'epic' ? 'text-purple-400' : 'text-cyan-400'
                      }`}>
                        <Hexagon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white/80">{item.name}</div>
                        <div className={`text-[10px] uppercase font-mono ${
                          item.rarity === 'legendary' ? 'text-amber-400' : 
                          item.rarity === 'epic' ? 'text-purple-400' : 'text-cyan-400'
                        }`}>{item.rarity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* TROPHY CASE */}
              <motion.div 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="p-6 rounded-3xl border border-white/5 bg-black/40"
              >
                <h3 className="font-mono text-xs text-white/40 mb-6 tracking-widest">TROPHY CASE</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[Star, Shield, Trophy, Award, Zap, Eye, Flame, Ghost].map((Icon, i) => (
                    <div 
                      key={i} 
                      className="aspect-square rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                    >
                      <Icon size={16} className="text-white/30 hover:text-white/60" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GHOST MESSENGER - Opens on top */}
      <GhostMessenger 
        isOpen={messengerOpen} 
        onClose={() => setMessengerOpen(false)} 
      />
    </AnimatePresence>
  );
};

export default IdentityCore;
