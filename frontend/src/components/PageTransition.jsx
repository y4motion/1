import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  
  // Different animations for different routes
  const getAnimationVariants = (pathname) => {
    // Homepage gets fade only
    if (pathname === '/') {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }
    
    // Other pages get slide + fade
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    };
  };
  
  const variants = getAnimationVariants(location.pathname);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ 
          duration: 0.25, 
          ease: [0.4, 0, 0.2, 1] // cubic-bezier
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
