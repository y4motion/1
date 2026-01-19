# Glassy Market - Product Requirements Document

## Original Problem Statement
Full-stack gaming marketplace with React + FastAPI + MongoDB. The project evolved from initial bug fixes into a major UI/UX redesign with multiple phases:

1. Ultra-minimalist homepage redesign
2. Shopify-style marketplace with interactive ProductCards
3. Next-Gen ProductDetailPage with TJExclusives/Gearz.gg style components
4. **Site-wide "Calm Premium Tech" design system** (Apple Vision Pro + Linear style)

## User Personas
- Gaming enthusiasts looking for premium gear
- PC builders seeking components
- Tech-savvy users who appreciate minimalist, premium design

## Core Requirements
- **Marketplace:** Grid of products with interactive hover panels
- **Product Detail:** Universal, API-driven page with multi-component layout
- **Payments:** Stripe integration via FastBuyModal
- **Listing Creation:** 4-step wizard for sellers
- **Design Philosophy:** Calm Premium Tech - soft purples, teals, no aggressive neon green

---

## What's Been Implemented

### January 19, 2026 - Session 3: Glassy Mind AI Brain
- **Created `/app/backend/glassy_mind/` module:**
  - `observer.py` — Отслеживание поведения пользователей (views, cart, dwell time)
  - `expert_brain.py` — TechExpert для анализа совместимости и рекомендаций
  - `router.py` — FastAPI эндпоинты `/api/mind/*`
  - `__init__.py` — Экспорты модуля

- **API Endpoints:**
  - `POST /api/mind/track/view` — Отслеживание просмотров
  - `POST /api/mind/track/cart` — Отслеживание добавлений в корзину
  - `POST /api/mind/track/dwell` — Отслеживание времени на странице
  - `POST /api/mind/analyze` — Полный анализ с рекомендациями
  - `POST /api/mind/compatibility` — Проверка совместимости компонентов
  - `GET /api/mind/suggestions` — Персональные предложения
  - `GET /api/mind/status` — Статус системы
  - `GET /api/mind/context` — Контекст пользователя

### January 19, 2026 - Session 2: Dynamic Components
- **Made ExpandableBlocks dynamic:**
  - Now shows category-specific content based on product tags
  - Headphones: Battery Details + Weight Breakdown
  - Mouse: Sensor + Weight
  - Keyboard: Switches + Battery
  - Monitor: Panel + Color specs
  - GPU: Performance + Power requirements

- **Made KeySpecs dynamic:**
  - Now reads product.tags to determine category
  - Shows appropriate specs for each product type

### January 19, 2026 - Session 1: Calm Premium Tech Design System
- **Applied new color palette site-wide:**
  - Replaced all `#00ff88` (neon green) with `#8b5cf6` (soft purple) and `#14b8a6` (teal)
  - Updated CSS variables in all marketplace components
  - Created `/app/frontend/src/styles/refined-colors.css` as the single source of truth

- **Updated CSS Files:**
  - `ProductDetailPage.css` - Full rewrite with new palette
  - `tabs/TabStyles.css` - Tabs now use purple/teal accents
  - `KeySpecs.css` - Highlight values now teal
  - `ExpandableBlock.css` - Purple accent on expand
  - `ProductCustomizer.css` - Weight values now purple
  - `ProductReactions.css` - Active state now purple

### Previously Completed (from handoff)
- Ultra-minimalist homepage
- ProductCard with hover-activated expanded panel
- ProductDetailPage with TJExclusives-style gallery
- LiveChatWidget (floating panel)
- ProductReactions component
- KeySpecs and ExpandableBlock components
- Tab components (Overview, Specs, Reviews, Community, Q&A)
- FastBuyModal with Stripe integration ✓ TESTED
- Create Listing wizard ✓ TESTED
- CartContext for robust cart functionality

---

## Design System Variables (refined-colors.css)

```css
/* Primary Accents */
--accent-primary: #8b5cf6;      /* Soft Purple */
--accent-secondary: #3b82f6;    /* Calm Blue */
--success-color: #14b8a6;       /* Soft Teal (for stock, verified badges) */

/* Glass Effects */
--glass-light: rgba(255, 255, 255, 0.04);
--glass-medium: rgba(255, 255, 255, 0.06);
--glass-border-subtle: rgba(255, 255, 255, 0.06);
--glass-border-visible: rgba(255, 255, 255, 0.12);

/* Glows */
--glow-subtle: 0 0 24px rgba(139, 92, 246, 0.1);
--glow-medium: 0 0 32px rgba(139, 92, 246, 0.15);
```

---

## Prioritized Backlog

### P0 - Critical
- [x] Apply "Calm Premium Tech" design system ✅ DONE
- [x] Make ExpandableBlocks dynamic (category-aware) ✅ DONE
- [x] Make KeySpecs dynamic (uses tags) ✅ DONE

### P1 - High Priority
- [ ] Make ProductDetailPage tabs fully API-driven (replace remaining mock data)
- [x] Verify ProductCard expanded panel robustness ✅ VERIFIED (visual check)

### P2 - Medium Priority
- [ ] Test authenticated chat for "Glassy Swap"
- [ ] Implement "sudo make me a sandwich" Easter Egg
- [ ] Build User Trust/Rating System

### P3 - Future
- [ ] CORE AI Features with Deepseek (recommendations)
- [ ] Social features: `/feed`, `/articles`, `/creators`
- [ ] Alternative payments: Tinkoff + Cryptomus
- [ ] Performance optimization (lazy loading, image optimization)
- [ ] A/B Testing setup

---

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py
│   └── routes/
│       ├── payment_routes.py
│       ├── promo_routes.py
│       ├── swap_routes.py
│       └── user_address_routes.py
└── frontend/
    └── src/
        ├── App.js
        ├── components/
        │   ├── marketplace/
        │   │   ├── ProductDetailPage.jsx/css  ← UPDATED
        │   │   ├── LiveChatWidget.jsx/css
        │   │   ├── ProductReactions.jsx/css   ← UPDATED
        │   │   ├── KeySpecs.jsx/css           ← UPDATED
        │   │   ├── ExpandableBlock.jsx/css    ← UPDATED
        │   │   ├── ProductCustomizer.jsx/css  ← UPDATED
        │   │   └── tabs/
        │   │       └── TabStyles.css          ← UPDATED
        │   └── MarketplacePage.jsx
        ├── contexts/
        │   └── CartContext.jsx
        └── styles/
            └── refined-colors.css             ← SOURCE OF TRUTH
```

---

## Key API Endpoints
- `GET /api/products/` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/payments/create-payment-intent` - Stripe payment
- `POST /api/swap/listings` - Create listing

---

## 3rd Party Integrations
- **Stripe:** Payment processing (tested, working)
- **Deepseek:** Planned for AI features (not yet integrated)

---

## Known Issues
- ProductCard expanded panel may need robustness testing
- ProductDetailPage uses hardcoded mock data (needs API integration)

---

## Testing Status
- FastBuyModal: ✅ E2E tested
- Create Listing Wizard: ✅ E2E tested
- Design System Update: ✅ Visual verification done

---

## User Language
Russian (Русский)
