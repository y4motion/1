import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Wrench, Star, AlertCircle } from 'lucide-react';
import './LiveActivityFeed.css';

// Mock data - в будущем WebSocket
const generateMockActivities = () => [
  {
    id: '1',
    type: 'purchase',
    user: { name: 'Ivan' },
    product: { id: '123', name: 'RTX 5090' },
    timestamp: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: '2',
    type: 'view',
    product: { id: '789', name: 'Samsung Odyssey G9' },
    metadata: { count: 45 },
    timestamp: new Date(Date.now() - 30000).toISOString()
  },
  {
    id: '3',
    type: 'cart',
    user: { name: 'Maria' },
    product: { id: '456', name: 'Ryzen 9 9950X' },
    timestamp: new Date(Date.now() - 180000).toISOString()
  },
  {
    id: '4',
    type: 'build',
    user: { name: 'Alex' },
    metadata: { price: '150 000' },
    timestamp: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: '5',
    type: 'lowstock',
    product: { id: '321', name: 'G.Skill DDR5-6400' },
    metadata: { count: 3 },
    timestamp: new Date(Date.now() - 45000).toISOString()
  },
  {
    id: '6',
    type: 'review',
    user: { name: 'Dmitry' },
    product: { id: '654', name: 'LG UltraGear' },
    metadata: { rating: 5 },
    timestamp: new Date(Date.now() - 90000).toISOString()
  },
  {
    id: '7',
    type: 'purchase',
    user: { name: 'Elena' },
    product: { id: '987', name: 'Intel Core Ultra 9' },
    timestamp: new Date(Date.now() - 240000).toISOString()
  },
  {
    id: '8',
    type: 'view',
    product: { id: '111', name: 'ASUS ROG Swift' },
    metadata: { count: 28 },
    timestamp: new Date(Date.now() - 15000).toISOString()
  }
];

const getIcon = (type) => {
  const icons = {
    purchase: ShoppingCart,
    view: Eye,
    cart: Heart,
    build: Wrench,
    review: Star,
    lowstock: AlertCircle
  };
  return icons[type] || Eye;
};

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (seconds < 60) return 'только что';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  return `${hours} ч назад`;
};

const getActivityText = (activity) => {
  const { type, user, product, metadata } = activity;
  
  switch (type) {
    case 'purchase':
      return <><strong>{user?.name}</strong> купил <strong>{product?.name}</strong></>;
    case 'view':
      return <><strong>{metadata?.count}</strong> человек смотрят <strong>{product?.name}</strong></>;
    case 'cart':
      return <><strong>{user?.name}</strong> добавил в корзину <strong>{product?.name}</strong></>;
    case 'build':
      return <>Новая сборка за <strong>{metadata?.price}₽</strong> опубликована</>;
    case 'lowstock':
      return <><strong>{product?.name}</strong> — только <strong>{metadata?.count}</strong> шт!</>;
    case 'review':
      return <><strong>{user?.name}</strong> оставил <strong>{metadata?.rating}★</strong> на <strong>{product?.name}</strong></>;
    default:
      return 'Активность';
  }
};

const LiveActivityFeed = () => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [onlineCount, setOnlineCount] = useState(2345);
  const [activities] = useState(() => generateMockActivities());
  const trackRef = useRef(null);

  // Симуляция изменения онлайн счётчика
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 21) - 10);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = (activity) => {
    if (activity.product?.id) {
      navigate(`/product/${activity.product.id}`);
    } else if (activity.type === 'build') {
      navigate('/assembly');
    }
  };

  // Дублируем для seamless loop
  const duplicatedActivities = [...activities, ...activities];

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

export default LiveActivityFeed;
