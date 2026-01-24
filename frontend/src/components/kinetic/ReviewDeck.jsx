/**
 * ReviewDeck.jsx
 * KINETIC DOT-OS - Reviews Widget
 * 
 * Two states:
 * 1. COMPACT (square) - cards stack, new card slides from right and covers previous completely
 * 2. EXPANDED (full width) - stretches across page, pushes other widgets
 * 
 * Click on widget to toggle states
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Search, Package } from 'lucide-react';

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

// Reviews Modal
const ReviewsModal = ({ isOpen, onClose, reviews, products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });
  const [activeTab, setActiveTab] = useState('browse');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = selectedProduct 
    ? reviews.filter(r => r.productId === selectedProduct.id)
    : reviews;

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
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>ОТЗЫВЫ</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-tabs">
          <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>СМОТРЕТЬ</button>
          <button className={`tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}>НАПИСАТЬ</button>
        </div>

        <div className="modal-search">
          <Search size={14} />
          <input type="text" placeholder="Найти товар..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {searchQuery && (
          <div className="product-chips">
            {filteredProducts.map(product => (
              <button key={product.id} className={`product-chip ${selectedProduct?.id === product.id ? 'active' : ''}`} onClick={() => setSelectedProduct(product)}>
                <Package size={12} />{product.name}
              </button>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="selected-product">
            <span>Товар: {selectedProduct.name}</span>
            <button onClick={() => setSelectedProduct(null)}><X size={12} /></button>
          </div>
        )}

        <div className="modal-content">
          {activeTab === 'browse' ? (
            <div className="reviews-list">
              {filteredReviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-product">{review.product}</span>
                    <div className="review-rating">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "#fff" : "none"} stroke={i < review.rating ? "#fff" : "rgba(255,255,255,0.3)"} />)}</div>
                  </div>
                  <p className="review-text">"{review.text}"</p>
                  <div className="review-footer">
                    <span className="review-author">@{review.author}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="write-review">
              {!selectedProduct ? (
                <div className="select-product-hint"><Package size={24} /><p>Выберите товар через поиск</p></div>
              ) : (
                <>
                  <div className="rating-selector">
                    <span>Оценка:</span>
                    <div className="stars">{[1,2,3,4,5].map(star => <button key={star} onClick={() => setNewReview(prev => ({...prev, rating: star}))}><Star size={20} fill={star <= newReview.rating ? "#fff" : "none"} stroke={star <= newReview.rating ? "#fff" : "rgba(255,255,255,0.3)"} /></button>)}</div>
                  </div>
                  <textarea placeholder="Напишите ваш отзыв..." value={newReview.text} onChange={e => setNewReview(prev => ({...prev, text: e.target.value}))} />
                  <button className="submit-btn" disabled={!newReview.text.trim()}><Send size={14} />ОТПРАВИТЬ</button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ReviewDeck = ({ reviews = MOCK_REVIEWS, products = MOCK_PRODUCTS, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Auto-rotate reviews
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, [reviews.length]);

  const currentReview = reviews[currentIndex];

  const handleWidgetClick = (e) => {
    // Don't toggle if clicking on modal button
    if (e.target.closest('.modal-btn')) return;
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <motion.div 
        className={`review-deck-widget ${isExpanded ? 'expanded' : 'compact'} ${className}`}
        layout
        data-testid="review-deck"
        onClick={handleWidgetClick}
        style={{ cursor: 'pointer' }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Header */}
        <div className="deck-header">
          <div className="deck-title">
            <span className="live-dot" />
            <span>ОТЗЫВЫ</span>
            <span className="review-count">{reviews.length}</span>
          </div>
          <button 
            className="modal-btn"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
            title="Все отзывы"
          >
            <Star size={14} />
          </button>
        </div>

        {/* Cards Container */}
        <div className="deck-cards">
          {isExpanded ? (
            // EXPANDED: horizontal row
            <div className="expanded-row">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  className="expanded-card"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="card-product">{review.product}</div>
                  <p className="card-text">"{review.text}"</p>
                  <div className="card-footer">
                    <span className="card-author">@{review.author}</span>
                    <div className="card-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill={i < review.rating ? "#fff" : "none"} stroke={i < review.rating ? "#fff" : "rgba(255,255,255,0.3)"} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // COMPACT: stacked cards, one visible at a time
            <div className="compact-stack">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id}
                  className="stack-card"
                  initial={{ x: 250, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -250, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <p className="card-text">"{currentReview.text}"</p>
                  <div className="card-footer">
                    <div className="card-author-wrap">
                      <span className="card-initial">{currentReview.author[0].toUpperCase()}</span>
                      <span className="card-author">@{currentReview.author}</span>
                    </div>
                    <div className="card-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill={i < currentReview.rating ? "#fff" : "none"} stroke={i < currentReview.rating ? "#fff" : "rgba(255,255,255,0.3)"} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Progress dots */}
              <div className="progress-dots">
                {reviews.slice(0, 5).map((_, i) => (
                  <span key={i} className={`dot ${i === currentIndex % 5 ? 'active' : ''}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="deck-hint">
          {isExpanded ? 'TAP TO COLLAPSE' : 'TAP TO EXPAND'}
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <ReviewsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} reviews={reviews} products={products} />
        )}
      </AnimatePresence>

      <style>{`
        .review-deck-widget {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .review-deck-widget.compact {
          min-width: 280px;
          max-width: 320px;
        }

        .review-deck-widget.expanded {
          grid-column: 1 / -1 !important;
          width: 100%;
        }

        .deck-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
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
          50% { opacity: 0.4; }
        }

        .review-count {
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          font-size: 9px;
          color: rgba(255, 255, 255, 0.5);
        }

        .modal-btn {
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

        .modal-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .deck-cards {
          padding: 16px;
        }

        .compact .deck-cards {
          height: 140px;
        }

        /* COMPACT: Single card stack */
        .compact-stack {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .stack-card {
          flex: 1;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 14px;
          display: flex;
          flex-direction: column;
        }

        .stack-card .card-text {
          flex: 1;
          font-size: 12px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .stack-card .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .card-author-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-initial {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'SF Mono', monospace;
          font-size: 9px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }

        .card-author {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
        }

        .card-rating {
          display: flex;
          gap: 2px;
        }

        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
        }

        .progress-dots .dot {
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .progress-dots .dot.active {
          background: rgba(255, 255, 255, 0.6);
          width: 12px;
          border-radius: 2px;
        }

        /* EXPANDED: Horizontal row */
        .expanded-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scroll-snap-type: x mandatory;
        }

        .expanded-row::-webkit-scrollbar {
          height: 4px;
        }

        .expanded-row::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }

        .expanded-row::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .expanded-card {
          flex-shrink: 0;
          width: 240px;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 14px;
          scroll-snap-align: start;
        }

        .expanded-card .card-product {
          font-family: 'SF Mono', monospace;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .expanded-card .card-text {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .expanded-card .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .deck-hint {
          padding: 8px 16px 12px;
          font-family: 'SF Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        /* Modal styles */
        .reviews-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .reviews-modal {
          width: 100%;
          max-width: 560px;
          max-height: 80vh;
          background: #0a0a0a;
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
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: white;
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
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .modal-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tab {
          flex: 1;
          padding: 14px;
          background: none;
          border: none;
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          position: relative;
        }

        .tab:hover { color: rgba(255, 255, 255, 0.7); }
        .tab.active { color: white; }
        .tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: white;
        }

        .modal-search {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 20px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
        }

        .modal-search svg { color: rgba(255, 255, 255, 0.3); }
        .modal-search input {
          flex: 1;
          background: none;
          border: none;
          font-family: 'SF Mono', monospace;
          font-size: 12px;
          color: white;
          outline: none;
        }
        .modal-search input::placeholder { color: rgba(255, 255, 255, 0.3); }

        .product-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 20px 12px;
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
        }

        .product-chip:hover { background: rgba(255, 255, 255, 0.08); }
        .product-chip.active { background: white; color: black; }

        .selected-product {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 20px 12px;
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
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px 20px 20px;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
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
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .review-rating { display: flex; gap: 2px; }

        .review-text {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 10px 0;
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
        }

        .review-author {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
        }

        .review-date {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.2);
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
          padding: 40px;
          color: rgba(255, 255, 255, 0.3);
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

        .rating-selector .stars { display: flex; gap: 4px; }
        .rating-selector button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .write-review textarea {
          width: 100%;
          min-height: 100px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-size: 13px;
          color: white;
          resize: vertical;
          outline: none;
        }

        .write-review textarea:focus { border-color: rgba(255, 255, 255, 0.15); }
        .write-review textarea::placeholder { color: rgba(255, 255, 255, 0.3); }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: white;
          border: none;
          border-radius: 8px;
          font-family: 'SF Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: black;
          cursor: pointer;
        }

        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </>
  );
};

export default ReviewDeck;
