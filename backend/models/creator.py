from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class CreatorAssembly(BaseModel):
    """Product list from creator's review - one-click purchase"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # "Ultimate Gaming Setup 2025"
    description: Optional[str] = None
    product_ids: List[str] = Field(default_factory=list)
    total_price: float = 0.0
    discount_code: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreatorProfileCreate(BaseModel):
    display_name: str = Field(..., max_length=100)
    bio: str = Field(..., max_length=500)
    specialization: List[str] = Field(default_factory=list)  # ["Gaming", "Hardware Reviews", "Streaming"]
    social_links: dict = Field(default_factory=dict)  # {"youtube": "url", "twitter": "url"}
    banner_image: Optional[str] = None


class CreatorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    
    display_name: str
    bio: str
    specialization: List[str] = Field(default_factory=list)
    social_links: dict = Field(default_factory=dict)
    banner_image: Optional[str] = None
    video_hover: Optional[str] = None  # Video URL for profile hover effect
    
    # Verification and status
    is_verified: bool = False
    is_featured: bool = False
    verified_at: Optional[datetime] = None
    
    # Stats
    followers: int = 0
    total_reviews: int = 0
    total_views: int = 0
    total_likes: int = 0
    
    # Creator assemblies
    assemblies: List[CreatorAssembly] = Field(default_factory=list)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None


class CreatorReview(BaseModel):
    """Creator's product review/content"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    creator_name: str
    
    title: str
    content: str
    product_ids: List[str] = Field(default_factory=list)  # Products reviewed
    media_url: Optional[str] = None  # Video/image
    category: str  # "Review", "Unboxing", "Comparison", "Guide"
    
    views: int = 0
    likes: int = 0
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
