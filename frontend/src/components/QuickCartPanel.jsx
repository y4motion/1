import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Heart, Bookmark, ShoppingBag, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const QuickCartPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBags, setUserBags] = useState([]);
  const [showBagSelector, setShowBagSelector] = useState(null); // productId when showing bag selector
  const [showNewBagModal, setShowNewBagModal] = useState(false);
  const [newBagName, setNewBagName] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchCart();
      fetchUserBags();
    }
  }, [isOpen, user]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const fetchUserBags = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bags/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserBags(data.bags || []);
      }
    } catch (error) {
      console.error('Failed to fetch bags:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      await fetch(`${API_URL}/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });
      alert('Added to wishlist!');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const addToSaved = async (productId) => {
    try {
      await fetch(`${API_URL}/api/saved/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });
      alert('Added to saved items!');
    } catch (error) {
      console.error('Failed to add to saved:', error);
    }
  };

  const addToBag = async (productId, bagId) => {
    try {
      await fetch(`${API_URL}/api/bags/${bagId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });
      alert('Added to bag!');
      setShowBagSelector(null);
    } catch (error) {
      console.error('Failed to add to bag:', error);
    }
  };

  const createNewBag = async () => {
    if (!newBagName.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/api/bags/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newBagName })
      });

      if (response.ok) {
        setNewBagName('');
        setShowNewBagModal(false);
        fetchUserBags();
        alert('Bag created successfully!');
      }
    } catch (error) {
      console.error('Failed to create bag:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 998,
          animation: 'fadeIn 0.3s ease-out'
        }}
      />

      {/* Sliding Panel */}
      <div
        className="glass-strong"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '480px',
          background: theme === 'dark' 
            ? 'rgba(20, 20, 30, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: theme === 'dark' 
            ? '1px solid rgba(139, 92, 246, 0.3)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
          zIndex: 999,
          padding: '2rem',
          overflowY: 'auto',
          animation: 'slideInFromRight 0.3s ease-out',
          boxShadow: theme === 'dark' 
            ? '-4px 0 40px rgba(0, 0, 0, 0.5)' 
            : '-4px 0 40px rgba(0, 0, 0, 0.15)',
          color: theme === 'dark' ? '#fff' : '#1a1a1a',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: theme === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.25rem'
            }}>
              Shopping Cart
            </h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '6px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.border = theme === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.2)' 
                : '1px solid rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.border = '1px solid transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
            Loading...
          </div>
        ) : cartItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            opacity: 0.6 
          }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 1rem' }} />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.product_id}
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
                  border: theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Product Info */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <img
                    src={item.product_image || 'https://via.placeholder.com/80'}
                    alt={item.product_name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '0.9375rem', 
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      {item.product_name}
                    </h3>
                    <div style={{ 
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#8B5CF6',
                      marginBottom: '0.25rem'
                    }}>
                      ${item.price}
                    </div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.6 }}>
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem'
                }}>
                  {/* Add to Wishlist */}
                  <button
                    onClick={() => addToWishlist(item.product_id)}
                    title="Add to Wishlist"
                    style={{
                      padding: '0.625rem',
                      borderRadius: '6px',
                      border: theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                      background: theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 59, 48, 0.15)';
                      e.currentTarget.style.border = '1px solid rgba(255, 59, 48, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.03)';
                      e.currentTarget.style.border = theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <Heart size={16} />
                  </button>

                  {/* Add to Saved */}
                  <button
                    onClick={() => addToSaved(item.product_id)}
                    title="Save for Later"
                    style={{
                      padding: '0.625rem',
                      borderRadius: '6px',
                      border: theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                      background: theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                      e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.03)';
                      e.currentTarget.style.border = theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <Bookmark size={16} />
                  </button>

                  {/* Add to Bag */}
                  <button
                    onClick={() => setShowBagSelector(item.product_id)}
                    title="Add to Bag"
                    style={{
                      padding: '0.625rem',
                      borderRadius: '6px',
                      border: theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                      background: theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(76, 175, 80, 0.15)';
                      e.currentTarget.style.border = '1px solid rgba(76, 175, 80, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.03)';
                      e.currentTarget.style.border = theme === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <ShoppingBag size={16} />
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    title="Remove"
                    style={{
                      padding: '0.625rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 59, 48, 0.3)',
                      background: 'rgba(255, 59, 48, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 59, 48, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
                    }}
                  >
                    <Trash2 size={16} color="#ff3b30" />
                  </button>
                </div>

                {/* Bag Selector */}
                {showBagSelector === item.product_id && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: theme === 'dark'
                      ? 'rgba(139, 92, 246, 0.1)'
                      : 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}>
                    <div style={{ 
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      Add to Bag:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {userBags.map((bag) => (
                        <button
                          key={bag.id}
                          onClick={() => addToBag(item.product_id, bag.id)}
                          style={{
                            padding: '0.625rem',
                            borderRadius: '6px',
                            border: theme === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.1)',
                            background: theme === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.03)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'left',
                            fontSize: '0.875rem'
                          }}
                        >
                          {bag.name}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowNewBagModal(true)}
                        style={{
                          padding: '0.625rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          background: 'rgba(139, 92, 246, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        <Plus size={16} /> Create New Bag
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{
            borderTop: theme === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            paddingTop: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>Total</span>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: '#8B5CF6'
              }}>
                ${calculateTotal().toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  navigate('/cart');
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: theme === 'dark' ? '#fff' : '#1a1a1a',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Bag Modal */}
      {showNewBagModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '2rem',
            borderRadius: '16px',
            background: theme === 'dark' 
              ? 'rgba(20, 20, 30, 0.98)' 
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: theme === 'dark'
              ? '1px solid rgba(139, 92, 246, 0.3)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            color: theme === 'dark' ? '#fff' : '#1a1a1a'
          }}
        >
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700',
            marginBottom: '1.5rem'
          }}>
            Create New Bag
          </h3>
          <input
            type="text"
            placeholder="e.g. PC Build for Girlfriend"
            value={newBagName}
            onChange={(e) => setNewBagName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              borderRadius: '8px',
              border: theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              background: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.03)',
              color: theme === 'dark' ? '#fff' : '#1a1a1a',
              fontSize: '0.9375rem',
              outline: 'none',
              marginBottom: '1.5rem'
            }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                setShowNewBagModal(false);
                setNewBagName('');
              }}
              style={{
                flex: 1,
                padding: '0.875rem',
                borderRadius: '8px',
                border: theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                background: theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              onClick={createNewBag}
              style={{
                flex: 1,
                padding: '0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>
        {`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
};

export default QuickCartPanel;
