"""
SQLAlchemy database models for the backend.
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

# Create declarative base
Base = declarative_base()

# Enum classes
class SubscriptionPlan(enum.Enum):
    FREE = 'free'
    BASIC = 'basic'
    PRO = 'pro'
    ENTERPRISE = 'enterprise'

class SubscriptionStatus(enum.Enum):
    ACTIVE = 'active'
    PAST_DUE = 'past_due'
    CANCELED = 'canceled'
    TRIAL = 'trial'

class OrderStatus(enum.Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    SHIPPED = 'shipped'
    DELIVERED = 'delivered'
    CANCELED = 'canceled'
    RETURNED = 'returned'

class PaymentStatus(enum.Enum):
    PENDING = 'pending'
    PAID = 'paid'
    FAILED = 'failed'
    REFUNDED = 'refunded'

# Models
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User {self.username}>"

class Subscription(Base):
    __tablename__ = 'subscriptions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    plan = Column(Enum(SubscriptionPlan), nullable=False, default=SubscriptionPlan.FREE)
    status = Column(Enum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.TRIAL)
    stripe_customer_id = Column(String(100), nullable=True)
    stripe_subscription_id = Column(String(100), nullable=True)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    
    def __repr__(self):
        return f"<Subscription {self.id} - {self.plan.value}>"

class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(String(50), nullable=False)  # Store as string to handle all currencies and formats
    sale_price = Column(String(50), nullable=True)
    cost_price = Column(String(50), nullable=True)
    inventory = Column(Integer, nullable=True)
    category = Column(String(100), nullable=True)
    image_url = Column(String(255), nullable=True)
    rating = Column(String(5), nullable=True)  # Store as string for flexibility (e.g., "4.5")
    review_count = Column(Integer, nullable=True)
    trending = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Product {self.name}>"

class Supplier(Base):
    __tablename__ = 'suppliers'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    min_order = Column(Integer, nullable=True)
    shipping_time = Column(String(100), nullable=True)
    return_policy = Column(String(255), nullable=True)
    price = Column(String(50), nullable=True)  # Store as string to handle all currencies and formats
    rating = Column(String(5), nullable=True)  # Store as string for flexibility (e.g., "4.5")
    review_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Supplier {self.name}>"

class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True)
    order_number = Column(String(50), nullable=False, unique=True)
    customer_id = Column(Integer, nullable=True)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(100), nullable=True)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    payment_status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    fulfillment = Column(String(50), nullable=True)
    total = Column(String(50), nullable=False)  # Store as string to handle all currencies and formats
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    payments = relationship("Payment", back_populates="order")
    
    def __repr__(self):
        return f"<Order {self.order_number}>"

class Payment(Base):
    __tablename__ = 'payments'
    
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=True)
    amount = Column(String(50), nullable=False)  # Store as string to handle all currencies and formats
    currency = Column(String(10), nullable=True, default="USD")
    payment_method = Column(String(50), nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    stripe_payment_id = Column(String(100), nullable=True)
    stripe_customer_id = Column(String(100), nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="payments")
    
    def __repr__(self):
        return f"<Payment {self.id} - {self.amount}>"

class Campaign(Base):
    __tablename__ = 'campaigns'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    platform = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    budget = Column(String(50), nullable=False)  # Store as string to handle all currencies and formats
    date_range = Column(String(100), nullable=True)
    clicks = Column(Integer, nullable=True)
    conversions = Column(Integer, nullable=True)
    roas = Column(String(50), nullable=True)  # Return on Ad Spend, stored as string for flexibility (e.g., "3.5x")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Campaign {self.name}>"

class SocialAccount(Base):
    __tablename__ = 'social_accounts'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    platform = Column(String(50), nullable=False)
    username = Column(String(100), nullable=False)
    access_token = Column(String(255), nullable=True)
    token_secret = Column(String(255), nullable=True)
    refresh_token = Column(String(255), nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    followers = Column(Integer, nullable=True)
    last_post_date = Column(DateTime, nullable=True)
    connected = Column(Boolean, default=False)
    status = Column(String(20), nullable=False, default='pending')
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<SocialAccount {self.platform} - {self.username}>"

class ScheduledPost(Base):
    __tablename__ = 'scheduled_posts'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    social_account_id = Column(Integer, ForeignKey('social_accounts.id'), nullable=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=True)
    content = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    video_url = Column(String(255), nullable=True)
    link = Column(String(255), nullable=True)
    platform = Column(String(50), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default='pending')
    posted_at = Column(DateTime, nullable=True)
    post_id = Column(String(100), nullable=True)  # Platform's post ID after posting
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ScheduledPost {self.id} - {self.platform}>"