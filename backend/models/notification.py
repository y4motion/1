from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid


class NotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    message: str
    link: Optional[str] = None
    metadata: Optional[dict] = Field(default_factory=dict)


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: Literal[
        'order_update',
        'price_drop',
        'restock',
        'post_like',
        'comment',
        'follow',
        'message',
        'review',
        'achievement',
        'system'
    ]
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Additional data
    metadata: dict = Field(default_factory=dict)
