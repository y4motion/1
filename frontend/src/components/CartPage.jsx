import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from './AuthModal';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const CartPage = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setLoading(false);
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`${API_URL}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="dark-bg" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
          <div className="grain-overlay" />
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Please Login</h1>
            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
              You need to be logged in to view your cart
            </p>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            navigate('/');
          }}
          mode="login"
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="dark-bg" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
        <div className="grain-overlay" />
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="pulse-glow" style={{ fontSize: '1.25rem' }}>
            Loading cart...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dark-bg"
      style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }}
    >
      <div className="grain-overlay" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
              }}
            >
              Shopping Cart
            </h1>
            <p style={{ opacity: 0.6 }}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Link
            to="/marketplace"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              color: theme === 'dark' ? '#fff' : '#1a1a1a',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Empty Cart State */}
        {cartItems.length === 0 ? (
          <div
            className="glass-strong"
            style={{
              padding: '4rem 2rem',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <ShoppingBag size={64} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              Your cart is empty
            </h2>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Add some products to get started</p>
            <Link
              to="/marketplace"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="glass-strong"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'center',
                  }}
                >
                  {/* Product Image */}
                  <img
                    src={item.product_image || 'https://via.placeholder.com/120'}
                    alt={item.product_name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                  />

                  {/* Product Info */}
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {item.product_name}
                    </h3>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#8B5CF6',
                      }}
                    >
                      ${item.price}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border:
                        theme === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                      background:
                        theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                        opacity: item.quantity <= 1 ? 0.3 : 1,
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        color: theme === 'dark' ? '#fff' : '#1a1a1a',
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        minWidth: '32px',
                        textAlign: 'center',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        color: theme === 'dark' ? '#fff' : '#1a1a1a',
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Total Price */}
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      minWidth: '100px',
                      textAlign: 'right',
                    }}
                  >
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    style={{
                      background: 'rgba(255, 59, 48, 0.1)',
                      border: '1px solid rgba(255, 59, 48, 0.3)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 59, 48, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
                    }}
                  >
                    <Trash2 size={18} color="#ff3b30" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div
              className="glass-strong"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                height: 'fit-content',
                position: 'sticky',
                top: '6rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom:
                    theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                Order Summary
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>${calculateTotal().toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Shipping</span>
                  <span style={{ fontWeight: '600' }}>Calculated at checkout</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop:
                    theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>Total</span>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#8B5CF6',
                  }}
                >
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '700',
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
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
