# Minimal Mod - Product Requirements Document

## Original Problem Statement
Build a hyper-stylized, atmospheric website with a deep, sophisticated user progression and rating system called "Ghost Protocol." The project features a "Toriki / Future Minimal / Japandi Tech" aesthetic.

## Implemented Features

### Phase 1: Backend Core ✅
- Mathematical leveling system
- XP service with anti-abuse mechanisms
- Living Legends engine for dynamic titles

### Phase 2: Ghost Resonance ✅
- UserResonance.jsx — Signal-based avatar (Photon/Standard/Decay/Glitch/Corrupted)
- ClassArtifact.jsx — Geometric SVG icons
- HolographicID.jsx — Digital passport with spider chart

### Phase 3: Temple Architecture & System Voice ✅ (January 2026)

**Audio Immersion:**
- `SystemAudio.js` — Native Web Audio API sounds
- `playVoidOpen()` — Heavy mechanical rumble
- `playAccessGranted()` — Power-on hum
- `playAccessDenied()` — Warning buzz
- `playToastClick()` — Soft digital click
- `playHoverBlip()` — Interaction feedback

**SystemToast with Audio:**
- Auto-plays sound based on toast type
- `access/success` → playAccessGranted
- `denied/error` → playAccessDenied
- `info/xp/rp` → playToastClick

**ModPage Temple Architecture:**
1. **THE FRIEZE (45vh)** — Monument with:
   - CodeStream — Matrix-style running code
   - LegacyEchoes — Floating phrases (LEGACY, VOID, SYSTEM)
   - Noise texture overlay

2. **THE SPLIT GATE** — World-splitting mechanic:
   - Click triggers `playVoidOpen()` sound
   - Frieze slides UP (-400px)
   - Timeline slides DOWN (+400px)
   - VoidShop appears in the gap

3. **THE VOID SHOP** — Hidden armory:
   - Pure black background (#000000)
   - Floating products with cyan glow on hover
   - Trust-locked items (blur + lock icon for TS < 400)
   - Rarity-based colors (legendary/epic/rare/uncommon/common)

4. **ORIGIN TIMELINE** — Amber thread history:
   - Vertical amber line (1px)
   - Timeline nodes with events

5. **INNER CIRCLE** — Founders access:
   - Trust 700+ required
   - Pulsing amber button when accessible
   - `ACCESS DENIED` toast when blocked

## Architecture

```
/app/frontend/src/components/
├── system/
│   ├── UserResonance.jsx     # Signal-based avatar
│   ├── ClassArtifact.jsx     # Geometric class icons
│   ├── HolographicID.jsx     # Digital passport
│   ├── SystemToast.jsx       # Notifications + audio
│   ├── SystemAudio.js        # Web Audio API sounds
│   └── index.js
├── demo/
│   └── SystemDemo.jsx        # Component showcase
├── ModPage.jsx               # THE TEMPLE
└── ModPage.css
```

## Prioritized Backlog

### P0 — High Priority
- [ ] Add product click interactions in Void Shop
- [ ] Connect to real product data from backend

### P1 — Medium Priority
- [ ] **Phase 4: Evolution**
  - DecryptionCube.jsx — Level-up rewards
  - ClassSelection.jsx — Class choice at level 10
- [ ] Integrate UserResonance into chat/profile site-wide
- [ ] Ghost OS Menu (archived in `/app/memory/FUTURE_GHOST_OS_MENU.md`)

### P2 — Lower Priority
- [ ] Voice & Screen Share
- [ ] Alternate payments (Tinkoff + Cryptomus)

## CSS Variables (Ghost Protocol)
```css
--ghost-void: #050505
--ghost-amber: #FF9F43
--ghost-cyan: #00FFD4
--halo-danger: #FF4444
```

---
*Last Updated: January 23, 2026*
*Version: 3.1.0 — Temple Complete*
