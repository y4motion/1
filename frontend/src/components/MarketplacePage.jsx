import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, Eye, Star, X, ShoppingCart, Grid, List, Zap, CreditCard, MapPin, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/glassmorphism.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const MarketplacePage = () => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, selectedTag, sortBy, searchTerm, minPrice, maxPrice, itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories/`);  // Added trailing slash
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/products/?limit=${itemsPerPage}&sort_by=${sortBy}&sort_order=desc`;  // Use itemsPerPage
      
      if (selectedCategory !== 'all') {
        url += `&category_id=${selectedCategory}`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (minPrice) {
        url += `&min_price=${minPrice}`;
      }
      
      if (maxPrice) {
        url += `&max_price=${maxPrice}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();
        
        // Filter by featured tag if selected
        if (selectedTag !== 'all') {
          data = data.filter(p => p.tags && p.tags.includes(selectedTag));
        }
        
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!token) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${productId}/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleFeaturedChipClick = (tag) => {
    setSelectedTag(tag);
    setSelectedCategory('all');
  };

  const featuredChips = [
    { id: 'pro-gaming', label: 'PRO GAMING', icon: '🎮', tag: 'pro-gaming' },
    { id: 'pro-creator', label: 'PRO CREATOR', icon: '🎨', tag: 'pro-creator' },
    { id: 'our-choice', label: 'OUR CHOICE', icon: '⭐', tag: 'featured' }
  ];

  return (
    <div className="dark-bg" style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }}>
      <div className="grain-overlay" />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '900',
            marginBottom: '0.5rem',
            letterSpacing: '3px',
            background: 'linear-gradient(135deg, #fff 0%, #a8a8a8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase'
          }}>
            MINIMAL MARKET
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.7, marginBottom: '2rem' }}>
            Discover premium gaming gear from verified sellers
          </p>

          {/* Featured Chips */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {featuredChips.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleFeaturedChipClick(chip.tag)}
                className="glass-subtle featured-chip"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '50px',
                  border: selectedTag === chip.tag 
                    ? '2px solid rgba(255, 255, 255, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedTag === chip.tag
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  if (selectedTag !== chip.tag) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTag !== chip.tag) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{chip.icon}</span>
                {chip.label}
              </button>
            ))}
            
            {/* Clear Filters Chip */}
            {selectedTag !== 'all' && (
              <button
                onClick={() => setSelectedTag('all')}
                className="glass-subtle"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '50px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 59, 48, 0.1)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ff3b30'
                }}
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search & Filters Row */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '3rem',
          alignItems: 'center'
        }}>
          {/* Minimalist Search Bar */}
          <div style={{ 
            position: 'relative', 
            flex: 1,
            maxWidth: '600px'
          }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '1.25rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                opacity: 0.4,
                pointerEvents: 'none',
                zIndex: 2
              }} 
            />
            <input
              type="text"
              placeholder="Search for gear..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="minimal-search"
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3.5rem',
                borderRadius: '50px',
                border: 'none',
                background: 'transparent',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.backdropFilter = 'blur(10px)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.backdropFilter = 'none';
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.currentTarget) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.backdropFilter = 'blur(10px)';
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.currentTarget) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.backdropFilter = 'none';
                }
              }}
            />
          </div>

          {/* View Mode Toggles */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.375rem',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '50px',
                border: 'none',
                background: viewMode === 'grid' 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              <Grid size={18} />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '50px',
                border: 'none',
                background: viewMode === 'list' 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              <List size={18} />
              List
            </button>
          </div>

          {/* Items Per Page Selector */}
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '100px'
            }}
          >
            <option value={20} style={{ background: '#1a1a1a' }}>20 items</option>
            <option value={40} style={{ background: '#1a1a1a' }}>40 items</option>
            <option value={60} style={{ background: '#1a1a1a' }}>60 items</option>
            <option value={100} style={{ background: '#1a1a1a' }}>100 items</option>
          </select>

          {/* Filter Button - Independent Island */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="glass-subtle"
            style={{
              padding: '1rem',
              borderRadius: '50px',
              border: showFilters 
                ? '2px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              background: showFilters
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '48px',
              minHeight: '48px'
            }}
            onMouseEnter={(e) => {
              if (!showFilters) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilters) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Filters Popup */}
        {showFilters && (
          <div 
            className="glass-strong"
            style={{
              padding: '2rem',
              borderRadius: '16px',
              marginBottom: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                  color: '#fff'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Category Filter */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  marginBottom: '0.75rem',
                  opacity: 0.8,
                  fontWeight: '600'
                }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="all" style={{ background: '#1a1a1a' }}>All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} style={{ background: '#1a1a1a' }}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  marginBottom: '0.75rem',
                  opacity: 0.8,
                  fontWeight: '600'
                }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="created_at" style={{ background: '#1a1a1a' }}>Newest</option>
                  <option value="price" style={{ background: '#1a1a1a' }}>Price</option>
                  <option value="average_rating" style={{ background: '#1a1a1a' }}>Rating</option>
                  <option value="views" style={{ background: '#1a1a1a' }}>Popular</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  marginBottom: '0.75rem',
                  opacity: 0.8,
                  fontWeight: '600'
                }}>
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  marginBottom: '0.75rem',
                  opacity: 0.8,
                  fontWeight: '600'
                }}>
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="$9999"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.125rem', opacity: 0.7 }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No products found</p>
            <p style={{ opacity: 0.7 }}>Try adjusting your filters</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            // Grid View - 4 columns
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.75rem'
            }}>
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          ) : (
            // List View
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {products.map(product => (
                <ProductCardList 
                  key={product.id} 
                  product={product} 
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Product Card Component with Hover Expansion
const ProductCard = ({ product, onToggleWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const imageUrl = !imageError && primaryImage?.url || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <>
      <Link 
        to={`/product/${product.id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="glass-strong product-card"
          style={{
            borderRadius: '16px',
            overflow: 'visible',
            border: isHovered 
              ? '1px solid rgba(255, 255, 255, 0.3)' 
              : '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            height: isHovered ? 'auto' : '420px',
            display: 'flex',
            flexDirection: 'column',
            transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
            backdropFilter: isHovered ? 'blur(20px)' : 'blur(10px)',
            background: isHovered 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(255, 255, 255, 0.05)',
            boxShadow: isHovered 
              ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
              : '0 4px 20px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            zIndex: isHovered ? 10 : 1
          }}
        >
          {/* Image */}
          <div style={{ 
            position: 'relative', 
            paddingTop: '100%',
            background: 'rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            borderRadius: '16px 16px 0 0'
          }}>
            <img 
              src={imageUrl}
              alt={product.title}
              onError={() => setImageError(true)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
              }}
            />
            
            {/* Gradient Overlay on hover */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)',
                transition: 'opacity 0.4s ease',
                opacity: 0.7
              }} />
            )}

            {/* Rating Badge */}
            {product.average_rating > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                padding: '0.5rem 0.875rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
              }}>
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <span style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#fff' }}>
                  {product.average_rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Stock Badge */}
            {product.stock === 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 59, 48, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '700',
                letterSpacing: '0.5px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                OUT OF STOCK
              </div>
            )}

            {/* Quick Buy Button - Bottom Right Corner */}
            {product.stock > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickBuy(true);
                }}
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'scale(1)' : 'scale(0.8)',
                  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 30px rgba(76, 175, 80, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(76, 175, 80, 0.4)';
                }}
              >
                <Zap size={16} />
                БЫСТРАЯ ПОКУПКА
              </button>
            )}
          </div>

          {/* Content */}
          <div style={{ 
            padding: '1rem', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.4s ease'
          }}>
            {/* Title */}
            <h3 style={{
              fontSize: '1.0625rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4',
              minHeight: '2.8rem'
            }}>
              {product.title}
            </h3>

            {/* Expanded Content - Shows on Hover (COMPACT) */}
            {isHovered && (
              <div style={{
                marginBottom: '0.75rem',
                opacity: isHovered ? 1 : 0,
                maxHeight: isHovered ? '120px' : '0',
                overflow: 'hidden',
                transition: 'all 0.4s ease'
              }}>
                {/* Short Description */}
                <p style={{
                  fontSize: '0.8125rem',
                  lineHeight: '1.4',
                  opacity: 0.8,
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {product.description}
                </p>

                {/* Quick Specs - COMPACT */}
                {product.specifications && product.specifications.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '0.375rem',
                    flexWrap: 'wrap'
                  }}>
                    {product.specifications.slice(0, 2).map((spec, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: '600',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        {spec.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Row with Wishlist */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              marginBottom: '0.75rem',
              fontSize: '0.8125rem',
              opacity: 0.75,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Eye size={14} />
                <span>{product.views || 0}</span>
              </div>
              {/* Wishlist with Heart Icon + Counter */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleWishlist(product.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'inherit',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Heart 
                  size={14} 
                  fill={product.wishlist_count > 0 ? '#ff3b30' : 'none'}
                  color={product.wishlist_count > 0 ? '#ff3b30' : 'currentColor'}
                />
                <span>{product.wishlist_count || 0}</span>
              </button>
              {product.total_reviews > 0 && (
                <span style={{ fontWeight: '600' }}>
                  {product.total_reviews} {product.total_reviews === 1 ? 'review' : 'reviews'}
                </span>
              )}
            </div>

            {/* Price - Always Visible */}
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <div style={{
                fontSize: isHovered ? '1.875rem' : '1.75rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #fff 0%, #a8a8a8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'font-size 0.3s ease',
                marginBottom: '0.25rem'
              }}>
                ${product.price}
              </div>
              {!isHovered && product.stock > 0 && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#4CAF50', 
                  fontWeight: '600',
                  letterSpacing: '0.3px'
                }}>
                  IN STOCK ({product.stock})
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Buy Modal */}
      {showQuickBuy && (
        <QuickBuyModal 
          product={product}
          onClose={() => setShowQuickBuy(false)}
        />
      )}
    </>
  );
};

// Product Card List Component (Horizontal Layout)
const ProductCardList = ({ product, onToggleWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const imageUrl = !imageError && primaryImage?.url || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <Link 
      to={`/product/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="glass-strong product-card"
        style={{
          borderRadius: '16px',
          border: isHovered 
            ? '1px solid rgba(255, 255, 255, 0.3)' 
            : '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          display: 'grid',
          gridTemplateColumns: '240px 1fr auto',
          gap: '2rem',
          padding: '1.5rem',
          transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
          backdropFilter: isHovered ? 'blur(20px)' : 'blur(10px)',
          background: isHovered 
            ? 'rgba(255, 255, 255, 0.12)' 
            : 'rgba(255, 255, 255, 0.05)',
          boxShadow: isHovered 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
          alignItems: 'center'
        }}
      >
        {/* Image */}
        <div style={{ 
          position: 'relative', 
          paddingTop: '100%',
          background: 'rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          borderRadius: '12px'
        }}>
          <img 
            src={imageUrl}
            alt={product.title}
            onError={() => setImageError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />

          {/* Rating Badge */}
          {product.average_rating > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              padding: '0.375rem 0.625rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Star size={14} fill="#FFD700" color="#FFD700" />
              <span style={{ fontSize: '0.8125rem', fontWeight: '700' }}>
                {product.average_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 59, 48, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.5px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              OUT OF STOCK
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Title */}
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            lineHeight: '1.3',
            marginBottom: '0.5rem'
          }}>
            {product.title}
          </h3>

          {/* Description */}
          <p style={{
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            opacity: 0.8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.description}
          </p>

          {/* Stats Row */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem',
            fontSize: '0.875rem',
            opacity: 0.75,
            marginTop: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Eye size={16} />
              <span>{product.views || 0} views</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Heart size={16} />
              <span>{product.wishlist_count || 0} wishlist</span>
            </div>
            {product.total_reviews > 0 && (
              <span style={{ fontWeight: '600' }}>
                {product.total_reviews} {product.total_reviews === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>

          {/* Quick Specs */}
          {product.specifications && product.specifications.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginTop: '0.5rem'
            }}>
              {product.specifications.slice(0, 4).map((spec, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {spec.name}: {spec.value}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '1rem',
          minWidth: '200px'
        }}>
          {/* Price */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '2.25rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #fff 0%, #a8a8a8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              ${product.price}
            </div>
            {product.stock > 0 && (
              <div style={{ 
                fontSize: '0.8125rem', 
                color: '#4CAF50', 
                fontWeight: '600'
              }}>
                IN STOCK ({product.stock})
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('Add to cart:', product.id);
              }}
              disabled={product.stock === 0}
              className="glass-strong"
              style={{
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: product.stock > 0
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                opacity: product.stock > 0 ? 1 : 0.5,
                transition: 'all 0.3s ease'
              }}
            >
              <ShoppingCart size={16} />
              ADD TO CART
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(product.id);
              }}
              className="glass-subtle"
              style={{
                padding: '0.875rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Heart size={20} color="#fff" fill={product.wishlist_count > 0 ? '#ff3b30' : 'transparent'} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketplacePage;
