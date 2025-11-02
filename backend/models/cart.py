from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


class CartItemBase(BaseModel):
    product_id: str
    quantity: int = 1
    price: float  # Cached price at time of adding


class CartItem(CartItemBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_title: str  # Cached
    product_image: str  # Cached
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CartBase(BaseModel):
    user_id: str
    items: List[CartItem] = Field(default_factory=list)


class Cart(CartBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    total: float = 0.0
    item_count: int = 0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CartResponse(CartBase):
    id: str
    total: float
    item_count: int
    updated_at: datetime


class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1


class UpdateCartItemRequest(BaseModel):
    quantity: int
