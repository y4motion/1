/**
 * HotDealsStack.jsx - АКЦИИ - Clean Minimal Design
 * 
 * Horizontal scrollable cards with countdown timers
 * Glass Material style
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, ChevronLeft, ChevronRight, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const springBouncy = { type: "spring", stiffness: 400, damping: 25 };

// Mock deals
const fallbackDeals = [
  {
    id: '1',
    name: 'VOID KEYCAPS',
    description: 'Ghost Edition',
    currentPrice: 4990,
    originalPrice: 6990,
    discount: 29,
    endDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    category: 'keyboard'
  },
  {
    id: '2',
    name: 'RAZER VIPER V3',
    description: 'Wireless Gaming',
    currentPrice: 12990,
    originalPrice: 17990,
    discount: 28,
    endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    category: 'mouse'
  },
  {
    id: '3',
    name: 'CUSTOM CABLE',
    description: 'Coiled White',
    currentPrice: 2490,
    originalPrice: 3490,
    discount: 29,
    endDate: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
    category: 'cable'
  },
  {
    id: '4',
    name: 'DESKMAT XXL',
    description: 'Minimal Black',
    currentPrice: 1990,
    originalPrice: 2990,
    discount: 33,
    endDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    category: 'accessory'
  },
];

// Countdown hook
const useCountdown = (endDate) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(endDate);
      const diff = end - Date.now();
      
      if (diff <= 0) {
        setTimeLeft('00:00:00');
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
  }, [endDate]);
  
  return timeLeft;
};

// Single Deal Card
const DealCard = ({ deal }) => {
  const timeLeft = useCountdown(deal.endDate);
  
  return (
    <Link 
      to={`/marketplace?deal=${deal.id}`}
      style={{
        display: 'block',
        minWidth: '220px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}
      className="deal-card-minimal"
    >
      {/* Top: Discount badge + Timer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{
          padding: '4px 10px',
          background: 'rgba(255, 59, 48, 0.15)',
          border: '1px solid rgba(255, 59, 48, 0.2)',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '600',
          fontFamily: '"JetBrains Mono", monospace',
          color: '#FF3B30',
        }}>
          -{deal.discount}%
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", monospace',
          color: 'rgba(255,255,255,0.4)',
        }}>
          <Clock size={10} />
          {timeLeft}
        </div>
      </div>
      
      {/* Product icon placeholder */}
      <div style={{
        width: '48px',
        height: '48px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <Zap size={20} strokeWidth={1} style={{ opacity: 0.5 }} />
      </div>
      
      {/* Product info */}
      <div style={{
        fontSize: '13px',
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '4px',
        letterSpacing: '0.5px',
      }}>
        {deal.name}
      </div>
      <div style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '16px',
      }}>
        {deal.description}
      </div>
      
      {/* Price row */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
      }}>
        <span style={{
          fontSize: '16px',
          fontWeight: '600',
          fontFamily: '"JetBrains Mono", monospace',
          color: 'white',
        }}>
          {deal.currentPrice.toLocaleString()}₽
        </span>
        <span style={{
          fontSize: '11px',
          fontFamily: '"JetBrains Mono", monospace',
          color: 'rgba(255,255,255,0.3)',
          textDecoration: 'line-through',
        }}>
          {deal.originalPrice.toLocaleString()}₽
        </span>
      </div>
    </Link>
  );
};

export const HotDealsStack = ({ className = '' }) => {
  const [deals, setDeals] = useState(fallbackDeals);
  const scrollRef = useRef(null);
  
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/deals?active=true&limit=6`);
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
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div 
      className={`hot-deals-section ${className}`}
      data-testid="hot-deals-stack"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={springBouncy}
      style={{ marginBottom: '32px' }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 4px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'rgba(255, 59, 48, 0.1)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Percent size={16} style={{ color: '#FF3B30' }} />
          </div>
          <div>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '1px',
              color: 'rgba(255,255,255,0.9)',
            }}>
              АКЦИИ
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              {deals.length} ТОВАРОВ
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('left')}
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('right')}
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
      
      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '8px',
          marginLeft: '-4px',
          paddingLeft: '4px',
        }}
        className="deals-scroll-container"
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        
        {/* View All Card */}
        <Link
          to="/marketplace?filter=deals"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '160px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          <ChevronRight size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <span style={{ fontSize: '11px', letterSpacing: '0.5px' }}>ВСЕ АКЦИИ</span>
        </Link>
      </div>
      
      <style>{`
        .deals-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .deal-card-minimal:hover {
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          transform: translateY(-4px);
        }
      `}</style>
    </motion.div>
  );
};

export default HotDealsStack;
