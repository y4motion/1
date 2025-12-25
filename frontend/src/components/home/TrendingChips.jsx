import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import './TrendingChips.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Fallback данные
const fallbackTrending = [
  { id: '1', rank: 1, name: 'RTX 5090', growth: '+156%', isHot: true },
  { id: '2', rank: 2, name: 'Ryzen 9 9950X', growth: '+89%', isHot: true },
  { id: '3', rank: 3, name: 'DDR5 64GB', growth: '+67%', isHot: true },
  { id: '4', rank: 4, name: 'Samsung 990 Pro', growth: '+45%', isHot: false },
  { id: '5', rank: 5, name: 'RTX 4090', growth: '+34%', isHot: false },
  { id: '6', rank: 6, name: 'i9-14900K', growth: '+28%', isHot: false },
  { id: '7', rank: 7, name: 'ROG Strix Z790', growth: '+23%', isHot: false },
  { id: '8', rank: 8, name: 'Corsair 7000D', growth: '+19%', isHot: false },
];

const TrendingChips = () => {
  const [trendingItems, setTrendingItems] = useState(fallbackTrending);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_URL}/api/homepage/trending-searches?limit=12`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setTrendingItems(data);
          }
        }
      } catch (err) {
        console.log('Using fallback trending data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchTrending, 120000);
    return () => clearInterval(interval);
  }, []);

  // Track click for analytics
  const handleChipClick = async (item) => {
    try {
      await fetch(`${API_URL}/api/homepage/track-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_query: item.name,
          action: 'click'
        })
      });
    } catch (err) {
      // Silent fail
    }
  };

  if (isLoading) {
    return (
      <section className="trending-chips">
        <div className="trending-chips__container">
          <div className="trending-chips__header">
            <TrendingUp size={20} className="trending-chips__icon" />
            <h2 className="trending-chips__title">Горячее прямо сейчас</h2>
            <span className="trending-chips__live-badge">LIVE</span>
          </div>
          <div className="trending-chips__scroll">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="trending-chip trending-chip--skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="trending-chips">
      <div ref={containerRef} className="trending-chips__container">
        <div className="trending-chips__header scroll-reveal">
          <TrendingUp size={20} className="trending-chips__icon" />
          <h2 className="trending-chips__title">Горячее прямо сейчас</h2>
          <span className="trending-chips__live-badge">LIVE</span>
        </div>
        
        <div className="trending-chips__scroll">
          {trendingItems.map((item) => (
            <Link
              key={item.id}
              to={`/marketplace?search=${encodeURIComponent(item.name)}`}
              className={`trending-chip stagger-item ${item.rank <= 3 ? 'trending-chip--top' : ''} ${item.isHot ? 'trending-chip--hot' : ''}`}
              onClick={() => handleChipClick(item)}
            >
              <span className="trending-chip__rank">#{item.rank}</span>
              <span className="trending-chip__name">{item.name}</span>
              <span className="trending-chip__growth">{item.growth}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingChips;
