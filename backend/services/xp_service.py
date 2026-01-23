"""
GHOST PROTOCOL - XP Award Service
==================================
High-level functions for awarding XP, updating trust, and managing levels.
Integrates with database and applies all anti-abuse protections.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Tuple, Any
from database import get_database

from services.leveling_system import (
    GhostConfig,
    ActionType,
    UserClass,
    UserHierarchy,
    XP_REWARDS,
    TRUST_REWARDS,
    TRUST_PENALTIES,
    SOCIAL_ACTIONS,
    calculate_level_from_xp,
    calculate_xp_progress,
    get_hierarchy,
    calculate_trust_change,
    calculate_trust_decay,
    get_trust_tier,
    calculate_rp_cap,
    calculate_vote_weight,
    check_rate_limit,
    check_daily_cap,
    apply_diminishing_returns,
    can_select_class,
    get_class_bonuses,
    generate_level_up_reward,
    calculate_radar_stats,
)


async def award_xp(
    user_id: str,
    action_type: str,
    custom_amount: Optional[int] = None,
    metadata: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Award XP to a user with full anti-abuse protection.
    
    Returns:
    {
        "success": bool,
        "xp_awarded": int,
        "new_total_xp": int,
        "new_level": int,
        "level_up": bool,
        "level_up_reward": dict or None,
        "reason": str or None,
        "daily_remaining": int or None
    }
    """
    db = await get_database()
    
    # Get user
    user = await db.users.find_one({"id": user_id})
    if not user:
        return {"success": False, "reason": "user_not_found", "xp_awarded": 0}
    
    # Parse action type
    try:
        action = ActionType(action_type)
    except ValueError:
        return {"success": False, "reason": "invalid_action_type", "xp_awarded": 0}
    
    # Get base XP
    base_xp = custom_amount if custom_amount else XP_REWARDS.get(action, 0)
    if base_xp == 0:
        return {"success": False, "reason": "no_xp_reward", "xp_awarded": 0}
    
    # Check rate limit
    last_xp_time = user.get("last_xp_gain")
    if last_xp_time and isinstance(last_xp_time, str):
        last_xp_time = datetime.fromisoformat(last_xp_time)
    
    is_allowed, reason = check_rate_limit(last_xp_time, action)
    if not is_allowed:
        return {"success": False, "reason": reason, "xp_awarded": 0}
    
    # Check and reset daily cap if needed
    now = datetime.now(timezone.utc)
    daily_reset = user.get("daily_xp_reset_date")
    if daily_reset:
        if isinstance(daily_reset, str):
            daily_reset = datetime.fromisoformat(daily_reset)
        if daily_reset.date() < now.date():
            # Reset daily counters
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"daily_xp_earned": 0, "daily_xp_reset_date": now.isoformat()}}
            )
            user["daily_xp_earned"] = 0
    
    daily_xp = user.get("daily_xp_earned", 0)
    
    # Apply daily cap for social actions
    actual_xp, daily_remaining = check_daily_cap(daily_xp, action, base_xp)
    
    if actual_xp == 0 and action in SOCIAL_ACTIONS:
        return {
            "success": False, 
            "reason": "daily_cap_reached", 
            "xp_awarded": 0,
            "daily_remaining": 0
        }
    
    # Apply diminishing returns (get action count for today)
    user_stats = await db.user_stats.find_one({"user_id": user_id})
    action_counts = user_stats.get("action_counts_today", {}) if user_stats else {}
    action_count = action_counts.get(action_type, 0) + 1
    
    final_xp = apply_diminishing_returns(action_count, actual_xp)
    
    # Apply class bonus if applicable
    class_type = user.get("class_type")
    if class_type:
        try:
            user_class = UserClass(class_type)
            bonuses = get_class_bonuses(user_class)
            for perk in bonuses.get("perks", []):
                if perk.get("type") == "xp_multiplier" and perk.get("action") == action_type:
                    final_xp = int(final_xp * perk.get("value", 1.0))
        except ValueError:
            pass
    
    # Calculate new totals
    current_xp = user.get("xp_total", user.get("experience", 0))
    new_xp = current_xp + final_xp
    
    old_level = calculate_level_from_xp(current_xp)
    new_level = calculate_level_from_xp(new_xp)
    level_up = new_level > old_level
    
    # Get hierarchy
    hierarchy = get_hierarchy(new_level).value
    
    # Prepare update
    update_dict = {
        "xp_total": new_xp,
        "experience": new_xp,  # Keep legacy field synced
        "level": new_level,
        "hierarchy": hierarchy,
        "last_xp_gain": now.isoformat(),
        "last_activity_date": now.isoformat(),
    }
    
    if action in SOCIAL_ACTIONS:
        update_dict["daily_xp_earned"] = daily_xp + final_xp
    
    # Update streak
    last_activity = user.get("last_activity_date")
    if last_activity:
        if isinstance(last_activity, str):
            last_activity = datetime.fromisoformat(last_activity)
        days_diff = (now.date() - last_activity.date()).days
        if days_diff == 1:
            update_dict["current_streak"] = user.get("current_streak", 0) + 1
            if update_dict["current_streak"] > user.get("longest_streak", 0):
                update_dict["longest_streak"] = update_dict["current_streak"]
        elif days_diff > 1:
            update_dict["current_streak"] = 1
    else:
        update_dict["current_streak"] = 1
    
    # Update user
    await db.users.update_one({"id": user_id}, {"$set": update_dict})
    
    # Update user_stats
    stats_update = {
        "total_xp": new_xp,
        "current_level": new_level,
        "hierarchy": hierarchy,
        "last_activity_date": now.isoformat(),
        f"action_counts_today.{action_type}": action_count,
        "updated_at": now.isoformat(),
    }
    
    # Calculate new XP progress
    _, xp_to_next, progress = calculate_xp_progress(new_xp)
    stats_update["xp_to_next_level"] = xp_to_next
    stats_update["xp_progress_percent"] = progress
    
    # Calculate vote weight
    trust_score = user.get("trust_score", 500.0)
    user_class = UserClass(class_type) if class_type else UserClass.NONE
    vote_weight = calculate_vote_weight(new_level, trust_score, user_class)
    stats_update["vote_weight"] = vote_weight
    
    # Update privileges based on hierarchy
    if hierarchy == "operator":
        stats_update["has_hidden_armory_access"] = True
    if hierarchy == "monarch":
        stats_update["has_direct_line_access"] = True
    
    await db.user_stats.update_one(
        {"user_id": user_id},
        {"$set": stats_update},
        upsert=True
    )
    
    # Log XP transaction
    await db.xp_transactions.insert_one({
        "user_id": user_id,
        "point_type": "xp",
        "amount": final_xp,
        "action": action_type,
        "description": f"XP from {action_type}",
        "metadata": metadata,
        "created_at": now.isoformat()
    })
    
    # Generate level up reward if applicable
    level_up_reward = None
    if level_up:
        level_up_reward = generate_level_up_reward(new_level, user_class)
        
        # Award RP from level up
        for reward in level_up_reward.get("rewards", []):
            if reward.get("type") == "rp":
                await award_rp(user_id, reward["amount"], "level_up")
    
    return {
        "success": True,
        "xp_awarded": final_xp,
        "new_total_xp": new_xp,
        "new_level": new_level,
        "level_up": level_up,
        "level_up_reward": level_up_reward,
        "reason": None,
        "daily_remaining": daily_remaining if action in SOCIAL_ACTIONS else None
    }


async def update_trust_score(
    user_id: str,
    action: str,
    is_penalty: bool = False,
    custom_amount: Optional[float] = None
) -> Dict[str, Any]:
    """
    Update user's trust score.
    
    Returns:
    {
        "success": bool,
        "old_trust": float,
        "new_trust": float,
        "change": float,
        "new_tier": str,
        "halo_color": str
    }
    """
    db = await get_database()
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        return {"success": False, "reason": "user_not_found"}
    
    current_trust = user.get("trust_score", 500.0)
    
    # Get change amount
    if custom_amount is not None:
        change = custom_amount
    elif is_penalty:
        change = TRUST_PENALTIES.get(action, -10.0)
    else:
        change = TRUST_REWARDS.get(action, 5.0)
    
    # Calculate new trust
    new_trust = calculate_trust_change(current_trust, change, is_penalty)
    
    # Get tier
    tier, halo_color = get_trust_tier(new_trust)
    
    # Update user
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "trust_score": new_trust,
            "stats_trust": min(100, int(new_trust / 10))
        }}
    )
    
    # Update user_stats
    await db.user_stats.update_one(
        {"user_id": user_id},
        {"$set": {
            "trust_score": new_trust,
            "trust_tier": tier,
            "trust_halo_color": halo_color,
            "stats_trust": min(100, int(new_trust / 10)),
            "updated_at": now.isoformat()
        }},
        upsert=True
    )
    
    # Log transaction
    await db.trust_transactions.insert_one({
        "user_id": user_id,
        "action": action,
        "old_trust": current_trust,
        "new_trust": new_trust,
        "change": change,
        "is_penalty": is_penalty,
        "created_at": now.isoformat()
    })
    
    return {
        "success": True,
        "old_trust": current_trust,
        "new_trust": new_trust,
        "change": new_trust - current_trust,
        "new_tier": tier,
        "halo_color": halo_color
    }


async def award_rp(
    user_id: str,
    amount: int,
    action: str,
    metadata: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Award Resource Points to a user.
    Respects RP cap based on level and trust.
    """
    db = await get_database()
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        return {"success": False, "reason": "user_not_found"}
    
    current_rp = user.get("rp_balance", 0)
    level = user.get("level", 1)
    trust = user.get("trust_score", 500.0)
    
    # Calculate cap
    rp_cap = calculate_rp_cap(level, trust)
    
    # Apply cap
    new_rp = min(current_rp + amount, rp_cap)
    actual_awarded = new_rp - current_rp
    
    # Update
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"rp_balance": new_rp}}
    )
    
    await db.user_stats.update_one(
        {"user_id": user_id},
        {"$set": {"rp_balance": new_rp, "rp_cap": rp_cap}},
        upsert=True
    )
    
    if actual_awarded > 0:
        await db.xp_transactions.insert_one({
            "user_id": user_id,
            "point_type": "rp",
            "amount": actual_awarded,
            "action": action,
            "description": f"RP from {action}",
            "metadata": metadata,
            "created_at": now.isoformat()
        })
    
    return {
        "success": True,
        "rp_awarded": actual_awarded,
        "new_balance": new_rp,
        "rp_cap": rp_cap,
        "capped": actual_awarded < amount
    }


async def spend_rp(
    user_id: str,
    amount: int,
    action: str
) -> Dict[str, Any]:
    """
    Spend Resource Points (for voting, etc).
    """
    db = await get_database()
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        return {"success": False, "reason": "user_not_found"}
    
    current_rp = user.get("rp_balance", 0)
    
    if current_rp < amount:
        return {"success": False, "reason": "insufficient_rp", "current": current_rp, "required": amount}
    
    new_rp = current_rp - amount
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"rp_balance": new_rp}}
    )
    
    await db.user_stats.update_one(
        {"user_id": user_id},
        {"$set": {"rp_balance": new_rp}},
        upsert=True
    )
    
    return {"success": True, "rp_spent": amount, "new_balance": new_rp}


async def select_class(
    user_id: str,
    new_class: str
) -> Dict[str, Any]:
    """
    Select or change user class (Neural Pathway).
    """
    db = await get_database()
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        return {"success": False, "reason": "user_not_found"}
    
    level = user.get("level", 1)
    current_class_str = user.get("class_type")
    class_changed_at = user.get("class_selected_at")
    
    if class_changed_at and isinstance(class_changed_at, str):
        class_changed_at = datetime.fromisoformat(class_changed_at)
    
    current_class = UserClass(current_class_str) if current_class_str else UserClass.NONE
    
    # Validate new class
    try:
        target_class = UserClass(new_class)
    except ValueError:
        return {"success": False, "reason": "invalid_class"}
    
    # Check if can change
    can_change, reason = can_select_class(level, current_class, class_changed_at)
    if not can_change:
        return {"success": False, "reason": reason}
    
    # Get bonuses for display
    bonuses = get_class_bonuses(target_class)
    
    now = datetime.now(timezone.utc)
    
    # Update user
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "class_type": target_class.value,
            "class_selected_at": now.isoformat()
        }}
    )
    
    # Update stats
    await db.user_stats.update_one(
        {"user_id": user_id},
        {"$set": {
            "class_type": target_class.value,
            "class_icon": bonuses["icon"],
            "class_name": bonuses["name"],
            "class_selected_at": now.isoformat()
        }},
        upsert=True
    )
    
    return {
        "success": True,
        "new_class": target_class.value,
        "bonuses": bonuses,
        "can_change_again_at": (now + timedelta(days=GhostConfig.CLASS_CHANGE_COOLDOWN_DAYS)).isoformat()
    }


async def run_trust_decay_job():
    """
    Weekly job to decay trust scores for inactive users.
    Should be run by a scheduler (cron/celery).
    """
    db = await get_database()
    
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    
    # Find inactive users
    inactive_users = await db.users.find({
        "last_activity_date": {"$lt": week_ago.isoformat()},
        "trust_score": {"$ne": 500.0}  # Not already neutral
    }).to_list(length=10000)
    
    updated_count = 0
    
    for user in inactive_users:
        last_activity = user.get("last_activity_date")
        if isinstance(last_activity, str):
            last_activity = datetime.fromisoformat(last_activity)
        
        days_inactive = (now - last_activity).days if last_activity else 30
        
        current_trust = user.get("trust_score", 500.0)
        new_trust = calculate_trust_decay(current_trust, days_inactive)
        
        if new_trust != current_trust:
            tier, halo_color = get_trust_tier(new_trust)
            
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"trust_score": new_trust}}
            )
            
            await db.user_stats.update_one(
                {"user_id": user["id"]},
                {"$set": {
                    "trust_score": new_trust,
                    "trust_tier": tier,
                    "trust_halo_color": halo_color
                }}
            )
            
            updated_count += 1
    
    return {"updated": updated_count, "processed": len(inactive_users)}


async def get_user_ghost_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get full Ghost Protocol profile for a user.
    """
    db = await get_database()
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        return None
    
    stats = await db.user_stats.find_one({"user_id": user_id})
    
    # Calculate all metrics
    xp = user.get("xp_total", user.get("experience", 0))
    level = calculate_level_from_xp(xp)
    _, xp_to_next, progress = calculate_xp_progress(xp)
    hierarchy = get_hierarchy(level)
    trust = user.get("trust_score", 500.0)
    trust_tier, halo_color = get_trust_tier(trust)
    
    class_type_str = user.get("class_type")
    user_class = UserClass(class_type_str) if class_type_str else UserClass.NONE
    class_bonuses = get_class_bonuses(user_class)
    
    rp_cap = calculate_rp_cap(level, trust)
    vote_weight = calculate_vote_weight(level, trust, user_class)
    
    return {
        "user_id": user_id,
        "username": user.get("username"),
        "avatar_url": user.get("avatar_url"),
        
        # Core metrics
        "xp_total": xp,
        "level": level,
        "xp_to_next_level": xp_to_next,
        "xp_progress_percent": progress,
        
        "trust_score": trust,
        "trust_tier": trust_tier,
        "trust_halo_color": halo_color,
        
        "rp_balance": user.get("rp_balance", 0),
        "rp_cap": rp_cap,
        
        # Class & Hierarchy
        "class_type": user_class.value,
        "class_icon": class_bonuses["icon"],
        "class_name": class_bonuses["name"],
        "class_name_ru": class_bonuses["name_ru"],
        "hierarchy": hierarchy.value,
        
        # Calculated
        "vote_weight": vote_weight,
        
        # Radar stats
        "stats": {
            "speed": user.get("stats_speed", 50),
            "trust": min(100, int(trust / 10)),
            "comm": user.get("stats_comm", 50),
            "tech": user.get("stats_tech", 50)
        },
        
        # Privileges
        "has_hidden_armory_access": hierarchy in [UserHierarchy.OPERATOR, UserHierarchy.MONARCH],
        "has_direct_line_access": hierarchy == UserHierarchy.MONARCH,
        "has_video_hover": user.get("has_video_hover", False),
        
        # Activity
        "current_streak": user.get("current_streak", 0),
        "longest_streak": user.get("longest_streak", 0),
        
        # Verifications
        "phone_verified": user.get("phone_verified", False),
        "id_verified": user.get("id_verified", False),
    }
