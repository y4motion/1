/**
 * ReviewDeck.jsx
 * Card Stack that fans out on click
 * Nothing aesthetic: Monochrome + dot ratings
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KineticWidget, ExpandButton, springBouncy } from './KineticWidget';

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

const ReviewCard = ({ review, index, isExpanded }) => {
  const stackOffset = isExpanded ? 0 : index * 8;
  const stackScale = isExpanded ? 1 : 1 - (index * 0.04);
  const stackOpacity = isExpanded ? 1 : 1 - (index * 0.3);
  
  return (
    <motion.div
      className="deck-card"
      initial={false}
      animate={{
        y: isExpanded ? 0 : stackOffset,
        scale: stackScale,
        opacity: stackOpacity,
        zIndex: 3 - index
      }}
      transition={springBouncy}
      style={{
        position: isExpanded ? 'relative' : 'absolute',
        marginBottom: isExpanded ? 12 : 0
      }}
    >
      <div className="review-content">
        <p className="review-text">"{review.text}"</p>
        <div className="review-author">
          <div className="author-avatar">
            {review.author.charAt(0).toUpperCase()}
          </div>
          <span className="author-name">@{review.author}</span>
          <div className="review-rating">
            {[1, 2, 3, 4, 5].map(i => (
              <span 
                key={i} 
                className={`rating-dot ${i <= review.rating ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ReviewDeck = ({ 
  reviews = MOCK_REVIEWS,
  onExpand,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const handleFullPage = (e) => {
    e.stopPropagation();
    onExpand?.();
  };
  
  return (
    <KineticWidget 
      className={`review-deck ${className}`}
      hover={false}
      onClick={toggleExpand}
    >
      <div className={`deck-stack ${isExpanded ? 'deck-expanded' : ''}`}>
        <AnimatePresence>
          {reviews.slice(0, 3).map((review, i) => (
            <ReviewCard 
              key={review.id}
              review={review}
              index={i}
              isExpanded={isExpanded}
            />
          ))}
        </AnimatePresence>
      </div>
      
      <div className="deck-controls">
        <span className="deck-hint">
          {isExpanded ? 'TAP TO COLLAPSE' : 'TAP TO EXPAND'}
        </span>
        <ExpandButton onClick={handleFullPage} size="sm" />
      </div>
    </KineticWidget>
  );
};

export default ReviewDeck;
