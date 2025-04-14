"""
Redis caching implementation for production.

Provides:
1. Function result caching
2. Rate limiting
3. Cache key management
4. Distributed locking
"""

import json
import logging
import hashlib
import pickle
import time
from typing import Any, Dict, List, Optional, Union, Callable
from functools import wraps
from redis.exceptions import ConnectionError, RedisError
from redis.lock import Lock as RedisLock
from config import config
from database import redis_client

# Configure logging
logger = logging.getLogger(__name__)

class CacheManager:
    """
    Redis cache manager for the application.
    """
    
    @staticmethod
    def get_cache(key: str) -> Optional[Any]:
        """
        Get a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None
        """
        if not redis_client:
            return None
            
        try:
            data = redis_client.get(key)
            if data:
                try:
                    return pickle.loads(data)
                except (pickle.PickleError, TypeError):
                    # Fallback to JSON for simpler objects
                    try:
                        return json.loads(data)
                    except json.JSONDecodeError:
                        return data.decode('utf-8')
            return None
        except (ConnectionError, RedisError) as e:
            logger.warning(f"Redis cache get error: {e}")
            return None
    
    @staticmethod
    def set_cache(key: str, value: Any, expire: int = None) -> bool:
        """
        Set a value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            expire: Expiration time in seconds
            
        Returns:
            True if successful, False otherwise
        """
        if not redis_client:
            return False
            
        try:
            # Try to pickle the value for complex objects
            try:
                data = pickle.dumps(value)
            except (pickle.PickleError, TypeError):
                # Fallback to JSON for simpler objects
                try:
                    data = json.dumps(value)
                except (TypeError, json.JSONDecodeError):
                    # Last resort, store as string
                    data = str(value)
            
            if expire is None:
                expire = config.REDIS_CACHE_EXPIRE
                
            return redis_client.set(key, data, ex=expire)
        except (ConnectionError, RedisError) as e:
            logger.warning(f"Redis cache set error: {e}")
            return False
    
    @staticmethod
    def delete_cache(key: str) -> bool:
        """
        Delete a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        if not redis_client:
            return False
            
        try:
            return bool(redis_client.delete(key))
        except (ConnectionError, RedisError) as e:
            logger.warning(f"Redis cache delete error: {e}")
            return False
    
    @staticmethod
    def clear_cache_pattern(pattern: str) -> int:
        """
        Clear cache keys matching a pattern.
        
        Args:
            pattern: Key pattern to match
            
        Returns:
            Number of keys deleted
        """
        if not redis_client:
            return 0
            
        try:
            keys = redis_client.keys(pattern)
            if keys:
                return redis_client.delete(*keys)
            return 0
        except (ConnectionError, RedisError) as e:
            logger.warning(f"Redis clear cache pattern error: {e}")
            return 0
    
    @staticmethod
    def get_lock(key: str, timeout: int = 10, sleep: float = 0.1) -> Optional[RedisLock]:
        """
        Get a distributed lock.
        
        Args:
            key: Lock key
            timeout: Lock timeout in seconds
            sleep: Sleep time between lock attempts
            
        Returns:
            Redis lock or None
        """
        if not redis_client:
            return None
            
        try:
            return redis_client.lock(
                f"lock:{key}",
                timeout=timeout,
                sleep=sleep
            )
        except (ConnectionError, RedisError) as e:
            logger.warning(f"Redis get lock error: {e}")
            return None
    
    @staticmethod
    def rate_limit(key: str, limit: int, period: int) -> Dict[str, Any]:
        """
        Apply rate limiting to a key.
        
        Args:
            key: Rate limit key
            limit: Maximum requests
            period: Time period in seconds
            
        Returns:
            Dict with rate limit status
        """
        if not redis_client:
            return {"limited": False, "remaining": limit, "reset": int(time.time()) + period}
            
        try:
            # Create rate limit key
            rate_key = f"rate:{key}"
            
            # Get current count and timestamp
            count = redis_client.get(rate_key)
            ttl = redis_client.ttl(rate_key)
            
            current_time = int(time.time())
            
            # If key doesn't exist or has expired, reset counter
            if count is None or ttl < 0:
                redis_client.set(rate_key, 1, ex=period)
                return {
                    "limited": False,
                    "remaining": limit - 1,
                    "reset": current_time + period
                }
            
            # Check if rate limit exceeded
            count = int(count)
            if count >= limit:
                return {
                    "limited": True,
                    "remaining": 0,
                    "reset": current_time + ttl
                }
            
            # Increment counter
            redis_client.incr(rate_key)
            
            return {
                "limited": False,
                "remaining": limit - count - 1,
                "reset": current_time + ttl
            }
        except (ConnectionError, RedisError) as e:
            logger.warning(f"Redis rate limit error: {e}")
            return {"limited": False, "remaining": limit, "reset": int(time.time()) + period}

# Decorator for caching function results
def cache_result(expire: int = None, prefix: str = None):
    """
    Decorator to cache function results in Redis.
    
    Args:
        expire: Cache expiration time in seconds
        prefix: Cache key prefix
        
    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Skip caching if Redis is not available
            if not redis_client:
                return func(*args, **kwargs)
            
            # Generate cache key
            key_parts = [prefix or func.__module__ + "." + func.__name__]
            
            # Add args and kwargs to key
            if args:
                key_parts.append(hashlib.md5(str(args).encode()).hexdigest())
            
            if kwargs:
                # Sort kwargs by key for consistent hashing
                sorted_kwargs = sorted(kwargs.items())
                key_parts.append(hashlib.md5(str(sorted_kwargs).encode()).hexdigest())
            
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            cached_result = CacheManager.get_cache(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cache result
            CacheManager.set_cache(cache_key, result, expire)
            
            return result
        
        return wrapper
    
    return decorator