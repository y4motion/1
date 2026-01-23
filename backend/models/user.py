from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional, List
import uuid
from datetime import datetime, timezone
import re


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    is_seller: Optional[bool] = False
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        # Only letters, numbers, underscore, hyphen
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscore and hyphen')
        
        # Forbidden words
        forbidden_words = ['admin', 'root', 'moderator', 'glassy', 'official', 'support', 'system']
        if any(word in v.lower() for word in forbidden_words):
            raise ValueError('Username contains forbidden word')
        
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    is_admin: bool = False
    is_seller: bool = False
    is_moderator: bool = False
    
    # ============================================
    # GHOST PROTOCOL - Core Stats (HARDCORE)
    # ============================================
    
    # XP System (permanent, cumulative)
    xp_total: int = 0
    level: int = 1
    experience: int = 0  # Legacy field
    
    # Trust Score (0-1000, default 500 neutral)
    trust_score: float = Field(default=500.0, ge=0.0, le=1000.0)
    
    # Resource Points (spendable, subject to entropy)
    rp_balance: int = 0
    monthly_rp: int = 0
    
    # Class System - HARDCORE
    class_type: Optional[str] = None  # architect, broker, observer
    class_tier: int = 0               # Mastery level within class (0-100)
    class_tier_xp: int = 0            # XP toward next tier
    class_selected_at: Optional[datetime] = None
    
    # Reboot System
    reboot_count: int = 0             # Times class was changed
    legacy_traits: List[str] = Field(default_factory=list)  # Passive bonuses from past classes
    
    # Hierarchy (ghost, phantom, operator, monarch)
    hierarchy: str = "ghost"
    
    # Inner Circle (Top 100 Monarchs only)
    is_inner_circle: bool = False
    inner_circle_rank: Optional[int] = None
    
    # Achievement Gating (for levels 70-80)
    completed_achievements: List[str] = Field(default_factory=list)
    
    # ============================================
    # LIVING LEGENDS - Hidden Layer
    # ============================================
    
    # Titles (Legacy, AI-Recognized, Unique Feats)
    titles: Dict[str, Any] = Field(default_factory=dict)  # {title_id: Title object}
    equipped_title: Optional[str] = None  # Currently displayed title
    
    # Hidden Metrics (for AI analysis)
    hidden_metrics: Dict[str, Any] = Field(default_factory=dict)
    
    # Registration order (for Legacy titles)
    registration_order: Optional[int] = None
    is_beta_user: bool = False
    
    # Anti-abuse tracking
    last_xp_gain: Optional[datetime] = None
    daily_xp_earned: int = 0
    daily_xp_reset_date: Optional[datetime] = None
    
    # Entropy tracking
    class_offline: bool = False  # Class bonuses disabled due to inactivity
    
    # ============================================
    # Legacy Gamification
    # ============================================
    coins: int = 0
    achievements: list = Field(default_factory=list)
    daily_quests: list = Field(default_factory=list)
    inventory: list = Field(default_factory=list)
    wishlist: list = Field(default_factory=list)
    
    # Streak and activity
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None
    
    # Status
    online_status: str = "online"
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    referral_code: Optional[str] = None
    joined_date: Optional[datetime] = None
    
    # Creator fields
    is_verified_creator: bool = False
    creator_profile_id: Optional[str] = None
    
    # Video hover privilege
    has_video_hover: bool = False
    video_hover_url: Optional[str] = None
    
    # Profile data
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    phone_verified: bool = False
    id_verified: bool = False
    
    # Radar chart stats (0-100)
    stats_speed: int = 50
    stats_trust: int = 50
    stats_comm: int = 50
    stats_tech: int = 50
    

class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_active: bool
    is_admin: bool
    is_seller: bool
    is_moderator: bool
    
    # Ghost Protocol Core
    xp_total: int = 0
    level: int = 1
    experience: int = 0
    trust_score: float = 500.0
    rp_balance: int = 0
    monthly_rp: int = 0
    class_type: Optional[str] = None
    hierarchy: str = "ghost"
    
    # Legacy/Gamification
    coins: int = 0
    achievements: list = Field(default_factory=list)
    daily_quests: list = Field(default_factory=list)
    inventory: list = Field(default_factory=list)
    wishlist: list = Field(default_factory=list)
    
    # Activity
    current_streak: int = 0
    longest_streak: int = 0
    online_status: str = "online"
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    referral_code: Optional[str] = None
    joined_date: Optional[datetime] = None
    
    # Creator
    is_verified_creator: bool = False
    creator_profile_id: Optional[str] = None
    has_video_hover: bool = False
    video_hover_url: Optional[str] = None
    
    # Profile
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    phone_verified: bool = False
    id_verified: bool = False
    
    # Radar stats
    stats_speed: int = 50
    stats_trust: int = 50
    stats_comm: int = 50
    stats_tech: int = 50


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
