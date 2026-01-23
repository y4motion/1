"""
Social Core Models - Network Posts (Enhanced)

Extended Post model for Ghost Network with:
- Categories (hardware, software, battlestations, guides)
- Draft/Moderation status
- Saves tracking
- Product references
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum


class PostCategory(str, Enum):
    HARDWARE = "hardware"
    SOFTWARE = "software"
    BATTLESTATIONS = "battlestations"
    GUIDES = "guides"
    GENERAL = "general"


class PostType(str, Enum):
    POST = "post"
    VIDEO = "video"
    GUIDE = "guide"
    REVIEW = "review"
    SHOWCASE = "showcase"


class PostStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class MediaAttachment(BaseModel):
    """Media attachment for posts"""
    type: str  # "image", "video", "gif"
    url: str
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[float] = None  # For videos, in seconds


class ProductReference(BaseModel):
    """Reference to a product mentioned in post"""
    product_id: str
    product_name: str
    product_price: Optional[float] = None
    product_image: Optional[str] = None
    position: Optional[Dict[str, float]] = None  # {"x": 0.5, "y": 0.3} for image overlay


class PostComment(BaseModel):
    """Comment on a network post"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    user_level: int = 1
    user_trust_score: float = 500.0
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    likes: int = 0
    liked_by: List[str] = Field(default_factory=list)
    
    # Reply chain
    parent_comment_id: Optional[str] = None
    replies_count: int = 0


class NetworkPostCreate(BaseModel):
    """Create new network post"""
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., max_length=10000)  # Markdown supported
    category: PostCategory = PostCategory.GENERAL
    post_type: PostType = PostType.POST
    media: List[MediaAttachment] = Field(default_factory=list)
    product_refs: List[ProductReference] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list, max_length=10)
    is_draft: bool = False


class NetworkPostUpdate(BaseModel):
    """Update existing post"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    content: Optional[str] = Field(None, max_length=10000)
    category: Optional[PostCategory] = None
    media: Optional[List[MediaAttachment]] = None
    product_refs: Optional[List[ProductReference]] = None
    tags: Optional[List[str]] = None


class NetworkPost(BaseModel):
    """Full network post model"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Author info
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    user_level: int = 1
    user_trust_score: float = 500.0
    user_class: Optional[str] = None
    
    # Content
    title: str
    content: str
    category: PostCategory = PostCategory.GENERAL
    post_type: PostType = PostType.POST
    media: List[MediaAttachment] = Field(default_factory=list)
    product_refs: List[ProductReference] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    
    # Status
    status: PostStatus = PostStatus.PUBLISHED
    moderation_notes: Optional[str] = None
    moderated_by: Optional[str] = None
    moderated_at: Optional[datetime] = None
    
    # Engagement stats
    views: int = 0
    likes: int = 0
    comments_count: int = 0
    saves_count: int = 0
    shares_count: int = 0
    
    # Interaction tracking
    liked_by: List[str] = Field(default_factory=list)
    saved_by: List[str] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    
    # Moderation
    is_pinned: bool = False
    is_featured: bool = False
    is_hidden: bool = False
    
    # Scoring for feed ranking
    hot_score: float = 0.0  # Calculated based on engagement velocity


class NetworkPostWithComments(NetworkPost):
    """Post with loaded comments"""
    comments: List[PostComment] = Field(default_factory=list)


class NetworkPostResponse(BaseModel):
    """API response for post"""
    post: NetworkPost
    is_liked: bool = False
    is_saved: bool = False
