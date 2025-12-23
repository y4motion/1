import React from 'react';
import Skeleton from './Skeleton';

export default function ProductCardSkeleton() {
  return (
    <div style={{
      background: 'rgb(10, 10, 10)',
      borderRadius: '3px',
      overflow: 'hidden'
    }}>
      {/* Image skeleton */}
      <Skeleton width="100%" height="280px" borderRadius="0" />
      
      {/* Content skeleton */}
      <div style={{ padding: '1.5rem' }}>
        {/* Category */}
        <Skeleton width="80px" height="12px" style={{ marginBottom: '0.5rem' }} />
        
        {/* Title */}
        <Skeleton width="100%" height="18px" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="70%" height="18px" style={{ marginBottom: '1rem' }} />
        
        {/* Description */}
        <Skeleton width="100%" height="14px" style={{ marginBottom: '0.25rem' }} />
        <Skeleton width="90%" height="14px" style={{ marginBottom: '1rem' }} />
        
        {/* Price */}
        <Skeleton width="100px" height="24px" />
      </div>
    </div>
  );
}
