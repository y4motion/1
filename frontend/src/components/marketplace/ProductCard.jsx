import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import OptimizedImage from '../OptimizedImage';
import QuickViewModal from '../QuickViewModal';
import './ProductCard.css';

const ProductCard = ({ product, onWishlistToggle, onQuickView, onFastBuy }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [canExpand, setCanExpand] = useState(true);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const cardRef = useRef(null);

  // Check if there's space on the right for expanded panel
  useEffect(() => {
    if (!isHovered) return;

    const checkSpace = () => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const gridContainer = cardRef.current.closest('.products-grid');
      if (!gridContainer) return;

      const gridRect = gridContainer.getBoundingClientRect();
      const spaceOnRight = gridRect.right - rect.right;
      
      // If space >= 280px, can expand
      setCanExpand(spaceOnRight >= 280);
    };

    checkSpace();
    window.addEventListener('resize', checkSpace);
    return () => window.removeEventListener('resize', checkSpace);
  }, [isHovered]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    const imagesLength = product.images?.length || 0;
    setCurrentImageIndex(prev => prev === 0 ? imagesLength - 1 : prev - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    const imagesLength = product.images?.length || 0;
    setCurrentImageIndex(prev => prev === imagesLength - 1 ? 0 : prev + 1);
  };

  const handleDotClick = (e, index) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setShowQuickViewModal(true);
    }
  };

  // Image URL handling
  const images = product.images && product.images.length > 0 ? product.images : [];
  const imageUrl = images.length > 0 
    ? (images[currentImageIndex]?.url || images[currentImageIndex]) 
    : 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <>
      {/* Container for card + external info */}
      <div className="product-card-wrapper">
        {/* UNIFIED card with main + expanded parts */}
        <div 
          className={`product-card ${isHovered && canExpand ? 'is-expanded' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCardClick}
          ref={cardRef}
        >
          {/* MAIN PART - Square with photo */}
          <div className="card-main">
            {/* Image FULL SIZE */}
            <div className="card-image-container">
              <OptimizedImage 
                src={imageUrl} 
                alt={product.title}
                className="card-image"
              />
              
              {/* Carousel Controls (only on hover) */}
              {isHovered && images.length > 1 && (
                <>
                  <button 
                    className="carousel-btn carousel-prev"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button 
                    className="carousel-btn carousel-next"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
              
              {/* Carousel Dots */}
              {images.length > 1 && (
                <div className="carousel-dots">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={(e) => handleDotClick(e, index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Badges */}
            {product.stock > 0 && product.stock < 5 && (
              <div className="badge badge-stock">ONLY {product.stock} LEFT</div>
            )}
            
            {product.stock === 0 && (
              <div className="badge badge-out">OUT OF STOCK</div>
            )}
            
            {product.discount && (
              <div className="badge badge-discount">-{product.discount}%</div>
            )}
          </div>
          
          {/* EXPANDED PART - Slides out RIGHT from main */}
          {isHovered && canExpand && (
            <div className="card-expanded">
              <div className="expanded-header">QUICK STATS</div>
              
              <div className="expanded-stats">
                {product.specifications && product.specifications.slice(0, 4).map((spec, idx) => (
                  <div className="stat-row" key={idx}>
                    <span className="stat-label">{spec.name}:</span>
                    <span className="stat-value">{spec.value}</span>
                  </div>
                ))}
                <div className="stat-row">
                  <span className="stat-label">Stock:</span>
                  <span className="stat-value">{product.stock > 0 ? product.stock : 'Out'}</span>
                </div>
                {product.average_rating > 0 && (
                  <div className="stat-row">
                    <span className="stat-label">Rating:</span>
                    <span className="stat-value">⭐ {product.average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <div className="expanded-social">
                <div className="social-badge">👁 {product.views || 0}</div>
                <div className="social-badge">💬 {product.total_reviews || 0}</div>
                <div className="social-badge">❤️ {product.wishlist_count || 0}</div>
              </div>
              
              <div className="expanded-actions">
                <button 
                  className="action-btn btn-wishlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWishlistToggle && onWishlistToggle(product.id);
                  }}
                >
                  <Heart size={14} fill={product.is_wishlisted ? '#ff3b30' : 'none'} />
                  <span>Wishlist</span>
                </button>
                
                <button 
                  className="action-btn btn-quickview"
                  onClick={handleQuickViewClick}
                >
                  <Eye size={14} />
                  <span>Quick View</span>
                </button>
                
                <button 
                  className="action-btn btn-fastbuy"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFastBuy && onFastBuy(product);
                  }}
                  disabled={product.stock === 0}
                >
                  FAST BUY
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* INFO outside the card */}
        <div className="card-info-external">
          <h3 className="card-title">{product.title}</h3>
          <div className="card-price">${product.price}</div>
        </div>
      </div>
      
      {/* Quick View Modal */}
      {showQuickViewModal && (
        <QuickViewModal
          product={{
            ...product,
            name: product.title,
            image: imageUrl
          }}
          onClose={() => setShowQuickViewModal(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
