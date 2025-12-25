import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap } from 'lucide-react';
import './HotDealsAndPopular.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Fallback data
const fallbackPopular = [
  { id: '1', rank: 1, name: 'RTX 5090', sales: 2340, growth: '+89%', isHot: true },
  { id: '2', rank: 2, name: 'Ryzen 9 9950X', sales: 1890, growth: '+67%', isHot: true },
  { id: '3', rank: 3, name: 'G.Skill DDR5 64GB', sales: 1234, growth: '+45%', isHot: false },
  { id: '4', rank: 4, name: 'Samsung 990 Pro 2TB', sales: 987, growth: '+34%', isHot: false },
  { id: '5', rank: 5, name: 'ASUS ROG Strix Z790', sales: 756, growth: '+28%', isHot: false }
];

const fallbackDeals = [
  {
    id: '1',
    name: 'Razer DeathAdder V3 Pro',
    description: 'Professional wireless gaming mouse',
    image: null,
    currentPrice: 149.99,
    originalPrice: 199.99,
    discount: 25,
    stock: 5
  },
  {
    id: '2',
    name: 'Corsair K100 RGB',
    description: 'Mechanical gaming keyboard with OPX switches',
    image: null,
    currentPrice: 179.99,
    originalPrice: 229.99,
    discount: 22,
    stock: 8
  },
  {
    id: '3',
    name: 'SteelSeries Arctis Nova Pro',
    description: 'Wireless multi-system gaming headset',
    image: null,
    currentPrice: 299.99,
    originalPrice: 349.99,
    discount: 14,
    stock: 3
  }
];

export default function HotDealsAndPopular() {
  const [popularProducts, setPopularProducts] = useState(fallbackPopular);
  const [deals, setDeals] = useState(fallbackDeals);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch popular products
        const popularRes = await fetch(`${API_URL}/api/analytics/popular?period=month&limit=5`);
        if (popularRes.ok) {
          const data = await popularRes.json();
          if (data.products?.length > 0) {
            setPopularProducts(data.products);
          }
        }
      } catch (error) {
        console.log('Using fallback popular data');
      }

      try {
        // Fetch deals
        const dealsRes = await fetch(`${API_URL}/api/products/deals?active=true&limit=3`);
        if (dealsRes.ok) {
          const data = await dealsRes.json();
          if (data.deals?.length > 0) {
            setDeals(data.deals);
          }
        }
      } catch (error) {
        console.log('Using fallback deals data');
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank) => {
    if (rank <= 3) return `popular-item--top-${rank}`;
    return '';
  };

  return (
    <section className="hot-deals-section">
      <div className="hot-deals-container">
        <div className="hot-deals-grid">
          
          {/* LEFT: Popular */}
          <div className="popular-column">
            <div className="column-header">
              <div className="column-icon">
                <TrendingUp size={20} />
              </div>
              <h2 className="column-title">Самое популярное за месяц</h2>
            </div>
            
            <div className="popular-list">
              {popularProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className={`popular-item ${getRankClass(product.rank)}`}
                >
                  <div className="popular-rank">
                    {getRankDisplay(product.rank)}
                  </div>
                  
                  <div className="popular-content">
                    <h3 className="popular-name">{product.name}</h3>
                    <p className="popular-stats">
                      {product.sales?.toLocaleString()} продаж
                    </p>
                  </div>
                  
                  <span className={`popular-growth ${product.isHot ? 'popular-growth--hot' : ''}`}>
                    {product.growth}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* RIGHT: Deals */}
          <div className="deals-column">
            <div className="column-header">
              <div className="column-icon">
                <Zap size={20} />
              </div>
              <h2 className="column-title">Горячие предложения</h2>
            </div>
            
            <div className="deals-list">
              {deals.map((deal) => (
                <Link
                  key={deal.id}
                  to={`/product/${deal.id}`}
                  className="deal-card"
                >
                  <div className="deal-image">
                    {deal.image ? (
                      <img src={deal.image} alt={deal.name} />
                    ) : (
                      <div className="deal-image__placeholder">
                        <Zap size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="deal-content">
                    <div className="deal-header">
                      <h3 className="deal-name">{deal.name}</h3>
                      <span className="deal-badge">
                        -{deal.discount}%
                      </span>
                    </div>
                    
                    <p className="deal-description">{deal.description}</p>
                    
                    <div className="deal-price">
                      <span className="deal-current-price">
                        ${deal.currentPrice?.toFixed(2)}
                      </span>
                      <span className="deal-original-price">
                        ${deal.originalPrice?.toFixed(2)}
                      </span>
                    </div>
                    
                    {deal.stock && deal.stock < 10 && (
                      <span className="deal-stock">
                        Только {deal.stock} шт!
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
