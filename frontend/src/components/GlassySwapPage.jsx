import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Plus,
  MapPin,
  Star,
  Eye,
  Heart,
  MessageCircle,
  ArrowUpDown,
  RefreshCw,
  X,
  ChevronDown,
  Sparkles,
  Shield,
  TrendingUp,
  Zap,
  Check
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Condition labels
const CONDITION_LABELS = {
  new: { en: 'New', ru: 'Новый' },
  like_new: { en: 'Like New', ru: 'Как новый' },
  excellent: { en: 'Excellent', ru: 'Отличное' },
  good: { en: 'Good', ru: 'Хорошее' },
  fair: { en: 'Fair', ru: 'Удовл.' },
  parts: { en: 'For Parts', ru: 'На запчасти' }
};

const CONDITION_COLORS = {
  new: '#22c55e',
  like_new: '#22c55e',
  excellent: '#3b82f6',
  good: '#eab308',
  fair: '#f97316',
  parts: '#ef4444'
};

// Sort options
const SORT_OPTIONS = [
  { value: 'newest', label: { en: 'Newest', ru: 'Новые' } },
  { value: 'price_asc', label: { en: 'Price: Low to High', ru: 'Цена: по возрастанию' } },
  { value: 'price_desc', label: { en: 'Price: High to Low', ru: 'Цена: по убыванию' } },
  { value: 'popular', label: { en: 'Most Popular', ru: 'Популярные' } }
];

const GlassySwapPage = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ active_listings: 0, completed_transactions: 0, active_sellers: 0 });
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [acceptsTrade, setAcceptsTrade] = useState(null);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Refs
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const skipRef = useRef(0);
  
  const isMinimalMod = theme === 'minimal-mod';
  const isDark = theme === 'dark' || isMinimalMod;
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/swap/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);
  
  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/swap/stats`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);
  
  // Fetch listings
  const fetchListings = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      skipRef.current = 0;
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedCondition) params.append('condition', selectedCondition);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (acceptsTrade !== null) params.append('accepts_trade', acceptsTrade);
      if (location) params.append('location', location);
      params.append('sort_by', sortBy);
      params.append('skip', skipRef.current.toString());
      params.append('limit', '12');
      
      const res = await fetch(`${API_URL}/api/swap/listings?${params}`);
      const data = await res.json();
      
      if (reset) {
        setListings(data);
      } else {
        setListings(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 12);
      skipRef.current += data.length;
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedCategory, selectedCondition, minPrice, maxPrice, acceptsTrade, location, sortBy]);
  
  // Initial fetch
  useEffect(() => {
    fetchListings(true);
  }, [fetchListings]);
  
  // Infinite scroll
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchListings(false);
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    observerRef.current = observer;
    
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, fetchListings]);
  
  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setAcceptsTrade(null);
    setLocation('');
    setSortBy('newest');
  };
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };
  
  // Get time ago
  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return language === 'ru' ? 'Сегодня' : 'Today';
    if (days === 1) return language === 'ru' ? 'Вчера' : 'Yesterday';
    if (days < 7) return language === 'ru' ? `${days} дн. назад` : `${days}d ago`;
    if (days < 30) return language === 'ru' ? `${Math.floor(days / 7)} нед. назад` : `${Math.floor(days / 7)}w ago`;
    return language === 'ru' ? `${Math.floor(days / 30)} мес. назад` : `${Math.floor(days / 30)}mo ago`;
  };
  
  return (
    <div className="min-h-screen" style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ minHeight: '320px' }}>
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(15,15,20,1) 0%, rgba(30,20,50,1) 50%, rgba(15,15,20,1) 100%)'
              : 'linear-gradient(135deg, rgba(250,250,255,1) 0%, rgba(230,220,250,1) 50%, rgba(250,250,255,1) 100%)',
          }}
        />
        
        {/* Subtle particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                background: 'rgba(255,255,255,0.3)',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `-${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ 
              color: isDark ? '#fff' : '#1a1a1a',
              fontFamily: isMinimalMod ? 'SF Mono, monospace' : 'inherit'
            }}
          >
            GLASSY SWAP
          </h1>
          <p 
            className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
          >
            {language === 'ru' 
              ? 'Обменяй, продай или найди своё железо среди единомышленников'
              : 'Trade, sell, or find your gear among enthusiasts'}
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{stats.active_listings}</div>
              <div className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                {language === 'ru' ? 'Объявлений' : 'Listings'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{stats.completed_transactions}</div>
              <div className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                {language === 'ru' ? 'Сделок' : 'Deals'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{stats.active_sellers}</div>
              <div className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                {language === 'ru' ? 'Продавцов' : 'Sellers'}
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={() => navigate('/glassy-swap/create')}
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: '#fff',
              borderRadius: isMinimalMod ? '0' : '12px',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Plus size={20} />
            {language === 'ru' ? 'Создать объявление' : 'Create Listing'}
          </button>
        </div>
      </section>
      
      {/* Search & Filters Bar */}
      <section 
        className="sticky top-[64px] z-30 border-b"
        style={{
          background: isDark ? 'rgba(15,15,20,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: isMinimalMod ? 'none' : 'blur(20px)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ru' ? 'RTX 4090, Москва, обмен...' : 'RTX 4090, Moscow, trade...'}
                className="w-full pl-10 pr-4 py-2.5 outline-none transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: isMinimalMod ? '0' : '10px',
                  color: isDark ? '#fff' : '#1a1a1a',
                  fontFamily: isMinimalMod ? 'SF Mono, monospace' : 'inherit'
                }}
              />
            </div>
            
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 outline-none cursor-pointer"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: isMinimalMod ? '0' : '10px',
                color: isDark ? '#fff' : '#1a1a1a',
                fontFamily: isMinimalMod ? 'SF Mono, monospace' : 'inherit'
              }}
            >
              <option value="">{language === 'ru' ? 'Все категории' : 'All Categories'}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name[language] || cat.name.en} ({cat.count})
                </option>
              ))}
            </select>
            
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 transition-all"
              style={{
                background: showFilters ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                border: `1px solid ${showFilters ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                borderRadius: isMinimalMod ? '0' : '10px',
                color: showFilters ? '#8b5cf6' : (isDark ? '#fff' : '#1a1a1a')
              }}
            >
              <SlidersHorizontal size={18} />
              {language === 'ru' ? 'Фильтры' : 'Filters'}
            </button>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: isMinimalMod ? '0' : '10px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              >
                <ArrowUpDown size={18} />
                {SORT_OPTIONS.find(s => s.value === sortBy)?.label[language]}
                <ChevronDown size={16} />
              </button>
              
              {showSortDropdown && (
                <div 
                  className="absolute right-0 top-full mt-1 py-1 min-w-[180px] z-50"
                  style={{
                    background: isDark ? 'rgba(20,20,25,0.98)' : 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: isMinimalMod ? '0' : '10px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                  }}
                >
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left transition-all flex items-center gap-2"
                      style={{
                        color: sortBy === option.value ? '#8b5cf6' : (isDark ? '#fff' : '#1a1a1a'),
                        background: sortBy === option.value ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                      }}
                    >
                      {sortBy === option.value && <Check size={14} />}
                      {option.label[language]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div 
              className="mt-3 pt-3 flex flex-wrap items-center gap-3"
              style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
            >
              {/* Condition */}
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="px-3 py-2 outline-none cursor-pointer text-sm"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: isMinimalMod ? '0' : '8px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              >
                <option value="">{language === 'ru' ? 'Состояние' : 'Condition'}</option>
                {Object.entries(CONDITION_LABELS).map(([key, labels]) => (
                  <option key={key} value={key}>{labels[language]}</option>
                ))}
              </select>
              
              {/* Price Range */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={language === 'ru' ? 'От' : 'Min'}
                  className="w-24 px-3 py-2 outline-none text-sm"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: isMinimalMod ? '0' : '8px',
                    color: isDark ? '#fff' : '#1a1a1a'
                  }}
                />
                <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>—</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={language === 'ru' ? 'До' : 'Max'}
                  className="w-24 px-3 py-2 outline-none text-sm"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: isMinimalMod ? '0' : '8px',
                    color: isDark ? '#fff' : '#1a1a1a'
                  }}
                />
              </div>
              
              {/* Location */}
              <div className="relative">
                <MapPin 
                  size={16} 
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={language === 'ru' ? 'Город' : 'City'}
                  className="w-32 pl-9 pr-3 py-2 outline-none text-sm"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: isMinimalMod ? '0' : '8px',
                    color: isDark ? '#fff' : '#1a1a1a'
                  }}
                />
              </div>
              
              {/* Trade Toggle */}
              <button
                onClick={() => setAcceptsTrade(acceptsTrade === true ? null : true)}
                className="flex items-center gap-2 px-3 py-2 text-sm transition-all"
                style={{
                  background: acceptsTrade ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                  border: `1px solid ${acceptsTrade ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                  borderRadius: isMinimalMod ? '0' : '8px',
                  color: acceptsTrade ? '#8b5cf6' : (isDark ? '#fff' : '#1a1a1a')
                }}
              >
                <RefreshCw size={16} />
                {language === 'ru' ? 'Обмен' : 'Trade'}
              </button>
              
              {/* Clear Filters */}
              {(selectedCategory || selectedCondition || minPrice || maxPrice || location || acceptsTrade !== null) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm transition-all"
                  style={{ color: '#ef4444' }}
                >
                  <X size={16} />
                  {language === 'ru' ? 'Сбросить' : 'Clear'}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Listings Grid */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="animate-pulse"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  borderRadius: isMinimalMod ? '0' : '16px',
                  height: '400px'
                }}
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Search size={48} style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', margin: '0 auto 16px' }} />
            <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              {language === 'ru' ? 'Объявления не найдены' : 'No listings found'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  isDark={isDark} 
                  isMinimalMod={isMinimalMod}
                  language={language}
                  formatPrice={formatPrice}
                  getTimeAgo={getTimeAgo}
                  onClick={() => navigate(`/glassy-swap/${listing.id}`)}
                />
              ))}
            </div>
            
            {/* Load More Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {language === 'ru' ? 'Загрузка...' : 'Loading...'}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
      
      {/* Fixed Create Button (Mobile) */}
      <button
        onClick={() => navigate('/glassy-swap/create')}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 flex items-center justify-center shadow-lg lg:hidden"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          borderRadius: isMinimalMod ? '0' : '50%',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
        }}
      >
        <Plus size={24} color="#fff" />
      </button>
      
      {/* Float animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.3; }
          50% { transform: translateY(-20px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

// Listing Card Component
const ListingCard = ({ listing, isDark, isMinimalMod, language, formatPrice, getTimeAgo, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryImage = listing.images?.find(img => img.is_primary)?.url || listing.images?.[0]?.url;
  const conditionLabel = CONDITION_LABELS[listing.condition]?.[language] || listing.condition;
  const conditionColor = CONDITION_COLORS[listing.condition] || '#888';
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer transition-all duration-300"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: isMinimalMod ? '0' : '16px',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? (isDark ? '0 10px 40px rgba(139, 92, 246, 0.15)' : '0 10px 40px rgba(0,0,0,0.1)')
          : 'none'
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={primaryImage || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {listing.is_boosted && (
            <div 
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium"
              style={{
                background: 'rgba(139, 92, 246, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: isMinimalMod ? '0' : '6px',
                color: '#fff'
              }}
            >
              <Zap size={12} />
              TOP
            </div>
          )}
          {listing.accepts_trade && (
            <div 
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium"
              style={{
                background: 'rgba(34, 197, 94, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: isMinimalMod ? '0' : '6px',
                color: '#fff'
              }}
            >
              <RefreshCw size={12} />
              {language === 'ru' ? 'Обмен' : 'Trade'}
            </div>
          )}
        </div>
        
        {/* Condition Badge */}
        <div 
          className="absolute top-3 right-3 px-2 py-1 text-xs font-medium"
          style={{
            background: `${conditionColor}dd`,
            backdropFilter: 'blur(10px)',
            borderRadius: isMinimalMod ? '0' : '6px',
            color: '#fff'
          }}
        >
          {conditionLabel}
        </div>
        
        {/* Stats Overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-3"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
          }}
        >
          <span className="flex items-center gap-1 text-xs text-white/80">
            <Eye size={14} /> {listing.views}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/80">
            <Heart size={14} /> {listing.favorites_count}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div 
          className="text-xl font-bold mb-2"
          style={{ color: isDark ? '#fff' : '#1a1a1a' }}
        >
          {formatPrice(listing.price)}
        </div>
        
        {/* Title */}
        <h3 
          className="font-medium mb-2 line-clamp-2"
          style={{ 
            color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
            fontFamily: isMinimalMod ? 'SF Mono, monospace' : 'inherit'
          }}
        >
          {listing.title}
        </h3>
        
        {/* Location & Time */}
        <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          <MapPin size={14} />
          <span>{listing.location}</span>
          <span>•</span>
          <span>{getTimeAgo(listing.created_at)}</span>
        </div>
        
        {/* Seller */}
        <div 
          className="flex items-center justify-between pt-3"
          style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff'
              }}
            >
              {listing.seller_username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-sm font-medium flex items-center gap-1" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
                {listing.seller_username || 'User'}
                {listing.seller_verified && <Shield size={14} className="text-blue-500" />}
              </div>
              {listing.seller_rating > 0 && (
                <div className="flex items-center gap-1 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  {listing.seller_rating.toFixed(1)}
                  <span>({listing.seller_deals_count} {language === 'ru' ? 'сделок' : 'deals'})</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Open chat
            }}
            className="p-2 transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              borderRadius: isMinimalMod ? '0' : '8px',
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
            }}
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassySwapPage;
