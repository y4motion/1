# 📦 DynamicCategoryGrid - Документация

## Описание

Компонент для создания модульных сеток крупных карточек-категорий с наложенными текстами на изображения. Вдохновлен дизайном PMM.gg и идеально подходит для создания визуально привлекательных секций каталога.

## Особенности

✅ Адаптивная сетка (2-4 колонки)
✅ Hover эффекты (масштабирование, плавные переходы)
✅ Поддержка всех тем (Dark, Light, Minimal Mod)
✅ Оверлеи с градиентами для читаемости текста
✅ Опциональная секция с цитатой/hero изображением
✅ Автоматическая навигация по клику

## Использование

### Базовый пример

```jsx
import DynamicCategoryGrid from './components/DynamicCategoryGrid';

const categories = [
  {
    title: 'PRE-BUILTS',
    image: '/images/mouse-prebuilt.jpg',
    link: '/category/prebuilts',
    description: 'Готовые игровые мыши премиум класса'
  },
  {
    title: 'MOD-KITS',
    image: '/images/mod-kit.jpg',
    link: '/category/mod-kits',
    description: 'Наборы для кастомизации вашей мыши'
  },
  {
    title: 'MOUSEPADS',
    image: '/images/mousepad.jpg',
    link: '/category/mousepads',
    description: 'Профессиональные игровые коврики'
  },
  {
    title: 'EXTRAS',
    image: '/images/extras.jpg',
    link: '/category/extras',
    description: 'Аксессуары и дополнительные компоненты'
  }
];

function HomePage() {
  return (
    <div>
      <DynamicCategoryGrid 
        categories={categories}
        columns={4}
        title="Исследуйте Категории"
      />
    </div>
  );
}
```

### Пример для главной страницы с интеграцией Community Hub

```jsx
import DynamicCategoryGrid from './components/DynamicCategoryGrid';
import TopArticlesWidget from './components/TopArticlesWidget';
import TopUsersWidget from './components/TopUsersWidget';

function HomePage() {
  const productCategories = [
    {
      title: 'GAMING MICE',
      image: 'https://images.unsplash.com/photo-gaming-mouse',
      link: '/marketplace?category=mice'
    },
    {
      title: 'KEYBOARDS',
      image: 'https://images.unsplash.com/photo-gaming-keyboard',
      link: '/marketplace?category=keyboards'
    },
    {
      title: 'HEADSETS',
      image: 'https://images.unsplash.com/photo-gaming-headset',
      link: '/marketplace?category=headsets'
    },
    {
      title: 'MONITORS',
      image: 'https://images.unsplash.com/photo-gaming-monitor',
      link: '/marketplace?category=monitors'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        {/* ... hero content ... */}
      </section>

      {/* Dynamic Category Grid */}
      <DynamicCategoryGrid 
        categories={productCategories}
        columns={4}
        title="🎮 Исследуйте Категории"
      />

      {/* Community Hub */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          🌐 Community Hub
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          <TopArticlesWidget />
          <TopUsersWidget />
          <TopProposalsWidget />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        {/* ... featured products ... */}
      </section>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `categories` | `Array<Category>` | **required** | Массив объектов категорий |
| `columns` | `number` | `4` | Количество колонок в сетке (2-4) |
| `title` | `string` | `null` | Заголовок секции |

### Category Object

```typescript
interface Category {
  title: string;           // Название (заглавными буквами)
  image: string;          // URL изображения
  link: string;           // Путь для навигации
  description?: string;   // Опциональное описание (видно при ховере)
}
```

## Дизайн-система

### Размеры карточек

- **4 колонки**: минимум 280px на карточку
- **3 колонки**: минимум 350px на карточку
- **Высота**: фиксированная 320px

### Анимации

- **Hover карточки**: `scale(1.05)` + border
- **Hover изображения**: `scale(1.10)` внутри карточки
- **Hover описания**: появление с `opacity: 0 → 1`

### Цветовая схема

- **Оверлей**: `rgba(0,0,0,0.4)` по умолчанию
- **Border на ховере**: `rgba(255,255,255,0.3)`
- **Text Shadow**: `2px 2px 8px rgba(0,0,0,0.8)` для читаемости

### Темы

#### Dark Theme
- Стандартное поведение с темными оверлеями

#### Light Theme
- Те же оверлеи для контраста текста

#### Minimal Mod Theme
- `border-radius: 0` (острые углы)
- `font-family: SF Mono, monospace`
- Убраны все скругления

## Адаптивность

```css
/* Desktop (4 колонки) */
@media (min-width: 1280px) {
  grid-template-columns: repeat(4, 1fr);
}

/* Tablet (2-3 колонки) */
@media (min-width: 768px) and (max-width: 1279px) {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

/* Mobile (1 колонка) */
@media (max-width: 767px) {
  grid-template-columns: 1fr;
  height: 280px; // Уменьшенная высота
}
```

## Примеры реальных кейсов

### 1. Категории продуктов (как PMM.gg)

```jsx
const categories = [
  { title: 'PRE-BUILTS', image: '/mouse1.jpg', link: '/prebuilts' },
  { title: 'MOD-KITS', image: '/kit.jpg', link: '/mod-kits' },
  { title: 'MOUSEPADS', image: '/pad.jpg', link: '/mousepads' },
  { title: 'EXTRAS', image: '/extras.jpg', link: '/extras' }
];
```

### 2. Фичи платформы

```jsx
const features = [
  { 
    title: 'FEED', 
    image: '/features/feed.jpg', 
    link: '/feed',
    description: 'Лента постов сообщества'
  },
  { 
    title: 'ARTICLES', 
    image: '/features/articles.jpg', 
    link: '/articles',
    description: 'Глубокие обзоры и аналитика'
  },
  { 
    title: 'CREATORS', 
    image: '/features/creators.jpg', 
    link: '/creators',
    description: 'Верифицированные обзорщики'
  },
  { 
    title: 'GROUP BUY', 
    image: '/features/groupbuy.jpg', 
    link: '/groupbuy',
    description: 'Совместные закупки'
  }
];
```

### 3. Персоны/Аудитории

```jsx
const personas = [
  { title: 'PRO GAMER', image: '/personas/gamer.jpg', link: '/catalog?persona=pro_gamer' },
  { title: 'CREATOR', image: '/personas/creator.jpg', link: '/catalog?persona=creator' },
  { title: 'AUDIOPHILE', image: '/personas/audio.jpg', link: '/catalog?persona=audiophile' },
  { title: 'RGB ENTHUSIAST', image: '/personas/rgb.jpg', link: '/catalog?persona=rgb' }
];
```

## Best Practices

### Изображения

✅ **DO:**
- Используйте высококачественные изображения (минимум 800x600px)
- Оптимизируйте для web (WebP, качество 80-85%)
- Используйте изображения с хорошим контрастом
- Размещайте основной объект в центре

❌ **DON'T:**
- Не используйте изображения с текстом (конфликт с оверлеем)
- Избегайте очень светлых фонов (плохая читаемость текста)
- Не используйте слишком детализированные/загроможденные изображения

### Текст

✅ **DO:**
- Держите заголовки короткими (1-2 слова)
- Используйте заглавные буквы для заголовков
- Описания должны быть краткими (до 50 символов)

❌ **DON'T:**
- Не используйте длинные предложения в заголовках
- Избегайте смешивания регистров

### Структура

✅ **DO:**
- Группируйте связанные категории
- Используйте последовательную визуальную иерархию
- Поддерживайте единый стиль изображений

❌ **DON'T:**
- Не смешивайте разные стили фотографий
- Избегайте нелогичного порядка категорий

## Интеграция с существующими компонентами

```jsx
// HomePage.jsx
import DynamicCategoryGrid from './components/DynamicCategoryGrid';
import TopArticlesWidget from './components/TopArticlesWidget';
import TopUsersWidget from './components/TopUsersWidget';
import TopProposalsWidget from './components/TopProposalsWidget';

function HomePage() {
  return (
    <div className="dark-bg" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
      <div className="grain-overlay" />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Dynamic Product Categories */}
      <DynamicCategoryGrid 
        categories={productCategories}
        columns={4}
        title="Исследуйте Категории"
      />

      {/* Community Hub Widgets */}
      <section className="py-12">
        <h3 className="text-3xl font-bold text-center mb-8">
          🌐 Community Hub
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          <TopArticlesWidget />
          <TopUsersWidget />
          <TopProposalsWidget />
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />
      
      <Footer />
    </div>
  );
}
```

## Кастомизация

### Изменение высоты карточек

```jsx
// В компоненте измените:
style={{ height: '400px' }} // Вместо 320px
```

### Изменение эффекта ховера

```jsx
// В компоненте измените:
className="... group-hover:scale-110" // Вместо scale-105
```

### Добавление счётчиков/бейджей

```jsx
{category.count && (
  <span className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
    {category.count}
  </span>
)}
```

---

**Версия**: 1.0
**Дата**: 2025-01-07
**Автор**: Glassy Market Development Team
