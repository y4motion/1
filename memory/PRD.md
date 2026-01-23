# Minimal Mod - Product Requirements Document

## Original Problem Statement
Build a hyper-stylized, atmospheric website with a deep, sophisticated user progression and rating system called "Ghost Protocol." The project features a "Toriki / Future Minimal / Japandi Tech" aesthetic.

## Core System: Ghost Protocol

### Trinity Metrics
- **XP (Synchronization)**: Cumulative experience showing seniority
- **TS (Trust Score)**: Social credit (0-1000) for safety
- **RP (Resource Points)**: Influence energy spent on voting

### Class Hierarchy
- **Level 0-10: GHOST** — Observer (read-only + purchases)
- **Level 10-40: PHANTOM** — Active participant (free Swap, voting, chat)
- **Level 40-80: OPERATOR** — Influential node (Hidden Armory access, x1.5 vote weight)
- **Level 80+: MONARCH** — Elite (Direct Line with founders, x2 vote weight)

### Neural Pathways (at Level 10)
- **ARCHITECT (⬡)**: +25% XP for builds, blueprint overlay
- **BROKER (◇)**: -15% Swap commission, +RP for trades
- **OBSERVER (◉)**: Expert verified reviews, +50% RP for reviews

## Implemented Features

### Phase 1: Backend Core ✅ (January 2026)
- Mathematical leveling system (`/backend/services/leveling_system.py`)
- XP service with anti-abuse mechanisms (`/backend/services/xp_service.py`)
- Living Legends engine for dynamic titles (`/backend/services/living_legends.py`)
- Updated User and Rating models with all new fields

### Phase 2: Visual Identity ✅ (January 2026)
- **UserResonance.jsx**: Trust-based avatar styling with halo, filters, glitch effects
- **ClassArtifact.jsx**: SVG icons for Neural Pathway specializations
- **HolographicID.jsx**: Digital passport with spider chart, 3D tilt, glass morphism
- **Demo page**: `/system-demo` for component showcase
- CSS variables for Ghost Protocol color system

## Architecture

```
/app/
├── SYSTEM_ARCHITECTURE_GHOST.md  # Master project plan
├── backend/
│   ├── models/
│   │   ├── user.py               # User model with Ghost Protocol fields
│   │   └── rating.py             # Rating system model
│   ├── services/
│   │   ├── leveling_system.py    # Mathematical core
│   │   ├── living_legends.py     # Dynamic titles engine
│   │   └── xp_service.py         # XP operations
│   └── server.py
└── frontend/
    └── src/
        ├── components/
        │   ├── system/           # Ghost Protocol components
        │   │   ├── UserResonance.jsx
        │   │   ├── ClassArtifact.jsx
        │   │   ├── HolographicID.jsx
        │   │   └── index.js
        │   ├── demo/
        │   │   └── SystemDemo.jsx
        │   └── ModPage.jsx
        └── index.css             # Global styles + Ghost Protocol CSS vars
```

## Prioritized Backlog

### P0 — High Priority
- [ ] **Phase 3: Mod Temple & Hidden Shop** — Rebuild `/mod` page with VoidShop, Amber Thread

### P1 — Medium Priority  
- [ ] **Phase 4: Evolution (Interactivity)** — DecryptionCube, ClassSelection, System Notifications
- [ ] Integrate UserResonance into existing chat/profile components

### P2 — Lower Priority
- [ ] Voice & Screen Share for support chat
- [ ] Full User Trust/Rating System UI
- [ ] Social features: `/feed`, `/articles`, `/creators`
- [ ] Alternate payments (Tinkoff + Cryptomus)
- [ ] Performance optimization

## Technical Notes

### CSS Variables (Ghost Protocol)
```css
--ghost-void: #050505
--ghost-amber: #FF9F43
--ghost-cyan: #00FFD4
--ghost-void-blue: #2E5CFF
--halo-verified: #00FFD4
--halo-danger: #FF4444
```

### Key Dependencies
- `react-tilt`: 3D tilt effect for cards
- `recharts`: Spider/Radar charts
- `framer-motion`: Animations

---
*Last Updated: January 23, 2026*
*Version: 2.0.0*
