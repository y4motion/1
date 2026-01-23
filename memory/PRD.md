# Ghost Protocol - PRD
## Social Core Complete

### Original Problem Statement
Build comprehensive social layer with:
- **The Network** - Content feed (posts, guides, showcases)
- **The Consensus** - King of the Hill idea voting with RP economics
- **Hall of Monarchs** - Leaderboards and achievements

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

---

## Next Steps 

### P0 - Critical (DONE)
- [x] Create `/community` hub page
- [x] NetworkFeed.jsx - Masonry grid
- [x] ConsensusList.jsx - Ideas with voting
- [x] CommunityPulse.jsx - Homepage widget (flip card)

### P1 - High (Upcoming)
- [ ] **Visual Correction Pass** - Align with Nothing OS aesthetic (see FUTURE_VISUAL_CORRECTION.md)
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
*Status: SOCIAL CORE COMPLETE (Backend + Frontend)*
