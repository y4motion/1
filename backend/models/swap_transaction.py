from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone
from enum import Enum


class TransactionStatus(str, Enum):
    INITIATED = "initiated"  # Сделка начата
    NEGOTIATING = "negotiating"  # Переговоры
    PAYMENT_PENDING = "payment_pending"  # Ожидает оплаты
    PAYMENT_ESCROW = "payment_escrow"  # Деньги в эскроу
    SHIPPING = "shipping"  # Доставка
    DELIVERED = "delivered"  # Доставлено
    COMPLETED = "completed"  # Завершено
    CANCELLED = "cancelled"  # Отменено
    DISPUTED = "disputed"  # Спор


class TransactionType(str, Enum):
    SALE = "sale"  # Продажа
    TRADE = "trade"  # Обмен
    TRADE_WITH_PAYMENT = "trade_with_payment"  # Обмен с доплатой


class SwapTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    listing_id: str  # ID объявления
    seller_id: str
    buyer_id: str
    
    transaction_type: TransactionType = TransactionType.SALE
    status: TransactionStatus = TransactionStatus.INITIATED
    
    # Price info
    agreed_price: float = 0.0
    currency: str = "RUB"
    
    # For trades
    trade_offer_listing_id: Optional[str] = None  # Что предлагает покупатель в обмен
    trade_price_difference: float = 0.0  # Доплата
    
    # Escrow
    escrow_enabled: bool = False
    escrow_amount: float = 0.0
    escrow_released_at: Optional[datetime] = None
    
    # Delivery
    delivery_method: str = "meetup"  # meetup, shipping
    tracking_number: Optional[str] = None
    
    # Messages
    chat_id: Optional[str] = None  # ID чата сделки
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    
    # Dispute
    dispute_reason: Optional[str] = None
    dispute_opened_at: Optional[datetime] = None
    dispute_resolved_at: Optional[datetime] = None


class SwapTransactionCreate(BaseModel):
    listing_id: str
    transaction_type: TransactionType = TransactionType.SALE
    agreed_price: float
    currency: str = "RUB"
    trade_offer_listing_id: Optional[str] = None
    trade_price_difference: float = 0.0
    delivery_method: str = "meetup"
    escrow_enabled: bool = False


class SwapTransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    tracking_number: Optional[str] = None
    dispute_reason: Optional[str] = None


# Review after transaction
class SwapReview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_id: str
    
    reviewer_id: str  # Кто оставил отзыв
    reviewed_user_id: str  # О ком отзыв
    
    rating: int = Field(..., ge=1, le=5)  # 1-5 звёзд
    comment: Optional[str] = None
    
    # Detailed ratings
    communication_rating: Optional[int] = None  # Общение
    accuracy_rating: Optional[int] = None  # Соответствие описанию
    delivery_rating: Optional[int] = None  # Скорость/качество доставки
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Response from reviewed user
    response: Optional[str] = None
    response_at: Optional[datetime] = None


class SwapReviewCreate(BaseModel):
    transaction_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    communication_rating: Optional[int] = None
    accuracy_rating: Optional[int] = None
    delivery_rating: Optional[int] = None
