"""
Social Core Models - Monarchs & Achievements

Leaderboard system with:
- Period-based rankings (month/year/all-time)
- Achievement tracking
- Mini-profiles for hover cards
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum


class LeaderboardPeriod(str, Enum):
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"
    ALL_TIME = "all_time"


class LeaderboardCategory(str, Enum):
    XP = "xp"                  # Total XP earned
    TRUST = "trust"            # Trust score
    POSTS = "posts"            # Posts created
    IDEAS = "ideas"            # Ideas created
    VOTES = "votes"            # Votes received on ideas
    CONTRIBUTIONS = "contributions"  # Overall activity


class AchievementTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    LEGENDARY = "legendary"


class Achievement(BaseModel):
    """Individual achievement"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Achievement info
    achievement_type: str  # Unique identifier
    title: str
    description: str
    icon: str  # Icon name or URL
    tier: AchievementTier = AchievementTier.BRONZE
    
    # Progress tracking (for progressive achievements)
    progress: int = 0
    progress_max: int = 1
    is_completed: bool = False
    
    # Timestamps
    unlocked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Rewards given
    xp_reward: int = 0
    rp_reward: int = 0
    title_reward: Optional[str] = None  # Special title unlocked


class LeaderboardEntry(BaseModel):
    """Single entry in leaderboard"""
    rank: int
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    user_level: int = 1
    user_class: Optional[str] = None
    trust_score: float = 500.0
    
    # Score for this period
    score: float = 0.0
    score_change: float = 0.0  # Change since last period
    
    # Stats breakdown
    stats: Dict[str, Any] = Field(default_factory=dict)


class Leaderboard(BaseModel):
    """Full leaderboard for a period/category"""
    period: LeaderboardPeriod
    category: LeaderboardCategory
    entries: List[LeaderboardEntry] = Field(default_factory=list)
    
    # Metadata
    total_participants: int = 0
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


class UserMiniProfile(BaseModel):
    """Mini profile for hover cards"""
    user_id: str
    username: str
    avatar_url: Optional[str] = None
    
    # Ghost Protocol stats
    level: int = 1
    xp_total: int = 0
    trust_score: float = 500.0
    hierarchy: str = "ghost"
    class_type: Optional[str] = None
    equipped_title: Optional[str] = None
    
    # Activity stats
    posts_count: int = 0
    ideas_count: int = 0
    ideas_implemented: int = 0
    
    # Achievements preview (top 5)
    top_achievements: List[Achievement] = Field(default_factory=list)
    achievements_count: int = 0
    
    # Rankings
    current_month_rank: Optional[int] = None
    all_time_rank: Optional[int] = None
    
    # Timestamps
    joined_at: Optional[datetime] = None
    last_active: Optional[datetime] = None


class UserStats(BaseModel):
    """Full user statistics for profile"""
    user_id: str
    
    # Content stats
    posts_total: int = 0
    posts_this_month: int = 0
    posts_views_total: int = 0
    posts_likes_total: int = 0
    
    # Ideas stats
    ideas_total: int = 0
    ideas_implemented: int = 0
    ideas_votes_received: int = 0
    ideas_vote_score_total: float = 0.0
    
    # Engagement stats
    comments_total: int = 0
    likes_given: int = 0
    votes_cast: int = 0
    rp_spent_total: int = 0
    
    # Rankings history
    best_month_rank: Optional[int] = None
    best_year_rank: Optional[int] = None
    months_in_top_10: int = 0
    
    # Calculated at
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============================================
# ACHIEVEMENT DEFINITIONS
# ============================================

ACHIEVEMENT_DEFINITIONS = {
    # First actions
    "first_post": {
        "title": "First Voice",
        "description": "Published your first post",
        "icon": "message-square",
        "tier": "bronze",
        "xp_reward": 100
    },
    "first_idea": {
        "title": "Visionary",
        "description": "Submitted your first idea to Consensus",
        "icon": "lightbulb",
        "tier": "bronze",
        "xp_reward": 200
    },
    "first_vote": {
        "title": "Voice of the People",
        "description": "Cast your first vote",
        "icon": "vote",
        "tier": "bronze",
        "xp_reward": 50
    },
    
    # Milestones
    "posts_10": {
        "title": "Regular",
        "description": "Published 10 posts",
        "icon": "layers",
        "tier": "silver",
        "xp_reward": 500
    },
    "posts_100": {
        "title": "Content Creator",
        "description": "Published 100 posts",
        "icon": "star",
        "tier": "gold",
        "xp_reward": 2000
    },
    "ideas_implemented_1": {
        "title": "Change Maker",
        "description": "Had an idea implemented",
        "icon": "rocket",
        "tier": "gold",
        "xp_reward": 5000,
        "title_reward": "Architect"
    },
    "ideas_implemented_5": {
        "title": "Master Architect",
        "description": "Had 5 ideas implemented",
        "icon": "crown",
        "tier": "platinum",
        "xp_reward": 15000,
        "title_reward": "Master Architect"
    },
    
    # Rankings
    "top_month_1": {
        "title": "Monthly Monarch",
        "description": "Reached #1 in monthly rankings",
        "icon": "trophy",
        "tier": "legendary",
        "xp_reward": 10000,
        "title_reward": "Monarch"
    },
    "top_year_1": {
        "title": "Yearly Legend",
        "description": "Reached #1 in yearly rankings",
        "icon": "gem",
        "tier": "legendary",
        "xp_reward": 50000,
        "title_reward": "Legend"
    },
    
    # Trust
    "trust_750": {
        "title": "Trusted",
        "description": "Reached 750 Trust Score",
        "icon": "shield-check",
        "tier": "silver",
        "xp_reward": 1000
    },
    "trust_900": {
        "title": "Exemplary",
        "description": "Reached 900 Trust Score",
        "icon": "shield",
        "tier": "gold",
        "xp_reward": 3000
    },
    "trust_950": {
        "title": "Paragon",
        "description": "Reached 950 Trust Score",
        "icon": "award",
        "tier": "platinum",
        "xp_reward": 5000,
        "title_reward": "Paragon"
    },
}
