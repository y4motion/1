import React from 'react';
import Skeleton from './Skeleton';

export default function UserCardSkeleton() {
  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      {/* Rank */}
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      
      {/* Avatar */}
      <Skeleton width="48px" height="48px" borderRadius="50%" />
      
      {/* Info */}
      <div style={{ flex: 1 }}>
        <Skeleton width="120px" height="18px" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="80px" height="14px" />
      </div>
      
      {/* Score */}
      <div>
        <Skeleton width="60px" height="28px" />
      </div>
    </div>
  );
}
