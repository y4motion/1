from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class UserStats(BaseModel):
    """User statistics for gamification and rating"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    
    # Experience Points (XP) - Permanent, cumulative
    total_xp: int = 0
    current_level: int = 1
    xp_to_next_level: int = 1000
    
    # Rating Points (RP) - Temporary, monthly reset
    monthly_rp: int = 0
    monthly_rank: Optional[int] = None
    last_reset_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Achievements
    achievements: List[str] = Field(default_factory=list)
    legendary_achievements: List[str] = Field(default_factory=list)  # Top-10 monthly badges
    
    # Streak and activity
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None
    
    # Social stats
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
    total_spent: float = 0.0
    total_reviews_written: int = 0
    
    # Vote weight
    vote_weight: float = Field(default=1.0, description="Weight = 1 + (Level / 10)")
    
    # Video hover privilege
    has_video_hover: bool = False
    video_hover_url: Optional[str] = None
    
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
