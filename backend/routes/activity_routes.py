"""Activity Feed Routes - Real-time activity tracking"""
from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import random

from models.activity import ActivityCreate, ActivityResponse, ActivityType, OnlineStatsResponse

router = APIRouter(prefix="/api/activity", tags=["activity"])

# In-memory storage for demo (в продакшене - Redis/MongoDB)
# Это будет работать сразу, а данные будут накапливаться
ACTIVITY_STORE = []
ONLINE_SESSIONS = {}  # session_id -> last_active timestamp
PEAK_TODAY = 0
BASE_ONLINE = 234  # Базовое значение онлайн

# Seed initial activities for demo
def seed_initial_activities():
    """Generate some initial activities so feed isn't empty"""
    global ACTIVITY_STORE
    
    sample_products = [
        {"id": "prod_1", "name": "RTX 5090 FE"},
        {"id": "prod_2", "name": "Samsung Odyssey G9"},
        {"id": "prod_3", "name": "Ryzen 9 9950X"},
        {"id": "prod_4", "name": "Intel Core Ultra 9"},
        {"id": "prod_5", "name": "G.Skill DDR5-6400"},
        {"id": "prod_6", "name": "ASUS ROG Swift"},
        {"id": "prod_7", "name": "Corsair 5000D"},
        {"id": "prod_8", "name": "be quiet! Dark Power"},
    ]
    
    sample_users = ["Ivan", "Maria", "Alex", "Elena", "Dmitry", "Anna", "Sergey", "Olga"]
    
    activities = [
        # Recent purchases
        {
            "type": "purchase",
            "user": {"name": random.choice(sample_users)},
            "product": random.choice(sample_products),
            "minutes_ago": random.randint(1, 5)
        },
        # Views
        {
            "type": "view",
            "product": sample_products[1],
            "metadata": {"count": random.randint(20, 60)},
            "minutes_ago": 0
        },
        # Cart adds
        {
            "type": "cart",
            "user": {"name": random.choice(sample_users)},
            "product": random.choice(sample_products),
            "minutes_ago": random.randint(1, 3)
        },
        # Build published
        {
            "type": "build",
            "user": {"name": random.choice(sample_users)},
            "metadata": {"price": f"{random.randint(80, 250) * 1000:,}".replace(",", " ")},
            "minutes_ago": random.randint(1, 4)
        },
        # Low stock warning
        {
            "type": "lowstock",
            "product": sample_products[4],
            "metadata": {"count": random.randint(2, 5)},
            "minutes_ago": 0
        },
        # Review
        {
            "type": "review",
            "user": {"name": random.choice(sample_users)},
            "product": random.choice(sample_products),
            "metadata": {"rating": random.randint(4, 5)},
            "minutes_ago": random.randint(2, 8)
        },
        # More views
        {
            "type": "view",
            "product": sample_products[5],
            "metadata": {"count": random.randint(15, 40)},
            "minutes_ago": 0
        },
        # Another purchase
        {
            "type": "purchase",
            "user": {"name": random.choice(sample_users)},
            "product": random.choice(sample_products),
            "minutes_ago": random.randint(3, 10)
        },
    ]
    
    for act in activities:
        minutes_ago = act.pop("minutes_ago", 0)
        ACTIVITY_STORE.append({
            "id": str(uuid4()),
            **act,
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)).isoformat()
        })

# Seed on module load
seed_initial_activities()


@router.get("/feed", response_model=List[ActivityResponse])
async def get_activity_feed(limit: int = 15):
    """
    Get recent activity feed for FOMO display.
    Returns last N activities sorted by timestamp.
    """
    # Sort by timestamp descending and return limit
    sorted_activities = sorted(
        ACTIVITY_STORE, 
        key=lambda x: x.get("timestamp", ""), 
        reverse=True
    )[:limit]
    
    return sorted_activities


@router.get("/online", response_model=OnlineStatsResponse)
async def get_online_stats():
    """
    Get current online statistics.
    Uses base value + active sessions + random fluctuation for realism.
    """
    global PEAK_TODAY
    
    # Clean old sessions (inactive > 5 minutes)
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=5)
    
    active = {k: v for k, v in ONLINE_SESSIONS.items() if v > cutoff}
    ONLINE_SESSIONS.clear()
    ONLINE_SESSIONS.update(active)
    
    # Calculate online count
    real_sessions = len(ONLINE_SESSIONS)
    
    # Base + real + small random fluctuation (-5 to +10)
    fluctuation = random.randint(-5, 10)
    online_count = BASE_ONLINE + real_sessions + fluctuation
    
    # Update peak
    if online_count > PEAK_TODAY:
        PEAK_TODAY = online_count
    
    return OnlineStatsResponse(
        online_count=max(online_count, 50),  # minimum 50
        active_sessions=real_sessions,
        peak_today=PEAK_TODAY
    )


@router.post("/ping")
async def ping_session(request: Request):
    """
    Ping to track active session.
    Called periodically by frontend to maintain online count.
    """
    # Get or create session ID from header or generate
    session_id = request.headers.get("X-Session-ID") or str(uuid4())
    
    ONLINE_SESSIONS[session_id] = datetime.now(timezone.utc)
    
    return {"session_id": session_id, "status": "active"}


@router.post("/track", response_model=ActivityResponse)
async def track_activity(activity: ActivityCreate):
    """
    Track a new activity event.
    Called when user performs an action (purchase, view, cart, etc.)
    """
    new_activity = {
        "id": str(uuid4()),
        "type": activity.type.value,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    if activity.user_name:
        new_activity["user"] = {"name": activity.user_name}
    
    if activity.product_id or activity.product_name:
        new_activity["product"] = {
            "id": activity.product_id or "",
            "name": activity.product_name or ""
        }
    
    if activity.metadata:
        new_activity["metadata"] = activity.metadata
    
    # Add to store (keep last 100)
    ACTIVITY_STORE.append(new_activity)
    if len(ACTIVITY_STORE) > 100:
        ACTIVITY_STORE.pop(0)
    
    return new_activity


@router.post("/track/view")
async def track_product_view(product_id: str, product_name: str):
    """
    Track product view and update view count.
    Aggregates views for the same product.
    """
    # Find existing view activity for this product (within last hour)
    now = datetime.now(timezone.utc)
    hour_ago = now - timedelta(hours=1)
    
    existing = None
    for act in ACTIVITY_STORE:
        if (act.get("type") == "view" and 
            act.get("product", {}).get("id") == product_id):
            act_time = datetime.fromisoformat(act["timestamp"].replace("Z", "+00:00"))
            if act_time > hour_ago:
                existing = act
                break
    
    if existing:
        # Increment count
        existing["metadata"] = existing.get("metadata", {})
        existing["metadata"]["count"] = existing["metadata"].get("count", 1) + 1
        existing["timestamp"] = now.isoformat()
        return existing
    else:
        # Create new view activity
        new_view = {
            "id": str(uuid4()),
            "type": "view",
            "product": {"id": product_id, "name": product_name},
            "metadata": {"count": random.randint(5, 15)},  # Start with some views
            "timestamp": now.isoformat()
        }
        ACTIVITY_STORE.append(new_view)
        return new_view


@router.get("/stats")
async def get_activity_stats():
    """
    Get activity statistics for admin/analytics.
    """
    now = datetime.now(timezone.utc)
    hour_ago = now - timedelta(hours=1)
    day_ago = now - timedelta(days=1)
    
    stats = {
        "total_activities": len(ACTIVITY_STORE),
        "last_hour": 0,
        "last_day": 0,
        "by_type": {}
    }
    
    for act in ACTIVITY_STORE:
        act_type = act.get("type", "unknown")
        stats["by_type"][act_type] = stats["by_type"].get(act_type, 0) + 1
        
        try:
            act_time = datetime.fromisoformat(act["timestamp"].replace("Z", "+00:00"))
            if act_time > hour_ago:
                stats["last_hour"] += 1
            if act_time > day_ago:
                stats["last_day"] += 1
        except:
            pass
    
    return stats
