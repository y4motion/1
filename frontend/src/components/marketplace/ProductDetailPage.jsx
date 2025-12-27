import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, Share2, GitCompare, ShoppingCart, Zap, 
  Truck, Shield, RotateCcw, Star, Eye, MessageCircle,
  ThumbsUp, ChevronLeft, ChevronRight, Home, ChevronRight as Chevron
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import LiveChatWidget from './LiveChatWidget';
import ProductReactions from './ProductReactions';
import OverviewTab from './tabs/OverviewTab';
import SpecsTab from './tabs/SpecsTab';
import ReviewsTab from './tabs/ReviewsTab';
import CommunityTab from './tabs/CommunityTab';
import QATab from './tabs/QATab';
import { ProductCard } from './index';
import './ProductDetailPage.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addItem } = useCart();
  
  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [adding, setAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        const data = await response.json();
        setProduct(data);
        
        // Set default variant
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        
        // Load reviews
        try {
          const reviewsRes = await fetch(`${API_URL}/api/reviews/product/${id}/`);
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData);
          }
        } catch (e) {
          console.log('Reviews not available');
        }
        
        // Load questions
        try {
          const questionsRes = await fetch(`${API_URL}/api/questions/product/${id}/`);
          if (questionsRes.ok) {
            const questionsData = await questionsRes.json();
            setQuestions(questionsData);
          }
        } catch (e) {
          console.log('Questions not available');
        }

        // Load related products
        try {
          const relatedRes = await fetch(`${API_URL}/api/products/?limit=4&category_id=${data.category_id}`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedProducts(relatedData.filter(p => p.id !== id).slice(0, 4));
          }
        } catch (e) {
          console.log('Related products not available');
        }
        
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Handlers
  const handlePrevImage = () => {
    const images = product?.images || [];
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    const images = product?.images || [];
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = async () => {
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }
    
    setAdding(true);
    try {
      await addItem(product.id, quantity, selectedVariant?.id);
      // Show success notification
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        product,
        quantity,
        variant: selectedVariant
      }
    });
  };

  const handleWishlistToggle = async () => {
    if (!token) {
      alert('Please login to add to wishlist');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/products/${id}/wishlist/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="pdp-loading">
        <div className="pdp-loading-spinner"></div>
        <span>Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-error">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/marketplace')} className="pdp-back-btn">
          Back to Marketplace
        </button>
      </div>
    );
  }

  // Get images array
  const images = product.images || [];
  const imageUrls = images.map(img => typeof img === 'string' ? img : img.url);
  const currentImage = imageUrls[currentImageIndex] || 'https://via.placeholder.com/600';
  
  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock < 5;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Specifications' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'community', label: 'Community' },
    { id: 'qa', label: `Q&A (${questions.length})` }
  ];

  return (
    <div className="pdp-page">
      {/* Breadcrumbs */}
      <nav className="pdp-breadcrumbs">
        <Link to="/"><Home size={16} /> Home</Link>
        <Chevron size={14} className="pdp-breadcrumb-sep" />
        <Link to="/marketplace">Marketplace</Link>
        <Chevron size={14} className="pdp-breadcrumb-sep" />
        {product.category && (
          <>
            <Link to={`/marketplace?category=${product.category_id}`}>{product.category}</Link>
            <Chevron size={14} className="pdp-breadcrumb-sep" />
          </>
        )}
        <span className="pdp-breadcrumb-current">{product.title}</span>
      </nav>

      {/* Main Content */}
      <div className="pdp-grid">
        {/* LEFT: Image Gallery + Live Chat */}
        <div className="pdp-left">
          {/* Image Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-main-image-container">
              <img 
                src={currentImage} 
                alt={product.title}
                className="pdp-main-image"
              />
              
              {/* Navigation Arrows */}
              {imageUrls.length > 1 && (
                <>
                  <button className="pdp-image-nav prev" onClick={handlePrevImage}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="pdp-image-nav next" onClick={handleNextImage}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image counter */}
              {imageUrls.length > 1 && (
                <div className="pdp-image-counter">
                  {currentImageIndex + 1} / {imageUrls.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="pdp-thumbnails">
                {imageUrls.map((img, index) => (
                  <button
                    key={index}
                    className={`pdp-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={img} alt={`${product.title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Chat Widget */}
          <LiveChatWidget productId={product.id} productTitle={product.title} />
        </div>

        {/* RIGHT: Product Info */}
        <div className="pdp-right">
          {/* Title */}
          <h1 className="pdp-title">{product.title}</h1>

          {/* Rating & Stats */}
          <div className="pdp-stats-bar">
            <div className="pdp-rating-display">
              <div className="pdp-stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.average_rating || 0) ? '#fbbf24' : 'none'}
                    stroke={i < Math.floor(product.average_rating || 0) ? '#fbbf24' : '#6b7280'}
                  />
                ))}
              </div>
              <span className="pdp-rating-text">
                {(product.average_rating || 0).toFixed(1)} ({product.total_reviews || 0} reviews)
              </span>
            </div>

            <div className="pdp-social-stats">
              <span><Eye size={14} /> {product.views || 0} views</span>
              <span><MessageCircle size={14} /> {questions.length}</span>
              <span><ThumbsUp size={14} /> {product.likes || 0}</span>
            </div>
          </div>

          {/* Reactions */}
          <ProductReactions productId={product.id} />

          {/* Price */}
          <div className="pdp-price-section">
            <div className="pdp-price-current">${currentPrice}</div>
            {product.discount && (
              <>
                <div className="pdp-price-original">
                  ${(currentPrice / (1 - product.discount / 100)).toFixed(2)}
                </div>
                <div className="pdp-price-discount">-{product.discount}%</div>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className={`pdp-stock-status ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}>
            {isOutOfStock ? (
              <>❌ Out of Stock</>
            ) : isLowStock ? (
              <>⚠️ Only {currentStock} left in stock - Order soon!</>
            ) : (
              <>✅ In Stock ({currentStock} available)</>
            )}
          </div>

          {/* Short Description */}
          {product.description && (
            <p className="pdp-short-description">
              {product.description.length > 200 
                ? product.description.substring(0, 200) + '...' 
                : product.description}
            </p>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="pdp-variants-section">
              <label className="pdp-section-label">Select Variant:</label>
              <div className="pdp-variants-buttons">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    className={`pdp-variant-btn ${selectedVariant?.id === variant.id ? 'active' : ''} ${variant.stock === 0 ? 'disabled' : ''}`}
                    onClick={() => variant.stock > 0 && setSelectedVariant(variant)}
                    disabled={variant.stock === 0}
                  >
                    {variant.name}
                    {variant.stock === 0 && <span className="pdp-out-badge">Out</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="pdp-quantity-section">
            <label className="pdp-section-label">Quantity:</label>
            <div className="pdp-quantity-controls">
              <button 
                className="pdp-qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number"
                className="pdp-qty-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), currentStock || 99))}
                min="1"
                max={currentStock || 99}
              />
              <button 
                className="pdp-qty-btn"
                onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
                disabled={quantity >= (currentStock || 99)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pdp-action-buttons">
            <button 
              className={`pdp-btn-primary ${adding ? 'loading' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
            >
              <ShoppingCart size={18} />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>

            <button 
              className="pdp-btn-secondary"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              <Zap size={18} />
              Buy Now
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="pdp-secondary-actions">
            <button 
              className={`pdp-action-icon-btn ${isInWishlist ? 'active' : ''}`}
              onClick={handleWishlistToggle}
            >
              <Heart size={18} fill={isInWishlist ? '#ff3b30' : 'none'} />
              <span>Wishlist</span>
            </button>

            <button className="pdp-action-icon-btn">
              <GitCompare size={18} />
              <span>Compare</span>
            </button>

            <button className="pdp-action-icon-btn" onClick={handleShare}>
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pdp-trust-badges">
            <div className="pdp-trust-badge">
              <Truck size={20} />
              <div>
                <strong>Free Shipping</strong>
                <span>On orders over $100</span>
              </div>
            </div>
            <div className="pdp-trust-badge">
              <Shield size={20} />
              <div>
                <strong>Secure Checkout</strong>
                <span>SSL encrypted</span>
              </div>
            </div>
            <div className="pdp-trust-badge">
              <RotateCcw size={20} />
              <div>
                <strong>30-Day Returns</strong>
                <span>Easy returns policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="pdp-tabs-container">
        <div className="pdp-tabs-nav">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`pdp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pdp-tabs-content">
          {activeTab === 'overview' && (
            <OverviewTab product={product} />
          )}
          {activeTab === 'specs' && (
            <SpecsTab product={product} />
          )}
          {activeTab === 'reviews' && (
            <ReviewsTab reviews={reviews} productId={product.id} token={token} />
          )}
          {activeTab === 'community' && (
            <CommunityTab productId={product.id} />
          )}
          {activeTab === 'qa' && (
            <QATab questions={questions} productId={product.id} token={token} />
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pdp-related-products">
          <h2 className="pdp-section-title">You May Also Like</h2>
          <div className="pdp-related-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
