import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Check,
  ArrowLeft,
  Share2,
  ChevronLeft,
  ChevronRight,
  Send,
  ImageIcon,
  Tag,
  Package,
  FileText,
  CheckCircle
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
  parts: { en: 'For Parts', ru: 'Запчасти' }
};

// Sort options
const SORT_OPTIONS = [
  { value: 'newest', label: { en: 'Newest', ru: 'Новые' } },
  { value: 'price_asc', label: { en: 'Price ↑', ru: 'Цена ↑' } },
  { value: 'price_desc', label: { en: 'Price ↓', ru: 'Цена ↓' } },
  { value: 'popular', label: { en: 'Popular', ru: 'Популярные' } }
];

const GlassySwapPage = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isMinimalMod = theme === 'minimal-mod';
  const isDark = theme === 'dark' || isMinimalMod;
  
  // If we have an ID, show detail page
  if (id) {
    return <SwapDetailPage id={id} />;
  }
  
  return <SwapMainPage />;
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
const SwapMainPage = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [acceptsTrade, setAcceptsTrade] = useState(null);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const skipRef = useRef(0);
  const loadMoreRef = useRef(null);
  
  const isMinimalMod = theme === 'minimal-mod';
  const isDark = theme === 'dark' || isMinimalMod;
  
  // Fetch categories
  useEffect(() => {
    fetch(`${API_URL}/api/swap/categories`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
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
  
  useEffect(() => {
    fetchListings(true);
  }, [fetchListings]);
  
  // Infinite scroll
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchListings(false);
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, fetchListings]);
  
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
  
  const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  
  const hasActiveFilters = selectedCategory || selectedCondition || minPrice || maxPrice || location || acceptsTrade !== null;
  
  return (
    <div className="min-h-screen" style={{ paddingTop: '80px' }}>
      {/* Hero Section - Clean & Minimal */}
      <section className="relative overflow-hidden" style={{ minHeight: '280px' }}>
        {/* Dark gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: isDark 
              ? 'linear-gradient(180deg, rgba(10,10,15,1) 0%, rgba(20,15,30,1) 100%)'
              : 'linear-gradient(180deg, rgba(250,250,255,1) 0%, rgba(245,240,255,1) 100%)',
          }}
        />
        
        {/* Subtle particles */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 2 + 0.5 + 'px',
                height: Math.random() * 2 + 0.5 + 'px',
                background: 'rgba(255,255,255,0.6)',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `-${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 
            className="text-5xl sm:text-6xl font-light tracking-wide mb-3"
            style={{ 
              color: isDark ? '#fff' : '#1a1a1a',
              fontFamily: isMinimalMod ? 'SF Mono, monospace' : 'inherit'
            }}
          >
            GLASSY SWAP
          </h1>
          <p 
            className="text-base mb-10 tracking-wide"
            style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
          >
            {language === 'ru' 
              ? 'Обменяй, улучши или найди железо среди энтузиастов'
              : 'Trade, upgrade or find gear among enthusiasts'}
          </p>
          
          {/* Search Bar - Large & Central */}
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search 
                size={20} 
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ru' ? 'Поиск RTX 4090, обмен, Москва...' : 'Search RTX 4090, trade, Moscow...'}
                className="w-full pl-12 pr-4 py-4 outline-none transition-all text-base"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: isMinimalMod ? '0' : '14px',
                  color: isDark ? '#fff' : '#1a1a1a',
                }}
              />
            </div>
            
            {/* Create Button - Subtle */}
            <button
              onClick={() => setShowCreateWizard(true)}
              className="flex items-center gap-2 px-5 py-4 font-medium transition-all"
              style={{
                background: 'transparent',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                borderRadius: isMinimalMod ? '0' : '14px',
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                boxShadow: isDark ? '0 0 20px rgba(255,255,255,0.03)' : 'none'
              }}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{language === 'ru' ? 'Создать' : 'Create'}</span>
            </button>
          </div>
        </div>
      </section>
      
      {/* Filters Bar - Minimal */}
      <section 
        className="sticky top-[64px] z-30 border-b"
        style={{
          background: isDark ? 'rgba(10,10,15,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: isMinimalMod ? 'none' : 'blur(20px)',
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Category Pills */}
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 text-sm whitespace-nowrap transition-all ${!selectedCategory ? 'opacity-100' : 'opacity-50'}`}
              style={{
                background: !selectedCategory ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                borderRadius: isMinimalMod ? '0' : '8px',
                color: isDark ? '#fff' : '#1a1a1a'
              }}
            >
              {language === 'ru' ? 'Все' : 'All'}
            </button>
            
            {categories.slice(0, 8).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
                className={`px-3 py-1.5 text-sm whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'opacity-100' : 'opacity-50'}`}
                style={{
                  background: selectedCategory === cat.id ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                  borderRadius: isMinimalMod ? '0' : '8px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              >
                {cat.name[language] || cat.name.en}
              </button>
            ))}
            
            <div className="flex-1" />
            
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all"
              style={{
                background: showFilters ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                borderRadius: isMinimalMod ? '0' : '8px',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
              }}
            >
              <SlidersHorizontal size={14} />
              {language === 'ru' ? 'Фильтры' : 'Filters'}
            </button>
            
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all"
                style={{
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                }}
              >
                <ArrowUpDown size={14} />
                {SORT_OPTIONS.find(s => s.value === sortBy)?.label[language]}
              </button>
              
              {showSortDropdown && (
                <div 
                  className="absolute right-0 top-full mt-1 py-1 min-w-[140px] z-50"
                  style={{
                    background: isDark ? 'rgba(15,15,20,0.98)' : 'rgba(255,255,255,0.98)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: isMinimalMod ? '0' : '10px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                  }}
                >
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                      className="w-full px-3 py-2 text-left text-sm transition-all"
                      style={{
                        color: sortBy === option.value ? '#8b5cf6' : (isDark ? '#fff' : '#1a1a1a'),
                      }}
                    >
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
              className="mt-2 pt-2 flex flex-wrap items-center gap-2"
              style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
            >
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="px-3 py-1.5 text-sm outline-none cursor-pointer"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: isMinimalMod ? '0' : '8px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              >
                <option value="">{language === 'ru' ? 'Состояние' : 'Condition'}</option>
                {Object.entries(CONDITION_LABELS).map(([key, labels]) => (
                  <option key={key} value={key}>{labels[language]}</option>
                ))}
              </select>
              
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder={language === 'ru' ? 'От ₽' : 'Min ₽'}
                className="w-24 px-3 py-1.5 text-sm outline-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: isMinimalMod ? '0' : '8px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={language === 'ru' ? 'До ₽' : 'Max ₽'}
                className="w-24 px-3 py-1.5 text-sm outline-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: isMinimalMod ? '0' : '8px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              />
              
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={language === 'ru' ? 'Город' : 'City'}
                className="w-28 px-3 py-1.5 text-sm outline-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: isMinimalMod ? '0' : '8px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              />
              
              <button
                onClick={() => setAcceptsTrade(acceptsTrade === true ? null : true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all"
                style={{
                  background: acceptsTrade ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: isMinimalMod ? '0' : '8px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              >
                <RefreshCw size={14} />
                {language === 'ru' ? 'Обмен' : 'Trade'}
              </button>
              
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Listings Grid - Masonry Style */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="mb-4 animate-pulse break-inside-avoid"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  borderRadius: isMinimalMod ? '0' : '12px',
                  height: 280 + Math.random() * 80 + 'px'
                }}
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState isDark={isDark} isMinimalMod={isMinimalMod} language={language} onCreate={() => setShowCreateWizard(true)} />
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {listings.map((listing, index) => (
                <React.Fragment key={listing.id}>
                  {/* AI Recommendation Card - Insert every 4th position */}
                  {index === 3 && (
                    <AIRecommendationCard isDark={isDark} isMinimalMod={isMinimalMod} language={language} />
                  )}
                  <ListingCard 
                    listing={listing} 
                    isDark={isDark} 
                    isMinimalMod={isMinimalMod}
                    language={language}
                    formatPrice={formatPrice}
                    onClick={() => navigate(`/glassy-swap/${listing.id}`)}
                  />
                </React.Fragment>
              ))}
            </div>
            
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                )}
              </div>
            )}
          </>
        )}
      </section>
      
      {/* Create Wizard Modal */}
      {showCreateWizard && (
        <CreateWizard 
          isDark={isDark} 
          isMinimalMod={isMinimalMod} 
          language={language}
          categories={categories}
          onClose={() => setShowCreateWizard(false)}
          onSuccess={() => { setShowCreateWizard(false); fetchListings(true); }}
        />
      )}
      
      {/* Mobile Create Button */}
      <button
        onClick={() => setShowCreateWizard(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 flex items-center justify-center lg:hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
          borderRadius: isMinimalMod ? '0' : '50%',
          color: isDark ? '#fff' : '#1a1a1a'
        }}
      >
        <Plus size={20} />
      </button>
      
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// ==========================================
// LISTING CARD - Minimal Style
// ==========================================
const ListingCard = ({ listing, isDark, isMinimalMod, language, formatPrice, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryImage = listing.images?.find(img => img.is_primary)?.url || listing.images?.[0]?.url;
  const conditionLabel = CONDITION_LABELS[listing.condition]?.[language] || listing.condition;
  
  const getTimeAgo = (dateStr) => {
    const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (days === 0) return language === 'ru' ? 'сегодня' : 'today';
    if (days === 1) return language === 'ru' ? 'вчера' : 'yesterday';
    return language === 'ru' ? `${days}д` : `${days}d`;
  };
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-4 break-inside-avoid cursor-pointer transition-all duration-300"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        borderRadius: isMinimalMod ? '0' : '12px',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 30px ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)'}` : 'none'
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={primaryImage || 'https://via.placeholder.com/400?text=No+Image'}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
        />
        
        {/* Hover Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300"
          style={{ 
            background: 'rgba(0,0,0,0.5)',
            opacity: isHovered ? 1 : 0 
          }}
        >
          <button className="px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            {language === 'ru' ? 'Смотреть' : 'View'}
          </button>
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3">
        {/* Price */}
        <div className="text-lg font-semibold mb-1" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
          {formatPrice(listing.price)}
        </div>
        
        {/* Title */}
        <h3 
          className="text-sm mb-2 line-clamp-2"
          style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
        >
          {listing.title}
        </h3>
        
        {/* Tags - Subtle text style */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
            #{conditionLabel.toLowerCase().replace(' ', '_')}
          </span>
          {listing.accepts_trade && (
            <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
              #trade
            </span>
          )}
          <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
            #{listing.location?.toLowerCase()}
          </span>
          {listing.seller_verified && (
            <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
              #verified
            </span>
          )}
        </div>
        
        {/* Seller + Stats */}
        <div className="flex items-center justify-between text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
          <div className="flex items-center gap-1">
            <span>{listing.seller_username || 'User'}</span>
            {listing.seller_rating > 0 && (
              <>
                <Star size={10} className="fill-current" style={{ color: '#fbbf24' }} />
                <span>{listing.seller_rating?.toFixed(1)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5"><Eye size={10} /> {listing.views}</span>
            <span>{getTimeAgo(listing.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// AI RECOMMENDATION CARD
// ==========================================
const AIRecommendationCard = ({ isDark, isMinimalMod, language }) => (
  <div
    className="mb-4 break-inside-avoid p-4"
    style={{
      background: isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.03)',
      border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)'}`,
      borderRadius: isMinimalMod ? '0' : '12px',
    }}
  >
    <div className="flex items-center gap-2 mb-2">
      <Sparkles size={14} style={{ color: '#8b5cf6' }} />
      <span className="text-xs font-medium" style={{ color: '#8b5cf6' }}>CORE AI</span>
    </div>
    <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
      {language === 'ru' 
        ? 'Ищете апгрейд на RTX 50-серию? Мы нашли 3 предложения для вас.'
        : 'Looking for RTX 50-series upgrade? We found 3 offers for you.'}
    </p>
    <button 
      className="mt-2 text-xs font-medium"
      style={{ color: '#8b5cf6' }}
    >
      {language === 'ru' ? 'Показать →' : 'Show →'}
    </button>
  </div>
);

// ==========================================
// EMPTY STATE
// ==========================================
const EmptyState = ({ isDark, isMinimalMod, language, onCreate }) => (
  <div className="text-center py-20">
    <div 
      className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        borderRadius: isMinimalMod ? '0' : '20px'
      }}
    >
      <Package size={32} style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }} />
    </div>
    <h3 className="text-lg font-medium mb-2" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
      {language === 'ru' ? 'Пока пусто' : 'Nothing here yet'}
    </h3>
    <p className="text-sm mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
      {language === 'ru' ? 'Будь первым, кто выставит своё железо' : 'Be the first to list your gear'}
    </p>
    <button
      onClick={onCreate}
      className="px-5 py-2.5 text-sm font-medium transition-all"
      style={{
        background: 'transparent',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
        borderRadius: isMinimalMod ? '0' : '10px',
        color: isDark ? '#fff' : '#1a1a1a'
      }}
    >
      {language === 'ru' ? 'Создать объявление' : 'Create Listing'}
    </button>
  </div>
);

// ==========================================
// DETAIL PAGE
// ==========================================
const SwapDetailPage = ({ id }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  
  const isMinimalMod = theme === 'minimal-mod';
  const isDark = theme === 'dark' || isMinimalMod;
  
  useEffect(() => {
    fetch(`${API_URL}/api/swap/listings/${id}`)
      .then(res => res.json())
      .then(data => { setListing(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);
  
  const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '80px' }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ paddingTop: '80px' }}>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
          {language === 'ru' ? 'Объявление не найдено' : 'Listing not found'}
        </p>
        <button onClick={() => navigate('/glassy-swap')} className="mt-4 text-sm" style={{ color: '#8b5cf6' }}>
          {language === 'ru' ? '← Назад' : '← Back'}
        </button>
      </div>
    );
  }
  
  const images = listing.images || [];
  const conditionLabel = CONDITION_LABELS[listing.condition]?.[language] || listing.condition;
  
  return (
    <div 
      className="min-h-screen" 
      style={{ 
        paddingTop: '80px',
        background: isDark 
          ? 'linear-gradient(180deg, rgba(10,10,15,1) 0%, rgba(15,15,20,1) 100%)'
          : 'linear-gradient(180deg, rgba(250,250,255,1) 0%, rgba(245,245,250,1) 100%)'
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/glassy-swap')}
          className="flex items-center gap-2 mb-6 text-sm transition-all"
          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
        >
          <ArrowLeft size={18} />
          {language === 'ru' ? 'Назад' : 'Back'}
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div 
              className="relative aspect-square mb-3 overflow-hidden"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderRadius: isMinimalMod ? '0' : '16px'
              }}
            >
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]?.url}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} style={{ color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                </div>
              )}
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: isMinimalMod ? '0' : '50%',
                      color: '#fff'
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: isMinimalMod ? '0' : '50%',
                      color: '#fff'
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className="w-16 h-16 flex-shrink-0 overflow-hidden transition-all"
                    style={{
                      borderRadius: isMinimalMod ? '0' : '8px',
                      border: currentImageIndex === i ? '2px solid rgba(139,92,246,0.5)' : '2px solid transparent',
                      opacity: currentImageIndex === i ? 1 : 0.5
                    }}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div>
            {/* Price */}
            <div className="text-3xl font-bold mb-2" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
              {formatPrice(listing.price)}
            </div>
            
            {/* Title */}
            <h1 
              className="text-xl font-medium mb-4"
              style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
            >
              {listing.title}
            </h1>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span 
                className="px-3 py-1 text-sm"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  borderRadius: isMinimalMod ? '0' : '6px',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                }}
              >
                {conditionLabel}
              </span>
              {listing.accepts_trade && (
                <span 
                  className="px-3 py-1 text-sm flex items-center gap-1"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: isMinimalMod ? '0' : '6px',
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                  }}
                >
                  <RefreshCw size={12} /> {language === 'ru' ? 'Обмен' : 'Trade'}
                </span>
              )}
              <span 
                className="px-3 py-1 text-sm flex items-center gap-1"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  borderRadius: isMinimalMod ? '0' : '6px',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                }}
              >
                <MapPin size={12} /> {listing.location}
              </span>
            </div>
            
            {/* Seller */}
            <div 
              className="p-4 mb-6"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderRadius: isMinimalMod ? '0' : '12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-lg font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    borderRadius: isMinimalMod ? '0' : '50%',
                    color: '#fff'
                  }}
                >
                  {listing.seller_username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
                      {listing.seller_username || 'User'}
                    </span>
                    {listing.seller_verified && <Shield size={14} className="text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    {listing.seller_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        {listing.seller_rating?.toFixed(1)}
                      </span>
                    )}
                    <span>• {listing.seller_deals_count || 0} {language === 'ru' ? 'сделок' : 'deals'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                {language === 'ru' ? 'Описание' : 'Description'}
              </h3>
              <p 
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}
              >
                {listing.description}
              </p>
            </div>
            
            {/* Trade Preferences */}
            {listing.trade_preferences && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  {language === 'ru' ? 'Предпочтения по обмену' : 'Trade preferences'}
                </h3>
                <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {listing.trade_preferences}
                </p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Open GlassyChatBar with Messages tab
                  window.dispatchEvent(new CustomEvent('openGlassyChat', { detail: { tab: 'messages' } }));
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: isMinimalMod ? '0' : '12px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
              >
                <MessageCircle size={18} />
                {language === 'ru' ? 'Написать' : 'Message'}
              </button>
              
              {listing.accepts_trade && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
                    border: `1px solid rgba(139,92,246,0.3)`,
                    borderRadius: isMinimalMod ? '0' : '12px',
                    color: '#a78bfa'
                  }}
                >
                  <RefreshCw size={18} />
                  {language === 'ru' ? 'Обмен' : 'Trade'}
                </button>
              )}
              
              <button
                className="w-12 h-12 flex items-center justify-center transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: isMinimalMod ? '0' : '12px',
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                }}
              >
                <Heart size={18} />
              </button>
              
              <button
                className="w-12 h-12 flex items-center justify-center transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: isMinimalMod ? '0' : '12px',
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                }}
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CREATE WIZARD
// ==========================================
const CreateWizard = ({ isDark, isMinimalMod, language, categories, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = React.useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    condition: 'good',
    location: '',
    accepts_trade: false,
    trade_preferences: '',
    images: [],
    tags: []
  });
  
  const WIZARD_STEPS = [
    { num: 1, icon: Tag, label: language === 'ru' ? 'Категория' : 'Category' },
    { num: 2, icon: ImageIcon, label: language === 'ru' ? 'Фото' : 'Photos' },
    { num: 3, icon: FileText, label: language === 'ru' ? 'Детали' : 'Details' },
    { num: 4, icon: CheckCircle, label: language === 'ru' ? 'Готово' : 'Done' },
  ];
  
  const aiTips = {
    1: language === 'ru' ? 'Правильная категория увеличивает просмотры на 60%' : 'Right category increases views by 60%',
    2: language === 'ru' ? 'Объявления с 3+ фото продаются на 40% быстрее' : 'Listings with 3+ photos sell 40% faster',
    3: language === 'ru' ? 'Подробное описание повышает доверие покупателей' : 'Detailed description builds buyer trust',
    4: language === 'ru' ? 'Отличная работа! Объявление готово к публикации' : 'Great work! Your listing is ready',
  };
  
  const handleSubmit = async () => {
    if (!user) {
      alert(language === 'ru' ? 'Войдите, чтобы создать объявление' : 'Login to create a listing');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/swap/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          images: formData.images.map((url, i) => ({ url, is_primary: i === 0 }))
        })
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        alert(err.detail || 'Error creating listing');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: isDark ? 'rgba(15,15,20,0.98)' : 'rgba(255,255,255,0.98)',
          borderRadius: isMinimalMod ? '0' : '20px 20px 0 0',
          animation: 'slideUp 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div 
          className="sticky top-0 z-10 p-4 border-b"
          style={{ 
            background: isDark ? 'rgba(15,15,20,0.98)' : 'rgba(255,255,255,0.98)',
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' 
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
              {language === 'ru' ? 'Новое объявление' : 'New Listing'}
            </h2>
            <button onClick={onClose} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {WIZARD_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div 
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: step >= s.num ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') }}
                >
                  <s.icon size={14} />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className="flex-1 h-px" style={{ background: step > s.num ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* AI Tip */}
        <div 
          className="mx-4 mt-4 p-3 flex items-center gap-2"
          style={{
            background: isDark ? 'rgba(139,92,246,0.05)' : 'rgba(139,92,246,0.05)',
            borderRadius: isMinimalMod ? '0' : '10px',
            border: `1px solid rgba(139,92,246,0.1)`
          }}
        >
          <Sparkles size={14} style={{ color: '#8b5cf6' }} />
          <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            {aiTips[step]}
          </span>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {language === 'ru' ? 'Название' : 'Title'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={language === 'ru' ? 'RTX 4090 Founders Edition' : 'RTX 4090 Founders Edition'}
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: isMinimalMod ? '0' : '10px',
                    color: isDark ? '#fff' : '#1a1a1a'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {language === 'ru' ? 'Категория' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 outline-none cursor-pointer"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: isMinimalMod ? '0' : '10px',
                    color: isDark ? '#fff' : '#1a1a1a'
                  }}
                >
                  <option value="">{language === 'ru' ? 'Выберите категорию' : 'Select category'}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name[language] || cat.name.en}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                {language === 'ru' ? 'Фотографии' : 'Photos'}
              </label>
              
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#8b5cf6'; }}
                onDragLeave={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  if (files.length > 0) await handleFileUpload(files);
                }}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) await handleFileUpload(files);
                  }}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                      {language === 'ru' ? 'Загрузка...' : 'Uploading...'}
                    </span>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', margin: '0 auto 8px' }} />
                    <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                      {language === 'ru' ? 'Перетащите фото или нажмите для выбора' : 'Drag photos here or click to select'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
                      {language === 'ru' ? 'До 5 фото, макс 10MB каждое' : 'Up to 5 photos, max 10MB each'}
                    </p>
                  </>
                )}
              </div>
              
              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {uploadedImages.map((img, i) => (
                    <div 
                      key={i} 
                      className="relative w-20 h-20 rounded-lg overflow-hidden"
                      style={{ border: i === 0 ? '2px solid #8b5cf6' : '2px solid transparent' }}
                    >
                      <img src={`${API_URL}${img.url}`} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          setUploadedImages(prev => prev.filter((_, idx) => idx !== i));
                          setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                        }}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 rounded-full text-white text-xs"
                      >
                        ×
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-purple-600/80 text-white text-xs py-0.5 text-center">
                          {language === 'ru' ? 'Главное' : 'Main'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Or use URL */}
              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                <span 
                  className="relative px-3 text-xs mx-auto block w-fit"
                  style={{ 
                    background: isDark ? '#15151a' : '#fff',
                    color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
                  }}
                >
                  {language === 'ru' ? 'или вставьте ссылку' : 'or paste URL'}
                </span>
              </div>
              
              <input
                type="text"
                placeholder={language === 'ru' ? 'https://example.com/photo.jpg' : 'https://example.com/photo.jpg'}
                className="w-full px-4 py-3 outline-none text-sm"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: isMinimalMod ? '0' : '10px',
                  color: isDark ? '#fff' : '#1a1a1a'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    const url = e.target.value.trim();
                    if (url.startsWith('http')) {
                      setUploadedImages(prev => [...prev, { url }]);
                      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    {language === 'ru' ? 'Цена ₽' : 'Price ₽'}
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 outline-none"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: isMinimalMod ? '0' : '10px',
                      color: isDark ? '#fff' : '#1a1a1a'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    {language === 'ru' ? 'Состояние' : 'Condition'}
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-4 py-3 outline-none cursor-pointer"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: isMinimalMod ? '0' : '10px',
                      color: isDark ? '#fff' : '#1a1a1a'
                    }}
                  >
                    {Object.entries(CONDITION_LABELS).map(([key, labels]) => (
                      <option key={key} value={key}>{labels[language]}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {language === 'ru' ? 'Город' : 'City'}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={language === 'ru' ? 'Москва' : 'Moscow'}
                  className="w-full px-4 py-3 outline-none"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: isMinimalMod ? '0' : '10px',
                    color: isDark ? '#fff' : '#1a1a1a'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {language === 'ru' ? 'Описание' : 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 outline-none resize-none"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: isMinimalMod ? '0' : '10px',
                    color: isDark ? '#fff' : '#1a1a1a'
                  }}
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accepts_trade}
                  onChange={(e) => setFormData(prev => ({ ...prev, accepts_trade: e.target.checked }))}
                />
                <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  {language === 'ru' ? 'Готов к обмену' : 'Open to trade'}
                </span>
              </label>
            </div>
          )}
          
          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
                {language === 'ru' ? 'Всё готово!' : 'All set!'}
              </h3>
              <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                {language === 'ru' ? 'Нажмите "Опубликовать" для создания объявления' : 'Click "Publish" to create your listing'}
              </p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div 
          className="sticky bottom-0 p-4 border-t flex gap-3"
          style={{ 
            background: isDark ? 'rgba(15,15,20,0.98)' : 'rgba(255,255,255,0.98)',
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' 
          }}
        >
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-2.5 text-sm"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              {language === 'ru' ? 'Назад' : 'Back'}
            </button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!formData.title || !formData.category)}
              className="px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-30"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                borderRadius: isMinimalMod ? '0' : '10px',
                color: '#fff'
              }}
            >
              {language === 'ru' ? 'Далее' : 'Next'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: isMinimalMod ? '0' : '10px',
                color: '#fff'
              }}
            >
              {isSubmitting ? '...' : (language === 'ru' ? 'Опубликовать' : 'Publish')}
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default GlassySwapPage;
