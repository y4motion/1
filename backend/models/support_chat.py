from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class SupportMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender: str  # "user" or "bot"
    text: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False


class SupportChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # Can be None for anonymous users
    session_token: str = Field(default_factory=lambda: str(uuid.uuid4()))  # For anonymous tracking
    title: str = "New Chat"
    messages: List[SupportMessage] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    unread_count: int = 0
    is_active: bool = True


class SupportChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    user_id: Optional[str] = None


class SupportChatSessionResponse(BaseModel):
    id: str
    user_id: Optional[str]
    title: str
    messages_count: int
    created_at: datetime
    updated_at: datetime
    unread_count: int
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None


class SendSupportMessageRequest(BaseModel):
    text: str
    session_id: Optional[str] = None  # If None, create new session
    session_token: Optional[str] = None  # For anonymous users


class SupportMessageResponse(BaseModel):
    id: str
    sender: str
    text: str
    timestamp: datetime
    read: bool


class ManagerRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: Optional[str] = None
    language: str = "en"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"  # pending, assigned, completed
    assigned_to: Optional[str] = None


class RequestManagerData(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    language: str = "en"
