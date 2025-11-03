import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, Eye, Star, X, ShoppingCart, Grid, List, Zap, CreditCard, MapPin, User as UserIcon, Menu, Share2 } from 'lucide-react';
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
  const [showCatalog, setShowCatalog] = useState(false); // Catalog dropdown
  const [showFilterPanel, setShowFilterPanel] = useState(false); // Sliding filter panel
  const [expandedSections, setExpandedSections] = useState({}); // Collapsible sections
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
    <div className="dark-bg" style={{ 
      minHeight: '100vh', 
      paddingTop: '6rem', 
      paddingBottom: '4rem',
      marginLeft: showFilterPanel ? '360px' : '0', // Pushes content when panel opens
      transition: 'margin-left 0.3s ease'
    }}>
      <div className="grain-overlay" />
      
      <div style={{ 
        maxWidth: showFilterPanel ? '1200px' : '1400px', // Narrows when panel is open
        margin: '0 auto', 
        padding: '0 2rem',
        transition: 'max-width 0.3s ease'
      }}>
        {/* Header - MINIMAL MARKET */}
        <div style={{ 
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
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
          <p style={{ fontSize: '1.125rem', opacity: 0.7 }}>
            Discover premium gaming gear from verified sellers
          </p>
        </div>

        {/* Catalog Button + Centered Search Bar with Filter Inside */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '3rem',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Catalog Button */}
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="glass-subtle"
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '50px',
              border: showCatalog 
                ? '2px solid rgba(139, 92, 246, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              background: showCatalog
                ? 'rgba(139, 92, 246, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#fff'
            }}
            onMouseEnter={(e) => {
              if (!showCatalog) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showCatalog) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <Menu size={20} />
            CATALOG
          </button>

          {/* Centered Search Bar */}
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
                padding: '1rem 3.5rem 1rem 3.5rem',
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
        </div>

        {/* Catalog Dropdown */}
        {showCatalog && (
          <div 
            className="glass-strong"
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              marginBottom: '2rem',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(20px)',
              animation: 'slideDown 0.3s ease-out',
              maxWidth: '800px',
              margin: '0 auto 2rem'
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowCatalog(false);
                }}
                className="glass-subtle"
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: selectedCategory === 'all'
                    ? '2px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedCategory === 'all'
                    ? 'rgba(139, 92, 246, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#fff',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== 'all') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== 'all') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                🌐 All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowCatalog(false);
                  }}
                  className="glass-subtle"
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: selectedCategory === category.id
                      ? '2px solid rgba(139, 92, 246, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedCategory === category.id
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#fff',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  {category.icon || '📦'} {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured Chips + View Controls Row (above product cards) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Featured Chips - Left Side (Minimalist Acrylic Style) */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            {featuredChips.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleFeaturedChipClick(chip.tag)}
                className="glass-subtle"
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '12px',
                  border: selectedTag === chip.tag 
                    ? '1px solid rgba(139, 92, 246, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedTag === chip.tag
                    ? 'rgba(139, 92, 246, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#fff',
                  textTransform: 'uppercase',
                  boxShadow: selectedTag === chip.tag 
                    ? '0 4px 16px rgba(139, 92, 246, 0.3)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  animation: selectedTag === chip.tag ? 'pulseSoft 2s ease-in-out infinite' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedTag !== chip.tag) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTag !== chip.tag) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {chip.label}
              </button>
            ))}
            
            {/* Clear Filters Chip */}
            {selectedTag !== 'all' && (
              <button
                onClick={() => setSelectedTag('all')}
                className="glass-subtle"
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 59, 48, 0.3)',
                  background: 'rgba(255, 59, 48, 0.1)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ff3b30'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 59, 48, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          {/* View Controls - Right Side */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            {/* Items Per Page Selector */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: '0.8125rem',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '90px'
              }}
            >
              <option value={20} style={{ background: '#1a1a1a' }}>20</option>
              <option value={40} style={{ background: '#1a1a1a' }}>40</option>
              <option value={60} style={{ background: '#1a1a1a' }}>60</option>
              <option value={100} style={{ background: '#1a1a1a' }}>100</option>
            </select>

            {/* View Mode Toggles */}
            <div style={{
              display: 'flex',
              gap: '0.375rem',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.375rem',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '50px',
                  border: 'none',
                  background: viewMode === 'grid' 
                    ? 'rgba(139, 92, 246, 0.3)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: '#fff'
                }}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '50px',
                  border: 'none',
                  background: viewMode === 'list' 
                    ? 'rgba(139, 92, 246, 0.3)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: '#fff'
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
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
            // Grid View - 4 columns with Pinterest-style compact spacing
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem' // Pinterest-style: 16px between cards
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

      {/* Floating Filter Button - Unified with Header Style */}
      <button
        onClick={() => setShowFilterPanel(!showFilterPanel)}
        style={{
          position: 'fixed',
          left: showFilterPanel ? '380px' : '1rem',
          top: '40%',
          transform: 'translateY(-50%)',
          width: '32px',
          height: '100px',
          borderRadius: '6px',
          border: '1px solid transparent',
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 0',
          color: '#fff'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = '1px solid transparent';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <SlidersHorizontal size={16} />
        <div style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: '0.625rem',
          fontWeight: '500',
          letterSpacing: '0.5px'
        }}>
          FILTERS
        </div>
      </button>

      {/* Sliding Filter Panel - NO BACKDROP, pushes content */}
      {showFilterPanel && (
          <div
            className="glass-strong"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '380px',
              background: 'rgba(20, 20, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(139, 92, 246, 0.3)',
              zIndex: 201,
              padding: '2rem',
              overflowY: 'auto',
              animation: 'slideInFromLeft 0.3s ease-out',
              boxShadow: '4px 0 40px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                FILTERS
              </h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.border = '1px solid transparent';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Inside Filters */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  opacity: 0.4,
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="text"
                placeholder="Search filters..."
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.75rem',
                  borderRadius: '6px',
                  border: '1px solid transparent',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid transparent';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '1rem',
                opacity: 0.7,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                Categories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: selectedCategory === 'all'
                      ? '1px solid rgba(255, 255, 255, 0.3)'
                      : '1px solid transparent',
                    background: selectedCategory === 'all'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#fff'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== 'all') {
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== 'all') {
                      e.currentTarget.style.border = '1px solid transparent';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: selectedCategory === category.id
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid transparent',
                      background: selectedCategory === category.id
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#fff'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category.id) {
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category.id) {
                        e.currentTarget.style.border = '1px solid transparent';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '1rem',
                opacity: 0.7,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                Price Range
              </h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid transparent',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid transparent';
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid transparent',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid transparent';
                  }}
                />
              </div>
            </div>

            {/* Sort By */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '1rem',
                opacity: 0.7,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                Sort By
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid transparent',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid transparent';
                }}
              >
                <option value="created_at" style={{ background: '#1a1a1a' }}>Newest First</option>
                <option value="price_asc" style={{ background: '#1a1a1a' }}>Price: Low to High</option>
                <option value="price_desc" style={{ background: '#1a1a1a' }}>Price: High to Low</option>
                <option value="rating" style={{ background: '#1a1a1a' }}>Highest Rated</option>
                <option value="popular" style={{ background: '#1a1a1a' }}>Most Popular</option>
              </select>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '1.5rem 0' }} />

            {/* Additional Tech Filters */}
            {/* Brands - Collapsible */}
            <CollapsibleFilter title="Brands" id="brands">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Razer', 'Logitech'].map(brand => (
                  <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </CollapsibleFilter>

            {/* Color - Collapsible */}
            <CollapsibleFilter title="Color" id="color">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  { name: 'Black', color: '#000' },
                  { name: 'White', color: '#fff' },
                  { name: 'Red', color: '#f00' },
                  { name: 'Blue', color: '#00f' },
                  { name: 'RGB', gradient: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)' }
                ].map(item => (
                  <button
                    key={item.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: item.gradient || item.color,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title={item.name}
                  />
                ))}
              </div>
            </CollapsibleFilter>

            {/* Connection Type */}
            <CollapsibleFilter title="Connection" id="connection">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Wireless', 'Wired', 'Bluetooth', 'USB', 'USB-C'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </CollapsibleFilter>

            {/* Features */}
            <CollapsibleFilter title="Features" id="features">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['RGB Lighting', 'Programmable Keys', 'Mechanical', 'Hot-Swappable', 'Noise Cancelling', 'Water Resistant'].map(feature => (
                  <label key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </CollapsibleFilter>

            {/* Apply Button */}
            <button
              onClick={() => {
                fetchProducts();
                setShowFilterPanel(false);
              }}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid transparent',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                marginTop: '1.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              APPLY FILTERS
            </button>
          </div>
      )}
    </div>
  );
};

// Collapsible Filter Component - Unified with Header Style
const CollapsibleFilter = ({ title, id, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0',
          background: 'none',
          border: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          opacity: 0.7,
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
      >
        {title}
        <span style={{ 
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', 
          transition: 'transform 0.3s ease',
          fontSize: '1.25rem'
        }}>
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div style={{ 
          paddingTop: '1rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

// Pinterest-Style Product Card Component with Carousel
const ProductCard = ({ product, onToggleWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPriceTag, setShowPriceTag] = useState(true);
  
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: 'https://via.placeholder.com/300x400?text=No+Image', alt: product.title }];

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <Link 
          to={`/product/${product.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="glass-subtle product-card"
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: isHovered 
                ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
                : '0 4px 16px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
          >
            {/* Image Container with Carousel */}
            <div style={{ 
              position: 'relative', 
              paddingTop: '133%',
              background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 20, 0.9) 100%)',
              overflow: 'hidden'
            }}>
              {/* Carousel Image */}
              <img 
                src={!imageError && images[currentImageIndex]?.url || 'https://via.placeholder.com/300x400?text=No+Image'}
                alt={images[currentImageIndex]?.alt || product.title}
                onError={() => setImageError(true)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                }}
              />

              {/* Rating Badge - Top Left Corner (наезжает на карточку) */}
              {product.average_rating > 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    color: '#fff',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {product.average_rating.toFixed(1)}
                </div>
              )}

              {/* Action Icons Row - Top of Card (appears on hover) - только сердечко */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                right: '1rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'all 0.3s ease',
                pointerEvents: isHovered ? 'auto' : 'none'
              }}>
                {/* Wishlist - Красный акрил при наведении */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleWishlist(product.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.375rem 0.625rem',
                    borderRadius: '6px',
                    background: product.is_wishlisted 
                      ? 'rgba(255, 59, 48, 0.4)' 
                      : 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: product.is_wishlisted 
                      ? '1px solid rgba(255, 59, 48, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#fff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 59, 48, 0.6)';
                    e.currentTarget.style.border = '1px solid rgba(255, 59, 48, 0.5)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = product.is_wishlisted 
                      ? 'rgba(255, 59, 48, 0.4)' 
                      : 'rgba(0, 0, 0, 0.4)';
                    e.currentTarget.style.border = product.is_wishlisted 
                      ? '1px solid rgba(255, 59, 48, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Heart 
                    size={12} 
                    fill={product.is_wishlisted ? '#ff3b30' : 'none'} 
                    color={product.is_wishlisted ? '#ff3b30' : '#fff'} 
                  />
                  <span>{product.wishlist_count || 0}</span>
                </button>
              </div>

              {/* Carousel Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      color: '#fff'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      color: '#fff'
                    }}
                  >
                    ›
                  </button>

                  {/* Carousel Dots */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '0.375rem'
                  }}>
                    {images.map((_, index) => (
                      <div
                        key={index}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: index === currentImageIndex 
                            ? 'rgba(255, 255, 255, 0.9)' 
                            : 'rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Price Tag - Apple-style rounded (White Matted Acrylic) */}
              {showPriceTag && (
                <div 
                  className="price-tag"
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '12px',
                    fontSize: '0.8125rem',
                    fontWeight: '800',
                    color: '#000',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    opacity: isHovered ? 0 : 1,
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '32px',
                    minWidth: '70px',
                    justifyContent: 'center'
                  }}
                >
                  ${product.price}
                </div>
              )}

              {/* Quick Buy Button - Apple-style rounded (Purple Acrylic) */}
              {product.stock > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQuickBuy(true);
                  }}
                  onMouseEnter={() => setShowPriceTag(false)}
                  onMouseLeave={() => setShowPriceTag(true)}
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(107, 70, 193, 0.95) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: 'none',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.8125rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4), 0 1px 3px rgba(139, 92, 246, 0.2)',
                    letterSpacing: '0.5px',
                    pointerEvents: isHovered ? 'auto' : 'none',
                    height: '32px',
                    minWidth: '100px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(139, 92, 246, 0.6), 0 2px 6px rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.4), 0 1px 3px rgba(139, 92, 246, 0.2)';
                  }}
                >
                  <Zap size={14} />
                  BUY NOW
                </button>
              )}

              {/* Out of Stock Badge */}
              {product.stock === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(255, 59, 48, 0.95)',
                  backdropFilter: 'blur(10px)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 16px rgba(255, 59, 48, 0.4)'
                }}>
                  OUT OF STOCK
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Product Title - Below Card (Acrylic, muted → bright on hover) */}
        <div style={{ 
          marginTop: '0.625rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '700',
            lineHeight: '1.3',
            color: '#fff',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: isHovered ? 1 : 0.6,
            transition: 'opacity 0.3s ease'
          }}>
            {product.title}
          </h3>
        </div>
      </div>

      {/* Quick Buy Modal */}
      {showQuickBuy && <QuickBuyModal product={product} onClose={() => setShowQuickBuy(false)} />}
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

// Quick Buy Modal Component - Redesigned with wide layout
const QuickBuyModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'tinkoff_card' // 'tinkoff_card', 'tinkoff_sbp', 'crypto_usdt', etc.
  });
  const [loading, setLoading] = useState(false);
  const [isPreorder, setIsPreorder] = useState(product.stock === 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement actual order creation via API
    try {
      // Call /api/orders endpoint to create order
      console.log('Creating order:', {
        product_id: product.id,
        customer_full_name: formData.fullName,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        payment_method: formData.paymentMethod,
        preorder: isPreorder
      });
      
      setTimeout(() => {
        alert(isPreorder 
          ? `Предзаказ оформлен! Ожидаемая доставка: ${product.preorder_delivery_days || 14} дней. Мы свяжемся с вами для подтверждения.`
          : 'Заказ оформлен! Мы свяжемся с вами для подтверждения.');
        setLoading(false);
        onClose();
      }, 1500);
    } catch (error) {
      alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <div 
        className="glass-strong"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1100px',
          width: '100%',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '2rem',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '300px 1fr 280px',
          gap: '2rem'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={22} />
        </button>

        {/* LEFT SECTION: Product Image & Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Product Image */}
          <div style={{
            width: '100%',
            height: '280px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {product.images && product.images[0] && (
              <img 
                src={product.images[0].url} 
                alt={product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            )}
          </div>

          {/* Product Details */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              lineHeight: '1.4'
            }}>
              {product.title}
            </h3>
            
            {/* Price */}
            <div style={{
              fontSize: '2rem',
              fontWeight: '900',
              marginBottom: '0.75rem',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ${product.price}
            </div>

            {/* Stock Status */}
            {isPreorder ? (
              <div style={{
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                background: 'rgba(251, 146, 60, 0.15)',
                border: '1px solid rgba(251, 146, 60, 0.3)',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: '#fb923c'
              }}>
                ⚠ Под заказ (доставка {product.preorder_delivery_days || 14} дней)
              </div>
            ) : (
              <div style={{
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: '#a78bfa'
              }}>
                ✓ В наличии ({product.stock} шт)
              </div>
            )}
          </div>
        </div>

        {/* CENTER SECTION: Form */}
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '900', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              ⚡ Быстрая Покупка
            </h2>
            <p style={{ opacity: 0.65, fontSize: '0.9375rem' }}>
              Оформите заказ без регистрации
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Full Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem', 
                fontSize: '0.875rem', 
                fontWeight: '600',
                opacity: 0.85
              }}>
                <UserIcon size={16} />
                ФИО
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Иванов Иван Иванович"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem', 
                fontSize: '0.875rem', 
                fontWeight: '600',
                opacity: 0.85
              }}>
                <CreditCard size={16} />
                Телефон
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: '1.5rem', flex: 1 }}>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem', 
                fontSize: '0.875rem', 
                fontWeight: '600',
                opacity: 0.85
              }}>
                <MapPin size={16} />
                Адрес доставки
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Город, улица, дом, квартира..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 24px rgba(139, 92, 246, 0.4)',
                opacity: loading ? 0.7 : 1,
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 32px rgba(139, 92, 246, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(139, 92, 246, 0.4)';
              }}
            >
              <Zap size={20} />
              {loading ? 'Оформление...' : 'Оформить заказ'}
            </button>

            {/* Info Text */}
            <div style={{
              marginTop: '0.875rem',
              fontSize: '0.75rem',
              opacity: 0.55,
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              После оформления с вами свяжется менеджер для подтверждения заказа
            </div>
          </form>
        </div>

        {/* RIGHT SECTION: Payment Methods */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            opacity: 0.9
          }}>
            Способ оплаты
          </h3>

          {/* Tinkoff Card */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'tinkoff_card' })}
            className="glass-subtle"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: formData.paymentMethod === 'tinkoff_card' 
                ? '2px solid rgba(139, 92, 246, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              background: formData.paymentMethod === 'tinkoff_card'
                ? 'rgba(139, 92, 246, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (formData.paymentMethod !== 'tinkoff_card') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.paymentMethod !== 'tinkoff_card') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <CreditCard size={18} color="#8B5CF6" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Банковская карта</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.875rem' }}>
              Visa, Mastercard, МИР
            </p>
          </button>

          {/* Tinkoff SBP */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'tinkoff_sbp' })}
            className="glass-subtle"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: formData.paymentMethod === 'tinkoff_sbp' 
                ? '2px solid rgba(139, 92, 246, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              background: formData.paymentMethod === 'tinkoff_sbp'
                ? 'rgba(139, 92, 246, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (formData.paymentMethod !== 'tinkoff_sbp') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.paymentMethod !== 'tinkoff_sbp') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <Zap size={18} color="#8B5CF6" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>СБП (SBP)</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.875rem' }}>
              Система быстрых платежей
            </p>
          </button>

          {/* QR Code */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'qr_code' })}
            className="glass-subtle"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: formData.paymentMethod === 'qr_code' 
                ? '2px solid rgba(139, 92, 246, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              background: formData.paymentMethod === 'qr_code'
                ? 'rgba(139, 92, 246, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (formData.paymentMethod !== 'qr_code') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.paymentMethod !== 'qr_code') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <CreditCard size={18} color="#8B5CF6" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>QR-код</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.875rem' }}>
              Сканирование кода
            </p>
          </button>

          {/* Crypto */}
          <div style={{
            marginTop: '0.5rem',
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.5rem', opacity: 0.9 }}>
              💎 Криптовалюта
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.65, lineHeight: '1.4' }}>
              USDT, USDC, DAI на Ethereum, BSC, Polygon, Tron, Solana
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
