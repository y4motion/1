from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from models.rating import UserStats, Achievement, XPTransaction, MonthlyLeaderboard
from models.user import User
from utils.auth_utils import get_current_user
from utils.cache import cache_response, invalidate_cache
from database import get_database
from datetime import datetime, timezone

router = APIRouter(prefix="/rating", tags=["rating"])


def calculate_level(xp: int) -> int:
    """Calculate level from XP (progressive difficulty)"""
    # Level 1: 0 XP, Level 2: 1000 XP, Level 3: 2500 XP, etc.
    level = 1
    xp_needed = 0
    increment = 1000
    
    while xp >= xp_needed:
        xp -= xp_needed
        level += 1
        xp_needed = increment
        increment = int(increment * 1.2)  # 20% increase per level
    
    return level - 1


def xp_to_next_level(current_xp: int, current_level: int) -> int:
    """Calculate XP needed for next level"""
    base = 1000
    for i in range(current_level):
        base = int(base * 1.2)
    return base


@router.get("/me", response_model=UserStats)
async def get_my_stats(
    current_user: User = Depends(get_current_user)
):
    """Get current user's stats"""
    db = await get_database()
    
    stats = await db.user_stats.find_one({"user_id": current_user.id})
    
    if not stats:
        # Create initial stats
        stats = UserStats(
            user_id=current_user.id,
            username=current_user.username,
            user_avatar=current_user.avatar_url,
            total_xp=current_user.experience,
            current_level=current_user.level,
            monthly_rp=current_user.monthly_rp
        )
        await db.user_stats.insert_one(stats.dict())
    
    stats = UserStats(**stats)
    
    # Calculate level and vote weight
    stats.current_level = calculate_level(stats.total_xp)
    stats.xp_to_next_level = xp_to_next_level(stats.total_xp, stats.current_level)
    stats.vote_weight = 1.0 + (stats.current_level / 10.0)
    
    return stats


@router.get("/leaderboard", response_model=List[UserStats])
@cache_response(ttl_seconds=60)  # 1 minute cache - updates frequently
async def get_leaderboard(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    period: str = Query("monthly", regex="^(monthly|all_time)$")
):
    """Get leaderboard"""
    db = await get_database()
    
    if period == "monthly":
        # Sort by monthly RP
        stats_list = await db.user_stats.find().sort("monthly_rp", -1).skip(skip).limit(limit).to_list(length=limit)
    else:
        # Sort by total XP
        stats_list = await db.user_stats.find().sort("total_xp", -1).skip(skip).limit(limit).to_list(length=limit)
    
    result = []
    for i, stats in enumerate(stats_list, start=skip + 1):
        stats_obj = UserStats(**stats)
        stats_obj.monthly_rank = i
        result.append(stats_obj)
    
    return result


@router.get("/top-monthly", response_model=List[UserStats])
async def get_top_monthly(
    limit: int = Query(10, ge=1, le=10)
):
    """Get top users of current month (for rewards)"""
    db = await get_database()
    
    stats_list = await db.user_stats.find().sort("monthly_rp", -1).limit(limit).to_list(length=limit)
    
    result = []
    for i, stats in enumerate(stats_list, start=1):
        stats_obj = UserStats(**stats)
        stats_obj.monthly_rank = i
        result.append(stats_obj)
    
    return result


@router.post("/award-xp")
async def award_xp(
    user_id: str,
    amount: int,
    action: str,
    description: str,
    current_user: User = Depends(get_current_user)
):
    """Award XP to user (admin only or system)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = await get_database()
    
    # Update user stats
    await db.user_stats.update_one(
        {"user_id": user_id},
        {"$inc": {"total_xp": amount}},
        upsert=True
    )
    
    # Log transaction
    transaction = XPTransaction(
        user_id=user_id,
        point_type="xp",
        amount=amount,
        action=action,
        description=description
    )
    await db.xp_transactions.insert_one(transaction.dict())
    
    # Update user level in main users collection
    user_stats = await db.user_stats.find_one({"user_id": user_id})
    if user_stats:
        new_level = calculate_level(user_stats["total_xp"])
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"level": new_level, "experience": user_stats["total_xp"]}}
        )
    
    return {"status": "awarded", "amount": amount, "user_id": user_id}


@router.post("/reset-monthly")
async def reset_monthly_rp(
    current_user: User = Depends(get_current_user)
):
    """Reset monthly RP (admin only, should run on 1st of month)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = await get_database()
    
    # Get top 10 before reset
    top_10 = await db.user_stats.find().sort("monthly_rp", -1).limit(10).to_list(length=10)
    
    # Award legendary achievements and video hover to top 10
    now = datetime.now(timezone.utc)
    month_str = now.strftime("%Y-%m")
    
    for i, user_stats in enumerate(top_10, start=1):
        legendary_badge = f"🏆 Top {i} - {month_str}"
        
        await db.user_stats.update_one(
            {"user_id": user_stats["user_id"]},
            {
                "$addToSet": {"legendary_achievements": legendary_badge},
                "$set": {"has_video_hover": True}
            }
        )
        
        # Update main users collection
        await db.users.update_one(
            {"id": user_stats["user_id"]},
            {"$set": {"has_video_hover": True}}
        )
    
    # Save leaderboard snapshot
    leaderboard = MonthlyLeaderboard(
        month=month_str,
        top_users=[
            {
                "user_id": stats["user_id"],
                "username": stats["username"],
                "rp": stats["monthly_rp"],
                "rank": i
            }
            for i, stats in enumerate(top_10, start=1)
        ]
    )
    await db.monthly_leaderboards.insert_one(leaderboard.dict())
    
    # Reset all monthly RP
    await db.user_stats.update_many(
        {},
        {
            "$set": {
                "monthly_rp": 0,
                "monthly_rank": None,
                "last_reset_date": now.isoformat()
            }
        }
    )
    
    return {"status": "reset_complete", "month": month_str, "top_10_awarded": len(top_10)}


@router.get("/achievements", response_model=List[Achievement])
async def get_achievements():
    """Get all available achievements"""
    db = await get_database()
    
    achievements = await db.achievements.find().to_list(length=100)
    return [Achievement(**a) for a in achievements]
