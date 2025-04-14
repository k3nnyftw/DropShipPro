"""
Database connection and session management for SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import redis
from dotenv import load_dotenv
import os

# Import config
from config import config

# Load environment variables
load_dotenv()

# Create SQLAlchemy engine
engine = create_engine(
    config.DATABASE_URL,
    pool_pre_ping=True,  # Check connection before using it
    pool_recycle=3600,   # Recycle connections after 1 hour
    echo=config.DEBUG    # Log SQL queries in debug mode
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create scoped session for thread safety
db_session = scoped_session(SessionLocal)

# Base class for SQLAlchemy models
Base = declarative_base()
Base.query = db_session.query_property()

# Redis connection
redis_client = redis.from_url(config.REDIS_URL, decode_responses=True) if config.REDIS_URL else None

def get_db():
    """
    Get database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initialize database.
    """
    # Import models to register them with the metadata
    import models
    
    # Create all tables
    Base.metadata.create_all(bind=engine)

def clear_cache(key_pattern="*"):
    """
    Clear Redis cache.
    
    Args:
        key_pattern: Pattern of keys to clear (default: all)
    """
    if redis_client:
        if key_pattern == "*":
            redis_client.flushdb()
        else:
            keys = redis_client.keys(key_pattern)
            if keys:
                redis_client.delete(*keys)