import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Smartphone, TrendingDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function PriceAlertSettings({ product, currentPrice }) {
  const toast = useToast();
  const { token } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [notificationMethods, setNotificationMethods] = useState({
    push: true,
    email: false,
    sms: false
  });
  const [priceDropPercent, setPriceDropPercent] = useState(10);
  const [loading, setLoading] = useState(false);
  const [existingAlert, setExistingAlert] = useState(null);

  // Fetch existing alert on mount
  useEffect(() => {
    if (token && product?.id) {
      fetchExistingAlert();
    }
  }, [token, product?.id]);

  const fetchExistingAlert = async () => {
    try {
      const response = await fetch(`${API_URL}/api/price-alerts/product/${product.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setExistingAlert(data.data);
          setIsEnabled(data.data.enabled);
          setTargetPrice(data.data.target_price ? String(data.data.target_price) : '');
          setPriceDropPercent(data.data.price_drop_percent || 10);
          setNotificationMethods(data.data.notification_methods || { push: true, email: false, sms: false });
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing alert:', error);
    }
  };

  const handleSaveAlert = async () => {
    if (!token) {
      toast.warning('Please login to set price alerts');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/price-alerts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          target_price: targetPrice ? parseFloat(targetPrice) : null,
          price_drop_percent: !targetPrice ? priceDropPercent : null,
          notification_methods: notificationMethods,
          enabled: isEnabled
        })
      });

      if (response.ok) {
        toast.success('Price alert saved!');
        fetchExistingAlert();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to save price alert');
      }
    } catch (error) {
      console.error('Failed to save price alert:', error);
      toast.error('Failed to save price alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async () => {
    if (!existingAlert?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/price-alerts/${existingAlert.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Price alert deleted');
        setExistingAlert(null);
        setIsEnabled(false);
        setTargetPrice('');
        setPriceDropPercent(10);
        setNotificationMethods({ push: true, email: false, sms: false });
      }
    } catch (error) {
      toast.error('Failed to delete alert');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="price-alert-settings">
        <div className="alert-header">
          <div className="header-content">
            <TrendingDown size={24} className="header-icon" />
            <div>
              <h3>Price Drop Alert</h3>
              <p>Login to get notified when the price drops</p>
            </div>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="price-alert-settings">
      <div className="alert-header">
        <div className="header-content">
          <TrendingDown size={24} className="header-icon" />
          <div>
            <h3>Price Drop Alert</h3>
            <p>Get notified when the price drops</p>
          </div>
        </div>

        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {isEnabled && (
        <div className="alert-body">
          {/* Alert type selection */}
          <div className="alert-type-section">
            <label className="section-label">Alert me when:</label>

            <div className="alert-type-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="alertType"
                  checked={!targetPrice}
                  onChange={() => setTargetPrice('')}
                />
                <span className="radio-custom"></span>
                <div className="radio-content">
                  <div className="radio-label">Price drops by</div>
                  <div className="percentage-selector">
                    <button
                      type="button"
                      onClick={() => setPriceDropPercent(5)}
                      className={priceDropPercent === 5 ? 'active' : ''}
                    >
                      5%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceDropPercent(10)}
                      className={priceDropPercent === 10 ? 'active' : ''}
                    >
                      10%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceDropPercent(15)}
                      className={priceDropPercent === 15 ? 'active' : ''}
                    >
                      15%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceDropPercent(20)}
                      className={priceDropPercent === 20 ? 'active' : ''}
                    >
                      20%
                    </button>
                  </div>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="alertType"
                  checked={!!targetPrice}
                  onChange={() => setTargetPrice(String(currentPrice * 0.9))}
                />
                <span className="radio-custom"></span>
                <div className="radio-content">
                  <div className="radio-label">Price reaches</div>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder={`Target price (current: $${currentPrice})`}
                      className="price-input"
                      disabled={!targetPrice && targetPrice !== '0'}
                    />
                  </div>
                  {targetPrice && parseFloat(targetPrice) < currentPrice && (
                    <div className="price-diff">
                      {((currentPrice - parseFloat(targetPrice)) / currentPrice * 100).toFixed(1)}% 
                      lower than current price
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Notification methods */}
          <div className="notification-methods-section">
            <label className="section-label">Notify me via:</label>

            <div className="method-options">
              <label className="method-checkbox">
                <input
                  type="checkbox"
                  checked={notificationMethods.push}
                  onChange={(e) => setNotificationMethods({
                    ...notificationMethods,
                    push: e.target.checked
                  })}
                />
                <span className="checkbox-custom"></span>
                <Bell size={18} />
                <span>Push Notification</span>
              </label>

              <label className="method-checkbox">
                <input
                  type="checkbox"
                  checked={notificationMethods.email}
                  onChange={(e) => setNotificationMethods({
                    ...notificationMethods,
                    email: e.target.checked
                  })}
                />
                <span className="checkbox-custom"></span>
                <Mail size={18} />
                <span>Email</span>
              </label>

              <label className="method-checkbox">
                <input
                  type="checkbox"
                  checked={notificationMethods.sms}
                  onChange={(e) => setNotificationMethods({
                    ...notificationMethods,
                    sms: e.target.checked
                  })}
                />
                <span className="checkbox-custom"></span>
                <Smartphone size={18} />
                <span>SMS (Premium)</span>
                <span className="premium-badge">PRO</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <button 
              className="save-alert-btn"
              onClick={handleSaveAlert}
              disabled={loading}
            >
              {loading ? 'Saving...' : (existingAlert ? 'Update Alert' : 'Save Alert')}
            </button>
            
            {existingAlert && (
              <button 
                className="delete-alert-btn"
                onClick={handleDeleteAlert}
                disabled={loading}
              >
                Delete Alert
              </button>
            )}
          </div>

          {/* Info note */}
          <div className="info-note">
            💡 We check prices every 6 hours. You'll be notified as soon as the price drops.
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .price-alert-settings {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 2rem 0;
  }

  .alert-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-icon {
    color: #a855f7;
  }

  .header-content h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.25rem 0;
  }

  .header-content p {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Toggle Switch */
  .toggle-switch {
    position: relative;
    width: 50px;
    height: 28px;
    cursor: pointer;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 28px;
    transition: all 0.3s;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    left: 4px;
    bottom: 4px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s;
  }

  .toggle-switch input:checked ~ .toggle-slider {
    background: #a855f7;
  }

  .toggle-switch input:checked ~ .toggle-slider::before {
    transform: translateX(22px);
  }

  /* Alert Body */
  .alert-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .section-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin-bottom: 1rem;
  }

  /* Alert Type Options */
  .alert-type-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .radio-option {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .radio-option:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(168, 85, 247, 0.3);
  }

  .radio-option input {
    position: absolute;
    opacity: 0;
  }

  .radio-custom {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
    margin-top: 0.125rem;
  }

  .radio-option input:checked ~ .radio-custom {
    border-color: #a855f7;
  }

  .radio-option input:checked ~ .radio-custom::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background: #a855f7;
    border-radius: 50%;
  }

  .radio-content {
    flex: 1;
  }

  .radio-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: white;
    margin-bottom: 0.75rem;
  }

  /* Percentage Selector */
  .percentage-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .percentage-selector button {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .percentage-selector button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .percentage-selector button.active {
    background: #a855f7;
    border-color: #a855f7;
  }

  /* Price Input */
  .price-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.75rem;
  }

  .currency-symbol {
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
  }

  .price-input {
    flex: 1;
    background: none;
    border: none;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    outline: none;
  }

  .price-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .price-diff {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #10b981;
  }

  /* Notification Methods */
  .method-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .method-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: white;
  }

  .method-checkbox:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .method-checkbox input {
    position: absolute;
    opacity: 0;
  }

  .checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    transition: all 0.2s;
    position: relative;
    flex-shrink: 0;
  }

  .method-checkbox input:checked ~ .checkbox-custom {
    background: #a855f7;
    border-color: #a855f7;
  }

  .method-checkbox input:checked ~ .checkbox-custom::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  .method-checkbox span:not(.checkbox-custom):not(.premium-badge) {
    font-size: 0.95rem;
  }

  .premium-badge {
    margin-left: auto;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 4px;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 1rem;
  }

  .save-alert-btn {
    flex: 1;
    padding: 1rem;
    background: #a855f7;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-alert-btn:hover:not(:disabled) {
    background: #9333ea;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(168, 85, 247, 0.3);
  }

  .save-alert-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .delete-alert-btn {
    padding: 1rem 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-alert-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
  }

  .delete-alert-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Info Note */
  .info-note {
    padding: 0.75rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #3b82f6;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .action-buttons {
      flex-direction: column;
    }
  }
`;
