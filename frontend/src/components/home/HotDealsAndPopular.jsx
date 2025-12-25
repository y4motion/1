import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, TrendingUp, ArrowRight, Star, Eye } from 'lucide-react';
import './HotDealsAndPopular.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Fallback data
const fallbackProducts = [
  {
    id: 'prod-1',
    name: 'NVIDIA RTX 5090 FE',
    price: 249990,
    originalPrice: 279990,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
    category: 'gpu',
    rating: 4.9,
    views: 12500,
    isHot: true
  },
  {
    id: 'prod-2',
    name: 'AMD Ryzen 9 9950X',
    price: 89990,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
    category: 'cpu',
    rating: 4.8,
    views: 9800
  },
  {
    id: 'prod-3',
    name: 'Samsung Odyssey G9 49"',
    price: 159990,
    originalPrice: 189990,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
    category: 'monitors',
    rating: 4.7,
    views: 8500,
    isHot: true
  },
  {
    id: 'prod-4',
    name: 'G.Skill DDR5-6400 64GB',
    price: 32990,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80',
    category: 'memory',
    rating: 4.6,
    views: 7200
  },
  {
    id: 'prod-5',
    name: 'be quiet! Dark Power 1200W',
    price: 28990,
    originalPrice: 34990,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80',
    category: 'psu',
    rating: 4.8,
    views: 5600
  },
  {
    id: 'prod-6',
    name: 'ASUS ROG Swift PG32UQX',
    price: 189990,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
    category: 'monitors',
    rating: 4.9,
    views: 4800,
    isHot: true
  }
];

const HotDealsAndPopular = () => {
  const [activeTab, setActiveTab] = useState('hot');
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = activeTab === 'hot' 
          ? '/api/homepage/trending-products?limit=6'
          : '/api/products?sort=views&limit=6';
        
        const res = await fetch(`${API_URL}${endpoint}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0 || (data.products && data.products.length > 0)) {
            setProducts(data.products || data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeTab]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const calculateDiscount = (original, current) => {
    return Math.round((1 - current / original) * 100);
  };

  // Track product click
  const handleProductClick = async (product) => {
    try {
      await fetch(`${API_URL}/api/homepage/track-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          category: product.category,
          action: 'click'
        })
      });
    } catch (err) {
      // Silent fail
    }
  };

  return (
    <section className="hot-deals-section">
      <div className="hot-deals-container">
        {/* Header with Tabs */}
        <div className="hot-deals-header">
          <div className="hot-deals-tabs">
            <button 
              className={`tab-button ${activeTab === 'hot' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('hot')}
            >
              <Flame size={18} />
              Горячие предложения
            </button>
            <button 
              className={`tab-button ${activeTab === 'popular' ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              <TrendingUp size={18} />
              Популярное
            </button>
          </div>
          
          <Link to="/marketplace" className="hot-deals-see-all">
            Все товары
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="hot-deals-grid">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="product-card"
              style={{ animationDelay: `${index * 0.08}s` }}
              onClick={() => handleProductClick(product)}
            >
              {/* Image */}
              <div className="product-card__image">
                <img src={product.image} alt={product.name} loading="lazy" />
                
                {/* Badges */}
                {product.originalPrice && (
                  <span className="product-card__badge product-card__badge--sale">
                    -{calculateDiscount(product.originalPrice, product.price)}%
                  </span>
                )}
                {product.isHot && !product.originalPrice && (
                  <span className="product-card__badge product-card__badge--hot">
                    <Flame size={12} /> HOT
                  </span>
                )}
              </div>
              
              {/* Content */}
              <div className="product-card__content">
                <h3 className="product-card__name">{product.name}</h3>
                
                <div className="product-card__meta">
                  {product.rating && (
                    <span className="product-card__rating">
                      <Star size={12} />
                      {product.rating}
                    </span>
                  )}
                  {product.views && (
                    <span className="product-card__views">
                      <Eye size={12} />
                      {(product.views / 1000).toFixed(1)}k
                    </span>
                  )}
                </div>
                
                <div className="product-card__price">
                  <span className="product-card__current-price">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="product-card__original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotDealsAndPopular;
