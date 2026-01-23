"""
GHOST PROTOCOL - Mathematical Core (HARDCORE Edition)
======================================================
Leveling System with Anti-Abuse Protection + Entropy + Rebirth

Key Formulas:
- XP Curve: Exponential 1-40, Logarithmic Wall 40-70, Achievement Lock 70-80
- Trust Decay: -1 point/day after 7 days inactive (toward 500)
- RP Decay: -5%/day after 7 days inactive
- Inner Circle: Top 100 Monarchs only (King of the Hill)
- Class Reboot: Cost doubles each time, Legacy Traits preserved
"""

import math
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Tuple, Any, List
from enum import Enum
from pydantic import BaseModel


# ============================================
# CONSTANTS & CONFIGURATION (HARDCORE)
# ============================================

class GhostConfig:
    """System-wide configuration constants - HARDCORE MODE"""
    
    # XP Curve - SINGULARITY
    XP_BASE = 100
    XP_EXPONENT_EARLY = 1.5      # Levels 1-40 (fast)
    XP_EXPONENT_MID = 2.0        # Levels 40-60 (grind)
    XP_EXPONENT_LATE = 2.5       # Levels 60-70 (extreme)
    XP_WALL_START = 70           # Achievement wall begins
    MAX_LEVEL = 80               # True cap (Monarch threshold)
    ABSOLUTE_MAX_LEVEL = 100     # Theoretical max with all achievements
    
    # Trust Score
    TRUST_DEFAULT = 500.0
    TRUST_MIN = 0.0
    TRUST_MAX = 1000.0
    TRUST_DECAY_RATE = 0.01      # 1% per week (legacy)
    TRUST_DAILY_DECAY = 1.0      # -1 point per day when inactive
    TRUST_DECAY_TARGET = 500.0
    TRUST_PENALTY_MULTIPLIER = 2.0
    
    # RP (Resource Points) - ENTROPY
    RP_BASE_CAP = 100
    RP_LEVEL_MULTIPLIER = 25
    RP_TRUST_DIVISOR = 10
    RP_DAILY_DECAY_PERCENT = 0.05  # -5% per day when inactive
    
    # Anti-Abuse
    XP_COOLDOWN_SECONDS = 60
    DAILY_XP_CAP_SOCIAL = 1000
    DAILY_XP_CAP_COMMERCE = None
    
    # Entropy Threshold
    ENTROPY_START_DAYS = 7       # Days before decay begins
    
    # Inner Circle - TOP 100 ONLY
    INNER_CIRCLE_MAX_SLOTS = 100
    INNER_CIRCLE_MIN_LEVEL = 80
    
    # Class System - HARDCORE
    CLASS_UNLOCK_LEVEL = 10
    CLASS_TIER_MAX = 100         # Max mastery within a class
    
    # Reboot System
    REBOOT_BASE_COST_RP = 10000  # 10k RP for first reboot
    REBOOT_COST_MULTIPLIER = 2   # Each reboot costs 2x more
    REBOOT_BURNS_ALL_RP = True   # Alternative: burn 100% RP instead of fixed cost
    MAX_LEGACY_TRAITS = 5        # Max traits you can carry


class UserHierarchy(str, Enum):
    """User hierarchy based on level"""
    GHOST = "ghost"        # 0-9
    PHANTOM = "phantom"    # 10-39
    OPERATOR = "operator"  # 40-79
    MONARCH = "monarch"    # 80+


class UserClass(str, Enum):
    """Neural Pathway specializations"""
    NONE = "none"
    ARCHITECT = "architect"
    BROKER = "broker"
    OBSERVER = "observer"


class ActionType(str, Enum):
    """XP-granting action types"""
    LIKE_GIVEN = "like_given"
    LIKE_RECEIVED = "like_received"
    COMMENT = "comment"
    POST = "post"
    ARTICLE = "article"
    VOTE_CAST = "vote_cast"
    PURCHASE = "purchase"
    SALE = "sale"
    SWAP_COMPLETED = "swap_completed"
    REVIEW_WRITTEN = "review_written"
    PC_BUILD_SHARED = "pc_build_shared"
    DAILY_LOGIN = "daily_login"
    STREAK_BONUS = "streak_bonus"
    ACHIEVEMENT = "achievement"
    LEVEL_UP = "level_up"


# ============================================
# UNIQUE ACHIEVEMENTS FOR LEVEL 70-80
# ============================================

LEVEL_GATE_ACHIEVEMENTS = {
    70: [
        {"id": "sales_master", "name": "Sales Master", "name_ru": "Мастер Продаж", 
         "requirement": {"total_sales": 50}, "description": "Complete 50 sales"},
        {"id": "trusted_one", "name": "The Trusted One", "name_ru": "Заслуживший Доверие",
         "requirement": {"trust_score_min": 800}, "description": "Reach 800 Trust Score"},
    ],
    72: [
        {"id": "community_pillar", "name": "Community Pillar", "name_ru": "Опора Сообщества",
         "requirement": {"helpful_reviews": 100}, "description": "Get 100 helpful votes on reviews"},
    ],
    75: [
        {"id": "architect_supreme", "name": "Architect Supreme", "name_ru": "Верховный Архитектор",
         "requirement": {"builds_shared": 25, "build_likes": 500}, "description": "Share 25 builds with 500+ total likes"},
        {"id": "broker_legend", "name": "Broker Legend", "name_ru": "Легенда Торговли",
         "requirement": {"swaps_completed": 100, "swap_rating_avg": 4.8}, "description": "100 swaps with 4.8+ rating"},
    ],
    78: [
        {"id": "veteran", "name": "Veteran", "name_ru": "Ветеран",
         "requirement": {"account_age_days": 365}, "description": "Account older than 1 year"},
    ],
    80: [
        {"id": "monarch_trial", "name": "The Monarch's Trial", "name_ru": "Испытание Монарха",
         "requirement": {"all_previous_achievements": True}, "description": "Complete ALL previous gate achievements"},
    ]
}


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
    ActionType.STREAK_BONUS: 25,
    ActionType.ACHIEVEMENT: 0,
    ActionType.LEVEL_UP: 0,
}

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

SOCIAL_ACTIONS = {
    ActionType.LIKE_GIVEN, ActionType.LIKE_RECEIVED, 
    ActionType.COMMENT, ActionType.POST, ActionType.VOTE_CAST
}


# ============================================
# LEGACY TRAITS (From Class Reboot)
# ============================================

LEGACY_TRAITS = {
    UserClass.ARCHITECT: {
        "id": "blueprint_memory",
        "name": "Blueprint Memory",
        "name_ru": "Память Чертежей",
        "description": "+10% XP from PC builds (permanent)",
        "effect": {"xp_multiplier": {"pc_build_shared": 1.1}}
    },
    UserClass.BROKER: {
        "id": "trade_instinct",
        "name": "Trade Instinct", 
        "name_ru": "Торговый Инстинкт",
        "description": "-5% swap commission (permanent)",
        "effect": {"fee_reduction": {"swap": 0.05}}
    },
    UserClass.OBSERVER: {
        "id": "critical_eye",
        "name": "Critical Eye",
        "name_ru": "Критический Взгляд",
        "description": "+15% RP from reviews (permanent)",
        "effect": {"rp_multiplier": {"review_written": 1.15}}
    }
}


# ============================================
# XP & LEVELING CALCULATIONS - SINGULARITY CURVE
# ============================================

def calculate_xp_for_level(level: int) -> int:
    """
    Calculate total XP required to reach a specific level.
    SINGULARITY CURVE:
    - Levels 1-40: Fast (exponent 1.5)
    - Levels 40-60: Grind (exponent 2.0)
    - Levels 60-70: Extreme (exponent 2.5)
    - Levels 70-80: Achievement-gated (XP alone won't work)
    """
    if level <= 1:
        return 0
    
    if level <= 40:
        # Fast progression
        return int(GhostConfig.XP_BASE * (level ** GhostConfig.XP_EXPONENT_EARLY))
    elif level <= 60:
        # Grind zone
        base_40 = int(GhostConfig.XP_BASE * (40 ** GhostConfig.XP_EXPONENT_EARLY))
        additional = int(150 * ((level - 40) ** GhostConfig.XP_EXPONENT_MID))
        return base_40 + additional
    elif level <= 70:
        # Extreme zone
        base_60 = calculate_xp_for_level(60)
        additional = int(500 * ((level - 60) ** GhostConfig.XP_EXPONENT_LATE))
        return base_60 + additional
    else:
        # Achievement wall - XP requirement is same as 70, but needs achievements
        base_70 = calculate_xp_for_level(70)
        # Each level after 70 adds 20% more XP requirement
        multiplier = 1.2 ** (level - 70)
        return int(base_70 * multiplier)


def calculate_level_from_xp(total_xp: int, completed_achievements: List[str] = None) -> int:
    """
    Calculate level from total XP.
    After level 70, achievements are required to progress.
    """
    if total_xp <= 0:
        return 1
    
    completed_achievements = completed_achievements or []
    
    # Binary search for base level (up to 70)
    low, high = 1, GhostConfig.XP_WALL_START
    while low < high:
        mid = (low + high + 1) // 2
        if calculate_xp_for_level(mid) <= total_xp:
            low = mid
        else:
            high = mid - 1
    
    base_level = min(low, GhostConfig.XP_WALL_START)
    
    # If at or past level 70, check achievements
    if base_level >= GhostConfig.XP_WALL_START:
        # Check each gate level
        for gate_level in sorted(LEVEL_GATE_ACHIEVEMENTS.keys()):
            if gate_level > base_level:
                break
                
            # Check if user has required achievements for this gate
            required = LEVEL_GATE_ACHIEVEMENTS[gate_level]
            has_all = all(
                ach["id"] in completed_achievements 
                for ach in required
            )
            
            if not has_all:
                # Stuck at this gate - can't progress beyond
                return gate_level - 1 if gate_level > 70 else 70
            
            # Has achievements, check XP for next levels
            if total_xp >= calculate_xp_for_level(gate_level):
                base_level = gate_level
    
    return min(base_level, GhostConfig.ABSOLUTE_MAX_LEVEL)


def calculate_xp_progress(total_xp: int, completed_achievements: List[str] = None) -> Tuple[int, int, float, bool]:
    """
    Calculate XP progress within current level.
    Returns: (current_level, xp_to_next, progress_percentage, is_achievement_gated)
    """
    completed_achievements = completed_achievements or []
    current_level = calculate_level_from_xp(total_xp, completed_achievements)
    
    if current_level >= GhostConfig.ABSOLUTE_MAX_LEVEL:
        return current_level, 0, 100.0, False
    
    xp_current_level = calculate_xp_for_level(current_level)
    xp_next_level = calculate_xp_for_level(current_level + 1)
    
    xp_in_level = total_xp - xp_current_level
    xp_needed = xp_next_level - xp_current_level
    
    progress = (xp_in_level / xp_needed) * 100 if xp_needed > 0 else 100
    
    # Check if achievement-gated
    is_gated = False
    if current_level >= GhostConfig.XP_WALL_START:
        next_gate = current_level + 1
        if next_gate in LEVEL_GATE_ACHIEVEMENTS:
            required = LEVEL_GATE_ACHIEVEMENTS[next_gate]
            has_all = all(ach["id"] in completed_achievements for ach in required)
            is_gated = not has_all
            
            if is_gated and progress > 99:
                progress = 99.0  # Stuck at 99% until achievement unlocked
    
    return current_level, max(0, xp_needed - xp_in_level), round(progress, 2), is_gated


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


def get_required_achievements_for_level(target_level: int) -> List[Dict]:
    """Get list of achievements required to reach target level."""
    required = []
    for gate_level, achievements in LEVEL_GATE_ACHIEVEMENTS.items():
        if gate_level <= target_level:
            required.extend(achievements)
    return required


# ============================================
# TRUST SCORE CALCULATIONS
# ============================================

def calculate_trust_change(current_trust: float, change: float, is_penalty: bool = False) -> float:
    """Calculate new trust score with logarithmic growth and penalty multiplier."""
    if is_penalty:
        new_trust = current_trust + (change * GhostConfig.TRUST_PENALTY_MULTIPLIER)
    else:
        if change > 0:
            scale_factor = 1.0 / (1.0 + (current_trust / 500))
            new_trust = current_trust + (change * scale_factor)
        else:
            new_trust = current_trust + change
    
    return max(GhostConfig.TRUST_MIN, min(GhostConfig.TRUST_MAX, new_trust))


def calculate_trust_decay(current_trust: float, days_inactive: int) -> float:
    """
    Calculate trust decay for inactive users.
    HARDCORE: -1 point per day after 7 days inactive.
    """
    if days_inactive <= GhostConfig.ENTROPY_START_DAYS:
        return current_trust
    
    active_decay_days = days_inactive - GhostConfig.ENTROPY_START_DAYS
    decay_amount = active_decay_days * GhostConfig.TRUST_DAILY_DECAY
    
    target = GhostConfig.TRUST_DECAY_TARGET
    
    if current_trust > target:
        return max(target, current_trust - decay_amount)
    elif current_trust < target:
        # Recovery is slower
        recovery = decay_amount * 0.5
        return min(target, current_trust + recovery)
    
    return current_trust


def get_trust_tier(trust_score: float) -> Tuple[str, str]:
    """Get trust tier name and halo color."""
    if trust_score >= 800:
        return "verified", "#00FFD4"
    elif trust_score >= 500:
        return "neutral", "rgba(255,255,255,0.4)"
    elif trust_score >= 400:
        return "warning", "#FF9F43"
    else:
        return "danger", "#FF4444"


# ============================================
# RP CALCULATIONS - WITH ENTROPY
# ============================================

def calculate_rp_cap(level: int, trust_score: float) -> int:
    """Calculate maximum RP a user can hold."""
    base = GhostConfig.RP_BASE_CAP
    level_bonus = level * GhostConfig.RP_LEVEL_MULTIPLIER
    trust_bonus = int(trust_score / GhostConfig.RP_TRUST_DIVISOR)
    return base + level_bonus + trust_bonus


def calculate_rp_decay(current_rp: int, days_inactive: int) -> int:
    """
    Calculate RP decay for inactive users.
    ENTROPY: -5% per day after 7 days inactive.
    """
    if days_inactive <= GhostConfig.ENTROPY_START_DAYS:
        return current_rp
    
    active_decay_days = days_inactive - GhostConfig.ENTROPY_START_DAYS
    
    remaining = current_rp
    for _ in range(active_decay_days):
        remaining = int(remaining * (1 - GhostConfig.RP_DAILY_DECAY_PERCENT))
    
    return max(0, remaining)


def calculate_vote_weight(
    level: int, 
    trust_score: float, 
    user_class: UserClass,
    class_tier: int = 0,
    legacy_traits: List[str] = None
) -> float:
    """Calculate vote weight with class tier bonus."""
    base = 1.0
    level_bonus = level * 0.05
    trust_bonus = max(0, (trust_score - 500) / 500) * 1.0
    
    # Class bonus
    class_bonus = 0.5 if user_class == UserClass.OBSERVER else 0.0
    
    # Class tier bonus (0.01 per tier level)
    tier_bonus = class_tier * 0.01
    
    # Hierarchy bonus
    hierarchy = get_hierarchy(level)
    hierarchy_bonus = {
        UserHierarchy.GHOST: 0.0,
        UserHierarchy.PHANTOM: 0.0,
        UserHierarchy.OPERATOR: 0.5,
        UserHierarchy.MONARCH: 1.0,
    }.get(hierarchy, 0.0)
    
    # Legacy trait bonus (if has observer trait)
    legacy_bonus = 0.0
    if legacy_traits and "critical_eye" in legacy_traits:
        legacy_bonus = 0.1
    
    return round(base + level_bonus + trust_bonus + class_bonus + tier_bonus + hierarchy_bonus + legacy_bonus, 2)


# ============================================
# INNER CIRCLE - TOP 100 ONLY (King of the Hill)
# ============================================

def is_eligible_for_inner_circle(
    level: int,
    monthly_rp: int,
    trust_score: float,
    global_rank: int
) -> Tuple[bool, str]:
    """
    Check if user is eligible for Inner Circle (Direct Line).
    Requirements:
    - Level >= 80 (Monarch)
    - Global Rank <= 100 (Top 100 by monthly RP)
    - Trust Score >= 700 (good standing)
    """
    if level < GhostConfig.INNER_CIRCLE_MIN_LEVEL:
        return False, f"level_required:{GhostConfig.INNER_CIRCLE_MIN_LEVEL}"
    
    if trust_score < 700:
        return False, "trust_required:700"
    
    if global_rank > GhostConfig.INNER_CIRCLE_MAX_SLOTS:
        return False, f"rank_required:top_{GhostConfig.INNER_CIRCLE_MAX_SLOTS}"
    
    return True, "eligible"


# ============================================
# CLASS REBOOT SYSTEM (Rebirth)
# ============================================

def calculate_reboot_cost(reboot_count: int, use_rp: bool = True) -> Dict[str, Any]:
    """
    Calculate cost for class reboot.
    Cost doubles with each reboot.
    """
    if use_rp:
        base_cost = GhostConfig.REBOOT_BASE_COST_RP
        rp_cost = base_cost * (GhostConfig.REBOOT_COST_MULTIPLIER ** reboot_count)
        return {
            "type": "rp",
            "amount": rp_cost,
            "alternative": "reboot_token"
        }
    else:
        return {
            "type": "token",
            "item": "reboot_token",
            "amount": 1
        }


def can_reboot_class(
    level: int,
    current_class: UserClass,
    rp_balance: int,
    reboot_count: int,
    has_reboot_token: bool = False
) -> Tuple[bool, str, Dict]:
    """
    Check if user can reboot their class.
    """
    if level < GhostConfig.CLASS_UNLOCK_LEVEL:
        return False, f"level_required:{GhostConfig.CLASS_UNLOCK_LEVEL}", {}
    
    if current_class == UserClass.NONE:
        return False, "no_class_to_reboot", {}
    
    cost = calculate_reboot_cost(reboot_count, use_rp=True)
    
    # Check if can afford
    if has_reboot_token:
        return True, "can_use_token", {"cost_type": "token"}
    
    if rp_balance >= cost["amount"]:
        return True, "can_use_rp", cost
    
    return False, f"insufficient_rp:{cost['amount']}", cost


def get_legacy_trait_for_class(user_class: UserClass) -> Optional[Dict]:
    """Get the legacy trait that will be preserved from a class."""
    return LEGACY_TRAITS.get(user_class)


def execute_reboot(
    current_class: UserClass,
    new_class: UserClass,
    current_legacy_traits: List[str],
    reboot_count: int
) -> Dict[str, Any]:
    """
    Execute class reboot logic.
    Returns new state after reboot.
    """
    # Get legacy trait from old class
    old_trait = get_legacy_trait_for_class(current_class)
    
    new_legacy_traits = list(current_legacy_traits)
    if old_trait and old_trait["id"] not in new_legacy_traits:
        if len(new_legacy_traits) < GhostConfig.MAX_LEGACY_TRAITS:
            new_legacy_traits.append(old_trait["id"])
    
    return {
        "new_class": new_class.value,
        "class_tier": 0,  # Reset to 0
        "legacy_traits": new_legacy_traits,
        "reboot_count": reboot_count + 1,
        "rp_balance": 0 if GhostConfig.REBOOT_BURNS_ALL_RP else None,
    }


# ============================================
# CLASS TIER PROGRESSION
# ============================================

def calculate_class_tier_xp(tier: int) -> int:
    """XP required for class tier level."""
    return int(500 * (tier ** 1.3))


def award_class_tier_xp(current_tier: int, current_tier_xp: int, xp_gained: int) -> Tuple[int, int, bool]:
    """
    Award XP toward class tier.
    Returns: (new_tier, new_tier_xp, did_tier_up)
    """
    if current_tier >= GhostConfig.CLASS_TIER_MAX:
        return current_tier, current_tier_xp, False
    
    new_xp = current_tier_xp + xp_gained
    required = calculate_class_tier_xp(current_tier + 1)
    
    if new_xp >= required:
        return current_tier + 1, new_xp - required, True
    
    return current_tier, new_xp, False


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
    
    # Guaranteed RP bonus (increases with level)
    rp_bonus = 50 + (new_level * 5)
    reward["rewards"].append({
        "type": "rp",
        "amount": rp_bonus,
        "name": "Resource Points"
    })
    
    # Milestone rewards (every 10 levels)
    if new_level % 10 == 0:
        rarity = "common"
        if new_level >= 50:
            rarity = "rare"
        if new_level >= 70:
            rarity = "epic"
        if new_level >= 80:
            rarity = "legendary"
            
        reward["rewards"].append({
            "type": "artifact",
            "id": f"theme_milestone_{new_level}",
            "name": f"Milestone {new_level} Theme",
            "rarity": rarity
        })
    
    # Random protocol (15% chance, increases at higher levels)
    protocol_chance = 0.15 + (new_level / 500)  # 15-35% chance
    if random.random() < protocol_chance:
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
    elif user_class == UserClass.BROKER and new_level >= 20:
        reward["rewards"].append({
            "type": "trade_token",
            "id": f"trade_boost_{new_level}",
            "name": "Trade Priority Token"
        })
    elif user_class == UserClass.OBSERVER and new_level >= 20:
        reward["rewards"].append({
            "type": "review_boost",
            "id": f"review_highlight_{new_level}",
            "name": "Review Highlight (7d)"
        })
    
    return reward


# ============================================
# ENTROPY SYSTEM
# ============================================

def calculate_entropy_effects(
    days_inactive: int,
    current_rp: int,
    current_trust: float,
    class_type: Optional[str]
) -> Dict[str, Any]:
    """
    Calculate all entropy effects for inactive user.
    Returns decay amounts and status changes.
    """
    effects = {
        "days_inactive": days_inactive,
        "entropy_active": days_inactive > GhostConfig.ENTROPY_START_DAYS,
        "rp_decay": 0,
        "trust_decay": 0,
        "class_offline": False,
        "new_rp": current_rp,
        "new_trust": current_trust,
    }
    
    if not effects["entropy_active"]:
        return effects
    
    # Calculate RP decay
    new_rp = calculate_rp_decay(current_rp, days_inactive)
    effects["rp_decay"] = current_rp - new_rp
    effects["new_rp"] = new_rp
    
    # Calculate Trust decay
    new_trust = calculate_trust_decay(current_trust, days_inactive)
    effects["trust_decay"] = current_trust - new_trust
    effects["new_trust"] = new_trust
    
    # Class goes offline after 7 days
    effects["class_offline"] = class_type is not None and class_type != "none"
    
    return effects


# ============================================
# ANTI-ABUSE SYSTEM
# ============================================

def check_rate_limit(
    last_action_time: Optional[datetime],
    action_type: ActionType,
    cooldown_seconds: int = None
) -> Tuple[bool, str]:
    """Check if action is rate-limited."""
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
    """Check and apply daily cap for social actions."""
    if action_type not in SOCIAL_ACTIONS:
        return xp_to_add, -1
    
    cap = GhostConfig.DAILY_XP_CAP_SOCIAL
    remaining = cap - daily_xp_earned
    
    if remaining <= 0:
        return 0, 0
    
    actual_xp = min(xp_to_add, remaining)
    return actual_xp, remaining - actual_xp


def apply_diminishing_returns(action_count_today: int, base_xp: int) -> int:
    """Apply diminishing returns for repeated actions."""
    if action_count_today <= 1:
        return base_xp
    
    multiplier = 1.0 / math.log2(action_count_today + 1)
    return max(1, int(base_xp * multiplier))


# ============================================
# CLASS BONUSES
# ============================================

def get_class_bonuses(user_class: UserClass, class_tier: int = 0, legacy_traits: List[str] = None) -> Dict[str, Any]:
    """Get bonuses for a specific class including tier and legacy."""
    legacy_traits = legacy_traits or []
    
    bonuses = {
        UserClass.NONE: {
            "icon": "○",
            "name": "Unspecialized",
            "name_ru": "Без специализации",
            "tier": 0,
            "perks": [],
            "legacy_active": []
        },
        UserClass.ARCHITECT: {
            "icon": "⬡",
            "name": "Architect",
            "name_ru": "Архитектор",
            "tier": class_tier,
            "perks": [
                {"type": "xp_multiplier", "action": "pc_build_shared", "value": 1.25 + (class_tier * 0.005)},
                {"type": "feature_unlock", "feature": "advanced_pc_specs", "value": True},
            ],
            "tier_bonus": f"+{class_tier * 0.5}% build XP"
        },
        UserClass.BROKER: {
            "icon": "◇",
            "name": "Broker",
            "name_ru": "Брокер",
            "tier": class_tier,
            "perks": [
                {"type": "fee_reduction", "service": "swap", "value": 0.15 + (class_tier * 0.001)},
                {"type": "limit_increase", "service": "swap_listings", "value": 2.0 + (class_tier * 0.02)},
            ],
            "tier_bonus": f"-{15 + class_tier * 0.1:.1f}% swap fee"
        },
        UserClass.OBSERVER: {
            "icon": "◉",
            "name": "Observer",
            "name_ru": "Наблюдатель",
            "tier": class_tier,
            "perks": [
                {"type": "rp_multiplier", "action": "review_written", "value": 1.5 + (class_tier * 0.01)},
                {"type": "feature_unlock", "feature": "expert_verified_badge", "value": True},
                {"type": "vote_weight_bonus", "value": 0.5 + (class_tier * 0.005)},
            ],
            "tier_bonus": f"+{50 + class_tier}% review RP"
        }
    }
    
    result = bonuses.get(user_class, bonuses[UserClass.NONE]).copy()
    
    # Add active legacy traits
    active_legacy = []
    for trait_id in legacy_traits:
        for cls, trait in LEGACY_TRAITS.items():
            if trait["id"] == trait_id:
                active_legacy.append(trait)
                break
    result["legacy_active"] = active_legacy
    
    return result


def can_select_class(
    level: int, 
    current_class: UserClass, 
    reboot_count: int
) -> Tuple[bool, str]:
    """
    Check if user can select/change class.
    First selection is free, changes require reboot.
    """
    if level < GhostConfig.CLASS_UNLOCK_LEVEL:
        return False, f"level_required:{GhostConfig.CLASS_UNLOCK_LEVEL}"
    
    if current_class == UserClass.NONE:
        return True, "first_selection_free"
    
    return False, "reboot_required"


# ============================================
# RADAR STATS
# ============================================

def calculate_radar_stats(user_data: Dict) -> Dict[str, int]:
    """Calculate radar chart stats (0-100 scale)."""
    stats = {"speed": 50, "trust": 50, "comm": 50, "tech": 50}
    
    trust_score = user_data.get("trust_score", 500)
    stats["trust"] = min(100, int(trust_score / 10))
    
    deals_completed = user_data.get("total_deals", 0)
    if deals_completed > 0:
        stats["speed"] = min(100, 50 + deals_completed)
    
    avg_rating = user_data.get("average_rating_received", 3.0)
    stats["comm"] = min(100, int(avg_rating * 20))
    
    builds = user_data.get("total_builds", 0)
    articles = user_data.get("total_articles", 0)
    stats["tech"] = min(100, 40 + builds * 5 + articles * 10)
    
    return stats

