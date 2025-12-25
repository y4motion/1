import { useEffect, useRef } from 'react';

/**
 * Hook для анимации появления элементов при скролле
 */
export function useScrollReveal(options = {}) {
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observerOptions = {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (options.once !== false) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, options.once]);
  
  return elementRef;
}

/**
 * Hook для staggered анимации детей
 */
export function useStaggerReveal(childSelector = '.stagger-item', delay = 100) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll(childSelector);
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('is-visible');
            }, index * delay);
          });
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(container);
    
    return () => observer.disconnect();
  }, [childSelector, delay]);
  
  return containerRef;
}

export default useScrollReveal;
