# 💬 CHAT SYSTEM ARCHITECTURE - Полный контекст

> **Документ для разработчика**
> Полное описание текущей чат-системы для оптимизации и рефакторинга

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор системы](#1-обзор-системы)
2. [Компоненты Frontend](#2-компоненты-frontend)
3. [Backend API](#3-backend-api)
4. [Модели данных](#4-модели-данных)
5. [Текущий функционал](#5-текущий-функционал)
6. [Проблемы и ограничения](#6-проблемы-и-ограничения)
7. [Точки интеграции](#7-точки-интеграции)
8. [Рекомендации по оптимизации](#8-рекомендации-по-оптимизации)

---

## 1. ОБЗОР СИСТЕМЫ

### 1.1 Текущая архитектура

Чат-система состоит из **3 параллельных реализаций**, которые частично дублируют друг друга:

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FloatingChatWidget.jsx    │  ChatFullPage.jsx             │ │
│  │  (Виджет в углу экрана)    │  (Полная страница /chat)      │ │
│  │  - Список бесед            │  - Полноценный чат            │ │
│  │  - Mock данные             │  - Mock данные                │ │
│  │  - Навигация к /chat       │  - Имитация ответа бота       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ChatWindow.jsx            │  AIFloatingButton.jsx         │ │
│  │  (WebSocket чат)           │  (Кнопка для AI)              │ │
│  │  - Реальный WebSocket      │  - Просто кнопка              │ │
│  │  - Support Chat API        │  - Нет логики                 │ │
│  │  - История сессий          │                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND                                     │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐  │
│  │  support_chat_routes.py  │  │  ai_routes.py               │  │
│  │  (WebSocket)             │  │  (REST API)                 │  │
│  │  - GPT-4o интеграция     │  │  - Multi-Agent система      │  │
│  │  - История сессий        │  │  - Orchestrator             │  │
│  │  - Manager request       │  │  - Требует API ключ         │  │
│  └──────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Проблема: Дублирование

| Компонент | Использует API | Данные | Статус |
|-----------|----------------|--------|--------|
| FloatingChatWidget | ❌ Нет | Mock | Визуальная заглушка |
| ChatFullPage | ❌ Нет | Mock | Визуальная заглушка |
| ChatWindow | ✅ WebSocket | Реальные | Работает |
| AIFloatingButton | ❌ Нет | - | Только UI |
| AI Routes | ✅ REST | - | Требует ключ |
| Support Chat Routes | ✅ WebSocket | Реальные | Работает |

---

## 2. КОМПОНЕНТЫ FRONTEND

### 2.1 FloatingChatWidget.jsx
**Путь:** `/app/frontend/src/components/FloatingChatWidget.jsx`
**Строк кода:** 421

**Назначение:** Плавающий виджет в правом нижнем углу с превью бесед

**Текущее состояние:**
- ❌ Использует **mock данные** (conversations hardcoded)
- ✅ Поддержка тем (dark/light/minimal-mod)
- ✅ Локализация (EN/RU)
- ✅ Анимации

**Структура:**
```jsx
FloatingChatWidget
├── Collapsed Bar (свёрнутая кнопка)
│   ├── Icon (MessageCircle)
│   ├── Label ("Сообщения")
│   └── Unread Badge (mock: 2)
│
└── Expanded Mini Chat (развёрнутое окно 360x480px)
    ├── Header
    │   ├── Title ("Сообщения")
    │   ├── Unread Count Badge
    │   └── New Message Button → navigate('/chat?new=true')
    │
    ├── Conversations List (mock)
    │   ├── Support AI 🤖
    │   ├── GeekStore Seller 🏪
    │   └── Support Team 💬
    │
    └── Footer
        └── "Chat (Beta)" Button → navigate('/chat')
```

**Mock данные (строки 17-42):**
```javascript
const [conversations] = useState([
  {
    id: 1,
    name: 'Support AI',
    lastMessage: 'Здравствуйте! Чем могу помочь?',
    time: '2m',
    unread: 1,
    avatar: '🤖',
  },
  // ... ещё 2 беседы
]);
```

**Навигация:**
- Клик на беседу → `/chat/{conversation.id}`
- Кнопка "Chat (Beta)" → `/chat`
- Кнопка "New Message" → `/chat?new=true`

---

### 2.2 ChatFullPage.jsx
**Путь:** `/app/frontend/src/components/ChatFullPage.jsx`
**Строк кода:** 541

**Назначение:** Полноэкранная страница чата (route: `/chat` и `/chat/:conversationId`)

**Текущее состояние:**
- ❌ Использует **mock данные** (messages hardcoded)
- ❌ **Имитация ответа бота** (setTimeout + hardcoded response)
- ✅ Поддержка тем
- ✅ Локализация
- ✅ Typing indicator
- ✅ Auto-scroll

**Структура:**
```jsx
ChatFullPage
├── Header
│   ├── Back Button → navigate(-1)
│   ├── Avatar (🤖)
│   ├── Name ("Support AI")
│   ├── Status ("Always online")
│   └── Settings Button (нет функционала)
│
├── Messages Area
│   ├── Message Bubbles
│   │   ├── Bot messages (слева)
│   │   └── User messages (справа)
│   └── Typing Indicator (3 dots animation)
│
└── Input Area
    ├── Attachments
    │   ├── Paperclip Button (нет функционала)
    │   └── Image Button (нет функционала)
    ├── Textarea
    └── Send Button
```

**Mock сообщения (строки 28-56):**
```javascript
const [messages, setMessages] = useState([
  { id: 1, sender: 'bot', text: 'Здравствуйте! Я AI-помощник...', timestamp: ... },
  { id: 2, sender: 'user', text: 'Расскажите о топовых видеокартах', timestamp: ... },
  { id: 3, sender: 'bot', text: 'Конечно! У нас есть RTX 4090...', timestamp: ... },
]);
```

**Имитация ответа (строки 82-95):**
```javascript
// Simulate bot response
setTimeout(() => {
  const botResponse = {
    id: messages.length + 2,
    sender: 'bot',
    text: 'Спасибо за ваш вопрос! Я обрабатываю запрос...',
    timestamp: new Date().toISOString(),
  };
  setMessages((prev) => [...prev, botResponse]);
  setIsTyping(false);
}, 1500);
```

---

### 2.3 ChatWindow.jsx
**Путь:** `/app/frontend/src/components/ChatWindow.jsx`
**Строк кода:** 737

**Назначение:** Окно Support Chat с реальным WebSocket соединением

**Текущее состояние:**
- ✅ **Реальный WebSocket** (`/api/ws/support-chat/{session_id}`)
- ✅ AI ответы через GPT-4o
- ✅ История сессий
- ✅ Request Manager функционал
- ✅ Поддержка тем
- ❌ **НЕ используется в UI** (импортирован, но не рендерится)

**Структура:**
```jsx
ChatWindow
├── Header
│   ├── Online Indicator (зелёная точка)
│   ├── Title ("Support Chat")
│   ├── Status ("AI Assistant • Online")
│   ├── History Button (Folder icon)
│   └── Close Button
│
├── Chat History Panel (overlay)
│   ├── Sessions List
│   │   ├── Session Title
│   │   ├── Last Message Preview
│   │   ├── Messages Count
│   │   └── Delete Button
│   └── Close Button
│
├── Messages Area
│   ├── Message Bubbles
│   │   ├── User messages (справа, purple)
│   │   └── Bot messages (слева, gray)
│   └── Typing Indicator
│
└── Input Area
    ├── Request Manager Button (условный)
    ├── Text Input
    └── Send Button
```

**WebSocket логика (строки 65-129):**
```javascript
// Connect to WebSocket
const ws = new WebSocket(`${WS_URL}/api/ws/support-chat/${newSessionId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'system') { /* системное сообщение */ }
  else if (data.type === 'user_message') { /* сообщение пользователя */ }
  else if (data.type === 'bot_message') { /* ответ бота */ }
};
```

**Функции:**
- `sendMessage()` — отправка через WebSocket
- `loadChatSessions()` — загрузка истории
- `deleteSession()` — удаление сессии
- `requestManager()` — запрос живого менеджера

---

### 2.4 AIFloatingButton.jsx
**Путь:** `/app/frontend/src/components/AIFloatingButton.jsx`
**Строк кода:** 75

**Назначение:** Плавающая кнопка для вызова AI чата

**Текущее состояние:**
- ❌ **Только UI** — не подключена к логике
- ✅ Hover эффект с tooltip
- ✅ Pulse анимация

**Props:**
```jsx
AIFloatingButton({ onClick }) // onClick не реализован
```

**Внешний вид:**
- Круглая кнопка 64x64px
- Glassmorphism стиль
- Иконка MessageCircle
- Tooltip: "Спроси меня о чём угодно"

---

## 3. BACKEND API

### 3.1 Support Chat Routes
**Путь:** `/app/backend/routes/support_chat_routes.py`

**Endpoints:**

| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| WS | `/api/ws/support-chat/{session_id}` | WebSocket чат | ❌ |
| POST | `/api/support-chat/sessions` | Создать сессию | Optional |
| GET | `/api/support-chat/sessions` | Список сессий | Optional |
| GET | `/api/support-chat/sessions/{id}` | Одна сессия | ❌ |
| DELETE | `/api/support-chat/sessions/{id}` | Удалить сессию | Optional |
| PUT | `/api/support-chat/sessions/{id}/mark-read` | Отметить прочитанным | ❌ |
| GET | `/api/support-chat/check-manager-access` | Проверка доступа | Optional |
| POST | `/api/support-chat/request-manager` | Запрос менеджера | Optional |

**AI Integration:**
```python
# Используется GPT-4o через emergentintegrations
from emergentintegrations.llm.chat import LlmChat, UserMessage

chat = LlmChat(
    api_key=os.getenv("EMERGENT_LLM_KEY"),
    session_id=session_id,
    system_message=system_message
).with_model("openai", "gpt-4o")

response = await chat.send_message(UserMessage(text=user_message))
```

**WebSocket Protocol:**
```javascript
// Client → Server
{
  "message": "user message text",
  "user_id": "optional_user_id",
  "language": "ru" // или "en"
}

// Server → Client (types)
{ "type": "system", "message": "...", "timestamp": "..." }
{ "type": "user_message", "message": {...}, "timestamp": "..." }
{ "type": "bot_message", "message": {...}, "timestamp": "..." }
```

---

### 3.2 AI Routes (Multi-Agent)
**Путь:** `/app/backend/routes/ai_routes.py`

**Endpoints:**

| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| POST | `/api/ai/chat` | AI чат | ✅ Required |
| POST | `/api/ai/chat/guest` | AI чат для гостей | ❌ |
| POST | `/api/ai/moderate` | Модерация | ✅ Admin/Mod |
| GET | `/api/ai/agents` | Список агентов | ❌ |
| GET | `/api/ai/status` | Статус системы | ❌ |

**Агенты:**
- `ChatAgent` — общие вопросы
- `PCBuilderAgent` — сборка ПК
- `RecommenderAgent` — рекомендации
- `ModeratorAgent` — модерация

**⚠️ ТРЕБУЕТ:** `DEEPSEEK_API_KEY` в `.env` (не настроен)

---

## 4. МОДЕЛИ ДАННЫХ

### 4.1 Support Chat Models
**Путь:** `/app/backend/models/support_chat.py`

```python
class SupportMessage(BaseModel):
    id: str                    # UUID
    sender: str                # "user" или "bot"
    text: str                  # Текст сообщения
    timestamp: datetime
    read: bool = False

class SupportChatSession(BaseModel):
    id: str                    # UUID
    user_id: Optional[str]     # None для анонимных
    session_token: str         # Для tracking анонимных
    title: str = "New Chat"
    messages: List[SupportMessage] = []
    created_at: datetime
    updated_at: datetime
    unread_count: int = 0
    is_active: bool = True

class ManagerRequest(BaseModel):
    id: str
    session_id: str
    user_id: Optional[str]
    language: str = "en"
    created_at: datetime
    status: str = "pending"    # pending, assigned, completed
    assigned_to: Optional[str]
```

### 4.2 Chat Models (Product/Direct)
**Путь:** `/app/backend/models/chat.py`

```python
class Message(BaseModel):
    id: str
    user_id: str
    username: str              # Cached
    user_avatar: Optional[str]
    content: str
    message_type: str = "text" # text, image, system
    created_at: datetime
    is_read: bool = False

class ChatRoom(BaseModel):
    id: str
    product_id: str
    room_type: str = "product" # product, direct
    participants: List[str]    # User IDs
    messages: List[Message]
    last_message_at: datetime
    created_at: datetime
    is_active: bool = True
```

---

## 5. ТЕКУЩИЙ ФУНКЦИОНАЛ

### 5.1 Что работает

| Функция | Компонент | Статус |
|---------|-----------|--------|
| WebSocket чат с AI | ChatWindow + support_chat_routes | ✅ |
| GPT-4o интеграция | support_chat_routes | ✅ |
| История сессий | ChatWindow + DB | ✅ |
| Request Manager | ChatWindow + support_chat_routes | ✅ |
| Темы оформления | Все компоненты | ✅ |
| EN/RU локализация | Все компоненты | ✅ |
| Typing indicator | ChatFullPage, ChatWindow | ✅ |

### 5.2 Что НЕ работает / Mock

| Функция | Компонент | Проблема |
|---------|-----------|----------|
| Список бесед | FloatingChatWidget | Mock данные |
| Полноэкранный чат | ChatFullPage | Mock, нет API |
| AI кнопка | AIFloatingButton | Нет onClick |
| Вложения (files) | ChatFullPage | Нет backend |
| Multi-Agent AI | ai_routes | Нет API ключа |
| Product Chat | chat.py models | Нет UI |
| Direct Messages | chat.py models | Нет UI |

---

## 6. ПРОБЛЕМЫ И ОГРАНИЧЕНИЯ

### 6.1 Архитектурные проблемы

1. **Дублирование компонентов**
   - FloatingChatWidget и ChatFullPage — полностью mock
   - ChatWindow — работает, но не используется в основном UI

2. **Несвязанные API**
   - `support_chat_routes` использует GPT-4o
   - `ai_routes` использует Multi-Agent (Deepseek)
   - Нет единой точки входа

3. **Inconsistent State Management**
   - ChatWindow хранит sessionId в localStorage
   - FloatingChatWidget хранит состояние в useState
   - Нет глобального состояния чата

### 6.2 UX проблемы

1. **Confusing Entry Points**
   - FloatingChatWidget (внизу справа) — ведёт к mock
   - AIFloatingButton — ничего не делает
   - "/chat" route — mock страница

2. **No Real-time Sync**
   - Виджет не знает о реальных сообщениях
   - Unread count — hardcoded

3. **Missing Features**
   - Нет загрузки файлов
   - Нет поиска по истории
   - Нет уведомлений

### 6.3 Технический долг

1. **Большие файлы**
   - ChatWindow.jsx: 737 строк
   - ChatFullPage.jsx: 541 строка
   - FloatingChatWidget.jsx: 421 строка

2. **Inline styles**
   - Все стили в JSX
   - Сложно поддерживать

3. **Отсутствие типизации**
   - Нет TypeScript
   - Нет PropTypes

---

## 7. ТОЧКИ ИНТЕГРАЦИИ

### 7.1 Где рендерятся компоненты

```jsx
// App.js
<FloatingChatWidget />  // Строка 55 — всегда видим

// Routes
<Route path="/chat" element={<ChatFullPage />} />
<Route path="/chat/:conversationId" element={<ChatFullPage />} />
```

### 7.2 Переводы
**Путь:** `/app/frontend/src/translations.js`

```javascript
chat: {
  title: 'Support Chat / Чат поддержки',
  aiAssistant: 'AI Assistant / AI ассистент',
  online: 'Online / Онлайн',
  chatHistory: 'Chat History / История чатов',
  noPreviousChats: 'No previous chats / Нет предыдущих чатов',
  noMessages: 'No messages / Нет сообщений',
  messages: 'messages / сообщений',
  typePlaceholder: 'Type your message... / Введите сообщение...',
  requestManager: 'Contact Personal Manager / Связаться с личным менеджером',
  managerRequested: '...',
  managerRequestError: '...',
}
```

### 7.3 Стили
**Путь:** `/app/frontend/src/styles/chatWidget.css`

Анимации:
- `retro-flicker-in` — TV flicker эффект
- `vertical-stutter` — глитч эффект
- `slideUp` — появление окна
- `fadeIn` — появление сообщений
- `pulse-badge` — пульсация badge
- `pulse-dot` — пульсация online dot
- `typing-bounce` — анимация typing indicator

---

## 8. РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ

### 8.1 Архитектурные изменения

#### Option A: Унификация на WebSocket
```
FloatingChatWidget ──┐
                     ├──► Unified ChatService ──► WebSocket API
ChatFullPage ────────┤                              │
                     │                              ▼
AIFloatingButton ────┘                      support_chat_routes
```

#### Option B: Унификация на Multi-Agent
```
FloatingChatWidget ──┐
                     ├──► ChatContext ──► REST + WS Hybrid
ChatFullPage ────────┤         │                │
                     │         ▼                ▼
AIFloatingButton ────┘    ai_routes      support_chat_routes
                          (Multi-Agent)     (Sessions)
```

### 8.2 Рекомендуемая структура компонентов

```
/components/chat/
├── ChatProvider.jsx          # Context с глобальным состоянием
├── ChatWidget/
│   ├── index.jsx            # Плавающий виджет
│   ├── ConversationList.jsx # Список бесед
│   └── QuickReply.jsx       # Быстрый ответ
├── ChatRoom/
│   ├── index.jsx            # Полная страница чата
│   ├── MessageList.jsx      # Список сообщений
│   ├── MessageInput.jsx     # Поле ввода
│   ├── MessageBubble.jsx    # Пузырь сообщения
│   └── AttachmentPicker.jsx # Вложения
├── hooks/
│   ├── useChat.js           # Логика чата
│   └── useWebSocket.js      # WebSocket hook
└── services/
    └── chatService.js       # API calls
```

### 8.3 Приоритеты рефакторинга

1. **🔴 Критично:** Подключить FloatingChatWidget к реальному API
2. **🔴 Критично:** Заменить mock в ChatFullPage на WebSocket
3. **🟡 Важно:** Создать ChatContext для глобального состояния
4. **🟡 Важно:** Унифицировать AI endpoint (GPT-4o или Multi-Agent)
5. **🟢 Желательно:** Вынести стили в CSS modules
6. **🟢 Желательно:** Добавить TypeScript типы

### 8.4 Quick Wins

1. **Связать FloatingChatWidget с ChatWindow:**
   ```jsx
   // Вместо navigate('/chat')
   const [showChatWindow, setShowChatWindow] = useState(false);
   {showChatWindow && <ChatWindow onClose={() => setShowChatWindow(false)} />}
   ```

2. **Загрузить реальные сессии в FloatingChatWidget:**
   ```jsx
   useEffect(() => {
     fetch(`${API_URL}/api/support-chat/sessions`)
       .then(res => res.json())
       .then(setConversations);
   }, []);
   ```

3. **Подключить ChatFullPage к WebSocket:**
   - Использовать логику из ChatWindow
   - Или импортировать ChatWindow как компонент

---

## 📎 ФАЙЛЫ ДЛЯ РЕДАКТИРОВАНИЯ

| Файл | Строк | Приоритет | Действие |
|------|-------|-----------|----------|
| `/frontend/src/components/FloatingChatWidget.jsx` | 421 | 🔴 | Подключить к API |
| `/frontend/src/components/ChatFullPage.jsx` | 541 | 🔴 | Подключить к WebSocket |
| `/frontend/src/components/ChatWindow.jsx` | 737 | 🟡 | Рефакторинг |
| `/frontend/src/components/AIFloatingButton.jsx` | 75 | 🟢 | Добавить onClick |
| `/backend/routes/support_chat_routes.py` | 430 | 🟡 | Оптимизация |
| `/backend/routes/ai_routes.py` | 193 | 🟢 | Интеграция |
| `/frontend/src/styles/chatWidget.css` | 247 | 🟢 | Расширить |
| `/frontend/src/translations.js` | 455 | 🟢 | Новые ключи |

---

**Дата создания:** Декабрь 2025
**Версия:** 1.0
