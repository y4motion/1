# Glassy Marketplace PRD

## Original Problem Statement
Build a sophisticated multi-purpose chat widget "Glassy Omni-Chat" with "Deep Acrylic" / "Agar Style" aesthetic for a tech marketplace. The widget should feature multiple modes (AI Assistant, Community, Commerce, Support), context-aware behavior, and a "Smart Bubbles" navigation system.

## Core Features Implemented

### 1. Glassy Omni-Chat (Deep Acrylic Redesign) ✅
**Completed: Jan 19, 2026**
- "Breathing Strip" idle state with pulsing border animation
- Morphing transition from strip to expanded HUD via framer-motion
- Context-aware status: "AI ANALYZING CONTEXT..." on Assembly/PC Builder pages
- Detached "Input Island" below the main window
- Multi-tab navigation (AI, Global, Guilds, Trade, Support)
- Smart Channel Switcher for Guilds/Trade sub-navigation
- Agar Acrylic material: 24px blur, deep shadows, noise texture

### 2. AI Rules Engine & State Manager ✅
- `state_manager.py`: Tracks user action counts and status
- `rules_engine.py`: Triggers AI interventions based on behavior patterns
- Proactive AI suggestions based on 'Hesitation' and 'Big Spender' patterns

### 3. Hardware Compatibility Engine ✅
- `compatibility_service.py`: Validates CPU socket, GPU size, PSU wattage
- `/api/builder/validate` endpoint for real-time PC build validation
- `CompatibilityResolver.jsx` UI component for error display

### 4. Database Seeding ✅
- `seed_tech_data.py`: Populates database with realistic tech products
- Products include detailed `specs` for compatibility checks

## Pending Verification (P1)
- **Mixed Content Error Fix**: ReviewsTab and QATab should load data correctly on product detail pages

## Upcoming Tasks (P2)
- Voice messages and Screen Share for Support Chat mode
- Smart PC Builder Start (budget-based recommendations)
- ProductCard hover panel robustness verification

## Future Tasks (Backlog)
- Authenticated Chat for "Glassy Swap"
- "sudo make me a sandwich" Easter Egg
- User Trust/Rating System
- Social features: /feed, /articles, /creators
- Alternate Payment Systems (Tinkoff + Cryptomus)
- Performance Optimization (lazy loading, image optimization)

## Tech Stack
- Frontend: React + Tailwind CSS + framer-motion + lucide-react
- Backend: FastAPI + MongoDB
- AI Integration: OpenAI GPT via emergentintegrations
- Payments: Stripe (integrated)

## Key API Endpoints
- `POST /api/builder/validate` - PC build compatibility check
- `POST /api/mind/event` - User action tracking
- `GET /api/mind/agent-status` - AI status polling
- `POST /api/mind/chat` - AI chat endpoint

## Architecture
```
/app/backend/
├── glassy_mind/
│   ├── state_manager.py
│   ├── rules_engine.py
│   └── notification_service.py (MOCK)
├── services/
│   └── compatibility_service.py
└── routes/
    └── builder_routes.py

/app/frontend/src/components/
├── chat/
│   ├── GlassyOmniChat.jsx (Deep Acrylic Style)
│   ├── GlassyOmniChat.css
│   └── SmartChannelSwitcher.jsx
└── pc-builder/
    └── CompatibilityResolver.jsx
```

## 3rd Party Integrations
- **Stripe**: Payments (tested, working)
- **emergentintegrations (OpenAI)**: AI Chat (uses Emergent LLM Key)
- **resend**: Email notifications (MOCKED)
- **framer-motion**: Animations for chat morphing
