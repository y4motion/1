import React from 'react';

export function Skeleton({ width, height, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '1000px 100%',
        animation: 'shimmer 2s infinite linear',
        borderRadius: '8px',
        ...style
      }}
    />
  );
}

export function CardSkeleton({ className = '' }) {
  return (
    <div 
      className={className}
      style={{ 
        padding: '2rem', 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <Skeleton width="60%" height="24px" style={{ marginBottom: '1rem' }} />
      <Skeleton width="100%" height="16px" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="80%" height="16px" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px'
          }}
        >
          <Skeleton width="40px" height="40px" style={{ borderRadius: '8px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton width="70%" height="16px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="40%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
