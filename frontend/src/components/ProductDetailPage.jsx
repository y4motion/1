import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  User,
  ChevronRight,
  Check,
  Package,
  Shield,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import PriceAlertSettings from './PriceAlertSettings';
import { trackProductView } from './home/LiveActivityFeed';
import '../styles/glassmorphism.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const { theme } = useTheme();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [newQuestion, setNewQuestion] = useState('');
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchQuestions();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`); // No trailing slash for path params
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        // Track product view for LiveActivityFeed
        trackProductView(id, data.name || data.title || 'Product');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/product/${id}/`); // With trailing slash
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questions/product/${id}/`); // With trailing slash
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        alert('Added to cart!');
        // Track cart activity for LiveActivityFeed
        const { trackActivity } = await import('./home/LiveActivityFeed');
        trackActivity('cart', {
          userName: user?.name || user?.username,
          productId: id,
          productName: product?.name || product?.title
        });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      alert('Please login to add to wishlist');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${id}/wishlist/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProduct();
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!token || !newQuestion.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/questions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: id,
          question: newQuestion,
        }),
      });

      if (response.ok) {
        setNewQuestion('');
        fetchQuestions();
      }
    } catch (error) {
      console.error('Failed to submit question:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!token || !newReview.comment.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: id,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
        }),
      });

      if (response.ok) {
        setNewReview({ rating: 5, title: '', comment: '' });
        fetchReviews();
        fetchProduct();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating >= 4 && r.rating < 5).length,
    3: reviews.filter((r) => r.rating >= 3 && r.rating < 4).length,
    2: reviews.filter((r) => r.rating >= 2 && r.rating < 3).length,
    1: reviews.filter((r) => r.rating < 2).length,
  };

  if (loading) {
    return (
      <div
        className="dark-bg"
        style={{
          minHeight: '100vh',
          paddingTop: '6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="grain-overlay" />
        <div style={{ fontSize: '1.25rem', opacity: 0.7 }}>Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="dark-bg"
        style={{
          minHeight: '100vh',
          paddingTop: '6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="grain-overlay" />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Product not found</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="glass-subtle"
            style={{
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage] ||
    images[0] || { url: 'https://via.placeholder.com/600' };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Package size={18} /> },
    { id: 'specs', label: 'Specifications', icon: <Shield size={18} /> },
    { id: 'reviews', label: `Reviews (${reviews.length})`, icon: <Star size={18} /> },
    { id: 'qa', label: `Q&A (${questions.length})`, icon: <MessageCircle size={18} /> },
    { id: 'chat', label: 'Live Chat', icon: <MessageCircle size={18} /> },
  ];

  return (
    <div
      className="dark-bg"
      style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }}
    >
      <div className="grain-overlay" />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Breadcrumbs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            opacity: 0.7,
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/marketplace" style={{ textDecoration: 'none', color: 'inherit' }}>
            Marketplace
          </Link>
          <ChevronRight size={14} />
          <span>{product.title}</span>
        </div>

        {/* Product Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Left: Image Gallery */}
          <div>
            {/* Main Image */}
            <div
              className="glass-strong"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '1rem',
                position: 'relative',
                paddingTop: '100%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <img
                src={currentImage.url}
                alt={product.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(images.length, 4)}, 1fr)`,
                  gap: '0.75rem',
                }}
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className="glass-subtle"
                    style={{
                      border:
                        selectedImage === idx
                          ? '2px solid rgba(255, 255, 255, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      paddingTop: '100%',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`View ${idx + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div>
            {/* Title */}
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                marginBottom: '1rem',
                lineHeight: '1.2',
              }}
            >
              {product.title}
            </h1>

            {/* Rating & Stats */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              {product.average_rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        fill={i < Math.floor(product.average_rating) ? '#FFD700' : 'none'}
                        color={i < Math.floor(product.average_rating) ? '#FFD700' : '#666'}
                      />
                    ))}
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                    {product.average_rating.toFixed(1)}
                  </span>
                </div>
              )}

              <span style={{ opacity: 0.7 }}>{product.total_reviews} reviews</span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span style={{ opacity: 0.7 }}>{product.views} views</span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span style={{ opacity: 0.7 }}>{product.purchases_count || 0} purchases</span>
            </div>

            {/* Price */}
            <div
              style={{
                fontSize: '3rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #fff 0%, #a8a8a8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem',
              }}
            >
              ${product.price}
            </div>

            {/* Stock Status */}
            <div
              style={{
                marginBottom: '2rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: product.stock > 0 ? '#4CAF50' : '#ff3b30',
              }}
            >
              {product.stock > 0 ? `IN STOCK (${product.stock} available)` : 'OUT OF STOCK'}
            </div>

            {/* Short Description */}
            <p
              style={{
                fontSize: '1.0625rem',
                lineHeight: '1.7',
                opacity: 0.9,
                marginBottom: '2rem',
              }}
            >
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                }}
              >
                Quantity
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="glass-subtle"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                  }}
                >
                  -
                </button>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="glass-subtle"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    cursor: quantity < product.stock ? 'pointer' : 'not-allowed',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    opacity: quantity >= product.stock ? 0.5 : 1,
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="glass-strong"
                style={{
                  flex: 1,
                  padding: '1.125rem 2rem',
                  borderRadius: '12px',
                  border: 'none',
                  background:
                    product.stock > 0
                      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.2) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  opacity: product.stock > 0 ? 1 : 0.5,
                }}
              >
                <ShoppingCart size={20} />
                ADD TO CART
              </button>

              <button
                onClick={handleToggleWishlist}
                className="glass-subtle"
                style={{
                  padding: '1.125rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <Heart
                  size={22}
                  color="#fff"
                  fill={user && product.wishlist_count > 0 ? '#ff3b30' : 'none'}
                />
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: product.title,
                        text: product.description,
                        url: window.location.href,
                      })
                      .catch((err) => console.log('Error sharing:', err));
                  } else {
                    // Fallback: копирование ссылки
                    navigator.clipboard.writeText(window.location.href);
                    alert('Ссылка скопирована в буфер обмена!');
                  }
                }}
                className="glass-subtle"
                style={{
                  padding: '1.125rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <Share2 size={22} />
              </button>
            </div>

            {/* Trust Badges */}
            <div
              className="glass-subtle"
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Shield size={24} style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Secure Payment</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Package size={24} style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Fast Shipping</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Zap size={24} style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: '600' }}>24/7 Support</div>
              </div>
            </div>

            {/* Price Drop Alert */}
            <PriceAlertSettings product={product} currentPrice={product.price} />
          </div>
        </div>

        {/* Tabs Section */}
        <div
          className="glass-strong"
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Tab Headers */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'auto',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '1.25rem 1.5rem',
                  border: 'none',
                  background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderBottom:
                    activeTab === tab.id
                      ? '2px solid rgba(255, 255, 255, 0.5)'
                      : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  Product Overview
                </h3>
                <p
                  style={{
                    fontSize: '1.0625rem',
                    lineHeight: '1.8',
                    opacity: 0.9,
                    marginBottom: '2rem',
                  }}
                >
                  {product.description}
                </p>

                {product.specifications && product.specifications.length > 0 && (
                  <>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
                      Key Features
                    </h4>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {product.specifications.map((spec, idx) => (
                        <div
                          key={idx}
                          className="glass-subtle"
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <Check size={18} color="#4CAF50" />
                          <span>
                            <strong>{spec.name}:</strong> {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  Technical Specifications
                </h3>
                {product.specifications && product.specifications.length > 0 ? (
                  <div
                    className="glass-subtle"
                    style={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden',
                    }}
                  >
                    {product.specifications.map((spec, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '1.25rem 1.5rem',
                          borderBottom:
                            idx < product.specifications.length - 1
                              ? '1px solid rgba(255, 255, 255, 0.05)'
                              : 'none',
                          display: 'grid',
                          gridTemplateColumns: '1fr 2fr',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ fontWeight: '600', opacity: 0.8 }}>{spec.name}</div>
                        <div>{spec.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ opacity: 0.7 }}>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab
                reviews={reviews}
                product={product}
                ratingDistribution={ratingDistribution}
                onSubmitReview={handleSubmitReview}
                newReview={newReview}
                setNewReview={setNewReview}
                token={token}
              />
            )}

            {activeTab === 'qa' && (
              <QATab
                questions={questions}
                onSubmitQuestion={handleSubmitQuestion}
                newQuestion={newQuestion}
                setNewQuestion={setNewQuestion}
                token={token}
              />
            )}

            {activeTab === 'chat' && <ChatTab product={product} token={token} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reviews Tab Component
const ReviewsTab = ({
  reviews,
  product,
  ratingDistribution,
  onSubmitReview,
  newReview,
  setNewReview,
  token,
}) => {
  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>
        Customer Reviews
      </h3>

      {/* Rating Summary */}
      <div
        className="glass-subtle"
        style={{
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '2rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '0.5rem' }}>
            {product.average_rating ? product.average_rating.toFixed(1) : 'N/A'}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.25rem',
              marginBottom: '0.5rem',
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={24}
                fill={i < Math.floor(product.average_rating) ? '#FFD700' : 'none'}
                color={i < Math.floor(product.average_rating) ? '#FFD700' : '#666'}
              />
            ))}
          </div>
          <div style={{ opacity: 0.7 }}>{product.total_reviews} reviews</div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            justifyContent: 'center',
          }}
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ minWidth: '60px', fontSize: '0.875rem' }}>{rating} stars</span>
              <div
                style={{
                  flex: 1,
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${product.total_reviews > 0 ? (ratingDistribution[rating] / product.total_reviews) * 100 : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ minWidth: '40px', fontSize: '0.875rem', opacity: 0.7 }}>
                {ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Form */}
      {token && (
        <div
          className="glass-subtle"
          style={{
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2rem',
          }}
        >
          <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
            Write a Review
          </h4>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              Rating
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setNewReview({ ...newReview, rating })}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Star
                    size={32}
                    fill={rating <= newReview.rating ? '#FFD700' : 'none'}
                    color={rating <= newReview.rating ? '#FFD700' : '#666'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              Review Title
            </label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              placeholder="Sum up your review..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              Your Review
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this product..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            onClick={onSubmitReview}
            disabled={!newReview.comment.trim()}
            className="glass-strong"
            style={{
              padding: '0.875rem 2rem',
              borderRadius: '10px',
              border: 'none',
              background:
                'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.2) 100%)',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: '700',
              cursor: newReview.comment.trim() ? 'pointer' : 'not-allowed',
              opacity: newReview.comment.trim() ? 1 : 0.5,
              border: '1px solid rgba(76, 175, 80, 0.3)',
            }}
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="glass-subtle"
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '1.125rem',
                    }}
                  >
                    {review.username ? review.username[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>
                      {review.username || 'Anonymous'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(review.rating) ? '#FFD700' : 'none'}
                          color={i < Math.floor(review.rating) ? '#FFD700' : '#666'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>

              {review.title && (
                <h4 style={{ fontSize: '1.0625rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                  {review.title}
                </h4>
              )}

              <p style={{ lineHeight: '1.7', opacity: 0.9, marginBottom: '1rem' }}>
                {review.comment}
              </p>

              {review.is_verified_purchase && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(76, 175, 80, 0.2)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#4CAF50',
                    marginBottom: '1rem',
                  }}
                >
                  <Check size={14} />
                  Verified Purchase
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="glass-subtle"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <ThumbsUp size={14} />
                  Helpful ({review.helpful_count || 0})
                </button>
                <button
                  className="glass-subtle"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <ThumbsDown size={14} />
                  Not Helpful ({review.unhelpful_count || 0})
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', opacity: 0.7, padding: '2rem' }}>
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
};

// Q&A Tab Component
const QATab = ({ questions, onSubmitQuestion, newQuestion, setNewQuestion, token }) => {
  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>
        Questions & Answers
      </h3>

      {/* Ask Question Form */}
      {token && (
        <div
          className="glass-subtle"
          style={{
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2rem',
          }}
        >
          <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
            Ask a Question
          </h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What would you like to know about this product?"
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            <button
              onClick={onSubmitQuestion}
              disabled={!newQuestion.trim()}
              className="glass-strong"
              style={{
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background:
                  'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.2) 100%)',
                color: '#fff',
                fontSize: '0.9375rem',
                fontWeight: '700',
                cursor: newQuestion.trim() ? 'pointer' : 'not-allowed',
                opacity: newQuestion.trim() ? 1 : 0.5,
                border: '1px solid rgba(76, 175, 80, 0.3)',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions.length > 0 ? (
          questions.map((question) => (
            <div
              key={question.id}
              className="glass-subtle"
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Question */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <MessageCircle size={20} style={{ marginTop: '0.25rem', opacity: 0.7 }} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: '700', fontSize: '1.0625rem', marginBottom: '0.375rem' }}
                    >
                      {question.question}
                    </div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
                      Asked by {question.username || 'Anonymous'} on{' '}
                      {new Date(question.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Answers */}
              {question.answers && question.answers.length > 0 && (
                <div
                  style={{
                    marginLeft: '2rem',
                    borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
                    paddingLeft: '1rem',
                  }}
                >
                  {question.answers.map((answer, idx) => (
                    <div
                      key={idx}
                      style={{ marginBottom: idx < question.answers.length - 1 ? '1rem' : 0 }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <User size={16} />
                        <span style={{ fontWeight: '600' }}>{answer.username || 'Anonymous'}</span>
                        {answer.is_seller && (
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: 'rgba(76, 175, 80, 0.2)',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#4CAF50',
                            }}
                          >
                            SELLER
                          </span>
                        )}
                        <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
                          {new Date(answer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ lineHeight: '1.6', opacity: 0.9 }}>{answer.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {(!question.answers || question.answers.length === 0) && (
                <div
                  style={{
                    marginLeft: '2rem',
                    opacity: 0.6,
                    fontStyle: 'italic',
                    fontSize: '0.875rem',
                  }}
                >
                  No answers yet
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', opacity: 0.7, padding: '2rem' }}>
            No questions yet. Be the first to ask!
          </p>
        )}
      </div>
    </div>
  );
};

// Chat Tab Component (Simplified - No WebSocket for now)
const ChatTab = ({ product, token }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Support',
      text: `Hi! Welcome to the ${product.title} product page. How can I help you today?`,
      timestamp: new Date(),
      isSupport: true,
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      user: 'You',
      text: message,
      timestamp: new Date(),
      isSupport: false,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate AI response (placeholder for DeepSeek integration)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          user: 'Support',
          text: 'Thank you for your message! A support representative will respond shortly. (This is a demo message - AI chat coming soon!)',
          timestamp: new Date(),
          isSupport: true,
        },
      ]);
    }, 1000);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Live Chat</h3>

      <div
        className="glass-subtle"
        style={{
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.isSupport ? 'flex-start' : 'flex-end',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '12px',
                  background: msg.isSupport
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  {msg.user}
                </div>
                <div style={{ lineHeight: '1.5' }}>{msg.text}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.375rem' }}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
          }}
        >
          {token ? (
            <>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="glass-strong"
                style={{
                  padding: '0.875rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background:
                    'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.2) 100%)',
                  color: '#fff',
                  cursor: message.trim() ? 'pointer' : 'not-allowed',
                  opacity: message.trim() ? 1 : 0.5,
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                }}
              >
                <Send size={18} />
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', width: '100%', opacity: 0.7 }}>
              Please login to use live chat
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: '10px',
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          fontSize: '0.875rem',
          color: '#FFC107',
        }}
      >
        💬 <strong>Coming Soon:</strong> Real-time chat with WebSocket, AI-powered responses
        (DeepSeek v3), and global chat widget with notifications!
      </div>
    </div>
  );
};

export default ProductDetailPage;
