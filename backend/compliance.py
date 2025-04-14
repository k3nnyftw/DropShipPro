"""
GDPR and CCPA compliance management module.

This module handles:
1. Personal data management and anonymization
2. Data export in a machine-readable format
3. Data deletion requests
4. Consent management
5. Data retention policies
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from models import User, Subscription, Order, Payment, SocialAccount, ScheduledPost
from config import config

# Configure logging
logger = logging.getLogger(__name__)

class ComplianceManager:
    """Handles GDPR and CCPA compliance-related operations."""
    
    @staticmethod
    def export_user_data(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Export all user data in a structured, machine-readable format (JSON).
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Dict containing all user data
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        # Collect user data
        user_data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
        }
        
        # Get subscription data
        subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()
        if subscription:
            user_data["subscription"] = {
                "plan": subscription.plan.value if subscription.plan else None,
                "status": subscription.status.value if subscription.status else None,
                "current_period_start": subscription.current_period_start.isoformat() if subscription.current_period_start else None,
                "current_period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None,
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "created_at": subscription.created_at.isoformat() if subscription.created_at else None
            }
        
        # Get social media accounts
        social_accounts = db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()
        if social_accounts:
            user_data["social_accounts"] = []
            for account in social_accounts:
                user_data["social_accounts"].append({
                    "platform": account.platform,
                    "username": account.username,
                    "followers": account.followers,
                    "last_post_date": account.last_post_date.isoformat() if account.last_post_date else None,
                    "connected": account.connected,
                    "status": account.status,
                    "created_at": account.created_at.isoformat() if account.created_at else None
                })
        
        # Get scheduled posts
        scheduled_posts = db.query(ScheduledPost).filter(ScheduledPost.user_id == user_id).all()
        if scheduled_posts:
            user_data["scheduled_posts"] = []
            for post in scheduled_posts:
                user_data["scheduled_posts"].append({
                    "content": post.content,
                    "platform": post.platform,
                    "scheduled_time": post.scheduled_time.isoformat() if post.scheduled_time else None,
                    "status": post.status,
                    "created_at": post.created_at.isoformat() if post.created_at else None
                })
        
        return user_data
    
    @staticmethod
    def delete_user_data(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Delete or anonymize all user data per GDPR/CCPA requirements.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Dict with status of deletion
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        try:
            # Anonymize user data rather than delete
            user.username = f"deleted_user_{user_id}"
            user.email = f"deleted_{user_id}@example.com"
            user.password_hash = "DELETED"
            user.first_name = None
            user.last_name = None
            
            # Delete/anonymize sensitive data in related tables
            ComplianceManager._delete_social_accounts(db, user_id)
            ComplianceManager._delete_scheduled_posts(db, user_id)
            
            # Mark subscription as canceled
            subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()
            if subscription:
                subscription.status = "canceled"
                subscription.stripe_subscription_id = None
            
            db.commit()
            
            return {
                "success": True,
                "message": "User data deleted or anonymized successfully",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting user data: {e}")
            return {
                "success": False,
                "error": "Failed to delete user data",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    @staticmethod
    def _delete_social_accounts(db: Session, user_id: int) -> None:
        """Delete or anonymize social media accounts."""
        accounts = db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()
        for account in accounts:
            # Keep analytics data but remove identifiable info
            account.username = f"deleted_user_{account.id}"
            account.access_token = None
            account.token_secret = None
            account.refresh_token = None
            account.connected = False
            account.status = "deleted"
    
    @staticmethod
    def _delete_scheduled_posts(db: Session, user_id: int) -> None:
        """Delete scheduled posts."""
        posts = db.query(ScheduledPost).filter(ScheduledPost.user_id == user_id).all()
        for post in posts:
            db.delete(post)
    
    @staticmethod
    def apply_data_retention_policy(db: Session) -> Dict[str, Any]:
        """
        Apply data retention policy to delete old data.
        
        Args:
            db: Database session
            
        Returns:
            Dict with count of deleted items
        """
        retention_days = config.DATA_RETENTION_DAYS
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        
        deleted_counts = {
            "scheduled_posts": 0,
            "social_accounts": 0
        }
        
        try:
            # Delete old scheduled posts
            old_posts = db.query(ScheduledPost).filter(
                ScheduledPost.created_at < cutoff_date,
                ScheduledPost.status.in_(["posted", "failed", "canceled"])
            ).all()
            
            for post in old_posts:
                db.delete(post)
                deleted_counts["scheduled_posts"] += 1
            
            # Delete old social accounts that have been disconnected
            old_accounts = db.query(SocialAccount).filter(
                SocialAccount.updated_at < cutoff_date,
                SocialAccount.connected == False,
                SocialAccount.status == "deleted"
            ).all()
            
            for account in old_accounts:
                db.delete(account)
                deleted_counts["social_accounts"] += 1
            
            db.commit()
            
            return {
                "success": True,
                "deleted_counts": deleted_counts,
                "retention_days": retention_days,
                "cutoff_date": cutoff_date.isoformat(),
                "timestamp": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error applying data retention policy: {e}")
            return {
                "success": False,
                "error": "Failed to apply data retention policy",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    @staticmethod
    def record_consent(db: Session, user_id: int, consent_type: str, has_consented: bool) -> Dict[str, Any]:
        """
        Record user consent for data processing.
        
        Args:
            db: Database session
            user_id: User ID
            consent_type: Type of consent (e.g., 'marketing', 'analytics', 'cookies')
            has_consented: Whether the user has consented or not
            
        Returns:
            Dict with consent status
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        # In a real implementation, this would be stored in a consent table
        # For this demo, we'll return a mock response
        return {
            "user_id": user_id,
            "consent_type": consent_type,
            "has_consented": has_consented,
            "recorded_at": datetime.utcnow().isoformat(),
            "success": True
        }