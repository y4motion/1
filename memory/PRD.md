# Minimal Mod - Product Requirements Document

## Original Problem Statement
Build a hyper-stylized, atmospheric website with a deep, sophisticated user progression and rating system called "Ghost Protocol." The project features a "Toriki / Future Minimal / Japandi Tech" aesthetic.

## Core Philosophy: Ghost Resonance
**Trust = Коэффициент Стабильности Сигнала**
- High trust = Clean signal, perfect focus, soft backlight from depth
- Low trust = Interference, noise, color loss, unstable projection

## Core System: Ghost Protocol

### Trinity Metrics
- **XP (Synchronization)**: Cumulative experience showing seniority
- **TS (Trust Score)**: Social credit (0-1000) — Signal Stability Coefficient
- **RP (Resource Points)**: Influence energy spent on voting

### Class Hierarchy
- **Level 0-10: GHOST** — Observer (read-only + purchases)
- **Level 10-40: PHANTOM** — Active participant (free Swap, voting, chat)
- **Level 40-80: OPERATOR** — Influential node (Hidden Armory access, x1.5 vote weight)
- **Level 80+: MONARCH** — Elite (Direct Line with founders, x2 vote weight)

### Neural Pathways (at Level 10)
- **ARCHITECT (Isometric Cube)**: +25% XP for builds, blueprint overlay
- **BROKER (Intersecting Parabolas)**: -15% Swap commission, +RP for trades
- **OBSERVER (Schematic Eye)**: Expert verified reviews, +50% RP for reviews

## Implemented Features

### Phase 1: Backend Core ✅ (January 2026)
- Mathematical leveling system (`/backend/services/leveling_system.py`)
- XP service with anti-abuse mechanisms (`/backend/services/xp_service.py`)
- Living Legends engine for dynamic titles (`/backend/services/living_legends.py`)
- Updated User and Rating models with all new fields

### Phase 2: Ghost Resonance ✅ (January 2026)
**Signal Quality States implemented:**

| Trust Score | State | Visual Effects |
|-------------|-------|----------------|
| > 800 | PHOTON ECHO | Crystal clarity, diffuse backlight, laser connection line |
| 500-799 | STANDARD | Normal projection, hard shadow |
| 400-499 | SIGNAL DECAY | Grayscale (80%), noise texture overlay |
| 200-399 | GLITCH ANOMALY | RGB split, chromatic aberration, jitter animation |
| < 200 | CORRUPTED | Heavy distortion, clip-path glitch, near invisible |

**Components created:**
- `UserResonance.jsx` — Signal-based avatar with backlight, noise, RGB-split
- `ClassArtifact.jsx` — Geometric SVG icons (Isometric cube, Parabolas, Eye with crosshairs)
- `HolographicID.jsx` — Digital passport with spider chart, 3D tilt, glass morphism
- Demo page: `/system-demo`

**CSS Variables (Ghost Protocol Palette):**
```css
--ghost-void: #050505
--ghost-amber: #FF9F43
--ghost-cyan: #00FFD4
--ghost-void-blue: #2E5CFF
--halo-verified: #00FFD4
--halo-danger: #FF4444
```

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
        │   │   ├── UserResonance.jsx   # Signal-based avatar
        │   │   ├── ClassArtifact.jsx   # Geometric class icons
        │   │   ├── HolographicID.jsx   # Digital passport
        │   │   └── index.js
        │   ├── demo/
        │   │   └── SystemDemo.jsx
        │   └── ModPage.jsx
        └── index.css             # Global styles + Ghost Protocol CSS vars
```

## Prioritized Backlog

### P0 — High Priority
- [ ] **Phase 3: Mod Temple & Hidden Shop** — Rebuild `/mod` page with VoidShop, Amber Thread, The Frieze

### P1 — Medium Priority  
- [ ] **Phase 4: Evolution (Interactivity)**
  - DecryptionCube.jsx — Level-up modal with 3D wireframe cube
  - ClassSelection.jsx — Minimalist three-column selection at level 10
  - **System Notifications** — Monospace toast notifications in Ghost Protocol style:
    - `RP GENERATED: +50`
    - `TRUST SYNC: 98%`
    - `SYSTEM ALERT: Trust decay detected`
- [ ] Integrate UserResonance into existing chat/profile components site-wide

### P2 — Lower Priority
- [ ] Voice & Screen Share for support chat
- [ ] Full User Trust/Rating System UI
- [ ] Social features: `/feed`, `/articles`, `/creators`
- [ ] Alternate payments (Tinkoff + Cryptomus)
- [ ] Performance optimization

## Technical Notes

### Key Dependencies
- `react-tilt`: 3D tilt effect for cards
- `recharts`: Spider/Radar charts
- `framer-motion`: Animations

### Signal Quality Implementation
The UserResonance component uses:
- CSS filters: `grayscale()`, `contrast()`, `brightness()`, `saturate()`
- Diffuse backlight via `radial-gradient` + `blur`
- Noise overlay via inline SVG `feTurbulence`
- RGB split via offset layers with `mix-blend-mode: screen`
- Glitch animations via `clip-path` + `transform` keyframes

---
*Last Updated: January 23, 2026*
*Version: 2.1.0 — Ghost Resonance Complete*
