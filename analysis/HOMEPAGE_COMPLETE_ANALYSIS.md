# 🏠 HOMEPAGE COMPLETE ANALYSIS
## Ghost Protocol / Kinetic Dot-OS

---

## 📊 ТЕКУЩАЯ СТРУКТУРА HOMEPAGE

```
HomePage.jsx (main)
│
├── 1. HeroSection.jsx          ✅ УНИКАЛЬНЫЙ (не требует Bento)
│      • Zen-иконка поиска с 8 idle-анимациями (Eye, Pokeball, Teleport...)
│      • Typewriter placeholder
│      • Multi-tool меню (Voice, AI, History)
│      • Quick Actions
│      • Konami Code easter egg
│
├── 2. KINETIC DASHBOARD         🟢 НОВЫЙ (уже реализован)
│      • LiveTicker - бегущая строка новостей
│      • ReviewDeck - Stack → Fan → List (3 состояния)
│      • ActivePoll - голосование Roadmap
│      • Stats Widget - системный статус
│
├── 3. ShopByCategory.jsx        ❌ СТАТИЧНЫЙ - нужен Bento
│      • 8 категорий с фоновыми изображениями
│      • Badges (HOT, trending)
│      • Не анимирован
│
├── 4. HotDealsAndPopular.jsx    ❌ СТАТИЧНЫЙ - нужен Bento
│      • Левая колонка: Popular products (ранжирование)
│      • Правая колонка: Горячие предложения с таймером
│      • Не анимирован
│
└── 5. LatestArticles.jsx        ❌ СТАТИЧНЫЙ - нужен Bento
       • 3 карточки статей
       • Не анимирован
```

---

## 🗂️ СУЩЕСТВУЮЩИЕ КОМПОНЕНТЫ /home/ (не используются в HomePage)

| Компонент | Назначение | Статус |
|-----------|------------|--------|
| `LiveActivityFeed.jsx` | Real-time лента активности (покупки, просмотры) | ❌ НЕ ИСПОЛЬЗУЕТСЯ |
| `TrendingChips.jsx` | Горячие поисковые запросы (#1 RTX 5090, +156%) | ❌ НЕ ИСПОЛЬЗУЕТСЯ |
| `QuickAccessGrid.jsx` | 6 карточек быстрого доступа (Сборка, Лента, GroupBuy) | ❌ НЕ ИСПОЛЬЗУЕТСЯ |
| `FeaturedCategories.jsx` | Альтернативная версия категорий | ❌ НЕ ИСПОЛЬЗУЕТСЯ |
| `TrendingSection.jsx` | Старая версия трендов | ❌ НЕ ИСПОЛЬЗУЕТСЯ |

---

## 📋 ЧТО ПЛАНИРОВАЛОСЬ (из документов)

### Из SYSTEM_ARCHITECTURE_GHOST.md:

1. **Trust Halo визуализация** - кольцо вокруг аватара на основе Trust Score
2. **Holographic ID Card** - цифровой паспорт с Radar Chart
3. **System Notifications** - моноширинные тосты ("RP GENERATED: +50")
4. **DecryptionCube** - 3D куб при level-up (вместо лутбокса)
5. **ClassSelection** - выбор специализации на 10 уровне

### Из FUTURE_GHOST_OS_MENU.md:

1. **NeuralHub** - меню разворачивается из центра
2. **CorePulse** - логотип как "ядро системы" с дыханием
3. **OperatorDossier** - профиль как парящая карта
4. **SmartAction** - контекстные кнопки (Daily Log, Claim Title)
5. **SystemVitals** - полоска RP + Entropy

### Из PRD.md:

1. **Morphing Cards** - виджет растягивается в модал (layoutId)
2. **Social features** - /feed, /articles, /creators
3. **Voice & Screen Share** - для чата поддержки

---

## 🎯 ЧТО ОТСУТСТВУЕТ НА ГЛАВНОЙ

### Уровень 1: Неиспользуемые готовые компоненты

| Что | Почему важно | Приоритет |
|-----|--------------|-----------|
| `LiveActivityFeed` | Создает FOMO, показывает "живость" сайта | P0 |
| `TrendingChips` | Горячие запросы с процентами роста | P1 |
| `QuickAccessGrid` | Быстрый доступ к ключевым разделам | P2 |

### Уровень 2: Секции требующие Kinetic-апгрейда

| Секция | Проблема | Решение |
|--------|----------|---------|
| ShopByCategory | Статичные карточки | Kinetic Islands + Stagger |
| HotDealsAndPopular | Два столбца без анимации | Morphing Cards + Live Timer |
| LatestArticles | Обычная сетка | Card Stack как ReviewDeck |

### Уровень 3: Недостающие Ghost Protocol элементы

| Элемент | Описание |
|---------|----------|
| User Status Bar | XP / TS / RP в углу экрана (для залогиненных) |
| Daily Log Widget | Ежедневные задания |
| Announcement Banner | Системные уведомления |
| Community Pulse | Онлайн-счетчик + последние действия |

---

## 🔄 РЕКОМЕНДУЕМАЯ СТРУКТУРА HOMEPAGE

```
┌─────────────────────────────────────────────────────────┐
│  1. HERO SECTION (существует, уникальный)               │
│     • Zen Search Icon → Expanded Search                 │
│     • 8 Easter Eggs animations                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. LIVE ACTIVITY BAR (добавить LiveActivityFeed)       │
│     • Бегущая строка: "🛒 voidwalker купил RTX 5090"    │
│     • Онлайн счетчик: "234 сейчас на сайте"             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. TRENDING CHIPS (добавить TrendingChips)             │
│     • Горизонтальный скролл: #1 RTX 5090 +156%          │
│     • LIVE badge, пульсирующий                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. KINETIC DASHBOARD (существует)                      │
│  ┌──────────┬──────────┬──────────┐                     │
│  │ Reviews  │   Poll   │  Stats   │  ← Floating Islands │
│  │ (Stack)  │ (Voting) │ (System) │                     │
│  └──────────┴──────────┴──────────┘                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  5. QUICK ACCESS (добавить QuickAccessGrid)             │
│  ┌────────┬────────┬────────┐                          │
│  │ Сборка │ Лента  │ Group  │   ← 6 карточек           │
│  │   ПК   │        │  Buy   │                          │
│  ├────────┼────────┼────────┤                          │
│  │Рейтинг │Creators│ Гайды  │                          │
│  └────────┴────────┴────────┘                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  6. CATEGORIES (переделать ShopByCategory)              │
│     • Kinetic Islands стиль                             │
│     • Hover → 3D tilt + glow                            │
│     • Spring animations                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  7. HOT DEALS + POPULAR (переделать)                    │
│  ┌─────────────────┬─────────────────┐                  │
│  │    POPULAR      │   HOT DEALS     │                  │
│  │    (Stack?)     │   (Live Timer)  │                  │
│  └─────────────────┴─────────────────┘                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  8. ARTICLES (переделать LatestArticles)                │
│     • Card Stack как ReviewDeck                         │
│     • Или Morphing Card → развернуть статью             │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 ВСЕ ФАЙЛЫ СВЯЗАННЫЕ С ГЛАВНОЙ

### Основные:
- `/app/frontend/src/components/HomePage.jsx`
- `/app/frontend/src/components/kinetic/` (6 компонентов)

### Home компоненты:
- `/app/frontend/src/components/home/HeroSection.jsx` (2127 строк!)
- `/app/frontend/src/components/home/ShopByCategory.jsx`
- `/app/frontend/src/components/home/HotDealsAndPopular.jsx`
- `/app/frontend/src/components/home/LatestArticles.jsx`
- `/app/frontend/src/components/home/LiveActivityFeed.jsx` ❌ не используется
- `/app/frontend/src/components/home/TrendingChips.jsx` ❌ не используется
- `/app/frontend/src/components/home/QuickAccessGrid.jsx` ❌ не используется

### CSS:
- `/app/frontend/src/components/kinetic/kinetic.css`
- `/app/frontend/src/components/home/*.css` (7 файлов)

### Документация:
- `/app/SYSTEM_ARCHITECTURE_GHOST.md`
- `/app/memory/PRD.md`
- `/app/memory/FUTURE_GHOST_OS_MENU.md`
- `/app/design/KINETIC_UI_SPEC.md`

---

## 🎨 СТИЛИСТИЧЕСКИЕ ТРЕБОВАНИЯ (из документов)

### Цветовая палитра:
```css
--ghost-void: #050505
--ghost-amber: #FF9F43
--ghost-cyan: #00FFD4
--accent-red: #FF0000 (только для "Live" точек)
```

### Типографика:
- Заголовки: JetBrains Mono / SF Mono
- Dot Matrix стиль для цифр и статусов

### Анимации:
- Spring physics: `{ type: "spring", stiffness: 300, damping: 30 }`
- Stagger: `staggerChildren: 0.12`
- Layout Projection: `<motion.div layout>`

### Визуальный язык:
- Floating Islands (rounded-3xl, backdrop-blur-xl)
- Hairline borders (1px solid white/10)
- Recording dots (красные пульсирующие точки)
- Glass-morphism

---

*Документ создан для анализа ИИ*
*Дата: Январь 2025*
