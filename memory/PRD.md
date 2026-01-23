# Minimal Mod - Product Requirements Document

## Original Problem Statement
Build a hyper-stylized, atmospheric website for Minimal Mod brand with Ghost Protocol user progression system.

## Implemented Features

### Phase 1: Backend Core ✅
- Mathematical leveling system
- XP/RP/Trust Score services
- Living Legends engine

### Phase 2: Ghost Resonance ✅
- UserResonance.jsx — Signal-based avatar
- ClassArtifact.jsx — Geometric class icons
- HolographicID.jsx — Digital passport

### Phase 3: Temple Architecture ✅ (January 2026)

**Audio Immersion:**
- `SystemAudio.js` — Web Audio API sounds
- `playVoidOpen()`, `playAccessGranted()`, `playAccessDenied()`, `playHoverBlip()`

**SystemToast with Audio:**
- Decoding text effect + sound feedback

**ModPage — THE TEMPLE:**

1. **THE MONUMENT (Header)**
   - Civilization Code — Runes (ᚠᚢᚦ), Kanji (無空道), Hex (0xFF), Cyrillic (ЖФЫ)
   - Legacy Echoes — Floating phrases (LEGACY, VOID, MINIMAL)
   - **[ ETCH YOUR LEGACY ]** button with glitch hover
   - Level 80 Monarch requirement

2. **THE SPLIT GATE**
   - World-splitting animation
   - Monument slides UP, Timeline slides DOWN
   - `playVoidOpen()` on trigger

3. **THE VOID SHOP**
   - Pure black (#000000) background
   - **MINIMAL MOD EXCLUSIVES** label
   - Brand products:
     - GLASSPAD 2024 — ₽4,900
     - MINIMAL SLEEVE — ₽2,900
     - CUSTOM CABLE — ₽1,900
     - VOID KEYCAPS — ₽3,500
     - ECHO MAT — ₽1,500
   - Floating animation + cyan glow on hover
   - Trust 400+ lock for low-trust users

4. **ORIGIN TIMELINE**
   - Amber thread (1px vertical line)
   - Timeline nodes: GENESIS → FIRST DROP → COMMUNITY → VOID ERA

5. **THE ECOSYSTEM (Bento Grid)**
   - **MINIMAL OS** — Download v2.0 button
   - **CONCEPT LAB** — Vote for prints (VOID CARPET, SIGNAL RUG, MONO SLEEVE)
   - **TOP BUILDS** — Community builds gallery (PHANTOM X, ARCTIC MONO, OBSIDIAN)

6. **INNER CIRCLE**
   - Trust 700+ for Direct Line access
   - Pulsing amber button

**Visual:**
- Cartenon Abyss gradient: `radial-gradient(circle at center, #1a1a1c, #000)`

## Architecture

```
/app/frontend/src/components/
├── system/
│   ├── UserResonance.jsx
│   ├── ClassArtifact.jsx
│   ├── HolographicID.jsx
│   ├── SystemToast.jsx
│   ├── SystemAudio.js
│   └── index.js
├── ModPage.jsx          # THE TEMPLE
└── ModPage.css
```

## Backlog

### P0
- [ ] Connect Void Shop to real product API

### P1
- [ ] Phase 4: DecryptionCube, ClassSelection
- [ ] Ghost OS Menu (NeuralHub, OperatorDossier)

### P2
- [ ] Voice/Screen Share
- [ ] Parallax effects

---
*Version: 3.2.0 — Monument Resurrected*
