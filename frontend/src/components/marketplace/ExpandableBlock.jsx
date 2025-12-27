import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './ExpandableBlock.css';

const ExpandableBlock = ({ title, children, defaultExpanded = false, icon }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`expandable-block ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="expandable-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="expandable-title">
          {icon && <span className="expandable-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <ChevronDown 
          size={18} 
          className={`expandable-chevron ${isExpanded ? 'rotated' : ''}`}
        />
      </button>
      
      {isExpanded && (
        <div className="expandable-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableBlock;
