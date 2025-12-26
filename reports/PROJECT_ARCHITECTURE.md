# 🏗️ PROJECT ARCHITECTURE

**Project:** Glassy Market  
**Date:** December 26, 2025  
**Stack:** React + FastAPI + MongoDB

---

## 📊 Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GLASSY MARKET                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────┐ │
│  │     FRONTEND        │  │      BACKEND        │  │   DATABASE   │ │
│  │     (React)         │◄─┤     (FastAPI)       │◄─┤   (MongoDB)  │ │
│  │     Port: 3000      │  │     Port: 8001      │  │   Port: 27017│ │
│  └─────────────────────┘  └─────────────────────┘  └──────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
/app/
├── frontend/                    # React Application
│   ├── public/
│   ├── src/
│   │   ├── components/          # UI Components
│   │   │   ├── home/            # Homepage components
│   │   │   ├── swap/            # Glassy Swap components
│   │   │   ├── chat/            # Chat components
│   │   │   ├── common/          # Shared components
│   │   │   ├── ui/              # Shadcn UI components
│   │   │   └── deprecated/      # Old components
│   │   ├── contexts/            # React Contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API & WebSocket services
│   │   └── styles/              # Global styles
│   ├── package.json
│   └── .env
│
├── backend/                     # FastAPI Application
│   ├── routes/                  # API Routes (50+ files)
│   ├── models/                  # Pydantic Models (25+ files)
│   ├── server.py               # Main server file
│   ├── requirements.txt
│   └── .env
│
└── reports/                     # Documentation
    ├── HOMEPAGE_FINAL_REPORT.md
    ├── MARKETPLACE_AUDIT_REPORT.md
    ├── PROJECT_ARCHITECTURE.md
    └── API_DOCUMENTATION.md
```

---

## 🎨 Frontend Architecture

### Components by Feature

| Feature | Components | Lines |
|---------|------------|-------|
| **Homepage** | 8 components | ~4,500 |
| **Marketplace** | 6 components | ~5,600 |
| **Glassy Swap** | 6 components | ~1,500 |
| **Auth & User** | 4 components | ~2,000 |
| **Cart & Checkout** | 3 components | ~2,000 |
| **PC Builder** | 1 component | ~2,000 |
| **Other** | 15+ components | ~4,000 |

**Total:** ~50+ components, ~21,000+ lines

### State Management

```
Contexts:
├── AuthContext.jsx        # User authentication
├── ThemeContext.jsx       # Theme (dark/light/minimal-mod)
├── LanguageContext.jsx    # Language (ru/en/advanced)
└── CartContext.jsx        # Shopping cart state
```

### Services

```
Services:
├── api.js                 # REST API calls with caching
└── websocket.js           # WebSocket for real-time updates
```

### Custom Hooks

```
Hooks:
├── useScrollReveal.js     # Scroll animations
├── useScrollRevealInit.js # Initialize scroll reveal
└── use-toast.js           # Toast notifications
```

---

## 🔧 Backend Architecture

### Routes (50+ files, ~6,000 lines)

| Category | Routes | Lines |
|----------|--------|-------|
| **Core** | product, category, search | ~700 |
| **User** | auth, cart, wishlist, order | ~700 |
| **Social** | review, question, rating, feed | ~900 |
| **Features** | swap, groupbuy, pc_build | ~950 |
| **Support** | chat, notification, activity | ~1,000 |
| **Admin** | analytics, monitoring, upload | ~500 |
| **Other** | homepage, recommendation, etc. | ~1,200 |

### Models (25+ files, ~1,700 lines)

| Model | Fields | Purpose |
|-------|--------|----------|
| `User` | 132 lines | User accounts |
| `Product` | 91 lines | Products catalog |
| `SwapListing` | 158 lines | P2P listings |
| `SwapTransaction` | 117 lines | P2P transactions |
| `Order` | 83 lines | Purchase orders |
| `Review` | 51 lines | Product reviews |
| `Article` | 71 lines | Blog articles |
| ... | ... | ... |

---

## 🔌 API Structure

### Endpoints Overview

```
/api/
├── auth/                  # Authentication
│   ├── POST /register
│   ├── POST /login
│   └── GET /me
│
├── products/              # Products
│   ├── GET /
│   ├── GET /{id}
│   ├── POST /{id}/wishlist
│   └── GET /deals
│
├── categories/            # Categories
│   └── GET /
│
├── cart/                  # Shopping cart
│   ├── GET /
│   ├── POST /items/
│   └── DELETE /items/{id}
│
├── orders/                # Orders
│   ├── POST /
│   └── GET /
│
├── swap/                  # Glassy Swap
│   ├── GET /listings
│   ├── POST /listings
│   └── GET /listings/{id}
│
├── activity/              # Live activity
│   ├── GET /feed
│   ├── GET /online
│   └── POST /ping
│
├── homepage/              # Homepage data
│   ├── GET /trending
│   ├── GET /deals
│   ├── GET /testimonials
│   └── GET /latest-articles
│
└── ... (50+ more endpoints)
```

---

## 🎯 Key Features

### 1. Homepage
- Hero Section with search
- Live Activity Feed (WebSocket)
- Trending Chips
- Quick Access Grid
- Testimonials Carousel
- Shop by Category
- Hot Deals & Popular
- Latest Articles

### 2. Marketplace
- Product catalog with filters
- Persona-based super-filter
- Quick view modal
- Image carousel
- Wishlist
- Quick buy

### 3. Glassy Swap (P2P)
- Create listing wizard
- Private chat
- AI recommendations
- Transaction system

### 4. PC Builder
- Component selection
- Compatibility check
- Price calculation
- Share builds

### 5. User System
- Registration/Login
- Profile management
- Order history
- Price alerts
- Notifications

---

## 🎨 Design System

### Themes

| Theme | Background | Style |
|-------|------------|-------|
| `dark` | #0a0a0f | Standard dark |
| `light` | #f5f5f5 | Light mode |
| `minimal-mod` | #000000 | Ultra-minimal |

### Colors

```css
--accent-purple: #8b5cf6;
--accent-blue: #3b82f6;
--accent-green: #22c55e;
--accent-red: #ff3b30;
--text-primary: rgba(255, 255, 255, 0.95);
--text-secondary: rgba(255, 255, 255, 0.6);
--glass-bg: rgba(255, 255, 255, 0.02);
--glass-border: rgba(255, 255, 255, 0.05);
```

### Typography

```css
--font-sans: Inter, system-ui, sans-serif;
--font-mono: 'SF Mono', Menlo, monospace;
```

---

## 📈 Statistics

| Metric | Value |
|--------|-------|
| **Frontend Components** | 50+ |
| **Backend Routes** | 50+ |
| **Database Models** | 25+ |
| **API Endpoints** | 100+ |
| **Total Lines of Code** | ~35,000+ |
| **CSS Files** | 15+ |
| **Test Coverage** | TBD |

---

## 🚀 Deployment

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=https://...
REACT_APP_WS_URL=wss://.../ws/activity
REACT_APP_API_CACHE_TIMEOUT=300000
```

**Backend (.env):**
```env
MONGO_URL=mongodb://...
DB_NAME=glassy_market
JWT_SECRET=...
```

### Services

- **Frontend:** Supervisor (port 3000)
- **Backend:** Supervisor (port 8001)
- **Database:** MongoDB (port 27017)

---

## 📝 Notes

1. All API routes prefixed with `/api`
2. WebSocket falls back to HTTP polling
3. Images optimized with lazy loading
4. Theme persisted to localStorage
5. Mock data used when API unavailable
