/**
 * ClassArtifact.jsx
 * Ghost Protocol - Phase 2: Visual Identity
 * 
 * Minimalist SVG icons for Neural Pathway classes:
 * - ARCHITECT (⬡ Hexagon) - Blueprint overlay style
 * - BROKER (◇ Diamond) - Trade/value style  
 * - OBSERVER (◉ Eye) - Verification style
 */

import React from 'react';
import './ClassArtifact.css';

const CLASS_CONFIG = {
  architect: {
    label: 'ARCHITECT',
    description: 'Сборщик',
    color: 'var(--ghost-cyan, #00FFD4)',
    secondaryColor: 'rgba(0, 255, 212, 0.2)'
  },
  broker: {
    label: 'BROKER',
    description: 'Трейдер',
    color: 'var(--ghost-amber, #FF9F43)',
    secondaryColor: 'rgba(255, 159, 67, 0.2)'
  },
  observer: {
    label: 'OBSERVER',
    description: 'Критик',
    color: 'var(--ghost-void-blue, #2E5CFF)',
    secondaryColor: 'rgba(46, 92, 255, 0.2)'
  }
};

// Hexagon Icon for Architect
const HexagonIcon = ({ color, size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    className="class-icon"
  >
    <path
      d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M12 6L17 9V15L12 18L7 15V9L12 6Z"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.5"
      fill="none"
    />
    {/* Blueprint grid lines */}
    <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
    <line x1="2.5" y1="12" x2="21.5" y2="12" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
  </svg>
);

// Diamond Icon for Broker
const DiamondIcon = ({ color, size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    className="class-icon"
  >
    <path
      d="M12 2L22 12L12 22L2 12L12 2Z"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M12 6L18 12L12 18L6 12L12 6Z"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.5"
      fill="none"
    />
    {/* Value lines */}
    <line x1="7" y1="7" x2="17" y2="17" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
    <line x1="17" y1="7" x2="7" y2="17" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
  </svg>
);

// Eye Icon for Observer
const EyeIcon = ({ color, size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    className="class-icon"
  >
    {/* Outer eye shape */}
    <path
      d="M12 5C6 5 2 12 2 12C2 12 6 19 12 19C18 19 22 12 22 12C22 12 18 5 12 5Z"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Iris */}
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Pupil */}
    <circle
      cx="12"
      cy="12"
      r="1.5"
      fill={color}
    />
    {/* Scan line */}
    <line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="0.3" strokeOpacity="0.4" strokeDasharray="2 2" />
  </svg>
);

const ICONS = {
  architect: HexagonIcon,
  broker: DiamondIcon,
  observer: EyeIcon
};

export const ClassArtifact = ({
  classType,
  size = 'md',
  showLabel = false,
  showGlow = true,
  animated = true,
  className = '',
  style = {}
}) => {
  if (!classType || !CLASS_CONFIG[classType]) {
    return null;
  }

  const config = CLASS_CONFIG[classType];
  const IconComponent = ICONS[classType];
  
  const sizeMap = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 48
  };

  const pixelSize = sizeMap[size] || sizeMap.md;

  return (
    <div 
      className={`
        class-artifact 
        artifact-${classType}
        artifact-${size}
        ${showGlow ? 'with-glow' : ''}
        ${animated ? 'animated' : ''}
        ${className}
      `}
      style={{
        '--artifact-color': config.color,
        '--artifact-secondary': config.secondaryColor,
        '--artifact-size': `${pixelSize}px`,
        ...style
      }}
      data-testid={`class-artifact-${classType}`}
      title={`${config.label} — ${config.description}`}
    >
      <div className="artifact-icon-wrapper">
        <IconComponent color={config.color} size={pixelSize} />
      </div>
      
      {showLabel && (
        <span className="artifact-label">
          {config.label}
        </span>
      )}
    </div>
  );
};

// Badge variant for inline use
export const ClassBadge = ({ classType, className = '' }) => {
  if (!classType || !CLASS_CONFIG[classType]) return null;
  
  const config = CLASS_CONFIG[classType];
  
  return (
    <span 
      className={`class-badge badge-${classType} ${className}`}
      style={{ '--badge-color': config.color }}
      data-testid={`class-badge-${classType}`}
    >
      <ClassArtifact classType={classType} size="xs" showGlow={false} animated={false} />
      <span className="badge-text">{config.label}</span>
    </span>
  );
};

// Export config for external use
export { CLASS_CONFIG };
export default ClassArtifact;
