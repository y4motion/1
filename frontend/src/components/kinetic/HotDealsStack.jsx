/**
 * HotDealsStack.jsx - Swipeable Deals Deck
 * 
 * Card stack that can be swiped like Tinder
 * Shows hot deals with countdown timer
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Zap, Flame } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const springBouncy = { type: "spring", stiffness: 400, damping: 25 };

// Fallback deals
const fallbackDeals = [
  {
    id: '1',
    name: 'Razer DeathAdder V3 Pro',
    description: 'Wireless gaming mouse',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    currentPrice: 12990,
    originalPrice: 17990,
    discount: 28,
    endDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Corsair K100 RGB',
    description: 'Mechanical keyboard',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400',
    currentPrice: 18990,
    originalPrice: 24990,
    discount: 24,
    endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'SteelSeries Arctis Nova Pro',
    description: 'Wireless headset',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    currentPrice: 29990,
    originalPrice: 34990,
    discount: 14,
    endDate: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString()
  }
];

const DealCard = ({ deal, isTop, onSwipe }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(deal.endDate);
      const diff = end - Date.now();
      
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deal.endDate]);
  
  return (
    <motion.div
      className={`deal-card ${isTop ? 'top' : ''}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ 
        x: 300, 
        opacity: 0, 
        rotate: 15,
        transition: { duration: 0.3 } 
      }}
      transition={springBouncy}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onSwipe(info.offset.x > 0 ? 'right' : 'left');
        }
      }}
    >
      {/* Image */}
      <div className="deal-image">
        {deal.image ? (
          <img src={deal.image} alt={deal.name} />
        ) : (
          <div className="deal-placeholder">
            <Zap size={40} />
          </div>
        )}
        
        {/* Discount Badge */}
        <span className="deal-discount">-{deal.discount}%</span>
      </div>
      
      {/* Content */}
      <div className="deal-content">
        <h3 className="deal-name">{deal.name}</h3>
        <p className="deal-desc">{deal.description}</p>
        
        <div className="deal-price-row">
          <span className="deal-current">{deal.currentPrice.toLocaleString()}₽</span>
          <span className="deal-original">{deal.originalPrice.toLocaleString()}₽</span>
        </div>
        
        {/* Timer */}
        <div className="deal-timer">
          <Clock size={14} />
          <span className="timer-value">{timeLeft}</span>
        </div>
      </div>
    </motion.div>
  );
};

export const HotDealsStack = ({ className = '' }) => {
  const [deals, setDeals] = useState(fallbackDeals);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/deals?active=true&limit=5`);
        if (res.ok) {
          const data = await res.json();
          if (data.deals?.length > 0) {
            setDeals(data.deals);
          }
        }
      } catch (err) {
        // Keep fallback
      }
    };
    
    fetchDeals();
  }, []);
  
  const handleSwipe = (direction) => {
    setCurrentIndex((prev) => (prev + 1) % deals.length);
  };
  
  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % deals.length);
  };
  
  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + deals.length) % deals.length);
  };
  
  // Get visible cards (current + next 2)
  const visibleDeals = [0, 1, 2].map((offset) => {
    const idx = (currentIndex + offset) % deals.length;
    return { ...deals[idx], offset };
  });

  return (
    <motion.div 
      className={`hot-deals-stack ${className}`}
      data-testid="hot-deals-stack"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={springBouncy}
    >
      {/* Header */}
      <div className="deals-header">
        <div className="deals-title">
          <Flame size={20} />
          <span>HOT DEALS</span>
        </div>
        
        {/* Navigation */}
        <div className="deals-nav">
          <button onClick={prevCard} className="nav-btn">
            <ChevronLeft size={18} />
          </button>
          <span className="deals-counter">
            {currentIndex + 1} / {deals.length}
          </span>
          <button onClick={nextCard} className="nav-btn">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      {/* Card Stack */}
      <div className="deals-stack-container">
        <AnimatePresence mode="popLayout">
          {visibleDeals.reverse().map((deal, i) => (
            <DealCard
              key={`${deal.id}-${currentIndex}`}
              deal={deal}
              isTop={deal.offset === 0}
              onSwipe={handleSwipe}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Swipe Hint */}
      <div className="swipe-hint">
        ← SWIPE →
      </div>
    </motion.div>
  );
};

export default HotDealsStack;
