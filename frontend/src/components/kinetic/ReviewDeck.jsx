/**
 * ReviewDeck.jsx
 * KINETIC DOT-OS - The Stack Component
 * 
 * Implements 3-state compound animation:
 * STACK (compact) → FAN (preview) → LIST (expanded)
 * 
 * Reference: /app/design/KINETIC_UI_SPEC.md
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';

// Spring presets from spec
const springSmooth = { type: "spring", stiffness: 300, damping: 30 };
const springBouncy = { type: "spring", stiffness: 400, damping: 20 };

const MOCK_REVIEWS = [
  {
    id: 1,
    text: "Glasspad изменил мой сетап. Идеальное скольжение, премиум ощущения.",
    author: "voidwalker",
    rating: 5
  },
  {
    id: 2,
    text: "Минимализм в лучшем виде. Кабели как искусство.",
    author: "darknode", 
    rating: 5
  },
  {
    id: 3,
    text: "Качество на высоте. Доставка быстрая, упаковка — отдельный кайф.",
    author: "synthwave",
    rating: 4
  }
];

// State transforms from spec
const getCardTransform = (state, index, total) => {
  const centerIndex = Math.floor(total / 2);
  
  switch (state) {
    case 'stack':
      return {
        y: index * 8,
        x: 0,
        scale: 1 - (index * 0.04),
        rotate: 0,
        zIndex: total - index
      };
    case 'fan':
      return {
        y: 0,
        x: (index - centerIndex) * 140,
        scale: 1,
        rotate: (index - centerIndex) * 8,
        zIndex: index === centerIndex ? total : total - Math.abs(index - centerIndex)
      };
    case 'list':
      return {
        y: 0,
        x: 0,
        scale: 1,
        rotate: 0,
        zIndex: total - index
      };
    default:
      return {};
  }
};

const ReviewCard = ({ review, index, state, total, onClick }) => {
  const transform = getCardTransform(state, index, total);
  const isTopCard = index === 0 && state === 'stack';
  
  return (
    <motion.div
      layout
      layoutId={`review-card-${review.id}`}
      className="review-deck-card"
      initial={false}
      animate={{
        y: transform.y,
        x: transform.x,
        scale: transform.scale,
        rotate: transform.rotate,
        opacity: state === 'stack' && index > 0 ? 0.6 : 1
      }}
      transition={springBouncy}
      style={{ 
        zIndex: transform.zIndex,
        position: state === 'list' ? 'relative' : 'absolute'
      }}
      whileHover={state !== 'stack' ? { scale: 1.02, y: -4 } : {}}
      onClick={onClick}
    >
      <div className="card-inner">
        <p className="review-quote">"{review.text}"</p>
        <div className="review-meta">
          <div className="author-badge">
            <span className="author-initial">{review.author[0].toUpperCase()}</span>
          </div>
          <span className="author-handle">@{review.author}</span>
          <div className="rating-dots">
            {[1,2,3,4,5].map(i => (
              <span 
                key={i} 
                className={`dot ${i <= review.rating ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Recording dot - only on top card in stack */}
      {isTopCard && (
        <motion.div 
          className="recording-indicator"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

export const ReviewDeck = ({ 
  reviews = MOCK_REVIEWS,
  onExpand,
  className = ''
}) => {
  // Compound state: 'stack' | 'fan' | 'list'
  const [deckState, setDeckState] = useState('stack');
  
  const cycleState = () => {
    if (deckState === 'stack') {
      setDeckState('fan');
    } else if (deckState === 'fan') {
      setDeckState('list');
    }
    // List state has explicit close button
  };
  
  const collapse = () => {
    setDeckState('stack');
  };
  
  const goToFullPage = (e) => {
    e.stopPropagation();
    onExpand?.();
  };

  return (
    <LayoutGroup>
      <motion.div 
        layout
        className={`review-deck-container ${deckState} ${className}`}
        data-testid="review-deck"
        onClick={deckState !== 'list' ? cycleState : undefined}
      >
        {/* Header */}
        <motion.div layout className="deck-header">
          <div className="deck-title">
            <span className="live-dot" />
            <span>ОТЗЫВЫ</span>
          </div>
          <AnimatePresence mode="wait">
            {deckState === 'list' ? (
              <motion.button
                key="close"
                className="deck-action"
                onClick={collapse}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={14} />
              </motion.button>
            ) : (
              <motion.button
                key="expand"
                className="deck-action"
                onClick={goToFullPage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1, rotate: 45 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Cards Container */}
        <motion.div 
          layout
          className={`deck-cards ${deckState}`}
        >
          <AnimatePresence>
            {reviews.slice(0, 3).map((review, i) => (
              <ReviewCard
                key={review.id}
                review={review}
                index={i}
                state={deckState}
                total={3}
                onClick={deckState === 'stack' ? cycleState : undefined}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* State Hint */}
        <motion.div 
          layout 
          className="deck-hint"
          animate={{ opacity: deckState === 'list' ? 0 : 0.4 }}
        >
          {deckState === 'stack' && 'TAP TO FAN'}
          {deckState === 'fan' && 'TAP TO EXPAND'}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
};

export default ReviewDeck;
