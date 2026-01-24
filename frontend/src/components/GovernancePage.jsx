/**
 * GovernancePage.jsx - SYSTEM GOVERNANCE & ROADMAP
 * 
 * Мозг проекта - пользователи решают что строить:
 * - Voting Core с RP (Reputation Points)
 * - Pain Killer (баг-репорты)
 * - Leaderboard (Hall of Fame)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, Zap, TrendingUp, Trophy, Bug, Lightbulb, Rocket, Check,
  Clock, Users, ChevronUp, MessageSquare, Star, Crown, Medal,
  Award, Target, AlertTriangle, Wrench, Plus, Filter, Search,
  Flame, Shield, Eye, ThumbsUp, ExternalLink
} from 'lucide-react';

// === VOTING TABS ===
const TABS = [
  { id: 'ideas', label: 'IDEA HUB', icon: Lightbulb, color: '#f59e0b' },
  { id: 'glitches', label: 'GLITCH REPORT', icon: Bug, color: '#ef4444' },
  { id: 'leaderboard', label: 'HALL OF FAME', icon: Trophy, color: '#a855f7' },
];

// === IDEA STATUS ===
const STATUS_CONFIG = {
  voting: { label: 'VOTING', color: '#3b82f6', icon: Vote },
  approved: { label: 'APPROVED', color: '#10b981', icon: Check },
  in_dev: { label: 'IN DEV', color: '#f59e0b', icon: Wrench },
  shipped: { label: 'SHIPPED', color: '#8b5cf6', icon: Rocket },
};

// === MOCK IDEAS ===
const MOCK_IDEAS = [
  {
    id: 1,
    title: 'Мобильное приложение',
    description: 'Нативное приложение для iOS и Android с push-уведомлениями и быстрым доступом к сделкам.',
    author: { name: 'VOID_ARCHITECT', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 94 },
    votes: 8420,
    goal: 10000,
    status: 'voting',
    comments: 234,
    category: 'Platform',
    daysLeft: 12,
    trending: true,
  },
  {
    id: 2,
    title: 'Голосовой чат в сделках',
    description: 'Интегрированный голосовой чат для обсуждения деталей сделки без перехода в Discord.',
    author: { name: 'TECH_PROPHET', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', level: 87 },
    votes: 6200,
    goal: 7500,
    status: 'approved',
    comments: 156,
    category: 'Communication',
    daysLeft: null,
  },
  {
    id: 3,
    title: 'Темная тема v2.0',
    description: 'Полностью переработанная темная тема с OLED black и настраиваемыми акцентами.',
    author: { name: 'MINIMAL_MONK', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', level: 56 },
    votes: 5100,
    goal: 5000,
    status: 'in_dev',
    comments: 89,
    category: 'Design',
    progress: 65,
  },
  {
    id: 4,
    title: 'NFT интеграция для редких предметов',
    description: 'Верификация редких коллекционных предметов через blockchain.',
    author: { name: 'CRYPTO_KING', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', level: 45 },
    votes: 3200,
    goal: 10000,
    status: 'voting',
    comments: 312,
    category: 'Web3',
    daysLeft: 30,
    controversial: true,
  },
  {
    id: 5,
    title: 'AI ценовой аналитик',
    description: 'Нейросеть, которая предсказывает изменение цен на комплектующие.',
    author: { name: 'DATA_WIZARD', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', level: 78 },
    votes: 9800,
    goal: 10000,
    status: 'voting',
    comments: 445,
    category: 'AI',
    daysLeft: 5,
    hot: true,
  },
];

// === MOCK GLITCHES ===
const MOCK_GLITCHES = [
  {
    id: 1,
    title: 'Чат не загружается на Safari',
    description: 'При открытии чата на Safari 17+ страница зависает на 10+ секунд.',
    author: { name: 'BUG_HUNTER', level: 34 },
    votes: 456,
    status: 'investigating',
    severity: 'high',
    affected: '~5% users',
  },
  {
    id: 2,
    title: 'Дубликаты уведомлений',
    description: 'Иногда приходит 2-3 одинаковых уведомления о новом сообщении.',
    author: { name: 'NOTIFICATION_SPAM', level: 22 },
    votes: 234,
    status: 'confirmed',
    severity: 'medium',
    affected: '~15% users',
  },
  {
    id: 3,
    title: 'Поиск не находит товары с кириллицей',
    description: 'Если в названии товара есть буква "ё", поиск его не находит.',
    author: { name: 'CYRILLIC_FAN', level: 18 },
    votes: 123,
    status: 'fixing',
    severity: 'low',
    affected: '~2% users',
  },
];

// === MOCK LEADERBOARD ===
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'VOID_ARCHITECT', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', level: 94, rp: 124500, builds: 47, trades: 234, badge: 'gold' },
  { rank: 2, name: 'TECH_PROPHET', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', level: 87, rp: 98200, builds: 32, trades: 189, badge: 'silver' },
  { rank: 3, name: 'MOD_MASTER', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', level: 78, rp: 87600, builds: 28, trades: 156, badge: 'bronze' },
  { rank: 4, name: 'RGB_QUEEN', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', level: 67, rp: 72400, builds: 19, trades: 134 },
  { rank: 5, name: 'CABLE_WIZARD', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', level: 62, rp: 65800, builds: 24, trades: 98 },
  { rank: 6, name: 'MINIMAL_MONK', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', level: 56, rp: 54200, builds: 15, trades: 87 },
  { rank: 7, name: 'SILENT_BUILDER', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100', level: 51, rp: 48900, builds: 21, trades: 76 },
  { rank: 8, name: 'THERMAL_KING', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100', level: 48, rp: 42100, builds: 18, trades: 65 },
];

// === LEADERBOARD FILTERS ===
const LEADERBOARD_FILTERS = [
  { id: 'weekly', label: 'WEEKLY' },
  { id: 'monthly', label: 'MONTHLY' },
  { id: 'alltime', label: 'ALL TIME' },
  { id: 'builders', label: 'BUILDERS' },
];

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState('ideas');
  const [leaderboardFilter, setLeaderboardFilter] = useState('alltime');
  const [userRP, setUserRP] = useState(1250); // Mock user RP
  const [votedIdeas, setVotedIdeas] = useState([]);

  const handleVote = (ideaId, amount) => {
    if (userRP >= amount && !votedIdeas.includes(ideaId)) {
      setUserRP(prev => prev - amount);
      setVotedIdeas(prev => [...prev, ideaId]);
    }
  };

  const renderIdeasTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Shape the Future</h2>
          <p className="text-white/40 text-sm">Vote with your RP to decide what we build next</p>
        </div>
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)' }}
          >
            <Zap size={18} className="text-orange-400" />
            <span className="text-orange-400 font-bold">{userRP.toLocaleString()} RP</span>
          </div>
          <button 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all"
            style={{ background: 'rgba(0, 255, 212, 0.1)', border: '1px solid rgba(0, 255, 212, 0.2)', color: '#00ffd4' }}
          >
            <Plus size={16} />
            <span>Submit Idea</span>
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-2 gap-6">
        {MOCK_IDEAS.map((idea, index) => {
          const status = STATUS_CONFIG[idea.status];
          const progress = idea.status === 'in_dev' ? idea.progress : Math.min((idea.votes / idea.goal) * 100, 100);
          const hasVoted = votedIdeas.includes(idea.id);
          
          return (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-2xl relative overflow-hidden group"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                {idea.hot && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                    <Flame size={10} /> HOT
                  </span>
                )}
                {idea.trending && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400">
                    <TrendingUp size={10} /> TRENDING
                  </span>
                )}
              </div>

              {/* Status */}
              <div 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold mb-4"
                style={{ background: `${status.color}20`, color: status.color }}
              >
                <status.icon size={10} />
                <span>{status.label}</span>
              </div>

              {/* Content */}
              <h3 className="text-white font-semibold text-lg mb-2">{idea.title}</h3>
              <p className="text-white/50 text-sm mb-4 line-clamp-2">{idea.description}</p>

              {/* Author & Category */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img src={idea.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-white/60 text-sm">{idea.author.name}</span>
                </div>
                <span className="text-white/30 text-xs px-2 py-1 rounded bg-white/5">{idea.category}</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white font-bold">{idea.votes.toLocaleString()}</span>
                  <span className="text-white/30 text-sm">/ {idea.goal.toLocaleString()} RP</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ 
                      background: `linear-gradient(90deg, ${status.color} 0%, ${status.color}80 100%)`,
                      boxShadow: `0 0 10px ${status.color}50`,
                    }}
                  />
                </div>
                {idea.daysLeft && (
                  <div className="flex items-center gap-1 mt-1.5 text-white/30 text-xs">
                    <Clock size={10} />
                    <span>{idea.daysLeft} days left</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-all">
                    <MessageSquare size={14} />
                    <span>{idea.comments}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-all">
                    <Eye size={14} />
                    <span>Details</span>
                  </button>
                </div>
                
                {idea.status === 'voting' && (
                  <button
                    onClick={() => handleVote(idea.id, 100)}
                    disabled={hasVoted || userRP < 100}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      hasVoted 
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : userRP < 100
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                  >
                    {hasVoted ? <Check size={14} /> : <ChevronUp size={14} />}
                    <span>{hasVoted ? 'Voted' : 'Vote 100 RP'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderGlitchesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Glitch Report</h2>
          <p className="text-white/40 text-sm">Help us squash bugs — upvote issues you've experienced</p>
        </div>
        <button 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
        >
          <Bug size={16} />
          <span>Report Bug</span>
        </button>
      </div>

      {/* Glitches List */}
      <div className="space-y-4">
        {MOCK_GLITCHES.map((glitch, index) => {
          const severityConfig = {
            high: { color: '#ef4444', label: 'HIGH' },
            medium: { color: '#f59e0b', label: 'MEDIUM' },
            low: { color: '#10b981', label: 'LOW' },
          }[glitch.severity];
          
          const statusConfig = {
            investigating: { color: '#3b82f6', label: 'INVESTIGATING' },
            confirmed: { color: '#f59e0b', label: 'CONFIRMED' },
            fixing: { color: '#10b981', label: 'FIXING' },
          }[glitch.status];

          return (
            <motion.div
              key={glitch.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-2xl flex gap-5"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2">
                <button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  <ThumbsUp size={18} />
                </button>
                <span className="text-white font-bold">{glitch.votes}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{glitch.title}</h3>
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: `${severityConfig.color}20`, color: severityConfig.color }}
                  >
                    {severityConfig.label}
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: `${statusConfig.color}20`, color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-white/50 text-sm mb-3">{glitch.description}</p>
                <div className="flex items-center gap-4 text-white/30 text-xs">
                  <span>Reported by {glitch.author.name}</span>
                  <span>•</span>
                  <span>Affects {glitch.affected}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Hall of Fame</h2>
          <p className="text-white/40 text-sm">The legends who shaped our community</p>
        </div>
        <div className="flex items-center gap-2">
          {LEADERBOARD_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setLeaderboardFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                leaderboardFilter === filter.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 py-8">
        {/* 2nd Place */}
        <div className="text-center">
          <div className="relative mb-4">
            <img 
              src={MOCK_LEADERBOARD[1].avatar} 
              alt="" 
              className="w-20 h-20 rounded-full mx-auto"
              style={{ border: '3px solid #C0C0C0', boxShadow: '0 0 20px rgba(192, 192, 192, 0.3)' }}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#C0C0C0] flex items-center justify-center font-bold text-black">
              2
            </div>
          </div>
          <div className="text-white font-semibold">{MOCK_LEADERBOARD[1].name}</div>
          <div className="text-white/40 text-sm">{MOCK_LEADERBOARD[1].rp.toLocaleString()} RP</div>
        </div>

        {/* 1st Place */}
        <div className="text-center -mt-8">
          <div className="relative mb-4">
            <div 
              className="absolute inset-0 rounded-full animate-pulse"
              style={{ 
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                transform: 'scale(1.5)',
              }}
            />
            <img 
              src={MOCK_LEADERBOARD[0].avatar} 
              alt="" 
              className="w-28 h-28 rounded-full mx-auto relative z-10"
              style={{ border: '4px solid #FFD700', boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)' }}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
              <Crown size={32} className="text-yellow-400" />
            </div>
          </div>
          <div className="text-white font-bold text-lg">{MOCK_LEADERBOARD[0].name}</div>
          <div className="text-yellow-400 font-semibold">{MOCK_LEADERBOARD[0].rp.toLocaleString()} RP</div>
        </div>

        {/* 3rd Place */}
        <div className="text-center">
          <div className="relative mb-4">
            <img 
              src={MOCK_LEADERBOARD[2].avatar} 
              alt="" 
              className="w-20 h-20 rounded-full mx-auto"
              style={{ border: '3px solid #CD7F32', boxShadow: '0 0 20px rgba(205, 127, 50, 0.3)' }}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#CD7F32] flex items-center justify-center font-bold text-black">
              3
            </div>
          </div>
          <div className="text-white font-semibold">{MOCK_LEADERBOARD[2].name}</div>
          <div className="text-white/40 text-sm">{MOCK_LEADERBOARD[2].rp.toLocaleString()} RP</div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div 
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <th className="px-6 py-4 text-left text-white/40 text-xs font-medium uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-left text-white/40 text-xs font-medium uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-white/40 text-xs font-medium uppercase tracking-wider">Level</th>
              <th className="px-6 py-4 text-left text-white/40 text-xs font-medium uppercase tracking-wider">RP</th>
              <th className="px-6 py-4 text-left text-white/40 text-xs font-medium uppercase tracking-wider">Builds</th>
              <th className="px-6 py-4 text-left text-white/40 text-xs font-medium uppercase tracking-wider">Trades</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map((user, index) => (
              <tr 
                key={user.rank}
                className="hover:bg-white/5 transition-all cursor-pointer"
                style={{ borderBottom: index < MOCK_LEADERBOARD.length - 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none' }}
              >
                <td className="px-6 py-4">
                  <span className={`font-bold ${user.rank <= 3 ? 'text-lg' : 'text-white/60'}`}>
                    {user.rank === 1 && <span className="text-yellow-400">🥇</span>}
                    {user.rank === 2 && <span className="text-gray-300">🥈</span>}
                    {user.rank === 3 && <span className="text-amber-600">🥉</span>}
                    {user.rank > 3 && <span className="text-white/40">#{user.rank}</span>}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      {user.badge && (
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ 
                            background: user.badge === 'gold' ? 'rgba(255, 215, 0, 0.2)' : user.badge === 'silver' ? 'rgba(192, 192, 192, 0.2)' : 'rgba(205, 127, 50, 0.2)',
                            color: user.badge === 'gold' ? '#FFD700' : user.badge === 'silver' ? '#C0C0C0' : '#CD7F32',
                          }}
                        >
                          {user.badge.toUpperCase()} FRAME
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-cyan-400 font-medium">LVL {user.level}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-orange-400 font-bold">{user.rp.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-white/60">{user.builds}</td>
                <td className="px-6 py-4 text-white/60">{user.trades}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen w-full px-8 py-24"
      style={{ background: 'transparent' }}
    >
      {/* === HEADER === */}
      <div className="mb-8">
        <h1 
          className="text-4xl font-black tracking-tight mb-2"
          style={{ 
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          SYSTEM GOVERNANCE
        </h1>
        <p className="text-white/40 text-sm font-mono">// DEMOCRACY.PROTOCOL.ACTIVE</p>
      </div>

      {/* === TABS === */}
      <div className="flex items-center gap-2 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id 
                ? 'text-white' 
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
            style={activeTab === tab.id ? { 
              background: `${tab.color}20`,
              border: `1px solid ${tab.color}40`,
              color: tab.color,
            } : {}}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* === CONTENT === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'ideas' && renderIdeasTab()}
          {activeTab === 'glitches' && renderGlitchesTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
