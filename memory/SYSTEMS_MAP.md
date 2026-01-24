# 🗂️ GHOST PROTOCOL — ПОЛНАЯ КАРТА СИСТЕМ И МЕХАНИК

> Дата аудита: Январь 2025
> Версия: 2.0

---

## 📊 ОБЩАЯ СТАТИСТИКА

- **Всего компонентов:** 168 файлов (.jsx)
- **Устаревших компонентов:** 8 файлов (_deprecated/)
- **Backend routes:** 42 файла
- **Contexts (глобальные состояния):** 6 файлов
- **Страниц (pages):** 3 файла

---

# 🏛️ АРХИТЕКТУРА ПРОЕКТА

```
/app/frontend/src/
├── components/           # Все UI компоненты (168 файлов)
│   ├── _deprecated/      # 🚫 УСТАРЕВШИЕ (8 файлов)
│   ├── chat/             # 💬 СИСТЕМА ЧАТОВ
│   ├── home/             # 🏠 ДОМАШНЯЯ СТРАНИЦА
│   ├── kinetic/          # ⚡ KINETIC UI СИСТЕМА
│   ├── marketplace/      # 🛒 МАРКЕТПЛЕЙС
│   ├── social/           # 👥 СОЦИАЛЬНЫЕ КОМПОНЕНТЫ
│   ├── swap/             # 🔄 GLASSY SWAP
│   ├── system/           # ⚙️ СИСТЕМНЫЕ КОМПОНЕНТЫ
│   └── ui/               # 🎨 SHADCN UI КОМПОНЕНТЫ
├── contexts/             # 🌐 ГЛОБАЛЬНЫЕ СОСТОЯНИЯ
├── pages/                # 📄 СТРАНИЦЫ (community/)
└── styles/               # 🎨 ГЛОБАЛЬНЫЕ СТИЛИ

/app/backend/
├── routes/               # API endpoints (42 файла)
├── models/               # MongoDB модели
└── server.py             # FastAPI сервер
```

---

# 💬 СИСТЕМА КОММУНИКАЦИЙ

## 📦 Активные компоненты

### 1. GlassyOmniChat.jsx (МИНИ-ЧАТ)
**Путь:** `/app/frontend/src/components/chat/GlassyOmniChat.jsx`
**Статус:** ✅ АКТИВЕН (основной нижний чат-бар)
**Размер:** 44KB

**Режимы (MODES):**
- 🟠 `ai` — Glassy AI (оранжевый, #f97316)
- 🟢 `trade` — Маркет/Продавцы (зеленый, #10b981)
- 🟣 `guilds` — Гильдии (фиолетовый, #a855f7)
- 🔵 `global` — Глобальный чат (синий, #3b82f6)
- 🔴 `support` — Поддержка (красный, #ef4444)

**Состояния:**
- Collapsed (полоска)
- Expanded (мини-чат)
- Fullscreen (на весь экран)

**Интеграции:**
- WebSocket для real-time сообщений
- Voice input (Web Speech API)
- Attach файлов
- → Открывает GhostMessenger через событие `openGhostMessenger`

---

### 2. GhostMessenger.jsx (ПОЛНЫЙ ЧАТ)
**Путь:** `/app/frontend/src/components/social/GhostMessenger.jsx`
**Статус:** ✅ АКТИВЕН (полноэкранный мессенджер)
**Размер:** 33KB

**Структура "ДОМ":**
```
🟠 AI (Glassy AI)
   └── Ассистент

🟢 TRADE (Маркет)
   ├── Активные сделки
   ├── История
   └── Споры

🟣 GUILDS (Гильдии)
   ├── Мои гильдии
   └── Приглашения

🔵 GLOBAL (Глобальный)
   ├── Общий чат
   ├── Личные сообщения (ЛС) ← от пользователей
   └── Объявления

🔴 SUPPORT (Поддержка)
   ├── Активные тикеты
   └── История
```

**Интеграции:**
- Принимает `initData` от GlassyOmniChat
- Синхронизация activeTab
- Глобально доступен через App.js

---

### 3. GlassyChatBar.jsx 
**Путь:** `/app/frontend/src/components/chat/GlassyChatBar.jsx`
**Статус:** ⚠️ НЕ ИСПОЛЬЗУЕТСЯ (deprecated, но не удален)
**Размер:** 48KB

**Примечание:** Был заменен на GlassyOmniChat. Код сохранен для справки.

---

### 4. SmartChannelSwitcher.jsx
**Путь:** `/app/frontend/src/components/chat/SmartChannelSwitcher.jsx`
**Статус:** ⚠️ НЕИЗВЕСТНО (нужно проверить использование)
**Размер:** 5KB

---

### 5. LiveChatWidget.jsx
**Путь:** `/app/frontend/src/components/marketplace/LiveChatWidget.jsx`
**Статус:** ✅ АКТИВЕН (виджет чата на страницах товаров)
**Размер:** 8KB

---

## 🚫 Устаревшие чаты (_deprecated/)

| Файл | Описание |
|------|----------|
| `ChatFullPage.jsx` | Полноэкранный чат (заменен GhostMessenger) |
| `ChatWidget.jsx` | Старый виджет чата |
| `ChatWindow.jsx` | Окно чата |

---

# ⚙️ СИСТЕМНЫЕ КОМПОНЕНТЫ

## 📦 Активные компоненты

### 1. NeuralHub.jsx (ГЛАВНОЕ МЕНЮ)
**Путь:** `/app/frontend/src/components/system/NeuralHub.jsx`
**Статус:** ✅ АКТИВЕН (LVL меню, профиль, навигация)
**Размер:** 40KB

**Функционал:**
- Аватар пользователя (w-20 h-20)
- Уровень и прогресс XP
- RP (Reputation Points)
- Навигационные тайлы:
  - Профиль → IdentityCore
  - Уведомления
  - Сообщения → GhostMessenger (событие)
  - Инвентарь
  - Рейтинг
  - Баланс
  - Доверие
  - Настройки
- Панели: notifications, inventory, wallet, trust, settings

**Интеграции:**
- → IdentityCore (профиль)
- → GhostMessenger (через событие openGhostMessenger)
- ← CorePulse (родительский компонент)

---

### 2. CorePulse.jsx
**Путь:** `/app/frontend/src/components/system/CorePulse.jsx`
**Статус:** ✅ АКТИВЕН (кнопка-триггер для NeuralHub)
**Размер:** 4KB

**Функционал:**
- Пульсирующая кнопка в Header
- Открывает/закрывает NeuralHub
- Бейдж уведомлений

---

### 3. AtmosphericBackground.jsx
**Путь:** `/app/frontend/src/components/system/AtmosphericBackground.jsx`
**Статус:** ✅ АКТИВЕН (анимированный фон)
**Размер:** 26KB

**Эффекты:**
- Particle system
- Grid overlay
- Gradient mesh
- Fog effects
- Responsive to theme

---

### 4. HolographicID.jsx
**Путь:** `/app/frontend/src/components/system/HolographicID.jsx`
**Статус:** ⚠️ НЕИЗВЕСТНО (возможно устарел после IdentityCore)
**Размер:** 10KB

---

### 5. UserResonance.jsx
**Путь:** `/app/frontend/src/components/system/UserResonance.jsx`
**Статус:** ⚠️ НЕИЗВЕСТНО
**Размер:** 6KB

---

### 6. ClassArtifact.jsx
**Путь:** `/app/frontend/src/components/system/ClassArtifact.jsx`
**Статус:** ⚠️ НЕИЗВЕСТНО (RPG-класс?)
**Размер:** 7KB

---

### 7. SystemToast.jsx
**Путь:** `/app/frontend/src/components/system/SystemToast.jsx`
**Статус:** ✅ АКТИВЕН (уведомления)
**Размер:** 6KB

---

### 8. SystemAudio.js
**Путь:** `/app/frontend/src/components/system/SystemAudio.js`
**Статус:** ✅ АКТИВЕН (звуковые эффекты)
**Размер:** 5KB

**Звуки:**
- click
- close
- send
- receive
- notification
- success
- error

---

# 👥 СОЦИАЛЬНЫЕ КОМПОНЕНТЫ

### 1. IdentityCore.jsx (ПРОФИЛЬ)
**Путь:** `/app/frontend/src/components/social/IdentityCore.jsx`
**Статус:** ✅ АКТИВЕН (иммерсивный профиль)
**Размер:** 14KB

**Структура:**
- Battlestation (cover image)
- Giant Avatar (256px)
- User Aura система
- Stats / Feed / Inventory columns
- Full-width design

---

### 2. CommunityPulse.jsx
**Путь:** `/app/frontend/src/components/social/CommunityPulse.jsx`
**Статус:** ⚠️ НЕИЗВЕСТНО
**Размер:** 11KB

---

### 3. NetworkFeed.jsx
**Путь:** `/app/frontend/src/components/social/NetworkFeed.jsx`
**Статус:** ⚠️ НЕИЗВЕСТНО (возможно заменен CommunityPage)
**Размер:** 10KB

---

### 4. ConsensusList.jsx
**Путь:** `/app/frontend/src/components/social/ConsensusList.jsx`
**Статус:** ⚠️ НЕИЗВЕСТНО (возможно заменен GovernancePage)
**Размер:** 10KB

---

# ⚡ KINETIC UI СИСТЕМА

**Путь:** `/app/frontend/src/components/kinetic/`

### Компоненты:

| Файл | Описание | Статус |
|------|----------|--------|
| `KineticAppGrid.jsx` | Главная bento-сетка | ✅ АКТИВЕН |
| `KineticWidget.jsx` | Базовый виджет | ✅ АКТИВЕН |
| `KineticCategories.jsx` | Категории | ✅ АКТИВЕН |
| `KineticQuickActions.jsx` | Быстрые действия | ✅ АКТИВЕН |
| `kinetic.css` | Стили (36KB) | ✅ АКТИВЕН |

---

# 🏠 HOME КОМПОНЕНТЫ

**Путь:** `/app/frontend/src/components/home/`

| Файл | Описание | Статус |
|------|----------|--------|
| `HeroSection.jsx` | Главный баннер с видео | ✅ АКТИВЕН |
| `LiveTicker.jsx` | Бегущая строка новостей | ✅ АКТИВЕН |
| `TelemetryBar.jsx` | Телеметрия снизу | ✅ АКТИВЕН |
| `FeatureGrid.jsx` | Сетка фич | ✅ АКТИВЕН |
| `CatalogGrid.jsx` | Каталог товаров | ✅ АКТИВЕН |
| `HowItWorks.jsx` | Как это работает | ✅ АКТИВЕН |
| `ReviewDeck.jsx` | Отзывы (карусель) | ✅ АКТИВЕН |
| `CTASection.jsx` | Call to Action | ✅ АКТИВЕН |
| `TrendingSection.jsx` | Трендовые товары | ✅ АКТИВЕН |

---

# 🛒 MARKETPLACE КОМПОНЕНТЫ

**Путь:** `/app/frontend/src/components/marketplace/`

| Файл | Описание | Статус |
|------|----------|--------|
| `ProductCard.jsx` | Карточка товара | ✅ АКТИВЕН |
| `ProductGrid.jsx` | Сетка товаров | ✅ АКТИВЕН |
| `ProductDetailPage.jsx` | Детальная страница | ✅ АКТИВЕН |
| `FastBuyModal.jsx` | Быстрая покупка | ✅ АКТИВЕН |
| `LiveChatWidget.jsx` | Чат с продавцом | ✅ АКТИВЕН |
| `KeySpecs.jsx` | Ключевые характеристики | ✅ АКТИВЕН |
| `ProductCustomizer.jsx` | Конфигуратор | ✅ АКТИВЕН |
| `ProductReactions.jsx` | Реакции на товар | ✅ АКТИВЕН |
| `ExpandableBlock.jsx` | Раскрывающийся блок | ✅ АКТИВЕН |

---

# 🔄 SWAP КОМПОНЕНТЫ

**Путь:** `/app/frontend/src/components/swap/`

| Файл | Описание | Статус |
|------|----------|--------|
| `SwapMainPage.jsx` | Главная биржи обмена | ✅ АКТИВЕН |
| `SwapDetailPage.jsx` | Детали сделки | ✅ АКТИВЕН |
| `CreateWizard.jsx` | Мастер создания сделки | ✅ АКТИВЕН |
| `ListingCard.jsx` | Карточка листинга | ✅ АКТИВЕН |
| `AIRecommendationCard.jsx` | AI рекомендации | ⚠️ STUB |
| `EmptyState.jsx` | Пустое состояние | ✅ АКТИВЕН |

---

# 📄 ГЛАВНЫЕ СТРАНИЦЫ (корень components/)

| Файл | Роут | Описание |
|------|------|----------|
| `HomePage.jsx` | `/` | Главная страница |
| `MarketplacePage.jsx` | `/marketplace` | Каталог товаров |
| `PCBuilderPage.jsx` | `/pc-builder` | Конфигуратор ПК |
| `ModPage.jsx` | `/mod` | Мод-страница |
| `CommunityPage.jsx` | `/neural-feed` | **NEW** Социальная лента |
| `GovernancePage.jsx` | `/governance` | **NEW** Голосование/Roadmap |
| `ArticlesPage.jsx` | `/articles` | Статьи |
| `CreatorsPage.jsx` | `/creators` | Создатели |
| `RatingPage.jsx` | `/rating` | Рейтинг |
| `VotingPage.jsx` | `/voting` | Голосование |
| `GroupBuyPage.jsx` | `/groupbuys` | Групповые закупки |
| `CartPage.jsx` | `/cart` | Корзина |
| `CheckoutPage.jsx` | `/checkout` | Оформление |
| `CategoryPage.jsx` | `/category/:id` | Категория |
| `ProductPage.jsx` | `/product/:id` | Товар |
| `ProductDetailPage.jsx` | `/product/:id` | Детали товара |
| `UserProfilePage.jsx` | `/user/:id` | Профиль пользователя |

---

# 🌐 ГЛОБАЛЬНЫЕ КОНТЕКСТЫ

**Путь:** `/app/frontend/src/contexts/`

| Контекст | Функционал |
|----------|------------|
| `AuthContext.jsx` | Авторизация, JWT, login/logout |
| `CartContext.jsx` | Корзина, добавление товаров |
| `CurrencyContext.jsx` | Валюта (RUB, USD, EUR) |
| `LanguageContext.jsx` | Язык (ru, en) |
| `ThemeContext.jsx` | Тема (dark, light, minimal-mod) |
| `ToastContext.jsx` | Уведомления/тосты |

---

# 🔌 BACKEND API ROUTES

**Путь:** `/app/backend/routes/`

## Основные API:

### 👤 Пользователи
- `auth_routes.py` — Авторизация
- `user_address_routes.py` — Адреса

### 🛒 Магазин
- `product_routes.py` — Товары (15KB)
- `category_routes.py` — Категории
- `catalog_routes.py` — Каталог
- `cart_routes.py` — Корзина
- `checkout_routes.py` — Оформление
- `order_routes.py` — Заказы
- `wishlist_routes.py` — Избранное
- `saved_routes.py` — Сохраненное

### 💱 Обмен (Swap)
- `swap_routes.py` — Сделки обмена (14KB)
- `swap_chat_routes.py` — Чат в сделках (11KB)

### 🤖 AI
- `ai_routes.py` — AI ассистент (6KB)
- `recommendation_routes.py` — Рекомендации

### 📊 Аналитика
- `analytics_routes.py` — Аналитика
- `activity_routes.py` — Активность
- `monitoring_routes.py` — Мониторинг

### 👥 Социальное
- `network_routes.py` — Сеть пользователей (9KB)
- `consensus_routes.py` — Консенсус/голосование (11KB)
- `monarchs_routes.py` — Монархи/лидеры (9KB)
- `rating_routes.py` — Рейтинг (11KB)
- `voting_routes.py` — Голосование (8KB)
- `feed_routes.py` — Лента (6KB)
- `creator_routes.py` — Создатели (5KB)

### 💬 Коммуникации
- `support_chat_routes.py` — Поддержка (16KB)
- `notification_routes.py` — Уведомления
- `question_routes.py` — Вопросы

### 🛠️ Сборка ПК
- `pc_build_routes.py` — Сборки (9KB)
- `builder_routes.py` — Билдер (8KB)

### 💰 Платежи
- `payment_routes.py` — Платежи
- `payment_settings_routes.py` — Настройки платежей
- `promo_routes.py` — Промокоды
- `price_alert_routes.py` — Уведомления о ценах

### 📝 Контент
- `article_routes.py` — Статьи (8KB)
- `review_routes.py` — Отзывы (7KB)
- `groupbuy_routes.py` — Групбаи (9KB)
- `homepage_routes.py` — Главная (18KB)

### 📤 Файлы
- `upload_routes.py` — Загрузка файлов

---

# 🚫 УСТАРЕВШИЕ КОМПОНЕНТЫ

**Путь:** `/app/frontend/src/components/_deprecated/`

| Файл | Причина deprecation |
|------|---------------------|
| `AIFloatingButton.jsx` | Заменен на встроенный AI в чат |
| `AmbientMode.jsx` | Объединен с другими режимами |
| `AppGrid.jsx` | Заменен на KineticAppGrid |
| `BentoGrid.jsx` | Заменен на KineticAppGrid |
| `ChatFullPage.jsx` | Заменен на GhostMessenger |
| `ChatWidget.jsx` | Заменен на GlassyOmniChat |
| `ChatWindow.jsx` | Заменен на GlassyOmniChat |

---

# 🔗 СВЯЗИ МЕЖДУ КОМПОНЕНТАМИ

```
App.js
├── Header
│   └── CorePulse → NeuralHub
│                      ├── IdentityCore (профиль)
│                      └── → GhostMessenger (событие)
├── GlassyOmniChat (мини-чат)
│   └── → GhostMessenger (событие openGhostMessenger)
├── GlobalGhostMessenger (слушает событие)
├── AtmosphericBackground
└── Routes
    ├── HomePage
    │   ├── HeroSection
    │   ├── LiveTicker
    │   ├── KineticAppGrid
    │   │   ├── CommunityNetworkWidget → /neural-feed
    │   │   └── RatingRoadmapWidget → /governance
    │   └── TelemetryBar
    ├── MarketplacePage
    │   ├── FilterPanel
    │   ├── ProductCard
    │   └── LiveChatWidget
    ├── PCBuilderPage
    ├── ModPage
    ├── CommunityPage (/neural-feed)
    ├── GovernancePage (/governance)
    └── ...
```

---

# ❓ ТРЕБУЕТ ПРОВЕРКИ

Компоненты со статусом ⚠️ НЕИЗВЕСТНО:

1. `HolographicID.jsx` — возможно дубль IdentityCore
2. `UserResonance.jsx` — непонятное назначение
3. `ClassArtifact.jsx` — RPG система классов?
4. `CommunityPulse.jsx` — возможно устарел
5. `NetworkFeed.jsx` — возможно заменен CommunityPage
6. `ConsensusList.jsx` — возможно заменен GovernancePage
7. `SmartChannelSwitcher.jsx` — используется ли?
8. `GlassyChatBar.jsx` — не экспортируется, но не удален

---

# 📋 TODO / ROADMAP

## Требует очистки:
- [ ] Удалить или пометить GlassyChatBar как deprecated
- [ ] Проверить HolographicID vs IdentityCore
- [ ] Унифицировать NetworkFeed / CommunityPulse с CommunityPage
- [ ] Проверить ConsensusList vs GovernancePage

## Требует рефакторинга:
- [ ] MarketplacePage → THE ARMORY (Holographic Showroom)
- [ ] FilterPanel → Frequency Tuner
- [ ] ProductCard → 3D Levitating Cards

## Новые фичи:
- [ ] Quick View (video preview на hover)
- [ ] Voice Chat в сделках
- [ ] AI Price Predictor
- [ ] Mobile App

---

*Документ создан автоматически. Последнее обновление: Январь 2025*
