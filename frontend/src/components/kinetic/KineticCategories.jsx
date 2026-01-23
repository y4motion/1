/**
 * KineticCategories.jsx - Abstract Bento Grid Categories
 * 
 * VISUAL CORRECTION: No photos, abstract patterns only
 * Style: Technical panels with dot-grid backgrounds
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
  const iconSize = category.size === 'large' ? 120 : category.size === 'medium' ? 80 : 48;
  
  return (
    <motion.div 
      variants={itemVariants}
      className={`category-island category-${category.size}`}
    >
      <Link 
        to={`/marketplace?category=${category.id}`}
        className="category-island-inner abstract"
        data-testid={`category-${category.id}`}
      >
        {/* Abstract Background Pattern - Dot Grid */}
        <div className="category-pattern" />
        
        {/* Large Ghost Icon */}
        <div className="category-ghost-icon">
          <Icon size={iconSize} strokeWidth={0.5} />
        </div>
        
        {/* Content - Bottom Left Corner */}
        <div className="category-content">
          <span className="category-name">{category.name}</span>
          <span className="category-count">
            {category.count.toLocaleString()}
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
