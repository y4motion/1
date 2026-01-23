"""
Monarchs Routes - Leaderboard & Achievements API

Endpoints for rankings, achievements, mini-profiles
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone, timedelta

from database import db
from models.monarchs import (
    LeaderboardPeriod, LeaderboardCategory,
    Achievement, LeaderboardEntry, UserMiniProfile
)
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/monarchs", tags=["monarchs"])


# ========================================
# LEADERBOARDS
# ========================================

@router.get("/top")
async def get_leaderboard(
    period: str = Query("month", description="Period: week, month, year, all_time"),
    category: str = Query("xp", description="Category: xp, trust, posts, ideas, contributions"),
    limit: int = Query(50, ge=1, le=100)
):
    """Get leaderboard for a period and category"""
    
    # Validate period
    try:
        period_enum = LeaderboardPeriod(period)
    except ValueError:
        period_enum = LeaderboardPeriod.MONTH
    
    # Calculate date range
    now = datetime.now(timezone.utc)
    period_start = None
    
    if period_enum == LeaderboardPeriod.WEEK:
        period_start = now - timedelta(days=7)
    elif period_enum == LeaderboardPeriod.MONTH:
        period_start = now - timedelta(days=30)
    elif period_enum == LeaderboardPeriod.YEAR:
        period_start = now - timedelta(days=365)
    # ALL_TIME = no filter
    
    # Build query based on category
    sort_field = "xp_total"
    if category == "trust":
        sort_field = "trust_score"
    elif category == "posts":
        sort_field = "posts_count"
    elif category == "ideas":
        sort_field = "ideas_count"
    
    # Get users
    query = {"is_active": True}
    
    users = await db["users"].find(query).sort(sort_field, -1).limit(limit).to_list(length=limit)
    
    entries = []
    for rank, user in enumerate(users, 1):
        entries.append({
            "rank": rank,
            "user_id": user.get("id"),
            "username": user.get("username"),
            "user_avatar": user.get("avatar_url"),
            "user_level": user.get("level", 1),
            "user_class": user.get("class_type"),
            "trust_score": user.get("trust_score", 500.0),
            "score": user.get(sort_field, 0),
            "stats": {
                "xp_total": user.get("xp_total", 0),
                "trust_score": user.get("trust_score", 500.0),
                "level": user.get("level", 1)
            }
        })
    
    return {
        "period": period,
        "category": category,
        "entries": entries,
        "total_participants": await db["users"].count_documents({"is_active": True}),
        "calculated_at": now.isoformat()
    }


@router.get("/user/{user_id}/rank")
async def get_user_rank(user_id: str):
    """Get a user's current rankings"""
    
    user = await db["users"].find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate ranks
    xp_rank = await db["users"].count_documents({
        "is_active": True,
        "xp_total": {"$gt": user.get("xp_total", 0)}
    }) + 1
    
    trust_rank = await db["users"].count_documents({
        "is_active": True,
        "trust_score": {"$gt": user.get("trust_score", 500.0)}
    }) + 1
    
    total_users = await db["users"].count_documents({"is_active": True})
    
    return {
        "user_id": user_id,
        "rankings": {
            "xp": {
                "rank": xp_rank,
                "total": total_users,
                "percentile": round((1 - xp_rank / total_users) * 100, 1) if total_users > 0 else 0
            },
            "trust": {
                "rank": trust_rank,
                "total": total_users,
                "percentile": round((1 - trust_rank / total_users) * 100, 1) if total_users > 0 else 0
            }
        }
    }


# ========================================
# ACHIEVEMENTS
# ========================================

@router.get("/user/{user_id}/achievements")
async def get_user_achievements(user_id: str):
    """Get all achievements for a user"""
    
    achievements = await db["achievements"].find({"user_id": user_id}).to_list(length=100)
    
    for ach in achievements:
        ach.pop("_id", None)
    
    # Separate completed vs in-progress
    completed = [a for a in achievements if a.get("is_completed")]
    in_progress = [a for a in achievements if not a.get("is_completed")]
    
    return {
        "user_id": user_id,
        "completed": completed,
        "in_progress": in_progress,
        "total_completed": len(completed)
    }


@router.get("/achievements/available")
async def get_available_achievements():
    """Get all available achievements"""
    
    from models.monarchs import ACHIEVEMENT_DEFINITIONS
    
    return {
        "achievements": [
            {
                "id": key,
                **value
            }
            for key, value in ACHIEVEMENT_DEFINITIONS.items()
        ]
    }


# ========================================
# MINI PROFILES
# ========================================

@router.get("/user/{user_id}/mini-profile")
async def get_mini_profile(user_id: str):
    """Get mini profile for hover cards"""
    
    user = await db["users"].find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get stats
    posts_count = await db["network_posts"].count_documents({"user_id": user_id, "status": "published"})
    ideas_count = await db["consensus_ideas"].count_documents({"user_id": user_id})
    ideas_implemented = await db["consensus_ideas"].count_documents({"user_id": user_id, "status": "implemented"})
    
    # Get top achievements
    achievements = await db["achievements"].find({
        "user_id": user_id,
        "is_completed": True
    }).sort("unlocked_at", -1).limit(5).to_list(length=5)
    
    for ach in achievements:
        ach.pop("_id", None)
    
    achievements_total = await db["achievements"].count_documents({
        "user_id": user_id,
        "is_completed": True
    })
    
    # Get ranks
    xp_rank = await db["users"].count_documents({
        "is_active": True,
        "xp_total": {"$gt": user.get("xp_total", 0)}
    }) + 1
    
    return {
        "user_id": user_id,
        "username": user.get("username"),
        "avatar_url": user.get("avatar_url"),
        "level": user.get("level", 1),
        "xp_total": user.get("xp_total", 0),
        "trust_score": user.get("trust_score", 500.0),
        "hierarchy": user.get("hierarchy", "ghost"),
        "class_type": user.get("class_type"),
        "equipped_title": user.get("equipped_title"),
        "posts_count": posts_count,
        "ideas_count": ideas_count,
        "ideas_implemented": ideas_implemented,
        "top_achievements": achievements,
        "achievements_count": achievements_total,
        "all_time_rank": xp_rank,
        "joined_at": user.get("created_at"),
        "last_active": user.get("last_activity_date")
    }


# ========================================
# HALL OF FAME
# ========================================

@router.get("/hall-of-fame")
async def get_hall_of_fame():
    """Get notable users: implementers, top contributors"""
    
    # Top idea implementers
    implementers = await db["consensus_ideas"].aggregate([
        {"$match": {"status": "implemented"}},
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]).to_list(length=10)
    
    # Enrich with user data
    for impl in implementers:
        user = await db["users"].find_one({"id": impl["_id"]})
        if user:
            impl["username"] = user.get("username")
            impl["avatar_url"] = user.get("avatar_url")
            impl["level"] = user.get("level", 1)
    
    # Top XP all time
    top_xp = await db["users"].find({"is_active": True}).sort("xp_total", -1).limit(10).to_list(length=10)
    
    top_xp_clean = [{
        "user_id": u.get("id"),
        "username": u.get("username"),
        "avatar_url": u.get("avatar_url"),
        "level": u.get("level", 1),
        "xp_total": u.get("xp_total", 0)
    } for u in top_xp]
    
    # Most trusted
    most_trusted = await db["users"].find({"is_active": True}).sort("trust_score", -1).limit(10).to_list(length=10)
    
    most_trusted_clean = [{
        "user_id": u.get("id"),
        "username": u.get("username"),
        "avatar_url": u.get("avatar_url"),
        "level": u.get("level", 1),
        "trust_score": u.get("trust_score", 500.0)
    } for u in most_trusted]
    
    return {
        "implementers": implementers,
        "top_xp": top_xp_clean,
        "most_trusted": most_trusted_clean
    }
