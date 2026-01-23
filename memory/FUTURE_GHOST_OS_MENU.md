# FUTURE TASK: Ghost OS — Neural Interface System

**Priority:** P1 (после Phase 3-4)
**Status:** ARCHIVED — для будущей реализации

## Концепция

Полная переработка User Menu и Profile. Стиль: Neiro-Interface (Neural Interface).
Вдохновение: Vision Pro UX, Death Stranding, NieR: Automata.

---

## 1. THE CORE PULSE (Кнопка Пуск)

Логотип — это не просто кнопка, это **Ядро Системы**.

### В покое:
- Медленно "дышит" (Opacity 0.5 → 1.0)
- Цвет зависит от Trust Score (Белый → Голубой → Глитч)

### При нажатии:
- Не открывает меню, а **разворачивает реальность**
- Экран затемняется (Focus Mode)
- Вокруг кнопки веером разлетаются "Узлы" (Nodes) управления
- Стиль: интерфейс Железного Человека + японский минимализм

---

## 2. NEURAL HUB (Вместо Sidebar Menu)

Компонент: `NeuralHub.jsx`

### Animation:
- Меню не 'выезжает', а разворачивается из центра (Scale + Blur In)
- Используй `AnimatePresence` из framer-motion

### Layout (3 зоны):

#### Top — Mini Profile:
- Аватар с `UserResonance`
- Ник + Класс

#### Mid — Smart Grid (2x2):
**Умные контекстные действия:**
| Условие | Кнопка |
|---------|--------|
| На странице товара | "Sell Similar" |
| Daily Log не выполнен | "Daily Log" (пульсирует) |
| Есть нераскрытые System Cache | "Inventory" |
| Выбил титул | "Claim Title" (пульсирует) |

#### Bottom — System Vitals:
- Полоска Маны (RP)
- Энтропия как "Signal Noise" (шум на полоске)
- Текущий Класс

---

## 3. THE OPERATOR DOSSIER (Вместо Profile Page)

Компонент: `OperatorDossier.jsx`

### Принцип:
- Никакого скролла на десктопе
- Одна парящая стеклянная карта (Dossier Card) по центру экрана
- Фон: `bg-black/80` для фокуса

### Structure (3 Columns):

#### Column 1 — Identity:
- Большой Аватар с `UserResonance` (Backlight)
- Титул (Highlander) с эффектом частиц
- Кнопка "Reboot System" (сброс класса)

#### Column 2 — Analytics (The Brain):
- Большой Radar Chart из Phase 2
- История Trust Score (Sparkline график): "Stability Check"

#### Column 3 — Legacy (The Soul):
- Сетка Бейджей (Achievements) — при ховере подробности
- Список Legacy Traits (от прошлых классов)
- Блок Contribution: вклад в Roadmap (потраченные RP)

---

## 4. VISUAL LANGUAGE

### Шрифт:
- `font-mono` для всех цифр

### Звук:
- `useSound` hook
- Ховер: тихий клик
- Открытие: звук включения питания

### Визуализация данных:
| Старое | Новое |
|--------|-------|
| "Joined Jan 2024" | `SYS.ACT: 2024.01` |
| Список достижений | Голографическая полка с вращаемыми иконками |
| "О себе" | DNA String: `#trader #builder #nightwatcher` |

---

## Файлы для создания:

```
/frontend/src/components/system/
├── NeuralHub.jsx          # Главное меню
├── CorePulse.jsx          # Кнопка-логотип
├── OperatorDossier.jsx    # Страница профиля
├── SmartAction.jsx        # Контекстная кнопка
└── SystemVitals.jsx       # Полоска RP + Entropy
```

---

## Что это даст:

1. **Ощущение игры:** Проверка профиля = открытие инвентаря в Cyberpunk 2077
2. **Удержание:** Люди будут заходить посмотреть на свой "Нимб" и "Энтропию"
3. **Статус:** Скриншот профиля = арт-объект для Instagram

---

*Archived: January 23, 2026*
*Trigger: После завершения Phase 4*
