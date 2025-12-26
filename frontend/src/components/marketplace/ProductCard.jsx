import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Star } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import OptimizedImage from '../OptimizedImage';
import QuickViewModal from '../QuickViewModal';
import './ProductCard.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ProductCard = ({ product, onToggleWishlist, onFastBuy, index = 0 }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { token } = useAuth();
  const cardRef = useRef(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [statsPosition, setStatsPosition] = useState('right');
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageError, setImageError] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: 'https://via.placeholder.com/400x400?text=No+Image', alt: product.title }];

  // Calculate stats panel position
  useEffect(() => {
    if (!isHovered) return;
    
    const calculatePosition = () => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - rect.right;
      
      setStatsPosition(spaceOnRight >= 280 ? 'right' : 'overlay');
    };
    
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [isHovered]);

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

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleWishlistClick = (e) => {
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
      // Magnetic animation
      const card = cardRef.current;
      if (card) {
        const rect = card.getBoundingClientRect();
        const clone = card.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        clone.style.borderRadius = '16px';
        document.body.appendChild(clone);
        
        card.style.opacity = '0.3';
        
        requestAnimationFrame(() => {
          const centerX = (window.innerWidth - 500) / 2;
          const centerY = (window.innerHeight - 600) / 2;
          clone.style.left = centerX + 'px';
          clone.style.top = centerY + 'px';
          clone.style.width = '500px';
          clone.style.height = '600px';
          clone.style.transform = 'scale(1.02)';
          clone.style.boxShadow = '0 40px 100px rgba(0, 0, 0, 0.5)';
        });
        
        setTimeout(() => {
          onFastBuy(product);
          document.body.removeChild(clone);
          card.style.opacity = '1';
        }, 500);
      } else {
        onFastBuy(product);
      }
    }
  };

  const handleNavigate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`product-card ${theme === 'minimal-mod' ? 'theme-minimal' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Image Wrapper */}
        <div className="product-image-wrapper">
          <OptimizedImage
            src={(!imageError && images[currentImageIndex]?.url) || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={images[currentImageIndex]?.alt || product.title}
            priority={index < 4}
            className="product-image"
            onError={() => setImageError(true)}
          />
          
          {/* Carousel Controls */}
          {isHovered && images.length > 1 && (
            <>
              <button className="carousel-arrow carousel-prev" onClick={handlePrevImage}>
                ‹
              </button>
              <button className="carousel-arrow carousel-next" onClick={handleNextImage}>
                ›
              </button>
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
          
          {/* Badges */}
          {product.stock > 0 && product.stock < 5 && (
            <div className="badge-stock-low">Only {product.stock} left</div>
          )}
          {product.stock === 0 && (
            <div className="badge-out-of-stock">OUT OF STOCK</div>
          )}
          {product.discount && (
            <div className="badge-discount">-{product.discount}%</div>
          )}
          
          {/* Quick Actions (top-right) */}
          <div className={`quick-actions ${isHovered ? 'visible' : ''}`}>
            <button className="action-btn" onClick={handleWishlistClick}>
              <Heart 
                size={16} 
                fill={product.is_wishlisted ? '#ff3b30' : 'none'}
                color={product.is_wishlisted ? '#ff3b30' : '#fff'}
              />
            </button>
            <button className="action-btn" onClick={handleQuickView}>
              <Eye size={16} />
            </button>
          </div>
        </div>
        
        {/* Info Overlay (shows on hover) */}
        <div className={`product-info-overlay ${isHovered ? 'visible' : ''}`}>
          <h3 className="product-title">{product.title}</h3>
          <div className="product-meta">
            <span className="product-price">${product.price}</span>
            {product.average_rating > 0 && (
              <span className="product-rating">
                <Star size={12} fill="#FFD700" color="#FFD700" />
                {product.average_rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        
        {/* Stats Panel */}
        {isHovered && (
          <div className={`product-stats-panel position-${statsPosition}`}>
            <div className="stats-header">⚡ Quick Stats</div>
            
            <div className="stats-list">
              {product.specifications && product.specifications.slice(0, 3).map((spec, idx) => (
                <div className="stat-item" key={idx}>
                  • {spec.name}: {spec.value}
                </div>
              ))}
              <div className="stat-item">• Stock: {product.stock > 0 ? product.stock : 'Out'}</div>
            </div>
            
            <div className="stats-social">
              <span>👁 {product.views || 0}</span>
              <span>💬 {product.total_reviews || 0}</span>
              <span>❤️ {product.wishlist_count || 0}</span>
            </div>
            
            <div className="stats-actions">
              <button 
                className="btn-fast-buy"
                onClick={handleFastBuy}
                disabled={product.stock === 0}
              >
                FAST BUY
              </button>
              <button 
                className="btn-details"
                onClick={handleNavigate}
              >
                DETAILS
              </button>
            </div>
          </div>
        )}
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
