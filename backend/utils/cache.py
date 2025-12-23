import json
import hashlib
from functools import wraps
from typing import Optional
import logging

# Initialize logger
logger = logging.getLogger(__name__)

# Try to connect to Redis, fallback to FakeRedis for development
try:
    import redis
    redis_client = redis.Redis(
        host='localhost',
        port=6379,
        db=0,
        decode_responses=True,
        socket_connect_timeout=2
    )
    # Test connection
    redis_client.ping()
    logger.info("✅ Connected to Redis server")
except Exception as e:
    logger.warning(f"⚠️ Redis not available, using FakeRedis: {e}")
    from fakeredis import FakeRedis
    redis_client = FakeRedis(decode_responses=True)


def cache_response(ttl_seconds=300):
    """
    Decorator для кеширования API responses
    
    Usage:
    @cache_response(ttl_seconds=600)
    async def get_products():
        ...
    
    Args:
        ttl_seconds: Time to live in seconds (default 5 minutes)
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create unique cache key from function name + args + kwargs
            cache_data = {
                'func': func.__name__,
                'args': str(args),
                'kwargs': str(sorted(kwargs.items()))
            }
            cache_key_raw = json.dumps(cache_data, sort_keys=True)
            cache_key = f"{func.__name__}:{hashlib.md5(cache_key_raw.encode()).hexdigest()}"
            
            try:
                # Try to get from cache
                cached = redis_client.get(cache_key)
                if cached:
                    logger.debug(f"✅ Cache HIT: {func.__name__}")
                    return json.loads(cached)
            except Exception as e:
                logger.warning(f"Cache read error: {e}")
            
            # Execute function if not in cache
            logger.debug(f"❌ Cache MISS: {func.__name__}")
            result = await func(*args, **kwargs)
            
            try:
                # Save to cache
                redis_client.setex(
                    cache_key,
                    ttl_seconds,
                    json.dumps(result, default=str)
                )
            except Exception as e:
                logger.warning(f"Cache write error: {e}")
            
            return result
        
        return wrapper
    return decorator


def invalidate_cache(pattern: str):
    """
    Invalidate cache по pattern
    
    Usage:
    invalidate_cache("get_products:*")  # Clear all product list caches
    invalidate_cache("get_product:*abc123*")  # Clear specific product cache
    """
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
            logger.info(f"🗑️ Invalidated {len(keys)} cache keys: {pattern}")
            return len(keys)
        return 0
    except Exception as e:
        logger.error(f"Cache invalidation error: {e}")
        return 0


def clear_all_cache():
    """Clear all cache (use with caution!)"""
    try:
        redis_client.flushdb()
        logger.warning("🗑️ ALL CACHE CLEARED")
    except Exception as e:
        logger.error(f"Cache clear error: {e}")


def get_cache_stats():
    """Get cache statistics"""
    try:
        info = redis_client.info()
        return {
            "total_keys": redis_client.dbsize(),
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "hit_rate": round(
                info.get("keyspace_hits", 0) / 
                max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1) * 100, 
                2
            )
        }
    except:
        return {"status": "unavailable"}
