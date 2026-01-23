# PROJECT: GHOST PROTOCOL (The System Architecture)

## AESTHETIC DIRECTIVE
- **Style:** Toriki / Future Minimal / Japandi Tech
- **Vibe:** "The System from Solo Leveling" meets "Apple Design"
- **Visuals:** Thin 1px lines, Monospace fonts, Blur filters, Noise textures
- **Colors:**
  - Deep Black: `#050505`
  - Ghost White: `rgba(255,255,255,0.1)`
  - Amber Accent: `#FF9F43`
  - Void Blue: `#2E5CFF` (only for magic)
- **Strict Rule:** NO "Gamification" visuals (no golden stars, no confetti, no cartoons). Only raw data, blueprints, and holographic projections.

---

## I. PHILOSOPHY: THE "PLAYER" STATUS

Мы не используем термин "User". Мы создаем иерархию **Операторов**. Система оценивает их полезность, навыки и честность. Это социальная инженерия, упакованная в интерфейс ОС.

### The Trinity Metrics (Три столпа)

| Metric | Name | Description | Visual |
|--------|------|-------------|--------|
| **XP** | Synchronization | Накопительный опыт. Показывает "Старшинство" | Тонкая полоса прогресса под аватаркой |
| **TS** | Trust Score | Социальный кредит. Безопасность (0-1000) | "Нимб" (Ring) вокруг аватара |
| **RP** | Resource Points | Энергия влияния (Мана). Тратится на голосования | Числовое значение `RP: 5400` в ID-карте |

---

## II. THE HIERARCHY (Class System)

Уровни доступа определяют, насколько глубоко Оператор видит "Систему".

### Level 0-10: GHOST (Призрак)
- **Role:** Наблюдатель
- **Access:** Только чтение и покупки. Swap (торговля) только с премодерацией
- **Visual:** Dim, faded interface elements

### Level 10-40: PHANTOM (Фантом)
- **Role:** Активный участник
- **Access:** Свободный Swap. Голосование. Доступ к базовому Чату
- **Visual:** Standard interface

### Level 40-80: OPERATOR (Оператор)
- **Role:** Влиятельный узел
- **Access:** Hidden Armory (Скрытый магазин в разделе Mod)
- **Perk:** Увеличенный вес голоса (x1.5)
- **Visual:** Subtle glow on UI elements

### Level 80+: MONARCH (Монарх)
- **Role:** Элита
- **Access:** Direct Line (Золотой чат с Основателями). Право оставить след на Монументе
- **Visual:** Янтарная аура сообщений
- **Perk:** Vote weight x2.0

---

## III. MECHANICS: EVOLUTION & SPECIALIZATION

### 1. Neural Pathways (Вместо "Классов")

На **10 уровне** Оператор выбирает специализацию. Это меняет его взаимодействие с интерфейсом.

#### ARCHITECT (Сборщик)
- **Icon:** `⬡` (Hexagon)
- **Buff:** Видит скрытые технические данные в PC Builder
- **Bonus:** +25% XP за сборки
- **Visual:** Blueprint overlay on tech specs

#### BROKER (Трейдер)
- **Icon:** `◇` (Diamond)
- **Buff:** Сниженная комиссия на Swap (-15%). Расширенные лимиты лотов
- **Visual:** Green accent in Swap interface
- **Bonus:** +RP за успешные сделки

#### OBSERVER (Критик)
- **Icon:** `◉` (Eye)
- **Buff:** Отзывы имеют приоритет показа ("Expert Verified")
- **Bonus:** +50% RP за полезные ревью
- **Visual:** Reviews marked with "VERIFIED OBSERVER" badge

### 2. System Decryption (Вместо "Лутбоксов")

Никаких сундуков. Только **"Дешифровка Данных"**.

- **Trigger:** При повышении уровня
- **Visual:** На экране появляется минималистичный полигональный куб (Wireframe). Он раскладывается на плоскости.
- **Animation:** CSS 3D transforms, unfolding wireframe

#### Rewards Pool:
| Type | Examples |
|------|----------|
| **Artifacts** | Темы (Dark Void, Amber Flux), Скины для профиля |
| **Protocols** | Бусты для объявлений (+24h visibility), Токены скидок |
| **Data Fragments** | Collectibles that unlock at milestones |

### 3. Trust Halo (Визуализация Доверия)

Вокруг аватарки пользователя всегда есть тонкое кольцо (1px).

| Trust Score | Color | State |
|-------------|-------|-------|
| > 800 | Cyan (Neon) `#00FFD4` | Verified - Breathing animation |
| 500-800 | White (Ghost) `rgba(255,255,255,0.4)` | Neutral |
| 400-500 | Orange (Warning) `#FF9F43` | Suspect |
| < 400 | Red + Glitch `#FF4444` | Banned/Scammer |

---

## IV. UI COMPONENTS (The Look)

### 1. The Holographic ID Card (Profile)

Вместо скучного профиля — **Цифровой Паспорт**.

```
┌─────────────────────────────────────┐
│  ◯ AVATAR + HALO                    │
│                                     │
│  GHOST_USER_0x7F3A                  │
│  Level 42 Operator • Broker         │
│                                     │
│  ┌─────────────────┐                │
│  │   RADAR CHART   │  XP: 12,400    │
│  │   (Spider Web)  │  TS: 847       │
│  │                 │  RP: 5,400     │
│  └─────────────────┘                │
│                                     │
│  ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ SYNC: 78%        │
│                                     │
│  [QR CODE]          EST. 2024.01    │
└─────────────────────────────────────┘
```

**Structure:** Стеклянная карта с эффектом преломления (`backdrop-blur: 20px`)

**Content:**
- Фото + Нимб Доверия
- Титул (напр. "Level 42 Operator • Broker")
- Spider Chart (Radar): График характеристик [Speed, Trust, Comm, Tech]. Рисуется тонкими 1px линиями
- QR Code: Ссылка на профиль

### 2. The Mod Page (The Temple)

Раздел `/mod` — это сердце бренда.

#### Layer 1: The Frieze
- Массивная "бетонная" балка сверху
- По ней бежит код и "проступают" белые фразы пользователей (Legacy)

#### Layer 2: The Thread
- Янтарная нить таймлайна, прошивающая весь сайт

#### Layer 3: The Hidden Gate
- **State:** Узкая полоса с едва заметной надписью "ACCESS ARMORY"
- **Action:** При клике сайт "разрывается" (верх уезжает вверх, низ вниз)
- **Content:** Открывается черная пустота (Void). Левитирующие товары, освещенные тусклым светом

---

## V. IMPLEMENTATION PLAN

### PHASE 1: THE BACKEND CORE
**Priority:** P0
**Files:** `/backend/models/rating.py`, `/backend/models/user.py`

**Tasks:**
1. Update User Model: Add fields for `trust_score` (int, default 500), `rp_balance` (int), `class_type` (enum: Architect, Broker, Observer, null)
2. Create 'SystemCache' Logic: A function that generates rewards based on probabilities when a user levels up
3. Update Review Model: Add `weight` calculation based on User Class (Observer = x3 weight)
4. Add hierarchy calculation based on level ranges

### PHASE 2: THE VISUAL IDENTITY (ID & HALO)
**Priority:** P0
**Files:** New components in `/frontend/src/components/system/`

**Tasks:**
1. Create `UserHalo.jsx`: Ring around avatar based on `trust_score`. Include subtle 'breathing' animation for high tiers
2. Create `HolographicID.jsx`: Profile card with Radar Chart using `recharts`. Dark glass background with noise texture
3. Create `SystemBadge.jsx`: Class indicator (⬡/◇/◉)
4. Integrate these into Profile Page and Chat messages

### PHASE 3: THE MOD TEMPLE & HIDDEN SHOP
**Priority:** P1 (Partially done)
**Files:** `/frontend/src/components/ModPage.jsx`

**Tasks:**
1. ✅ 'The Frieze' (Hero Section) - DONE
2. ✅ 'The Split' mechanic - DONE  
3. Refine 'VoidShop' aesthetics to match Ghost Protocol
4. Add Amber Thread timeline element

### PHASE 4: THE EVOLUTION (INTERACTIVITY)
**Priority:** P2
**Files:** New components

**Tasks:**
1. Create `DecryptionCube.jsx`: Level-up modal with 3D wireframe cube unfolding (CSS 3D transforms)
2. Create `ClassSelection.jsx`: Minimalist three-column selection at level 10
3. Add 'System Notifications': Monospace toast notifications - "RP GENERATED: +50", "SYSTEM SYNC: 98%"

---

## VI. DATABASE SCHEMA UPDATES

```javascript
// User Model Additions
{
  trust_score: { type: Number, default: 500, min: 0, max: 1000 },
  rp_balance: { type: Number, default: 0 },
  class_type: { type: String, enum: ['architect', 'broker', 'observer', null], default: null },
  class_selected_at: { type: Date, default: null },
  
  // Hierarchy (computed from level)
  hierarchy: { type: String, enum: ['ghost', 'phantom', 'operator', 'monarch'] },
  
  // Artifacts & Rewards
  artifacts: [{ type: String }],  // Theme IDs, skin IDs
  protocols: [{
    type: { type: String },
    expires_at: { type: Date }
  }],
  
  // Stats for Radar Chart
  stats: {
    speed: { type: Number, default: 50 },    // Transaction speed
    trust: { type: Number, default: 50 },     // = trust_score / 10
    comm: { type: Number, default: 50 },      // Communication rating
    tech: { type: Number, default: 50 }       // Technical knowledge
  }
}
```

---

## VII. COLOR TOKENS (CSS Variables)

```css
:root {
  /* Ghost Protocol Palette */
  --ghost-void: #050505;
  --ghost-deep: #0a0a0b;
  --ghost-surface: #141416;
  --ghost-elevated: #1c1c1f;
  
  /* Text */
  --ghost-text-dim: rgba(255, 255, 255, 0.25);
  --ghost-text-muted: rgba(255, 255, 255, 0.45);
  --ghost-text-soft: rgba(255, 255, 255, 0.7);
  --ghost-text-pure: #e8e8ea;
  
  /* Accents */
  --ghost-amber: #FF9F43;
  --ghost-void-blue: #2E5CFF;
  --ghost-cyan: #00FFD4;
  
  /* Trust Halo Colors */
  --halo-verified: #00FFD4;
  --halo-neutral: rgba(255, 255, 255, 0.4);
  --halo-warning: #FF9F43;
  --halo-danger: #FF4444;
  
  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.06);
  --glass-hover: rgba(255, 255, 255, 0.08);
}
```

---

*Last Updated: January 2026*
*Version: 1.0.0*
*Codename: Ghost Protocol*
