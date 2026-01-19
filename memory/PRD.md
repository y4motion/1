# Glassy.Tech - Product Requirements Document

## Original Problem Statement
Full-stack marketplace platform for tech/gaming products with AI-powered assistance, behavior analytics, and "Glassy Mind" intelligent agent system.

## Core Features

### Implemented ✅
- **Homepage:** Ultra-minimalist "calm premium tech" aesthetic
- **Marketplace:** Product cards with hover panels, FastBuyModal + Stripe
- **Product Detail Page:** Dynamic KeySpecs, ExpandableBlocks
- **Glassy Mind Module:**
  - User behavior tracking with MongoDB persistence
  - A/B testing framework
  - AI chat agent (GPT-4.1-mini)
  - **Living Bar** — agent status system (idle → analyzing → ready_to_suggest)
  - **Rules Engine** — 6 behavioral rules (hesitation, big_spender, tech_geek, etc.)
  - **Notification Service** — email templates (mock), soft push queue
- **Admin Dashboard:** `/admin/mind`
- **Cart System:** CartContext + Stripe

### In Progress 🔄
- Resend integration for real email sending
- ML predictor for conversion probability

### Backlog 📋
- User Trust/Rating System
- Social features (`/feed`, `/articles`, `/creators`)
- Alternative payments (Tinkoff + Cryptomus)
- Performance optimization

## Technical Architecture
```
/app/backend/glassy_mind/
├── state_manager.py      # Singleton for agent state
├── observer.py           # User tracking + MarketObserver
├── rules_engine.py       # 6 behavioral rules
├── notification_service.py # Email + soft push
├── expert_brain.py       # Compatibility analysis
├── chat_agent.py         # GPT-4.1-mini
└── router.py             # API endpoints
```

## Key API Endpoints
- `POST /api/mind/event` — track user events
- `GET /api/mind/agent-status` — Living Bar status
- `GET /api/mind/rules` — list all rules
- `POST /api/mind/notifications/test` — test email
- `GET /api/mind/notifications/pending` — queued notifications

## Integrations
- **Stripe:** Payments
- **emergentintegrations:** OpenAI GPT-4.1-mini
- **Resend:** Email (configured, mock mode)

---
*Last Updated: January 19, 2025*
