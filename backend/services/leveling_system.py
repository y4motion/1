"""
GHOST PROTOCOL - Mathematical Core
===================================
Leveling System with Anti-Abuse Protection

Formulas:
- XP Curve: XP_Required = BASE * (Level ^ 1.5)
- Trust Decay: -1% weekly for inactive users (toward 500 neutral)
- RP Cap: Max_RP = 100 + (Level * 25) + (TrustScore / 10)
- Vote Weight: 1.0 + (Level / 20) + (TrustScore / 500) + ClassBonus
"""

import math
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Tuple, Any
from enum import Enum
from pydantic import BaseModel


# ============================================
# CONSTANTS & CONFIGURATION
# ============================================

class GhostConfig:
    """System-wide configuration constants"""
    
    # XP Curve
    XP_BASE = 100  # Base XP for level 2
    XP_EXPONENT = 1.5  # Exponential growth factor
    MAX_LEVEL = 100
    
    # Trust Score
    TRUST_DEFAULT = 500.0
    TRUST_MIN = 0.0
    TRUST_MAX = 1000.0
    TRUST_DECAY_RATE = 0.01  # 1% per week
    TRUST_DECAY_TARGET = 500.0  # Neutral point
    TRUST_PENALTY_MULTIPLIER = 2.0  # Penalties hit 2x harder
    
    # RP (Resource Points)
    RP_BASE_CAP = 100
    RP_LEVEL_MULTIPLIER = 25
    RP_TRUST_DIVISOR = 10
    
    # Anti-Abuse
    XP_COOLDOWN_SECONDS = 60  # 1 minute between same actions
    DAILY_XP_CAP_SOCIAL = 1000  # Max XP from likes/comments per day
    DAILY_XP_CAP_COMMERCE = None  # No limit for purchases/deals
    
    # Class Change
    CLASS_CHANGE_COOLDOWN_DAYS = 30
    CLASS_UNLOCK_LEVEL = 10


class UserHierarchy(str, Enum):
    """User hierarchy based on level"""
    GHOST = "ghost"        # 0-9
    PHANTOM = "phantom"    # 10-39
    OPERATOR = "operator"  # 40-79
    MONARCH = "monarch"    # 80+


class UserClass(str, Enum):
    """Neural Pathway specializations"""
    NONE = "none"
    ARCHITECT = "architect"  # PC Builder specialist
    BROKER = "broker"        # Swap/Trade specialist
    OBSERVER = "observer"    # Review specialist


class ActionType(str, Enum):
    """XP-granting action types with categories"""
    # Social (capped daily)
    LIKE_GIVEN = "like_given"
    LIKE_RECEIVED = "like_received"
    COMMENT = "comment"
    POST = "post"
    ARTICLE = "article"
    VOTE_CAST = "vote_cast"
    
    # Commerce (uncapped)
    PURCHASE = "purchase"
    SALE = "sale"
    SWAP_COMPLETED = "swap_completed"
    REVIEW_WRITTEN = "review_written"
    PC_BUILD_SHARED = "pc_build_shared"
    
    # System
    DAILY_LOGIN = "daily_login"
    STREAK_BONUS = "streak_bonus"
    ACHIEVEMENT = "achievement"
    LEVEL_UP = "level_up"


# XP rewards per action type
XP_REWARDS: Dict[ActionType, int] = {
    ActionType.LIKE_GIVEN: 2,
    ActionType.LIKE_RECEIVED: 5,
    ActionType.COMMENT: 10,
    ActionType.POST: 25,
    ActionType.ARTICLE: 100,
    ActionType.VOTE_CAST: 5,
    ActionType.PURCHASE: 50,
    ActionType.SALE: 75,
    ActionType.SWAP_COMPLETED: 100,
    ActionType.REVIEW_WRITTEN: 30,
    ActionType.PC_BUILD_SHARED: 40,
    ActionType.DAILY_LOGIN: 15,
    ActionType.STREAK_BONUS: 25,  # Per streak day
    ActionType.ACHIEVEMENT: 0,  # Variable
    ActionType.LEVEL_UP: 0,  # Milestone bonus
}

# Trust Score changes
TRUST_REWARDS: Dict[str, float] = {
    "purchase_completed": 5.0,
    "sale_completed": 10.0,
    "swap_completed": 15.0,
    "review_helpful": 3.0,
    "verified_phone": 50.0,
    "verified_id": 100.0,
}

TRUST_PENALTIES: Dict[str, float] = {
    "deal_cancelled": -20.0,
    "dispute_lost": -50.0,
    "report_received": -10.0,
    "spam_detected": -25.0,
    "scam_confirmed": -200.0,
    "temporary_ban": -100.0,
}

# Social action types (capped daily)
SOCIAL_ACTIONS = {
    ActionType.LIKE_GIVEN, ActionType.LIKE_RECEIVED, 
    ActionType.COMMENT, ActionType.POST, ActionType.VOTE_CAST
}


# ============================================
# XP & LEVELING CALCULATIONS
# ============================================

def calculate_xp_for_level(level: int) -> int:
    """
    Calculate total XP required to reach a specific level.
    Formula: XP = BASE * (Level ^ EXPONENT)
    
    Level 1: 0 XP (start)
    Level 2: 100 XP
    Level 10: ~3,162 XP
    Level 40: ~25,298 XP
    Level 80: ~71,554 XP
    """
    if level <= 1:
        return 0
    return int(GhostConfig.XP_BASE * (level ** GhostConfig.XP_EXPONENT))


def calculate_level_from_xp(total_xp: int) -> int:
    """
    Calculate level from total XP using inverse of the curve.
    """
    if total_xp <= 0:
        return 1
    
    # Binary search for efficiency
    low, high = 1, GhostConfig.MAX_LEVEL
    while low < high:
        mid = (low + high + 1) // 2
        if calculate_xp_for_level(mid) <= total_xp:
            low = mid
        else:
            high = mid - 1
    
    return min(low, GhostConfig.MAX_LEVEL)


def calculate_xp_progress(total_xp: int) -> Tuple[int, int, float]:
    """
    Calculate XP progress within current level.
    Returns: (current_level, xp_to_next, progress_percentage)
    """
    current_level = calculate_level_from_xp(total_xp)
    
    if current_level >= GhostConfig.MAX_LEVEL:
        return current_level, 0, 100.0
    
    xp_current_level = calculate_xp_for_level(current_level)
    xp_next_level = calculate_xp_for_level(current_level + 1)
    
    xp_in_level = total_xp - xp_current_level
    xp_needed = xp_next_level - xp_current_level
    
    progress = (xp_in_level / xp_needed) * 100 if xp_needed > 0 else 100
    
    return current_level, xp_needed - xp_in_level, round(progress, 2)


def get_hierarchy(level: int) -> UserHierarchy:
    """Determine user hierarchy based on level."""
    if level < 10:
        return UserHierarchy.GHOST
    elif level < 40:
        return UserHierarchy.PHANTOM
    elif level < 80:
        return UserHierarchy.OPERATOR
    else:
        return UserHierarchy.MONARCH


# ============================================
# TRUST SCORE CALCULATIONS
# ============================================

def calculate_trust_change(current_trust: float, change: float, is_penalty: bool = False) -> float:
    """
    Calculate new trust score with logarithmic growth and penalty multiplier.
    
    Growth: Logarithmic (harder to gain at high levels)
    Penalty: Linear with 2x multiplier (punishments hit hard)
    """
    if is_penalty:
        # Penalties are immediate and multiplied
        new_trust = current_trust + (change * GhostConfig.TRUST_PENALTY_MULTIPLIER)
    else:
        # Rewards use logarithmic scaling
        # The higher your trust, the less you gain from the same action
        if change > 0:
            # Scale factor: 1.0 at trust=0, 0.5 at trust=500, 0.25 at trust=750
            scale_factor = 1.0 / (1.0 + (current_trust / 500))
            new_trust = current_trust + (change * scale_factor)
        else:
            new_trust = current_trust + change
    
    # Clamp to valid range
    return max(GhostConfig.TRUST_MIN, min(GhostConfig.TRUST_MAX, new_trust))


def calculate_trust_decay(current_trust: float, days_inactive: int) -> float:
    """
    Calculate trust decay for inactive users.
    Trust decays toward neutral (500) at 1% per week.
    """
    if days_inactive < 7:
        return current_trust
    
    weeks_inactive = days_inactive // 7
    decay_per_week = GhostConfig.TRUST_DECAY_RATE
    target = GhostConfig.TRUST_DECAY_TARGET
    
    # Move toward neutral
    if current_trust > target:
        # Decay down
        decay_amount = (current_trust - target) * decay_per_week * weeks_inactive
        return max(target, current_trust - decay_amount)
    elif current_trust < target:
        # Recover up (slower)
        recovery_amount = (target - current_trust) * decay_per_week * 0.5 * weeks_inactive
        return min(target, current_trust + recovery_amount)
    
    return current_trust


def get_trust_tier(trust_score: float) -> Tuple[str, str]:
    """
    Get trust tier name and halo color.
    Returns: (tier_name, hex_color)
    """
    if trust_score >= 800:
        return "verified", "#00FFD4"  # Cyan
    elif trust_score >= 500:
        return "neutral", "rgba(255,255,255,0.4)"  # Ghost White
    elif trust_score >= 400:
        return "warning", "#FF9F43"  # Amber
    else:
        return "danger", "#FF4444"  # Red


# ============================================
# RP (RESOURCE POINTS) CALCULATIONS
# ============================================

def calculate_rp_cap(level: int, trust_score: float) -> int:
    """
    Calculate maximum RP a user can hold.
    Formula: Max_RP = BASE + (Level * 25) + (TrustScore / 10)
    
    This means a toxic high-level player has less influence
    than an honest mid-level player.
    """
    base = GhostConfig.RP_BASE_CAP
    level_bonus = level * GhostConfig.RP_LEVEL_MULTIPLIER
    trust_bonus = int(trust_score / GhostConfig.RP_TRUST_DIVISOR)
    
    return base + level_bonus + trust_bonus


def calculate_vote_weight(level: int, trust_score: float, user_class: UserClass) -> float:
    """
    Calculate vote weight for proposals/reviews.
    Base: 1.0
    Level bonus: +0.05 per level (max +5.0 at level 100)
    Trust bonus: +0.2 per 100 trust above 500
    Class bonus: Observer gets +0.5
    Hierarchy bonus: Operator +0.5, Monarch +1.0
    """
    base = 1.0
    
    # Level contribution (0.05 per level)
    level_bonus = level * 0.05
    
    # Trust contribution (only above neutral)
    trust_bonus = max(0, (trust_score - 500) / 500) * 1.0
    
    # Class bonus
    class_bonus = 0.5 if user_class == UserClass.OBSERVER else 0.0
    
    # Hierarchy bonus
    hierarchy = get_hierarchy(level)
    hierarchy_bonus = {
        UserHierarchy.GHOST: 0.0,
        UserHierarchy.PHANTOM: 0.0,
        UserHierarchy.OPERATOR: 0.5,
        UserHierarchy.MONARCH: 1.0,
    }.get(hierarchy, 0.0)
    
    return round(base + level_bonus + trust_bonus + class_bonus + hierarchy_bonus, 2)


# ============================================
# ANTI-ABUSE SYSTEM
# ============================================

class XPAwardResult(BaseModel):
    """Result of XP award attempt"""
    success: bool
    xp_awarded: int
    new_total_xp: int
    new_level: int
    level_up: bool
    reason: Optional[str] = None
    daily_remaining: Optional[int] = None


def check_rate_limit(
    last_action_time: Optional[datetime],
    action_type: ActionType,
    cooldown_seconds: int = None
) -> Tuple[bool, str]:
    """
    Check if action is rate-limited.
    Returns: (is_allowed, reason)
    """
    if cooldown_seconds is None:
        cooldown_seconds = GhostConfig.XP_COOLDOWN_SECONDS
    
    if last_action_time is None:
        return True, "ok"
    
    now = datetime.now(timezone.utc)
    elapsed = (now - last_action_time).total_seconds()
    
    if elapsed < cooldown_seconds:
        remaining = int(cooldown_seconds - elapsed)
        return False, f"rate_limited:{remaining}s"
    
    return True, "ok"


def check_daily_cap(
    daily_xp_earned: int,
    action_type: ActionType,
    xp_to_add: int
) -> Tuple[int, int]:
    """
    Check and apply daily cap for social actions.
    Returns: (actual_xp_to_award, remaining_daily_cap)
    """
    if action_type not in SOCIAL_ACTIONS:
        # Commerce/system actions are uncapped
        return xp_to_add, -1
    
    cap = GhostConfig.DAILY_XP_CAP_SOCIAL
    remaining = cap - daily_xp_earned
    
    if remaining <= 0:
        return 0, 0
    
    actual_xp = min(xp_to_add, remaining)
    return actual_xp, remaining - actual_xp


def apply_diminishing_returns(
    action_count_today: int,
    base_xp: int
) -> int:
    """
    Apply diminishing returns for repeated actions.
    1st action: 100% XP
    10th action: ~50% XP
    50th action: ~20% XP
    100th action: ~10% XP
    """
    if action_count_today <= 1:
        return base_xp
    
    # Logarithmic decay: XP * (1 / log2(count + 1))
    multiplier = 1.0 / math.log2(action_count_today + 1)
    return max(1, int(base_xp * multiplier))


# ============================================
# CLASS SYSTEM
# ============================================

def can_select_class(level: int, current_class: UserClass, class_changed_at: Optional[datetime]) -> Tuple[bool, str]:
    """
    Check if user can select/change class.
    """
    if level < GhostConfig.CLASS_UNLOCK_LEVEL:
        return False, f"level_required:{GhostConfig.CLASS_UNLOCK_LEVEL}"
    
    if current_class != UserClass.NONE and class_changed_at:
        days_since_change = (datetime.now(timezone.utc) - class_changed_at).days
        if days_since_change < GhostConfig.CLASS_CHANGE_COOLDOWN_DAYS:
            remaining = GhostConfig.CLASS_CHANGE_COOLDOWN_DAYS - days_since_change
            return False, f"cooldown:{remaining}d"
    
    return True, "ok"


def get_class_bonuses(user_class: UserClass) -> Dict[str, Any]:
    """
    Get bonuses for a specific class.
    """
    bonuses = {
        UserClass.NONE: {
            "icon": "○",
            "name": "Unspecialized",
            "name_ru": "Без специализации",
            "perks": []
        },
        UserClass.ARCHITECT: {
            "icon": "⬡",
            "name": "Architect",
            "name_ru": "Архитектор",
            "perks": [
                {"type": "xp_multiplier", "action": "pc_build_shared", "value": 1.25},
                {"type": "feature_unlock", "feature": "advanced_pc_specs", "value": True},
            ]
        },
        UserClass.BROKER: {
            "icon": "◇",
            "name": "Broker",
            "name_ru": "Брокер",
            "perks": [
                {"type": "fee_reduction", "service": "swap", "value": 0.15},
                {"type": "limit_increase", "service": "swap_listings", "value": 2.0},
            ]
        },
        UserClass.OBSERVER: {
            "icon": "◉",
            "name": "Observer",
            "name_ru": "Наблюдатель",
            "perks": [
                {"type": "rp_multiplier", "action": "review_written", "value": 1.5},
                {"type": "feature_unlock", "feature": "expert_verified_badge", "value": True},
                {"type": "vote_weight_bonus", "value": 0.5},
            ]
        }
    }
    return bonuses.get(user_class, bonuses[UserClass.NONE])


# ============================================
# LEVEL UP REWARDS (System Decryption)
# ============================================

def generate_level_up_reward(new_level: int, user_class: UserClass) -> Dict[str, Any]:
    """
    Generate reward for level up (System Decryption).
    Returns artifact/protocol based on level and RNG.
    """
    import random
    
    reward = {
        "type": "decryption",
        "level": new_level,
        "rewards": []
    }
    
    # Guaranteed RP bonus
    rp_bonus = 50 + (new_level * 5)
    reward["rewards"].append({
        "type": "rp",
        "amount": rp_bonus,
        "name": "Resource Points"
    })
    
    # Milestone rewards (every 10 levels)
    if new_level % 10 == 0:
        reward["rewards"].append({
            "type": "artifact",
            "id": f"theme_milestone_{new_level}",
            "name": f"Milestone {new_level} Theme",
            "rarity": "rare" if new_level < 50 else "epic"
        })
    
    # Random protocol (20% chance)
    if random.random() < 0.2:
        protocols = [
            {"id": "boost_24h", "name": "Visibility Boost (24h)", "duration_hours": 24},
            {"id": "discount_5", "name": "5% Discount Token", "discount_percent": 5},
            {"id": "priority_queue", "name": "Priority Support (48h)", "duration_hours": 48},
        ]
        reward["rewards"].append({
            "type": "protocol",
            **random.choice(protocols)
        })
    
    # Class-specific bonus
    if user_class == UserClass.ARCHITECT and new_level >= 20:
        reward["rewards"].append({
            "type": "blueprint",
            "id": f"blueprint_{new_level}",
            "name": "System Blueprint Fragment"
        })
    
    return reward


# ============================================
# STATS FOR RADAR CHART
# ============================================

def calculate_radar_stats(user_data: Dict) -> Dict[str, int]:
    """
    Calculate radar chart stats (0-100 scale).
    """
    stats = {
        "speed": 50,   # Transaction speed
        "trust": 50,   # Trust score / 10
        "comm": 50,    # Communication rating
        "tech": 50     # Technical knowledge
    }
    
    # Trust from trust_score
    trust_score = user_data.get("trust_score", 500)
    stats["trust"] = min(100, int(trust_score / 10))
    
    # Speed from average deal completion time (lower is better)
    # Placeholder - would need actual data
    deals_completed = user_data.get("total_deals", 0)
    if deals_completed > 0:
        stats["speed"] = min(100, 50 + deals_completed)
    
    # Comm from review ratings received
    avg_rating = user_data.get("average_rating_received", 3.0)
    stats["comm"] = min(100, int(avg_rating * 20))
    
    # Tech from PC builds, articles, etc.
    builds = user_data.get("total_builds", 0)
    articles = user_data.get("total_articles", 0)
    stats["tech"] = min(100, 40 + builds * 5 + articles * 10)
    
    return stats
