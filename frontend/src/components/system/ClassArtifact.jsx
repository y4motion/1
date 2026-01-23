/**
 * ClassArtifact.jsx
 * Ghost Protocol - Phase 2: Visual Identity
 * 
 * Minimalist geometric abstractions for Neural Pathway classes:
 * - ARCHITECT: Isometric wireframe cube
 * - BROKER: Two intersecting parabolas (trade flows)
 * - OBSERVER: Schematic eye with crosshairs
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

// Isometric Wireframe Cube for Architect
const IsometricCubeIcon = ({ color, size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    className="class-icon architect-icon"
  >
    {/* Back edges */}
    <path
      d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.3"
      fill="none"
    />
    {/* Front face - bottom */}
    <path
      d="M4 7L12 12L20 7"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Vertical center line */}
    <path
      d="M12 12V22"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Left edge */}
    <path
      d="M4 7V17L12 22"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Right edge */}
    <path
      d="M20 7V17L12 22"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Top face */}
    <path
      d="M12 2L20 7L12 12L4 7L12 2Z"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Inner cube wireframe (smaller) */}
    <path
      d="M12 5L16 7.5V12.5L12 15L8 12.5V7.5L12 5Z"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.5"
      strokeDasharray="1 1"
      fill="none"
    />
  </svg>
);

// Two Intersecting Parabolas for Broker (Trade Flows)
const ParabolasIcon = ({ color, size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    className="class-icon broker-icon"
  >
    {/* First parabola - ascending curve */}
    <path
      d="M2 20C2 20 6 4 12 4C18 4 22 20 22 20"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Second parabola - descending curve (inverted) */}
    <path
      d="M2 4C2 4 6 20 12 20C18 20 22 4 22 4"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Intersection point highlight */}
    <circle
      cx="12"
      cy="12"
      r="2"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Center dot */}
    <circle
      cx="12"
      cy="12"
      r="0.8"
      fill={color}
    />
    {/* Flow arrows */}
    <path
      d="M7 8L9 6M17 8L15 6"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.6"
    />
    <path
      d="M7 16L9 18M17 16L15 18"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.6"
    />
  </svg>
);

// Schematic Eye with Crosshairs for Observer
const SchematicEyeIcon = ({ color, size }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    className="class-icon observer-icon"
  >
    {/* Outer eye shape */}
    <path
      d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    {/* Iris circle */}
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
    {/* Crosshair - vertical */}
    <line
      x1="12" y1="2" x2="12" y2="6"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.5"
    />
    <line
      x1="12" y1="18" x2="12" y2="22"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.5"
    />
    {/* Crosshair - horizontal */}
    <line
      x1="2" y1="12" x2="6" y2="12"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.5"
    />
    <line
      x1="18" y1="12" x2="22" y2="12"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.5"
    />
    {/* Corner brackets */}
    <path
      d="M4 8L4 6L6 6"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.4"
      fill="none"
    />
    <path
      d="M20 8L20 6L18 6"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.4"
      fill="none"
    />
    <path
      d="M4 16L4 18L6 18"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.4"
      fill="none"
    />
    <path
      d="M20 16L20 18L18 18"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.4"
      fill="none"
    />
  </svg>
);

const ICONS = {
  architect: IsometricCubeIcon,
  broker: ParabolasIcon,
  observer: SchematicEyeIcon
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
