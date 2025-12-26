import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products, filtersOpen, onToggleWishlist, onFastBuy }) => {
  if (!products || products.length === 0) {
    return (
      <div className="products-empty">
        <div className="empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className={`products-grid ${filtersOpen ? 'with-filters' : ''}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onToggleWishlist={onToggleWishlist}
          onFastBuy={onFastBuy}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
