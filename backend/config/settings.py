from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings with validation"""
    
    # App Info
    APP_NAME: str = "Glassy Market"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    MONGO_URL: str
    DB_NAME: str
    
    # Security & Authentication
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Redis Cache
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_ENABLED: bool = False
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # AI Integration Keys
    DEEPSEEK_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    EMERGENT_LLM_KEY: Optional[str] = None
    
    # Payment Gateways
    TINKOFF_TERMINAL_KEY: Optional[str] = None
    TINKOFF_SECRET_KEY: Optional[str] = None
    CRYPTOMUS_MERCHANT_ID: Optional[str] = None
    CRYPTOMUS_API_KEY: Optional[str] = None
    
    # Email Service
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@glassy-market.com"
    
    # External Services
    SENTRY_DSN: Optional[str] = None
    S3_BUCKET: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_STORAGE: str = "memory"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()


def validate_settings():
    """Validate critical settings and warn about issues"""
    warnings = []
    errors = []
    
    # Production checks
    if settings.ENVIRONMENT == "production":
        if "your-secret-key-here" in settings.SECRET_KEY.lower() or len(settings.SECRET_KEY) < 32:
            errors.append("❌ SECRET_KEY must be changed and be at least 32 characters in production!")
        
        if settings.DEBUG:
            errors.append("❌ DEBUG must be False in production!")
        
        if not settings.SENTRY_DSN:
            warnings.append("⚠️ SENTRY_DSN not set - error tracking disabled")
        
        if settings.CORS_ORIGINS == "*" or "localhost" in settings.CORS_ORIGINS:
            warnings.append("⚠️ CORS_ORIGINS should be restricted in production")
    
    # General checks
    if not settings.MONGO_URL:
        errors.append("❌ MONGO_URL is required!")
    
    if not settings.DB_NAME:
        errors.append("❌ DB_NAME is required!")
    
    # Print results
    logger.info(f"🔧 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🔧 Debug mode: {settings.DEBUG}")
    logger.info(f"🔧 Database: {settings.DB_NAME}")
    logger.info(f"🔧 Redis: {'Enabled' if settings.REDIS_ENABLED else 'Disabled'}")
    
    if warnings:
        for warning in warnings:
            logger.warning(warning)
    
    if errors:
        error_msg = "Configuration errors:\n" + "\n".join(errors)
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    logger.info("✅ Settings validated successfully")


# Run validation on import
try:
    validate_settings()
except ValueError as e:
    logger.error(f"Configuration validation failed: {e}")
    # Don't crash in development, just warn
    if settings.ENVIRONMENT == "production":
        raise
