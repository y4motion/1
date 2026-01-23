/**
 * HolographicID.jsx
 * Ghost Protocol - Phase 2: Visual Identity
 * 
 * Digital Passport / Profile Card featuring:
 * - UserResonance avatar with Trust Halo
 * - Spider/Radar Chart for stats (recharts)
 * - 3D tilt effect on hover (react-tilt)
 * - Glass morphism design
 * - QR Code placeholder
 */

import React, { useMemo } from 'react';
import { Tilt } from 'react-tilt';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { UserResonance } from './UserResonance';
import { ClassArtifact, ClassBadge } from './ClassArtifact';
import './HolographicID.css';

// Hierarchy labels
const HIERARCHY_LABELS = {
  ghost: 'GHOST',
  phantom: 'PHANTOM',
  operator: 'OPERATOR',
  monarch: 'MONARCH'
};

// Get hierarchy from level
const getHierarchy = (level) => {
  if (level >= 80) return 'monarch';
  if (level >= 40) return 'operator';
  if (level >= 10) return 'phantom';
  return 'ghost';
};

// Format numbers with commas
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-US');
};

// Generate pseudo-random QR pattern
const QRPattern = ({ seed = '0x0000' }) => {
  const cells = useMemo(() => {
    const result = [];
    const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    for (let i = 0; i < 64; i++) {
      result.push((hash * (i + 1) * 7) % 3 !== 0);
    }
    return result;
  }, [seed]);

  return (
    <div className="qr-pattern" data-testid="qr-pattern">
      {cells.map((filled, i) => (
        <div 
          key={i} 
          className={`qr-cell ${filled ? 'filled' : ''}`}
        />
      ))}
    </div>
  );
};

// Progress bar component
const SyncBar = ({ value = 0, label = 'SYNC' }) => (
  <div className="sync-bar-container">
    <div className="sync-bar-track">
      <div 
        className="sync-bar-fill" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    <span className="sync-label">{label}: {Math.round(value)}%</span>
  </div>
);

export const HolographicID = ({
  user = {},
  variant = 'full', // 'full' | 'compact' | 'mini'
  showStats = true,
  showQR = true,
  className = '',
  onClick,
  style = {}
}) => {
  const {
    username = 'GHOST_USER',
    avatarUrl,
    level = 1,
    xp = 0,
    trustScore = 500,
    rpBalance = 0,
    classType = null,
    classTier = 0,
    stats = {},
    registeredAt,
    userId = '0x0000'
  } = user;

  const hierarchy = getHierarchy(level);
  const hierarchyLabel = HIERARCHY_LABELS[hierarchy];
  
  // Calculate sync percentage (XP progress to next level, simplified)
  const syncPercent = useMemo(() => {
    const baseXP = Math.pow(level, 2) * 100;
    const nextXP = Math.pow(level + 1, 2) * 100;
    const progress = ((xp - baseXP) / (nextXP - baseXP)) * 100;
    return Math.min(100, Math.max(0, progress || 50));
  }, [level, xp]);

  // Radar chart data
  const radarData = useMemo(() => [
    { stat: 'SPD', value: stats.speed ?? 50, fullMark: 100 },
    { stat: 'TRS', value: Math.min(100, trustScore / 10), fullMark: 100 },
    { stat: 'COM', value: stats.comm ?? 50, fullMark: 100 },
    { stat: 'TCH', value: stats.tech ?? 50, fullMark: 100 }
  ], [stats, trustScore]);

  // Format registration date
  const estDate = useMemo(() => {
    if (!registeredAt) return '----.--.--';
    const date = new Date(registeredAt);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [registeredAt]);

  const tiltOptions = {
    max: 15,
    perspective: 1000,
    scale: 1.02,
    speed: 1000,
    glare: true,
    'max-glare': 0.2
  };

  // Mini variant - just avatar and basic info
  if (variant === 'mini') {
    return (
      <div 
        className={`holographic-id id-mini ${className}`}
        onClick={onClick}
        data-testid="holographic-id-mini"
      >
        <UserResonance trustScore={trustScore} size="sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="id-avatar-img" />
          ) : (
            <div className="id-avatar-placeholder">{username.charAt(0)}</div>
          )}
        </UserResonance>
        <div className="id-mini-info">
          <span className="id-mini-name">{username}</span>
          <span className="id-mini-level">Lv.{level}</span>
        </div>
      </div>
    );
  }

  // Compact variant - card without stats chart
  if (variant === 'compact') {
    return (
      <Tilt options={{ ...tiltOptions, max: 10 }}>
        <div 
          className={`holographic-id id-compact hierarchy-${hierarchy} ${className}`}
          onClick={onClick}
          data-testid="holographic-id-compact"
          style={style}
        >
          <div className="id-glass-layer" />
          <div className="id-noise-layer" />
          
          <div className="id-compact-content">
            <UserResonance trustScore={trustScore} size="md">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="id-avatar-img" />
              ) : (
                <div className="id-avatar-placeholder">{username.charAt(0)}</div>
              )}
            </UserResonance>
            
            <div className="id-compact-details">
              <span className="id-username">{username}</span>
              <span className="id-title">
                Level {level} {hierarchyLabel}
                {classType && <> • <ClassBadge classType={classType} /></>}
              </span>
            </div>

            <div className="id-compact-metrics">
              <span>TS: {trustScore}</span>
              <span>RP: {formatNumber(rpBalance)}</span>
            </div>
          </div>
        </div>
      </Tilt>
    );
  }

  // Full variant - complete card with all features
  return (
    <Tilt options={tiltOptions}>
      <div 
        className={`holographic-id id-full hierarchy-${hierarchy} ${className}`}
        onClick={onClick}
        data-testid="holographic-id-full"
        style={style}
      >
        {/* Glass layers */}
        <div className="id-glass-layer" />
        <div className="id-noise-layer" />
        <div className="id-grid-layer" />
        
        {/* Scanline effect */}
        <div className="id-scanline" />

        {/* Content */}
        <div className="id-content">
          {/* Header Section */}
          <div className="id-header">
            <div className="id-avatar-section">
              <UserResonance trustScore={trustScore} size="lg" showLabel>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={username} className="id-avatar-img" />
                ) : (
                  <div className="id-avatar-placeholder">{username.charAt(0)}</div>
                )}
              </UserResonance>
            </div>

            <div className="id-header-info">
              <h3 className="id-username" data-testid="id-username">{username}</h3>
              <div className="id-title-row">
                <span className="id-level">Level {level}</span>
                <span className="id-hierarchy">{hierarchyLabel}</span>
                {classType && (
                  <ClassArtifact 
                    classType={classType} 
                    size="sm" 
                    showLabel 
                    showGlow={false}
                  />
                )}
              </div>
              {classTier > 0 && (
                <span className="id-class-tier">CLASS TIER: {classTier}/100</span>
              )}
            </div>
          </div>

          {/* Stats Section */}
          {showStats && (
            <div className="id-stats-section">
              <div className="id-radar-container">
                <ResponsiveContainer width="100%" height={120}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid 
                      stroke="rgba(255,255,255,0.1)" 
                      strokeWidth={0.5}
                    />
                    <PolarAngleAxis 
                      dataKey="stat" 
                      tick={{ 
                        fill: 'rgba(255,255,255,0.5)', 
                        fontSize: 9,
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="var(--ghost-cyan, #00FFD4)"
                      fill="var(--ghost-cyan, #00FFD4)"
                      fillOpacity={0.15}
                      strokeWidth={1}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="id-metrics-column">
                <div className="id-metric">
                  <span className="metric-label">XP</span>
                  <span className="metric-value" data-testid="id-xp">{formatNumber(xp)}</span>
                </div>
                <div className="id-metric">
                  <span className="metric-label">TS</span>
                  <span className="metric-value trust-value" data-testid="id-ts">{trustScore}</span>
                </div>
                <div className="id-metric">
                  <span className="metric-label">RP</span>
                  <span className="metric-value" data-testid="id-rp">{formatNumber(rpBalance)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sync Bar */}
          <SyncBar value={syncPercent} />

          {/* Footer */}
          <div className="id-footer">
            {showQR && <QRPattern seed={userId} />}
            <span className="id-est-date">EST. {estDate}</span>
          </div>
        </div>

        {/* Border glow based on hierarchy */}
        <div className="id-border-glow" />
      </div>
    </Tilt>
  );
};

// Export sub-components for flexibility
export { QRPattern, SyncBar };
export default HolographicID;
