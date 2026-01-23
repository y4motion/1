/**
 * Kinetic Dot-OS Components
 * Ghost OS Dashboard - Full Component Library
 */

// === BASE COMPONENTS ===
export { 
  KineticWidget, 
  DotText, 
  StatusDot, 
  DottedProgress,
  ExpandButton,
  springConfig,
  springBouncy
} from './KineticWidget';

// === EXISTING WIDGETS ===
export { ReviewDeck } from './ReviewDeck';
export { LiveTicker } from './LiveTicker';
export { ActivePoll } from './ActivePoll';
export { OSWidget } from './OSWidget';
export { LabSlider } from './LabSlider';

// === ZONE A: CONTROL DECK ===
export { ControlStrip } from './ControlStrip';
export { ZenModeToggle } from './ZenModeToggle';
export { SonicTuner } from './SonicTuner';

// === ZONE B: WORKSPACE ===
export { SystemStatusBar } from './SystemStatusBar';
export { KineticAppGrid } from './KineticAppGrid';
export { KineticCategories } from './KineticCategories';
export { HotDealsStack } from './HotDealsStack';

// === ZONE C: TELEMETRY ===
export { TelemetryBar } from './TelemetryBar';

// Import CSS
import './kinetic.css';
