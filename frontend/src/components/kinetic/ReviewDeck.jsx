/**
 * ReviewDeck.jsx
 * KINETIC DOT-OS - Reviews Widget
 * 
 * Two states:
 * 1. COMPACT (square) - cards stack right-to-left like flipping book pages
 * 2. EXPANDED (full width) - cards in row, new ones push old off screen
 * 
 * Plus modal for viewing/leaving reviews with product search
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Search, Star, Send, Package } from 'lucide-react';

const MOCK_REVIEWS = [
  {
    id: 1,
    text: "Glasspad изменил мой сетап. Идеальное скольжение, премиум ощущения.",
    author: "voidwalker",
    rating: 5,
    product: "Glasspad Pro",
    productId: "gp-001",
    date: "2024-01-15"
  },
  {
    id: 2,
    text: "Минимализм в лучшем виде. Кабели как искусство.",
    author: "darknode", 
    rating: 5,
    product: "USB-C Cable Set",
    productId: "cable-001",
    date: "2024-01-14"
  },
  {
    id: 3,
    text: "Качество на высоте. Доставка быстрая, упаковка — отдельный кайф.",
    author: "synthwave",
    rating: 4,
    product: "RTX 4090",
    productId: "gpu-001",
    date: "2024-01-13"
  },
  {
    id: 4,
    text: "Лучший магазин для сборки ПК. Консультация топ.",
    author: "neonrift",
    rating: 5,
    product: "AMD Ryzen 9",
    productId: "cpu-001",
    date: "2024-01-12"
  },
  {
    id: 5,
    text: "Быстрая доставка, всё как на фото. Рекомендую.",
    author: "ghostline",
    rating: 5,
    product: "Corsair RAM 32GB",
    productId: "ram-001",
    date: "2024-01-11"
  }
];

const MOCK_PRODUCTS = [
  { id: "gp-001", name: "Glasspad Pro", category: "Peripherals" },
  { id: "cable-001", name: "USB-C Cable Set", category: "Accessories" },
  { id: "gpu-001", name: "RTX 4090", category: "GPU" },
  { id: "cpu-001", name: "AMD Ryzen 9", category: "CPU" },
  { id: "ram-001", name: "Corsair RAM 32GB", category: "RAM" },
];

// Single review card for compact mode (stacking animation)
const CompactCard = ({ review, index, isVisible }) => {
  return (
    <motion.div
      className="compact-card"
      initial={{ x: 200, opacity: 0, rotateY: -15 }}
      animate={{ 
        x: 0, 
        opacity: isVisible ? 1 : 0,
        rotateY: 0,
        zIndex: 10 - index 
      }}
      exit={{ x: -100, opacity: 0, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        delay: index * 0.05
      }}
      style={{ 
        position: 'absolute',
        top: index * 4,
        left: index * 2,
      }}
    >
      <p className="card-text">"{review.text}"</p>
      <div className="card-meta">
        <span className="card-author">@{review.author}</span>
        <div className="card-rating">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={10} 
              fill={i < review.rating ? "#fff" : "none"}
              stroke={i < review.rating ? "#fff" : "rgba(255,255,255,0.3)"}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Single review card for expanded mode (horizontal row)
const ExpandedCard = ({ review, index }) => {
  return (
    <motion.div
      className="expanded-card"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: index * 0.1
      }}
    >
      <div className="card-product">{review.product}</div>
      <p className="card-text">"{review.text}"</p>
      <div className="card-footer">
        <span className="card-author">@{review.author}</span>
        <div className="card-rating">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              fill={i < review.rating ? "#fff" : "none"}
              stroke={i < review.rating ? "#fff" : "rgba(255,255,255,0.3)"}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Full Reviews Modal
const ReviewsModal = ({ isOpen, onClose, reviews, products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'write'

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = selectedProduct 
    ? reviews.filter(r => r.productId === selectedProduct.id)
    : reviews;

  const handleSubmitReview = () => {
    if (!newReview.text.trim() || !selectedProduct) return;
    // In real app, this would call API
    console.log('Submitting review:', { ...newReview, productId: selectedProduct.id });
    setNewReview({ text: '', rating: 5 });
    setActiveTab('browse');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="reviews-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="reviews-modal"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>ОТЗЫВЫ</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            СМОТРЕТЬ
          </button>
          <button 
            className={`tab ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            НАПИСАТЬ
          </button>
        </div>

        {/* Search */}
        <div className="modal-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Найти товар..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Product chips */}
        {searchQuery && (
          <div className="product-chips">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                className={`product-chip ${selectedProduct?.id === product.id ? 'active' : ''}`}
                onClick={() => setSelectedProduct(product)}
              >
                <Package size={12} />
                {product.name}
              </button>
            ))}
          </div>
        )}

        {/* Selected product indicator */}
        {selectedProduct && (
          <div className="selected-product">
            <span>Товар: {selectedProduct.name}</span>
            <button onClick={() => setSelectedProduct(null)}>
              <X size={12} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {activeTab === 'browse' ? (
            <div className="reviews-list">
              {filteredReviews.length === 0 ? (
                <div className="empty-state">
                  <p>Отзывов пока нет</p>
                </div>
              ) : (
                filteredReviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-product">{review.product}</span>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < review.rating ? "#fff" : "none"}
                            stroke={i < review.rating ? "#fff" : "rgba(255,255,255,0.3)"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="review-text">"{review.text}"</p>
                    <div className="review-footer">
                      <span className="review-author">@{review.author}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="write-review">
              {!selectedProduct ? (
                <div className="select-product-hint">
                  <Package size={24} />
                  <p>Выберите товар через поиск выше</p>
                </div>
              ) : (
                <>
                  <div className="rating-selector">
                    <span>Оценка:</span>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        >
                          <Star 
                            size={20} 
                            fill={star <= newReview.rating ? "#fff" : "none"}
                            stroke={star <= newReview.rating ? "#fff" : "rgba(255,255,255,0.3)"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Напишите ваш отзыв..."
                    value={newReview.text}
                    onChange={e => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                  />
                  <button 
                    className="submit-btn"
                    onClick={handleSubmitReview}
                    disabled={!newReview.text.trim()}
                  >
                    <Send size={14} />
                    ОТПРАВИТЬ
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ReviewDeck = ({ 
  reviews = MOCK_REVIEWS,
  products = MOCK_PRODUCTS,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState(reviews.slice(0, 3));
  const intervalRef = useRef(null);

  // Auto-rotate reviews in compact mode
  useEffect(() => {
    if (!isExpanded) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = (prev + 1) % reviews.length;
          // Rotate visible reviews - new one comes from right
          setVisibleReviews(prev => {
            const newReviews = [...prev];
            newReviews.pop(); // Remove last
            newReviews.unshift(reviews[next]); // Add new at front
            return newReviews;
          });
          return next;
        });
      }, 3000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isExpanded, reviews]);

  // Reset on expand/collapse
  useEffect(() => {
    if (isExpanded) {
      setVisibleReviews(reviews.slice(0, 5));
    } else {
      setVisibleReviews(reviews.slice(0, 3));
    }
  }, [isExpanded, reviews]);

  return (
    <>
      <motion.div 
        className={`review-deck ${isExpanded ? 'expanded' : 'compact'} ${className}`}
        layout
        data-testid="review-deck"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="deck-header">
          <div className="deck-title">
            <span className="live-dot" />
            <span>ОТЗЫВЫ</span>
          </div>
          <div className="deck-actions">
            <button 
              className="action-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Свернуть" : "Развернуть"}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ChevronRight size={14} />
              </motion.div>
            </button>
            <button 
              className="action-btn"
              onClick={() => setIsModalOpen(true)}
              title="Все отзывы"
            >
              <Star size={14} />
            </button>
          </div>
        </div>

        {/* Cards Container */}
        <div className="deck-cards">
          <AnimatePresence mode="popLayout">
            {isExpanded ? (
              // Expanded: horizontal row
              visibleReviews.map((review, index) => (
                <ExpandedCard key={review.id} review={review} index={index} />
              ))
            ) : (
              // Compact: stacked cards
              visibleReviews.map((review, index) => (
                <CompactCard 
                  key={review.id} 
                  review={review} 
                  index={index}
                  isVisible={index < 3}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Hint */}
        {!isExpanded && (
          <div className="deck-hint">
            <span>{reviews.length} отзывов</span>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ReviewsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            reviews={reviews}
            products={products}
          />
        )}
      </AnimatePresence>

      <style>{`
        .review-deck {
          background: rgba(10, 10, 10, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .review-deck.compact {
          width: 280px;
          height: 200px;
        }

        .review-deck.expanded {
          width: 100%;
          height: auto;
          min-height: 180px;
        }

        .deck-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .deck-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.7);
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .deck-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .deck-cards {
          position: relative;
          padding: 16px;
          min-height: 100px;
        }

        .compact .deck-cards {
          height: 120px;
        }

        .expanded .deck-cards {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 12px;
        }

        .expanded .deck-cards::-webkit-scrollbar {
          height: 4px;
        }

        .expanded .deck-cards::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }

        .expanded .deck-cards::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        /* Compact card */
        .compact-card {
          width: calc(100% - 16px);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
        }

        .compact-card .card-text {
          font-size: 11px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .compact-card .card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .compact-card .card-author {
          font-family: 'SF Mono', monospace;
          font-size: 9px;
          color: rgba(255, 255, 255, 0.4);
        }

        .compact-card .card-rating {
          display: flex;
          gap: 2px;
          margin-left: auto;
        }

        /* Expanded card */
        .expanded-card {
          flex-shrink: 0;
          width: 220px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 14px;
        }

        .expanded-card .card-product {
          font-family: 'SF Mono', monospace;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .expanded-card .card-text {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 12px 0;
        }

        .expanded-card .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .expanded-card .card-author {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
        }

        .expanded-card .card-rating {
          display: flex;
          gap: 2px;
        }

        .deck-hint {
          padding: 8px 16px 12px;
          font-family: 'SF Mono', monospace;
          font-size: 9px;
          color: rgba(255, 255, 255, 0.3);
          text-align: center;
        }

        /* Modal */
        .reviews-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .reviews-modal {
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          background: rgba(15, 15, 15, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .modal-header h2 {
          font-family: 'SF Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        .modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .modal-tabs {
          display: flex;
          padding: 0 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tab {
          padding: 14px 20px;
          background: none;
          border: none;
          font-family: 'SF Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          position: relative;
          transition: color 0.15s ease;
        }

        .tab:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        .tab.active {
          color: white;
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: white;
        }

        .modal-search {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 24px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
        }

        .modal-search svg {
          color: rgba(255, 255, 255, 0.3);
        }

        .modal-search input {
          flex: 1;
          background: none;
          border: none;
          font-family: 'SF Mono', monospace;
          font-size: 12px;
          color: white;
          outline: none;
        }

        .modal-search input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .product-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 24px 12px;
        }

        .product-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .product-chip:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .product-chip.active {
          background: white;
          color: black;
        }

        .selected-product {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 24px 12px;
          padding: 10px 14px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 8px;
          font-family: 'SF Mono', monospace;
          font-size: 11px;
          color: #22c55e;
        }

        .selected-product button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 2px;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px 24px;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .review-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 14px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .review-product {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .review-rating {
          display: flex;
          gap: 2px;
        }

        .review-text {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 10px 0;
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .review-author {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
        }

        .review-date {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.25);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.3);
        }

        .write-review {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .select-product-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.3);
          text-align: center;
        }

        .rating-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rating-selector span {
          font-family: 'SF Mono', monospace;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }

        .rating-selector .stars {
          display: flex;
          gap: 4px;
        }

        .rating-selector button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          transition: transform 0.15s ease;
        }

        .rating-selector button:hover {
          transform: scale(1.2);
        }

        .write-review textarea {
          width: 100%;
          min-height: 120px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-family: inherit;
          font-size: 13px;
          color: white;
          resize: vertical;
          outline: none;
        }

        .write-review textarea:focus {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .write-review textarea::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: white;
          border: none;
          border-radius: 8px;
          font-family: 'SF Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: black;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .review-deck.compact {
            width: 100%;
          }

          .reviews-modal {
            max-height: 90vh;
          }
        }
      `}</style>
    </>
  );
};

export default ReviewDeck;
