from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
import uuid
from datetime import datetime, timezone


class CryptoNetwork(BaseModel):
    """Cryptocurrency network configuration"""
    id: str
    name: str  # 'Ethereum', 'BSC', 'Polygon', 'Tron', 'Solana'
    network_id: str  # 'ethereum', 'bsc', 'polygon', 'tron', 'solana'
    icon: Optional[str] = None
    is_active: bool = True
    rpc_url: Optional[str] = None
    gas_fee_estimate: float = 0.0  # Estimated gas fee in USD


class Stablecoin(BaseModel):
    """Stablecoin configuration"""
    id: str
    symbol: str  # 'USDT', 'USDC', 'DAI', 'BUSD', 'TUSD'
    name: str  # 'Tether', 'USD Coin', etc.
    icon: Optional[str] = None
    is_active: bool = True
    contract_addresses: Dict[str, str] = Field(default_factory=dict)  # network_id: contract_address


class PaymentMethodBase(BaseModel):
    name: str
    type: str  # 'card', 'sbp', 'qr', 'crypto'
    provider: str  # 'tinkoff', 'cryptomus', 'direct'
    is_active: bool = True
    icon: Optional[str] = None
    description: Optional[str] = None
    processing_fee_percent: float = 0.0
    min_amount: float = 0.01
    max_amount: float = 1000000.0
    
    # Crypto-specific fields
    supported_networks: List[str] = Field(default_factory=list)  # For crypto payments
    supported_coins: List[str] = Field(default_factory=list)  # For crypto payments
    
    # Configuration
    configuration: Dict[str, str] = Field(default_factory=dict)  # API keys, terminal IDs, etc.


class PaymentMethodCreate(PaymentMethodBase):
    pass


class PaymentMethod(PaymentMethodBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentMethodResponse(PaymentMethodBase):
    id: str
    created_at: datetime
    updated_at: datetime


class AdminSettings(BaseModel):
    """Global admin settings for the marketplace"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: "settings_v1")
    
    # Currency settings
    default_currency: str = "RUB"
    supported_currencies: List[str] = Field(default_factory=lambda: ["RUB", "USD", "CNY"])
    
    # Delivery settings
    default_delivery_days: int = 7
    preorder_delivery_days: int = 14
    
    # Payment settings
    payment_timeout_minutes: int = 15
    
    # Crypto settings
    active_stablecoins: List[Stablecoin] = Field(default_factory=list)
    active_networks: List[CryptoNetwork] = Field(default_factory=list)
    
    # Tinkoff settings (stored encrypted in production)
    tinkoff_terminal_key: Optional[str] = None
    tinkoff_secret_key: Optional[str] = None
    tinkoff_merchant_iban: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AdminSettingsUpdate(BaseModel):
    default_currency: Optional[str] = None
    supported_currencies: Optional[List[str]] = None
    default_delivery_days: Optional[int] = None
    preorder_delivery_days: Optional[int] = None
    payment_timeout_minutes: Optional[int] = None
    tinkoff_terminal_key: Optional[str] = None
    tinkoff_secret_key: Optional[str] = None
    tinkoff_merchant_iban: Optional[str] = None
