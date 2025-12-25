from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone
from enum import Enum


class SwapCondition(str, Enum):
    NEW = "new"  # Новый, в упаковке
    LIKE_NEW = "like_new"  # Как новый
    EXCELLENT = "excellent"  # Отличное
    GOOD = "good"  # Хорошее
    FAIR = "fair"  # Удовлетворительное
    PARTS = "parts"  # На запчасти


class SwapDeliveryType(str, Enum):
    MEETUP = "meetup"  # Личная встреча
    SHIPPING = "shipping"  # Доставка
    BOTH = "both"  # Оба варианта


class SwapListingStatus(str, Enum):
    ACTIVE = "active"
    SOLD = "sold"
    RESERVED = "reserved"
    EXPIRED = "expired"
    DELETED = "deleted"


class SwapImage(BaseModel):
    url: str
    is_primary: bool = False
    timestamp_verified: bool = False  # Фото с датой/рукой для верификации


class SwapListingBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=5000)
    category: str  # Категория товара
    subcategory: Optional[str] = None
    
    price: float = Field(..., ge=0)
    currency: str = "RUB"
    
    condition: SwapCondition = SwapCondition.GOOD
    
    images: List[SwapImage] = Field(default_factory=list)
    
    # Delivery options
    delivery_type: SwapDeliveryType = SwapDeliveryType.BOTH
    location: str  # Город/регион
    
    # Trade options
    accepts_trade: bool = False  # Готов к обмену
    trade_preferences: Optional[str] = None  # На что хочет обменять
    
    # Tags
    tags: List[str] = Field(default_factory=list)
    
    # Original purchase info (if from platform)
    original_order_id: Optional[str] = None  # ID заказа если куплен на платформе
    original_purchase_date: Optional[datetime] = None


class SwapListingCreate(SwapListingBase):
    pass


class SwapListing(SwapListingBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str  # ID продавца
    
    status: SwapListingStatus = SwapListingStatus.ACTIVE
    
    # Stats
    views: int = 0
    favorites_count: int = 0
    messages_count: int = 0
    
    # Moderation
    is_verified: bool = False  # Проверено модератором/AI
    ai_moderation_score: float = 0.0  # Оценка AI (0-1)
    ai_moderation_flags: List[str] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None  # Автоматическое истечение
    
    # Boost/Promotion
    is_boosted: bool = False
    boost_expires_at: Optional[datetime] = None


class SwapListingResponse(SwapListingBase):
    id: str
    seller_id: str
    status: SwapListingStatus
    views: int
    favorites_count: int
    messages_count: int
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    is_boosted: bool
    
    # Seller info (populated from user)
    seller_username: Optional[str] = None
    seller_rating: Optional[float] = None
    seller_deals_count: Optional[int] = None
    seller_verified: Optional[bool] = None


class SwapListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    condition: Optional[SwapCondition] = None
    images: Optional[List[SwapImage]] = None
    delivery_type: Optional[SwapDeliveryType] = None
    location: Optional[str] = None
    accepts_trade: Optional[bool] = None
    trade_preferences: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[SwapListingStatus] = None


# Seller Rating in Swap
class SwapSellerRating(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Rating stats
    total_rating: float = 0.0  # Average rating (1-5)
    total_reviews: int = 0
    successful_deals: int = 0
    cancelled_deals: int = 0
    
    # Trust score (0-1000)
    trust_score: int = 0
    
    # Badges
    badges: List[str] = Field(default_factory=list)  # ["verified", "top_seller", "helper", ...]
    
    # Verification
    phone_verified: bool = False
    id_verified: bool = False  # Паспорт
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
