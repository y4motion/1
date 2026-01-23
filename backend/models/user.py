from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
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
    is_seller: bool = False  # Can create/sell products
    is_moderator: bool = False  # Can moderate content
    
    # ============================================
    # GHOST PROTOCOL - Core Stats
    # ============================================
    
    # XP System (permanent, cumulative)
    xp_total: int = 0  # Total experience (never resets)
    level: int = 1  # Cached level (calculated from xp_total)
    experience: int = 0  # Legacy field, synced with xp_total
    
    # Trust Score (0-1000, default 500 neutral)
    trust_score: float = Field(default=500.0, ge=0.0, le=1000.0)
    
    # Resource Points (spendable currency for influence)
    rp_balance: int = 0
    monthly_rp: int = 0  # Rating Points (resets monthly)
    
    # Class System (Neural Pathways)
    class_type: Optional[str] = None  # architect, broker, observer, or None
    class_selected_at: Optional[datetime] = None
    
    # Hierarchy (computed from level): ghost, phantom, operator, monarch
    hierarchy: str = "ghost"
    
    # Anti-abuse tracking
    last_xp_gain: Optional[datetime] = None
    daily_xp_earned: int = 0  # Resets daily for social actions
    daily_xp_reset_date: Optional[datetime] = None
    
    # ============================================
    # Legacy Gamification (kept for compatibility)
    # ============================================
    coins: int = 0
    achievements: list = Field(default_factory=list)
    daily_quests: list = Field(default_factory=list)
    inventory: list = Field(default_factory=list)  # Artifacts, protocols
    wishlist: list = Field(default_factory=list)  # Product IDs
    
    # Streak and activity
    current_streak: int = 0  # Days of continuous activity
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None
    
    # Status
    online_status: str = "online"  # "online", "away", "busy", "offline"
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    referral_code: Optional[str] = None
    joined_date: Optional[datetime] = None
    
    # Creator fields
    is_verified_creator: bool = False
    creator_profile_id: Optional[str] = None
    
    # Video hover privilege (Top-10 monthly)
    has_video_hover: bool = False
    video_hover_url: Optional[str] = None
    
    # Profile data
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    phone_verified: bool = False
    id_verified: bool = False  # Passport verification
    
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
