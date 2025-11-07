from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    is_seller: Optional[bool] = False  # Allow setting seller status during registration (for testing)


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
    
    # Gamification fields
    level: int = 1
    experience: int = 0
    coins: int = 0
    achievements: list = Field(default_factory=list)
    daily_quests: list = Field(default_factory=list)
    inventory: list = Field(default_factory=list)
    wishlist: list = Field(default_factory=list)  # Product IDs
    
    # New social/rating fields
    monthly_rp: int = 0  # Rating Points (resets monthly)
    current_streak: int = 0  # Days of continuous activity
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
    

class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_active: bool
    is_admin: bool
    is_seller: bool
    is_moderator: bool
    level: int
    experience: int
    coins: int
    achievements: list
    daily_quests: list
    inventory: list
    wishlist: list
    monthly_rp: int
    current_streak: int
    online_status: str
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    referral_code: Optional[str] = None
    joined_date: Optional[datetime] = None
    is_verified_creator: bool
    creator_profile_id: Optional[str] = None
    has_video_hover: bool
    video_hover_url: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
