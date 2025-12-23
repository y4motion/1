from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.notification import Notification, NotificationCreate
from models.user import User
from utils.auth_utils import get_current_user
from database import get_database
from datetime import datetime, timezone

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[Notification])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    unread_only: bool = False,
    limit: int = 50
):
    """Get user notifications"""
    db = await get_database()
    
    query = {"user_id": current_user.id}
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(query).sort(
        "created_at", -1
    ).limit(limit).to_list(length=limit)
    
    return [Notification(**n) for n in notifications]


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    db = await get_database()
    
    count = await db.notifications.count_documents({
        "user_id": current_user.id,
        "is_read": False
    })
    
    return {"unread_count": count}


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark notification as read"""
    db = await get_database()
    
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"status": "marked_read"}


@router.post("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    db = await get_database()
    
    result = await db.notifications.update_many(
        {"user_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"marked_read": result.modified_count}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete notification"""
    db = await get_database()
    
    result = await db.notifications.delete_one({
        "id": notification_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"status": "deleted"}


# Helper function to create notification
async def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    link: str = None,
    metadata: dict = None
):
    \"\"\"Helper function to create notification\"\"\"\n    db = await get_database()
    
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        link=link,
        metadata=metadata or {}
    )
    
    await db.notifications.insert_one(notification.dict())
    
    return notification
