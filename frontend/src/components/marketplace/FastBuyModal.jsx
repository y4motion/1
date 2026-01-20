import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Zap, Truck, Shield, Tag, CreditCard, MapPin, Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import OptimizedImage from '../OptimizedImage';
import './FastBuyModal.css';

// Use relative URLs to avoid mixed content issues in HTTPS environments
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

// Checkout Form Component
const CheckoutForm = ({ 
  product, 
  quantity, 
  selectedVariant, 
  selectedAddress, 
  promoCode,
  shippingCost,
  totalPrice,
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch(`${API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          variant_id: selectedVariant?.id,
          address_id: selectedAddress?.id,
          promo_code: promoCode,
          amount: parseFloat(totalPrice)
        })
      });

      const { clientSecret, orderId } = await response.json();

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(orderId);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="card-element-wrapper">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '15px',
                color: '#ffffff',
                '::placeholder': {
                  color: 'rgba(255, 255, 255, 0.4)',
                },
                iconColor: '#ffffff',
              },
              invalid: {
                color: '#ff3b30',
                iconColor: '#ff3b30',
              },
            },
          }}
        />
      </div>
      
      {error && <div className="payment-error">{error}</div>}
      
      <button 
        type="submit" 
        className="btn-complete-purchase"
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay $${totalPrice}`}
      </button>
    </form>
  );
};

// Main Modal Component
const FastBuyModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [adding, setAdding] = useState(false);

  // Load saved addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/addresses`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSavedAddresses(data);
          if (data.length > 0) {
            setSelectedAddress(data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      }
    };
    loadAddresses();
  }, []);

  // Load variant if available
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // Calculate shipping
  useEffect(() => {
    if (selectedAddress) {
      // Free shipping for orders > $100
      if (currentPrice * quantity > 100) {
        setShippingCost(0);
      } else {
        setShippingCost(9.99);
      }
    }
  }, [selectedAddress, quantity]);

  // Apply promo code
  const handleApplyPromo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/promo/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code: promoCode, product_id: product.id })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setDiscount(data.discount_amount);
          setPromoApplied(true);
        }
      }
    } catch (error) {
      console.error('Error applying promo:', error);
    }
  };

  // Prices
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const subtotal = currentPrice * quantity;
  const totalPrice = (subtotal + shippingCost - discount).toFixed(2);

  // Stock
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock < 5;

  // Quantity controls
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  const increaseQuantity = () => setQuantity(prev => Math.min(currentStock, prev + 1));

  // Add to cart
  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await onAddToCart(product.id, quantity, selectedVariant?.id);
      setTimeout(() => {
        setAdding(false);
        onClose();
      }, 800);
    } catch (error) {
      setAdding(false);
    }
  };

  // Payment success
  const handlePaymentSuccess = (orderId) => {
    window.location.href = `/order-confirmation/${orderId}`;
  };

  // Image URL
  const imageUrl = product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <div className="fastbuy-overlay" onClick={onClose}>
      <div className="fastbuy-modal shopify-style" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="fastbuy-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Two Column Layout */}
        <div className="fastbuy-grid">
          {/* LEFT: Product Image */}
          <div className="fastbuy-left">
            <div className="fastbuy-image">
              <OptimizedImage src={imageUrl} alt={product.title} />
            </div>
          </div>

          {/* RIGHT: Checkout Form */}
          <div className="fastbuy-right">
            {/* Header */}
            <div className="fastbuy-header">
              <h2 className="fastbuy-title">{product.title}</h2>
              <div className="fastbuy-price-block">
                <div className="fastbuy-price">${currentPrice}</div>
                {product.discount && (
                  <div className="fastbuy-price-original">
                    ${(currentPrice / (1 - product.discount / 100)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="fastbuy-content">
              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="form-section">
                  <label className="form-label">
                    <Tag size={14} />
                    Variant
                  </label>
                  <div className="variants-grid">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        className={`variant-btn ${selectedVariant?.id === variant.id ? 'active' : ''} ${variant.stock === 0 ? 'disabled' : ''}`}
                        onClick={() => variant.stock > 0 && setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                      >
                        {variant.name}
                        {variant.stock === 0 && <span className="variant-badge">Out</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="form-section">
                <label className="form-label">Quantity</label>
                <div className="quantity-controls">
                  <button className="qty-btn" onClick={decreaseQuantity} disabled={quantity <= 1}>
                    <Minus size={14} />
                  </button>
                  <input 
                    type="number"
                    className="qty-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), currentStock))}
                    min="1"
                    max={currentStock}
                  />
                  <button className="qty-btn" onClick={increaseQuantity} disabled={quantity >= currentStock}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Stock */}
              <div className={`stock-indicator ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}>
                {isOutOfStock ? '❌ Out of Stock' : isLowStock ? `⚠️ Only ${currentStock} left` : `✅ In Stock (${currentStock})`}
              </div>

              {/* Delivery Address */}
              <div className="form-section">
                <label className="form-label">
                  <MapPin size={14} />
                  Delivery Address
                </label>
                {savedAddresses.length > 0 ? (
                  <select 
                    className="address-select"
                    value={selectedAddress?.id || ''}
                    onChange={(e) => {
                      const addr = savedAddresses.find(a => a.id === e.target.value);
                      setSelectedAddress(addr);
                    }}
                  >
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.street}, {addr.city} {addr.postal_code}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="no-address">
                    <p>No saved addresses. Add one in your account settings.</p>
                  </div>
                )}
              </div>

              {/* Estimated Delivery */}
              {selectedAddress && (
                <div className="delivery-estimate">
                  <Truck size={16} />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
              )}

              {/* Promo Code */}
              <div className="form-section">
                <label className="form-label">Promo Code</label>
                <div className="promo-input-group">
                  <input
                    type="text"
                    className="promo-input"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={promoApplied}
                  />
                  <button 
                    className="promo-apply-btn"
                    onClick={handleApplyPromo}
                    disabled={!promoCode || promoApplied}
                  >
                    {promoApplied ? <Check size={14} /> : 'Apply'}
                  </button>
                </div>
                {promoApplied && (
                  <div className="promo-success">✅ Code applied! ${discount.toFixed(2)} off</div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="price-row discount">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="price-row total">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>

              {/* Payment Section */}
              {!showPayment ? (
                <div className="action-buttons">
                  <button 
                    className="btn-buynow-primary"
                    onClick={() => setShowPayment(true)}
                    disabled={isOutOfStock}
                  >
                    <Zap size={16} />
                    Continue to Payment
                  </button>
                  <button 
                    className={`btn-addcart ${adding ? 'loading' : ''}`}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || adding}
                  >
                    <ShoppingCart size={16} />
                    {adding ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              ) : (
                <div className="payment-section">
                  <div className="payment-header">
                    <CreditCard size={16} />
                    <span>Payment Method</span>
                  </div>
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      product={product}
                      quantity={quantity}
                      selectedVariant={selectedVariant}
                      selectedAddress={selectedAddress}
                      promoCode={promoCode}
                      shippingCost={shippingCost}
                      totalPrice={totalPrice}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                  <button 
                    className="btn-back"
                    onClick={() => setShowPayment(false)}
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="trust-badge">
                  <Shield size={14} />
                  <span>Secure Checkout</span>
                </div>
                <div className="trust-badge">
                  <span>🔄</span>
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastBuyModal;
