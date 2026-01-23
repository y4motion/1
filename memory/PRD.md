# Minimal Mod - Product Requirements Document

## Original Problem Statement
Build a hyper-stylized, atmospheric website with a deep, sophisticated user progression and rating system called "Ghost Protocol." The project features a "Toriki / Future Minimal / Japandi Tech" aesthetic.

## Core Philosophy: Ghost Resonance
**Trust = Коэффициент Стабильности Сигнала**
- High trust = Clean signal, perfect focus, soft backlight from depth
- Low trust = Interference, noise, color loss, unstable projection

## Implemented Features

### Phase 1: Backend Core ✅ (January 2026)
- Mathematical leveling system (`/backend/services/leveling_system.py`)
- XP service with anti-abuse mechanisms (`/backend/services/xp_service.py`)
- Living Legends engine for dynamic titles (`/backend/services/living_legends.py`)

### Phase 2: Ghost Resonance ✅ (January 2026)
**Signal Quality States:**
| Trust Score | State | Visual Effects |
|-------------|-------|----------------|
| > 800 | PHOTON ECHO | Diffuse backlight, laser connection line |
| 500-799 | STANDARD | Normal projection, hard shadow |
| 400-499 | SIGNAL DECAY | Grayscale (80%), noise texture overlay |
| 200-399 | GLITCH ANOMALY | RGB split, chromatic aberration, jitter |
| < 200 | CORRUPTED | Heavy distortion, clip-path glitch |

**Components:**
- `UserResonance.jsx` — Signal-based avatar
- `ClassArtifact.jsx` — Geometric SVG icons (Isometric cube, Parabolas, Eye)
- `HolographicID.jsx` — Digital passport with spider chart, 3D tilt

### Phase 3: System Voice ✅ (January 2026)
**SystemToast implemented:**
- Monospace toast notifications with "decoding" text effect
- Types: `info`, `success`, `warning`, `error`, `xp`, `rp`, `trust`, `access`, `denied`
- Auto-remove after 4 seconds
- Scan-line animation

**ModPage integration:**
- Toast triggers on Armory open/close
- Toast on Direct Line access/denied
- Toast on Vote (+10 RP)
- Toast on Boost (+25 XP)
- Toast on Legacy etch

**Demo page:** `/system-demo` — includes System Voice testing section

## Architecture

```
/app/
├── SYSTEM_ARCHITECTURE_GHOST.md  # Master project plan
├── memory/
│   ├── PRD.md                    # This file
│   └── FUTURE_GHOST_OS_MENU.md   # Archived future task
├── backend/
│   └── services/
│       ├── leveling_system.py
│       ├── living_legends.py
│       └── xp_service.py
└── frontend/src/components/
    ├── system/
    │   ├── UserResonance.jsx     # Signal-based avatar
    │   ├── ClassArtifact.jsx     # Geometric class icons
    │   ├── HolographicID.jsx     # Digital passport
    │   ├── SystemToast.jsx       # System notifications (NEW)
    │   └── index.js
    ├── demo/
    │   └── SystemDemo.jsx
    └── ModPage.jsx               # Updated with SystemToast
```

## Prioritized Backlog

### P0 — High Priority
- [ ] **Phase 3 continued:** Improve ModPage Split Gate animation, add VoidShop levitation effects

### P1 — Medium Priority  
- [ ] **Phase 4: Evolution (Interactivity)**
  - DecryptionCube.jsx — Level-up modal with 3D wireframe cube
  - ClassSelection.jsx — Minimalist three-column selection at level 10
- [ ] Integrate UserResonance into chat/profile components site-wide

### P1.5 — Archived (Ghost OS Menu)
- [ ] NeuralHub.jsx — Radial menu from Core Pulse
- [ ] OperatorDossier.jsx — Redesigned profile page
- See `/app/memory/FUTURE_GHOST_OS_MENU.md` for full spec

### P2 — Lower Priority
- [ ] Voice & Screen Share for support chat
- [ ] Alternate payments (Tinkoff + Cryptomus)
- [ ] Performance optimization

## CSS Variables (Ghost Protocol)
```css
--ghost-void: #050505
--ghost-amber: #FF9F43
--ghost-cyan: #00FFD4
--ghost-void-blue: #2E5CFF
--halo-verified: #00FFD4
--halo-danger: #FF4444
```

---
*Last Updated: January 23, 2026*
*Version: 3.0.0 — System Voice Complete*
