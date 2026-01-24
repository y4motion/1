import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Zap, MessageSquare, UserPlus, Share2, 
  MapPin, Terminal, Camera, Heart, Trophy, Hexagon, 
  Ghost, Star, Award, Eye, Flame, MoreHorizontal
} from 'lucide-react';
import { GhostMessenger } from './GhostMessenger';
import { ClassArtifact, CLASS_CONFIG } from '../system/ClassArtifact';
import { UserResonance, getTrustTier } from '../system/UserResonance';
import '../system/ClassArtifact.css';
import '../system/UserResonance.css';

// --- MOCK DATA with RPG attributes ---
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
  // RPG System
  classType: "architect", // architect | broker | observer
  trustScore: 850, // 0-1000 scale
  stats: {
    подписчики: "12.4K",
    траст: "98/100",
    сделки: 432
  },
  inventory: [
    { name: "Ghost Keycaps", rarity: "legendary", rarityLabel: "ЛЕГЕНДАРНЫЙ" },
    { name: "Holo Badge", rarity: "epic", rarityLabel: "ЭПИЧЕСКИЙ" },
    { name: "Void Deskmat", rarity: "rare", rarityLabel: "РЕДКИЙ" },
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

// 3D Rotating Class Artifact Component
const RotatingClassArtifact = ({ classType, size = 120 }) => {
  const config = CLASS_CONFIG[classType];
  if (!config) return null;

  return (
    <motion.div
      className="rotating-artifact-container"
      initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
      style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: size,
        height: size,
        perspective: '500px',
        zIndex: 40,
      }}
      data-testid="rotating-class-artifact"
    >
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: `radial-gradient(circle, ${config.secondaryColor} 0%, transparent 70%)`,
            borderRadius: '50%',
            padding: '20px',
            boxShadow: `0 0 60px ${config.secondaryColor}, 0 0 120px ${config.secondaryColor}`,
          }}
        >
          <ClassArtifact 
            classType={classType} 
            size="xl" 
            showGlow={true} 
            animated={true}
          />
        </div>
      </motion.div>
      {/* Class Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <span 
          className="px-3 py-1 rounded text-[10px] font-mono tracking-widest border"
          style={{ 
            color: config.color, 
            borderColor: config.color,
            backgroundColor: 'rgba(0,0,0,0.6)',
            textShadow: `0 0 10px ${config.color}`,
          }}
        >
          {config.label}
        </span>
      </motion.div>
    </motion.div>
  );
};

// Trust Score Aura Visualization
const TrustScoreAura = ({ trustScore, children }) => {
  const tier = getTrustTier(trustScore);
  
  // Get aura colors based on trust tier
  const getAuraConfig = () => {
    switch (tier) {
      case 'photon':
        return {
          color: 'rgba(34, 211, 238, 0.4)',
          glow: 'rgba(34, 211, 238, 0.6)',
          animation: 'photon-pulse',
          label: 'PHOTON ECHO',
          labelColor: '#22d3ee'
        };
      case 'neutral':
        return {
          color: 'rgba(255, 255, 255, 0.1)',
          glow: 'rgba(255, 255, 255, 0.2)',
          animation: null,
          label: 'STANDARD',
          labelColor: 'rgba(255,255,255,0.5)'
        };
      case 'decay':
        return {
          color: 'rgba(255, 159, 67, 0.3)',
          glow: 'rgba(255, 159, 67, 0.4)',
          animation: 'decay-flicker',
          label: 'SIGNAL DECAY',
          labelColor: '#FF9F43'
        };
      case 'glitch':
        return {
          color: 'rgba(255, 68, 68, 0.3)',
          glow: 'rgba(255, 68, 68, 0.4)',
          animation: 'glitch-jitter',
          label: 'ANOMALY',
          labelColor: '#FF4444'
        };
      case 'corrupted':
        return {
          color: 'rgba(255, 68, 68, 0.2)',
          glow: 'rgba(255, 68, 68, 0.3)',
          animation: 'corrupted-shake',
          label: 'CORRUPTED',
          labelColor: '#FF4444'
        };
      default:
        return {
          color: 'transparent',
          glow: 'transparent',
          animation: null,
          label: '',
          labelColor: 'white'
        };
    }
  };

  const auraConfig = getAuraConfig();

  return (
    <div className="relative" data-testid="trust-score-aura" data-tier={tier}>
      {/* Outer Aura Glow */}
      <motion.div
        className="absolute inset-0 rounded-[3rem]"
        style={{
          background: `radial-gradient(ellipse at center, ${auraConfig.color} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          transform: 'scale(1.3)',
          zIndex: 0,
        }}
        animate={tier === 'photon' ? {
          opacity: [0.6, 1, 0.6],
          scale: [1.25, 1.35, 1.25],
        } : tier === 'glitch' ? {
          x: [-2, 2, -2],
          opacity: [0.8, 0.5, 0.8],
        } : {}}
        transition={{
          duration: tier === 'photon' ? 3 : 0.3,
          repeat: Infinity,
          ease: tier === 'photon' ? 'easeInOut' : 'steps(3)',
        }}
      />
      
      {/* Inner Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-[3rem]"
        style={{
          boxShadow: `0 0 40px ${auraConfig.glow}, inset 0 0 20px ${auraConfig.color}`,
          zIndex: 1,
        }}
        animate={tier === 'glitch' || tier === 'corrupted' ? {
          boxShadow: [
            `0 0 40px ${auraConfig.glow}, inset 0 0 20px ${auraConfig.color}`,
            `0 0 20px ${auraConfig.glow}, inset 0 0 10px ${auraConfig.color}`,
            `0 0 40px ${auraConfig.glow}, inset 0 0 20px ${auraConfig.color}`,
          ]
        } : {}}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          ease: 'steps(2)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Trust Label Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20"
      >
        <span 
          className="px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider border backdrop-blur-sm"
          style={{ 
            color: auraConfig.labelColor,
            borderColor: auraConfig.labelColor,
            backgroundColor: 'rgba(0,0,0,0.7)',
            textShadow: `0 0 8px ${auraConfig.labelColor}`,
          }}
        >
          ◈ {auraConfig.label} • {trustScore}
        </span>
      </motion.div>
    </div>
  );
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
                <Star size={14} /> ИЗБРАННЫЙ РИГ
              </div>
            </div>
          </div>

          {/* === PROFILE BAR (HUGE AVATAR OVERLAP) === */}
          <div className="px-12 pb-10 border-b border-white/5 bg-black relative z-20">
            <div className="flex items-end justify-between -mt-32">
              
              {/* LEFT: GIANT AVATAR & INFO with RPG System */}
              <div className="flex items-end gap-10">
                {/* AVATAR with Trust Score Aura: w-64 h-64 (256px) - ГИГАНТСКИЙ */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative group"
                >
                  {/* Trust Score Aura Wrapper */}
                  <TrustScoreAura trustScore={USER.trustScore}>
                    <div className="w-64 h-64 rounded-[3rem] p-1.5 bg-black border-2 border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/20 relative">
                      <img 
                        src={USER.avatar} 
                        className="w-full h-full object-cover rounded-[2.8rem] transition-transform duration-700 group-hover:scale-105" 
                        alt="Avatar"
                      />
                    </div>
                  </TrustScoreAura>
                  
                  {/* 3D Rotating Class Artifact */}
                  <RotatingClassArtifact classType={USER.classType} size={100} />
                  
                  {/* Guild Badge */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute bottom-4 left-4 bg-black border border-white/20 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-30"
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
                  <UserPlus size={20} /> ПОДПИСАТЬСЯ
                </button>
                <button 
                  onClick={() => setMessengerOpen(true)}
                  className="h-16 px-10 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-lg font-bold rounded-2xl tracking-wider hover:bg-cyan-500/20 transition-all flex items-center gap-3"
                  data-testid="identity-message-btn"
                >
                  <MessageSquare size={20} /> НАПИСАТЬ
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
                <h3 className="font-mono text-xs text-white/40 mb-6 tracking-widest">РЕДКИЙ ЛУТ</h3>
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
                        }`}>{item.rarityLabel || item.rarity}</div>
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
                <h3 className="font-mono text-xs text-white/40 mb-6 tracking-widest">ТРОФЕИ</h3>
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
