from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class UserStats(BaseModel):
    """User statistics for gamification and rating - Ghost Protocol"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    
    # ============================================
    # GHOST PROTOCOL - Core Metrics
    # ============================================
    
    # XP System (permanent)
    total_xp: int = 0
    current_level: int = 1
    xp_to_next_level: int = 100  # Calculated dynamically
    xp_progress_percent: float = 0.0
    
    # Trust Score (0-1000)
    trust_score: float = Field(default=500.0, ge=0.0, le=1000.0)
    trust_tier: str = "neutral"  # verified, neutral, warning, danger
    trust_halo_color: str = "rgba(255,255,255,0.4)"
    
    # Resource Points
    rp_balance: int = 0
    rp_cap: int = 100  # Max RP user can hold (calculated)
    monthly_rp: int = 0
    monthly_rank: Optional[int] = None
    last_reset_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Class System
    class_type: Optional[str] = None  # architect, broker, observer
    class_icon: str = "○"
    class_name: str = "Unspecialized"
    class_selected_at: Optional[datetime] = None
    
    # Hierarchy
    hierarchy: str = "ghost"  # ghost, phantom, operator, monarch
    hierarchy_level_range: str = "0-9"
    
    # Vote Weight
    vote_weight: float = Field(default=1.0)
    
    # ============================================
    # Activity & Streaks
    # ============================================
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None
    days_since_active: int = 0
    
    # Anti-abuse tracking
    last_xp_gain: Optional[datetime] = None
    daily_xp_earned: int = 0
    daily_xp_cap_remaining: int = 1000
    action_counts_today: dict = Field(default_factory=dict)  # {"like_given": 5, "comment": 3}
    
    # ============================================
    # Social Stats
    # ============================================
    total_posts: int = 0
    total_articles: int = 0
    total_comments: int = 0
    total_votes_cast: int = 0
    
    # Engagement received
    total_likes_received: int = 0
    total_reposts_received: int = 0
    followers_count: int = 0
    
    # Commerce
    total_purchases: int = 0
    total_sales: int = 0
    total_swaps: int = 0
    total_spent: float = 0.0
    total_earned: float = 0.0
    total_reviews_written: int = 0
    total_builds_shared: int = 0
    
    # ============================================
    # Achievements & Inventory
    # ============================================
    achievements: List[str] = Field(default_factory=list)
    legendary_achievements: List[str] = Field(default_factory=list)
    artifacts: List[str] = Field(default_factory=list)  # Theme IDs, skins
    protocols: List[dict] = Field(default_factory=list)  # Active boosts
    
    # Privileges
    has_video_hover: bool = False
    video_hover_url: Optional[str] = None
    has_hidden_armory_access: bool = False
    has_direct_line_access: bool = False
    
    # Radar Chart Stats (0-100)
    stats_speed: int = 50
    stats_trust: int = 50
    stats_comm: int = 50
    stats_tech: int = 50
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None


class Achievement(BaseModel):
    """Achievement definition"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_ru: str
    description: str
    description_ru: str
    icon: str  # Emoji or icon name
    category: str  # "Social", "Commerce", "Content", "Legendary"
    rarity: str  # "Common", "Rare", "Epic", "Legendary"
    xp_reward: int = 0
    rp_reward: int = 0
    requirements: dict = Field(default_factory=dict)  # {"total_purchases": 10}
    is_legendary: bool = False


class XPTransaction(BaseModel):
    """XP/RP transaction log"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    point_type: str  # "xp" or "rp"
    amount: int
    action: str  # "purchase", "post_liked", "article_published", "vote_cast"
    description: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MonthlyLeaderboard(BaseModel):
    """Monthly leaderboard snapshot"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month: str  # "2025-01"
    top_users: List[dict] = Field(default_factory=list)  # [{"user_id": "", "username": "", "rp": 0, "rank": 1}]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
