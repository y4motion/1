# Ghost Protocol - PRD
## Social Core Complete

### Original Problem Statement
Build comprehensive social layer with:
- **The Network** - Content feed (posts, guides, showcases)
- **The Consensus** - King of the Hill idea voting with RP economics
- **Hall of Monarchs** - Leaderboards and achievements

### ✅ Bug Fixes & Cleanup - Jan 23, 2025

#### Fixed:
1. **Black screen bug on page transitions** - Removed `PageTransition` component that conflicted with React.lazy/Suspense
2. **Duplicate chat components** - Removed old `GlassyChatBar`, kept only `GlassyOmniChat`

#### Cleanup:
- Moved `/components/deprecated/` to `/components/_deprecated/` (prevents accidental imports)
- Removed `GlassyChatBar` export from `chat/index.js`
- Removed unused `PageTransition` import from App.js

---

## What's Been Implemented (Jan 23, 2025)

### ✅ Ghost OS Dashboard (Frontend)
- Control Strip (Zen Mode + Sonic Tuner)
- System Status Bar, App Grid, Categories, Deals
- Telemetry Bar

### ✅ Social Core Backend
- Network API: Feed, posts CRUD, likes, saves, comments
- Consensus API: Ideas voting with RP economics
- Monarchs API: Leaderboards and achievements

### ✅ Social Core Frontend (NEW - Jan 23, 2025)

#### Pages Created:
- `/community` - CommunityHub.jsx - Hub with 3 cards (Network, Consensus, Monarchs)
- `/community/network` - NetworkPage.jsx - Masonry feed with category/sort filters
- `/community/consensus` - ConsensusPage.jsx - King of the Hill ideas list

#### Components Created:
- `NetworkFeed.jsx` - Masonry grid with posts, category tabs, sort options
- `ConsensusList.jsx` - Ideas list with RP voting, rank indicators
- `CommunityPulse.jsx` - Homepage flip-card widget (auto-flip every 8s)

#### Integration:
- Added routes in App.js
- CommunityPulse integrated into HomePage dashboard row
- CSS styles in social.css

#### Test Coverage:
- 22/22 backend API tests passed
- All frontend pages tested and working

#### Models Created:
- `models/network_post.py` - Posts with categories, media, engagement
- `models/consensus_idea.py` - Ideas with RP economics, voting
- `models/monarchs.py` - Achievements, leaderboards

#### Services Created:
- `services/network_service.py` - Post CRUD, likes, saves, comments, hot score
- `services/consensus_service.py` - Idea voting, duplicate detection, ranking
- `services/rp_economics.py` - RP transactions, level requirements

#### API Endpoints:

**Network (`/api/network`):**
- `GET /feed` - Feed with category filter, sorting
- `GET /post/:id` - Single post with comments
- `POST /post` - Create post (level 5+)
- `POST /post/:id/like` - Like/unlike
- `POST /post/:id/save` - Save/unsave
- `POST /post/:id/comment` - Add comment
- `GET /saved` - User's saved posts
- `GET /drafts` - User's drafts

**Consensus (`/api/consensus`):**
- `GET /ideas` - Ranked ideas (King of the Hill)
- `GET /idea/:id` - Single idea with comments
- `POST /idea` - Create idea (500 RP, level 10+)
- `POST /idea/:id/vote` - Vote (50 RP, level 5+)
- `POST /similar-check` - AI duplicate detection
- `GET /info` - Costs and requirements

**Monarchs (`/api/monarchs`):**
- `GET /top` - Leaderboard by period/category
- `GET /user/:id/rank` - User's current rankings
- `GET /user/:id/achievements` - User achievements
- `GET /user/:id/mini-profile` - Hover card data
- `GET /hall-of-fame` - Top implementers, XP, trust

---

## RP Economics

| Action | RP Cost | XP Reward |
|--------|---------|-----------|
| Create Post | 0 | +50 |
| Create Idea | 500 | +100 |
| Vote on Idea | 50 | +10 |
| Post Liked | - | +5 |
| Post Saved | - | +10 |
| Idea Implemented | -500 refund +1000 bonus | +5000 |

### Level Requirements
- Level 5: Post, Vote
- Level 10: Create Ideas

```

---

## Backend File Structure

```
/app/backend/
├── models/
│   ├── network_post.py      # Network posts model
│   ├── consensus_idea.py    # Consensus ideas model
│   └── monarchs.py          # Achievements & leaderboards
├── services/
│   ├── network_service.py   # Posts CRUD, engagement
│   ├── consensus_service.py # Ideas voting, ranking
│   └── rp_economics.py      # RP transactions
└── routes/
    ├── network_routes.py    # /api/network/*
    ├── consensus_routes.py  # /api/consensus/*
    └── monarchs_routes.py   # /api/monarchs/*
```

### ✅ Visual Correction Pass (NEW - Jan 23, 2025)

#### Changes Made:
1. **Strict Monochrome Icons** - KineticAppGrid icons now white (#FFFFFF), only LIVE badge red
2. **Abstract Categories** - KineticCategories replaced photos with dot-grid patterns and large ghost icons
3. **TelemetryBar Upgrade** - Large dot-matrix numbers right-aligned, minimal label left
4. **Two Social Widgets** - NetworkPulse and ConsensusPulse as separate cards (not flip)

### ✅ Database Seed (Hardware Data) - Jan 23, 2025

#### Data Seeded:
- **48 products** with full technical specifications for PC Builder compatibility
- **8 categories**: CPU, GPU, Motherboard, RAM, PSU, Case, Storage, Cooling
- **Specs for compatibility**: Socket types, form factors, power requirements, dimensions
- **10 test users** with simulated view history and carts

#### Key Specs Available:
- **CPU**: socket, cores, threads, TDP, cache
- **GPU**: VRAM, length_mm, recommended_psu_wattage, TDP
- **Motherboard**: socket, form_factor, ram_type, m2_slots
- **RAM**: type (DDR4/DDR5), speed, capacity
- **PSU**: wattage, efficiency rating, modular type
- **Case**: max_gpu_length, motherboard_support, radiator_support
- **Cooling**: type, height, TDP support

### ✅ PC Builder Improvements - Jan 23, 2025

#### Chat Integration:
- **GlassyChatBar enabled** on PC Builder page
- **Auto-open chat** with welcome message on first visit
- **AI tab** offers build assistance ("Помощь со сборкой")

#### Compatibility Logic (Already Exists):
- **Smart Filter** - auto-filters by CPU↔Motherboard socket
- **checkCompatibility** - checks GPU length, motherboard form factor, PSU size, cooling type
- **CompatibilityResolver** - widget showing conflicts with swap suggestions

---

### ✅ SYSTEM CONVERGENCE (RPG Integration) - Jan 24, 2025

#### RPG Integration into IdentityCore:
- **3D Rotating Class Artifact** - Вращающийся артефакт класса над аватаром
  - ARCHITECT → Cyan Cube (wireframe)
  - BROKER → Amber Parabola
  - OBSERVER → Blue Eye
- **Trust Score Aura** - Динамическая аура вокруг аватара
  - PHOTON ECHO (850+) — Бирюзовое свечение с пульсацией
  - NEUTRAL (500-700) — Белое минимальное свечение
  - DECAY (300-499) — Жёлтое мерцание
  - GLITCH (100-299) — Красные рывки
  - CORRUPTED (<100) — Красная дрожь

#### Code Cleanup:
- ✅ Удалён `/components/chat/GlassyChatBar.jsx` (заменён на GlassyOmniChat)
- ✅ Удалён `/components/social/NetworkFeed.jsx` (заменён на CommunityPage)
- ✅ Удалён `/components/social/ConsensusList.jsx` (заменён на GovernancePage)
- ✅ Удалён `/components/_deprecated/ChatFullPage.jsx` (устаревший)

#### Route Redirects:
- `/community` → `/neural-feed`
- `/community/network` → `/neural-feed`
- `/community/consensus` → `/governance`

#### Files Modified:
- `IdentityCore.jsx` — Добавлены компоненты `RotatingClassArtifact` и `TrustScoreAura`
- `App.js` — Добавлены редиректы, удалены неиспользуемые импорты

---

## Next Steps 

### P0 - Critical (DONE)
- [x] Create `/community` hub page
- [x] NetworkFeed.jsx - Masonry grid
- [x] ConsensusList.jsx - Ideas with voting
- [x] CommunityPulse.jsx - Homepage widget (flip card)

### P1 - High (Upcoming)
- [x] **Visual Correction Pass** - Align with Nothing OS aesthetic ✅
- [ ] PostCreate.jsx - Create post modal
- [ ] IdeaCreate.jsx - Create idea with RP cost
- [ ] MonarchsBoard.jsx - Leaderboard UI
- [ ] Phase 4: The Evolution - DecryptionCube, ClassSelection

### P2 - Medium
- [ ] VaultPage.jsx - Drafts, saved, moderation
- [ ] NeuralHub menu integration
- [ ] Notifications (red dots)
- [ ] Zen Mode scroll bug fix

---

## Known Issues

| Issue | Priority | Status |
|-------|----------|--------|
| Zen Mode scroll bug - elements below viewport may still appear | P2 | NOT STARTED |
| ProductCard expanded panel robustness | P2 | NOT STARTED |
| Video autoplay in hero section | P2 | NOT STARTED |

---

## ✅ Acrylic Ghost UI Overhaul - Jan 24, 2025

### Neural Hub Menu (NeuralHub.jsx)
**Status:** COMPLETE

**Features Implemented:**
- Premium "Acrylic Ghost" frosted glass aesthetic
- **Monospace fonts** for all numbers (4850/5000, 99/100, LVL 99)
- **Soft white edge glow** - subtle radial gradients in corners + edge highlights
- Two-panel layout: Identity (left) + Operations (right)
- Avatar with breathing glow animation
- Stat bars with animated progress
- Navigation tiles with hover effects
- JetBrains Mono for technical labels

### Atmospheric Background (AtmosphericBackground.jsx)
**Status:** COMPLETE

**Features Implemented:**
- **White fog effect** - 5 animated blur orbs creating "smoke in darkness"
- **Grain texture** - SVG noise overlay for material feel
- **Vignette** - darkened corners for cinematic focus
- CSS keyframe animations for smooth orb movement
- Applied globally via App.js

### Files Modified:
- `/app/frontend/src/components/system/NeuralHub.jsx` - v7.2 Final Polish
- `/app/frontend/src/components/system/AtmosphericBackground.jsx` - NEW
- `/app/frontend/src/components/system/index.js` - Added AtmosphericBackground export
- `/app/frontend/src/App.js` - Added AtmosphericBackground globally
- `/app/frontend/src/components/HomePage.jsx` - Set transparent background
- `/app/frontend/src/styles/glassmorphism.css` - Made .dark-bg transparent

### Design Language:
- **Brand DNA:** Nothing/Teenage Engineering/Apple Vision Pro
- **Palette:** Monochrome with soft white glows
- **Material:** Frosted acrylic glass with grain texture
- **Typography:** SF Pro Display + JetBrains Mono for numbers

---

## File Structure

```
/app/frontend/src/
├── pages/community/
│   ├── CommunityHub.jsx     # /community landing
│   ├── NetworkPage.jsx      # /community/network
│   └── ConsensusPage.jsx    # /community/consensus
├── components/social/
│   ├── NetworkFeed.jsx      # Masonry feed
│   ├── ConsensusList.jsx    # Ideas list  
│   ├── CommunityPulse.jsx   # Homepage widget
│   ├── social.css           # Styles
│   └── index.js             # Exports
└── App.js                   # Routes added

---

## Design Documents
- `/app/design/GHOST_DASHBOARD_SPEC.md`
- `/app/design/SOCIAL_CORE_SPEC.md`
- `/app/design/KINETIC_UI_SPEC.md`

---

*Updated: January 23, 2025*
*Status: SOCIAL CORE + VISUAL CORRECTION + DATA SEED + PC BUILDER CHAT COMPLETE*
