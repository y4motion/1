import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function TestimonialsCarousel() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const carouselRef = React.useRef(null);

  useEffect(() => {
    fetchTopReviews();
  }, []);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      handleScroll(500); // Scroll right by 500px every 4 seconds
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchTopReviews = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/reviews/top?limit=12`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.length > 0 ? data : mockReviews);
      } else {
        setReviews(mockReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (amount) => {
    if (carouselRef.current) {
      const newPosition = carouselRef.current.scrollLeft + amount;
      const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
      
      // Loop back to start if reached end
      if (newPosition >= maxScroll) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      }
    }
  };

  const updateScrollPosition = () => {
    if (carouselRef.current) {
      const scrollPercentage = 
        (carouselRef.current.scrollLeft / 
        (carouselRef.current.scrollWidth - carouselRef.current.clientWidth)) * 100;
      setScrollPosition(scrollPercentage);
    }
  };

  const handleReviewClick = (review) => {
    if (review.product_id) {
      navigate(`/product/${review.product_id}`);
    }
  };

  if (loading) return <div className="text-center py-12">Загрузка...</div>;

  return (
    <div className="w-full py-16">
      {/* Section Title - with padding */}
      <div style={{ padding: '0 5rem', marginBottom: '3rem' }}>
        <h2 
          className="text-4xl font-bold"
          style={{
            fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit',
            letterSpacing: '1px'
          }}
        >
          WHAT PEOPLE SAY
        </h2>
      </div>

      {/* Testimonials Container - full width, no padding */}
      <div className="relative">
        {/* Scrollable Reviews */}
        <div
          ref={carouselRef}
          onScroll={updateScrollPosition}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-8"
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            paddingLeft: '5rem',
            paddingRight: '5rem'
          }}
        >
          {reviews.map((review, index) => (
            <div
              key={index}
              onClick={() => handleReviewClick(review)}
              className="flex-shrink-0 p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10"
              style={{
                backgroundColor: 'rgb(10, 10, 10)',
                borderRadius: theme === 'minimal-mod' ? '0' : '3px',
                minHeight: '190px',
                width: '500px',
                scrollSnapAlign: 'start'
              }}
            >
              <p className="text-white mb-4 leading-relaxed" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                {review.comment || review.content}
              </p>
              <p className="text-white/70 text-sm" style={{ fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit' }}>
                -{review.username} {review.source && `[${review.source}]`}
              </p>
              {review.rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-white/20'}>★</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Custom Scrollbar and Navigation (PMM.gg style) */}
        <div className="flex items-center gap-4 mt-8" style={{ padding: '0 10rem' }}>
          {/* Progress Bar */}
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${scrollPosition}%` }}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleScroll(-500)}
              className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white/10 transition-all"
              style={{
                backgroundColor: 'transparent',
                borderRadius: theme === 'minimal-mod' ? '0' : '50%'
              }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleScroll(500)}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-all"
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

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
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
