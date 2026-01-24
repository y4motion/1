# 🗺️ GHOST PROTOCOL — МАСТЕР-РЕЕСТР ВСЕХ ЗАДАЧ

> **Дата создания:** Декабрь 2025
> **Версия:** 1.0
> **Статус:** Активный документ

---

## 📊 ОБЩИЙ ПРОГРЕСС ПРОЕКТА

```
████████████████████████████░░░░ 75% COMPLETE
```

| Модуль | Готовность | Статус |
|--------|------------|--------|
| 🏛️ Backend Core (Auth, API) | 95% | ✅ PRODUCTION-READY |
| 🛒 Marketplace | 90% | ✅ FUNCTIONAL |
| 💬 Chat System | 70% | ⚠️ NEEDS UNIFICATION |
| 👥 Social Core | 85% | ✅ FUNCTIONAL |
| 🎮 Gamification (XP/RP/LVL) | 60% | ⚠️ PARTIAL |
| 🎨 UI/UX Theming | 80% | ⚠️ MINOR BUGS |
| 🔧 RPG System | 30% | 🔴 NOT INTEGRATED |
| 💳 Payments | 0% | 🔴 NOT STARTED |

---

## 🔴 КРИТИЧЕСКИЕ ЗАДАЧИ (P0)

### 1. SYSTEM CONVERGENCE — RPG Integration
**Файлы:** `ClassArtifact.jsx`, `UserResonance.jsx` → `IdentityCore.jsx`
**Готовность:** 0% → IN PROGRESS
**Зависимости:** Нет
**Описание:** 
- Интегрировать 3D вращающийся артефакт класса в профиль
- Добавить визуализацию Trust Score с глитч-эффектами
- Классы: ARCHITECT (Cyan Cube), BROKER (Amber Parabola), OBSERVER (Blue Eye)

### 2. Code Cleanup — Удаление дублей
**Файлы для удаления:**
- [ ] `/app/frontend/src/components/chat/GlassyChatBar.jsx` (заменён на GlassyOmniChat)
- [ ] `/app/frontend/src/components/social/NetworkFeed.jsx` (заменён на CommunityPage)
- [ ] `/app/frontend/src/components/social/ConsensusList.jsx` (заменён на GovernancePage)
- [ ] `/app/frontend/src/components/_deprecated/ChatFullPage.jsx` (устаревший)
**Готовность:** 0%

### 3. Route Redirects
**Файл:** `App.js`
**Описание:**
- [ ] `/community/network` → `/neural-feed`
- [ ] `/community/consensus` → `/governance`
**Готовность:** 0%

---

## 🟡 ВЫСОКИЙ ПРИОРИТЕТ (P1)

### 4. Chat System Unification
**Готовность:** 40%
**Проблема:** 3 параллельные реализации чата
**Файлы:**
- `GlassyOmniChat.jsx` — АКТИВЕН (мини-бар)
- `GhostMessenger.jsx` — АКТИВЕН (полный мессенджер)
- `ChatWindow.jsx` — WebSocket (НЕ ИСПОЛЬЗУЕТСЯ в UI)
- `FloatingChatWidget.jsx` — Mock данные
- `ChatFullPage.jsx` — Mock данные
**Задачи:**
- [ ] Интегрировать `SmartChannelSwitcher.jsx` в чат
- [ ] Подключить FloatingChatWidget к реальному API
- [ ] Унифицировать WebSocket логику

### 5. Theme Switching Bugs
**Готовность:** 80%
**Файлы:** `ThemeContext.jsx`, `PCBuilderPage.jsx`
**Проблемы:**
- [ ] PC Builder: чёрный текст на чёрном фоне в Minimal Mod
- [ ] Inline styles переопределяют тему

### 6. Payment Integration
**Готовность:** 0%
**Интеграции:**
- [ ] Tinkoff (СБП, QR, карты)
- [ ] Cryptomus (USDT, USDC, DAI)
**Документация:** `/app/PROJECT_ROADMAP.md`

### 7. AI Chat Integration
**Готовность:** 50%
**Backend:** `ai_routes.py` — Multi-Agent готов
**Требуется:** `DEEPSEEK_API_KEY` в `.env`
**Агенты:**
- ChatAgent — общие вопросы
- PCBuilderAgent — сборка ПК
- RecommenderAgent — рекомендации
- ModeratorAgent — модерация

---

## 🟢 СРЕДНИЙ ПРИОРИТЕТ (P2)

### 8. Video Autoplay in Hero
**Файл:** `HeroSection.jsx`
**Проблема:** Видео не автоплеится
**Готовность:** 0%

### 9. Zen Mode Scroll Bug
**Описание:** Элементы ниже viewport видны при скролле
**Готовность:** 0%

### 10. Atmospheric Background Enhancement
**Документ:** `/app/memory/FUTURE_ATMOSPHERIC_VOID.md`
**Описание:** 3 слоя глубины — Film Grain, Liquid Flares, Vignette
**Готовность:** 0%

### 11. Email/SMS Notifications
**Файл:** `notification_service.py`
**Статус:** Только stubs (логирование)
**Требуется:** SendGrid или Twilio интеграция
**Готовность:** 0%

### 12. Social Login
**Описание:** Google, Yandex, Apple OAuth
**Готовность:** 0%

---

## 🔵 НИЗКИЙ ПРИОРИТЕТ (P3)

### 13. Admin Panel / CMS
**Описание:** Product CRUD, Order management, User management
**Готовность:** 0%

### 14. PostCreate.jsx — Modal создания поста
**Готовность:** 0%

### 15. IdeaCreate.jsx — Modal создания идеи с RP cost
**Готовность:** 0%

### 16. MonarchsBoard.jsx — Leaderboard UI
**Готовность:** 0%

---

## 🚫 ЗАМОРОЖЕНО (DO NOT TOUCH)

### MarketplacePage.jsx — THE ARMORY
**Статус:** 🔒 ЗАМОРОЖЕН по указанию пользователя
**Описание:** Holographic Showroom, 3D левитирующие карточки
**Документ:** `/app/memory/SYSTEMS_MAP.md`

### FilterPanel.jsx
**Статус:** 🔒 ЗАМОРОЖЕН

---

## 📁 АРХИТЕКТУРА КОМПОНЕНТОВ

```
/app/frontend/src/
├── components/
│   ├── CommunityPage.jsx      ✅ NEW — Social Feed
│   ├── GovernancePage.jsx     ✅ NEW — Voting
│   ├── chat/
│   │   ├── GlassyOmniChat.jsx ✅ АКТИВЕН — мини-бар
│   │   ├── GlassyChatBar.jsx  ❌ TO DELETE
│   │   └── SmartChannelSwitcher.jsx ⚠️ НЕ ИСПОЛЬЗУЕТСЯ
│   ├── social/
│   │   ├── IdentityCore.jsx   ✅ Профиль пользователя
│   │   ├── GhostMessenger.jsx ✅ Полный мессенджер
│   │   ├── NetworkFeed.jsx    ❌ TO DELETE
│   │   └── ConsensusList.jsx  ❌ TO DELETE
│   ├── system/
│   │   ├── NeuralHub.jsx      ✅ LVL меню
│   │   ├── CorePulse.jsx      ✅ Кнопка-триггер
│   │   ├── ClassArtifact.jsx  ⚠️ TO INTEGRATE
│   │   └── UserResonance.jsx  ⚠️ TO INTEGRATE
│   └── _deprecated/
│       └── ChatFullPage.jsx   ❌ TO DELETE
```

---

## 🔗 ЗАВИСИМОСТИ МЕЖДУ ЗАДАЧАМИ

```
SYSTEM CONVERGENCE (P0)
└── [ClassArtifact + UserResonance] → IdentityCore

Code Cleanup (P0)
├── Route Redirects (P0)
│   └── App.js changes
└── File Deletion
    ├── GlassyChatBar.jsx
    ├── NetworkFeed.jsx
    ├── ConsensusList.jsx
    └── ChatFullPage.jsx

Chat Unification (P1)
├── SmartChannelSwitcher integration
└── WebSocket API connection

Payment Integration (P1)
├── Tinkoff SDK
└── Cryptomus SDK
    └── Requires API keys

AI Integration (P1)
└── Requires DEEPSEEK_API_KEY
```

---

## 📋 ДОКУМЕНТАЦИЯ

| Документ | Путь | Описание |
|----------|------|----------|
| PRD | `/app/memory/PRD.md` | Product Requirements |
| Systems Map | `/app/memory/SYSTEMS_MAP.md` | Полная карта компонентов |
| Atmospheric Void | `/app/memory/FUTURE_ATMOSPHERIC_VOID.md` | Визуальные улучшения |
| Ghost OS Menu | `/app/memory/FUTURE_GHOST_OS_MENU.md` | Neural Interface |
| Visual Correction | `/app/memory/FUTURE_VISUAL_CORRECTION.md` | Monochrome стиль |
| Project Roadmap | `/app/PROJECT_ROADMAP.md` | Полный roadmap |
| Dashboard Spec | `/app/design/GHOST_DASHBOARD_SPEC.md` | Ghost OS Dashboard |
| Social Core | `/app/design/SOCIAL_CORE_SPEC.md` | Social системы |
| Chat Architecture | `/app/docs/CHAT_SYSTEM_ARCHITECTURE.md` | Чат документация |
| Master Project | `/app/MASTER_PROJECT_FILE.md` | Главный файл проекта |

---

## 📈 ИСТОРИЯ ИЗМЕНЕНИЙ

| Дата | Изменение |
|------|-----------|
| Dec 2025 | GLOBAL UNBOXING — full-width layout |
| Dec 2025 | GhostMessenger redesign |
| Dec 2025 | CommunityPage + GovernancePage created |
| Dec 2025 | System Audit → SYSTEMS_MAP.md |
| Dec 2025 | RPG System discovered (hidden) |

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **СЕЙЧАС:** SYSTEM CONVERGENCE (RPG Integration + Cleanup)
2. **ЗАТЕМ:** Route Redirects + SmartChannelSwitcher
3. **ПОЗЖЕ:** Payment Integration + AI Chat
4. **BACKLOG:** Admin Panel, SEO, Analytics

---

*Документ автоматически обновляется при каждом fork*
*Последнее обновление: Декабрь 2025*
