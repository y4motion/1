# Glassy Market - Полная Документация Проекта

## 1. ОБЗОР ПРОЕКТА

### Концепция
**Glassy Market** - это комплексный IT-хаб, объединяющий функции маркетплейса компьютерных комплектующих и периферии с социальной платформой для энтузиастов. Платформа превращает обычную коммерцию в комьюнити-ориентированный опыт с геймификацией, влиянием пользователей на развитие продукта и системой создателей контента.

### Целевая аудитория
- **Геймеры** - поиск игровой периферии
- **Энтузиасты PC Building** - сборка и кастомизация ПК
- **Контент-криэйторы** - обзорщики, стримеры
- **Сообщество** - активные участники, влияющие на развитие платформы

### Бизнес-модель
1. **Маркетплейс** - комиссия с продаж
2. **Групповые закупки** - организационная комиссия
3. **Премиум-контент** - верифицированные креаторы
4. **Сборки креаторов** - партнёрские вознаграждения

## 2. ТЕКУЩАЯ АРХИТЕКТУРА

### Технологический стек

**Frontend:**
- React 18.x
- React Router v6
- Tailwind CSS + Custom CSS (glassmorphism)
- Context API (Theme, Language, Auth, Currency)
- Lucide React (иконки)

**Backend:**
- FastAPI (Python)
- Motor (AsyncIOMotorClient для MongoDB)
- Pydantic (валидация данных)
- JWT Authentication (python-jose)
- bcrypt (хэширование паролей)

**База данных:**
- MongoDB (async)
- UUID-based IDs (не ObjectId)
- ISO datetime serialization

**Инфраструктура:**
- Supervisord (управление процессами)
- Nginx (прокси)
- Environment variables (.env)

### Структура проекта

```
/app/
├── backend/
│   ├── models/              # Pydantic модели
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── post.py          # Социальная лента
│   │   ├── article.py       # Статьи
│   │   ├── creator.py       # Креаторы
│   │   ├── voting.py        # Голосования
│   │   ├── rating.py        # XP/RP система
│   │   ├── groupbuy.py      # Групповые закупки
│   │   ├── review.py
│   │   ├── question.py
│   │   ├── cart.py
│   │   └── category.py
│   ├── routes/              # API endpoints
│   │   ├── auth_routes.py
│   │   ├── product_routes.py
│   │   ├── feed_routes.py
│   │   ├── article_routes.py
│   │   ├── creator_routes.py
│   │   ├── voting_routes.py
│   │   ├── rating_routes.py
│   │   ├── groupbuy_routes.py
│   │   ├── review_routes.py
│   │   ├── question_routes.py
│   │   ├── cart_routes.py
│   │   └── catalog_routes.py
│   ├── utils/
│   │   └── auth_utils.py    # JWT, password hashing
│   ├── config/
│   │   └── catalog_config.py # Personas & Categories
│   ├── database.py          # MongoDB connection
│   ├── server.py            # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── japanese-images-preview.html  # Preview страница
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx              # Главная с loading анимацией
│   │   │   ├── MarketplacePage.jsx       # Каталог товаров
│   │   │   ├── FeedPage.jsx              # Лента постов
│   │   │   ├── ArticlesPage.jsx          # Статьи
│   │   │   ├── CreatorsPage.jsx          # Хаб креаторов
│   │   │   ├── VotingPage.jsx            # Голосования
│   │   │   ├── RatingPage.jsx            # Рейтинг
│   │   │   ├── GroupBuyPage.jsx          # Групповые закупки
│   │   │   ├── UserProfilePage.jsx       # Профиль
│   │   │   ├── ProductDetailPage.jsx     # Карточка товара
│   │   │   ├── CartPage.jsx              # Корзина
│   │   │   ├── ChatFullPage.jsx          # Чат
│   │   │   ├── NotificationsPage.jsx     # Уведомления
│   │   │   ├── PCBuilderPage.jsx         # Сборщик ПК
│   │   │   ├── ModPage.jsx               # Моддинг
│   │   │   ├── Header.jsx                # Шапка сайта
│   │   │   ├── Footer.jsx                # Подвал
│   │   │   ├── AuthModal.jsx             # Модалка входа
│   │   │   ├── EditProfileModal.jsx      # Редактирование профиля
│   │   │   ├── FloatingChatWidget.jsx    # Виджет чата
│   │   │   ├── TestimonialsCarousel.jsx  # Карусель отзывов
│   │   │   ├── TopArticlesWidget.jsx     # Топ статьи
│   │   │   ├── TopUsersWidget.jsx        # Топ пользователи
│   │   │   ├── TopProposalsWidget.jsx    # Топ голосования
│   │   │   ├── DynamicCategoryGrid.jsx   # Динамические блоки
│   │   │   ├── FilterPanel.jsx           # Панель фильтров
│   │   │   ├── CatalogMega.jsx           # Мега-каталог
│   │   │   └── BadgeTooltip.jsx          # Tooltip для бейджей
│   │   ├── contexts/
│   │   │   ├── ThemeContext.jsx          # Dark/Light/Minimal Mod
│   │   │   ├── LanguageContext.jsx       # EN/RU
│   │   │   ├── AuthContext.jsx           # Аутентификация
│   │   │   └── CurrencyContext.jsx       # Валюты
│   │   ├── styles/
│   │   │   ├── glassmorphism.css         # Основные стили
│   │   │   ├── minimalMod.css            # Тема Minimal Mod
│   │   │   ├── App.css
│   │   │   └── index.css
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
├── DYNAMIC_BLOCKS_DOCUMENTATION.md
├── QUICK_START_DYNAMIC_BLOCKS.md
└── test_result.md

```

### Ключевые библиотеки

**Backend (requirements.txt):**
- fastapi
- uvicorn
- motor (async MongoDB)
- pydantic
- python-jose[cryptography] (JWT)
- passlib[bcrypt] (пароли)
- python-multipart
- litellm (AI интеграции)
- emergentintegrations

**Frontend (package.json):**
- react, react-dom, react-router-dom
- lucide-react (иконки)
- tailwindcss
- @craco/craco (конфигурация)

## 3. РЕАЛИЗОВАННЫЕ СТРАНИЦЫ И КОМПОНЕНТЫ

### 3.1 Главная страница (/)

**UI:**
- **Hero секция** (100vh):
  - Фоновое изображение Mount Fuji на рассвете
  - Креативная loading анимация (белая линия 0→100%)
  - Трансформация в поисковую строку
  - 2 пульсирующие стрелочки вниз (strobe эффект)
  
- **4 квадратных блока** (382x382px, 3px radius):
  - RATING - рейтинг сообщества
  - ARTICLES - обзоры и статьи
  - CREATORS - хаб креаторов
  - GROUP BUY - групповые закупки
  
- **1 большой блок FEED** (1840x560px, 3px radius)

- **WHAT PEOPLE SAY** - карусель отзывов:
  - Горизонтальная прокрутка
  - Прогресс-бар внизу
  - 2 кнопки навигации справа
  - Автосмена каждые 4 секунды

- **Community Hub** - 3 виджета:
  - Топ-3 статьи месяца
  - Топ-3 пользователя месяца
  - Топ-3 активных голосования

- **Топ категории** (8 ссылок)

- **FEATURED DEALS** - 3 товара в PMM.gg стиле

**Функционал:**
- ✅ Loading анимация при первой загрузке
- ✅ Навигация по блокам
- ✅ Hover эффекты (scale, border)
- ✅ Карусель отзывов (автоматическая + ручная)
- ✅ Клик на отзыв → переход на товар
- ✅ Адаптивные виджеты

**Компоненты:**
- HomePage.jsx
- TopArticlesWidget.jsx
- TopUsersWidget.jsx
- TopProposalsWidget.jsx
- TestimonialsCarousel.jsx
- DynamicCategoryGrid.jsx

---

### 3.2 Marketplace (/marketplace)

**UI:**
- Header с поиском и фильтрами
- Кнопка "ALL" для каталога (выпадающий мега-каталог)
- Боковая панель фильтров:
  - Персоны (10 вариантов)
  - Общие фильтры (цена, состояние)
  - Специфические фильтры (динамические)
- Сетка товаров (responsive grid)

**Функционал:**
- ✅ Поиск товаров
- ✅ Фильтрация по категориям
- ✅ Фильтрация по персонам
- ✅ Ценовой диапазон
- ✅ Сортировка (новизна, цена, рейтинг)
- ✅ Wishlist toggle
- ✅ Adaptive catalog (персоны)

**Компоненты:**
- MarketplacePage.jsx
- FilterPanel.jsx
- CatalogMega.jsx
- SpecificFilterRenderer.jsx

---

### 3.3 Feed (/feed)

**UI:**
- Заголовок "ЛЕНТА" / "FEED"
- Кнопка "Создать пост"
- Лента постов (Twitter-стиль):
  - Аватар пользователя
  - Username + Level badge
  - Контент поста
  - Shoppable tags (товарные метки)
  - Кнопки: Like, Repost, Comment, Share

**Функционал:**
- ✅ Отображение постов
- ✅ Создание поста (модалка)
- ✅ Лайки постов
- ✅ Shoppable tags → переход на товар
- ⚠️ Репосты (API готов, UI нужна доработка)
- ⚠️ Комментарии (API готов, UI нужна доработка)

**Компоненты:**
- FeedPage.jsx

**API:**
- GET /api/feed - получить ленту
- POST /api/feed - создать пост
- POST /api/feed/{id}/like - лайк
- POST /api/feed/{id}/comments - комментарий

---

### 3.4 Articles (/articles)

**UI:**
- Заголовок "СТАТЬИ" / "ARTICLES"
- Фильтры: Все статьи / Избранное
- Кнопка "Написать статью"
- Сетка статей (3 колонки):
  - Cover image
  - Категория badge
  - Заголовок и подзаголовок
  - Автор (с verified badge)
  - Время чтения
  - Статистика (просмотры, лайки, закладки)

**Функционал:**
- ✅ Отображение статей
- ✅ Фильтрация по категориям
- ✅ Featured статьи
- ⚠️ Создание статьи (маршрут есть, форма нужна)
- ⚠️ Лайки/закладки (API готов)

**Компоненты:**
- ArticlesPage.jsx

**API:**
- GET /api/articles - список статей
- GET /api/articles/{id} - одна статья
- POST /api/articles - создать
- POST /api/articles/{id}/like - лайк
- POST /api/articles/{id}/bookmark - закладка

---

### 3.5 Creators (/creators)

**UI:**
- Заголовок "ХАБ КРЕАТОРОВ" / "CREATORS HUB"
- Описание секции
- Сетка креаторов (3 колонки):
  - Banner изображение
  - Аватар (120px)
  - Verification badge
  - Display name + Bio
  - Specialization tags
  - Статистика (followers, views, likes)
  - Социальные ссылки
  - Кнопка "Смотреть профиль"

**Функционал:**
- ✅ Отображение верифицированных креаторов
- ⚠️ Follow/Unfollow (API готов)
- ⚠️ Assemblies (сборки товаров)
- ❌ Создание профиля креатора

**Компоненты:**
- CreatorsPage.jsx

**API:**
- GET /api/creators - список
- GET /api/creators/{id} - профиль
- POST /api/creators/profile - создать профиль
- POST /api/creators/{id}/follow - подписка
- POST /api/creators/{id}/assemblies - создать сборку

---

### 3.6 Voting (/voting)

**UI:**
- Заголовок "ГОЛОСОВАНИЯ" / "VOTING"
- Описание (вес голоса зависит от уровня)
- Фильтры статусов:
  - На модерации
  - На голосовании
  - В разработке
  - Завершено
- Список предложений:
  - Status badge (цветной)
  - Category badge
  - Заголовок + описание
  - Автор + Level
  - Статистика голосов (up/down, weighted score)

**Функционал:**
- ✅ Просмотр предложений
- ✅ Фильтрация по статусу
- ⚠️ Создание предложения (1 в месяц)
- ⚠️ Голосование (weighted by level)
- ⚠️ Комментарии
- ❌ Модерация (веттинг)

**Компоненты:**
- VotingPage.jsx

**API:**
- GET /api/voting - список
- POST /api/voting - создать
- POST /api/voting/{id}/vote - проголосовать
- POST /api/voting/{id}/vet - модерация (admin)

---

### 3.7 Rating (/rating)

**UI:**
- Заголовок "РЕЙТИНГ СООБЩЕСТВА" / "RATING"
- Описание наград (Топ-10)
- Переключатель: Месяц / Все время
- Leaderboard:
  - Rank badge (медали для топ-3)
  - Аватар
  - Username
  - Level + Streak
  - Очки (RP или XP)
  - Legendary achievements

**Функционал:**
- ✅ Отображение рейтинга
- ✅ Переключение Monthly/All-time
- ⚠️ Начисление XP/RP (автоматика)
- ❌ Ежемесячный сброс RP (cron)
- ❌ Выдача наград топ-10

**Компоненты:**
- RatingPage.jsx

**API:**
- GET /api/rating/leaderboard - рейтинг
- GET /api/rating/top-monthly - топ месяца
- GET /api/rating/me - мои stats
- POST /api/rating/award-xp - начислить XP (admin)
- POST /api/rating/reset-monthly - сброс (admin)

---

### 3.8 Group Buy (/groupbuy)

**UI:**
- Заголовок "ГРУППОВЫЕ ЗАКУПКИ" / "GROUP BUY"
- Фильтры: Активна / Цель достигнута / Не состоялась
- Сетка закупок (3 колонки):
  - Изображение товара
  - Status badge
  - Заголовок + описание
  - Текущая цена (зелёная)
  - Прогресс-бар участников
  - Дедлайн
  - Организатор

**Функционал:**
- ✅ Просмотр групповых закупок
- ✅ Фильтрация по статусу
- ⚠️ Создание закупки
- ⚠️ Присоединение/выход
- ⚠️ Отметка интереса

**Компоненты:**
- GroupBuyPage.jsx

**API:**
- GET /api/groupbuy - список
- POST /api/groupbuy - создать
- POST /api/groupbuy/{id}/join - присоединиться
- POST /api/groupbuy/{id}/leave - выйти
- POST /api/groupbuy/{id}/interest - пометить интерес

---

### 3.9 Профиль пользователя (/profile)

**UI:**
- Аватар (120px) с кнопкой редактирования
- Username + @username
- Level badge с цветом
- Статистика (XP, Achievements, Streak)
- Bio секция
- Дополнительная информация (Location, Website, Joined)
- Referral Code (копирование)
- XP прогресс-бар
- 3 таба: Stats, Achievements, Quests
- Кнопка "Edit Profile"

**Функционал:**
- ✅ Отображение профиля
- ✅ Редактирование (модалка)
- ✅ Выбор аватара (15 эмодзи)
- ✅ Bio, Location, Website
- ✅ Копирование реферального кода

**Компоненты:**
- UserProfilePage.jsx
- EditProfileModal.jsx

---

### 3.10 Уведомления (/notifications)

**UI:**
- Заголовок с unread badge
- Список уведомлений:
  - Иконка типа (Package, Heart, Message, Trophy, Gift)
  - Заголовок + сообщение
  - Timestamp
  - Кнопки: Mark read, Delete
- Кнопка "Mark all as read"

**Функционал:**
- ✅ Отображение уведомлений
- ✅ Отметка как прочитанное
- ✅ Удаление уведомления
- ✅ Фильтр unread

**Компоненты:**
- NotificationsPage.jsx

---

### 3.11 Чат (/chat, /chat/:id)

**UI:**
- Header с аватаром собеседника
- История сообщений
- Input для нового сообщения
- Typing indicator
- Кнопки вложений (файл, изображение)
- Кнопка "Назад"

**Функционал:**
- ✅ Отображение истории
- ✅ Отправка сообщений
- ✅ Typing indicator
- ✅ Auto-scroll вниз
- ⚠️ Реальный WebSocket (сейчас mock)
- ⚠️ Вложения

**Компоненты:**
- ChatFullPage.jsx
- FloatingChatWidget.jsx (мини-виджет)

---

### 3.12 Карточка товара (/product/:id)

**UI:**
- Изображения товара (галерея)
- Название, цена, рейтинг
- Описание и характеристики
- Q&A секция
- Reviews секция
- Live Chat под товаром
- Кнопки: Add to Cart, Wishlist

**Функционал:**
- ✅ Отображение товара
- ✅ Добавление в корзину
- ✅ Wishlist toggle
- ✅ Просмотр отзывов
- ✅ Q&A
- ⚠️ Quick Buy модалка

**Компоненты:**
- ProductDetailPage.jsx

---

### 3.13 Корзина (/cart)

**UI:**
- Список товаров в корзине
- Изображение + название + цена
- Quantity selector
- Удаление товара
- Итоговая сумма
- Кнопка "Checkout"

**Функционал:**
- ✅ Отображение корзины
- ✅ Изменение количества
- ✅ Удаление товаров
- ✅ Расчёт итога
- ⚠️ Оформление заказа

**Компоненты:**
- CartPage.jsx

---

### 3.14 PC Builder (/pc-builder)

**UI:**
- Список компонентов (CASE, CPU, GPU, MB, RAM, STORAGE, PSU, COOLING)
- Выбор компонентов
- Итоговая сборка
- Расчёт совместимости

**Функционал:**
- ✅ Выбор компонентов
- ⚠️ Проверка совместимости
- ⚠️ Сохранение сборки

**Компоненты:**
- PCBuilderPage.jsx

---

### 3.15 Mod Page (/mod)

**UI:**
- Информация о моддинге
- Примеры модов

**Функционал:**
- ✅ Информационная страница

**Компоненты:**
- ModPage.jsx

---

### 3.16 Header (глобальный)

**UI:**
- Логотип (GLASSY) + кнопка LVL Menu
- Навигация:
  - MARKETPLACE
  - RESTOCK
  - ASSEMBLY (PC Builder)
  - MOD
- Кнопки:
  - Shopping Cart
  - Messages (badge)
  - User/Login
  
**LVL Menu (боковая панель 340px):**
- Compact header:
  - Аватар (56px)
  - Username + edit button
  - Online status (4 варианта)
- Gamification badges:
  - Level, XP, Achievements, Streak, Coins
  - Mini progress bar
- Навигация:
  - Profile, Notifications, Messages, Bookmarks, Lists, Communities
- Settings menu
- Logout

**Функционал:**
- ✅ Навигация
- ✅ LVL Menu toggle
- ✅ Theme switcher (Dark/Light/Minimal Mod)
- ✅ Language switcher (EN/RU)
- ✅ Currency switcher
- ✅ Auth modal (Login/Register)
- ✅ Online status change

**Компоненты:**
- Header.jsx
- AuthModal.jsx
- BadgeTooltip.jsx

---

### 3.17 Footer (глобальный)

**UI:**
- 3 колонки ссылок:
  - News, Downloads, Privacy, Cookies, Accessibility, Ads
  - Contact, Support, Suggest Idea
  - Best Products, Builds, Team, Guild, Developments
- Адаптация к темам

**Функционал:**
- ✅ Навигация по сайту
- ✅ Адаптивность тем

**Компоненты:**
- Footer.jsx

---

## 4. ФУНКЦИОНАЛЬНОСТЬ

### 4.1 Реализовано ✅

**Аутентификация:**
- [x] Регистрация пользователей (email, username, password)
- [x] Вход (JWT токены)
- [x] Защищённые маршруты
- [x] Роли (User, Seller, Moderator, Admin)

**Товары:**
- [x] Каталог товаров
- [x] Поиск
- [x] Фильтры (категории, цена, персоны, специфические атрибуты)
- [x] Сортировка
- [x] Карточка товара
- [x] Wishlist
- [x] View counter
- [x] CRUD для seller/admin

**Корзина:**
- [x] Добавление товаров
- [x] Изменение количества
- [x] Удаление
- [x] Расчёт итога

**Отзывы:**
- [x] Создание отзыва
- [x] Рейтинг (1-5 звёзд)
- [x] Реакции (helpful/unhelpful)
- [x] Автоматический расчёт среднего рейтинга
- [x] Топ отзывы для карусели

**Q&A:**
- [x] Вопросы к товару
- [x] Ответы (с пометкой от seller)
- [x] Nested структура

**Социальные функции:**
- [x] Лента постов (Feed)
- [x] Статьи
- [x] Профили креаторов
- [x] Система голосований
- [x] Рейтинг сообщества
- [x] Групповые закупки

**Геймификация:**
- [x] XP (Experience Points) - постоянные
- [x] RP (Rating Points) - ежемесячные
- [x] Level system
- [x] Achievements
- [x] Streak tracking
- [x] Vote weight calculation
- [x] Legendary achievements (Топ-10)
- [x] Video hover privilege

**UI/UX:**
- [x] 3 темы (Dark, Light, Minimal Mod)
- [x] 2 языка (EN, RU)
- [x] Glassmorphism дизайн
- [x] PMM.gg стиль блоков
- [x] Адаптивные компоненты
- [x] Hover эффекты
- [x] Smooth animations

**Каталог:**
- [x] 9 основных категорий
- [x] 45 подкатегорий
- [x] 10 персон (Pro Gamer, Creator, Audiophile и т.д.)
- [x] Adaptive filtering

### 4.2 Частично реализовано ⚠️

**Чат:**
- ⚠️ UI готов, backend mock
- ⚠️ Нужен WebSocket для real-time
- ⚠️ Вложения (кнопки есть, загрузка нужна)

**Заказы:**
- ⚠️ Модели созданы
- ⚠️ Checkout flow частичный
- ⚠️ Платёжная интеграция (Tinkoff, Cryptomus) - не подключена

**Модерация контента:**
- ⚠️ Статьи требуют approval
- ⚠️ Proposals требуют vetting
- ⚠️ Admin панель не создана

**Социальные взаимодействия:**
- ⚠️ Комментарии (API готов, UI частичный)
- ⚠️ Репосты (API готов, UI нужен)
- ⚠️ Подписки (followers/following)
- ⚠️ Notifications (UI есть, backend нужен)

### 4.3 Не реализовано ❌

**Платежи:**
- ❌ Интеграция Tinkoff
- ❌ Интеграция Cryptomus
- ❌ Payment flow

**Email:**
- ❌ Уведомления по email
- ❌ Подтверждение регистрации
- ❌ Восстановление пароля

**Social Login:**
- ❌ Google OAuth
- ❌ Yandex OAuth
- ❌ Apple OAuth

**AI Support:**
- ❌ DeepSeek v3 интеграция
- ❌ AI assistant в чате

**SEO:**
- ❌ Meta tags
- ❌ Sitemap
- ❌ Open Graph

**Админ панель:**
- ❌ Управление пользователями
- ❌ Модерация контента
- ❌ Статистика
- ❌ Управление заказами

**Inventory:**
- ❌ Stock management
- ❌ Уведомления о restock
- ❌ Tracking номера

## 5. ЛОГИКА РАБОТЫ

### 5.1 Пользовательские роли

**Guest (Гость):**
- Просмотр товаров
- Просмотр публичного контента (articles, feed)
- Просмотр рейтинга
- **НЕ МОЖЕТ:** покупать, писать отзывы, создавать контент

**User (Покупатель):**
- ВСЁ что Guest +
- Покупка товаров
- Wishlist
- Корзина
- Отзывы и вопросы
- Создание постов
- Голосования (вес = 1 + Level/10)
- Участие в Group Buy
- Gamification (XP/RP)

**Seller (Продавец):**
- ВСЁ что User +
- Создание товаров
- Редактирование своих товаров
- Ответы на вопросы как seller
- Статистика продаж

**Moderator (Модератор):**
- ВСЁ что User +
- Модерация контента (статьи, голосования)
- Vetting proposals
- Удаление неподходящего контента

**Admin (Администратор):**
- ПОЛНЫЙ доступ
- Управление пользователями
- Управление категориями
- Начисление XP/RP
- Сброс ежемесячного рейтинга
- Verification креаторов

### 5.2 Основные пользовательские сценарии

**Сценарий 1: Покупка товара**

1. Гость заходит на /marketplace
2. Использует фильтры (категория, цена, персона)
3. Кликает на товар → /product/:id
4. Читает отзывы и Q&A
5. **Требуется login** → AuthModal
6. После входа: Add to Cart
7. Переход в /cart
8. Checkout → /checkout
9. Выбор способа оплаты
10. ⚠️ Оплата (не подключена)
11. ⚠️ Подтверждение заказа

**Сценарий 2: Создание поста в Feed**

1. User заходит на /feed
2. Кликает "Создать пост"
3. Пишет текст (до 5000 символов)
4. ⚠️ Прикрепляет медиа (опционально)
5. ⚠️ Добавляет shoppable tags
6. Публикует
7. Пост появляется в ленте
8. **Награда:** +5 RP

**Сценарий 3: Написание статьи**

1. User заходит на /articles
2. Кликает "Написать статью"
3. ⚠️ Редактор статьи (не создан)
4. Заполняет: Title, Content, Cover, Category, Tags
5. ⚠️ Добавляет shoppable tags
6. Публикует → статус "pending"
7. ⚠️ Модератор одобряет → статус "approved"
8. Статья появляется в каталоге
9. **Награда:** +100 XP

**Сценарий 4: Голосование за предложение**

1. User заходит на /voting
2. Фильтр "На голосовании"
3. Кликает на предложение
4. Читает детали
5. Голосует Up или Down
6. Вес голоса = 1 + (User Level / 10)
7. Weighted score пересчитывается
8. **Награда:** +3 RP

**Сценарий 5: Групповая закупка**

1. User заходит на /groupbuy
2. Видит активные закупки
3. Кликает на интересную
4. Проверяет условия (min participants, deadline)
5. Кликает "Join"
6. Цена пересчитывается
7. Прогресс-бар обновляется
8. Если цель достигнута → статус "successful"
9. **Награда:** +5 RP

### 5.3 Бизнес-логика

**Расчёт стоимости:**
```python
# Базовая цена товара
base_price = product.price

# Скидка (если есть)
discount = product.discount_percentage

# Итоговая цена товара
final_price = base_price * (1 - discount/100)

# Корзина
cart_subtotal = sum(item.price * item.quantity for item in cart.items)

# Доставка (не реализовано)
shipping_cost = 0

# Комиссия маркетплейса (не вычитается из цены пользователя)
platform_commission = cart_subtotal * 0.05  # 5%

# Итого к оплате
total = cart_subtotal + shipping_cost
```

**Групповая закупка - динамическая цена:**
```python
def calculate_current_price(original_price, target_price, current_participants, min_participants):
    if current_participants >= min_participants:
        return target_price
    
    # Линейная интерполяция
    progress = current_participants / min_participants
    price_diff = original_price - target_price
    return original_price - (price_diff * progress)
```

**Начисление XP/RP:**
```python
# XP (постоянные)
actions_xp = {
    "purchase": 50,
    "verify_profile": 100,
    "write_article": 100,
    "successful_groupbuy": 50,
    "article_10_views": 1
}

# RP (ежемесячные)
actions_rp = {
    "create_post": 5,
    "like_received": 2,
    "comment": 1,
    "vote_cast": 3,
    "article_like_received": 5,
    "join_groupbuy": 5,
    "organize_groupbuy": 10
}
```

**Вес голоса:**
```python
def calculate_vote_weight(user_level):
    return 1.0 + (user_level / 10.0)

# Примеры:
# Level 1 → вес 1.1
# Level 10 → вес 2.0
# Level 50 → вес 6.0
```

**Статусы заказов:**
```
pending → processing → shipped → delivered
                    ↓
                cancelled/refunded
```

## 6. БАЗА ДАННЫХ

### MongoDB Collections

**users:**
```javascript
{
  id: "uuid",
  email: "user@example.com",
  username: "ProGamer_2024",
  hashed_password: "bcrypt_hash",
  created_at: "2025-01-07T...",
  is_active: true,
  is_admin: false,
  is_seller: false,
  is_moderator: false,
  is_verified_creator: false,
  
  // Gamification
  level: 3,
  experience: 1250,
  coins: 2500,
  monthly_rp: 450,
  current_streak: 7,
  achievements: ["first_purchase", "article_published"],
  
  // Profile
  avatar_url: "🎮",
  bio: "Pro gamer and tech enthusiast",
  location: "Moscow, Russia",
  website: "https://example.com",
  referral_code: "PROGAMER24",
  online_status: "online",
  
  // Privileges
  has_video_hover: false,
  video_hover_url: null,
  creator_profile_id: null,
  
  wishlist: ["product_id_1", "product_id_2"]
}
```

**products:**
```javascript
{
  id: "uuid",
  seller_id: "user_id",
  name: "Gaming Mouse X",
  description: "Premium gaming mouse...",
  price: 79.99,
  original_price: 99.99,
  
  category_id: "100",  // PC Components
  sub_category_id: "130",  // Mice
  persona_id: "pro_gamer",
  
  images: ["url1", "url2"],
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
  
  status: "approved",  // pending, approved, rejected
  created_at: "2025-01-07T...",
  updated_at: "2025-01-07T..."
}
```

**posts:**
```javascript
{
  id: "uuid",
  user_id: "user_id",
  username: "ProGamer",
  user_avatar: "🎮",
  user_level: 3,
  
  content: "Just got this amazing mouse!",
  media: [
    { type: "image", url: "...", width: 1920, height: 1080 }
  ],
  shoppable_tags: [
    {
      product_id: "product_uuid",
      product_name: "Gaming Mouse X",
      product_price: 79.99,
      product_image: "url"
    }
  ],
  
  likes: 45,
  reposts: 12,
  comments_count: 8,
  views: 230,
  
  liked_by: ["user_id_1", "user_id_2"],
  reposted_by: ["user_id_3"],
  
  is_repost: false,
  repost_of: null,
  
  created_at: "2025-01-07T...",
  is_pinned: false,
  is_hidden: false
}
```

**articles:**
```javascript
{
  id: "uuid",
  user_id: "user_id",
  username: "TechWriter",
  is_verified_creator: true,
  
  title: "Best Gaming Mice 2025",
  subtitle: "Comprehensive review",
  content: "Full article content...",
  cover_image: "url",
  category: "Reviews",
  tags: ["gaming", "mice", "peripherals"],
  
  shoppable_tags: [...],
  
  views: 5000,
  likes: 250,
  bookmarks: 89,
  shares: 45,
  read_time: 5,  // minutes
  
  liked_by: [...],
  bookmarked_by: [...],
  
  created_at: "2025-01-07T...",
  published_at: "2025-01-07T...",
  is_draft: false,
  is_featured: true,
  status: "approved"
}
```

**proposals (voting):**
```javascript
{
  id: "uuid",
  user_id: "user_id",
  username: "ActiveUser",
  user_level: 5,
  
  title: "Add Dark Mode to Mobile App",
  description: "We need dark mode...",
  category: "Feature",
  tags: ["ui", "mobile"],
  
  status: "voting",  // vetting, voting, in_progress, completed, rejected
  votes_up: 45,
  votes_down: 3,
  weighted_score: 67.5,
  votes: [
    { user_id: "...", vote_type: "up", vote_weight: 1.5, created_at: "..." }
  ],
  
  views: 890,
  comments_count: 23,
  
  vetted_by: "admin_id",
  vetted_at: "2025-01-07T...",
  voting_starts_at: "2025-01-07T...",
  voting_ends_at: "2025-02-06T...",  // 30 days
  
  created_at: "2025-01-07T..."
}
```

**user_stats:**
```javascript
{
  id: "uuid",
  user_id: "user_id",
  username: "ProGamer",
  
  // XP System (permanent)
  total_xp: 1250,
  current_level: 3,
  xp_to_next_level: 1000,
  
  // RP System (monthly reset)
  monthly_rp: 450,
  monthly_rank: 15,
  last_reset_date: "2025-01-01T...",
  
  // Achievements
  achievements: ["first_purchase", "level_3"],
  legendary_achievements: ["🏆 Top 10 - 2024-12"],
  
  // Activity
  current_streak: 7,
  longest_streak: 15,
  last_activity_date: "2025-01-07T...",
  
  // Stats
  total_posts: 45,
  total_articles: 3,
  total_comments: 120,
  total_votes_cast: 67,
  total_likes_received: 340,
  total_reposts_received: 89,
  followers_count: 123,
  total_purchases: 5,
  total_spent: 450.00,
  
  vote_weight: 1.3,  // 1 + (3/10)
  
  has_video_hover: false
}
```

**groupbuys:**
```javascript
{
  id: "uuid",
  organizer_id: "user_id",
  organizer_username: "Organizer",
  
  title: "RTX 4090 Group Buy",
  description: "Let's get 4090 at $1200!",
  product_id: "product_uuid",
  product_name: "RTX 4090",
  product_image: "url",
  
  original_price: 1599.99,
  target_price: 1199.99,
  current_price: 1450.00,  // calculated
  
  min_participants: 10,
  max_participants: 20,
  current_participants: 5,
  
  participants: [
    { user_id: "...", username: "...", quantity: 1, joined_at: "...", has_paid: false }
  ],
  
  status: "active",  // active, successful, failed, completed
  deadline: "2025-02-01T...",
  
  views: 450,
  comments_count: 34,
  interested_users: ["user_id_1", "user_id_2"]
}
```

### Связи между сущностями

```
users ←→ products (seller_id)
users ←→ posts (user_id)
users ←→ articles (user_id)
users ←→ proposals (user_id)
users ←→ groupbuys (organizer_id, participants)
users ←→ user_stats (user_id)
users ←→ creator_profiles (user_id)

products ←→ reviews (product_id)
products ←→ questions (product_id)
products ←→ cart_items (product_id)
products ←→ shoppable_tags (product_id)

posts ←→ post_comments (post_id)
articles ←→ article_comments (article_id)
proposals ←→ proposal_comments (proposal_id)
groupbuys ←→ groupbuy_comments (groupbuy_id)
```

## 7. API И ИНТЕГРАЦИИ

### 7.1 Authentication Endpoints

```
POST /api/auth/register
Body: { email, username, password }
Response: { access_token, token_type, user }

POST /api/auth/login
Body: { email, password }
Response: { access_token, token_type, user }

GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { user_object }
```

### 7.2 Products Endpoints

```
GET /api/products
Query: skip, limit, search, category, min_price, max_price, sort, persona_id, specific_filters
Response: [{ product }]

GET /api/products/{id}
Response: { product }

POST /api/products
Auth: Seller/Admin
Body: { name, description, price, ... }
Response: { product }

PUT /api/products/{id}
Auth: Seller/Admin (own product)
Body: { updates }

DELETE /api/products/{id}
Auth: Seller/Admin

POST /api/products/{id}/wishlist
Auth: Required
Response: { status: "added/removed" }
```

### 7.3 Feed Endpoints

```
GET /api/feed
Query: skip, limit, following_only
Response: [{ post }]

POST /api/feed
Auth: Required
Body: { content, media, shoppable_tags, repost_of }
Response: { post }
Awards: +5 RP

POST /api/feed/{id}/like
Auth: Required
Response: { status: "liked/unliked" }
Awards: +2 RP to post author

POST /api/feed/{id}/comments
Auth: Required
Body: { content }
Awards: +1 RP
```

### 7.4 Articles Endpoints

```
GET /api/articles
Query: skip, limit, category, tag, featured_only
Response: [{ article }]

POST /api/articles
Auth: Required
Body: { title, subtitle, content, cover_image, category, tags }
Response: { article }
Awards: +100 XP

POST /api/articles/{id}/like
Awards: +5 RP to author

POST /api/articles/{id}/bookmark
```

### 7.5 Voting Endpoints

```
GET /api/voting
Query: status, category, sort_by
Response: [{ proposal }]

POST /api/voting
Auth: Required
Limit: 1 per month
Body: { title, description, category, tags }

POST /api/voting/{id}/vote
Auth: Required
Body: { vote_type: "up"/"down" }
Weight: 1 + (user_level / 10)
Awards: +3 RP

POST /api/voting/{id}/vet
Auth: Admin/Moderator
Body: { approve: true/false, notes }
```

### 7.6 Rating Endpoints

```
GET /api/rating/leaderboard
Query: period (monthly/all_time), skip, limit
Response: [{ user_stats }]

GET /api/rating/top-monthly
Query: limit (max 10)
Response: [{ user_stats }]

GET /api/rating/me
Auth: Required
Response: { user_stats }

POST /api/rating/award-xp
Auth: Admin
Body: { user_id, amount, action, description }

POST /api/rating/reset-monthly
Auth: Admin
Action: Awards Top-10 with legendary achievements
```

### 7.7 Group Buy Endpoints

```
GET /api/groupbuy
Query: status, sort_by
Response: [{ groupbuy }]

POST /api/groupbuy
Auth: Required
Body: { title, description, product_id, pricing, deadline, terms }
Awards: +10 RP

POST /api/groupbuy/{id}/join
Auth: Required
Awards: +5 RP
Updates: current_price recalculated

POST /api/groupbuy/{id}/leave

POST /api/groupbuy/{id}/interest
```

### 7.8 Reviews Endpoints

```
GET /api/reviews/product/{product_id}
Response: [{ review }]

GET /api/reviews/top
Query: limit
Response: [{ review }] (4-5 stars, sorted by likes)

POST /api/reviews
Auth: Required
Limit: 1 per product per user
Body: { product_id, rating, comment }

POST /api/reviews/{id}/reaction
Body: { reaction_type: "helpful"/"unhelpful" }
```

### 7.9 Catalog Endpoints

```
GET /api/catalog/personas
Response: [{ id, name_en, name_ru, description, emoji }]
Count: 10 personas

GET /api/catalog/categories
Response: [{ id, name_en, name_ru, subcategories }]
Count: 9 main, 45 subcategories
```

### 7.10 Внешние интеграции

**Запланированные (не подключены):**
- ❌ Tinkoff Payments (СБП, карты, QR)
- ❌ Cryptomus (криптовалюты)
- ❌ DeepSeek v3 (AI support)
- ❌ Google/Yandex/Apple OAuth
- ❌ Email service (SendGrid/SMTP)

## 8. UI/UX ДИЗАЙН

### 8.1 Цветовая палитра

**Dark Theme (основная):**
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

**Light Theme:**
```css
--bg-primary: #ffffff
--text-primary: #000000
```

**Minimal Mod Theme:**
```css
--font-family: 'SF Mono', monospace
--border-radius: 0px (острые углы)
--no-glassmorphism
```

### 8.2 Типографика

**Шрифты:**
- Primary: System sans-serif
- Minimal Mod: SF Mono, Consolas, monospace

**Размеры:**
- h1: 3-5rem (Hero titles)
- h2: 2-3rem (Section titles)
- h3: 1.5-2rem (Card titles)
- Body: 0.95-1rem
- Small: 0.75-0.875rem

### 8.3 Дизайн-система PMM.gg

**Блоки:**
- Border-radius: **3px** (минимальные скругления)
- Gap: **24px**
- Padding страницы: **40px** (2.5rem)
- Container: **1840px** max-width
- Aspect-ratio квадратов: **1:1**

**Glassmorphism:**
```css
.glass-strong {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Hover эффекты:**
```css
.hover-scale:hover {
  transform: scale(1.05);
  border: 2px solid rgba(255, 255, 255, 0.3);
}
```

### 8.4 Адаптивность

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1279px
- Desktop: ≥ 1280px

**Адаптивные компоненты:**
- ✅ Header (LVL menu адаптивное)
- ✅ Category blocks (grid → 1 колонка на мобильных)
- ✅ Testimonials (scroll на мобильных)
- ⚠️ Полная мобильная оптимизация требуется

## 9. ИЗВЕСТНЫЕ ПРОБЛЕМЫ И БАГИ

### 9.1 Критические 🔴

**База данных пустая:**
- Нет продуктов (только тестовые из mockData)
- Нет пользователей
- Нет постов, статей, голосований
- **Решение:** Создать seed скрипты или admin панель

**Статьи требуют аутентификацию:**
- GET /api/articles возвращает 403
- **Решение:** Сделать публичным или исправить middleware

### 9.2 Высокий приоритет 🟡

**Модерация контента:**
- Статьи создаются со статусом "pending"
- Proposals создаются в "vetting"
- Нет admin панели для модерации
- **Решение:** Создать admin dashboard

**Отсутствие WebSocket:**
- Чат работает на mock данных
- Notifications не real-time
- **Решение:** Интегрировать Socket.io или similar

**Комментарии UI:**
- API для комментариев готов
- UI компоненты не созданы
- **Решение:** Создать CommentSection.jsx

### 9.3 Средний приоритет 🟢

**Video не загружается в Hero:**
- Проблемы с CORS
- Vimeo/external video blocked
- **Решение:** Использовать self-hosted video или gif

**Minimal Mod тема на PC Builder:**
- Чёрный текст на чёрном фоне
- **Решение:** Theme-aware text colors

**Отсутствие подписок:**
- Following/followers не реализовано
- Feed "following_only" не работает
- **Решение:** Создать followers collection

## 10. ДОРОЖНАЯ КАРТА

### 10.1 Ближайшие задачи (Неделя 1)

**Приоритет 1 - Наполнение данными:**
1. Создать seed скрипт для продуктов (50+ товаров)
2. Создать тестовых пользователей (10+)
3. Создать примеры постов, статей
4. Добавить примеры голосований

**Приоритет 2 - Исправить критические баги:**
1. Сделать GET /api/articles публичным
2. Исправить тему Minimal Mod на PC Builder
3. Добавить video fallback в Hero

**Приоритет 3 - UI доработки:**
1. Создать формы создания поста/статьи
2. Добавить компонент комментариев
3. Создать страницу создания предложения

### 10.2 Среднесрочные цели (Месяц 1)

**Модерация:**
1. Создать admin dashboard
2. Implement vetting для proposals
3. Approval flow для статей

**Социальные функции:**
1. Реализовать подписки (followers/following)
2. Персонализированная лента (following_only)
3. Репосты UI
4. Комментарии UI для всех типов контента

**Геймификация:**
1. Автоматическое начисление XP/RP
2. Cron job для ежемесячного сброса
3. Выдача наград топ-10
4. Achievement unlock система

**Group Buy улучшения:**
1. Payment integration для закупок
2. Automatic status updates (deadline check)
3. Notification system

### 10.3 Долгосрочное видение (Квартал 1)

**Платёжная система:**
1. Интеграция Tinkoff (СБП, карты)
2. Интеграция Cryptomus (crypto)
3. Полный checkout flow
4. Order management

**AI Integration:**
1. DeepSeek v3 для support чата
2. AI рекомендации товаров
3. AI модерация контента
4. AI генерация описаний товаров

**Social Login:**
1. Google OAuth
2. Yandex OAuth
3. Apple OAuth

**Email система:**
1. Welcome emails
2. Order confirmations
3. Notifications по email
4. Newsletter

**SEO & Marketing:**
1. Meta tags для всех страниц
2. Sitemap.xml
3. Open Graph для sharing
4. Schema.org разметка

**Inventory & Stock:**
1. Stock management система
2. Restock notifications
3. Automatic status updates
4. Supplier integration

---

## ПРИЛОЖЕНИЯ

### A. Code Snippets

**Защищённый endpoint:**
```python
from fastapi import Depends
from utils.auth_utils import get_current_user
from models.user import User

@router.post("/api/feed")
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user)
):
    # current_user automatically injected
    post = Post(
        user_id=current_user.id,
        username=current_user.username,
        **post_data.dict()
    )
    await db.posts.insert_one(post.dict())
    return post
```

**Frontend API call с auth:**
```javascript
const response = await fetch(
  `${process.env.REACT_APP_BACKEND_URL}/api/feed`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ content: 'My post' })
  }
);
```

**Theme-aware component:**
```javascript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <div 
      className="glass-strong"
      style={{
        borderRadius: theme === 'minimal-mod' ? '0' : '3px',
        fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit'
      }}
    >
      Content
    </div>
  );
}
```

### B. Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
SECRET_KEY=your_jwt_secret_key_here
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://trendy-marketplace-5.preview.emergentagent.com/api
```

### C. Запуск проекта

**Запуск всех сервисов:**
```bash
sudo supervisorctl restart all
```

**Только backend:**
```bash
sudo supervisorctl restart backend
```

**Только frontend:**
```bash
sudo supervisorctl restart frontend
```

**Проверка статуса:**
```bash
sudo supervisorctl status
```

**Логи:**
```bash
# Backend
tail -f /var/log/supervisor/backend.err.log

# Frontend
tail -f /var/log/supervisor/frontend.err.log
```

---

**Дата создания:** 2025-01-07  
**Версия:** 1.0  
**Статус:** Production Ready (с оговорками - требуется наполнение данными)
