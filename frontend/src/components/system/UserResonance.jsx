/**
 * UserResonance.jsx
 * Ghost Protocol - Phase 2: Visual Identity
 * 
 * PHILOSOPHY: Trust Score = Signal Stability Coefficient
 * High trust = Clean signal, perfect focus, soft backlight
 * Low trust = Interference, noise, color loss, unstable projection
 */

import React, { useMemo } from 'react';
import './UserResonance.css';

/**
 * Trust Score States (Signal Quality):
 * > 800: PHOTON ECHO - Crystal clarity, diffuse backlight, laser connection line
 * 500-799: STANDARD PROJECTION - Normal quality, no effects
 * 400-499: SIGNAL DECAY - Grayscale, noise texture overlay
 * 200-399: GLITCH ANOMALY - RGB split, jitter animation
 * < 200: CRITICAL CORRUPTION - Heavy distortion, near invisible
 */

const getTrustTier = (trustScore) => {
  if (trustScore >= 800) return 'photon';
  if (trustScore >= 500) return 'neutral';
  if (trustScore >= 400) return 'decay';
  if (trustScore >= 200) return 'glitch';
  return 'corrupted';
};

const getTrustConfig = (trustScore) => {
  const tier = getTrustTier(trustScore);
  
  const configs = {
    photon: {
      tier,
      label: 'VERIFIED',
      // Diffuse volumetric backlight - NOT a ring
      backlightColor: 'rgba(34, 211, 238, 0.3)',
      backlightSpread: 40,
      filters: {
        grayscale: 0,
        contrast: 1.1,
        brightness: 1.1,
        saturate: 1.15
      },
      showLaserLine: true,
      showNoiseOverlay: false,
      rgbSplit: 0,
      glitchIntensity: 0
    },
    neutral: {
      tier,
      label: 'STANDARD',
      backlightColor: 'transparent',
      backlightSpread: 0,
      filters: {
        grayscale: 0,
        contrast: 1,
        brightness: 1,
        saturate: 1
      },
      showLaserLine: false,
      showNoiseOverlay: false,
      rgbSplit: 0,
      glitchIntensity: 0
    },
    decay: {
      tier,
      label: 'SUSPECT',
      backlightColor: 'rgba(255, 159, 67, 0.15)',
      backlightSpread: 20,
      filters: {
        grayscale: 0.8,
        contrast: 1.2,
        brightness: 0.7,
        saturate: 0.4
      },
      showLaserLine: false,
      showNoiseOverlay: true,
      rgbSplit: 0,
      glitchIntensity: 0
    },
    glitch: {
      tier,
      label: 'ANOMALY',
      backlightColor: 'rgba(255, 68, 68, 0.2)',
      backlightSpread: 15,
      filters: {
        grayscale: 0.5,
        contrast: 1.3,
        brightness: 0.75,
        saturate: 0.5
      },
      showLaserLine: false,
      showNoiseOverlay: true,
      rgbSplit: 2,
      glitchIntensity: 1
    },
    corrupted: {
      tier,
      label: 'CORRUPTED',
      backlightColor: 'rgba(255, 68, 68, 0.15)',
      backlightSpread: 10,
      filters: {
        grayscale: 0.9,
        contrast: 1.5,
        brightness: 0.5,
        saturate: 0.2
      },
      showLaserLine: false,
      showNoiseOverlay: true,
      rgbSplit: 4,
      glitchIntensity: 2
    }
  };
  
  return configs[tier];
};

// Noise texture SVG for Signal Decay effect
const NoiseOverlay = () => (
  <svg className="noise-overlay" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <filter id="noiseFilter">
      <feTurbulence 
        type="fractalNoise" 
        baseFrequency="0.9" 
        numOctaves="4" 
        stitchTiles="stitch"
      />
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.15"/>
  </svg>
);

// Laser connection line for Photon Echo
const LaserLine = () => (
  <div className="laser-line" data-testid="laser-line" />
);

// RGB Split layers for Glitch effect
const RGBSplitLayer = ({ offset, channel }) => (
  <div 
    className={`rgb-split-layer rgb-${channel}`}
    style={{ '--rgb-offset': `${offset}px` }}
  />
);

export const UserResonance = ({
  children,
  trustScore = 500,
  size = 'md',
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
        ${config.glitchIntensity > 0 ? `glitch-intensity-${config.glitchIntensity}` : ''}
        ${className}
      `}
      onClick={onClick}
      style={{
        '--backlight-color': config.backlightColor,
        '--backlight-spread': `${config.backlightSpread}px`,
        '--rgb-split': `${config.rgbSplit}px`,
        ...style
      }}
      data-testid="user-resonance"
      data-trust-tier={config.tier}
    >
      {/* Diffuse Backlight - volumetric glow from behind, NOT a ring */}
      <div className="resonance-backlight" data-testid="resonance-backlight" />
      
      {/* Avatar Container with filters */}
      <div className="resonance-avatar" style={filterStyle}>
        {children}
        
        {/* RGB Split effect for glitch states */}
        {config.rgbSplit > 0 && (
          <>
            <RGBSplitLayer offset={config.rgbSplit} channel="red" />
            <RGBSplitLayer offset={-config.rgbSplit} channel="cyan" />
          </>
        )}
      </div>
      
      {/* Noise Texture Overlay for Signal Decay */}
      {config.showNoiseOverlay && <NoiseOverlay />}
      
      {/* Laser Connection Line for Photon Echo */}
      {config.showLaserLine && <LaserLine />}
      
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
