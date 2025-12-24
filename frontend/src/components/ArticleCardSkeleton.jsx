import React from 'react';
import Skeleton from './Skeleton';

export default function ArticleCardSkeleton() {
  return (
    <div className="article-card-skeleton">
      {/* Cover image */}
      <Skeleton width="100%" height="200px" borderRadius="12px 12px 0 0" />
      
      <div className="skeleton-content">
        {/* Category & read time */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Skeleton width="80px" height="14px" />
          <Skeleton width="60px" height="14px" />
        </div>
        
        {/* Title */}
        <Skeleton width="100%" height="24px" className="mt-1" />
        <Skeleton width="80%" height="24px" />
        
        {/* Excerpt */}
        <Skeleton width="100%" height="16px" className="mt-1" />
        <Skeleton width="100%" height="16px" />
        <Skeleton width="60%" height="16px" />
        
        {/* Author info */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <Skeleton width="40px" height="40px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width="120px" height="16px" />
            <Skeleton width="80px" height="14px" className="mt-05" />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .article-card-skeleton {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .skeleton-content {
          padding: 1.5rem;
        }
        
        .mt-1 {
          margin-top: 1rem;
        }
        
        .mt-05 {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
