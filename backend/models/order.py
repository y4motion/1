from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class OrderItem(BaseModel):
    product_id: str
    title: str
    price: float
    quantity: int
    preorder: bool = False  # Is this a pre-order item?


class OrderBase(BaseModel):
    # Customer Information (for quick buy without registration)
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_full_name: Optional[str] = None
    
    # User ID (if registered user)
    user_id: Optional[str] = None
    
    # Order Details
    items: List[OrderItem]
    total_price: float
    currency: str = "RUB"
    
    # Delivery Information
    delivery_address: str
    delivery_days: int = 7  # Estimated delivery time
    
    # Payment Information
    payment_method: str  # 'tinkoff_card', 'tinkoff_sbp', 'crypto_usdt', 'crypto_usdc', etc.
    payment_network: Optional[str] = None  # For crypto: 'ethereum', 'bsc', 'polygon', 'tron', 'solana'
    payment_status: str = "pending"  # pending, processing, completed, failed, refunded
    
    # Order Status
    order_status: str = "pending"  # pending, confirmed, processing, shipped, delivered, cancelled


class OrderCreate(OrderBase):
    pass


class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"ORD-{str(uuid.uuid4())[:8].upper()}")
    
    # Transaction information
    transaction_hash: Optional[str] = None  # For crypto payments
    payment_id: Optional[str] = None  # For Tinkoff payments
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None


class OrderResponse(OrderBase):
    id: str
    order_number: str
    transaction_hash: Optional[str]
    payment_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]


class OrderUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None
    delivery_days: Optional[int] = None
    transaction_hash: Optional[str] = None
    payment_id: Optional[str] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
