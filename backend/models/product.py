from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class ProductImage(BaseModel):
    url: str
    alt: Optional[str] = None
    is_primary: bool = False


class ProductSpecification(BaseModel):
    name: str
    value: str


class ProductBase(BaseModel):
    title: str
    description: str
    category_id: str
    price: float
    currency: str = "USD"
    images: List[ProductImage] = Field(default_factory=list)
    specifications: List[ProductSpecification] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    stock: int = 0
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str  # User ID who created/owns this product
    views: int = 0
    wishlist_count: int = 0
    purchases_count: int = 0
    average_rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"  # pending, approved, rejected


class ProductResponse(ProductBase):
    id: str
    seller_id: str
    views: int
    wishlist_count: int
    purchases_count: int
    average_rating: float
    total_reviews: int
    created_at: datetime
    updated_at: datetime
    status: str


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    images: Optional[List[ProductImage]] = None
    specifications: Optional[List[ProductSpecification]] = None
    tags: Optional[List[str]] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
