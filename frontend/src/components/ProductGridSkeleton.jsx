import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '2rem',
      padding: '2rem 0'
    }}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
      
      <style jsx>{`
        @media (max-width: 768px) {
          div {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
