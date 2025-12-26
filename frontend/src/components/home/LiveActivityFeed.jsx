import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Wrench, Star, AlertCircle, Package, Wifi, WifiOff } from 'lucide-react';
import ws from '../../services/websocket';
import './LiveActivityFeed.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Session ID для трекинга
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('activity_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('activity_session_id', sessionId);
  }
  return sessionId;
};

const getIcon = (type) => {
  const icons = {
    purchase: ShoppingCart,
    view: Eye,
    cart: Heart,
    build: Wrench,
    review: Star,
    lowstock: AlertCircle,
    listing: Package
  };
  return icons[type] || Eye;
};

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (seconds < 30) return 'только что';
  if (seconds < 60) return `${seconds} сек назад`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return 'давно';
};

const getActivityText = (activity) => {
  const { type, user, product, metadata } = activity;
  
  switch (type) {
    case 'purchase':
      return <><strong>{user?.name || 'Кто-то'}</strong> купил <strong>{product?.name}</strong></>;
    case 'view':
      return <><strong>{metadata?.count || '?'}</strong> человек смотрят <strong>{product?.name}</strong></>;
    case 'cart':
      return <><strong>{user?.name || 'Кто-то'}</strong> добавил в корзину <strong>{product?.name}</strong></>;
    case 'build':
      return <>Новая сборка за <strong>{metadata?.price}₽</strong> опубликована</>;
    case 'lowstock':
      return <><strong>{product?.name}</strong> — только <strong>{metadata?.count}</strong> шт!</>;
    case 'review':
      return <><strong>{user?.name || 'Кто-то'}</strong> оставил <strong>{metadata?.rating}★</strong> на <strong>{product?.name}</strong></>;
    case 'listing':
      return <><strong>{user?.name || 'Кто-то'}</strong> выставил <strong>{product?.name}</strong> на продажу</>;
    default:
      return 'Активность на сайте';
  }
};

const LiveActivityFeed = () => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [onlineCount, setOnlineCount] = useState(234);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const fetchIntervalRef = useRef(null);

  // Ping сервер для онлайн счётчика
  const pingServer = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/activity/ping`, {
        method: 'POST',
        headers: {
          'X-Session-ID': getSessionId()
        }
      });
    } catch (err) {
      // Silent fail
    }
  }, []);

  // Получить онлайн статистику
  const fetchOnlineStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/activity/online`);
      if (res.ok) {
        const data = await res.json();
        setOnlineCount(data.online_count);
      }
    } catch (err) {
      // Use last known value
    }
  }, []);

  // Получить ленту активности
  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/activity/feed?limit=12`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setActivities(data);
        }
      }
    } catch (err) {
      // Keep existing activities
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + intervals
  useEffect(() => {
    // Первичная загрузка
    pingServer();
    fetchOnlineStats();
    fetchActivities();

    // Пинг каждые 30 секунд для онлайн счётчика
    pingIntervalRef.current = setInterval(() => {
      pingServer();
      fetchOnlineStats();
    }, 30000);

    // Обновление активностей каждые 45 секунд
    fetchIntervalRef.current = setInterval(() => {
      fetchActivities();
    }, 45000);

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    };
  }, [pingServer, fetchOnlineStats, fetchActivities]);

  const handleItemClick = (activity) => {
    if (activity.product?.id) {
      navigate(`/product/${activity.product.id}`);
    } else if (activity.type === 'build') {
      navigate('/assembly');
    } else if (activity.type === 'listing') {
      navigate('/glassy-swap');
    }
  };

  // Дублируем для seamless loop
  const duplicatedActivities = activities.length > 0 
    ? [...activities, ...activities] 
    : [];

  // Show skeleton while loading
  if (isLoading && activities.length === 0) {
    return (
      <div className="live-activity-feed">
        <div className="online-indicator">
          <span className="online-dot" />
          <span>{onlineCount.toLocaleString('ru-RU')} сейчас на сайте</span>
        </div>
        <div className="activity-stream">
          <div className="activity-track">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="activity-item activity-item--skeleton">
                <div className="activity-icon" />
                <div className="skeleton-text" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-activity-feed">
      {/* Online indicator */}
      <div className="online-indicator">
        <span className="online-dot" />
        <span>{onlineCount.toLocaleString('ru-RU')} сейчас на сайте</span>
      </div>

      {/* Activity stream */}
      <div className="activity-stream">
        <div 
          ref={trackRef}
          className={`activity-track ${isPaused ? 'paused' : ''}`}
        >
          {duplicatedActivities.map((activity, index) => {
            const Icon = getIcon(activity.type);
            return (
              <div
                key={`${activity.id}-${index}`}
                className="activity-item"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onClick={() => handleItemClick(activity)}
              >
                <div className={`activity-icon activity-icon--${activity.type}`}>
                  <Icon size={16} />
                </div>
                <span className="activity-text">
                  {getActivityText(activity)}
                </span>
                <span className="activity-time">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export helper для трекинга активности из других компонентов
export const trackActivity = async (type, data) => {
  try {
    await fetch(`${API_URL}/api/activity/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': getSessionId()
      },
      body: JSON.stringify({
        type,
        user_name: data.userName,
        product_id: data.productId,
        product_name: data.productName,
        metadata: data.metadata
      })
    });
  } catch (err) {
    // Silent fail
  }
};

// Export для трекинга просмотра продукта
export const trackProductView = async (productId, productName) => {
  try {
    await fetch(`${API_URL}/api/activity/track/view?product_id=${productId}&product_name=${encodeURIComponent(productName)}`, {
      method: 'POST',
      headers: {
        'X-Session-ID': getSessionId()
      }
    });
  } catch (err) {
    // Silent fail
  }
};

export default LiveActivityFeed;
