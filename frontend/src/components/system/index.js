/**
 * Ghost Protocol - System Components
 * Phase 2: Visual Identity
 * 
 * Export all system-level UI components for the Ghost Protocol
 */

// User visual identity
export { 
  UserResonance, 
  UserResonanceCompact,
  getTrustTier,
  getTrustConfig 
} from './UserResonance';

// Class/specialization artifacts
export { 
  ClassArtifact, 
  ClassBadge,
  CLASS_CONFIG 
} from './ClassArtifact';

// Holographic ID card
export { 
  HolographicID,
  QRPattern,
  SyncBar 
} from './HolographicID';

// Default exports for convenience
export { default as UserResonanceDefault } from './UserResonance';
export { default as ClassArtifactDefault } from './ClassArtifact';
export { default as HolographicIDDefault } from './HolographicID';
