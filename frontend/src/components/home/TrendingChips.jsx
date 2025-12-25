import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import './TrendingChips.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Fallback data if API unavailable
const defaultTrendingItems = [
  { id: '1', rank: 1, name: 'RTX 5090', growth: '+235%', isHot: true },
  { id: '2', rank: 2, name: 'Ryzen 9 9950X', growth: '+180%', isHot: true },
  { id: '3', rank: 3, name: 'DDR5 64GB Kit', growth: '+92%', isHot: true },
  { id: '4', rank: 4, name: 'Samsung 990 PRO', growth: '+78%', isHot: false },
  { id: '5', rank: 5, name: 'LG UltraGear 27"', growth: '+65%', isHot: false },
  { id: '6', rank: 6, name: 'be quiet! 850W', growth: '+54%', isHot: false },
  { id: '7', rank: 7, name: 'Corsair 5000D', growth: '+48%', isHot: false },
  { id: '8', rank: 8, name: 'Arctic Freezer', growth: '+42%', isHot: false },
  { id: '9', rank: 9, name: 'ASUS ROG Swift', growth: '+38%', isHot: false },
  { id: '10', rank: 10, name: 'Logitech G Pro X', growth: '+32%', isHot: false },
  { id: '11', rank: 11, name: 'SteelSeries Apex', growth: '+28%', isHot: false },
  { id: '12', rank: 12, name: 'Razer DeathAdder', growth: '+24%', isHot: false },
];

const TrendingChips = () => {
  const [trendingItems, setTrendingItems] = useState(defaultTrendingItems);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to fetch real trending data
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_URL}/api/search/trending?limit=12`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            // Map API data to our format
            const mapped = data.map((item, index) => ({
              id: item.id || `trend-${index}`,
              rank: index + 1,
              name: item.query || item.name || item.title,
              growth: item.growth || `+${Math.floor(Math.random() * 150 + 20)}%`,
              isHot: index < 3
            }));
            setTrendingItems(mapped);
          }
        }
      } catch (err) {
        // Use default data
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

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
