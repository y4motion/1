"""Homepage API - Aggregated data for homepage components"""
from fastapi import APIRouter, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import random

router = APIRouter(prefix="/homepage", tags=["homepage"])

# =============================================
# TRENDING SEARCHES / CHIPS
# =============================================

# In-memory trending data (in production: Redis/MongoDB)
TRENDING_SEARCHES = {}
SEARCH_COUNTS = {}

def update_trending(query: str):
    """Track search query for trending"""
    now = datetime.now(timezone.utc)
    if query not in SEARCH_COUNTS:
        SEARCH_COUNTS[query] = {"count": 0, "first_seen": now}
    SEARCH_COUNTS[query]["count"] += 1
    SEARCH_COUNTS[query]["last_seen"] = now

@router.get("/trending-searches")
async def get_trending_searches(limit: int = 12):
    """
    Get trending search queries for TrendingChips component.
    Returns ranked list with growth percentages.
    """
    # Base trending items (seeded)
    base_trending = [
        {"query": "RTX 5090", "base_count": 2350, "growth": 235},
        {"query": "Ryzen 9 9950X", "base_count": 1800, "growth": 180},
        {"query": "DDR5 64GB Kit", "base_count": 920, "growth": 92},
        {"query": "Samsung 990 PRO", "base_count": 780, "growth": 78},
        {"query": "LG UltraGear 27\"", "base_count": 650, "growth": 65},
        {"query": "be quiet! 850W", "base_count": 540, "growth": 54},
        {"query": "Corsair 5000D", "base_count": 480, "growth": 48},
        {"query": "Arctic Freezer", "base_count": 420, "growth": 42},
        {"query": "ASUS ROG Swift", "base_count": 380, "growth": 38},
        {"query": "Logitech G Pro X", "base_count": 320, "growth": 32},
        {"query": "SteelSeries Apex", "base_count": 280, "growth": 28},
        {"query": "Razer DeathAdder", "base_count": 240, "growth": 24},
    ]
    
    # Merge with real search counts
    for item in base_trending:
        real_count = SEARCH_COUNTS.get(item["query"], {}).get("count", 0)
        item["count"] = item["base_count"] + real_count
        # Recalculate growth with some randomness for "live" feel
        item["growth"] = item["growth"] + random.randint(-5, 10)
    
    # Sort by count
    sorted_trending = sorted(base_trending, key=lambda x: x["count"], reverse=True)
    
    # Format response
    result = []
    for i, item in enumerate(sorted_trending[:limit]):
        result.append({
            "id": f"trend-{i+1}",
            "rank": i + 1,
            "name": item["query"],
            "growth": f"+{item['growth']}%",
            "isHot": i < 3,
            "count": item["count"]
        })
    
    return result


# =============================================
# CATEGORY STATS
# =============================================

@router.get("/category-stats")
async def get_category_stats():
    """
    Get category statistics for ShopByCategory component.
    Returns product counts and trending status.
    """
    from database import db
    
    categories_config = [
        {"id": "gpu", "name": "Видеокарты", "icon": "Cpu", "baseCount": 1234, "trending": True, "growth": 12},
        {"id": "monitors", "name": "Мониторы", "icon": "Monitor", "baseCount": 856, "hot": True},
        {"id": "keyboards", "name": "Клавиатуры", "icon": "Keyboard", "baseCount": 2341},
        {"id": "audio", "name": "Аудио", "icon": "Headphones", "baseCount": 1567},
        {"id": "peripherals", "name": "Периферия", "icon": "Mouse", "baseCount": 3421},
        {"id": "storage", "name": "Накопители", "icon": "HardDrive", "baseCount": 987, "growth": 8},
        {"id": "psu", "name": "Блоки питания", "icon": "Zap", "baseCount": 654},
        {"id": "cooling", "name": "Охлаждение", "icon": "Fan", "baseCount": 1123, "hot": True},
    ]
    
    result = []
    for cat in categories_config:
        # Try to get real count from products collection
        try:
            real_count = await db.products.count_documents({"category": cat["id"]})
        except:
            real_count = 0
        
        count = cat["baseCount"] + real_count
        
        item = {
            "id": cat["id"],
            "name": cat["name"],
            "icon": cat["icon"],
            "count": count,
            "hot": cat.get("hot", False),
            "trending": cat.get("trending", False),
            "growth": cat.get("growth")
        }
        result.append(item)
    
    return result


# =============================================
# QUICK ACCESS DATA
# =============================================

@router.get("/quick-access")
async def get_quick_access_data():
    """
    Get data for QuickAccessGrid component.
    Includes latest feed posts, top users, etc.
    """
    from database import db
    
    # Get latest feed posts
    latest_posts = []
    try:
        posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).limit(3).to_list(3)
        latest_posts = posts
    except:
        pass
    
    # Get top users from rating
    top_users = []
    try:
        users = await db.users.find({}, {"_id": 0, "password": 0}).sort("xp", -1).limit(3).to_list(3)
        top_users = [{"name": u.get("username", "User"), "xp": u.get("xp", 0)} for u in users]
    except:
        pass
    
    # Fallback if no users
    if not top_users:
        top_users = [
            {"name": "ProGamer", "xp": 15420},
            {"name": "TechMaster", "xp": 12350},
            {"name": "PCBuilder", "xp": 9870}
        ]
    
    # Get swap listings count
    swap_count = 0
    try:
        swap_count = await db.swap_listings.count_documents({"status": "active"})
    except:
        swap_count = 45
    
    # Get active group buys
    group_buys = 0
    try:
        group_buys = await db.group_buys.count_documents({"status": "active"})
    except:
        group_buys = 8
    
    return {
        "feed": {
            "latestPosts": latest_posts,
            "totalPosts": len(latest_posts) if latest_posts else 0
        },
        "rating": {
            "topUsers": top_users
        },
        "swap": {
            "activeListings": swap_count if swap_count else 45
        },
        "groupBuy": {
            "activeDeals": group_buys if group_buys else 8,
            "maxDiscount": 40
        },
        "articles": {
            "totalArticles": 156
        }
    }


# =============================================
# TRENDING PRODUCTS
# =============================================

@router.get("/trending-products")
async def get_trending_products(limit: int = 8):
    """
    Get trending products for TrendingSection component.
    Based on views, purchases, and activity.
    """
    from database import db
    
    products = []
    try:
        # Get products sorted by views/popularity
        products = await db.products.find(
            {}, 
            {"_id": 0}
        ).sort("views", -1).limit(limit).to_list(limit)
    except:
        pass
    
    # Fallback trending products
    if not products:
        products = [
            {
                "id": "prod-1",
                "name": "NVIDIA RTX 5090 Founders Edition",
                "price": 249990,
                "originalPrice": 279990,
                "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80",
                "category": "gpu",
                "rating": 4.9,
                "views": 12500,
                "inStock": True
            },
            {
                "id": "prod-2",
                "name": "AMD Ryzen 9 9950X",
                "price": 89990,
                "image": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
                "category": "cpu",
                "rating": 4.8,
                "views": 9800
            },
            {
                "id": "prod-3",
                "name": "Samsung Odyssey G9 49\"",
                "price": 159990,
                "originalPrice": 189990,
                "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80",
                "category": "monitors",
                "rating": 4.7,
                "views": 8500
            },
            {
                "id": "prod-4",
                "name": "G.Skill DDR5-6400 64GB Kit",
                "price": 32990,
                "image": "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80",
                "category": "memory",
                "rating": 4.6,
                "views": 7200
            }
        ]
    
    return products


# =============================================
# LATEST ARTICLES
# =============================================

@router.get("/latest-articles")
async def get_latest_articles(limit: int = 6):
    """
    Get latest articles for LatestArticles component.
    """
    from database import db
    
    articles = []
    try:
        articles = await db.articles.find(
            {}, 
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
    except:
        pass
    
    # Fallback articles
    if not articles:
        articles = [
            {
                "id": "art-1",
                "title": "Обзор RTX 5090: новый король гейминга",
                "excerpt": "Полный разбор новой флагманской видеокарты NVIDIA",
                "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80",
                "author": "TechMaster",
                "readTime": 12,
                "views": 15600,
                "category": "reviews"
            },
            {
                "id": "art-2",
                "title": "Гайд: Сборка ПК за 200к в 2025",
                "excerpt": "Оптимальные комплектующие для игрового ПК",
                "image": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80",
                "author": "PCBuilder",
                "readTime": 8,
                "views": 12300,
                "category": "guides"
            },
            {
                "id": "art-3",
                "title": "DDR5 vs DDR4: стоит ли обновляться?",
                "excerpt": "Сравнение памяти в реальных задачах",
                "image": "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=80",
                "author": "RAMExpert",
                "readTime": 10,
                "views": 9800,
                "category": "comparison"
            }
        ]
    
    return articles


# =============================================
# USER PREFERENCES & PERSONALIZATION
# =============================================

# In-memory user preferences (in production: MongoDB)
USER_PREFERENCES = {}
USER_HISTORY = {}

@router.post("/track-interest")
async def track_user_interest(
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    category: Optional[str] = None,
    product_id: Optional[str] = None,
    search_query: Optional[str] = None,
    action: str = "view"  # view, click, search, purchase
):
    """
    Track user interest for personalization.
    """
    identifier = user_id or session_id or "anonymous"
    
    if identifier not in USER_PREFERENCES:
        USER_PREFERENCES[identifier] = {
            "categories": {},
            "products": [],
            "searches": []
        }
    
    prefs = USER_PREFERENCES[identifier]
    
    # Track category interest
    if category:
        prefs["categories"][category] = prefs["categories"].get(category, 0) + 1
    
    # Track product view
    if product_id and product_id not in prefs["products"]:
        prefs["products"].append(product_id)
        if len(prefs["products"]) > 50:
            prefs["products"] = prefs["products"][-50:]
    
    # Track search
    if search_query:
        prefs["searches"].append(search_query)
        if len(prefs["searches"]) > 20:
            prefs["searches"] = prefs["searches"][-20:]
        # Update trending
        update_trending(search_query)
    
    return {"status": "tracked"}


@router.get("/personalized")
async def get_personalized_content(
    user_id: Optional[str] = None,
    session_id: Optional[str] = None
):
    """
    Get personalized homepage content based on user preferences.
    """
    identifier = user_id or session_id or "anonymous"
    prefs = USER_PREFERENCES.get(identifier, {})
    
    # Get top categories for user
    categories = prefs.get("categories", {})
    top_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # Get recent searches
    recent_searches = prefs.get("searches", [])[-5:]
    
    return {
        "topCategories": [cat for cat, _ in top_categories],
        "recentSearches": recent_searches,
        "hasPreferences": len(categories) > 0
    }


# =============================================
# GLASSY SWAP INTEGRATION
# =============================================

@router.get("/swap-highlights")
async def get_swap_highlights(limit: int = 4):
    """
    Get highlighted Glassy Swap listings for homepage.
    """
    from database import db
    
    listings = []
    try:
        listings = await db.swap_listings.find(
            {"status": "active"},
            {"_id": 0}
        ).sort("views", -1).limit(limit).to_list(limit)
    except:
        pass
    
    if not listings:
        listings = [
            {
                "id": "swap-1",
                "title": "RTX 4090 FE идеал",
                "price": 145000,
                "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80",
                "seller": "ProGamer",
                "condition": "like_new"
            },
            {
                "id": "swap-2",
                "title": "Intel i9-14900K + коробка",
                "price": 52000,
                "image": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
                "seller": "TechMaster",
                "condition": "excellent"
            }
        ]
    
    return listings



# =============================================
# TESTIMONIALS
# =============================================

@router.get("/testimonials")
async def get_testimonials(limit: int = 10):
    """
    Get recent testimonials for TestimonialsCarousel.
    """
    from database import db
    
    testimonials = []
    try:
        testimonials = await db.testimonials.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
    except:
        pass
    
    if not testimonials:
        testimonials = [
            {
                "id": "test-1",
                "author": "ProGamer",
                "avatar": None,
                "rating": 5,
                "text": "Лучший магазин для геймеров! Быстрая доставка, отличные цены.",
                "product": "RTX 5090",
                "verified": True
            },
            {
                "id": "test-2",
                "author": "TechMaster",
                "avatar": None,
                "rating": 5,
                "text": "Собрал ПК мечты благодаря конструктору сборок. Всё совместимо!",
                "product": "Сборка ПК",
                "verified": True
            },
            {
                "id": "test-3",
                "author": "PCBuilder",
                "avatar": None,
                "rating": 4,
                "text": "Glassy Swap - находка! Продал старую видеокарту за 5 минут.",
                "product": "RTX 4080",
                "verified": True
            },
            {
                "id": "test-4",
                "author": "GamerPro",
                "avatar": None,
                "rating": 5,
                "text": "Групповые покупки экономят до 40%! Взял монитор в складчину.",
                "product": "Samsung G9",
                "verified": True
            }
        ]
    
    return {"testimonials": testimonials}


# =============================================
# CATEGORIES FEATURED
# =============================================

@router.get("/categories-featured")
async def get_featured_categories():
    """
    Get featured categories for ShopByCategory.
    """
    from database import db
    
    categories = [
        {"id": "gpu", "name": "Видеокарты", "icon": "Cpu", "count": 1234, "trending": True, "growth": 12},
        {"id": "monitors", "name": "Мониторы", "icon": "Monitor", "count": 856, "hot": True},
        {"id": "keyboards", "name": "Клавиатуры", "icon": "Keyboard", "count": 2341},
        {"id": "audio", "name": "Аудио", "icon": "Headphones", "count": 1567},
        {"id": "peripherals", "name": "Периферия", "icon": "Mouse", "count": 3421},
        {"id": "storage", "name": "Накопители", "icon": "HardDrive", "count": 987, "growth": 8},
        {"id": "psu", "name": "Блоки питания", "icon": "Zap", "count": 654},
        {"id": "cooling", "name": "Охлаждение", "icon": "Fan", "count": 1123, "hot": True}
    ]
    
    # Try to get real counts
    for cat in categories:
        try:
            real_count = await db.products.count_documents({"category": cat["id"]})
            if real_count > 0:
                cat["count"] = cat["count"] + real_count
        except:
            pass
    
    return {"categories": categories}
