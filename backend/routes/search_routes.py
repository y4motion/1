from fastapi import APIRouter, Query, Depends
from database import get_database
from typing import List, Optional
from models.search_history import SearchHistory
from models.user import User
from utils.auth_utils import get_current_user
from utils.responses import success_response
from datetime import datetime, timezone, timedelta
import re

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/suggestions")
async def get_search_suggestions(q: str = Query(..., min_length=1)):
    """Get autocomplete suggestions for products"""
    db = await get_database()
    
    # Escape regex special characters
    escaped_query = re.escape(q)
    
    # Search in products by name, description, tags
    products = await db.products.find({
        "$or": [
            {"name": {"$regex": escaped_query, "$options": "i"}},
            {"description": {"$regex": escaped_query, "$options": "i"}},
            {"tags": {"$in": [re.compile(escaped_query, re.IGNORECASE)]}}
        ],
        "status": "approved"
    }).sort("rating", -1).limit(8).to_list(length=8)
    
    suggestions = []
    for product in products:
        suggestions.append({
            "id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "image": product["images"][0] if product.get("images") and len(product["images"]) > 0 else None,
            "category": product.get("category_id", ""),
            "rating": product.get("rating", 0)
        })
    
    return success_response(data=suggestions, message=f"Found {len(suggestions)} suggestions")


@router.get("/trending")
async def get_trending_searches(limit: int = Query(10, ge=1, le=20)):
    """Get trending search queries from last 7 days"""
    db = await get_database()
    
    # Get searches from last 7 days
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    try:
        pipeline = [
            {"$match": {"timestamp": {"$gte": seven_days_ago.isoformat()}}},
            {"$group": {
                "_id": "$query",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": limit}
        ]
        
        trending = await db.search_history.aggregate(pipeline).to_list(length=limit)
        
        results = [
            {"query": item["_id"], "count": item["count"]}
            for item in trending
        ]
    except Exception as e:
        # If no search history yet, return empty
        results = []
    
    return success_response(data=results, message=f"Found {len(results)} trending searches")


@router.post("/track")
async def track_search(
    query: str,
    results_count: int = 0,
    clicked_product_id: Optional[str] = None,
    filters_used: Optional[dict] = None,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Track search for analytics"""
    db = await get_database()
    
    search_record = SearchHistory(
        query=query,
        results_count=results_count,
        clicked_product_id=clicked_product_id,
        user_id=current_user.id if current_user else None,
        filters_used=filters_used or {}
    )
    
    # Serialize datetime
    record_dict = search_record.dict()
    record_dict['timestamp'] = record_dict['timestamp'].isoformat()
    
    await db.search_history.insert_one(record_dict)
    
    return success_response(data={"tracked": True}, message="Search tracked")


@router.get("/history")
async def get_search_history(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Get user's search history"""
    db = await get_database()
    
    history = await db.search_history.find({
        "user_id": current_user.id
    }).sort("timestamp", -1).limit(limit).to_list(length=limit)
    
    # Format timestamps
    for item in history:
        if isinstance(item.get('timestamp'), str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    
    return success_response(data=history, message=f"Found {len(history)} searches")
