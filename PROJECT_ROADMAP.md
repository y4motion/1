# 🎮 MINIMAL MARKET - Полная Дорожная Карта Проекта

## 📋 СОДЕРЖАНИЕ
1. [Реализованные Функции](#реализованные-функции)
2. [Запросы В Ожидании](#запросы-в-ожидании)
3. [Структура Проекта](#структура-проекта)
4. [Рекомендации По Развитию](#рекомендации-по-развитию)

---

## ✅ РЕАЛИЗОВАННЫЕ ФУНКЦИИ

### **Phase 1: Базовая Инфраструктура**
- ✅ **FastAPI Backend** + MongoDB + JWT аутентификация
- ✅ **React Frontend** с TypeScript поддержкой
- ✅ **Темная/Светлая тема** с полной адаптацией UI
- ✅ **Мультиязычность** (EN/RU) через i18n
- ✅ **Glassmorphism дизайн** - минималистичный акриловый стиль

### **Phase 2: UI/UX Компоненты**

#### **Header & Navigation**
- ✅ Минималистичный header с glassmorphism
- ✅ **LVL Menu (Gamified User Profile)**
  - Перемещено с правой кнопки на левый логотип (Power button)
  - XP прогресс, уровни, достижения
  - Daily quests, inventory, rewards
  - Bonus balance, spin wheel
  - Referral code система
  - **Адаптивный цвет текста** (белый в темной теме, черный в светлой)
- ✅ Переключатель темы/языка в правом углу
- ✅ Простая кнопка Login/Logout справа

#### **Marketplace Page**
- ✅ **Layout Structure:**
  - "MINIMAL MARKET" заголовок с подзаголовком
  - Search bar по центру под заголовком
  - "CATALOG" button для категорий
  - Featured chips + View controls (grid/list/items-per-page) в одном ряду
  
- ✅ **Product Cards (Pinterest Style):**
  - 4 карточки в ряд
  - Image carousel с навигацией
  - Название товара под фото с acrylic эффектом (тусклое → яркое при hover)
  - **Миниатюрные элементы внизу справа (наполовину выходят за контур):**
    - Белый минималистичный рейтинг с контурной звездочкой
    - Красное сердечко (wishlist) с счетчиком при hover
  - White matte acrylic price tag (исчезает при hover)
  - Purple pulsing "BUY NOW" button (появляется при hover)
  - Smooth hover effects с увеличением и тенью

- ✅ **Filter System:**
  - Floating "FILTERS" button слева (scroll-following)
  - Sliding filter panel (pushes content, no backdrop blur)
  - Comprehensive tech filters:
    - PC Components (GPU, CPU, RAM, etc.)
    - Peripherals (Mouse, Keyboard, Headset)
    - Price range
    - Popularity, Rating
    - Color options
  - Search внутри фильтров
  - Единый дизайн с header (glassmorphism)

#### **Product Detail Page**
- ✅ Image gallery с carousel
- ✅ Product info (цена, наличие, описание)
- ✅ Quantity selector
- ✅ "Add to Cart" button
- ✅ Wishlist button
- ✅ **Share button** (Web Share API + fallback копирование)
- ✅ Tabs: Overview, Specifications, Reviews, Q&A, Live Chat
- ✅ Trust badges (Secure Payment, Fast Shipping, 24/7 Support)

#### **Quick Buy Modal**
- ✅ **3-колоночный Layout:**
  - Product image & info (слева)
  - Customer form (центр): ФИО, телефон, адрес доставки
  - Payment methods (справа): карта, СБП, QR, криптовалюта
- ✅ **Stock Management:**
  - Stock indicator
  - "Under Order" notification для товаров не в наличии
  - Preorder с указанием дней доставки
- ✅ **Share button** ("Поделиться товаром")
- ✅ Dark purple theme, glassmorphism

### **Phase 3: Backend Features**

#### **Models (Pydantic + MongoDB)**
- ✅ `User` - пользователи с JWT auth
- ✅ `Product` - товары с полями:
  - stock, is_available
  - allow_preorder, preorder_delivery_days
  - images[], tags[], category
  - price, average_rating, wishlist_count
- ✅ `Category` - категории товаров
- ✅ `Cart` - корзина пользователя
- ✅ `Order` - заказы (зарегистрированные + quick-buy)
- ✅ `PaymentMethod` - способы оплаты (admin-configurable)
- ✅ `Review` - отзывы товаров
- ✅ `Question` - вопросы к товарам
- ✅ `Chat` - чат с поддержкой (базовая структура)

#### **API Endpoints**
- ✅ `/api/auth/*` - регистрация, вход, JWT tokens
- ✅ `/api/products/*` - CRUD товаров, фильтры, поиск
- ✅ `/api/categories/*` - категории
- ✅ `/api/cart/*` - управление корзиной
- ✅ `/api/orders/*` - создание заказов
- ✅ `/api/payment-settings/*` - настройка способов оплаты (admin)
- ✅ `/api/reviews/*` - отзывы
- ✅ `/api/questions/*` - вопросы к товарам

---

## ⏳ ЗАПРОСЫ В ОЖИДАНИИ (Pending Tasks)

### **High Priority - Критичные Функции**

#### **1. Payment Integration**
- ⏳ **Tinkoff Integration:**
  - Terminal Key, Secret Key
  - Банковские карты (Visa, Mastercard, МИР)
  - СБП (Система Быстрых Платежей)
  - QR code payments
- ⏳ **Crypto Payment Gateway:**
  - Top 5 stablecoins (USDT, USDC, DAI, BUSD, PAX)
  - Top 5 networks (Ethereum, BSC, Polygon, Arbitrum, Optimism)
  - QR code для криптоплатежей

#### **2. Multi-Currency System**
- ⏳ Live currency conversion (RUB ↔ USD ↔ CNY)
- ⏳ Real-time exchange rates (API integration)
- ⏳ Display prices in selected currency
- ⏳ Currency selector в header

#### **3. Real-Time Chat System**
- ⏳ **WebSocket Integration** для real-time чата
- ⏳ **DeepSeek AI Auto-Response:**
  - Автоматические ответы на частые вопросы
  - Интеграция с product data
  - Эскалация к живому оператору
- ⏳ **Global Chat Widget:**
  - Floating button во всех страницах
  - История сообщений
  - Typing indicators
  - Read receipts
- ⏳ **Notification System:**
  - Real-time уведомления в LVL menu
  - Badge counter для новых сообщений

### **Medium Priority - Важные Улучшения**

#### **4. Admin/Moderator CMS**
- ⏳ **Admin Dashboard:**
  - Product management (CRUD)
  - Category management
  - User management
  - Order management
  - Sales analytics
- ⏳ **Moderation Workflow:**
  - Review moderation (approve/reject)
  - Q&A moderation
  - Content flagging system
- ⏳ **Reporting:**
  - Sales reports
  - User activity reports
  - Product performance metrics

#### **5. User Features**
- ⏳ **Social Login:**
  - Google quick registration
  - Yandex integration
  - Apple Sign-In
- ⏳ **Order History:**
  - Полная история заказов
  - Order tracking
  - Reorder functionality
- ⏳ **Wishlist/Favorites:**
  - Persistent storage (MongoDB)
  - Share wishlist
  - Price drop notifications для wishlist items

#### **6. Notification System**
- ⏳ **Email Notifications (Gmail Integration):**
  - Order confirmations
  - Shipping updates
  - Marketing newsletters
- ⏳ **In-App Notifications:**
  - Real-time notifications в LVL menu
  - Push notifications (browser)
  - Notification preferences

### **Low Priority - Nice to Have**

#### **7. SEO & Marketing**
- ⏳ AI-powered SEO optimization
- ⏳ Meta tags для всех страниц
- ⏳ Sitemap generation
- ⏳ Open Graph для social sharing
- ⏳ Analytics integration (Google Analytics, Yandex.Metrica)

#### **8. Advanced Features**
- ⏳ Product comparison tool
- ⏳ Recently viewed products
- ⏳ Product recommendations (AI)
- ⏳ Voucher/Promo code system
- ⏳ Affiliate program
- ⏳ Pre-order система (более детальная)

---

## 🏗️ СТРУКТУРА ПРОЕКТА (Текущее Состояние)

```
MINIMAL MARKET
│
├── 🎨 FRONTEND (React)
│   ├── 🏠 Pages
│   │   ├── HomePage
│   │   │   ├── Hero Section
│   │   │   ├── Featured Categories
│   │   │   └── Popular Products Carousel
│   │   │
│   │   ├── MarketplacePage ⭐
│   │   │   ├── Header ("MINIMAL MARKET")
│   │   │   ├── Search Bar
│   │   │   ├── Filter System (Sliding Panel)
│   │   │   ├── Featured Chips + View Controls
│   │   │   └── Product Grid (Pinterest-style cards)
│   │   │
│   │   ├── ProductDetailPage
│   │   │   ├── Image Gallery
│   │   │   ├── Product Info
│   │   │   ├── Actions (Add to Cart, Wishlist, Share)
│   │   │   ├── Tabs (Overview, Specs, Reviews, Q&A)
│   │   │   └── Trust Badges
│   │   │
│   │   ├── CategoryPage
│   │   │   └── Category-specific products
│   │   │
│   │   └── RestockPage
│   │       └── Pre-order items
│   │
│   ├── 🧩 Components
│   │   ├── Header ⭐
│   │   │   ├── Logo/LVL Button (left)
│   │   │   ├── Navigation (center)
│   │   │   └── Theme/Lang/Auth (right)
│   │   │
│   │   ├── LVL Menu (Gamified Profile) ⭐
│   │   │   ├── User Stats (XP, Level, Streak)
│   │   │   ├── Tabs (Overview, Achievements, Quests, Inventory)
│   │   │   ├── Bonus Balance
│   │   │   ├── Spin Wheel
│   │   │   ├── Quick Links (Cart, Messages)
│   │   │   └── Referral Code
│   │   │
│   │   ├── QuickBuyModal ⭐
│   │   │   ├── Product Info (left)
│   │   │   ├── Customer Form (center)
│   │   │   ├── Payment Methods (right)
│   │   │   └── Share Button
│   │   │
│   │   ├── AuthModal (Login/Register)
│   │   ├── SpinWheel (Gamification)
│   │   └── MouseFollower (Visual Effect)
│   │
│   ├── 🎨 Styles
│   │   ├── glassmorphism.css ⭐ (theme-aware)
│   │   ├── mouseFollower.css
│   │   └── index.css (global)
│   │
│   ├── 🌍 Contexts
│   │   ├── AuthContext (JWT, user state)
│   │   ├── ThemeContext (dark/light)
│   │   └── LanguageContext (i18n)
│   │
│   └── 📦 Mock Data
│       └── mockData.js (temp data для разработки)
│
├── ⚙️ BACKEND (FastAPI + MongoDB)
│   ├── 📊 Models (Pydantic)
│   │   ├── user.py (User, auth)
│   │   ├── product.py ⭐ (stock, preorder)
│   │   ├── category.py
│   │   ├── cart.py
│   │   ├── order.py ⭐ (quick-buy support)
│   │   ├── payment_method.py ⭐ (admin config)
│   │   ├── review.py
│   │   ├── question.py
│   │   └── chat.py (базовая структура)
│   │
│   ├── 🛣️ Routes
│   │   ├── auth_routes.py (register, login, JWT)
│   │   ├── product_routes.py (CRUD, filters, search)
│   │   ├── category_routes.py
│   │   ├── cart_routes.py
│   │   ├── order_routes.py ⭐
│   │   ├── payment_settings_routes.py ⭐
│   │   ├── review_routes.py
│   │   └── question_routes.py
│   │
│   ├── 🔧 Utils
│   │   ├── auth_utils.py (JWT, optional auth)
│   │   └── database.py (MongoDB connection)
│   │
│   └── 📝 server.py (Main FastAPI app)
│
└── 📚 DATABASE (MongoDB)
    ├── users
    ├── products ⭐
    ├── categories
    ├── carts
    ├── orders ⭐
    ├── payment_methods ⭐
    ├── reviews
    ├── questions
    └── chats
```

---

## 🚀 РЕКОМЕНДАЦИИ ПО РАЗВИТИЮ

### **Критические Шаги (Следующие 2-4 недели)**

#### **1. Payment Gateway Integration (ВЫСШИЙ ПРИОРИТЕТ)**
**Почему критично:**
- Без платежей невозможно принимать реальные заказы
- Пользователи ожидают безопасные способы оплаты
- Конкурентное преимущество (крипто + традиционные методы)

**Рекомендуемый порядок:**
1. **Tinkoff Integration** (основной для российского рынка)
   - Интеграция Terminal API
   - Тестирование карточных платежей
   - СБП реализация
   
2. **Basic Crypto Gateway** (для international audience)
   - Начать с USDT (TRC-20 или BSC) - самый популярный
   - QR code generation
   - Webhook для подтверждения платежей

**Предложение:** Использовать сервисы-агрегаторы:
- **Для Tinkoff:** официальный SDK
- **Для крипто:** CoinGate или NOWPayments (поддерживают множество монет/сетей)

#### **2. Multi-Currency Real-Time Conversion**
**Почему важно:**
- Международная аудитория
- Прозрачность цен для пользователей
- Соответствие локальным рынкам

**Рекомендации:**
- API для курсов: exchangerate-api.com или Open Exchange Rates
- Кэширование курсов (обновление раз в час)
- Сохранение выбранной валюты пользователя в localStorage

#### **3. Real-Time Chat + AI Auto-Response**
**Почему нужно:**
- Поддержка клиентов 24/7
- Снижение нагрузки на операторов (80% вопросов повторяются)
- Улучшение customer experience

**Технологический стек:**
- WebSocket (через FastAPI)
- DeepSeek API для AI responses
- Redis для session management

**План реализации:**
1. WebSocket backend (FastAPI)
2. Floating chat widget (React)
3. DeepSeek integration для базовых вопросов
4. Admin panel для операторов

### **Средний Приоритет (1-2 месяца)**

#### **4. Admin CMS + Moderation System**
**Необходимые компоненты:**
- Product CRUD (создание, редактирование, удаление товаров)
- Order management (статусы, обработка)
- User management (блокировка, роли)
- Content moderation (отзывы, вопросы)
- Analytics dashboard (продажи, конверсия, популярные товары)

**UI Framework предложение:**
- React Admin (готовый framework для admin панелей)
- Или кастомная панель с Material-UI/Ant Design

#### **5. User Features Enhancement**
- **Order History:** Полная история с tracking
- **Wishlist Persistence:** Сохранение в MongoDB
- **Social Login:** Google → Yandex → Apple (по популярности)

#### **6. Email Notifications**
**Сценарии:**
- Order confirmation
- Shipping update
- Delivery confirmation
- Password reset
- Marketing (newsletters, promotions)

**Сервис:** SendGrid или Amazon SES

### **Дополнительные Улучшения (Что Вы Не Учли)**

#### **🔐 Security Enhancements**
- **Rate Limiting:** Защита от DDoS и bot attacks
- **Input Validation:** Более строгая валидация всех форм
- **CSRF Protection:** Токены для форм
- **XSS Protection:** Sanitization пользовательского ввода
- **SQL Injection Prevention:** Параметризованные запросы (уже есть с MongoDB)
- **Password Requirements:** Minimum 8 chars, complexity rules
- **2FA (Two-Factor Auth):** SMS или Google Authenticator для важных операций

#### **📊 Analytics & Insights**
- **Google Analytics / Yandex.Metrica:** Tracking пользователей
- **Heatmaps:** Hotjar или Clarity для понимания UX
- **A/B Testing:** Оптимизация конверсии
- **Funnel Analysis:** Где пользователи бросают корзины

#### **🎯 Conversion Optimization**
- **Abandoned Cart Recovery:**
  - Email reminders
  - Push notifications
  - Discount offers
- **Exit Intent Popups:** Предложение помощи перед уходом
- **Trust Signals:**
  - Customer testimonials
  - Security badges (SSL, Payment verified)
  - Money-back guarantee
- **Urgency Tactics:**
  - Stock counter ("Only 3 left!")
  - Limited-time offers
  - Flash sales

#### **📱 Mobile Experience**
- **PWA (Progressive Web App):**
  - Offline functionality
  - Install prompt
  - Push notifications
- **Mobile-First Design:** Оптимизация для мобильных
- **Touch Gestures:** Swipe для карусели, pull-to-refresh

#### **🌐 Internationalization Beyond Language**
- **Regional Pricing:** Цены адаптированные под страну
- **Local Payment Methods:** WeChat Pay для Китая, PayPal для US/EU
- **Shipping Options:** Локальные курьерские службы
- **Tax Calculation:** VAT/GST по странам

#### **🎮 Gamification Expansion**
- **Loyalty Program:**
  - Накопительные баллы за покупки
  - Tier system (Bronze → Silver → Gold)
  - Exclusive perks для VIP
- **Challenges & Milestones:**
  - "First purchase" achievement
  - "Spend $1000" milestone
- **Leaderboards:** Топ покупателей месяца
- **Social Sharing Rewards:** Бонусы за репосты

#### **🤖 AI & Automation**
- **Product Recommendations:**
  - "Customers who bought this also bought..."
  - "Recommended for you" based на browsing history
- **Smart Search:**
  - Autocomplete с suggestions
  - "Did you mean..." для typos
  - Search filters по relevance
- **Chatbot Improvements:**
  - Order tracking через чат
  - Product suggestions based на preferences
- **Dynamic Pricing:** AI-based pricing optimization

#### **📦 Logistics & Fulfillment**
- **Inventory Management:**
  - Low stock alerts для admin
  - Automatic reorder suggestions
  - Warehouse management (если multiple locations)
- **Shipping Integration:**
  - API с курьерскими службами (СДЭК, Boxberry, DHL)
  - Real-time tracking numbers
  - Shipping cost calculator
- **Returns Management:**
  - Return request system
  - Refund processing
  - RMA tracking

#### **📣 Marketing Tools**
- **Email Marketing:**
  - Newsletter система
  - Abandoned cart emails
  - Product launch announcements
- **Promo Codes/Vouchers:**
  - Discount code system
  - Free shipping codes
  - Bundle deals
- **Affiliate Program:**
  - Referral links с tracking
  - Commission system
  - Affiliate dashboard

#### **⚡ Performance Optimization**
- **CDN Integration:** CloudFlare или AWS CloudFront для static assets
- **Image Optimization:**
  - Lazy loading
  - WebP format
  - Responsive images (srcset)
- **Code Splitting:** React lazy loading для routes
- **Caching Strategy:**
  - Redis для frequent queries
  - Browser caching headers
  - Service worker caching

#### **🧪 Testing & Quality**
- **Unit Tests:** Backend endpoints
- **Integration Tests:** Full user flows
- **E2E Tests:** Playwright/Cypress для UI
- **Load Testing:** Simulating high traffic
- **Security Audit:** Penetration testing

---

## 📊 ROADMAP TIMELINE (Suggested)

### **Month 1: Payment & Currency**
- Week 1-2: Tinkoff Integration
- Week 3: Crypto Payment Gateway
- Week 4: Multi-Currency System

### **Month 2: Chat & Notifications**
- Week 1-2: WebSocket Chat Infrastructure
- Week 3: DeepSeek AI Integration
- Week 4: Email Notifications (SendGrid)

### **Month 3: CMS & Admin**
- Week 1-2: Admin Dashboard
- Week 3: Order Management
- Week 4: Content Moderation

### **Month 4: User Features & Polish**
- Week 1: Social Login
- Week 2: Order History & Wishlist
- Week 3-4: SEO, Analytics, Performance Optimization

### **Month 5-6: Advanced Features**
- AI Recommendations
- Loyalty Program
- Marketing Tools
- Shipping Integration

---

## 🎯 KEY METRICS TO TRACK

### **Business Metrics**
- **Conversion Rate:** Visitors → Purchases
- **Average Order Value (AOV)**
- **Customer Lifetime Value (CLV)**
- **Cart Abandonment Rate**
- **Return Customer Rate**

### **Technical Metrics**
- **Page Load Time** (< 3 seconds goal)
- **API Response Time** (< 500ms goal)
- **Uptime** (99.9% goal)
- **Error Rate** (< 0.1% goal)

### **User Engagement**
- **Time on Site**
- **Pages per Session**
- **Bounce Rate**
- **Chat Engagement Rate**

---

## 💡 FINAL RECOMMENDATIONS

### **Immediate Actions (This Week)**
1. ✅ Review и confirm этот roadmap
2. 🔥 Начать с Tinkoff integration (high priority)
3. 📝 Создать detailed spec для каждого feature
4. 🧪 Set up testing environment (staging)

### **Strategic Priorities**
1. **Payment First:** Без этого нет бизнеса
2. **User Experience:** Chat, notifications, wishlist
3. **Admin Tools:** Для управления контентом
4. **Growth:** SEO, marketing, analytics

### **Tech Debt to Address**
- Add comprehensive error handling
- Improve loading states
- Add skeleton screens
- Implement retry logic для failed requests

---

**Документ обновлен:** 03 ноября 2024
**Версия:** 1.0
**Следующий Review:** После завершения Month 1 tasks
