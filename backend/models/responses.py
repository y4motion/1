from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, List, Any
from datetime import datetime, timezone

T = TypeVar('T')


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response"""
    success: bool = True
    data: T
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error: str
    error_code: Optional[str] = None
    details: Optional[dict] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    page: int
    limit: int
    total: int
    pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response with metadata"""
    success: bool = True
    data: List[T]
    pagination: PaginationMeta
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MetaResponse(BaseModel):
    """Response with custom metadata"""
    success: bool = True
    data: Any
    meta: dict
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MessageResponse(BaseModel):
    """Simple message response"""
    success: bool = True
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
