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
    avatar_url: Optional[str] = None
    phone: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
