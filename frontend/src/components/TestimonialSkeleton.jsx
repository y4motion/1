import React from 'react';
import Skeleton from './Skeleton';

export default function TestimonialSkeleton() {
  return (
    <div style={{
      backgroundColor: 'rgb(10, 10, 10)',
      borderRadius: '3px',
      padding: '1.5rem',
      minHeight: '190px',
      width: '500px',
      flexShrink: 0
    }}>
      {/* Review text - 3 lines */}
      <Skeleton width="100%" height="16px" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="100%" height="16px" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="70%" height="16px" style={{ marginBottom: '1.5rem' }} />
      
      {/* Author */}
      <Skeleton width="150px" height="14px" />
      
      {/* Stars */}
      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.75rem' }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} width="16px" height="16px" />
        ))}
      </div>
    </div>
  );
}
