"""Activity Feed Models and Routes for Live Activity Feed"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum

class ActivityType(str, Enum):
    PURCHASE = "purchase"
    VIEW = "view"
    CART = "cart"
    BUILD = "build"
    REVIEW = "review"
    LOWSTOCK = "lowstock"
    LISTING = "listing"  # new swap listing

class ActivityCreate(BaseModel):
    type: ActivityType
    user_id: Optional[str] = None
    user_name: Optional[str] = None  # anonymized or first name only
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None  # count, price, rating, etc.

class ActivityResponse(BaseModel):
    id: str
    type: str
    user: Optional[Dict[str, str]] = None
    product: Optional[Dict[str, str]] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: str

class OnlineStatsResponse(BaseModel):
    online_count: int
    active_sessions: int
    peak_today: int
