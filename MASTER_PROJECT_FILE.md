# 🎮 GLASSY MARKET / IT-HUB - МАСТЕР-ФАЙЛ ПРОЕКТА

> **Документ для передачи в Manus для супер-ресерча, аналитики и оптимизации**
> 
> **Дата создания:** Декабрь 2025
> **Версия:** 2.0
> **Статус:** Production-Ready с активной разработкой

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор проекта](#1-обзор-проекта)
2. [Технологический стек](#2-технологический-стек)
3. [Реализованный функционал](#3-реализованный-функционал)
4. [Функционал в разработке](#4-функционал-в-разработке)
5. [Запланированный функционал](#5-запланированный-функционал)
6. [Известные проблемы и баги](#6-известные-проблемы-и-баги)
7. [Архитектура системы](#7-архитектура-системы)
8. [База данных](#8-база-данных)
9. [API Endpoints](#9-api-endpoints)
10. [Интеграции](#10-интеграции)
11. [UI/UX Дизайн](#11-uiux-дизайн)
12. [Рекомендации по оптимизации](#12-рекомендации-по-оптимизации)
13. [Бизнес-логика](#13-бизнес-логика)
14. [Безопасность](#14-безопасность)
15. [Метрики и KPI](#15-метрики-и-kpi)

---

## 1. ОБЗОР ПРОЕКТА

### 1.1 Концепция
**Glassy Market** — это IT-хаб нового поколения, объединяющий:
- 🛒 **Маркетплейс** компьютерных комплектующих и периферии
- 👥 **Социальную платформу** для энтузиастов и геймеров
- 🎮 **Геймификацию** с XP, уровнями, достижениями
- 🗳️ **Систему влияния** — пользователи голосуют за развитие платформы
- 👑 **Хаб креаторов** — обзорщики и стримеры создают контент

### 1.2 Целевая аудитория
| Сегмент | Описание | Приоритет |
|---------|----------|-----------|
| Геймеры | Поиск игровой периферии и комплектующих | 🔴 Высокий |
| PC Энтузиасты | Сборка и кастомизация ПК | 🔴 Высокий |
| Контент-криэйторы | Обзорщики, стримеры | 🟡 Средний |
| Smart Home энтузиасты | Умный дом и IoT | 🟢 Низкий |

### 1.3 Бизнес-модель
1. **Маркетплейс** — комиссия 5% с продаж
2. **Групповые закупки** — организационная комиссия
3. **Премиум-контент** — верифицированные креаторы
4. **Affiliate** — партнёрские сборки товаров

---

## 2. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### 2.1 Backend
| Компонент | Технология | Версия |
|-----------|------------|--------|
| Язык | Python | 3.9+ |
| Framework | FastAPI | 0.104.x |
| Валидация | Pydantic | 2.5.x |
| База данных | MongoDB | Latest |
| MongoDB Driver | Motor (async) | 3.3.x |
| Аутентификация | JWT (python-jose) | 3.3.x |
| Хеширование | bcrypt + passlib | Latest |
| Кэширование | Redis | Latest |
| Web Push | pywebpush | Latest |
| HTTP клиент | httpx | Latest |

### 2.2 Frontend
| Компонент | Технология | Версия |
|-----------|------------|--------|
| Язык | JavaScript (ES6+) | - |
| Library | React | 18.x |
| Routing | React Router | v6 |
| State | Context API | - |
| Styling | Tailwind + Custom CSS | Latest |
| Animations | Framer Motion | Latest |
| Notifications | react-hot-toast | Latest |
| Icons | Lucide React | Latest |

### 2.3 Infrastructure
| Компонент | Технология |
|-----------|------------|
| Process Manager | Supervisor |
| Web Server | Nginx |
| Container | Kubernetes |
| Environment | .env files |

---

## 3. РЕАЛИЗОВАННЫЙ ФУНКЦИОНАЛ

### 3.1 ✅ Аутентификация и авторизация
- [x] JWT токены для аутентификации
- [x] Регистрация (email, username, password)
- [x] Вход с JWT токенами
- [x] Защищённые маршруты
- [x] Роли пользователей (User, Seller, Moderator, Admin)
- [x] bcrypt хеширование паролей

### 3.2 ✅ Маркетплейс
- [x] Каталог товаров с пагинацией
- [x] Полнотекстовый поиск
- [x] Фильтрация по категориям
- [x] Фильтрация по персонам (10 персон)
- [x] Специфические фильтры (атрибуты товаров)
- [x] Ценовой диапазон
- [x] Сортировка (новизна, цена, рейтинг, популярность)
- [x] CRUD товаров для seller/admin
- [x] View counter (автоувеличение просмотров)
- [x] Wishlist (избранное)
- [x] Product Quick View Modal

### 3.3 ✅ Каталог системы
- [x] 9 основных категорий
- [x] 45 подкатегорий
- [x] 10 персон с EN/RU локализацией:
  - Pro Gamer, Pro Creator, Audiophile
  - Smart Home, Minimalist, RGB Enthusiast
  - Next Level, Gift Seeker, Remote Worker, Mobile Setup
- [x] Мега-каталог dropdown (420px высота)
- [x] Адаптивная панель фильтров

### 3.4 ✅ Корзина и заказы
- [x] Добавление/удаление товаров
- [x] Изменение количества
- [x] Автоматический расчёт итога
- [x] Кэширование данных товаров
- [x] Checkout flow (базовый)

### 3.5 ✅ Отзывы и Q&A
- [x] Создание отзывов с рейтингом (1-5 звёзд)
- [x] Реакции на отзывы (helpful/unhelpful)
- [x] Один отзыв на пользователя на товар
- [x] Автоматический расчёт среднего рейтинга
- [x] Вопросы к товарам
- [x] Ответы с пометкой от продавца
- [x] Nested структура ответов

### 3.6 ✅ Социальные функции
| Функция | Backend | Frontend | Статус |
|---------|---------|----------|--------|
| Лента (Feed) | ✅ | ✅ Placeholder | 80% |
| Статьи (Articles) | ✅ | ✅ Placeholder | 80% |
| Креаторы (Creators) | ✅ | ✅ Placeholder | 80% |
| Голосования (Voting) | ✅ | ✅ Placeholder | 80% |
| Рейтинг (Rating) | ✅ | ✅ Placeholder | 80% |
| Групповые закупки | ✅ | ✅ Placeholder | 80% |

### 3.7 ✅ Геймификация
- [x] XP (Experience Points) — постоянные
- [x] RP (Rating Points) — ежемесячные (сбрасываются)
- [x] Level system с прогрессом
- [x] Achievements система
- [x] Streak tracking (дневной)
- [x] Вес голоса = 1 + (Level / 10)
- [x] Coins система
- [x] Referral code

### 3.8 ✅ UI/UX
- [x] 3 темы: Dark, Light, Minimal Mod
- [x] 2 языка: EN/RU
- [x] Glassmorphism дизайн
- [x] PMM.gg стиль блоков (3px radius)
- [x] Hover эффекты и анимации
- [x] LVL Menu (геймифицированный профиль)
- [x] Floating Chat Widget
- [x] Mouse Follower эффект

### 3.9 ✅ Homepage (главная)
- [x] Hero секция с loading анимацией
- [x] 4 квадратных блока (Rating, Articles, Creators, Group Buy)
- [x] Большой блок Feed
- [x] Карусель отзывов "What People Say"
- [x] Community Hub (3 виджета)
- [x] Featured Deals (PMM.gg стиль)
- [x] Топ категории

### 3.10 ✅ Система уведомлений
- [x] Web Push API (Service Worker)
- [x] VAPID ключи настроены
- [x] Push подписки в MongoDB
- [x] NotificationService на backend
- [x] Frontend утилиты (pushNotifications.js)
- [x] Страница NotificationSettings

### 3.11 ✅ Price Drop Alert System
- [x] Создание/обновление алертов
- [x] Target price или процент падения
- [x] Методы уведомления (Push, Email, SMS)
- [x] CRUD endpoints для алертов
- [x] Интеграция с price_tracker
- [x] Frontend компонент PriceAlertSettings

### 3.12 ✅ Multi-Agent AI Architecture
- [x] Orchestrator для маршрутизации запросов
- [x] Intent classification
- [x] Специализированные агенты:
  - ChatAgent — общий диалог
  - PCBuilderAgent — сборка ПК
  - RecommenderAgent — рекомендации товаров
  - ModeratorAgent — модерация контента
- [x] MemoryBank — централизованный контекст
- [x] Endpoint `/api/ai/chat`

---

## 4. ФУНКЦИОНАЛ В РАЗРАБОТКЕ

### 4.1 ⏳ Frontend для социальных функций
| Страница | Статус | Комментарий |
|----------|--------|-------------|
| /feed | Placeholder | Требуется полная разработка UI |
| /articles | Placeholder | Требуется полная разработка UI |
| /creators | Placeholder | Требуется полная разработка UI |
| /voting | Placeholder | Требуется полная разработка UI |
| /rating | Placeholder | Требуется полная разработка UI |
| /groupbuy | Placeholder | Требуется полная разработка UI |

### 4.2 ⏳ Skeleton Loading
- Компоненты созданы:
  - ProductCardSkeleton
  - ArticleCardSkeleton
  - CategoryBlockSkeleton
  - UserCardSkeleton
  - TestimonialSkeleton
- **Требуется:** интеграция в страницы

### 4.3 ⏳ Toast Notifications
- useToast хук создан
- ToastContext настроен
- **Требуется:** интеграция во все user actions

### 4.4 ⏳ Advanced Search
- Backend готов
- **Требуется:** улучшить поисковую строку, AI autocomplete

### 4.5 ⏳ AI Chat Modal
- Backend готов (Multi-Agent)
- **Требуется:** модальное окно для AI чата с floating button

---

## 5. ЗАПЛАНИРОВАННЫЙ ФУНКЦИОНАЛ

### 5.1 🔴 Высокий приоритет

#### 5.1.1 Платёжные системы
| Провайдер | Функционал | Статус |
|-----------|------------|--------|
| Tinkoff | Карты, СБП, QR | ❌ Не начато |
| Cryptomus | Crypto (USDT, USDC, DAI) | ❌ Не начато |

#### 5.1.2 Social Login
| Провайдер | Статус |
|-----------|--------|
| Google OAuth | ❌ Не начато |
| Yandex OAuth | ❌ Не начато |
| Apple Sign-In | ❌ Не начато |

#### 5.1.3 Email/SMS уведомления
- Email: SendGrid или Amazon SES
- SMS: Twilio или локальный провайдер
- **Сейчас:** stubs в NotificationService

### 5.2 🟡 Средний приоритет

#### 5.2.1 Admin Panel / CMS
- Product management
- Order management
- User management
- Content moderation
- Analytics dashboard

#### 5.2.2 Real-time функции
- WebSocket чат
- Real-time notifications
- Typing indicators

#### 5.2.3 Order Management
- Order history
- Order tracking
- Reorder functionality

### 5.3 🟢 Низкий приоритет

#### 5.3.1 SEO
- Meta tags для всех страниц
- Sitemap.xml
- Open Graph для sharing
- Schema.org разметка

#### 5.3.2 Stock Management
- Inventory system
- Restock notifications
- Supplier integration
- Tracking numbers

#### 5.3.3 Marketing Tools
- Promo codes/vouchers
- Affiliate program
- Newsletter система
- Abandoned cart recovery

---

## 6. ИЗВЕСТНЫЕ ПРОБЛЕМЫ И БАГИ

### 6.1 🔴 Критические

| Проблема | Описание | Решение |
|----------|----------|---------|
| AI не работает | Multi-Agent система требует API ключ | Добавить DEEPSEEK_API_KEY в .env |
| Email/SMS stubs | NotificationService только логирует | Интегрировать реальный провайдер |

### 6.2 🟡 Высокий приоритет

| Проблема | Описание | Решение |
|----------|----------|---------|
| Theme Switch UI | Переключатель тем может быть нестабильным | Проверить ThemeContext propagation |
| PC Builder в Minimal Mod | Чёрный текст на чёрном фоне | Theme-aware text colors |
| "ALL" кнопка в каталоге | Возможно требует верификации | Проверить trailing slash в API calls |

### 6.3 🟢 Средний приоритет

| Проблема | Описание | Решение |
|----------|----------|---------|
| Video в Hero | Проблемы с CORS для внешних video | Self-hosted video или GIF |
| WebSocket чат | Сейчас mock данные | Интегрировать WebSocket |
| Комментарии UI | API готов, UI частичный | Создать CommentSection.jsx |

---

## 7. АРХИТЕКТУРА СИСТЕМЫ

### 7.1 Файловая структура

```
/app/
├── backend/
│   ├── config/
│   │   ├── settings.py           # Конфигурация (VAPID, DB, etc.)
│   │   └── catalog_config.py     # Категории и персоны
│   ├── middleware/
│   │   ├── logging_middleware.py # Request logging
│   │   └── exception_handler.py  # Error handling
│   ├── models/                   # Pydantic модели
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   ├── order.py
│   │   ├── review.py
│   │   ├── question.py
│   │   ├── post.py               # Feed
│   │   ├── article.py
│   │   ├── creator.py
│   │   ├── voting.py
│   │   ├── rating.py
│   │   ├── groupbuy.py
│   │   └── notification.py
│   ├── routes/                   # API endpoints
│   │   ├── auth_routes.py
│   │   ├── product_routes.py
│   │   ├── cart_routes.py
│   │   ├── category_routes.py
│   │   ├── catalog_routes.py
│   │   ├── review_routes.py
│   │   ├── question_routes.py
│   │   ├── feed_routes.py
│   │   ├── article_routes.py
│   │   ├── creator_routes.py
│   │   ├── voting_routes.py
│   │   ├── rating_routes.py
│   │   ├── groupbuy_routes.py
│   │   ├── notification_routes.py
│   │   ├── price_alert_routes.py
│   │   └── ai_routes.py          # Multi-Agent AI
│   ├── services/
│   │   ├── notification_service.py
│   │   └── core_ai/              # Multi-Agent Architecture
│   │       ├── orchestrator.py
│   │       ├── memory_bank.py
│   │       └── agents/
│   │           ├── base_agent.py
│   │           ├── chat_agent.py
│   │           ├── pc_builder_agent.py
│   │           ├── recommender_agent.py
│   │           └── moderator_agent.py
│   ├── tasks/
│   │   └── price_tracker.py      # Background задачи
│   ├── utils/
│   │   ├── auth_utils.py         # JWT, password
│   │   ├── cache.py              # Redis кэш
│   │   ├── logger.py
│   │   └── recommendations.py
│   ├── database.py               # MongoDB connection
│   ├── server.py                 # FastAPI app
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── sw.js                 # Service Worker
│   └── src/
│       ├── components/
│       │   ├── home/             # Модули главной страницы
│       │   │   ├── HeroSection.jsx
│       │   │   ├── FeaturedCategories.jsx
│       │   │   ├── TrendingSection.jsx
│       │   │   └── LatestArticles.jsx
│       │   ├── ui/               # Shadcn UI компоненты
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   ├── HomePage.jsx
│       │   ├── MarketplacePage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── UserProfilePage.jsx
│       │   ├── NotificationsPage.jsx
│       │   ├── ChatFullPage.jsx
│       │   ├── PCBuilderPage.jsx
│       │   ├── FeedPage.jsx      # Placeholder
│       │   ├── ArticlesPage.jsx  # Placeholder
│       │   ├── CreatorsPage.jsx  # Placeholder
│       │   ├── VotingPage.jsx    # Placeholder
│       │   ├── RatingPage.jsx    # Placeholder
│       │   ├── GroupBuyPage.jsx  # Placeholder
│       │   ├── AuthModal.jsx
│       │   ├── FilterPanel.jsx
│       │   ├── CatalogMega.jsx
│       │   ├── FloatingChatWidget.jsx
│       │   ├── QuickViewModal.jsx
│       │   ├── PriceAlertSettings.jsx
│       │   ├── NotificationSettings.jsx
│       │   ├── OptimizedImage.jsx
│       │   └── *Skeleton.jsx     # Skeleton компоненты
│       ├── contexts/
│       │   ├── AuthContext.jsx
│       │   ├── ThemeContext.jsx
│       │   ├── LanguageContext.jsx
│       │   ├── CurrencyContext.jsx
│       │   └── ToastContext.jsx
│       ├── hooks/
│       │   └── use-toast.js
│       ├── utils/
│       │   ├── pushNotifications.js
│       │   ├── coreAI.js
│       │   └── validation.js
│       ├── styles/
│       │   ├── glassmorphism.css
│       │   ├── minimalMod.css
│       │   ├── chatWidget.css
│       │   └── mouseFollower.css
│       ├── App.js
│       └── translations.js
│
├── docs/
│   └── CORE_AI_GUIDELINES.md
│
├── PROJECT_DOCUMENTATION.md
├── PROJECT_ROADMAP.md
├── TECH_STACK.md
└── test_result.md
```

### 7.2 Архитектурные паттерны

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │              React Application                   │    │
│  │  ├── Components (UI)                            │    │
│  │  ├── Contexts (Global State)                    │    │
│  │  ├── Hooks (Logic)                              │    │
│  │  └── Utils (Helpers)                            │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 KUBERNETES INGRESS                       │
│  ┌─────────────────┬───────────────────────────────┐    │
│  │   /api/*        │        Other routes           │    │
│  │   → Port 8001   │        → Port 3000            │    │
│  └────────┬────────┴───────────────────────────────┘    │
└───────────┼─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│               FASTAPI BACKEND (8001)                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │                  Middleware                      │    │
│  │  ├── CORS                                       │    │
│  │  ├── Logging                                    │    │
│  │  └── Exception Handler                          │    │
│  ├─────────────────────────────────────────────────┤    │
│  │                   Routes                         │    │
│  │  ├── /api/auth/*                                │    │
│  │  ├── /api/products/*                            │    │
│  │  ├── /api/cart/*                                │    │
│  │  ├── /api/catalog/*                             │    │
│  │  ├── /api/feed/*                                │    │
│  │  ├── /api/ai/*                                  │    │
│  │  └── ...                                        │    │
│  ├─────────────────────────────────────────────────┤    │
│  │                  Services                        │    │
│  │  ├── NotificationService                        │    │
│  │  └── Core AI (Multi-Agent)                      │    │
│  │       ├── Orchestrator                          │    │
│  │       ├── MemoryBank                            │    │
│  │       └── Agents                                │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                            │
│  ┌─────────────┐   ┌─────────────┐   ┌────────────┐    │
│  │   MongoDB   │   │    Redis    │   │  External  │    │
│  │  (Primary)  │   │   (Cache)   │   │    APIs    │    │
│  └─────────────┘   └─────────────┘   └────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 8. БАЗА ДАННЫХ

### 8.1 MongoDB Collections

| Collection | Описание | Ключевые поля |
|------------|----------|---------------|
| users | Пользователи | id, email, username, level, xp, coins |
| products | Товары | id, name, price, category_id, persona_id |
| categories | Категории | id, name_en, name_ru, subcategories |
| carts | Корзины | id, user_id, items, total |
| orders | Заказы | id, user_id, items, status, payment |
| reviews | Отзывы | id, product_id, user_id, rating, comment |
| questions | Вопросы | id, product_id, user_id, answers |
| posts | Посты (Feed) | id, user_id, content, likes, comments |
| articles | Статьи | id, user_id, title, content, status |
| creators | Креаторы | id, user_id, verified, followers |
| proposals | Голосования | id, user_id, title, votes_up, votes_down |
| user_stats | Статистика XP/RP | id, user_id, total_xp, monthly_rp |
| groupbuys | Групповые закупки | id, organizer_id, participants, status |
| price_alerts | Алерты цен | id, user_id, product_id, target_price |
| push_subscriptions | Push подписки | id, user_id, subscription |
| ai_conversations | AI диалоги | user_id, messages |

### 8.2 Схема User

```javascript
{
  id: "uuid",                    // Кастомный UUID (не ObjectId)
  email: "user@example.com",
  username: "ProGamer_2024",
  hashed_password: "bcrypt_hash",
  
  // Роли
  is_active: true,
  is_admin: false,
  is_seller: false,
  is_moderator: false,
  is_verified_creator: false,
  
  // Геймификация
  level: 3,
  experience: 1250,
  coins: 2500,
  monthly_rp: 450,
  current_streak: 7,
  achievements: ["first_purchase", "article_published"],
  
  // Профиль
  avatar_url: "🎮",
  bio: "Pro gamer and tech enthusiast",
  location: "Moscow, Russia",
  website: "https://example.com",
  referral_code: "PROGAMER24",
  online_status: "online",     // online, away, busy, offline
  
  // Привилегии
  has_video_hover: false,
  video_hover_url: null,
  
  wishlist: ["product_id_1", "product_id_2"],
  
  created_at: "2025-01-07T...",
  updated_at: "2025-01-07T..."
}
```

### 8.3 Схема Product

```javascript
{
  id: "uuid",
  seller_id: "user_id",
  name: "Gaming Mouse X",
  description: "Premium gaming mouse...",
  price: 79.99,
  original_price: 99.99,
  
  category_id: "100",           // PC Components
  sub_category_id: "130",       // Mice
  persona_id: "pro_gamer",
  
  images: [
    { url: "...", is_primary: true }
  ],
  specs: {
    "DPI": "25600",
    "Weight": "60g",
    "RGB": "Yes"
  },
  specific_attributes: {
    "polling_rate_hz": 8000,
    "weight_g": 60,
    "wireless": true
  },
  
  stock: 50,
  rating: 4.5,
  reviews_count: 23,
  view_count: 1250,
  wishlist_count: 45,
  
  status: "approved",           // pending, approved, rejected
  created_at: "...",
  updated_at: "..."
}
```

### 8.4 Схема Price Alert

```javascript
{
  id: "uuid",
  user_id: "user_id",
  product_id: "product_id",
  enabled: true,
  target_price: 299.99,         // Целевая цена ИЛИ
  price_drop_percent: 10,       // Процент падения
  notification_methods: {
    push: true,
    email: false,
    sms: false
  },
  triggered: false,
  created_at: "...",
  updated_at: "..."
}
```

---

## 9. API ENDPOINTS

### 9.1 Authentication
| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| POST | /api/auth/register | Регистрация | ❌ |
| POST | /api/auth/login | Вход | ❌ |
| GET | /api/auth/me | Текущий пользователь | ✅ |

### 9.2 Products
| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | /api/products | Список товаров | ❌ |
| GET | /api/products/{id} | Один товар | ❌ |
| POST | /api/products | Создать товар | Seller/Admin |
| PUT | /api/products/{id} | Обновить товар | Seller/Admin |
| DELETE | /api/products/{id} | Удалить товар | Seller/Admin |
| POST | /api/products/{id}/wishlist | Toggle wishlist | ✅ |

### 9.3 Catalog
| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | /api/catalog/personas | Список персон | ❌ |
| GET | /api/catalog/categories | Список категорий | ❌ |

### 9.4 Cart
| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | /api/cart | Получить корзину | ✅ |
| POST | /api/cart/items | Добавить товар | ✅ |
| PUT | /api/cart/items/{id} | Обновить количество | ✅ |
| DELETE | /api/cart/items/{id} | Удалить товар | ✅ |
| DELETE | /api/cart | Очистить корзину | ✅ |

### 9.5 Reviews & Q&A
| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | /api/reviews/product/{id} | Отзывы товара | ❌ |
| POST | /api/reviews | Создать отзыв | ✅ |
| POST | /api/reviews/{id}/reaction | Реакция | ✅ |
| GET | /api/questions/product/{id} | Вопросы товара | ❌ |
| POST | /api/questions | Задать вопрос | ✅ |
| POST | /api/questions/{id}/answers | Ответить | ✅ |

### 9.6 Social Features
| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | /api/feed | Лента постов | ❌ |
| POST | /api/feed | Создать пост | ✅ |
| POST | /api/feed/{id}/like | Лайк | ✅ |
| GET | /api/articles | Список статей | ❌ |
| POST | /api/articles | Создать статью | ✅ |
| GET | /api/voting | Голосования | ❌ |
| POST | /api/voting/{id}/vote | Проголосовать | ✅ |
| GET | /api/rating/leaderboard | Рейтинг | ❌ |
| GET | /api/groupbuy | Групповые закупки | ❌ |
| POST | /api/groupbuy/{id}/join | Присоединиться | ✅ |

### 9.7 Notifications & Alerts
| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| POST | /api/notifications/subscribe | Push подписка | ✅ |
| POST | /api/notifications/unsubscribe | Отписка | ✅ |
| GET | /api/price-alerts | Мои алерты | ✅ |
| POST | /api/price-alerts | Создать алерт | ✅ |
| PATCH | /api/price-alerts/{id}/toggle | Toggle алерт | ✅ |
| DELETE | /api/price-alerts/{id} | Удалить алерт | ✅ |

### 9.8 AI
| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| POST | /api/ai/chat | Multi-Agent AI | ✅ |

---

## 10. ИНТЕГРАЦИИ

### 10.1 Реализованные

| Интеграция | Статус | Детали |
|------------|--------|--------|
| MongoDB | ✅ Работает | Motor async driver |
| Redis | ✅ Работает | Кэширование |
| Web Push API | ✅ Работает | pywebpush + SW |
| react-hot-toast | ✅ Работает | Frontend нотификации |
| framer-motion | ✅ Работает | Анимации |

### 10.2 Настроенные (требуют API ключ)

| Интеграция | Статус | Что нужно |
|------------|--------|-----------|
| Deepseek LLM | ⏳ Требует ключ | DEEPSEEK_API_KEY в .env |

### 10.3 Запланированные

| Интеграция | Приоритет | Описание |
|------------|-----------|----------|
| Tinkoff | 🔴 Высокий | Карты, СБП, QR |
| Cryptomus | 🔴 Высокий | Crypto payments |
| Google OAuth | 🔴 Высокий | Social login |
| Yandex OAuth | 🟡 Средний | Social login |
| SendGrid | 🟡 Средний | Email |
| Twilio | 🟢 Низкий | SMS |

---

## 11. UI/UX ДИЗАЙН

### 11.1 Цветовая палитра

#### Dark Theme (основная)
```css
--bg-primary: #0a0a0a
--bg-secondary: rgb(10, 10, 10)
--bg-glass: rgba(255, 255, 255, 0.05)
--text-primary: #ffffff
--text-secondary: rgba(255, 255, 255, 0.7)
--accent-purple: #a855f7
--accent-blue: #3b82f6
--border: rgba(255, 255, 255, 0.1)
```

#### Light Theme
```css
--bg-primary: #ffffff
--text-primary: #000000
```

#### Minimal Mod Theme
```css
--font-family: 'SF Mono', monospace
--border-radius: 0px
--no-glassmorphism
```

### 11.2 Дизайн-система PMM.gg

- **Border-radius:** 3px (минимальные скругления)
- **Gap:** 24px
- **Padding:** 40px (2.5rem)
- **Container:** 1840px max-width
- **Aspect-ratio блоков:** 1:1

### 11.3 Glassmorphism

```css
.glass-strong {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
}
```

### 11.4 Text Size Hierarchy

| Элемент | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1 | text-4xl | text-5xl | text-6xl |
| H2 | text-base | text-lg | text-lg |
| Body | text-sm | text-base | text-base |
| Small | text-xs | text-sm | text-sm |

---

## 12. РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ

### 12.1 Производительность

| Область | Рекомендация | Приоритет |
|---------|--------------|-----------|
| Images | Lazy loading + WebP формат | 🔴 |
| Code Splitting | React.lazy для routes | 🔴 |
| Caching | Расширить использование Redis | 🟡 |
| CDN | CloudFlare для static assets | 🟡 |
| API | Response compression | 🟢 |

### 12.2 Масштабируемость

| Область | Рекомендация | Приоритет |
|---------|--------------|-----------|
| Database | Индексы для частых запросов | 🔴 |
| Microservices | Выделить AI в отдельный сервис | 🟡 |
| Queue | Celery для background tasks | 🟡 |
| Load Balancing | Несколько replicas backend | 🟢 |

### 12.3 User Experience

| Область | Рекомендация | Приоритет |
|---------|--------------|-----------|
| Skeleton Loading | Интегрировать везде | 🔴 |
| Error States | Улучшить error handling | 🔴 |
| Offline Support | PWA с Service Worker | 🟡 |
| Accessibility | ARIA labels, keyboard nav | 🟡 |

### 12.4 Security

| Область | Рекомендация | Приоритет |
|---------|--------------|-----------|
| Rate Limiting | Добавить на все endpoints | 🔴 |
| Input Validation | Строже валидировать | 🔴 |
| 2FA | Two-Factor Authentication | 🟡 |
| CSRF | Tokens для форм | 🟡 |

### 12.5 Monitoring & Analytics

| Область | Рекомендация | Приоритет |
|---------|--------------|-----------|
| Error Tracking | Sentry | 🔴 |
| Analytics | Google Analytics / Yandex Metrica | 🟡 |
| Heatmaps | Hotjar | 🟢 |
| Performance | Lighthouse CI | 🟢 |

---

## 13. БИЗНЕС-ЛОГИКА

### 13.1 Расчёт стоимости

```python
# Итоговая цена товара
final_price = base_price * (1 - discount/100)

# Корзина
cart_subtotal = sum(item.price * item.quantity for item in cart.items)

# Комиссия платформы (не вычитается из цены покупателя)
platform_commission = cart_subtotal * 0.05  # 5%
```

### 13.2 Геймификация

```python
# XP (постоянные очки)
actions_xp = {
    "purchase": 50,
    "verify_profile": 100,
    "write_article": 100,
    "successful_groupbuy": 50
}

# RP (ежемесячные очки)
actions_rp = {
    "create_post": 5,
    "like_received": 2,
    "comment": 1,
    "vote_cast": 3,
    "join_groupbuy": 5
}

# Вес голоса
vote_weight = 1.0 + (user_level / 10.0)
# Level 1  → вес 1.1
# Level 10 → вес 2.0
# Level 50 → вес 6.0
```

### 13.3 Групповые закупки

```python
def calculate_current_price(original, target, current, min_participants):
    if current >= min_participants:
        return target
    
    progress = current / min_participants
    price_diff = original - target
    return original - (price_diff * progress)
```

### 13.4 Роли пользователей

| Роль | Права |
|------|-------|
| Guest | Просмотр товаров и публичного контента |
| User | + Покупки, отзывы, посты, голосования |
| Seller | + Создание/редактирование товаров |
| Moderator | + Модерация контента |
| Admin | Полный доступ |

---

## 14. БЕЗОПАСНОСТЬ

### 14.1 Реализовано

- [x] JWT аутентификация
- [x] bcrypt хеширование паролей
- [x] CORS настройки
- [x] Защищённые endpoints
- [x] Role-based access control

### 14.2 Требуется

- [ ] Rate limiting
- [ ] Input sanitization
- [ ] CSRF protection
- [ ] 2FA
- [ ] Audit logging
- [ ] Security headers

---

## 15. МЕТРИКИ И KPI

### 15.1 Business Metrics

| Метрика | Описание | Target |
|---------|----------|--------|
| Conversion Rate | Visitors → Purchases | 2-3% |
| AOV | Average Order Value | $100+ |
| Cart Abandonment | Брошенные корзины | <70% |
| Return Rate | Возвращающиеся клиенты | 30%+ |

### 15.2 Technical Metrics

| Метрика | Описание | Target |
|---------|----------|--------|
| Page Load Time | Время загрузки страницы | <3s |
| API Response Time | Время ответа API | <500ms |
| Uptime | Доступность | 99.9% |
| Error Rate | Процент ошибок | <0.1% |

### 15.3 User Engagement

| Метрика | Описание | Target |
|---------|----------|--------|
| Time on Site | Время на сайте | 5+ min |
| Pages per Session | Страниц за сессию | 5+ |
| Bounce Rate | Отказы | <50% |
| Chat Engagement | Использование чата | 10%+ |

---

## 📎 ПРИЛОЖЕНИЯ

### A. Тестовые учётные данные

```
Email: testalert@example.com
Password: TestAlert123

Тестовый товар: 8529f6c3-b561-462c-a602-f6fcb66edddc (Sony WH-1000XM5)
```

### B. Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
SECRET_KEY=your_jwt_secret_key
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
DEEPSEEK_API_KEY=...  # Требуется для AI
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://your-domain.com/api
```

### C. Supervisor команды

```bash
sudo supervisorctl status          # Статус сервисов
sudo supervisorctl restart all     # Перезапуск всех
sudo supervisorctl restart backend # Только backend
sudo supervisorctl restart frontend # Только frontend

# Логи
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log
```

---

## 📞 КОНТАКТЫ И ПОДДЕРЖКА

- **Документация:** /app/PROJECT_DOCUMENTATION.md
- **Roadmap:** /app/PROJECT_ROADMAP.md
- **Tech Stack:** /app/TECH_STACK.md
- **Test Results:** /app/test_result.md

---

**Последнее обновление:** Декабрь 2025
**Версия документа:** 2.0
**Автор:** AI Development Team
