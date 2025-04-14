"""
Configuration module for the Flask/FastAPI backend.
Manages environment variables and connection settings.
"""

import os
import secrets
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class Config:
    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
    
    # Redis configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_CACHE_EXPIRE: int = int(os.getenv("REDIS_CACHE_EXPIRE", "3600"))  # 1 hour default
    
    # Security configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_hex(32))
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))
    JWT_ACCESS_TOKEN_EXPIRES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", "3600"))  # 1 hour default
    JWT_REFRESH_TOKEN_EXPIRES: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", "604800"))  # 7 days default
    
    # CORS configuration
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # Application configuration
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    TESTING: bool = os.getenv("TESTING", "False").lower() in ("true", "1", "t")
    
    # Stripe configuration
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    # API configuration
    API_PREFIX: str = "/api"
    API_V1_STR: str = "/v1"
    
    # GDPR and compliance
    DATA_RETENTION_DAYS: int = int(os.getenv("DATA_RETENTION_DAYS", "730"))  # 2 years default
    PRIVACY_CONTACT_EMAIL: str = os.getenv("PRIVACY_CONTACT_EMAIL", "privacy@example.com")
        
# Create global config instance
config = Config()