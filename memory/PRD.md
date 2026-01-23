# Ghost Protocol - PRD
## Hyper-stylized atmospheric website with "Kinetic Dot-OS" UI

### Original Problem Statement
Build a hyper-stylized, atmospheric website with a deep, sophisticated user progression and rating system called "Ghost Protocol." The UI should follow "Kinetic Dot-OS" style - combining Nothing brand aesthetics (dot matrix, monochrome, red accents) with Howard.le spring physics animations.

### Core Aesthetic Principles
- **Floating Islands**: Elements "float" with rounded corners, glass-morphism, spring physics
- **Nothing Aesthetics**: Dot matrix fonts, monochrome palette, red micro-accents (#FF0000)
- **Spring Physics**: All animations use `framer-motion` with spring configs
- **Live Data**: Widgets "breathe" with real-time updates

---

## What's Been Implemented

### ✅ Phase 1-2: Visual Core (COMPLETE)
- `UserResonance.jsx`, `HolographicID.jsx`, `ClassArtifact.jsx` - Trust score visualization
- Ghost Protocol backend (leveling, trust scores, Living Legend titles)

### ✅ Phase 3: Mod Temple (COMPLETE)
- Split Gate animation revealing Void Shop
- Monument header with Etch Legacy
- Origin Thread horizontal timeline with neural pulse animation
- System Audio & Toast notifications

### ✅ Kinetic Dot-OS UI Overhaul (COMPLETE - Jan 23, 2025)
**HomePage:**
- `LiveTicker` - Running news ticker with red recording dot
- `ReviewDeck` - Card stack that fans out on click (dot ratings)
- `ActivePoll` - Live voting with dotted progress bars
- `KineticWidget` - Stats widget with system status

**ModPage Ecosystem:**
- `OSWidget` - Minimal OS status (version, downloads, ONLINE indicator)
- `LabSlider` - Draggable concept prints slider
- `ActivePoll` - NEXT DROP voting widget

**Kinetic Component System:**
- `KineticWidget.jsx` - Base floating island component
- `DotText` - Dot matrix typography
- `StatusDot` - Animated status indicators
- `DottedProgress` - Dotted progress bars
- `ExpandButton` - Animated expand button
- `springConfig` / `springBouncy` - Reusable spring physics

### Verified No Regressions
- `/marketplace` - Working correctly
- `/swap` - Working correctly

---

## Prioritized Backlog

### P0 - Critical
- None currently

### P1 - High Priority
- **Phase 4: Evolution (Interactivity)**
  - `DecryptionCube.jsx` - Lootbox/mystery box system
  - `ClassSelection.jsx` - RPG class selection UI

### P2 - Medium Priority
- **Ghost OS Menu** - Neural Hub menu concept (archived in `/app/memory/FUTURE_GHOST_OS_MENU.md`)
- **ProductCard hover panel robustness verification**

### P3 - Future
- Voice & Screen Share for support chat
- User Trust/Rating System UI expansion
- Social features: `/feed`, `/articles`, `/creators`
- Payment integrations: Tinkoff + Cryptomus
- Performance optimization

---

## Architecture

```
/app/frontend/src/components/
├── kinetic/                 # Kinetic Dot-OS system
│   ├── KineticWidget.jsx    # Base widget
│   ├── ReviewDeck.jsx       # Card stack
│   ├── LiveTicker.jsx       # News ticker
│   ├── ActivePoll.jsx       # Live voting
│   ├── OSWidget.jsx         # System status
│   ├── LabSlider.jsx        # Concept slider
│   ├── kinetic.css          # All kinetic styles
│   └── index.js             # Exports
├── system/                  # System components
│   ├── SystemToast.jsx
│   └── SystemAudio.js
├── HomePage.jsx             # Kinetic Dashboard
└── ModPage.jsx              # Temple with Kinetic Ecosystem
```

### Key Technical Concepts
- **Isolation Protocol**: New UI in `/kinetic/` directory to prevent regressions
- **Spring Physics**: `framer-motion` with `type: "spring"` throughout
- **Nothing Aesthetics**: JetBrains Mono font, red #FF0000 accents only

---

## 3rd Party Integrations
- `framer-motion` - Animation library
- `lucide-react` - Icons
- `recharts` - Charts
- `react-tilt` - Tilt effects
