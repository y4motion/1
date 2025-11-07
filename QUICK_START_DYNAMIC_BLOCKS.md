# 🚀 Быстрый Старт - Динамические Блоки

## Что это?

**DynamicCategoryGrid** - компонент для создания красивых сеток категорий в стиле PMM.gg:
- 🖼️ Крупные карточки с изображениями
- 📝 Текстовые оверлеи на изображениях
- 🎨 Hover эффекты и анимации
- 📱 Полностью адаптивный

## Быстрое использование

### 1. Импорт

```jsx
import DynamicCategoryGrid from './components/DynamicCategoryGrid';
```

### 2. Подготовка данных

```jsx
const categories = [
  {
    title: 'НАЗВАНИЕ',
    image: '/path/to/image.jpg',
    link: '/category/link',
    description: 'Краткое описание (опционально)'
  },
  // ... больше категорий
];
```

### 3. Использование

```jsx
<DynamicCategoryGrid 
  categories={categories}
  columns={4}
  title="Заголовок Секции"
/>
```

## Примеры для вашего проекта

### Пример 1: Категории продуктов (PMM.gg стиль)

```jsx
const productCategories = [
  {
    title: 'PRE-BUILTS',
    image: '/images/prebuilt-mouse.jpg',
    link: '/marketplace?category=prebuilts',
    description: 'Готовые премиум мыши'
  },
  {
    title: 'MOD-KITS',
    image: '/images/mod-kit-box.jpg',
    link: '/marketplace?category=mod-kits',
    description: 'Наборы для кастомизации'
  },
  {
    title: 'MOUSEPADS',
    image: '/images/gaming-mousepad.jpg',
    link: '/marketplace?category=mousepads',
    description: 'Профессиональные коврики'
  },
  {
    title: 'EXTRAS',
    image: '/images/accessories.jpg',
    link: '/marketplace?category=extras',
    description: 'Аксессуары и компоненты'
  }
];
```

### Пример 2: Основные разделы сайта

```jsx
const mainSections = [
  {
    title: 'MARKETPLACE',
    image: '/images/marketplace-hero.jpg',
    link: '/marketplace',
    description: 'Каталог товаров'
  },
  {
    title: 'COMMUNITY',
    image: '/images/community-hero.jpg',
    link: '/feed',
    description: 'Лента и общение'
  },
  {
    title: 'CREATORS',
    image: '/images/creators-hero.jpg',
    link: '/creators',
    description: 'Обзоры и контент'
  },
  {
    title: 'GROUP BUY',
    image: '/images/groupbuy-hero.jpg',
    link: '/groupbuy',
    description: 'Совместные закупки'
  }
];
```

### Пример 3: Для главной страницы

```jsx
function HomePage() {
  const heroCategories = [
    { title: 'GAMING', image: '/gaming.jpg', link: '/gaming' },
    { title: 'STREAMING', image: '/streaming.jpg', link: '/streaming' },
    { title: 'WORKSPACE', image: '/workspace.jpg', link: '/workspace' },
    { title: 'RGB', image: '/rgb.jpg', link: '/rgb' }
  ];

  return (
    <div>
      <HeroSection />
      
      {/* Динамическая сетка */}
      <DynamicCategoryGrid 
        categories={heroCategories}
        columns={4}
        title="🎮 Выберите Свой Стиль"
      />
      
      {/* Community Hub виджеты */}
      <CommunityHub />
      
      <Footer />
    </div>
  );
}
```

## Настройки

### Колонки (columns)

```jsx
columns={4}  // 4 карточки в ряд (по умолчанию)
columns={3}  // 3 карточки в ряд
columns={2}  // 2 карточки в ряд
```

### Заголовок секции (title)

```jsx
title="🎮 Исследуйте Категории"    // С эмодзи
title="Категории Продуктов"       // Без эмодзи
title={null}                       // Без заголовка
```

## Где использовать?

### ✅ Отлично подходит для:
- Главной страницы (категории, разделы)
- Страницы каталога (подкатегории)
- Лендингов (фичи, преимущества)
- Портфолио (проекты, кейсы)

### ⚠️ Не рекомендуется для:
- Списков с большим количеством элементов (>8)
- Страниц с плотной информацией
- Мобильных версий с узким экраном (автоматически адаптируется в 1 колонку)

## Советы по изображениям

### Требования:
- **Размер**: минимум 800x600px
- **Формат**: WebP, JPEG (качество 80-85%)
- **Композиция**: главный объект в центре
- **Контраст**: тёмные/средние тона (для белого текста)

### Где взять изображения:
- Unsplash (https://unsplash.com)
- Pexels (https://pexels.com)
- Свои продуктовые фото

### Пример оптимизации:
```bash
# Конвертация в WebP
cwebp input.jpg -q 80 -o output.webp

# Изменение размера
convert input.jpg -resize 1200x900 output.jpg
```

## Интеграция на главной странице

```jsx
// HomePage.jsx
import DynamicCategoryGrid from './components/DynamicCategoryGrid';
import TopArticlesWidget from './components/TopArticlesWidget';
import TopUsersWidget from './components/TopUsersWidget';
import TopProposalsWidget from './components/TopProposalsWidget';

function HomePage() {
  // Данные категорий
  const categories = [
    { title: 'MICE', image: '/mice.jpg', link: '/mice' },
    { title: 'KEYBOARDS', image: '/keyboards.jpg', link: '/keyboards' },
    { title: 'AUDIO', image: '/audio.jpg', link: '/audio' },
    { title: 'MONITORS', image: '/monitors.jpg', link: '/monitors' }
  ];

  return (
    <div className="dark-bg" style={{ paddingTop: '6rem' }}>
      {/* Hero секция */}
      <section className="hero">
        <h1>RUNNING TO UPGRADE...</h1>
        <SearchBar />
      </section>

      {/* Динамические категории */}
      <DynamicCategoryGrid 
        categories={categories}
        columns={4}
        title="🎮 Исследуйте Категории"
      />

      {/* Community Hub */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          🌐 Community Hub
        </h2>
        <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          <TopArticlesWidget />
          <TopUsersWidget />
          <TopProposalsWidget />
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        {/* ... существующий код ... */}
      </section>
    </div>
  );
}
```

## Кастомизация для вашего бренда

### Изменение цвета текста

```jsx
// В DynamicCategoryGrid.jsx найдите:
<h3 className="text-white ...">

// Замените на:
<h3 className="text-purple-400 ...">
```

### Изменение эффекта ховера

```jsx
// Больше масштабирования
className="group-hover:scale-110"

// Меньше масштабирования
className="group-hover:scale-102"

// Без масштабирования
className=""
```

### Добавление счётчика товаров

```jsx
{category.count && (
  <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full">
    {category.count} товаров
  </div>
)}
```

## Troubleshooting

### Проблема: Текст не читается на светлых изображениях

**Решение**: Увеличьте opacity тёмного оверлея:
```jsx
style={{ opacity: 0.6 }} // Вместо 0.4
```

### Проблема: Изображения загружаются медленно

**Решение**: 
1. Оптимизируйте изображения (WebP, меньше 200KB)
2. Используйте lazy loading:
```jsx
<img loading="lazy" ... />
```

### Проблема: Карточки разного размера на мобильных

**Решение**: Добавьте медиа-запрос:
```jsx
style={{ height: window.innerWidth < 768 ? '280px' : '320px' }}
```

## Полная документация

Для детального описания всех возможностей см. [DYNAMIC_BLOCKS_DOCUMENTATION.md](./DYNAMIC_BLOCKS_DOCUMENTATION.md)

---

**Нужна помощь?** Проверьте примеры в `/app/frontend/src/components/DynamicCategoryGrid.jsx`
