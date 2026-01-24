/**
 * CommunityPage.jsx - THE NEURAL FEED
 * 
 * Социальный движок Web 4.0:
 * - Masonry Grid (Pinterest-style)
 * - Terminal Input для создания
 * - Resonance, Echoes, Awards
 * - Feed Tabs: NEURO, FRESH, ELITE
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Share2, Award, MessageSquare, Image, FileText, HelpCircle,
  TrendingUp, Clock, Crown, Sparkles, Heart, Eye, MoreHorizontal,
  Send, Camera, Video, Link2, Hash, AtSign, ChevronRight, Filter,
  Play, Bookmark, Flag, X
} from 'lucide-react';

// === FEED TABS ===
const FEED_TABS = [
  { id: 'neuro', label: 'NEURO', icon: Sparkles, description: 'AI Recommendations' },
  { id: 'fresh', label: 'FRESH', icon: Clock, description: 'Chronological' },
  { id: 'elite', label: 'ELITE', icon: Crown, description: 'Top Users 90+' },
];

// === MOCK POSTS DATA ===
const MOCK_POSTS = [
  {
    id: 1,
    type: 'setup',
    author: { name: 'VOID_ARCHITECT', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 94, verified: true },
    content: 'Финальная версия моего battlestation. 2 года в разработке. RTX 4090 + Custom Loop.',
    images: ['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800'],
    resonance: 1247,
    echoes: 89,
    comments: 156,
    awards: 12,
    time: '2h',
    tags: ['setup', 'battlestation', 'rtx4090'],
    hasVideo: false,
    tall: true,
  },
  {
    id: 2,
    type: 'question',
    author: { name: 'NEWBIE_GAMER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', level: 12 },
    content: 'Что лучше для 1440p гейминга — RTX 4070 Ti или RX 7800 XT? Бюджет ограничен.',
    resonance: 234,
    echoes: 5,
    comments: 67,
    awards: 0,
    time: '4h',
    tags: ['help', 'gpu', 'budget'],
    tall: false,
  },
  {
    id: 3,
    type: 'article',
    author: { name: 'TECH_PROPHET', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', level: 87, verified: true },
    content: 'Полный гайд по кастомному водяному охлаждению в 2025. От выбора компонентов до сборки.',
    images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800'],
    resonance: 892,
    echoes: 234,
    comments: 45,
    awards: 8,
    time: '6h',
    tags: ['guide', 'watercooling', 'custom'],
    readTime: '12 min',
    tall: true,
  },
  {
    id: 4,
    type: 'setup',
    author: { name: 'MINIMAL_MONK', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', level: 56 },
    content: 'Минимализм — это путь. Белый сетап для творчества.',
    images: ['https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800'],
    resonance: 567,
    echoes: 34,
    comments: 28,
    awards: 3,
    time: '8h',
    tags: ['minimal', 'white', 'creative'],
    tall: false,
  },
  {
    id: 5,
    type: 'video',
    author: { name: 'MOD_MASTER', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', level: 78, verified: true },
    content: 'Таймлапс сборки кастомного корпуса из алюминия. 200 часов работы за 3 минуты.',
    images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'],
    resonance: 2341,
    echoes: 456,
    comments: 234,
    awards: 28,
    time: '1d',
    tags: ['mod', 'timelapse', 'custom'],
    hasVideo: true,
    duration: '3:24',
    tall: true,
  },
  {
    id: 6,
    type: 'setup',
    author: { name: 'RGB_QUEEN', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', level: 45 },
    content: 'Когда RGB — это искусство, а не китч 🌈',
    images: ['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800'],
    resonance: 789,
    echoes: 67,
    comments: 89,
    awards: 5,
    time: '1d',
    tags: ['rgb', 'aesthetic', 'gamer'],
    tall: false,
  },
];

// === TRENDING TAGS ===
const TRENDING_TAGS = [
  { tag: 'rtx5090', count: '12.4k' },
  { tag: 'keycaps', count: '8.9k' },
  { tag: 'battlestation', count: '7.2k' },
  { tag: 'watercooling', count: '5.1k' },
  { tag: 'minimal', count: '4.8k' },
];

// === TOP CREATORS ===
const TOP_CREATORS = [
  { name: 'VOID_ARCHITECT', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 94, followers: '12.4k' },
  { name: 'TECH_PROPHET', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', level: 87, followers: '9.8k' },
  { name: 'MOD_MASTER', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', level: 78, followers: '7.2k' },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('neuro');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleResonance = useCallback((postId, e) => {
    e.stopPropagation();
    // TODO: API call
  }, []);

  return (
    <div 
      className="min-h-screen w-full px-8 py-24"
      style={{ background: 'transparent' }}
    >
      {/* === HEADER === */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 
              className="text-4xl font-black tracking-tight mb-2"
              style={{ 
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              THE NEURAL FEED
            </h1>
            <p className="text-white/40 text-sm font-mono">// КОММЬЮНИТИ.ПРОТОКОЛ.АКТИВЕН</p>
          </div>
          
          {/* Create Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 212, 0.2) 0%, rgba(0, 255, 212, 0.1) 100%)',
                border: '1px solid rgba(0, 255, 212, 0.3)',
                color: '#00ffd4',
              }}
            >
              <Sparkles size={18} />
              <span>СОЗДАТЬ</span>
            </motion.button>

            {/* Create Menu */}
            <AnimatePresence>
              {showCreateMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 p-2 rounded-xl z-50"
                  style={{
                    background: 'rgba(10, 10, 15, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    minWidth: '220px',
                  }}
                >
                  {[
                    { icon: Camera, label: 'ЗАГРУЗИТЬ РИГ', desc: 'Покажи свой сетап', color: '#10b981' },
                    { icon: FileText, label: 'НАПИСАТЬ СТАТЬЮ', desc: 'Создай гайд', color: '#3b82f6' },
                    { icon: HelpCircle, label: 'СПРОСИТЬ УЛЕЙ', desc: 'Получи ответы', color: '#f59e0b' },
                    { icon: Video, label: 'ЗАЛИТЬ ВИДЕО', desc: 'Поделись клипом', color: '#8b5cf6' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-white/5 transition-all"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${item.color}20`, color: item.color }}
                      >
                        <item.icon size={18} />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{item.label}</div>
                        <div className="text-white/40 text-xs">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Terminal Input */}
        <div 
          className="p-4 rounded-2xl mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0, 255, 212, 0.1)', border: '1px solid rgba(0, 255, 212, 0.2)' }}
            >
              <Sparkles size={20} className="text-cyan-400" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Share something with the community..."
              className="flex-1 bg-transparent text-white outline-none placeholder:text-white/25"
            />
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                <Image size={18} />
              </button>
              <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                <Link2 size={18} />
              </button>
              <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                <Hash size={18} />
              </button>
              <button 
                className="px-5 py-2.5 rounded-lg font-medium transition-all"
                style={{
                  background: inputValue ? 'rgba(0, 255, 212, 0.9)' : 'rgba(255, 255, 255, 0.05)',
                  color: inputValue ? '#000' : 'rgba(255, 255, 255, 0.3)',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Feed Tabs */}
        <div className="flex items-center gap-2">
          {FEED_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
          
          <div className="flex-1" />
          
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Filter size={16} />
            <span className="text-sm">Filters</span>
          </button>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex gap-8">
        {/* MASONRY FEED */}
        <div className="flex-1">
          <div 
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            }}
          >
            {MOCK_POSTS.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPost(post)}
                className={`group cursor-pointer rounded-2xl overflow-hidden transition-all hover:scale-[1.02] ${post.tall ? 'row-span-2' : ''}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Image */}
                {post.images && (
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={post.images[0]} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {post.hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          <Play size={24} className="text-black ml-1" />
                        </div>
                        {post.duration && (
                          <span className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-mono bg-black/60 text-white">
                            {post.duration}
                          </span>
                        )}
                      </div>
                    )}
                    {post.readTime && (
                      <span className="absolute top-3 right-3 px-2 py-1 rounded text-xs bg-black/60 text-white">
                        {post.readTime} read
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={post.author.avatar} 
                      alt="" 
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm truncate">{post.author.name}</span>
                        {post.author.verified && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-400">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/30">
                        <span>LVL {post.author.level}</span>
                        <span>•</span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {/* Text */}
                  <p className="text-white/80 text-sm leading-relaxed mb-3">{post.content}</p>

                  {/* Tags */}
                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 rounded text-xs text-white/40 hover:text-white/70 transition-all cursor-pointer"
                          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    {/* Resonance */}
                    <button 
                      onClick={(e) => handleResonance(post.id, e)}
                      className="flex items-center gap-2 text-white/40 hover:text-rose-400 transition-all group/btn"
                    >
                      <div className="relative">
                        <Zap size={18} className="group-hover/btn:scale-110 transition-transform" />
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ background: 'rgba(244, 63, 94, 0.3)' }}
                        />
                      </div>
                      <span className="text-sm font-medium">{post.resonance}</span>
                    </button>

                    {/* Comments */}
                    <button className="flex items-center gap-2 text-white/40 hover:text-blue-400 transition-all">
                      <MessageSquare size={16} />
                      <span className="text-sm">{post.comments}</span>
                    </button>

                    {/* Echoes */}
                    <button className="flex items-center gap-2 text-white/40 hover:text-green-400 transition-all">
                      <Share2 size={16} />
                      <span className="text-sm">{post.echoes}</span>
                    </button>

                    {/* Awards */}
                    {post.awards > 0 && (
                      <button className="flex items-center gap-2 text-amber-400/70 hover:text-amber-400 transition-all">
                        <Award size={16} />
                        <span className="text-sm">{post.awards}</span>
                      </button>
                    )}

                    {/* Bookmark */}
                    <button className="text-white/20 hover:text-white/60 transition-all">
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-[320px] shrink-0 space-y-6">
          {/* Trending Tags */}
          <div 
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-cyan-400" />
              <span className="font-semibold text-white">TRENDING</span>
            </div>
            <div className="space-y-3">
              {TRENDING_TAGS.map((item, i) => (
                <div 
                  key={item.tag}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-sm font-mono">{i + 1}</span>
                    <span className="text-white font-medium">#{item.tag}</span>
                  </div>
                  <span className="text-white/40 text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Creators */}
          <div 
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Crown size={18} className="text-amber-400" />
              <span className="font-semibold text-white">TOP CREATORS</span>
            </div>
            <div className="space-y-3">
              {TOP_CREATORS.map((creator) => (
                <div 
                  key={creator.name}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                >
                  <img 
                    src={creator.avatar} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{creator.name}</div>
                    <div className="text-white/40 text-xs">LVL {creator.level} • {creator.followers} followers</div>
                  </div>
                  <button 
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: 'rgba(0, 255, 212, 0.1)', color: '#00ffd4' }}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === COMMENT SIDE PANEL === */}
      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="fixed inset-0 z-[200]"
              style={{ background: 'rgba(0, 0, 0, 0.6)' }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[500px] z-[201] overflow-y-auto"
              style={{
                background: 'rgba(10, 10, 15, 0.98)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-white">Comments ({selectedPost.comments})</span>
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                {/* Comment Input */}
                <div className="flex gap-3 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 text-sm">Y</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-transparent text-white outline-none placeholder:text-white/25 text-sm"
                    />
                  </div>
                </div>

                {/* Mock Comments */}
                <div className="space-y-4">
                  {[
                    { author: 'CYBER_X', text: 'This is insane! What case is that?', time: '1h', likes: 24 },
                    { author: 'VOID_SEEKER', text: 'The cable management is chef\'s kiss 👨‍🍳', time: '45m', likes: 18 },
                    { author: 'RGB_FAN', text: 'I need that lighting setup', time: '30m', likes: 7 },
                  ].map((comment, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-white/60 text-xs">{comment.author[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{comment.author}</span>
                          <span className="text-white/30 text-xs">{comment.time}</span>
                        </div>
                        <p className="text-white/70 text-sm">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="flex items-center gap-1 text-white/30 hover:text-rose-400 text-xs transition-all">
                            <Heart size={12} />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="text-white/30 hover:text-white text-xs transition-all">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
