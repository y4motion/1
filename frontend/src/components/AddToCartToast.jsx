import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AddToCartToast = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCloseButton, setShowCloseButton] = useState(true);

  // Auto-close after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClose = () => {
    setShowCloseButton(false);
    onClose();
  };

  if (!product) return null;

  return (
    <>
      {/* Toast Notification - Bottom Right */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '380px',
          background: theme === 'dark' ? 'rgba(20, 20, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border:
            theme === 'dark' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow:
            theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          animation: 'slideInFromRight 0.4s ease-out',
          color: theme === 'dark' ? '#fff' : '#1a1a1a',
        }}
      >
        {/* Success Message */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom:
              theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '2px solid rgba(139, 92, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}
          >
            ✓
          </div>
          <div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.25rem',
              }}
            >
              Added to Cart
            </div>
            <div
              style={{
                fontSize: '0.8125rem',
                opacity: 0.6,
              }}
            >
              Product successfully added
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/80'}
            alt={product.title}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              objectFit: 'cover',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {product.title}
            </div>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#8B5CF6',
              }}
            >
              ${product.price}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={() => {
              navigate('/cart');
              onClose();
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              color: theme === 'dark' ? '#fff' : '#1a1a1a',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            View Cart
          </button>
          <button
            onClick={() => {
              navigate('/checkout');
              onClose();
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Floating Close Button - Follows Cursor */}
      {showCloseButton && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            left: `${mousePosition.x - 30}px`,
            top: `${mousePosition.y - 30}px`,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border:
              theme === 'dark'
                ? '2px solid rgba(0, 0, 0, 0.1)'
                : '2px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10000,
            pointerEvents: 'auto',
            transition: 'transform 0.2s ease',
            boxShadow:
              theme === 'dark' ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.15)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={28} color={theme === 'dark' ? '#000' : '#fff'} strokeWidth={2.5} />
        </div>
      )}

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
};

export default AddToCartToast;
