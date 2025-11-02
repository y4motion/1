# Phase 2: Full-Stack Integration - Technical Contracts

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 (existing)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Emergent Social Login (Google, Yandex, Apple) + JWT
- **Real-time**: WebSocket for notifications
- **Email**: SMTP service for transactional emails

---

## 1. Authentication System

### Social Login Flow
```
User clicks "Login with Google/Yandex/Apple"
  → Emergent OAuth redirect
  → Backend receives token
  → Create/update user in MongoDB
  → Return JWT token
  → Frontend stores in localStorage
  → User redirected to homepage with LVL menu active
```

### User Profile Expansion (at checkout)
- Initial: `{ id, email, name, avatar, provider }`
- Expanded: `{ ...initial, phone, addresses[], preferences }`

### API Endpoints
```
POST /api/auth/social-login
  Body: { provider, token }
  Response: { jwt, user, isNewUser }

POST /api/auth/logout
  Headers: { Authorization: Bearer <jwt> }
  
GET /api/auth/me
  Headers: { Authorization: Bearer <jwt> }
  Response: { user, profile }

PATCH /api/auth/profile
  Body: { phone?, address?, preferences? }
```

---

## 2. User System (LVL Integration)

### MongoDB Schema: Users
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  avatar: String,
  provider: ['google', 'yandex', 'apple'],
  providerId: String,
  
  // Gamification
  level: Number (default: 1),
  xp: Number (default: 0),
  loginStreak: Number,
  lastLoginDate: Date,
  bonusBalance: Number (default: 0),
  referralCode: String (unique),
  
  // Expanded profile
  phone: String,
  addresses: [{
    type: ['delivery', 'billing'],
    name: String,
    street: String,
    city: String,
    zip: String,
    country: String,
    isDefault: Boolean
  }],
  
  // Activity tracking
  lastSpinDate: Date,
  bonusSpinAvailable: Boolean,
  achievements: [ObjectId],
  
  // Meta
  role: ['user', 'moderator', 'admin'],
  status: ['active', 'suspended'],
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints
```
GET /api/user/profile
GET /api/user/stats (XP, level, achievements)
POST /api/user/spin-wheel
GET /api/user/referral-code
POST /api/user/redeem-referral
```

---

## 3. Product System

### MongoDB Schema: Products
```javascript
{
  _id: ObjectId,
  name: String,
  nameRu: String,
  slug: String (unique, indexed),
  category: String,
  
  // Pricing
  price: Number,
  originalPrice: Number,
  currency: String (default: 'USD'),
  
  // Media
  images: [String], // URLs
  videos: [String], // URLs
  
  // Content
  description: String,
  descriptionRu: String,
  longDescription: String,
  longDescriptionRu: String,
  specifications: Object,
  
  // Inventory
  inStock: Boolean,
  stockQuantity: Number,
  
  // Ratings
  rating: Number,
  reviewCount: Number,
  reviews: [ObjectId],
  
  // Moderation (content management ready)
  status: ['draft', 'pending_review', 'approved', 'rejected'],
  submittedBy: ObjectId (user),
  moderatedBy: ObjectId (moderator),
  moderationNotes: String,
  
  // Meta
  tags: [String],
  featured: Boolean,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints
```
GET /api/products (filters: category, price, search, status)
GET /api/products/:slug
POST /api/products (admin/moderator only)
PATCH /api/products/:id (admin/moderator only)
DELETE /api/products/:id (admin only)
POST /api/products/:id/review
```

---

## 4. Cart & Orders System

### MongoDB Schema: Carts
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number, // snapshot at add time
    addedAt: Date
  }],
  updatedAt: Date
}
```

### MongoDB Schema: Orders
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, "ORD-YYYYMMDD-XXXXX"),
  userId: ObjectId,
  
  // Items
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  
  // Pricing
  subtotal: Number,
  discount: Number,
  shipping: Number,
  total: Number,
  
  // Delivery
  shippingAddress: {
    name, street, city, zip, country, phone
  },
  
  // Status tracking
  status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  paymentStatus: ['pending', 'paid', 'failed', 'refunded'],
  
  // Tracking
  trackingNumber: String,
  estimatedDelivery: Date,
  
  // Meta
  notes: String,
  createdAt: Date,
  updatedAt: Date,
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }]
}
```

### API Endpoints
```
GET /api/cart
POST /api/cart/add
PATCH /api/cart/update/:itemId
DELETE /api/cart/remove/:itemId

POST /api/orders/create
GET /api/orders
GET /api/orders/:id
PATCH /api/orders/:id/cancel
```

---

## 5. Wishlist System

### MongoDB Schema: Wishlists
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    addedAt: Date
  }],
  updatedAt: Date
}
```

### API Endpoints
```
GET /api/wishlist
POST /api/wishlist/add/:productId
DELETE /api/wishlist/remove/:productId
```

---

## 6. Achievements & Quests System

### MongoDB Schema: Achievements
```javascript
{
  _id: ObjectId,
  key: String (unique, e.g. 'first_purchase'),
  name: String,
  nameRu: String,
  description: String,
  descriptionRu: String,
  icon: String,
  xpReward: Number,
  category: String,
  condition: Object, // { type: 'purchase_count', value: 1 }
  active: Boolean
}
```

### MongoDB Schema: UserAchievements
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  achievementId: ObjectId,
  progress: Number,
  total: Number,
  unlocked: Boolean,
  unlockedAt: Date
}
```

### API Endpoints
```
GET /api/achievements
GET /api/user/achievements
```

---

## 7. Admin/Moderator Panel

### Access Control
- Route: `/admin` (protected, role-based)
- Glassmorphism style consistent with main site
- Hidden in navigation for regular users

### Admin Features
1. **Product Management**
   - Add/Edit/Delete products
   - Bulk operations
   - Approve/Reject submissions
   - Image/Video upload management

2. **User Management**
   - View all users
   - Adjust XP/Level
   - Suspend/Activate accounts
   - View order history

3. **Order Management**
   - View all orders
   - Update status
   - Process refunds
   - Tracking management

4. **Content Moderation**
   - Queue view (pending products/reviews)
   - Approve/Reject actions
   - Moderation notes

5. **Analytics Dashboard**
   - Sales stats
   - User activity
   - Top products
   - Revenue tracking

### API Endpoints
```
GET /api/admin/products?status=pending_review
PATCH /api/admin/products/:id/moderate
GET /api/admin/users
PATCH /api/admin/users/:id
GET /api/admin/orders
GET /api/admin/stats
```

---

## 8. Real-time Notifications

### WebSocket Events
```
// User-facing
'notification:new_message'
'notification:order_update'
'notification:achievement_unlocked'
'notification:spin_available'

// Admin-facing
'admin:new_order'
'admin:new_review'
'admin:new_product_submission'
```

### MongoDB Schema: Notifications
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,
  title: String,
  message: String,
  data: Object,
  read: Boolean,
  createdAt: Date
}
```

### API Endpoints
```
GET /api/notifications
PATCH /api/notifications/:id/read
DELETE /api/notifications/:id
```

---

## 9. Email System

### Transactional Emails
1. **Welcome Email** (after first social login)
2. **Order Confirmation** (with order details)
3. **Order Status Updates** (shipped, delivered)
4. **Payment Confirmation**
5. **Moderation Updates** (if user submits product)

### Email Templates
- Glassmorphism style (HTML emails)
- Responsive design
- Multi-language (EN/RU)

---

## 10. Messaging System

### MongoDB Schema: Messages
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  recipientId: ObjectId,
  message: String,
  read: Boolean,
  createdAt: Date
}
```

### MongoDB Schema: Conversations
```javascript
{
  _id: ObjectId,
  participants: [ObjectId],
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: { userId: Number }
}
```

### API Endpoints
```
GET /api/messages/conversations
GET /api/messages/:conversationId
POST /api/messages/send
PATCH /api/messages/:id/read
```

---

## Implementation Order (Quality-First Approach)

### Sprint 1: Foundation
1. ✅ Setup backend structure
2. ✅ MongoDB models
3. ✅ JWT middleware
4. ✅ Emergent Social Login integration

### Sprint 2: Core Features
5. ✅ User profile & LVL system
6. ✅ Products CRUD
7. ✅ Cart functionality
8. ✅ Orders system

### Sprint 3: Enhanced Features
9. ✅ Wishlist
10. ✅ Achievements tracking
11. ✅ Email notifications
12. ✅ Real-time notifications

### Sprint 4: Admin & Polish
13. ✅ Admin panel UI
14. ✅ Moderation workflow
15. ✅ Messaging system
16. ✅ Analytics dashboard

---

## Testing Strategy
- Backend: pytest for all endpoints
- Frontend: Manual testing + automated with testing agent
- Integration: End-to-end order flow testing

---

## Notes
- All mock data in `mockData.js` will be replaced with API calls
- Frontend components remain unchanged (only data source changes)
- Glassmorphism design extends to admin panel
- All text content is i18n ready (EN/RU)
