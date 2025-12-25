import { useEffect } from 'react';

export function useScrollRevealInit() {
  useEffect(() => {
    const initScrollReveal = () => {
      const elements = document.querySelectorAll('.scroll-reveal:not(.is-visible)');
      
      if (elements.length === 0) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );
      
      elements.forEach((el) => observer.observe(el));
      
      return () => observer.disconnect();
    };
    
    // Initial run
    const cleanup = initScrollReveal();
    
    // Re-run on DOM changes (for dynamically loaded content)
    const mutationObserver = new MutationObserver(() => {
      initScrollReveal();
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      cleanup?.();
      mutationObserver.disconnect();
    };
  }, []);
}

export default useScrollRevealInit;
