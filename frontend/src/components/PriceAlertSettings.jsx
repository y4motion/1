import React, { useState } from 'react';
import { Bell, Mail, Smartphone, TrendingDown } from 'lucide-react';

export default function PriceAlertSettings({ product, currentPrice }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [notificationMethods, setNotificationMethods] = useState({
    push: true,
    email: false,
    sms: false
  });
  const [priceDropPercent, setPriceDropPercent] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleSaveAlert = async () => {
    setSaving(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/price-alerts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product?.id,
          target_price: targetPrice ? parseFloat(targetPrice) : null,
          price_drop_percent: !targetPrice ? priceDropPercent : null,
          notification_methods: notificationMethods,
          enabled: isEnabled
        })
      });
    } catch (error) {
      console.error('Failed to save alert:', error);
    }
    setSaving(false);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '8px',
      padding: '1.25rem',
      marginTop: '1.5rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isEnabled ? '1.25rem' : 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingDown size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'white',
              fontFamily: '"SF Mono", Monaco, monospace'
            }}>
              Price Alert
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '2px'
            }}>
              Уведомление при снижении цены
            </div>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            border: 'none',
            background: isEnabled ? 'rgba(74, 222, 128, 0.8)' : 'rgba(255,255,255,0.1)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'white',
            position: 'absolute',
            top: '3px',
            left: isEnabled ? '23px' : '3px',
            transition: 'left 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />
        </button>
      </div>

      {isEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Alert Type */}
          <div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Условие
            </div>

            {/* Percentage drop */}
            <div
              onClick={() => setTargetPrice('')}
              style={{
                padding: '0.75rem',
                background: !targetPrice ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: `1px solid ${!targetPrice ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                fontSize: '0.85rem',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Цена упадёт на
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    onClick={(e) => { e.stopPropagation(); setPriceDropPercent(pct); setTargetPrice(''); }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: priceDropPercent === pct && !targetPrice 
                        ? 'rgba(255,255,255,0.15)' 
                        : 'rgba(255,255,255,0.05)',
                      border: priceDropPercent === pct && !targetPrice
                        ? '1px solid rgba(255,255,255,0.2)'
                        : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontFamily: '"SF Mono", Monaco, monospace',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Target price */}
            <div
              onClick={() => setTargetPrice(String(Math.floor(currentPrice * 0.9)))}
              style={{
                padding: '0.75rem',
                background: targetPrice ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: `1px solid ${targetPrice ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                fontSize: '0.85rem',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Цена достигнет
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                padding: '0.5rem 0.75rem'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>$</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={`Текущая: $${currentPrice}`}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontFamily: '"SF Mono", Monaco, monospace',
                    outline: 'none'
                  }}
                />
              </div>
              {targetPrice && currentPrice && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#4ade80',
                  marginTop: '0.4rem'
                }}>
                  {((currentPrice - parseFloat(targetPrice)) / currentPrice * 100).toFixed(1)}% ниже текущей
                </div>
              )}
            </div>
          </div>

          {/* Notification Methods */}
          <div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Уведомить через
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { key: 'push', icon: Bell, label: 'Push' },
                { key: 'email', icon: Mail, label: 'Email' },
                { key: 'sms', icon: Smartphone, label: 'SMS' }
              ].map(method => (
                <label
                  key={method.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.75rem',
                    background: notificationMethods[method.key] ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: `1px solid ${notificationMethods[method.key] ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={notificationMethods[method.key]}
                    onChange={(e) => setNotificationMethods({
                      ...notificationMethods,
                      [method.key]: e.target.checked
                    })}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '3px',
                    border: `1px solid ${notificationMethods[method.key] ? 'rgba(74, 222, 128, 0.6)' : 'rgba(255,255,255,0.2)'}`,
                    background: notificationMethods[method.key] ? 'rgba(74, 222, 128, 0.2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: '#4ade80',
                    transition: 'all 0.2s'
                  }}>
                    {notificationMethods[method.key] && '✓'}
                  </div>
                  <method.icon size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                    {method.label}
                  </span>
                  {method.key === 'sms' && (
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'rgba(255,255,255,0.3)',
                      marginLeft: 'auto'
                    }}>
                      Premium
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveAlert}
            disabled={saving}
            style={{
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.85rem',
              fontFamily: '"SF Mono", Monaco, monospace',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: saving ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>

          {/* Info */}
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center'
          }}>
            Проверяем цены каждые 6 часов
          </div>
        </div>
      )}
    </div>
  );
}
