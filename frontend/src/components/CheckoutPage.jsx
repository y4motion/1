import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Bitcoin, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from './AuthModal';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setLoading(false);
      return;
    }
    fetchCart();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
        firstName: user.username || '',
      }));
    }
  }, [isAuthenticated, user]);

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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async () => {
    setProcessing(true);

    try {
      // TODO: Replace with real payment processing
      const response = await fetch(`${API_URL}/api/checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          customer_info: formData,
          items: cartItems,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to success page or payment gateway
        alert('Order placed successfully! (Demo mode)');
        navigate('/');
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
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
            <p style={{ opacity: 0.7 }}>You need to be logged in to checkout</p>
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
          <div className="pulse-glow">Loading...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div
      className="dark-bg"
      style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }}
    >
      <div className="grain-overlay" />

      <div style={{ width: '100%', padding: '2rem' }}>
        {/* Header */}
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '3rem',
            textAlign: 'center',
          }}
        >
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '2rem' }}>
          {/* Left Section - Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Contact Information */}
            <div className="glass-strong" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                  }}
                >
                  1
                </div>
                Contact Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)';
                  }}
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="glass-strong" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                  }}
                >
                  2
                </div>
                Shipping Address
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  style={{
                    gridColumn: '1 / -1',
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass-strong" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                  }}
                >
                  3
                </div>
                Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Card Payment */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border:
                      paymentMethod === 'card'
                        ? '2px solid rgba(139, 92, 246, 0.5)'
                        : theme === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      paymentMethod === 'card'
                        ? 'rgba(139, 92, 246, 0.1)'
                        : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  }}
                >
                  <CreditCard size={24} />
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Card Payment</div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.6 }}>
                      Pay with Visa, Mastercard, or МИР
                    </div>
                  </div>
                  {paymentMethod === 'card' && (
                    <CheckCircle size={20} style={{ marginLeft: 'auto', color: '#8B5CF6' }} />
                  )}
                </button>

                {/* Tinkoff */}
                <button
                  onClick={() => setPaymentMethod('tinkoff')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border:
                      paymentMethod === 'tinkoff'
                        ? '2px solid rgba(139, 92, 246, 0.5)'
                        : theme === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      paymentMethod === 'tinkoff'
                        ? 'rgba(139, 92, 246, 0.1)'
                        : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>🏦</div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Tinkoff</div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.6 }}>
                      Pay via Tinkoff Acquiring
                    </div>
                  </div>
                  {paymentMethod === 'tinkoff' && (
                    <CheckCircle size={20} style={{ marginLeft: 'auto', color: '#8B5CF6' }} />
                  )}
                </button>

                {/* SBP */}
                <button
                  onClick={() => setPaymentMethod('sbp')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border:
                      paymentMethod === 'sbp'
                        ? '2px solid rgba(139, 92, 246, 0.5)'
                        : theme === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      paymentMethod === 'sbp'
                        ? 'rgba(139, 92, 246, 0.1)'
                        : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  }}
                >
                  <Smartphone size={24} />
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      СБП (Fast Payment System)
                    </div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.6 }}>
                      Instant transfer via mobile banking
                    </div>
                  </div>
                  {paymentMethod === 'sbp' && (
                    <CheckCircle size={20} style={{ marginLeft: 'auto', color: '#8B5CF6' }} />
                  )}
                </button>

                {/* Crypto */}
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border:
                      paymentMethod === 'crypto'
                        ? '2px solid rgba(139, 92, 246, 0.5)'
                        : theme === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                    background:
                      paymentMethod === 'crypto'
                        ? 'rgba(139, 92, 246, 0.1)'
                        : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  }}
                >
                  <Bitcoin size={24} />
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Cryptocurrency</div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.6 }}>
                      Pay with BTC, USDT, ETH and more
                    </div>
                  </div>
                  {paymentMethod === 'crypto' && (
                    <CheckCircle size={20} style={{ marginLeft: 'auto', color: '#8B5CF6' }} />
                  )}
                </button>
              </div>

              {/* Security Badge */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background:
                    theme === 'dark' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Lock size={20} color="#8B5CF6" />
                <div style={{ fontSize: '0.8125rem', opacity: 0.8 }}>
                  Your payment information is encrypted and secure
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div
            className="glass-strong"
            style={{
              padding: '2rem',
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

            {/* Cart Items */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.5rem',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    paddingBottom: '1rem',
                    borderBottom:
                      theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.05)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <img
                    src={item.product_image || 'https://via.placeholder.com/60'}
                    alt={item.product_name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.6 }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom:
                  theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Subtotal</span>
                <span style={{ fontWeight: '600' }}>${calculateTotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Shipping</span>
                <span style={{ fontWeight: '600', color: '#4CAF50' }}>FREE</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2rem',
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

            {/* Place Order Button */}
            <button
              onClick={handleCheckout}
              disabled={processing}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                background: processing ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.15)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: processing ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)',
                opacity: processing ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!processing) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!processing) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }
              }}
            >
              {processing ? 'Processing...' : 'Place Order'}
            </button>

            <p
              style={{
                fontSize: '0.75rem',
                opacity: 0.6,
                textAlign: 'center',
                marginTop: '1rem',
              }}
            >
              By placing this order, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
