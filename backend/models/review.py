from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class ReviewBase(BaseModel):
    product_id: str
    rating: float = Field(ge=0, le=5)  # 0-5 stars
    title: Optional[str] = None
    comment: str
    helpful_count: int = 0
    unhelpful_count: int = 0


class ReviewCreate(BaseModel):
    product_id: str
    rating: float = Field(ge=0, le=5)
    title: Optional[str] = None
    comment: str


class Review(ReviewBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str  # Cached for display
    user_avatar: Optional[str] = None  # Cached for display
    is_verified_purchase: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "approved"  # pending, approved, rejected


class ReviewResponse(ReviewBase):
    id: str
    user_id: str
    username: str
    user_avatar: Optional[str]
    is_verified_purchase: bool
    created_at: datetime
    updated_at: datetime
    status: str


class ReviewReaction(BaseModel):
    """User reactions to reviews (helpful/unhelpful)"""
    review_id: str
    user_id: str
    reaction_type: str  # "helpful" or "unhelpful"
