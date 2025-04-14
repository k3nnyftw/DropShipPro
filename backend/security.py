"""
Security module for the backend API.

This module handles:
1. Authentication and authorization
2. Password hashing and verification
3. JWT token generation and validation
4. Rate limiting
5. Security headers configuration
"""

import jwt
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Union, List
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from flask import Request
from models import User, Subscription, SubscriptionPlan
from config import config

# Configure logging
logger = logging.getLogger(__name__)

# Configure password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecurityManager:
    """Handles security-related operations."""
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Hash a password securely.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against a hash.
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password
            
        Returns:
            True if the password matches the hash, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token.
        
        Args:
            data: Data to encode in the token
            expires_delta: Expiration time for the token
            
        Returns:
            JWT token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
            
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, config.JWT_SECRET_KEY, algorithm="HS256")
        
        return encoded_jwt
    
    @staticmethod
    def decode_access_token(token: str) -> Dict[str, Any]:
        """
        Decode and validate a JWT access token.
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token data
        """
        try:
            payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=["HS256"])
            return {"success": True, "data": payload}
        except jwt.ExpiredSignatureError:
            return {"success": False, "error": "Token has expired"}
        except jwt.InvalidTokenError:
            return {"success": False, "error": "Invalid token"}
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Union[User, bool]:
        """
        Authenticate a user.
        
        Args:
            db: Database session
            username: Username
            password: Plain text password
            
        Returns:
            User object if authentication is successful, False otherwise
        """
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            return False
            
        if not SecurityManager.verify_password(password, user.password_hash):
            return False
            
        return user
    
    @staticmethod
    def check_subscription_access(db: Session, user_id: int, feature: str) -> bool:
        """
        Check if a user has access to a premium feature.
        
        Args:
            db: Database session
            user_id: User ID
            feature: Feature to check access for
            
        Returns:
            True if the user has access, False otherwise
        """
        # Get user's subscription
        subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()
        
        if not subscription:
            # Default to free plan if no subscription exists
            return SecurityManager._has_feature_access(SubscriptionPlan.FREE, feature)
        
        # Check if subscription is active
        if subscription.status != "active" and subscription.status != "trial":
            return False
        
        # Check if feature is available in the current plan
        return SecurityManager._has_feature_access(subscription.plan, feature)
    
    @staticmethod
    def _has_feature_access(plan: SubscriptionPlan, feature: str) -> bool:
        """
        Check if a feature is available in a subscription plan.
        
        This is a simplified version. In a real implementation,
        this would check against a database of features per plan.
        
        Args:
            plan: Subscription plan
            feature: Feature to check access for
            
        Returns:
            True if the feature is available, False otherwise
        """
        # Free plan features
        free_features = [
            "basic_analytics",
            "basic_supplier_search",
            "manual_order_fulfillment",
            "basic_product_discovery"
        ]
        
        # Basic plan features
        basic_features = free_features + [
            "email_marketing",
            "social_media_sharing",
            "basic_inventory_management",
            "basic_competitor_tracking"
        ]
        
        # Pro plan features
        pro_features = basic_features + [
            "advanced_analytics",
            "automatic_order_fulfillment",
            "advanced_inventory_management",
            "price_optimization",
            "demand_forecasting"
        ]
        
        # Enterprise plan features (all features)
        enterprise_features = pro_features + [
            "ai_analytics",
            "white_label",
            "priority_support",
            "custom_integrations"
        ]
        
        # Check if feature is available in the current plan
        if plan == SubscriptionPlan.FREE:
            return feature in free_features
        elif plan == SubscriptionPlan.BASIC:
            return feature in basic_features
        elif plan == SubscriptionPlan.PRO:
            return feature in pro_features
        elif plan == SubscriptionPlan.ENTERPRISE:
            return feature in enterprise_features
        else:
            return False
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """
        Get security headers for HTTP responses.
        
        Returns:
            Dict of security headers
        """
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        }
    
    @staticmethod
    def is_rate_limited(request: Request, limit: int, window: int) -> bool:
        """
        Check if a request is rate limited.
        
        In a real implementation, this would use Redis to track request counts.
        For this demo, we'll always return False (no rate limiting).
        
        Args:
            request: Flask request object
            limit: Maximum number of requests
            window: Time window in seconds
            
        Returns:
            True if rate limited, False otherwise
        """
        # This would be implemented with Redis in production
        return False