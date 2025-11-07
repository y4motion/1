from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class GroupBuyCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=2000)
    product_id: str
    product_name: str
    product_image: str
    
    # Pricing
    original_price: float
    target_price: float  # Price at goal
    min_participants: int = Field(..., ge=2)
    max_participants: Optional[int] = None
    
    # Timeline
    deadline: datetime  # Must be future date
    
    # Requirements
    terms: str = Field(..., max_length=1000)


class Participant(BaseModel):
    """Group buy participant"""
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    quantity: int = 1
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    has_paid: bool = False


class GroupBuy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organizer_id: str
    organizer_username: str
    organizer_avatar: Optional[str] = None
    
    title: str
    description: str
    product_id: str
    product_name: str
    product_image: str
    
    # Pricing
    original_price: float
    target_price: float
    current_price: float  # Calculated based on current participants
    min_participants: int
    max_participants: Optional[int] = None
    
    # Status
    status: str = "active"  # active, successful, failed, completed
    current_participants: int = 0
    participants: List[Participant] = Field(default_factory=list)
    
    # Timeline
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deadline: datetime
    completed_at: Optional[datetime] = None
    
    # Terms and discussion
    terms: str
    views: int = 0
    comments_count: int = 0
    
    # Engagement
    interested_users: List[str] = Field(default_factory=list)  # User IDs who marked interest


class GroupBuyComment(BaseModel):
    """Comment on group buy"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    groupbuy_id: str
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
