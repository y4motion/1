import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Check, Eye } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function QuickViewModal({ product, onClose }) {
  const toast = useToast();
  const { user } = useAuth();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAddToCart = async () => {
    if (!user) {
      toast.warning('Please login to add items to cart');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/cart/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity
          })
        }
      );

      if (response.ok) {
        toast.success(`${product.name} added to cart!`);
        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10]);
        }
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.warning('Please login to add to wishlist');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/products/${product.id}/wishlist`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const images = product.images || [product.image];
  const hasMultipleImages = images.length > 1;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '2rem',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-strong"
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          position: 'relative',
          animation: 'slideUp 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            borderRadius: '50%',
            color: 'white',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.7)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <X size={24} />
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          padding: '2rem'
        }}>
          {/* Left: Image */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              position: 'relative',
              aspectRatio: '1',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <img
                src={typeof images[selectedImage] === 'string' ? images[selectedImage] : images[selectedImage]?.url || images[selectedImage]}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#a855f7', fontWeight: '600', textTransform: 'uppercase' }}>
              {product.category || 'Product'}
            </span>

            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', margin: 0 }}>
              {product.name}
            </h2>

            {product.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating) ? '#fbbf24' : 'none'}
                    stroke="#fbbf24"
                  />
                ))}
                <span style={{ fontWeight: '600', color: 'white' }}>{product.rating.toFixed(1)}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#a855f7' }}>
                ${product.price}
              </div>
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
              {product.description?.substring(0, 200)}
              {product.description?.length > 200 && '...'}
            </p>

            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              textAlign: 'center',
              background: product.stock > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: product.stock > 0 ? '#10b981' : '#ef4444',
              border: `1px solid ${product.stock > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: '600', color: 'white' }}>Quantity:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '60px',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'white',
                      fontWeight: '600'
                    }}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleAddToCart}
                disabled={isLoading || product.stock === 0}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#a855f7',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  opacity: product.stock > 0 ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (product.stock > 0) {
                    e.target.style.background = '#9333ea';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#a855f7';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <ShoppingCart size={20} />
                <span>{isLoading ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                style={{
                  width: '52px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isWishlisted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isWishlisted ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '8px',
                  color: isWishlisted ? '#ef4444' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <a 
              href={`/product/${product.id}`}
              onClick={onClose}
              style={{
                textAlign: 'center',
                color: '#a855f7',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '0.75rem',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              View Full Details →
            </a>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
              gap: 1.5rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
