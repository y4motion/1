/**
 * LabSlider.jsx
 * Swipeable concept prints slider
 * Drag to browse, click to vote
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { KineticWidget, DotText } from './KineticWidget';
import { systemToast } from '../system';

const MOCK_CONCEPTS = [
  { id: 1, name: 'VOID CARPET', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300', votes: 847 },
  { id: 2, name: 'SIGNAL RUG', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300', votes: 623 },
  { id: 3, name: 'MONO SLEEVE', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300', votes: 512 },
  { id: 4, name: 'ECHO PAD', image: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=300', votes: 401 },
  { id: 5, name: 'GHOST MAT', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300', votes: 289 },
];

export const LabSlider = ({ 
  concepts = MOCK_CONCEPTS,
  onVote,
  className = ''
}) => {
  const sliderRef = useRef(null);
  
  const handleVote = (concept) => {
    systemToast.rp(5);
    onVote?.(concept.id);
  };
  
  return (
    <KineticWidget className={`lab-slider-widget ${className}`}>
      <div className="lab-slider">
        <div style={{ marginBottom: 16 }}>
          <DotText size="sm" color="muted">CONCEPT LAB</DotText>
        </div>
        
        <motion.div 
          ref={sliderRef}
          className="slider-track"
          drag="x"
          dragConstraints={sliderRef}
          dragElastic={0.1}
        >
          {concepts.map(concept => (
            <motion.div
              key={concept.id}
              className="slider-item"
              onClick={() => handleVote(concept)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src={concept.image} 
                alt={concept.name}
                className="slider-image"
                draggable={false}
              />
              <DotText size="xs" className="slider-name">
                {concept.name}
              </DotText>
              <DotText size="xs" color="muted" style={{ display: 'block', textAlign: 'center' }}>
                {concept.votes} votes
              </DotText>
            </motion.div>
          ))}
        </motion.div>
        
        <p className="slider-hint">← DRAG TO BROWSE →</p>
      </div>
    </KineticWidget>
  );
};

export default LabSlider;
