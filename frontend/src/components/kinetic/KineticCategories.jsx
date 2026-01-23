/**
 * KineticCategories.jsx - Bento Grid Categories
 * 
 * Dynamic size categories:
 * - Large (2x2): Featured categories
 * - Medium (1x2): Popular categories
 * - Small (1x1): Other categories
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Cpu, Monitor, Keyboard, Headphones, Mouse, HardDrive, Zap, Fan } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const springBouncy = { type: "spring", stiffness: 400, damping: 20 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, scale: 1, y: 0,
    transition: springBouncy
  }
};

const iconMap = { Cpu, Monitor, Keyboard, Headphones, Mouse, HardDrive, Zap, Fan };

const categoryImages = {
  gpu: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80',
  monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
  keyboards: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
  audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  peripherals: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
  storage: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80',
  psu: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80',
  cooling: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80'
};

// Default categories with sizes
const defaultCategories = [
  { id: 'gpu', name: 'Видеокарты', icon: 'Cpu', count: 1234, size: 'large', hot: true },
  { id: 'monitors', name: 'Мониторы', icon: 'Monitor', count: 856, size: 'medium' },
  { id: 'keyboards', name: 'Клавиатуры', icon: 'Keyboard', count: 2341, size: 'medium' },
  { id: 'audio', name: 'Аудио', icon: 'Headphones', count: 1567, size: 'small' },
  { id: 'peripherals', name: 'Периферия', icon: 'Mouse', count: 3421, size: 'small' },
  { id: 'storage', name: 'SSD/HDD', icon: 'HardDrive', count: 987, size: 'small' },
  { id: 'psu', name: 'БП', icon: 'Zap', count: 654, size: 'small' },
  { id: 'cooling', name: 'Охлаждение', icon: 'Fan', count: 1123, size: 'small', hot: true }
];

const CategoryIsland = ({ category }) => {
  const Icon = iconMap[category.icon] || Cpu;
  
  return (
    <motion.div 
      variants={itemVariants}
      className={`category-island category-${category.size}`}
    >
      <Link 
        to={`/marketplace?category=${category.id}`}
        className="category-island-inner"
        data-testid={`category-${category.id}`}
      >
        {/* Background Image */}
        <div className="category-bg">
          <img 
            src={categoryImages[category.id]} 
            alt={category.name}
            loading="lazy"
          />
          <div className="category-overlay" />
        </div>
        
        {/* Content */}
        <div className="category-content">
          <div className="category-icon">
            <Icon size={category.size === 'large' ? 32 : 24} />
          </div>
          <h3 className="category-name">{category.name}</h3>
          <span className="category-count">
            {category.count.toLocaleString()} товаров
          </span>
        </div>
        
        {/* Hot Badge */}
        {category.hot && (
          <span className="category-hot-badge">
            <span className="hot-dot" />
            HOT
          </span>
        )}
      </Link>
    </motion.div>
  );
};

export const KineticCategories = ({ className = '' }) => {
  const [categories, setCategories] = useState(defaultCategories);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/homepage/category-stats`);
        if (res.ok) {
          const data = await res.json();
          // Merge with default sizes
          const merged = data.map((cat, i) => ({
            ...cat,
            size: defaultCategories[i]?.size || 'small'
          }));
          setCategories(merged);
        }
      } catch (err) {
        // Keep defaults
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <motion.div 
      className={`kinetic-categories ${className}`}
      data-testid="kinetic-categories"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="categories-header">
        <h2 className="categories-title">КАТЕГОРИИ</h2>
        <Link to="/marketplace" className="categories-all">
          Все товары →
        </Link>
      </div>
      
      <div className="categories-bento">
        {categories.map((category) => (
          <CategoryIsland key={category.id} category={category} />
        ))}
      </div>
    </motion.div>
  );
};

export default KineticCategories;
