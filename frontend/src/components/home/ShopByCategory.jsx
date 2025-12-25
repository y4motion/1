import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, Monitor, Keyboard, Headphones, Mouse, HardDrive,
  Zap, Fan, ArrowRight
} from 'lucide-react';
import './ShopByCategory.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Icon mapping
const iconMap = {
  Cpu, Monitor, Keyboard, Headphones, Mouse, HardDrive, Zap, Fan
};

// Image mapping for categories
const categoryImages = {
  gpu: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
  keyboards: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&q=80',
  audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  peripherals: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
  storage: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80',
  psu: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80',
  cooling: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80'
};

// Fallback categories
const defaultCategories = [
  { id: 'gpu', name: 'Видеокарты', icon: 'Cpu', count: 1234, trending: true, growth: 12 },
  { id: 'monitors', name: 'Мониторы', icon: 'Monitor', count: 856, hot: true },
  { id: 'keyboards', name: 'Клавиатуры', icon: 'Keyboard', count: 2341 },
  { id: 'audio', name: 'Аудио', icon: 'Headphones', count: 1567 },
  { id: 'peripherals', name: 'Периферия', icon: 'Mouse', count: 3421 },
  { id: 'storage', name: 'Накопители', icon: 'HardDrive', count: 987, growth: 8 },
  { id: 'psu', name: 'Блоки питания', icon: 'Zap', count: 654 },
  { id: 'cooling', name: 'Охлаждение', icon: 'Fan', count: 1123, hot: true }
];

const ShopByCategory = () => {
  const [categories, setCategories] = useState(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/homepage/category-stats`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Track category click for personalization
  const handleCategoryClick = async (category) => {
    try {
      await fetch(`${API_URL}/api/homepage/track-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.id,
          action: 'click'
        })
      });
    } catch (err) {
      // Silent fail
    }
  };

  return (
    <section className="shop-by-category">
      <div className="shop-by-category__header">
        <h2 className="shop-by-category__title">Категории магазина</h2>
        <Link to="/marketplace" className="shop-by-category__see-all">
          Все товары
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="shop-by-category__grid">
        {categories.map((category, index) => {
          const Icon = iconMap[category.icon] || Cpu;
          
          return (
            <Link
              key={category.id}
              to={`/marketplace?category=${category.id}`}
              className={`category-card scroll-reveal ${isLoading ? 'category-card--loading' : ''}`}
              style={{ animationDelay: `${index * 0.06}s` }}
              onClick={() => handleCategoryClick(category)}
            >
              {/* Background Image */}
              <div className="category-card__bg">
                <img 
                  src={categoryImages[category.id]} 
                  alt={category.name} 
                  loading="lazy" 
                />
                <div className="category-card__overlay" />
              </div>
              
              {/* Icon */}
              <div className="category-card__icon">
                <Icon size={20} />
              </div>
              
              {/* Badges */}
              {category.hot && (
                <span className="category-card__badge category-card__badge--hot">🔥 HOT</span>
              )}
              {category.growth && !category.hot && (
                <span className="category-card__badge category-card__badge--trending">
                  +{category.growth}%
                </span>
              )}
              
              {/* Content */}
              <div className="category-card__content">
                <h3 className="category-card__name">{category.name}</h3>
                <span className="category-card__count">
                  {category.count.toLocaleString('ru-RU')} товаров
                </span>
                {category.trending && !category.hot && (
                  <span className="category-card__trending-label">В тренде</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ShopByCategory;
