from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class MessageBase(BaseModel):
    content: str
    message_type: str = "text"  # text, image, system


class Message(MessageBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str  # Cached
    user_avatar: Optional[str] = None  # Cached
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = False


class MessageCreate(BaseModel):
    content: str
    message_type: str = "text"


class ChatRoomBase(BaseModel):
    product_id: str
    room_type: str = "product"  # product, direct


class ChatRoom(ChatRoomBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    participants: List[str] = Field(default_factory=list)  # User IDs
    messages: List[Message] = Field(default_factory=list)
    last_message_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True


class ChatRoomResponse(ChatRoomBase):
    id: str
    participants: List[str]
    messages: List[Message]
    last_message_at: datetime
    created_at: datetime
    is_active: bool
