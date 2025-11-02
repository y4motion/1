from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class AnswerBase(BaseModel):
    content: str
    helpful_count: int = 0


class Answer(AnswerBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str  # Cached
    user_avatar: Optional[str] = None  # Cached
    is_seller: bool = False  # Flag if answer from product seller
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AnswerCreate(BaseModel):
    content: str


class QuestionBase(BaseModel):
    product_id: str
    question: str
    helpful_count: int = 0


class QuestionCreate(BaseModel):
    product_id: str
    question: str


class Question(QuestionBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str  # Cached
    user_avatar: Optional[str] = None  # Cached
    answers: List[Answer] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "active"  # active, archived


class QuestionResponse(QuestionBase):
    id: str
    user_id: str
    username: str
    user_avatar: Optional[str]
    answers: List[Answer]
    created_at: datetime
    status: str
