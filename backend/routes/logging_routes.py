from fastapi import APIRouter, Request
from datetime import datetime, timezone
from database import get_database
import logging

router = APIRouter(prefix="/log", tags=["logging"])
logger = logging.getLogger(__name__)


@router.post("/error")
async def log_client_error(request: Request):
    """Log frontend errors for debugging"""
    try:
        data = await request.json()
        
        error_log = {
            'id': str(datetime.now(timezone.utc).timestamp()),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'error': data.get('error'),
            'stack': data.get('stack'),
            'component_stack': data.get('componentStack'),
            'url': data.get('url'),
            'user_agent': data.get('userAgent'),
            'type': 'client_error'
        }
        
        # Log to console in development
        logger.error(f"❌ CLIENT ERROR: {error_log['error']}")
        if error_log.get('stack'):
            logger.error(f"   Stack: {error_log['stack'][:200]}...")
        
        # Save to database for production monitoring
        db = await get_database()
        await db.error_logs.insert_one(error_log)
        
        return {"status": "logged", "message": "Error logged successfully"}
        
    except Exception as e:
        logger.error(f"Failed to log client error: {e}")
        return {"status": "failed", "message": str(e)}


@router.get("/errors/recent")
async def get_recent_errors(limit: int = 50):
    """Get recent error logs (admin only in production)"""
    try:
        db = await get_database()
        errors = await db.error_logs.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(length=limit)
        
        return {"errors": errors, "count": len(errors)}
    except Exception as e:
        logger.error(f"Failed to fetch error logs: {e}")
        return {"errors": [], "count": 0}


@router.delete("/errors/clear")
async def clear_error_logs():
    """Clear all error logs (admin only)"""
    try:
        db = await get_database()
        result = await db.error_logs.delete_many({})
        
        logger.info(f"🗑️ Cleared {result.deleted_count} error logs")
        return {"status": "cleared", "count": result.deleted_count}
    except Exception as e:
        logger.error(f"Failed to clear error logs: {e}")
        return {"status": "failed", "message": str(e)}
