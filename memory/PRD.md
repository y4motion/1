# Ghost Protocol - PRD
## Ghost OS Dashboard - Total Kinetic Overhaul

### Original Problem Statement
Transform the homepage from a static "Web 2.0 Frankenstein" into a living "Ghost OS Dashboard" with kinetic physics, gamification, and immersive UI.

### Design Documents
- `/app/design/GHOST_DASHBOARD_SPEC.md` - Master architecture spec
- `/app/design/KINETIC_UI_SPEC.md` - Animation bible

---

## What's Been Implemented (Jan 23, 2025)

### ✅ ZONE A: Hero & Control Deck
- **HeroSection** - Search with video background, 8 easter eggs
- **ControlStrip** - Glass panel with time display
- **ZenModeToggle** - Hides noisy sections, cyan glow when active
- **SonicTuner** - Volume control + preset selector (locked by level)

### ✅ ZONE B: Kinetic Workspace
- **SystemStatusBar** - Live activity feed + trending chips merged
  - Online count with green pulse
  - User activities (purchases, views)
  - HOT trending searches with growth %
- **KineticAppGrid** - 8 app widgets (4x2)
  - BUILDER (AI), FEED (LIVE), MINIMAL OS, SWAP
  - RATING, CREATORS, GUIDES, GROUP BUY (HOT)
  - Colored icons, hover glow effects
- **LiveTicker** - Running news with red dot
- **ReviewDeck** - 3-state stack (Stack → Fan → List)
- **ActivePoll** - Dotted progress bars voting
- **KineticCategories** - Bento grid with mixed sizes
  - Large (2x2): Видеокарты
  - Medium: Мониторы, Клавиатуры
  - Small: Аудио, Периферия, etc.
  - Real images, HOT badges
- **HotDealsStack** - Swipeable card deck
  - Countdown timer per deal
  - Discount badges
  - Navigation (1/3)

### ✅ ZONE C: System Telemetry
- **TelemetryBar** - Terminal-style metrics
  - LIVE.NODES, PRODUCTS.INDEXED, XP.GENERATED, TRADES.TODAY
  - Blinking cursor, flash on update

### ✅ Infrastructure
- **useGhostStore.js** (Zustand) - Global state for Zen Mode, Sound, Telemetry
- All components use `framer-motion` spring physics
- Stagger animations on page load

---

## Zen Mode Behavior
When activated:
- ✅ Hides: SystemStatusBar, LiveTicker
- ✅ Shows: Hero, ControlStrip, AppGrid, Dashboard widgets

---

## File Structure

```
/app/frontend/src/
├── stores/
│   └── useGhostStore.js         # Zustand global state
├── components/
│   ├── kinetic/
│   │   ├── ControlStrip.jsx
│   │   ├── ZenModeToggle.jsx
│   │   ├── SonicTuner.jsx
│   │   ├── SystemStatusBar.jsx
│   │   ├── KineticAppGrid.jsx
│   │   ├── KineticCategories.jsx
│   │   ├── HotDealsStack.jsx
│   │   ├── TelemetryBar.jsx
│   │   ├── ReviewDeck.jsx
│   │   ├── LiveTicker.jsx
│   │   ├── ActivePoll.jsx
│   │   └── kinetic.css
│   └── HomePage.jsx             # Orchestrator
└── design/
    ├── GHOST_DASHBOARD_SPEC.md
    └── KINETIC_UI_SPEC.md
```

---

## Prioritized Backlog

### P0 - Critical
- None currently

### P1 - High Priority
- **Sound Files** - Add actual ambient audio files to /public/sounds/
- **Operator Status Widget** - User XP/RP/Level display
- **Event Widget** - Countdown to drops/events
- **Phase 4 Evolution** - DecryptionCube, ClassSelection

### P2 - Medium Priority
- **Ghost OS Menu** - NeuralHub concept from archived doc
- **Morphing Cards** - layoutId shared element transitions
- **ProductCard verification**

### P3 - Future
- Voice & Screen Share
- Social features
- Tinkoff + Cryptomus payments

---

## Dependencies Added
```json
{
  "zustand": "^5.0.10",
  "use-sound": "^5.0.0",
  "howler": "^2.2.4"
}
```

---

## Testing Status
- Visual verification: ✅ All zones working
- Zen Mode: ✅ Toggles sections correctly
- Responsive: Not fully tested
- Regression check: /marketplace, /swap not affected

---

*Updated: January 23, 2025*
*Status: GHOST OS DASHBOARD MVP COMPLETE*
