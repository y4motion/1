import React, { useState } from 'react';
import './ProductReactions.css';

const reactions = [
  { id: 'helpful', emoji: '👍', label: 'Helpful' },
  { id: 'love', emoji: '❤️', label: 'Love it' },
  { id: 'fire', emoji: '🔥', label: 'Must have' },
  { id: 'innovative', emoji: '💡', label: 'Innovative' }
];

const ProductReactions = ({ productId }) => {
  const [counts, setCounts] = useState({
    helpful: Math.floor(Math.random() * 200) + 50,
    love: Math.floor(Math.random() * 100) + 20,
    fire: Math.floor(Math.random() * 60) + 10,
    innovative: Math.floor(Math.random() * 30) + 5
  });
  const [userReaction, setUserReaction] = useState(null);
  const [animating, setAnimating] = useState(null);

  const handleReaction = (reactionId) => {
    setAnimating(reactionId);
    setTimeout(() => setAnimating(null), 300);

    if (userReaction === reactionId) {
      // Remove reaction
      setCounts(prev => ({ ...prev, [reactionId]: prev[reactionId] - 1 }));
      setUserReaction(null);
    } else {
      // Add/change reaction
      if (userReaction) {
        setCounts(prev => ({ ...prev, [userReaction]: prev[userReaction] - 1 }));
      }
      setCounts(prev => ({ ...prev, [reactionId]: prev[reactionId] + 1 }));
      setUserReaction(reactionId);
    }
  };

  return (
    <div className="product-reactions">
      {reactions.map(reaction => (
        <button
          key={reaction.id}
          className={`reaction-btn ${userReaction === reaction.id ? 'active' : ''} ${animating === reaction.id ? 'animating' : ''}`}
          onClick={() => handleReaction(reaction.id)}
        >
          <span className="reaction-emoji">{reaction.emoji}</span>
          <span className="reaction-count">{counts[reaction.id]}</span>
        </button>
      ))}
    </div>
  );
};

export default ProductReactions;
