# 📚 API DOCUMENTATION

**Project:** Glassy Market  
**Base URL:** `https://api.glassymarket.com` or `process.env.REACT_APP_BACKEND_URL`  
**Version:** 1.0.0

---

## 🔐 Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

## 📦 Products

### List Products
```http
GET /api/products/

Query Parameters:
- limit (int): Max products to return (default: 20)
- sort_by (string): Field to sort by (default: created_at)
- sort_order (string): asc or desc (default: desc)
- category_id (string): Filter by category
- subcategory_id (string): Filter by subcategory
- persona_id (string): Filter by persona
- search (string): Search term
- min_price (float): Minimum price
- max_price (float): Maximum price
- specific_filters (json): Dynamic filters

Response:
[
  {
    "id": "uuid",
    "title": "NVIDIA RTX 4090",
    "description": "...",
    "price": 1599.99,
    "currency": "USD",
    "images": [...],
    "specifications": [...],
    "tags": ["gpu", "nvidia"],
    "stock": 3,
    "average_rating": 4.8,
    "total_reviews": 15,
    "views": 1234,
    "wishlist_count": 56
  }
]
```

### Get Product
```http
GET /api/products/{id}

Response:
{
  "id": "uuid",
  "title": "NVIDIA RTX 4090",
  ... (full product object)
}
```

### Toggle Wishlist
```http
POST /api/products/{id}/wishlist
Authorization: Bearer {token}

Response:
{
  "status": "added" | "removed"
}
```

### Get Deals
```http
GET /api/products/deals?limit=10

Response:
[
  {
    "id": "uuid",
    "title": "...",
    "price": 99.99,
    "original_price": 149.99,
    "discount_percent": 33,
    "ends_at": "2025-12-31T23:59:59Z"
  }
]
```

---

## 📂 Categories

### List Categories
```http
GET /api/categories/

Response:
[
  {
    "id": "100",
    "name": "Components",
    "name_en": "Components",
    "icon": "cpu",
    "subcategories": [
      { "id": "101", "name": "Graphics Cards" },
      { "id": "102", "name": "Processors" }
    ]
  }
]
```

### Get Catalog
```http
GET /api/marketplace/catalog

Response:
{
  "catalog": {
    "100": {
      "name": "Components",
      "name_en": "Components",
      "subcategories": { ... }
    }
  }
}
```

### Get Personas
```http
GET /api/catalog/personas

Response:
{
  "personas": {
    "pro_gamer": {
      "id": "pro_gamer",
      "name": "Pro Gamer",
      "name_en": "Pro Gamer"
    }
  }
}
```

---

## 🛒 Cart

### Get Cart
```http
GET /api/cart/
Authorization: Bearer {token}

Response:
{
  "items": [...],
  "total": 1599.99,
  "item_count": 3
}
```

### Add to Cart
```http
POST /api/cart/items/
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 1
}
```

### Remove from Cart
```http
DELETE /api/cart/items/{item_id}
Authorization: Bearer {token}
```

---

## ⭐ Reviews

### Get Product Reviews
```http
GET /api/reviews/product/{product_id}/

Response:
[
  {
    "id": "uuid",
    "rating": 5,
    "title": "Amazing product!",
    "comment": "...",
    "username": "John",
    "created_at": "2025-12-01T12:00:00Z",
    "is_verified_purchase": true,
    "helpful_count": 15
  }
]
```

### Submit Review
```http
POST /api/reviews/
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": "uuid",
  "rating": 5,
  "title": "Great!",
  "comment": "Love this product..."
}
```

---

## ❓ Questions & Answers

### Get Product Questions
```http
GET /api/questions/product/{product_id}/

Response:
[
  {
    "id": "uuid",
    "question": "Does this support RGB?",
    "username": "Jane",
    "created_at": "...",
    "answers": [
      {
        "content": "Yes, it does!",
        "username": "Seller",
        "is_seller": true
      }
    ]
  }
]
```

### Ask Question
```http
POST /api/questions/
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": "uuid",
  "question": "What is the warranty period?"
}
```

---

## 📡 Activity (Real-time)

### Get Live Feed
```http
GET /api/activity/feed?limit=12

Response:
[
  {
    "id": "uuid",
    "type": "purchase",
    "user": { "name": "John" },
    "product": { "id": "...", "name": "RTX 4090" },
    "timestamp": "2025-12-26T10:00:00Z"
  }
]
```

### Get Online Count
```http
GET /api/activity/online

Response:
{
  "online_count": 234
}
```

### Ping (Keep-alive)
```http
POST /api/activity/ping
X-Session-ID: sess_12345_abcde
```

---

## 🔄 Glassy Swap (P2P)

### List Swap Listings
```http
GET /api/swap/listings?status=active&limit=20

Response:
[
  {
    "id": "uuid",
    "title": "RTX 3080 FE",
    "description": "...",
    "price": 450,
    "condition": "excellent",
    "images": [...],
    "seller": { "id": "...", "name": "...", "rating": 4.9 },
    "created_at": "..."
  }
]
```

### Create Listing
```http
POST /api/swap/listings
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "RTX 3080 FE",
  "description": "...",
  "category": "gpu",
  "condition": "excellent",
  "price": 450,
  "images": [...]
}
```

### Get Listing
```http
GET /api/swap/listings/{id}
```

---

## 🏠 Homepage

### Get Trending
```http
GET /api/trending/now

Response:
[
  { "id": "1", "name": "RTX 5090", "count": 1234, "trend": "up" }
]
```

### Get Popular Products
```http
GET /api/analytics/popular?limit=8
```

### Get Testimonials
```http
GET /api/testimonials/recent?limit=6
```

### Get Latest Articles
```http
GET /api/homepage/latest-articles?limit=3
```

### Get Featured Categories
```http
GET /api/categories/featured
```

---

## 🔌 WebSocket

### Connect
```javascript
const ws = new WebSocket('wss://api.glassymarket.com/ws/activity');
```

### Events

**Incoming:**
```json
{
  "type": "activity",
  "activity": {
    "id": "...",
    "type": "purchase",
    "user": { ... },
    "product": { ... },
    "timestamp": "..."
  }
}
```

```json
{
  "type": "online_count",
  "count": 234
}
```

**Fallback:**
If WebSocket fails, system automatically falls back to HTTP polling every 30 seconds.

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## 🔒 Security Notes

1. All sensitive endpoints require `Authorization: Bearer {token}` header
2. Tokens expire after 24 hours
3. Rate limiting: 100 requests/minute per IP
4. CORS enabled for frontend domain

---

**Last Updated:** December 26, 2025
