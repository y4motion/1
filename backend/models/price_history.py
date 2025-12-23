from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import uuid


class PricePoint(BaseModel):
    """Single price data point"""
    price: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PriceHistory(BaseModel):
    """Price history for a product"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    prices: List[PricePoint] = Field(default_factory=list)
    lowest_price: Optional[float] = None
    highest_price: Optional[float] = None
    average_price: Optional[float] = None
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def add_price(self, price: float):
        """Add new price point and update stats"""
        self.prices.append(PricePoint(price=price))
        
        # Update stats
        all_prices = [p.price for p in self.prices]
        self.lowest_price = min(all_prices)
        self.highest_price = max(all_prices)
        self.average_price = sum(all_prices) / len(all_prices)
        self.last_updated = datetime.now(timezone.utc)
        
        # Keep last 90 days only
        ninety_days_ago = datetime.now(timezone.utc) - timedelta(days=90)
        self.prices = [
            p for p in self.prices
            if p.timestamp > ninety_days_ago
        ]
