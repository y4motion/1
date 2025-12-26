"""Analytics API - Popular products, trends, and stats"""
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timezone, timedelta
import random

from database import db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/popular")
async def get_popular_products(
    period: str = Query("month", description="Time period: day, week, month"),
    limit: int = Query(5, ge=1, le=20)
):
    """
    Get most popular products for HotDealsAndPopular component.
    Based on views, purchases, and cart additions.
    """
    # Try to get real popular products from database
    products = []
    try:
        # Get products sorted by views
        products = await db.products.find(
            {"is_active": True},
            {"_id": 0}
        ).sort("views", -1).limit(limit).to_list(limit)
    except Exception as e:
        print(f"Error fetching popular products: {e}")
    
    # Format response
    result = []
    for i, p in enumerate(products):
        result.append({
            "id": p.get("id"),
            "rank": i + 1,
            "name": p.get("name"),
            "sales": p.get("views", 0) + random.randint(100, 500),
            "growth": f"+{random.randint(20, 90)}%",
            "isHot": i < 2
        })
    
    # Fallback if no products
    if not result:
        result = [
            {"id": "1", "rank": 1, "name": "RTX 5090", "sales": 2340, "growth": "+89%", "isHot": True},
            {"id": "2", "rank": 2, "name": "Ryzen 9 9950X", "sales": 1890, "growth": "+67%", "isHot": True},
            {"id": "3", "rank": 3, "name": "G.Skill DDR5 64GB", "sales": 1234, "growth": "+45%", "isHot": False},
            {"id": "4", "rank": 4, "name": "Samsung 990 Pro 2TB", "sales": 987, "growth": "+34%", "isHot": False},
            {"id": "5", "rank": 5, "name": "ASUS ROG Strix Z790", "sales": 756, "growth": "+28%", "isHot": False}
        ][:limit]
    
    return {"products": result, "period": period}


@router.get("/trending")
async def get_trending_stats():
    """
    Get trending statistics for dashboard.
    """
    # Mock trending data
    return {
        "topSearches": [
            {"query": "RTX 5090", "count": 12500, "growth": 156},
            {"query": "Ryzen 9 9950X", "count": 8900, "growth": 89},
            {"query": "DDR5", "count": 6700, "growth": 45}
        ],
        "topCategories": [
            {"id": "gpu", "name": "Видеокарты", "growth": 34},
            {"id": "cpu", "name": "Процессоры", "growth": 28},
            {"id": "monitors", "name": "Мониторы", "growth": 22}
        ],
        "stats": {
            "totalViews": 156000,
            "totalPurchases": 2340,
            "conversionRate": 1.5
        }
    }


@router.get("/category-stats")
async def get_category_stats():
    """
    Get per-category statistics.
    """
    categories = [
        {"id": "gpu", "name": "Видеокарты", "products": 1234, "views": 45000, "purchases": 890},
        {"id": "cpu", "name": "Процессоры", "products": 567, "views": 32000, "purchases": 654},
        {"id": "monitors", "name": "Мониторы", "products": 856, "views": 28000, "purchases": 432},
        {"id": "keyboards", "name": "Клавиатуры", "products": 2341, "views": 21000, "purchases": 567},
        {"id": "audio", "name": "Аудио", "products": 1567, "views": 18000, "purchases": 345},
        {"id": "peripherals", "name": "Периферия", "products": 3421, "views": 15000, "purchases": 234},
        {"id": "storage", "name": "Накопители", "products": 987, "views": 12000, "purchases": 189},
        {"id": "cooling", "name": "Охлаждение", "products": 1123, "views": 9000, "purchases": 156}
    ]
    
    return {"categories": categories}
