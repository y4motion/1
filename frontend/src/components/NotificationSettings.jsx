import React, { useState, useEffect } from 'react';
import { Bell, BellOff, TestTube } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import {
  checkPushSupport,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription
} from '../utils/pushNotifications';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function NotificationSettings() {
  const toast = useToast();
  const { token } = useAuth();
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    setPushSupported(checkPushSupport());
    checkPushStatus();
    
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const checkPushStatus = async () => {
    try {
      const subscription = await getCurrentSubscription();
      setIsPushEnabled(!!subscription);
    } catch (error) {
      console.error('Failed to check push status:', error);
    }
  };

  const handlePushToggle = async () => {
    if (!pushSupported) {
      toast.warning('Push notifications not supported in this browser');
      return;
    }

    if (!token) {
      toast.warning('Please login to enable notifications');
      return;
    }

    setIsLoading(true);

    try {
      if (isPushEnabled) {
        // Unsubscribe
        const endpoint = await unsubscribeFromPush();
        if (endpoint) {
          await fetch(`${API_URL}/api/notifications/unsubscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ endpoint })
          });
        }
        setIsPushEnabled(false);
        toast.success('Push notifications disabled');
      } else {
        // Subscribe
        const subscription = await subscribeToPush();
        await fetch(`${API_URL}/api/notifications/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(subscription.toJSON())
        });
        setIsPushEnabled(true);
        setPermissionStatus('granted');
        toast.success('Push notifications enabled!');
      }
    } catch (error) {
      console.error('Failed to toggle push:', error);
      
      if (error.message?.includes('denied')) {
        setPermissionStatus('denied');
        toast.error('Notification permission denied. Please enable in browser settings.');
      } else {
        toast.error('Failed to update push notifications');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!token) {
      toast.warning('Please login first');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.info('Test notification sent! Check your notifications.');
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      toast.error('Failed to send test notification');
    }
  };

  if (!pushSupported) {
    return (
      <div className="notification-settings unsupported">
        <BellOff size={24} />
        <p>Push notifications are not supported in this browser</p>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="setting-row">
        <div className="setting-info">
          <Bell size={24} className="bell-icon" />
          <div>
            <h4>Push Notifications</h4>
            <p>Get instant notifications in your browser</p>
            {permissionStatus === 'denied' && (
              <p className="permission-denied">Permission denied - enable in browser settings</p>
            )}
          </div>
        </div>

        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isPushEnabled}
            onChange={handlePushToggle}
            disabled={isLoading || permissionStatus === 'denied'}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {isPushEnabled && (
        <button
          onClick={handleTestNotification}
          className="test-button"
          disabled={isLoading}
        >
          <TestTube size={18} />
          Send Test Notification
        </button>
      )}

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .notification-settings {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .notification-settings.unsupported {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .setting-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .bell-icon {
    color: #a855f7;
  }

  .setting-info h4 {
    margin: 0 0 0.25rem 0;
    color: white;
    font-size: 1rem;
    font-weight: 600;
  }

  .setting-info p {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
  }

  .permission-denied {
    color: #ef4444 !important;
    font-size: 0.75rem !important;
    margin-top: 0.25rem !important;
  }

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

  .toggle-switch input:disabled ~ .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .test-button {
    margin-top: 1rem;
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .test-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .test-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
