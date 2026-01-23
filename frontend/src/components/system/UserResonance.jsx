/**
 * UserResonance.jsx
 * Ghost Protocol - Phase 2: Visual Identity
 * 
 * Visual wrapper for user avatars that reflects Trust Score through:
 * - CSS filters (grayscale, contrast, brightness)
 * - Dynamic backlight/glow effects
 * - Breathing animations for high trust
 * - Glitch effects for low trust
 */

import React, { useMemo } from 'react';
import './UserResonance.css';

/**
 * Trust Score Tiers:
 * > 800: Photon Echo (Cyan glow, breathing animation) - "Verified"
 * 500-800: Ghost State (White subtle glow) - "Neutral"
 * 400-500: Warning Signal (Orange glow) - "Suspect"
 * < 400: Glitch Anomaly (Red, distorted) - "Danger"
 * < 200: Critical Corruption (Heavy glitch, near invisible)
 */

const getTrustTier = (trustScore) => {
  if (trustScore >= 800) return 'photon';
  if (trustScore >= 500) return 'ghost';
  if (trustScore >= 400) return 'warning';
  if (trustScore >= 200) return 'glitch';
  return 'corrupted';
};

const getTrustConfig = (trustScore) => {
  const tier = getTrustTier(trustScore);
  
  const configs = {
    photon: {
      tier,
      label: 'VERIFIED',
      haloColor: 'var(--halo-verified, #00FFD4)',
      glowIntensity: 0.8,
      filters: {
        grayscale: 0,
        contrast: 1.1,
        brightness: 1.05,
        saturate: 1.1
      },
      animation: 'breathing',
      glitchLevel: 0
    },
    ghost: {
      tier,
      label: 'NEUTRAL',
      haloColor: 'var(--halo-neutral, rgba(255, 255, 255, 0.4))',
      glowIntensity: 0.3,
      filters: {
        grayscale: 0,
        contrast: 1,
        brightness: 1,
        saturate: 1
      },
      animation: 'none',
      glitchLevel: 0
    },
    warning: {
      tier,
      label: 'SUSPECT',
      haloColor: 'var(--halo-warning, #FF9F43)',
      glowIntensity: 0.5,
      filters: {
        grayscale: 0.2,
        contrast: 0.95,
        brightness: 0.95,
        saturate: 0.9
      },
      animation: 'pulse-warning',
      glitchLevel: 1
    },
    glitch: {
      tier,
      label: 'ANOMALY',
      haloColor: 'var(--halo-danger, #FF4444)',
      glowIntensity: 0.6,
      filters: {
        grayscale: 0.4,
        contrast: 1.2,
        brightness: 0.85,
        saturate: 0.7
      },
      animation: 'glitch',
      glitchLevel: 2
    },
    corrupted: {
      tier,
      label: 'CORRUPTED',
      haloColor: 'var(--halo-danger, #FF4444)',
      glowIntensity: 0.4,
      filters: {
        grayscale: 0.7,
        contrast: 1.4,
        brightness: 0.6,
        saturate: 0.3
      },
      animation: 'heavy-glitch',
      glitchLevel: 3
    }
  };
  
  return configs[tier];
};

export const UserResonance = ({
  children,
  trustScore = 500,
  size = 'md',
  showHalo = true,
  showLabel = false,
  className = '',
  onClick,
  style = {}
}) => {
  const config = useMemo(() => getTrustConfig(trustScore), [trustScore]);
  
  const filterStyle = useMemo(() => ({
    filter: `
      grayscale(${config.filters.grayscale})
      contrast(${config.filters.contrast})
      brightness(${config.filters.brightness})
      saturate(${config.filters.saturate})
    `.trim()
  }), [config]);

  const sizeClasses = {
    xs: 'resonance-xs',
    sm: 'resonance-sm',
    md: 'resonance-md',
    lg: 'resonance-lg',
    xl: 'resonance-xl'
  };

  return (
    <div 
      className={`
        user-resonance 
        ${sizeClasses[size]} 
        resonance-${config.tier}
        ${config.animation !== 'none' ? `animate-${config.animation}` : ''}
        ${className}
      `}
      onClick={onClick}
      style={{
        '--halo-color': config.haloColor,
        '--glow-intensity': config.glowIntensity,
        '--glitch-level': config.glitchLevel,
        ...style
      }}
      data-testid="user-resonance"
      data-trust-tier={config.tier}
    >
      {/* Halo Ring */}
      {showHalo && (
        <div className="resonance-halo" data-testid="resonance-halo" />
      )}
      
      {/* Avatar Container with filters */}
      <div className="resonance-avatar" style={filterStyle}>
        {children}
      </div>
      
      {/* Glitch Overlay for low trust */}
      {config.glitchLevel > 0 && (
        <div 
          className={`resonance-glitch-overlay glitch-level-${config.glitchLevel}`}
          data-testid="resonance-glitch"
        />
      )}
      
      {/* Trust Label */}
      {showLabel && (
        <span className="resonance-label" data-testid="resonance-label">
          {config.label}
        </span>
      )}
    </div>
  );
};

// Compact version for lists/chat
export const UserResonanceCompact = ({ 
  avatarUrl, 
  username, 
  trustScore = 500,
  size = 'sm',
  ...props 
}) => {
  return (
    <UserResonance trustScore={trustScore} size={size} {...props}>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={username || 'User'} 
          className="resonance-img"
        />
      ) : (
        <div className="resonance-placeholder">
          {username?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </UserResonance>
  );
};

// Export utilities
export { getTrustTier, getTrustConfig };
export default UserResonance;
