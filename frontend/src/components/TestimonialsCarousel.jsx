import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function TestimonialsCarousel() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchTopReviews();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 3 >= reviews.length ? 0 : prevIndex + 3
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const fetchTopReviews = async () => {
    try {
      // Fetch most liked reviews from all products
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/reviews/top?limit=12`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        // Fallback to mock reviews if API not ready
        setReviews(mockReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, reviews.length - 3) : Math.max(0, prevIndex - 3)
    );
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex + 3 >= reviews.length ? 0 : prevIndex + 3
    );
  };

  const handleReviewClick = (review) => {
    // Navigate to the product page where this review was left
    if (review.product_id) {
      navigate(`/product/${review.product_id}`);
    }
  };

  if (loading) return null;
  if (reviews.length === 0) return null;

  const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);

  return (
    <div className="w-full py-16" style={{ padding: '4rem 10rem' }}>
      {/* Section Title */}
      <h2 
        className="text-4xl font-bold mb-12"
        style={{
          fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit',
          letterSpacing: '1px'
        }}
      >
        WHAT PEOPLE SAY
      </h2>

      {/* Testimonials Carousel */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-6">
          {visibleReviews.map((review, index) => (
            <div
              key={currentIndex + index}
              onClick={() => handleReviewClick(review)}
              className="p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10"
              style={{
                backgroundColor: 'rgb(10, 10, 10)',
                borderRadius: theme === 'minimal-mod' ? '0' : '8px',
                minHeight: '200px'
              }}
            >
              {/* Review Text */}
              <p 
                className="text-white mb-4 leading-relaxed"
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}
              >
                {review.comment || review.content}
              </p>

              {/* Attribution */}
              <p 
                className="text-white/70 text-sm"
                style={{
                  fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
                }}
              >
                -{review.username} {review.source && `[${review.source}]`}
              </p>

              {/* Rating Stars (if available) */}
              {review.rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i}
                      className={i < review.rating ? 'text-yellow-400' : 'text-white/20'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderRadius: theme === 'minimal-mod' ? '0' : '50%'
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Progress Dots */}
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / 3) === i 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex + 3 >= reviews.length}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderRadius: theme === 'minimal-mod' ? '0' : '50%'
            }}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock reviews for fallback
const mockReviews = [
  {
    id: '1',
    comment: 'This is unbelievably great! The product exceeded my expectations. Highly recommended for anyone looking for quality.',
    username: 'TechEnthusiast',
    source: 'MARKETPLACE',
    rating: 5,
    product_id: 'mock-1',
    likes: 45
  },
  {
    id: '2',
    comment: 'Got 2 items and quality is awesome. Fast shipping and excellent customer service!',
    username: 'GamerPro',
    source: 'REVIEWS',
    rating: 5,
    product_id: 'mock-2',
    likes: 38
  },
  {
    id: '3',
    comment: 'I have been using this for well over a month now. The product performs like a dream.',
    username: 'ReviewExpert',
    source: 'ARTICLES',
    rating: 5,
    product_id: 'mock-3',
    likes: 32
  },
  {
    id: '4',
    comment: 'I really like the quality. Perfect for my needs and works flawlessly.',
    username: 'HappyCustomer',
    source: 'MARKETPLACE',
    rating: 5,
    product_id: 'mock-4',
    likes: 28
  },
  {
    id: '5',
    comment: 'Bought one a few weeks ago, by far my favorite purchase this year.',
    username: 'SmartShopper',
    source: 'REVIEWS',
    rating: 5,
    product_id: 'mock-5',
    likes: 25
  },
  {
    id: '6',
    comment: 'Its pretty amazing to see what quality you can get nowadays. Highly impressed!',
    username: 'QualitySeeker',
    source: 'FEED',
    rating: 5,
    product_id: 'mock-6',
    likes: 22
  }
];

export default TestimonialsCarousel;
