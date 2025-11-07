from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class MediaAttachment(BaseModel):
    """Media attachment for posts (image, video, etc.)"""
    type: str  # "image", "video", "gif"
    url: str
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class ShoppableTag(BaseModel):
    """Product tag in post for quick purchase"""
    product_id: str
    product_name: str
    product_price: float
    product_image: str
    position: Optional[dict] = None  # {"x": 0.5, "y": 0.3} for image overlay


class PostCreate(BaseModel):
    content: str = Field(..., max_length=5000)
    media: Optional[List[MediaAttachment]] = Field(default_factory=list)
    shoppable_tags: Optional[List[ShoppableTag]] = Field(default_factory=list)
    repost_of: Optional[str] = None  # Original post ID if this is a repost


class CommentCreate(BaseModel):
    content: str = Field(..., max_length=2000)


class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    likes: int = 0
    liked_by: List[str] = Field(default_factory=list)  # User IDs who liked


class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    user_level: int = 1
    content: str
    media: List[MediaAttachment] = Field(default_factory=list)
    shoppable_tags: List[ShoppableTag] = Field(default_factory=list)
    
    # Engagement metrics
    likes: int = 0
    reposts: int = 0
    comments_count: int = 0
    views: int = 0
    
    # Interaction tracking
    liked_by: List[str] = Field(default_factory=list)  # User IDs
    reposted_by: List[str] = Field(default_factory=list)
    
    # Repost info
    is_repost: bool = False
    repost_of: Optional[str] = None  # Original post ID
    original_author: Optional[str] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    
    # Moderation
    is_pinned: bool = False
    is_hidden: bool = False


class PostWithComments(Post):
    """Post with comments for detailed view"""
    comments: List[Comment] = Field(default_factory=list)
