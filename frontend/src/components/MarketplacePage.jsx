import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, Eye, Star, X } from 'lucide-react';
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

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, selectedTag, sortBy, searchTerm, minPrice, maxPrice]);

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
      let url = `${API_URL}/api/products/?limit=50&sort_by=${sortBy}&sort_order=desc`;  // Added trailing slash
      
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

        {/* Products Grid */}
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onToggleWishlist }) => {
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
          overflow: 'hidden',
          border: isHovered 
            ? '1px solid rgba(255, 255, 255, 0.2)' 
            : '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Image */}
        <div style={{ 
          position: 'relative', 
          paddingTop: '100%',
          background: 'rgba(255, 255, 255, 0.03)',
          overflow: 'hidden'
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
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product.id);
            }}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: isHovered ? 1 : 0
            }}
          >
            <Heart size={20} color="#fff" />
          </button>

          {/* Rating Badge */}
          {product.average_rating > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Star size={14} fill="#FFD700" color="#FFD700" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {product.average_rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.title}
          </h3>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            opacity: 0.7
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Eye size={14} />
              <span>{product.views || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Heart size={14} />
              <span>{product.wishlist_count || 0}</span>
            </div>
            {product.total_reviews > 0 && (
              <span>{product.total_reviews} reviews</span>
            )}
          </div>

          {/* Price */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #fff 0%, #a8a8a8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ${product.price}
            </div>
            {product.stock > 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#4CAF50', marginTop: '0.25rem' }}>
                IN STOCK ({product.stock} available)
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#ff3b30', marginTop: '0.25rem' }}>
                OUT OF STOCK
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketplacePage;
