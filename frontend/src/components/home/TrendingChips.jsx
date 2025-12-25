import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useStaggerReveal } from '../../hooks/useScrollReveal';
import './TrendingChips.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const TrendingChips = () => {
  const [trendingItems, setTrendingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useStaggerReveal('.trending-chip', 50);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_URL}/api/homepage/trending-searches?limit=12`);
        if (res.ok) {
          const data = await res.json();
          setTrendingItems(data);
        }
      } catch (err) {
        console.error('Failed to fetch trending:', err);
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
      <div className="trending-chips__container">
        <div className="trending-chips__header">
          <TrendingUp size={20} className="trending-chips__icon" />
          <h2 className="trending-chips__title">Горячее прямо сейчас</h2>
          <span className="trending-chips__live-badge">LIVE</span>
        </div>
        
        <div className="trending-chips__scroll">
          {trendingItems.map((item, index) => (
            <Link
              key={item.id}
              to={`/marketplace?search=${encodeURIComponent(item.name)}`}
              className={`trending-chip ${item.rank <= 3 ? 'trending-chip--top' : ''} ${item.isHot ? 'trending-chip--hot' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
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
