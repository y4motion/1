import React, { useState, useEffect, useRef } from 'react';

export default function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height,
  className,
  style,
  priority = false,
  onClick
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef();

  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Load 100px before entering viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Get optimized URL (WebP if supported)
  const getOptimizedUrl = (url) => {
    if (!url) return url;
    
    // For Unsplash images, use their optimization params
    if (url.includes('unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format'); // Auto WebP
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('q', '80'); // Quality 80%
      return urlObj.toString();
    }
    
    return url;
  };

  const optimizedSrc = getOptimizedUrl(src);

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-wrapper ${className || ''}`}
      style={{ 
        width: width || '100%', 
        height: height || 'auto',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      onClick={onClick}
    >
      {/* Blur placeholder while loading */}
      {!isLoaded && isInView && (
        <div 
          className="image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
            backdropFilter: 'blur(10px)',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>
    </div>
  );
}
