"""
Database initialization script.

This script creates all tables and inserts initial data.
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models import Base, User, Subscription, SubscriptionPlan, SubscriptionStatus
from database import engine, SessionLocal, init_db
from security import SecurityManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create all database tables."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")

def insert_initial_data(db: Session):
    """Insert initial data into the database."""
    logger.info("Inserting initial data...")
    
    # Check if admin user already exists
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        # Create admin user
        admin_password_hash = SecurityManager.get_password_hash("admin123")
        admin_user = User(
            username="admin",
            email="admin@example.com",
            password_hash=admin_password_hash,
            first_name="Admin",
            last_name="User"
        )
        db.add(admin_user)
        db.flush()  # Flush to get the ID
        
        # Create admin subscription (enterprise plan)
        admin_subscription = Subscription(
            user_id=admin_user.id,
            plan=SubscriptionPlan.ENTERPRISE,
            status=SubscriptionStatus.ACTIVE
        )
        db.add(admin_subscription)
    
    # Check if demo user already exists
    demo_user = db.query(User).filter(User.username == "demo").first()
    if not demo_user:
        # Create demo user
        demo_password_hash = SecurityManager.get_password_hash("demo123")
        demo_user = User(
            username="demo",
            email="demo@example.com",
            password_hash=demo_password_hash,
            first_name="Demo",
            last_name="User"
        )
        db.add(demo_user)
        db.flush()  # Flush to get the ID
        
        # Create demo subscription (free plan)
        demo_subscription = Subscription(
            user_id=demo_user.id,
            plan=SubscriptionPlan.FREE,
            status=SubscriptionStatus.ACTIVE
        )
        db.add(demo_subscription)
    
    db.commit()
    logger.info("Initial data inserted successfully.")

if __name__ == "__main__":
    """Initialize the database."""
    try:
        # Create tables
        create_tables()
        
        # Insert initial data
        db = SessionLocal()
        insert_initial_data(db)
        db.close()
        
        logger.info("Database initialization completed successfully.")
    
    except SQLAlchemyError as e:
        logger.error(f"Error initializing database: {e}")
    
    except Exception as e:
        logger.error(f"Unexpected error: {e}")