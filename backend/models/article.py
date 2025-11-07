from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone
from .post import ShoppableTag, MediaAttachment


class ArticleCreate(BaseModel):
    title: str = Field(..., max_length=200)
    subtitle: Optional[str] = Field(None, max_length=300)
    content: str = Field(..., min_length=100)  # Rich text/markdown
    cover_image: Optional[str] = None
    category: str = Field(..., description="IT, Hardware, News, Reviews, Guides")
    tags: List[str] = Field(default_factory=list)
    shoppable_tags: Optional[List[ShoppableTag]] = Field(default_factory=list)
    is_draft: bool = False


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    shoppable_tags: Optional[List[ShoppableTag]] = None
    is_draft: Optional[bool] = None


class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    user_level: int = 1
    is_verified_creator: bool = False
    
    title: str
    subtitle: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    category: str
    tags: List[str] = Field(default_factory=list)
    shoppable_tags: List[ShoppableTag] = Field(default_factory=list)
    
    # Engagement metrics
    views: int = 0
    likes: int = 0
    bookmarks: int = 0
    shares: int = 0
    read_time: int = 0  # Estimated minutes
    
    liked_by: List[str] = Field(default_factory=list)
    bookmarked_by: List[str] = Field(default_factory=list)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    
    is_draft: bool = False
    is_featured: bool = False
    
    # Moderation
    status: str = "pending"  # pending, approved, rejected


class ArticleResponse(Article):
    """Article with additional computed fields"""
    comments_count: int = 0
