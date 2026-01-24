/**
 * Ghost Protocol - System Components
 * Phase 2: Visual Identity + Phase 3: System Voice
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

// System notifications (Phase 3)
export {
  SystemToastContainer,
  systemToast
} from './SystemToast';

// Audio immersion (Phase 3)
export {
  playToastClick,
  playAccessGranted,
  playVoidOpen,
  playAccessDenied,
  playHoverBlip,
  playSystemChime
} from './SystemAudio';

// Default exports for convenience
export { default as UserResonanceDefault } from './UserResonance';
export { default as ClassArtifactDefault } from './ClassArtifact';
export { default as HolographicIDDefault } from './HolographicID';
export { default as SystemToastDefault } from './SystemToast';

// Neural Interface (Neural Hub Menu System)
export { NeuralHub } from './NeuralHub';
export { CorePulse } from './CorePulse';
export { default as NeuralHubDefault } from './NeuralHub';
export { default as CorePulseDefault } from './CorePulse';

// Atmospheric Background (Acrylic Ghost Style)
export { AtmosphericBackground } from './AtmosphericBackground';
export { default as AtmosphericBackgroundDefault } from './AtmosphericBackground';
