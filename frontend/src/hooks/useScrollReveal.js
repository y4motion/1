import { useEffect, useRef } from 'react';

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

export default useScrollReveal;
