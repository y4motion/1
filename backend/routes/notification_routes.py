from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from models.notification import Notification, NotificationCreate
from models.user import User
from utils.auth_utils import get_current_user
from database import get_database
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/notifications", tags=["notifications"])


class PushSubscription(BaseModel):
    endpoint: str
    keys: dict
    expirationTime: str = None


class UnsubscribeRequest(BaseModel):
    endpoint: str


@router.post("/subscribe")
async def subscribe_to_push(
    subscription_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Subscribe to push notifications"""
    db = await get_database()
    
    # Check if subscription already exists
    existing = await db.push_subscriptions.find_one({
        "user_id": current_user["id"],
        "subscription.endpoint": subscription_data.get("endpoint")
    })
    
    if existing:
        return {"success": True, "message": "Already subscribed"}
    
    # Save subscription
    subscription = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "subscription": subscription_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.push_subscriptions.insert_one(subscription)
    
    return {
        "success": True,
        "message": "Subscribed to push notifications"
    }


@router.post("/unsubscribe")
async def unsubscribe_from_push(
    data: UnsubscribeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Unsubscribe from push notifications"""
    db = await get_database()
    
    result = await db.push_subscriptions.delete_one({
        "user_id": current_user["id"],
        "subscription.endpoint": data.endpoint
    })
    
    if result.deleted_count == 0:
        # Not found is okay - might already be unsubscribed
        return {"success": True, "message": "Already unsubscribed"}
    
    return {
        "success": True,
        "message": "Unsubscribed from push notifications"
    }


@router.get("")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    unread_only: bool = False,
    limit: int = 50
):
    """Get user notifications"""
    db = await get_database()
    
    query = {"user_id": current_user["id"]}
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(
        query, {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return {"success": True, "data": notifications}


@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user)
):
    """Get count of unread notifications"""
    db = await get_database()
    
    count = await db.notifications.count_documents({
        "user_id": current_user["id"],
        "is_read": False
    })
    
    return {"success": True, "unread_count": count}


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark notification as read"""
    db = await get_database()
    
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True, "status": "marked_read"}


@router.post("/mark-all-read")
async def mark_all_read(
    current_user: dict = Depends(get_current_user)
):
    """Mark all notifications as read"""
    db = await get_database()
    
    result = await db.notifications.update_many(
        {"user_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"success": True, "marked_read": result.modified_count}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete notification"""
    db = await get_database()
    
    result = await db.notifications.delete_one({
        "id": notification_id,
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True, "status": "deleted"}


@router.post("/test")
async def test_notification(
    current_user: dict = Depends(get_current_user)
):
    """Send test notification (for development)"""
    from services.notification_service import notification_service
    
    await notification_service.send_notification(
        user_id=current_user["id"],
        notification_type="test",
        title="Test Notification 🧪",
        message="This is a test notification to verify your setup is working!",
        link="/",
        methods={"push": True, "email": True, "sms": False}
    )
    
    return {
        "success": True,
        "message": "Test notification sent"
    }


# Helper function to create notification
async def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    link: str = None,
    metadata: dict = None
):
    """Helper function to create notification"""
    db = await get_database()
    
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "link": link,
        "metadata": metadata or {},
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notifications.insert_one(notification)
    
    return notification
