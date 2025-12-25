import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TestimonialsCarousel.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Fallback reviews
const fallbackReviews = [
  {
    id: 1,
    username: 'ProGamer',
    source: 'MARKETPLACE',
    rating: 5,
    comment: 'Отличный сервис! Заказал видеокарту, пришла за 3 дня. Качество упаковки на высоте.'
  },
  {
    id: 2,
    username: 'TechMaster',
    source: 'GLASSY SWAP',
    rating: 5,
    comment: 'Продал свой старый процессор за час. Удобная платформа для обмена.'
  },
  {
    id: 3,
    username: 'PCBuilder',
    source: 'PC BUILDER',
    rating: 5,
    comment: 'AI-помощник реально помог собрать сборку без конфликтов. Рекомендую!'
  },
  {
    id: 4,
    username: 'GamerPro',
    source: 'GROUP BUY',
    rating: 4,
    comment: 'Сэкономил 15% на мониторе через групповую покупку. Отличная фича!'
  },
  {
    id: 5,
    username: 'RAMExpert',
    source: 'MARKETPLACE',
    rating: 5,
    comment: 'Широкий выбор памяти. Нашёл редкие модули DDR5, которых нет нигде.'
  },
  {
    id: 6,
    username: 'CoolingFan',
    source: 'ARTICLES',
    rating: 5,
    comment: 'Гайды по охлаждению очень помогли. Собрал тихую систему.'
  }
];

const TestimonialsCarousel = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState(fallbackReviews);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reviews/top?limit=12`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setReviews(data);
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        const newPosition = carouselRef.current.scrollLeft + 420;
        
        if (newPosition >= maxScroll) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 420, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const amount = direction === 'left' ? -420 : 420;
      carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleReviewClick = (review) => {
    if (review.product_id) {
      navigate(`/product/${review.product_id}`);
    }
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">Отзывы пользователей</h2>
        </div>
        
        <div className="testimonials-wrapper">
          <div 
            ref={carouselRef}
            className="testimonials-carousel"
          >
            {reviews.map((review, index) => (
              <div 
                key={review.id || index}
                className="testimonial-card scroll-reveal"
                onClick={() => handleReviewClick(review)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="testimonial-header">
                  <div className="testimonial-avatar">
                    <span className="testimonial-avatar__letter">
                      {(review.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="testimonial-info">
                    <h3 className="testimonial-name">{review.username}</h3>
                    <p className="testimonial-source">
                      {review.source ? `[${review.source}]` : '[MARKETPLACE]'}
                    </p>
                  </div>
                  
                  {review.rating && (
                    <div className="testimonial-rating">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`star ${i < review.rating ? 'star--filled' : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <p className="testimonial-text">
                  {review.comment || review.content}
                </p>
              </div>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="testimonials-nav">
            <button 
              className="nav-button"
              onClick={() => handleScroll('left')}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="nav-button"
              onClick={() => handleScroll('right')}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
