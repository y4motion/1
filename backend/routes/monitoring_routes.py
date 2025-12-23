from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from utils.metrics import metrics
from utils.auth_utils import get_current_user
from models.user import User
from database import db
import os

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/health")
async def health_check():
    """Public health check endpoint"""
    try:
        # Test database connection
        await db.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": os.getenv('ENVIRONMENT', 'development'),
        "version": os.getenv('VERSION', '1.0.0'),
        "database": db_status
    }


@router.get("/metrics")
async def get_metrics(
    endpoint: str = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get performance metrics
    Requires authentication (admin for full metrics)
    """
    # All users can see basic metrics
    basic_metrics = {
        'uptime': metrics.get_stats()['summary']['uptime_seconds'],
        'total_requests': metrics.get_stats()['summary']['total_requests']
    }
    
    # Admin can see detailed metrics
    if current_user.is_admin:
        if endpoint:
            return metrics.get_stats(endpoint)
        else:
            return metrics.get_stats()
    
    return basic_metrics


@router.get("/metrics/slow")
async def get_slow_endpoints(
    threshold: float = 1.0,
    current_user: User = Depends(get_current_user)
):
    """Get slow endpoints (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    slow_endpoints = metrics.get_slow_endpoints(threshold)
    
    return {
        "threshold_seconds": threshold,
        "slow_endpoints": slow_endpoints,
        "count": len(slow_endpoints)
    }


@router.get("/status")
async def get_system_status(
    current_user: User = Depends(get_current_user)
):
    """Get system status (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Database stats
    db_stats = await db.command('dbStats')
    
    # Collection counts
    collections = {
        'users': await db.users.count_documents({}),
        'products': await db.products.count_documents({}),
        'posts': await db.posts.count_documents({}),
        'articles': await db.articles.count_documents({}),
        'reviews': await db.reviews.count_documents({}),
        'proposals': await db.proposals.count_documents({}),
        'groupbuys': await db.groupbuys.count_documents({})
    }
    
    return {
        "database": {
            "size_mb": round(db_stats.get('dataSize', 0) / (1024 * 1024), 2),
            "collections": collections,
            "indexes": db_stats.get('indexes', 0)
        },
        "performance": metrics.get_stats()['summary'],
        "environment": {
            "env": os.getenv('ENVIRONMENT', 'development'),
            "debug": os.getenv('DEBUG', 'True'),
            "version": os.getenv('VERSION', '1.0.0')
        }
    }
