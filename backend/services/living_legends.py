"""
GHOST PROTOCOL - Living Legends Engine
=======================================
The Hidden Layer: AI-Recognized Titles & Anomaly Detection

This module implements:
- Legacy Titles (chronological, one-time awards)
- AI-Recognized Traits (behavioral pattern detection)
- Highlander Mechanic (transferable unique titles)
- Anomaly Detection (statistical outlier discovery)
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List, Tuple, Any
from enum import Enum
from pydantic import BaseModel, Field
import math
import statistics


# ============================================
# ENUMS & CONSTANTS
# ============================================

class TitleCategory(str, Enum):
    """Categories of titles"""
    LEGACY = "legacy"           # One-time chronological (Progenitor)
    AI_TRAIT = "ai_trait"       # AI-detected behavioral patterns
    UNIQUE_FEAT = "unique_feat" # Exceptional achievements
    SEASONAL = "seasonal"       # Monthly/seasonal competitions
    HIDDEN = "hidden"           # Secret conditions


class TransferLogic(str, Enum):
    """How titles are transferred"""
    PERMANENT = "permanent"     # Once earned, forever yours
    HIGHLANDER = "highlander"   # Only one holder - transfers to leader
    DECAY = "decay"             # Lost after inactivity
    SEASONAL = "seasonal"       # Resets each season


class TitleRarity(str, Enum):
    """Rarity tiers"""
    COMMON = "common"           # Many can have
    RARE = "rare"               # Limited holders
    EPIC = "epic"               # Very few
    LEGENDARY = "legendary"     # Handful globally
    MYTHIC = "mythic"           # Only ONE (Highlander)


# ============================================
# TITLE DEFINITIONS
# ============================================

LEGACY_TITLES = {
    "progenitor": {
        "id": "progenitor",
        "name": "Progenitor",
        "name_ru": "Прародитель",
        "description": "Among the first 1000 users. The blood of the System.",
        "description_ru": "Один из первых 1000 пользователей. Кровь Системы.",
        "category": TitleCategory.LEGACY,
        "rarity": TitleRarity.LEGENDARY,
        "max_holders": 1000,
        "transfer_logic": TransferLogic.PERMANENT,
        "condition": {"registration_order": {"lte": 1000}},
        "effects": {
            "xp_multiplier": 1.05,  # +5% XP forever
            "visual": "golden_border"
        },
        "icon": "🩸",
        "visual_class": "title-progenitor"
    },
    "origin": {
        "id": "origin",
        "name": "Origin",
        "name_ru": "Первоисточник",
        "description": "Top 10 users of the first month. The architects of genesis.",
        "description_ru": "Топ-10 пользователей первого месяца. Архитекторы начала.",
        "category": TitleCategory.LEGACY,
        "rarity": TitleRarity.MYTHIC,
        "max_holders": 10,
        "transfer_logic": TransferLogic.PERMANENT,
        "condition": {"first_month_rank": {"lte": 10}},
        "effects": {
            "free_reboot_yearly": True,
            "visual": "origin_aura"
        },
        "icon": "⚡",
        "visual_class": "title-origin"
    },
    "pioneer": {
        "id": "pioneer",
        "name": "Pioneer",
        "name_ru": "Первопроходец",
        "description": "Joined during beta testing phase.",
        "description_ru": "Присоединился во время бета-тестирования.",
        "category": TitleCategory.LEGACY,
        "rarity": TitleRarity.EPIC,
        "max_holders": 5000,
        "transfer_logic": TransferLogic.PERMANENT,
        "condition": {"is_beta_user": True},
        "effects": {
            "badge": "beta_tester"
        },
        "icon": "🚀",
        "visual_class": "title-pioneer"
    }
}

AI_RECOGNIZED_TRAITS = {
    "white_hat": {
        "id": "white_hat",
        "name": "White Hat",
        "name_ru": "Белая Шляпа",
        "description": "Found and reported bugs instead of exploiting them.",
        "description_ru": "Нашёл и сообщил о багах вместо злоупотребления.",
        "category": TitleCategory.AI_TRAIT,
        "rarity": TitleRarity.EPIC,
        "max_holders": None,  # Unlimited
        "transfer_logic": TransferLogic.PERMANENT,
        "condition": {"bugs_reported_and_fixed": {"gte": 1}},
        "effects": {
            "visual": "glitch_nickname",
            "trust_bonus": 50
        },
        "icon": "🎩",
        "visual_class": "title-white-hat"
    },
    "shepherd": {
        "id": "shepherd",
        "name": "The Shepherd",
        "name_ru": "Пастырь",
        "description": "Guides newcomers when no one else does.",
        "description_ru": "Помогает новичкам, когда остальные игнорируют.",
        "category": TitleCategory.AI_TRAIT,
        "rarity": TitleRarity.RARE,
        "max_holders": None,
        "transfer_logic": TransferLogic.DECAY,
        "decay_days": 90,  # Must maintain helpful behavior
        "condition": {"newbies_helped": {"gte": 50}, "unique_newbies": {"gte": 20}},
        "effects": {
            "visual": "soft_white_glow",
            "rp_multiplier": 1.1
        },
        "icon": "🌟",
        "visual_class": "title-shepherd"
    },
    "silent_whale": {
        "id": "silent_whale",
        "name": "Silent Whale",
        "name_ru": "Тихий Кит",
        "description": "Massive trade volume, minimal chat presence.",
        "description_ru": "Огромный оборот сделок при минимальной активности в чате.",
        "category": TitleCategory.AI_TRAIT,
        "rarity": TitleRarity.RARE,
        "max_holders": None,
        "transfer_logic": TransferLogic.DECAY,
        "decay_days": 60,
        "condition": {
            "total_trade_volume": {"gte": 1000000},  # 1M rubles
            "messages_per_trade_ratio": {"lte": 0.1}
        },
        "effects": {
            "priority_support": True,
            "visual": "subtle_depth"
        },
        "icon": "🐋",
        "visual_class": "title-whale"
    },
    "nightwatcher": {
        "id": "nightwatcher",
        "name": "Nightwatcher",
        "name_ru": "Ночной Дозор",
        "description": "Consistently active during midnight hours.",
        "description_ru": "Стабильно активен в ночные часы.",
        "category": TitleCategory.AI_TRAIT,
        "rarity": TitleRarity.RARE,
        "max_holders": None,
        "transfer_logic": TransferLogic.DECAY,
        "decay_days": 30,
        "condition": {
            "night_activity_streak": {"gte": 30},  # 30 days of 00:00-05:00 activity
            "night_activity_ratio": {"gte": 0.7}
        },
        "effects": {
            "visual": "dark_aura"
        },
        "icon": "🦉",
        "visual_class": "title-nightwatcher"
    },
    "the_patient": {
        "id": "the_patient",
        "name": "The Patient One",
        "name_ru": "Терпеливый",
        "description": "Waited months tracking a single item before acting.",
        "description_ru": "Месяцами отслеживал один товар перед действием.",
        "category": TitleCategory.AI_TRAIT,
        "rarity": TitleRarity.EPIC,
        "max_holders": None,
        "transfer_logic": TransferLogic.PERMANENT,
        "condition": {
            "item_watch_days": {"gte": 90},  # Watched same item 90+ days
            "finally_purchased": True
        },
        "effects": {
            "discount_token": 0.10  # 10% one-time discount
        },
        "icon": "⏳",
        "visual_class": "title-patient"
    }
}

UNIQUE_FEATS = {
    "system_breaker": {
        "id": "system_breaker",
        "name": "System Breaker",
        "name_ru": "Взломщик Системы",
        "description": "Reached level cap faster than mathematically expected (legitimately).",
        "description_ru": "Достиг капа уровня быстрее, чем предполагалось математически (честно).",
        "category": TitleCategory.UNIQUE_FEAT,
        "rarity": TitleRarity.MYTHIC,
        "max_holders": 1,  # Only ONE - Highlander
        "transfer_logic": TransferLogic.HIGHLANDER,
        "condition": {"level_80_days": {"record": True}},  # Fastest to 80
        "effects": {
            "xp_multiplier": 1.10,
            "visual": "matrix_glitch"
        },
        "icon": "💥",
        "visual_class": "title-breaker"
    },
    "architect_prime": {
        "id": "architect_prime",
        "name": "Architect Prime",
        "name_ru": "Главный Архитектор",
        "description": "Created a PC build with 10,000+ likes.",
        "description_ru": "Создал сборку ПК с 10,000+ лайками.",
        "category": TitleCategory.UNIQUE_FEAT,
        "rarity": TitleRarity.LEGENDARY,
        "max_holders": None,
        "transfer_logic": TransferLogic.PERMANENT,
        "condition": {"build_likes": {"gte": 10000}},
        "effects": {
            "badge": "architect_prime",
            "profile_highlight": True
        },
        "icon": "🏛️",
        "visual_class": "title-architect-prime"
    },
    "trade_emperor": {
        "id": "trade_emperor",
        "name": "Trade Emperor",
        "name_ru": "Император Торговли",
        "description": "Highest monthly trade volume. Crown transfers monthly.",
        "description_ru": "Наибольший объём сделок за месяц. Корона переходит ежемесячно.",
        "category": TitleCategory.UNIQUE_FEAT,
        "rarity": TitleRarity.MYTHIC,
        "max_holders": 1,
        "transfer_logic": TransferLogic.HIGHLANDER,
        "condition": {"monthly_trade_volume": {"rank": 1}},
        "effects": {
            "fee_reduction": 0.25,  # -25% swap fees
            "visual": "imperial_crown"
        },
        "icon": "👑",
        "visual_class": "title-emperor"
    },
    "community_heart": {
        "id": "community_heart",
        "name": "Heart of Community",
        "name_ru": "Сердце Сообщества",
        "description": "Most helpful reviews and answers this month.",
        "description_ru": "Больше всего полезных отзывов и ответов за месяц.",
        "category": TitleCategory.UNIQUE_FEAT,
        "rarity": TitleRarity.MYTHIC,
        "max_holders": 1,
        "transfer_logic": TransferLogic.HIGHLANDER,
        "condition": {"monthly_helpful_score": {"rank": 1}},
        "effects": {
            "vote_weight_bonus": 1.0,
            "visual": "heart_pulse"
        },
        "icon": "💖",
        "visual_class": "title-heart"
    }
}

# Combine all titles
ALL_TITLES = {**LEGACY_TITLES, **AI_RECOGNIZED_TRAITS, **UNIQUE_FEATS}


# ============================================
# TITLE MODEL
# ============================================

class Title(BaseModel):
    """A title held by a user"""
    id: str
    obtained_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_equipped: bool = False  # Shown on profile
    is_active: bool = True     # Not decayed
    last_verified: Optional[datetime] = None  # When AI last checked conditions
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TitleTransfer(BaseModel):
    """Record of title transfer (for Highlander titles)"""
    title_id: str
    from_user_id: Optional[str]
    to_user_id: str
    transferred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reason: str  # "outperformed", "decay", "initial_award"


# ============================================
# HIDDEN METRICS STRUCTURE
# ============================================

DEFAULT_HIDDEN_METRICS = {
    # Bug reporting
    "bugs_reported": 0,
    "bugs_fixed_from_reports": 0,
    
    # Helping behavior
    "newbies_helped": 0,            # Answers to level 0-5 users
    "unique_newbies_helped": 0,     # Unique newbies helped
    "unanswered_questions_answered": 0,  # First to answer
    
    # Trading patterns
    "total_trade_volume": 0.0,      # In rubles
    "silent_trades": 0,             # Trades with minimal chat
    "messages_sent_total": 0,
    
    # Time patterns
    "night_logins": 0,              # 00:00-05:00 logins
    "night_activity_days": [],      # Dates of night activity
    "consecutive_night_streak": 0,
    
    # Patience metrics
    "items_watched": {},            # {item_id: first_watch_date}
    "longest_item_watch_days": 0,
    
    # Content creation
    "builds_created": 0,
    "build_total_likes": 0,
    "articles_written": 0,
    "article_total_views": 0,
    
    # Speed records
    "days_to_level_10": None,
    "days_to_level_40": None,
    "days_to_level_80": None,
    
    # Monthly metrics (reset monthly)
    "monthly_trade_volume": 0.0,
    "monthly_helpful_votes": 0,
    "monthly_messages": 0,
    
    # Anomaly flags (set by AI)
    "detected_anomalies": [],
    "potential_titles": [],
}


# ============================================
# HIDDEN METRICS TRACKING
# ============================================

def update_hidden_metric(
    current_metrics: Dict,
    metric_name: str,
    value: Any,
    operation: str = "set"  # set, increment, append, max
) -> Dict:
    """Update a specific hidden metric"""
    metrics = current_metrics.copy()
    
    if metric_name not in metrics:
        metrics[metric_name] = DEFAULT_HIDDEN_METRICS.get(metric_name, 0)
    
    if operation == "set":
        metrics[metric_name] = value
    elif operation == "increment":
        metrics[metric_name] = metrics.get(metric_name, 0) + value
    elif operation == "append":
        if not isinstance(metrics[metric_name], list):
            metrics[metric_name] = []
        metrics[metric_name].append(value)
    elif operation == "max":
        metrics[metric_name] = max(metrics.get(metric_name, 0), value)
    
    return metrics


def track_action_for_titles(
    current_metrics: Dict,
    action_type: str,
    action_data: Dict
) -> Dict:
    """
    Track an action and update relevant hidden metrics.
    Called by the main system when user performs actions.
    """
    metrics = current_metrics.copy()
    now = datetime.now(timezone.utc)
    
    if action_type == "bug_report":
        metrics["bugs_reported"] = metrics.get("bugs_reported", 0) + 1
        
    elif action_type == "bug_fixed":
        metrics["bugs_fixed_from_reports"] = metrics.get("bugs_fixed_from_reports", 0) + 1
        
    elif action_type == "answer_given":
        target_level = action_data.get("target_user_level", 99)
        if target_level <= 5:
            metrics["newbies_helped"] = metrics.get("newbies_helped", 0) + 1
            # Track unique newbies
            unique_set = set(metrics.get("unique_newbies_list", []))
            unique_set.add(action_data.get("target_user_id"))
            metrics["unique_newbies_list"] = list(unique_set)
            metrics["unique_newbies_helped"] = len(unique_set)
            
        if action_data.get("was_first_answer"):
            metrics["unanswered_questions_answered"] = metrics.get("unanswered_questions_answered", 0) + 1
            
    elif action_type == "trade_completed":
        volume = action_data.get("volume", 0)
        metrics["total_trade_volume"] = metrics.get("total_trade_volume", 0) + volume
        metrics["monthly_trade_volume"] = metrics.get("monthly_trade_volume", 0) + volume
        
        if action_data.get("messages_in_trade", 0) <= 3:
            metrics["silent_trades"] = metrics.get("silent_trades", 0) + 1
            
    elif action_type == "login":
        hour = now.hour
        if 0 <= hour < 5:  # Night hours
            metrics["night_logins"] = metrics.get("night_logins", 0) + 1
            
            night_days = metrics.get("night_activity_days", [])
            today = now.date().isoformat()
            if today not in night_days:
                night_days.append(today)
                metrics["night_activity_days"] = night_days[-90:]  # Keep last 90 days
                
                # Calculate streak
                streak = calculate_night_streak(night_days)
                metrics["consecutive_night_streak"] = streak
                
    elif action_type == "item_watched":
        item_id = action_data.get("item_id")
        watched = metrics.get("items_watched", {})
        if item_id not in watched:
            watched[item_id] = now.isoformat()
            metrics["items_watched"] = watched
            
    elif action_type == "item_purchased":
        item_id = action_data.get("item_id")
        watched = metrics.get("items_watched", {})
        if item_id in watched:
            first_watch = datetime.fromisoformat(watched[item_id])
            days_watched = (now - first_watch).days
            metrics["longest_item_watch_days"] = max(
                metrics.get("longest_item_watch_days", 0),
                days_watched
            )
            
    elif action_type == "build_liked":
        metrics["build_total_likes"] = metrics.get("build_total_likes", 0) + 1
        
    elif action_type == "level_reached":
        level = action_data.get("level")
        account_age_days = action_data.get("account_age_days")
        
        if level == 10 and metrics.get("days_to_level_10") is None:
            metrics["days_to_level_10"] = account_age_days
        elif level == 40 and metrics.get("days_to_level_40") is None:
            metrics["days_to_level_40"] = account_age_days
        elif level == 80 and metrics.get("days_to_level_80") is None:
            metrics["days_to_level_80"] = account_age_days
    
    return metrics


def calculate_night_streak(night_days: List[str]) -> int:
    """Calculate consecutive night activity streak"""
    if not night_days:
        return 0
    
    sorted_days = sorted(night_days, reverse=True)
    streak = 1
    
    for i in range(len(sorted_days) - 1):
        current = datetime.fromisoformat(sorted_days[i]).date()
        prev = datetime.fromisoformat(sorted_days[i + 1]).date()
        
        if (current - prev).days == 1:
            streak += 1
        else:
            break
    
    return streak


# ============================================
# AI BEHAVIOR ANALYSIS (The Watcher)
# ============================================

def analyze_behavior(
    user_id: str,
    hidden_metrics: Dict,
    user_data: Dict
) -> List[Dict]:
    """
    AI Watcher: Analyze user behavior and detect potential titles.
    Returns list of potential titles to award.
    
    This is the hook for future ML integration.
    Currently uses rule-based heuristics.
    """
    potential_titles = []
    
    # Check each AI trait condition
    for title_id, title_def in AI_RECOGNIZED_TRAITS.items():
        if check_title_condition(title_def["condition"], hidden_metrics, user_data):
            potential_titles.append({
                "title_id": title_id,
                "confidence": 1.0,  # Future: ML confidence score
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "metrics_snapshot": {k: v for k, v in hidden_metrics.items() 
                                    if k in str(title_def["condition"])}
            })
    
    # Check unique feats
    for title_id, title_def in UNIQUE_FEATS.items():
        if check_title_condition(title_def["condition"], hidden_metrics, user_data):
            potential_titles.append({
                "title_id": title_id,
                "confidence": 1.0,
                "detected_at": datetime.now(timezone.utc).isoformat()
            })
    
    return potential_titles


def check_title_condition(
    condition: Dict,
    metrics: Dict,
    user_data: Dict
) -> bool:
    """Check if a title condition is met"""
    for key, rule in condition.items():
        if key == "record":
            continue  # Handled separately for Highlander titles
        if key == "rank":
            continue  # Handled in Highlander check
            
        value = metrics.get(key) or user_data.get(key, 0)
        
        if isinstance(rule, dict):
            if "gte" in rule and value < rule["gte"]:
                return False
            if "lte" in rule and value > rule["lte"]:
                return False
            if "eq" in rule and value != rule["eq"]:
                return False
        elif isinstance(rule, bool):
            if bool(value) != rule:
                return False
    
    return True


# ============================================
# ANOMALY DETECTION
# ============================================

def detect_anomalies(
    user_metrics: Dict,
    population_stats: Dict  # {metric: {mean, std, p99}}
) -> List[Dict]:
    """
    Detect statistical anomalies in user behavior.
    Returns list of detected anomalies.
    """
    anomalies = []
    
    for metric, value in user_metrics.items():
        if metric not in population_stats:
            continue
            
        stats = population_stats[metric]
        mean = stats.get("mean", 0)
        std = stats.get("std", 1)
        p99 = stats.get("p99", mean + 3 * std)
        
        if value == 0 or std == 0:
            continue
        
        # Calculate z-score
        z_score = (value - mean) / std if std > 0 else 0
        
        # Anomaly threshold: 3 standard deviations (99.7%)
        if abs(z_score) >= 3:
            anomaly_type = "positive" if z_score > 0 else "negative"
            
            anomalies.append({
                "metric": metric,
                "value": value,
                "mean": mean,
                "z_score": round(z_score, 2),
                "percentile": calculate_percentile(value, mean, std),
                "type": anomaly_type,
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "potential_title_hint": suggest_title_for_anomaly(metric, anomaly_type)
            })
    
    return anomalies


def calculate_percentile(value: float, mean: float, std: float) -> float:
    """Calculate approximate percentile using normal distribution"""
    if std == 0:
        return 50.0
    z = (value - mean) / std
    # Approximate CDF using logistic function
    percentile = 100 / (1 + math.exp(-1.702 * z))
    return round(percentile, 2)


def suggest_title_for_anomaly(metric: str, anomaly_type: str) -> Optional[str]:
    """Suggest a potential title based on anomaly"""
    suggestions = {
        ("build_total_likes", "positive"): "architect_prime",
        ("night_logins", "positive"): "nightwatcher",
        ("newbies_helped", "positive"): "shepherd",
        ("total_trade_volume", "positive"): "silent_whale",
        ("longest_item_watch_days", "positive"): "the_patient",
        ("bugs_fixed_from_reports", "positive"): "white_hat",
    }
    return suggestions.get((metric, anomaly_type))


# ============================================
# HIGHLANDER MECHANIC (Title Transfer)
# ============================================

async def check_highlander_titles(
    db,  # Database connection
    title_id: str
) -> Optional[TitleTransfer]:
    """
    Check if a Highlander title should transfer to a new holder.
    Returns TitleTransfer if transfer occurred.
    """
    title_def = ALL_TITLES.get(title_id)
    if not title_def or title_def.get("transfer_logic") != TransferLogic.HIGHLANDER:
        return None
    
    condition = title_def["condition"]
    
    # Find current holder
    current_holder = await db.users.find_one({
        f"titles.{title_id}": {"$exists": True},
        f"titles.{title_id}.is_active": True
    })
    
    # Find the challenger (best candidate)
    challenger = None
    challenger_score = 0
    
    if "rank" in list(condition.values())[0]:
        # Ranking-based title (e.g., top trader)
        metric_name = list(condition.keys())[0]
        
        # Get top user by this metric
        pipeline = [
            {"$sort": {f"hidden_metrics.{metric_name}": -1}},
            {"$limit": 1}
        ]
        result = await db.users.aggregate(pipeline).to_list(1)
        if result:
            challenger = result[0]
            challenger_score = challenger.get("hidden_metrics", {}).get(metric_name, 0)
    
    elif "record" in str(condition):
        # Record-based title (e.g., fastest to level 80)
        # Get user with best time
        metric_name = list(condition.keys())[0]
        pipeline = [
            {"$match": {f"hidden_metrics.{metric_name}": {"$ne": None}}},
            {"$sort": {f"hidden_metrics.{metric_name}": 1}},  # Lower is better for time
            {"$limit": 1}
        ]
        result = await db.users.aggregate(pipeline).to_list(1)
        if result:
            challenger = result[0]
    
    if not challenger:
        return None
    
    # Check if transfer needed
    if current_holder and current_holder["id"] == challenger["id"]:
        return None  # Same person, no transfer
    
    # Execute transfer
    now = datetime.now(timezone.utc)
    
    # Remove from old holder
    if current_holder:
        await db.users.update_one(
            {"id": current_holder["id"]},
            {"$set": {f"titles.{title_id}.is_active": False}}
        )
        
        # Send notification (would integrate with notification system)
        await db.notifications.insert_one({
            "user_id": current_holder["id"],
            "type": "title_lost",
            "title_id": title_id,
            "title_name": title_def["name"],
            "new_holder": challenger.get("username"),
            "created_at": now.isoformat()
        })
    
    # Award to challenger
    new_title = Title(
        id=title_id,
        obtained_at=now,
        is_equipped=True,
        is_active=True
    )
    
    await db.users.update_one(
        {"id": challenger["id"]},
        {"$set": {f"titles.{title_id}": new_title.model_dump()}}
    )
    
    # Log transfer
    transfer = TitleTransfer(
        title_id=title_id,
        from_user_id=current_holder["id"] if current_holder else None,
        to_user_id=challenger["id"],
        reason="outperformed" if current_holder else "initial_award"
    )
    
    await db.title_transfers.insert_one(transfer.model_dump())
    
    return transfer


# ============================================
# TITLE DECAY CHECK
# ============================================

async def check_title_decay(
    db,
    user_id: str,
    user_titles: Dict[str, Title],
    last_activity: datetime
) -> List[str]:
    """
    Check if any titles should decay due to inactivity.
    Returns list of decayed title IDs.
    """
    decayed = []
    now = datetime.now(timezone.utc)
    
    for title_id, title in user_titles.items():
        if not title.get("is_active"):
            continue
            
        title_def = ALL_TITLES.get(title_id)
        if not title_def:
            continue
            
        if title_def.get("transfer_logic") != TransferLogic.DECAY:
            continue
            
        decay_days = title_def.get("decay_days", 90)
        days_inactive = (now - last_activity).days if last_activity else 999
        
        if days_inactive > decay_days:
            # Decay the title
            await db.users.update_one(
                {"id": user_id},
                {"$set": {f"titles.{title_id}.is_active": False}}
            )
            decayed.append(title_id)
            
            # Notify user
            await db.notifications.insert_one({
                "user_id": user_id,
                "type": "title_decayed",
                "title_id": title_id,
                "title_name": title_def["name"],
                "reason": f"Inactive for {days_inactive} days",
                "created_at": now.isoformat()
            })
    
    return decayed


# ============================================
# LEGACY TITLE ASSIGNMENT
# ============================================

async def assign_legacy_titles(db):
    """
    One-time migration: Assign legacy titles to early users.
    Should be run once at system initialization.
    """
    now = datetime.now(timezone.utc)
    
    # Get first 1000 users by registration order
    early_users = await db.users.find().sort("created_at", 1).limit(1000).to_list(1000)
    
    progenitor_count = 0
    for i, user in enumerate(early_users):
        registration_order = i + 1
        
        # Assign PROGENITOR
        if registration_order <= 1000:
            title = Title(
                id="progenitor",
                obtained_at=now,
                is_equipped=True,
                is_active=True,
                metadata={"registration_order": registration_order}
            )
            
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"titles.progenitor": title.model_dump()}}
            )
            progenitor_count += 1
    
    return {"progenitors_assigned": progenitor_count}


# ============================================
# TITLE EFFECTS APPLICATION
# ============================================

def get_title_effects(user_titles: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate cumulative effects from all active titles.
    """
    effects = {
        "xp_multiplier": 1.0,
        "rp_multiplier": 1.0,
        "fee_reduction": 0.0,
        "vote_weight_bonus": 0.0,
        "trust_bonus": 0,
        "visuals": [],
        "badges": [],
        "privileges": []
    }
    
    for title_id, title_data in user_titles.items():
        if not title_data.get("is_active"):
            continue
            
        title_def = ALL_TITLES.get(title_id)
        if not title_def:
            continue
            
        title_effects = title_def.get("effects", {})
        
        # Multiply XP multipliers
        if "xp_multiplier" in title_effects:
            effects["xp_multiplier"] *= title_effects["xp_multiplier"]
            
        # Multiply RP multipliers
        if "rp_multiplier" in title_effects:
            effects["rp_multiplier"] *= title_effects["rp_multiplier"]
            
        # Stack fee reductions (cap at 50%)
        if "fee_reduction" in title_effects:
            effects["fee_reduction"] = min(0.5, effects["fee_reduction"] + title_effects["fee_reduction"])
            
        # Stack vote weight
        if "vote_weight_bonus" in title_effects:
            effects["vote_weight_bonus"] += title_effects["vote_weight_bonus"]
            
        # Stack trust bonus
        if "trust_bonus" in title_effects:
            effects["trust_bonus"] += title_effects["trust_bonus"]
            
        # Collect visuals
        if "visual" in title_effects:
            effects["visuals"].append(title_effects["visual"])
            
        # Collect badges
        if "badge" in title_effects:
            effects["badges"].append(title_effects["badge"])
            
        # Collect privileges
        for key in ["priority_support", "free_reboot_yearly", "profile_highlight"]:
            if title_effects.get(key):
                effects["privileges"].append(key)
    
    return effects
