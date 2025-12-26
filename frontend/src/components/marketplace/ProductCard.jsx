import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import OptimizedImage from '../OptimizedImage';
import QuickViewModal from '../QuickViewModal';
import './ProductCard.css';

const ProductCard = ({ product, onToggleWishlist, onFastBuy, index = 0 }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const cardRef = useRef(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shouldShowExpanded, setShouldShowExpanded] = useState(true);
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageError, setImageError] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: 'https://via.placeholder.com/400x400?text=No+Image', alt: product.title }];

  // Check if there's space on the right for expanded panel
  useEffect(() => {
    if (!isHovered) return;
    
    const checkSpace = () => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - rect.right;
      
      setShouldShowExpanded(spaceOnRight >= 280);
    };
    
    checkSpace();
    window.addEventListener('resize', checkSpace);
    return () => window.removeEventListener('resize', checkSpace);
  }, [isHovered]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  const handleDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(idx);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleFastBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFastBuy) {
      onFastBuy(product);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <>
      <div className="product-card-container">
        <div 
          className={`product-card ${isHovered ? 'expanded' : ''} ${theme === 'minimal-mod' ? 'theme-minimal' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={cardRef}
          onClick={handleCardClick}
        >
          {/* Main Part */}
          <div className="product-card-main">
            {/* Image Area */}
            <div className="product-image-wrapper">
              <OptimizedImage
                src={(!imageError && images[currentImageIndex]?.url) || 'https://via.placeholder.com/400x400?text=No+Image'}
                alt={images[currentImageIndex]?.alt || product.title}
                priority={index < 4}
                className="product-image"
                onError={() => setImageError(true)}
              />
              
              {/* Carousel Controls (only on hover) */}
              {isHovered && images.length > 1 && (
                <>
                  <button className="carousel-arrow carousel-prev" onClick={handlePrevImage}>‹</button>
                  <button className="carousel-arrow carousel-next" onClick={handleNextImage}>›</button>
                </>
              )}
              
              {/* Carousel Dots */}
              {images.length > 1 && (
                <div className="carousel-dots">
                  {images.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`}
                      onClick={(e) => handleDotClick(e, idx)}
                    />
                  ))}
                </div>
              )}
              
              {/* Stock Badge */}
              {product.stock > 0 && product.stock < 5 && (
                <div className="badge-stock-low">Only {product.stock} left</div>
              )}
              
              {/* Out of Stock Badge */}
              {product.stock === 0 && (
                <div className="badge-out-of-stock">OUT OF STOCK</div>
              )}
              
              {/* Discount Badge */}
              {product.discount && (
                <div className="badge-discount">-{product.discount}%</div>
              )}
            </div>
          </div>
          
          {/* Expanded Part - Stats Panel (expands card like credit card) */}
          {isHovered && shouldShowExpanded && (
            <div className="product-card-expanded">
              <div className="stats-header">Quick Stats</div>
              
              <div className="stats-list">
                {product.specifications && product.specifications.slice(0, 3).map((spec, idx) => (
                  <div className="stat-item" key={idx}>
                    <span className="stat-label">{spec.name}:</span>
                    <span className="stat-value">{spec.value}</span>
                  </div>
                ))}
                <div className="stat-item">
                  <span className="stat-label">Stock:</span>
                  <span className="stat-value">{product.stock > 0 ? product.stock : 'Out'}</span>
                </div>
                {product.average_rating > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Rating:</span>
                    <span className="stat-value">⭐ {product.average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <div className="stats-social">
                <div className="stat-badge">👁 {product.views || 0}</div>
                <div className="stat-badge">💬 {product.total_reviews || 0}</div>
                <div className="stat-badge">❤️ {product.wishlist_count || 0}</div>
              </div>
              
              <div className="stats-actions">
                <button 
                  className="action-btn wishlist-btn"
                  onClick={handleWishlistToggle}
                >
                  <Heart size={14} fill={product.is_wishlisted ? '#ff3b30' : 'none'} />
                  Wishlist
                </button>
                
                <button 
                  className="action-btn quickview-btn"
                  onClick={handleQuickView}
                >
                  <Eye size={14} />
                  Quick View
                </button>
                
                <button 
                  className="action-btn fastbuy-btn"
                  onClick={handleFastBuy}
                  disabled={product.stock === 0}
                >
                  FAST BUY
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Info OUTSIDE the card (always visible) */}
        <div className="product-info-external">
          <h3 className="product-title">{product.title}</h3>
          <div className="product-price">${product.price}</div>
        </div>
      </div>
      
      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal
          product={{
            ...product,
            name: product.title,
            image: product.images?.[0]?.url
          }}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
