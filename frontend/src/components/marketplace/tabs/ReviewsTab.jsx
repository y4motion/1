import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Check, Camera } from 'lucide-react';
import './TabStyles.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ReviewsTab = ({ reviews, productId, token }) => {
  const [filter, setFilter] = useState('all');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // Calculate rating breakdown
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach(review => {
    const rating = Math.floor(review.rating || 0);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++;
    }
  });

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
    : 0;

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
        // Reload would be needed to show new review
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
        <div className="reviews-avg">
          <div className="avg-number">{avgRating.toFixed(1)}</div>
          <div className="avg-stars">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={20} 
                fill={i < Math.floor(avgRating) ? '#fbbf24' : 'none'}
                stroke={i < Math.floor(avgRating) ? '#fbbf24' : '#6b7280'}
              />
            ))}
          </div>
          <div className="avg-total">{reviews.length} reviews</div>
        </div>

        <div className="reviews-breakdown">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="breakdown-row">
              <span className="breakdown-label">{rating} ⭐</span>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill"
                  style={{ 
                    width: `${reviews.length > 0 ? (ratingCounts[rating - 1] / reviews.length) * 100 : 0}%` 
                  }}
                />
              </div>
              <span className="breakdown-count">{ratingCounts[rating - 1]}</span>
            </div>
          ))}
        </div>
      </div>

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
      {token && !showWriteReview && (
        <button 
          className="btn-write-review"
          onClick={() => setShowWriteReview(true)}
        >
          ✍️ Write a Review
        </button>
      )}

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="write-review-form">
          <h4>Write Your Review</h4>
          
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-select">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setNewReview({ ...newReview, rating })}
                  className="rating-star-btn"
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
            >
              Cancel
            </button>
            <button 
              className="btn-submit"
              onClick={handleSubmitReview}
              disabled={!newReview.comment.trim() || submitting}
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
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {(review.username || 'U')[0].toUpperCase()}
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
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
