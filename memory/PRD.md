# Glassy.Tech - Product Requirements Document

## Original Problem Statement
Full-stack marketplace platform for tech/gaming products with AI-powered assistance, user behavior analytics, and "Glassy Mind" intelligent agent system.

## Core Features

### Implemented ✅
- **Homepage:** Ultra-minimalist design with "calm premium tech" aesthetic (purple/blue/teal palette)
- **Marketplace:** Product cards with hover-activated expanded panels, Shopify-style FastBuyModal
- **Product Detail Page:** Dynamic components (KeySpecs, ExpandableBlocks) based on product tags
- **Glassy Mind Module:** 
  - User behavior tracking (views, cart adds, dwell time)
  - Session management with MongoDB persistence
  - A/B testing framework
  - AI chat agent (GPT-4.1-mini via emergentintegrations)
  - Product compatibility analyzer
  - **NEW:** "Living Bar" agent status system (idle → analyzing → ready_to_suggest)
- **Admin Dashboard:** `/admin/mind` for analytics monitoring
- **Cart System:** CartContext with Stripe integration
- **GlassyChatBar:** Collapsible chat bar with WebSocket support, voice input

### In Progress 🔄
- **Notification System:** Email via Resend, ML predictor, webhooks (Task started, not completed)
- **Mixed Content Bug Fix:** Reviews/Q&A tabs not loading live data

### Backlog 📋
- Authenticated chat testing for Glassy Swap
- "sudo make me a sandwich" Easter Egg
- User Trust/Rating System
- Social features (`/feed`, `/articles`, `/creators`)
- Alternative payments (Tinkoff + Cryptomus)
- Performance optimization (lazy loading, image optimization)

## Technical Architecture

```
/app/
├── backend/
│   ├── glassy_mind/           # AI/Analytics brain
│   │   ├── observer.py        # User tracking + Agent Status
│   │   ├── expert_brain.py    # Compatibility analysis
│   │   ├── router.py          # API endpoints
│   │   ├── chat_agent.py      # GPT-4.1-mini integration
│   │   ├── abandoned_cart.py  # Webhook system
│   │   └── email_notifications.py
│   ├── routes/
│   └── server.py
└── frontend/
    └── src/
        ├── components/
        │   ├── chat/
        │   │   ├── GlassyChatBar.jsx  # Living Bar implementation
        │   │   └── GlassyChatBar.css
        │   ├── admin/
        │   └── marketplace/
        └── contexts/
```

## Key API Endpoints

### Glassy Mind (`/api/mind/*`)
- `GET /status` - Module status
- `GET /agent-status` - UI "Living Bar" status (polling every 10s)
- `POST /agent-status/dismiss` - Clear suggestion
- `POST /track/view` - Track product view
- `POST /track/cart` - Track cart add
- `POST /chat` - AI chat endpoint
- `GET /ab-test/results` - A/B testing analytics

## Integrations
- **Stripe:** Payment processing
- **emergentintegrations:** OpenAI GPT-4.1-mini for chat
- **Resend:** Email notifications (configured, not fully implemented)

## Known Issues
- **P1:** Mixed Content errors preventing Reviews/Q&A tabs from loading
- **P1:** ProductCard hover panel requires robustness verification

---
*Last Updated: January 19, 2025*
