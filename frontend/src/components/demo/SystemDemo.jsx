/**
 * SystemDemo.jsx
 * Ghost Protocol - Phase 2 Demo Page
 * Showcases all Visual Identity components
 */

import React, { useState } from 'react';
import { 
  UserResonance, 
  UserResonanceCompact,
  ClassArtifact, 
  ClassBadge,
  HolographicID 
} from '../system';
import './SystemDemo.css';

// Signal Quality States demo users
const DEMO_USERS = [
  {
    id: '0x7F3A',
    username: 'PHOTON_ECHO',
    level: 85,
    xp: 1650000,
    trustScore: 920,
    rpBalance: 54000,
    classType: 'architect',
    classTier: 78,
    registeredAt: '2024-01-15',
    stats: { speed: 85, comm: 72, tech: 95 },
    signalState: 'PHOTON ECHO — Crystal clarity, diffuse backlight'
  },
  {
    id: '0x4B2C',
    username: 'STANDARD_SIG',
    level: 55,
    xp: 120000,
    trustScore: 650,
    rpBalance: 12400,
    classType: 'broker',
    classTier: 45,
    registeredAt: '2024-06-20',
    stats: { speed: 70, comm: 85, tech: 60 },
    signalState: 'STANDARD — Normal projection'
  },
  {
    id: '0x9D1E',
    username: 'SIGNAL_DECAY',
    level: 25,
    xp: 8500,
    trustScore: 420,
    rpBalance: 2100,
    classType: 'observer',
    classTier: 12,
    registeredAt: '2024-09-10',
    stats: { speed: 50, comm: 65, tech: 55 },
    signalState: 'SIGNAL DECAY — Grayscale, noise texture'
  },
  {
    id: '0x2F8A',
    username: 'GLITCH_USER',
    level: 18,
    xp: 3200,
    trustScore: 280,
    rpBalance: 800,
    classType: null,
    classTier: 0,
    registeredAt: '2024-11-05',
    stats: { speed: 40, comm: 35, tech: 45 },
    signalState: 'GLITCH ANOMALY — RGB split, jitter'
  },
  {
    id: '0x0BAD',
    username: 'CORRUPTED',
    level: 5,
    xp: 400,
    trustScore: 120,
    rpBalance: 0,
    classType: null,
    classTier: 0,
    registeredAt: '2025-01-01',
    stats: { speed: 15, comm: 10, tech: 20 },
    signalState: 'CORRUPTED — Heavy distortion, near invisible'
  }
];

const SystemDemo = () => {
  const [selectedUser, setSelectedUser] = useState(DEMO_USERS[0]);
  const [trustSlider, setTrustSlider] = useState(500);

  return (
    <div className="system-demo" data-testid="system-demo-page">
      <header className="demo-header">
        <h1 className="demo-title">GHOST RESONANCE</h1>
        <p className="demo-subtitle">Phase 2: Signal Quality Visualization</p>
        <p className="demo-philosophy">Trust = Коэффициент Стабильности Сигнала</p>
      </header>

      {/* Section 1: User Resonance - Signal States */}
      <section className="demo-section">
        <h2 className="section-title">SIGNAL STATES</h2>
        <p className="section-desc">Физика света: Backlight, Noise, RGB-Split, Chromatic Aberration</p>
        
        <div className="resonance-grid">
          {DEMO_USERS.map(user => (
            <div 
              key={user.id} 
              className="resonance-demo-item"
              onClick={() => setSelectedUser(user)}
            >
              <UserResonance 
                trustScore={user.trustScore} 
                size="lg" 
                showLabel
              >
                <div className="demo-avatar">
                  {user.username.charAt(0)}
                </div>
              </UserResonance>
              <span className="resonance-demo-name">{user.username}</span>
              <span className="resonance-demo-trust">TS: {user.trustScore}</span>
              {user.signalState && (
                <span className="resonance-demo-state">{user.signalState}</span>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Trust Slider */}
        <div className="trust-slider-section">
          <h3 className="slider-title">INTERACTIVE TRUST DEMO</h3>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="1000"
              value={trustSlider}
              onChange={(e) => setTrustSlider(Number(e.target.value))}
              className="trust-slider"
            />
            <span className="slider-value">{trustSlider}</span>
          </div>
          <div className="slider-demo">
            <UserResonance trustScore={trustSlider} size="xl" showLabel>
              <div className="demo-avatar large">?</div>
            </UserResonance>
          </div>
        </div>
      </section>

      {/* Section 2: Class Artifacts */}
      <section className="demo-section">
        <h2 className="section-title">CLASS ARTIFACTS</h2>
        <p className="section-desc">Neural Pathway специализации</p>
        
        <div className="artifacts-grid">
          <div className="artifact-demo-item">
            <ClassArtifact classType="architect" size="xl" showLabel animated />
            <p className="artifact-desc">Сборщик — +25% XP за сборки</p>
          </div>
          <div className="artifact-demo-item">
            <ClassArtifact classType="broker" size="xl" showLabel animated />
            <p className="artifact-desc">Трейдер — -15% комиссия на Swap</p>
          </div>
          <div className="artifact-demo-item">
            <ClassArtifact classType="observer" size="xl" showLabel animated />
            <p className="artifact-desc">Критик — +50% RP за ревью</p>
          </div>
        </div>

        <div className="badges-row">
          <h3 className="badges-title">INLINE BADGES</h3>
          <div className="badges-container">
            <ClassBadge classType="architect" />
            <ClassBadge classType="broker" />
            <ClassBadge classType="observer" />
          </div>
        </div>
      </section>

      {/* Section 3: Holographic ID */}
      <section className="demo-section">
        <h2 className="section-title">HOLOGRAPHIC ID</h2>
        <p className="section-desc">Цифровой паспорт оператора</p>
        
        <div className="holoid-grid">
          <div className="holoid-demo-item">
            <h4 className="variant-label">FULL VARIANT</h4>
            <HolographicID 
              user={selectedUser}
              variant="full"
              showStats
              showQR
            />
          </div>
          
          <div className="holoid-demo-item">
            <h4 className="variant-label">COMPACT VARIANT</h4>
            <HolographicID 
              user={selectedUser}
              variant="compact"
            />
            
            <h4 className="variant-label" style={{ marginTop: '24px' }}>MINI VARIANT</h4>
            <HolographicID 
              user={selectedUser}
              variant="mini"
            />
          </div>
        </div>

        {/* User Selector */}
        <div className="user-selector">
          <h3 className="selector-title">SELECT USER TO PREVIEW</h3>
          <div className="selector-buttons">
            {DEMO_USERS.map(user => (
              <button
                key={user.id}
                className={`selector-btn ${selectedUser.id === user.id ? 'active' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                {user.username}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Compact Resonance */}
      <section className="demo-section">
        <h2 className="section-title">COMPACT RESONANCE</h2>
        <p className="section-desc">Для использования в списках и чатах</p>
        
        <div className="compact-demo-list">
          {DEMO_USERS.map(user => (
            <div key={user.id} className="compact-demo-row">
              <UserResonanceCompact
                username={user.username}
                trustScore={user.trustScore}
                size="sm"
              />
              <span className="compact-name">{user.username}</span>
              {user.classType && <ClassBadge classType={user.classType} />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SystemDemo;
