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
  ImageIcon,
  Tag,
  FileText,
  CheckCircle,
  Package
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/glassmorphism.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Condition keys for translations
const CONDITIONS = ['new', 'like_new', 'excellent', 'good', 'fair', 'parts'];

const GlassySwapPage = () => {
  const { id } = useParams();
  
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
  const { t } = useLanguage();
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

  const sortOptions = [
    { value: 'newest', label: t('swap.sortNewest') },
    { value: 'price_asc', label: t('swap.sortPriceAsc') },
    { value: 'price_desc', label: t('swap.sortPriceDesc') },
    { value: 'popular', label: t('swap.sortPopular') }
  ];

  const conditionOptions = [
    { value: 'new', label: t('swap.conditionNew') },
    { value: 'like_new', label: t('swap.conditionLikeNew') },
    { value: 'excellent', label: t('swap.conditionExcellent') },
    { value: 'good', label: t('swap.conditionGood') },
    { value: 'fair', label: t('swap.conditionFair') },
    { value: 'parts', label: t('swap.conditionParts') }
  ];
  
  return (
    <div className="dark-bg min-h-screen" style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ minHeight: '280px' }}>
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 2 + 0.5 + 'px',
                height: Math.random() * 2 + 0.5 + 'px',
                background: 'currentColor',
                opacity: 0.3,
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
            style={{ fontFamily: isMinimalMod ? 'SF Mono, monospace' : 'inherit' }}
          >
            {t('swap.title')}
          </h1>
          <p className="text-base mb-10 tracking-wide opacity-50">
            {t('swap.subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('swap.searchPlaceholder')}
                className="glass w-full pl-12 pr-4 py-4 outline-none transition-all text-base"
                style={{ borderRadius: isMinimalMod ? '0' : '14px' }}
              />
            </div>
            
            {/* Create Button */}
            <button
              onClick={() => setShowCreateWizard(true)}
              className="glass flex items-center gap-2 px-5 py-4 font-medium transition-all hover:bg-white/10"
              style={{ borderRadius: isMinimalMod ? '0' : '14px' }}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t('swap.create')}</span>
            </button>
          </div>
        </div>
      </section>
      
      {/* Filters Bar */}
      <section className="sticky top-[64px] z-30 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Category Pills */}
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 text-sm whitespace-nowrap transition-all ${!selectedCategory ? 'opacity-100 bg-white/10' : 'opacity-50'}`}
              style={{ borderRadius: isMinimalMod ? '0' : '8px' }}
            >
              {t('swap.all')}
            </button>
            
            {categories.slice(0, 8).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
                className={`px-3 py-1.5 text-sm whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'opacity-100 bg-white/10' : 'opacity-50'}`}
                style={{ borderRadius: isMinimalMod ? '0' : '8px' }}
              >
                {cat.name.ru || cat.name.en}
              </button>
            ))}
            
            <div className="flex-1" />
            
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all ${showFilters ? 'bg-white/10' : ''}`}
              style={{ borderRadius: isMinimalMod ? '0' : '8px' }}
            >
              <SlidersHorizontal size={14} />
              {t('swap.filters')}
            </button>
            
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all opacity-70"
              >
                <ArrowUpDown size={14} />
                {sortOptions.find(s => s.value === sortBy)?.label}
              </button>
              
              {showSortDropdown && (
                <div 
                  className="absolute right-0 top-full mt-1 py-1 min-w-[140px] z-50 glass"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                >
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                      className="w-full px-3 py-2 text-left text-sm transition-all hover:bg-white/10"
                      style={{ color: sortBy === option.value ? '#8b5cf6' : 'inherit' }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-2 pt-2 flex flex-wrap items-center gap-2 border-t border-white/5">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="glass px-3 py-1.5 text-sm outline-none cursor-pointer"
                style={{ borderRadius: isMinimalMod ? '0' : '8px' }}
              >
                <option value="">{t('swap.condition')}</option>
                {conditionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder={t('swap.priceFrom')}
                className="glass w-24 px-3 py-1.5 text-sm outline-none"
                style={{ borderRadius: isMinimalMod ? '0' : '8px' }}
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={t('swap.priceTo')}
                className="glass w-24 px-3 py-1.5 text-sm outline-none"
                style={{ borderRadius: isMinimalMod ? '0' : '8px' }}
              />
              
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('swap.city')}
                className="glass w-28 px-3 py-1.5 text-sm outline-none"
                style={{ borderRadius: isMinimalMod ? '0' : '8px' }}
              />
              
              <button
                onClick={() => setAcceptsTrade(acceptsTrade === true ? null : true)}
                className={`glass flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all ${acceptsTrade ? 'bg-white/10' : ''}`}
                style={{ borderRadius: isMinimalMod ? '0' : '8px' }}
              >
                <RefreshCw size={14} />
                {t('swap.trade')}
              </button>
              
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm opacity-40 hover:opacity-100">
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Listings Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="mb-4 glass animate-pulse break-inside-avoid"
                style={{ borderRadius: isMinimalMod ? '0' : '12px', height: 280 + Math.random() * 80 + 'px' }}
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState t={t} isMinimalMod={isMinimalMod} onCreate={() => setShowCreateWizard(true)} />
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {listings.map((listing, index) => (
                <React.Fragment key={listing.id}>
                  {index === 3 && <AIRecommendationCard t={t} isMinimalMod={isMinimalMod} />}
                  <ListingCard 
                    listing={listing} 
                    isMinimalMod={isMinimalMod}
                    t={t}
                    formatPrice={formatPrice}
                    onClick={() => navigate(`/glassy-swap/${listing.id}`)}
                  />
                </React.Fragment>
              ))}
            </div>
            
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="w-5 h-5 border border-current/20 border-t-current/60 rounded-full animate-spin" />
                )}
              </div>
            )}
          </>
        )}
      </section>
      
      {/* Create Wizard Modal */}
      {showCreateWizard && (
        <CreateWizard 
          isMinimalMod={isMinimalMod} 
          t={t}
          categories={categories}
          onClose={() => setShowCreateWizard(false)}
          onSuccess={() => { setShowCreateWizard(false); fetchListings(true); }}
        />
      )}
      
      {/* Mobile Create Button */}
      <button
        onClick={() => setShowCreateWizard(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 flex items-center justify-center lg:hidden glass"
        style={{ borderRadius: isMinimalMod ? '0' : '50%' }}
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
// LISTING CARD
// ==========================================
const ListingCard = ({ listing, isMinimalMod, t, formatPrice, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryImage = listing.images?.find(img => img.is_primary)?.url || listing.images?.[0]?.url;
  
  const getConditionLabel = (condition) => {
    const map = {
      new: t('swap.conditionNew'),
      like_new: t('swap.conditionLikeNew'),
      excellent: t('swap.conditionExcellent'),
      good: t('swap.conditionGood'),
      fair: t('swap.conditionFair'),
      parts: t('swap.conditionParts')
    };
    return map[condition] || condition;
  };
  
  const getTimeAgo = (dateStr) => {
    const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (days === 0) return t('swap.today');
    if (days === 1) return t('swap.yesterday');
    return `${days}${t('swap.daysAgo')}`;
  };
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-4 break-inside-avoid cursor-pointer transition-all duration-300 glass"
      style={{
        borderRadius: isMinimalMod ? '0' : '12px',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={primaryImage?.startsWith('/') ? `${API_URL}${primaryImage}` : primaryImage || 'https://via.placeholder.com/400?text=No+Image'}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
        />
        
        {/* Hover Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.5)', opacity: isHovered ? 1 : 0 }}
        >
          <button className="px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            {t('swap.view')}
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
        <div className="text-lg font-semibold mb-1">{formatPrice(listing.price)}</div>
        <h3 className="text-sm mb-2 line-clamp-2 opacity-70">{listing.title}</h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-xs opacity-35">#{getConditionLabel(listing.condition).toLowerCase().replace(' ', '_')}</span>
          {listing.accepts_trade && <span className="text-xs opacity-35">#trade</span>}
          <span className="text-xs opacity-35">#{listing.location?.toLowerCase()}</span>
          {listing.seller_verified && <span className="text-xs opacity-35">#verified</span>}
        </div>
        
        {/* Seller + Stats */}
        <div className="flex items-center justify-between text-xs opacity-40">
          <div className="flex items-center gap-1">
            <span>{listing.seller_username || 'User'}</span>
            {listing.seller_rating > 0 && (
              <>
                <Star size={10} className="fill-yellow-500 text-yellow-500" />
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
const AIRecommendationCard = ({ t, isMinimalMod }) => (
  <div
    className="mb-4 break-inside-avoid p-4 glass"
    style={{
      borderRadius: isMinimalMod ? '0' : '12px',
      borderColor: 'rgba(139, 92, 246, 0.2)',
      background: 'rgba(139, 92, 246, 0.05)'
    }}
  >
    <div className="flex items-center gap-2 mb-2">
      <Sparkles size={14} style={{ color: '#8b5cf6' }} />
      <span className="text-xs font-medium" style={{ color: '#8b5cf6' }}>CORE AI</span>
    </div>
    <p className="text-sm opacity-60">
      Looking for RTX 50-series upgrade? We found 3 offers for you.
    </p>
    <button className="mt-2 text-xs font-medium" style={{ color: '#8b5cf6' }}>
      Show →
    </button>
  </div>
);

// ==========================================
// EMPTY STATE
// ==========================================
const EmptyState = ({ t, isMinimalMod, onCreate }) => (
  <div className="text-center py-20">
    <div 
      className="w-20 h-20 mx-auto mb-6 flex items-center justify-center glass"
      style={{ borderRadius: isMinimalMod ? '0' : '20px' }}
    >
      <Package size={32} className="opacity-20" />
    </div>
    <h3 className="text-lg font-medium mb-2">{t('swap.nothingYet')}</h3>
    <p className="text-sm mb-6 opacity-50">{t('swap.beFirst')}</p>
    <button
      onClick={onCreate}
      className="glass px-5 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
      style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
    >
      {t('swap.createListing')}
    </button>
  </div>
);

// ==========================================
// DETAIL PAGE
// ==========================================
const SwapDetailPage = ({ id }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isMinimalMod = theme === 'minimal-mod';
  
  useEffect(() => {
    fetch(`${API_URL}/api/swap/listings/${id}`)
      .then(res => res.json())
      .then(data => { setListing(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);
  
  const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';

  const getConditionLabel = (condition) => {
    const map = {
      new: t('swap.conditionNew'),
      like_new: t('swap.conditionLikeNew'),
      excellent: t('swap.conditionExcellent'),
      good: t('swap.conditionGood'),
      fair: t('swap.conditionFair'),
      parts: t('swap.conditionParts')
    };
    return map[condition] || condition;
  };
  
  if (loading) {
    return (
      <div className="dark-bg min-h-screen flex items-center justify-center" style={{ paddingTop: '80px' }} data-theme={theme}>
        <div className="w-8 h-8 border-2 border-current/20 border-t-current/60 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="dark-bg min-h-screen flex flex-col items-center justify-center" style={{ paddingTop: '80px' }} data-theme={theme}>
        <p className="opacity-60">{t('swap.listingNotFound')}</p>
        <button onClick={() => navigate('/glassy-swap')} className="mt-4 text-sm" style={{ color: '#8b5cf6' }}>
          ← {t('swap.back')}
        </button>
      </div>
    );
  }
  
  const images = listing.images || [];
  
  return (
    <div className="dark-bg min-h-screen" style={{ paddingTop: '80px' }} data-theme={theme}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/glassy-swap')}
          className="flex items-center gap-2 mb-6 text-sm transition-all opacity-60 hover:opacity-100"
        >
          <ArrowLeft size={18} />
          {t('swap.back')}
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div 
              className="relative aspect-square mb-3 overflow-hidden glass"
              style={{ borderRadius: isMinimalMod ? '0' : '16px' }}
            >
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]?.url?.startsWith('/') ? `${API_URL}${images[currentImageIndex]?.url}` : images[currentImageIndex]?.url}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} className="opacity-10" />
                </div>
              )}
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center glass"
                    style={{ borderRadius: isMinimalMod ? '0' : '50%' }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center glass"
                    style={{ borderRadius: isMinimalMod ? '0' : '50%' }}
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
                    <img 
                      src={img.url?.startsWith('/') ? `${API_URL}${img.url}` : img.url} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div>
            <div className="text-3xl font-bold mb-2">{formatPrice(listing.price)}</div>
            <h1 className="text-xl font-medium mb-4 opacity-90">{listing.title}</h1>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="glass px-3 py-1 text-sm" style={{ borderRadius: isMinimalMod ? '0' : '6px' }}>
                {getConditionLabel(listing.condition)}
              </span>
              {listing.accepts_trade && (
                <span className="glass px-3 py-1 text-sm flex items-center gap-1" style={{ borderRadius: isMinimalMod ? '0' : '6px' }}>
                  <RefreshCw size={12} /> {t('swap.trade')}
                </span>
              )}
              <span className="glass px-3 py-1 text-sm flex items-center gap-1" style={{ borderRadius: isMinimalMod ? '0' : '6px' }}>
                <MapPin size={12} /> {listing.location}
              </span>
            </div>
            
            {/* Seller */}
            <div className="glass p-4 mb-6" style={{ borderRadius: isMinimalMod ? '0' : '12px' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-lg font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: isMinimalMod ? '0' : '50%' }}
                >
                  {listing.seller_username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{listing.seller_username || 'User'}</span>
                    {listing.seller_verified && <Shield size={14} className="text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    {listing.seller_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        {listing.seller_rating?.toFixed(1)}
                      </span>
                    )}
                    <span>• {listing.seller_deals_count || 0} {t('swap.deals')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2 opacity-50">{t('swap.description')}</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-80">{listing.description}</p>
            </div>
            
            {/* Trade Preferences */}
            {listing.trade_preferences && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2 opacity-50">{t('swap.tradePreferences')}</h3>
                <p className="text-sm opacity-70">{listing.trade_preferences}</p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openGlassyChat', { detail: { tab: 'messages' } }))}
                className="flex-1 glass flex items-center justify-center gap-2 py-3 font-medium transition-all hover:bg-white/10"
                style={{ borderRadius: isMinimalMod ? '0' : '12px' }}
              >
                <MessageCircle size={18} />
                {t('swap.message')}
              </button>
              
              {listing.accepts_trade && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: isMinimalMod ? '0' : '12px',
                    color: '#a78bfa'
                  }}
                >
                  <RefreshCw size={18} />
                  {t('swap.trade')}
                </button>
              )}
              
              <button className="glass w-12 h-12 flex items-center justify-center transition-all hover:bg-white/10" style={{ borderRadius: isMinimalMod ? '0' : '12px' }}>
                <Heart size={18} />
              </button>
              
              <button className="glass w-12 h-12 flex items-center justify-center transition-all hover:bg-white/10" style={{ borderRadius: isMinimalMod ? '0' : '12px' }}>
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
const CreateWizard = ({ isMinimalMod, t, categories, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  
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
    { num: 1, icon: Tag, label: t('swap.stepCategory') },
    { num: 2, icon: ImageIcon, label: t('swap.stepPhotos') },
    { num: 3, icon: FileText, label: t('swap.stepDetails') },
    { num: 4, icon: CheckCircle, label: t('swap.stepDone') },
  ];
  
  const aiTips = {
    1: t('swap.aiTip1'),
    2: t('swap.aiTip2'),
    3: t('swap.aiTip3'),
    4: t('swap.aiTip4'),
  };

  const conditionOptions = [
    { value: 'new', label: t('swap.conditionNew') },
    { value: 'like_new', label: t('swap.conditionLikeNew') },
    { value: 'excellent', label: t('swap.conditionExcellent') },
    { value: 'good', label: t('swap.conditionGood') },
    { value: 'fair', label: t('swap.conditionFair') },
    { value: 'parts', label: t('swap.conditionParts') }
  ];

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (uploadedImages.length + files.length > 5) {
      alert(t('swap.maxPhotos'));
      return;
    }
    
    setUploading(true);
    const token = localStorage.getItem('auth_token');
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) continue;
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      try {
        const res = await fetch(`${API_URL}/api/upload/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataUpload
        });
        
        if (res.ok) {
          const data = await res.json();
          setUploadedImages(prev => [...prev, data]);
          setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    
    setUploading(false);
  };
  
  const handleSubmit = async () => {
    if (!user) {
      alert('Login to create a listing');
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
        className="dark-bg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: isMinimalMod ? '0' : '20px 20px 0 0' }}
        data-theme={theme}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="sticky top-0 z-10 p-4 border-b border-white/5 glass">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">{t('swap.newListing')}</h2>
            <button onClick={onClose} className="opacity-50 hover:opacity-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {WIZARD_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div 
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: step >= s.num ? '#8b5cf6' : 'inherit', opacity: step >= s.num ? 1 : 0.3 }}
                >
                  <s.icon size={14} />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className="flex-1 h-px" style={{ background: step > s.num ? '#8b5cf6' : 'currentColor', opacity: 0.1 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* AI Tip */}
        <div className="mx-4 mt-4 p-3 flex items-center gap-2 glass" style={{ borderRadius: isMinimalMod ? '0' : '10px', borderColor: 'rgba(139,92,246,0.2)' }}>
          <Sparkles size={14} style={{ color: '#8b5cf6' }} />
          <span className="text-xs opacity-70">{aiTips[step]}</span>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 opacity-70">{t('swap.titleLabel')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="RTX 4090 Founders Edition"
                  className="glass w-full px-4 py-3 outline-none"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 opacity-70">{t('swap.categoryLabel')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="glass w-full px-4 py-3 outline-none cursor-pointer"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                >
                  <option value="">{t('swap.selectCategory')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name.ru || cat.name.en}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm mb-2 opacity-70">{t('swap.photos')}</label>
              
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  if (files.length > 0) await handleFileUpload(files);
                }}
                className="glass border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:bg-white/5"
                style={{ borderRadius: isMinimalMod ? '0' : '12px' }}
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
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm opacity-50">{t('swap.dragPhotos')}</p>
                    <p className="text-xs mt-1 opacity-30">{t('swap.maxPhotos')}</p>
                  </>
                )}
              </div>
              
              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {uploadedImages.map((img, i) => (
                    <div 
                      key={i} 
                      className="relative w-20 h-20 overflow-hidden"
                      style={{ 
                        borderRadius: isMinimalMod ? '0' : '8px',
                        border: i === 0 ? '2px solid #8b5cf6' : '2px solid transparent' 
                      }}
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
                          {t('swap.main')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Or use URL */}
              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                <span className="relative px-3 text-xs mx-auto block w-fit opacity-40" style={{ background: 'inherit' }}>
                  {t('swap.orPasteUrl')}
                </span>
              </div>
              
              <input
                type="text"
                placeholder="https://example.com/photo.jpg"
                className="glass w-full px-4 py-3 outline-none text-sm"
                style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
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
                  <label className="block text-sm mb-2 opacity-70">{t('swap.priceLabel')}</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="glass w-full px-4 py-3 outline-none"
                    style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 opacity-70">{t('swap.condition')}</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="glass w-full px-4 py-3 outline-none cursor-pointer"
                    style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                  >
                    {conditionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2 opacity-70">{t('swap.location')}</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Moscow"
                  className="glass w-full px-4 py-3 outline-none"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 opacity-70">{t('swap.descriptionLabel')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="glass w-full px-4 py-3 outline-none resize-none"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accepts_trade}
                  onChange={(e) => setFormData(prev => ({ ...prev, accepts_trade: e.target.checked }))}
                />
                <span className="text-sm opacity-70">{t('swap.openToTrade')}</span>
              </label>
            </div>
          )}
          
          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h3 className="text-lg font-medium mb-2">{t('swap.allSet')}</h3>
              <p className="text-sm opacity-50">{t('swap.clickPublish')}</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="sticky bottom-0 p-4 border-t border-white/5 flex gap-3 glass">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-2.5 text-sm opacity-60"
            >
              {t('swap.back')}
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
              {t('swap.next')}
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
              {isSubmitting ? '...' : t('swap.publish')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlassySwapPage;
