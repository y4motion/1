import React, { useState, useMemo } from 'react';
import { Star, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import './TabStyles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Example reviews data
const exampleReviews = [
  {
    id: 1,
    username: 'John Smith',
    avatar: '👤',
    rating: 5,
    created_at: '2024-12-20',
    is_verified_purchase: true,
    title: 'Best headphones I have ever owned!',
    comment: 'The noise cancellation is incredible, I can finally focus in my noisy office. The sound quality is also top-notch, with deep bass and clear highs. Battery life easily gets me through a full work week. Highly recommend!',
    helpful_count: 24,
    unhelpful_count: 1
  },
  {
    id: 2,
    username: 'Sarah Johnson',
    avatar: '👩',
    rating: 4,
    created_at: '2024-12-18',
    is_verified_purchase: true,
    title: 'Great sound quality, minor comfort issues',
    comment: 'Sound is excellent, especially for classical music. The comfort is good for long listening sessions, though they can get a bit warm after a few hours. The multipoint connection is a lifesaver for switching between my laptop and phone.',
    helpful_count: 12,
    unhelpful_count: 2
  },
  {
    id: 3,
    username: 'Mike Lee',
    avatar: '👨',
    rating: 5,
    created_at: '2024-12-15',
    is_verified_purchase: false,
    title: 'Perfect for commuting',
    comment: 'I use these daily on my subway commute and they completely block out the noise. The speak-to-chat feature is amazing - just start talking and the music pauses automatically. Touch controls are intuitive once you get used to them.',
    helpful_count: 18,
    unhelpful_count: 0
  },
  {
    id: 4,
    username: 'Emily Chen',
    avatar: '👩‍💼',
    rating: 4,
    created_at: '2024-12-10',
    is_verified_purchase: true,
    title: 'Great upgrade from XM4',
    comment: 'Upgraded from the XM4 and the improvements are noticeable - better ANC, lighter weight, and improved call quality. The only reason for 4 stars is the price, but you definitely get what you pay for.',
    helpful_count: 31,
    unhelpful_count: 3
  },
  {
    id: 5,
    username: 'David Brown',
    avatar: '🎧',
    rating: 3,
    created_at: '2024-12-05',
    is_verified_purchase: true,
    title: 'Good, but not perfect',
    comment: 'Noise cancelling is decent, but I expected more for the price. The touch controls can be a bit finicky sometimes, especially in cold weather. Still, the sound is good and they look sleek. Would recommend for casual listeners.',
    helpful_count: 8,
    unhelpful_count: 5
  }
];

const ReviewsTab = ({ reviews: apiReviews, productId, token }) => {
  // Use API reviews if available, otherwise use examples
  const reviews = apiReviews?.length > 0 ? apiReviews : exampleReviews;
  
  const [filter, setFilter] = useState('all');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // Calculate rating breakdown
  const ratingStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      const rating = Math.floor(review.rating || 0);
      if (rating >= 1 && rating <= 5) {
        counts[rating - 1]++;
      }
    });
    
    const total = reviews.length;
    const avgRating = total > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total 
      : 0;
    
    return { counts, avgRating, total };
  }, [reviews]);

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => Math.floor(r.rating) === parseInt(filter));

  const handleSubmitReview = async () => {
    if (!token || !newReview.comment.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment
        })
      });

      if (response.ok) {
        setNewReview({ rating: 5, title: '', comment: '' });
        setShowWriteReview(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tab-reviews">
      {/* Rating Summary */}
      <div className="reviews-summary">
        {/* Left: Average */}
        <div className="reviews-avg">
          <div className="avg-number">{ratingStats.avgRating.toFixed(1)}</div>
          <div className="avg-stars">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={20} 
                fill={i < Math.floor(ratingStats.avgRating) ? '#fbbf24' : 'none'}
                stroke={i < Math.floor(ratingStats.avgRating) ? '#fbbf24' : '#6b7280'}
              />
            ))}
          </div>
          <div className="avg-total">{ratingStats.total} reviews</div>
        </div>

        {/* Right: Breakdown */}
        <div className="reviews-breakdown">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingStats.counts[rating - 1];
            const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
            return (
              <div key={rating} className="breakdown-row">
                <span className="breakdown-label">{rating} ⭐</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="breakdown-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="reviews-controls">
        {/* Filters */}
        <div className="reviews-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reviews
          </button>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              className={`filter-btn ${filter === String(rating) ? 'active' : ''}`}
              onClick={() => setFilter(String(rating))}
            >
              {rating}⭐
            </button>
          ))}
        </div>

        {/* Write Review Button */}
        {!showWriteReview && (
          <button 
            className="btn-write-review"
            onClick={() => setShowWriteReview(true)}
          >
            ✍️ Write a Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="write-review-form glass-card">
          <h4>Write Your Review</h4>
          
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-select">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setNewReview({ ...newReview, rating })}
                  className="rating-star-btn"
                  type="button"
                >
                  <Star 
                    size={28} 
                    fill={rating <= newReview.rating ? '#fbbf24' : 'none'}
                    stroke={rating <= newReview.rating ? '#fbbf24' : '#6b7280'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Review Title (optional)</label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              placeholder="Sum up your review..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Your Review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this product..."
              rows={4}
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button 
              className="btn-cancel"
              onClick={() => setShowWriteReview(false)}
              type="button"
            >
              Cancel
            </button>
            <button 
              className="btn-submit"
              onClick={handleSubmitReview}
              disabled={!newReview.comment.trim() || submitting}
              type="button"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <div key={review.id} className="review-card glass-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.avatar || (review.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <strong>{review.username || 'Anonymous'}</strong>
                    {review.is_verified_purchase && (
                      <span className="verified-badge">
                        <Check size={12} /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <div className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(review.rating || 0) ? '#fbbf24' : 'none'}
                    stroke={i < Math.floor(review.rating || 0) ? '#fbbf24' : '#6b7280'}
                  />
                ))}
              </div>

              {review.title && <h4 className="review-title">{review.title}</h4>}
              <p className="review-comment">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((img, i) => (
                    <img key={i} src={img} alt="Review" className="review-image" />
                  ))}
                </div>
              )}

              <div className="review-actions">
                <button className="helpful-btn">
                  <ThumbsUp size={14} />
                  Helpful ({review.helpful_count || 0})
                </button>
                <button className="unhelpful-btn">
                  <ThumbsDown size={14} />
                  ({review.unhelpful_count || 0})
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="tab-no-content">
            <span className="no-content-icon">📝</span>
            <p>No reviews match your filter. Try selecting a different rating.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
