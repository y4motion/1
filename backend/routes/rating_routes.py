from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from models.rating import UserStats, Achievement, XPTransaction, MonthlyLeaderboard
from models.user import User
from utils.auth_utils import get_current_user
from utils.cache import cache_response, invalidate_cache
from database import get_database
from datetime import datetime, timezone

# Import Ghost Protocol services
from services.leveling_system import (
    calculate_level_from_xp,
    calculate_xp_progress,
    get_hierarchy,
    get_trust_tier,
    calculate_rp_cap,
    calculate_vote_weight,
    get_class_bonuses,
    can_select_class,
    UserClass,
    UserHierarchy,
    ActionType,
)
from services.xp_service import (
    award_xp,
    update_trust_score,
    award_rp,
    spend_rp,
    select_class,
    get_user_ghost_profile,
)

router = APIRouter(prefix="/rating", tags=["rating"])


# Request/Response models
class AwardXPRequest(BaseModel):
    action_type: str
    custom_amount: Optional[int] = None

class UpdateTrustRequest(BaseModel):
    action: str
    is_penalty: bool = False
    custom_amount: Optional[float] = None

class SelectClassRequest(BaseModel):
    class_type: str  # architect, broker, observer


# Legacy compatibility functions
def calculate_level(xp: int) -> int:
    """Calculate level from XP - now uses Ghost Protocol formula"""
    return calculate_level_from_xp(xp)


def xp_to_next_level(current_xp: int, current_level: int) -> int:
    """Calculate XP needed for next level"""
    _, xp_needed, _ = calculate_xp_progress(current_xp)
    return xp_needed


@router.get("/me", response_model=UserStats)
async def get_my_stats(
    current_user: User = Depends(get_current_user)
):
    """Get current user's stats with Ghost Protocol metrics"""
    db = await get_database()
    
    stats = await db.user_stats.find_one({"user_id": current_user.id})
    
    # Get Ghost Protocol profile
    xp = current_user.xp_total if hasattr(current_user, 'xp_total') else current_user.experience
    level = calculate_level_from_xp(xp)
    _, xp_to_next, progress = calculate_xp_progress(xp)
    hierarchy = get_hierarchy(level)
    trust = current_user.trust_score if hasattr(current_user, 'trust_score') else 500.0
    trust_tier, halo_color = get_trust_tier(trust)
    
    class_type_str = current_user.class_type if hasattr(current_user, 'class_type') else None
    user_class = UserClass(class_type_str) if class_type_str else UserClass.NONE
    class_bonuses = get_class_bonuses(user_class)
    
    rp_cap = calculate_rp_cap(level, trust)
    vote_weight = calculate_vote_weight(level, trust, user_class)
    
    if not stats:
        # Create initial stats with Ghost Protocol fields
        stats = UserStats(
            user_id=current_user.id,
            username=current_user.username,
            user_avatar=current_user.avatar_url,
            total_xp=xp,
            current_level=level,
            xp_to_next_level=xp_to_next,
            xp_progress_percent=progress,
            trust_score=trust,
            trust_tier=trust_tier,
            trust_halo_color=halo_color,
            rp_balance=current_user.rp_balance if hasattr(current_user, 'rp_balance') else 0,
            rp_cap=rp_cap,
            monthly_rp=current_user.monthly_rp,
            class_type=user_class.value if user_class != UserClass.NONE else None,
            class_icon=class_bonuses["icon"],
            class_name=class_bonuses["name"],
            hierarchy=hierarchy.value,
            vote_weight=vote_weight,
            current_streak=current_user.current_streak,
            has_hidden_armory_access=hierarchy in [UserHierarchy.OPERATOR, UserHierarchy.MONARCH],
            has_direct_line_access=hierarchy == UserHierarchy.MONARCH,
        )
        await db.user_stats.insert_one(stats.model_dump())
    else:
        # Update with fresh calculations
        stats = UserStats(**stats)
        stats.total_xp = xp
        stats.current_level = level
        stats.xp_to_next_level = xp_to_next
        stats.xp_progress_percent = progress
        stats.trust_score = trust
        stats.trust_tier = trust_tier
        stats.trust_halo_color = halo_color
        stats.hierarchy = hierarchy.value
        stats.vote_weight = vote_weight
        stats.rp_cap = rp_cap
        stats.class_icon = class_bonuses["icon"]
        stats.class_name = class_bonuses["name"]
        stats.has_hidden_armory_access = hierarchy in [UserHierarchy.OPERATOR, UserHierarchy.MONARCH]
        stats.has_direct_line_access = hierarchy == UserHierarchy.MONARCH
    
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
@cache_response(ttl_seconds=60)  # 1 minute cache
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
async def award_xp_endpoint(
    request: AwardXPRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Award XP to current user using Ghost Protocol system.
    Includes anti-abuse protection, rate limiting, and daily caps.
    """
    result = await award_xp(
        user_id=current_user.id,
        action_type=request.action_type,
        custom_amount=request.custom_amount
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["reason"])
    
    return result


@router.post("/admin/award-xp")
async def admin_award_xp(
    user_id: str,
    amount: int,
    action: str,
    description: str,
    current_user: User = Depends(get_current_user)
):
    """Award XP to user (admin only - bypasses anti-abuse)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await award_xp(
        user_id=user_id,
        action_type=action,
        custom_amount=amount,
        metadata={"description": description, "admin": current_user.id}
    )
    
    return result


@router.post("/update-trust")
async def update_trust_endpoint(
    request: UpdateTrustRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Update trust score for current user.
    Used after completing transactions, receiving reviews, etc.
    """
    result = await update_trust_score(
        user_id=current_user.id,
        action=request.action,
        is_penalty=request.is_penalty,
        custom_amount=request.custom_amount
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("reason"))
    
    return result


@router.post("/select-class")
async def select_class_endpoint(
    request: SelectClassRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Select or change Neural Pathway (class).
    Requires Level 10+, can change once every 30 days.
    """
    result = await select_class(
        user_id=current_user.id,
        new_class=request.class_type
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["reason"])
    
    return result


@router.get("/ghost-profile/{user_id}")
async def get_ghost_profile(user_id: str):
    """Get full Ghost Protocol profile for a user"""
    profile = await get_user_ghost_profile(user_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    return profile


@router.get("/ghost-profile")
async def get_my_ghost_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user's Ghost Protocol profile"""
    profile = await get_user_ghost_profile(current_user.id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile


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
