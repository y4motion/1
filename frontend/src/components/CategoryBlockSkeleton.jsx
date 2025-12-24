import React from 'react';
import Skeleton from './Skeleton';

export default function CategoryBlockSkeleton() {
  return (
    <div style={{
      aspectRatio: '1 / 1',
      width: '100%',
      borderRadius: '3px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background */}
      <Skeleton width="100%" height="100%" borderRadius="3px" />
      
      {/* Title overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%'
      }}>
        <Skeleton width="100%" height="32px" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );
}
