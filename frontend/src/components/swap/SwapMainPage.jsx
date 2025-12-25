import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Plus, ArrowUpDown, RefreshCw, X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { API_URL } from './constants';
import { formatPrice } from './utils';
import ListingCard from './ListingCard';
import AIRecommendationCard from './AIRecommendationCard';
import EmptyState from './EmptyState';
import CreateWizard from './CreateWizard';
import '../../styles/glassmorphism.css';

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

export default SwapMainPage;
