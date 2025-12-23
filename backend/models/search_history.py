from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional
import uuid


class SearchHistory(BaseModel):
    """Track search queries for analytics"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # Can be null for anonymous users
    query: str
    results_count: int = 0
    clicked_product_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Analytics data
    filters_used: dict = Field(default_factory=dict)
    category_id: Optional[str] = None
    persona_id: Optional[str] = None
    device_type: Optional[str] = None  # mobile, tablet, desktop
    session_id: Optional[str] = None
