from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone
from database import db
import uuid

router = APIRouter(prefix="/api/price-alerts", tags=["price_alerts"])

class PriceAlertCreate(BaseModel):
    product_id: str
    target_price: Optional[float] = None
    price_drop_percent: Optional[int] = None
    notification_methods: Dict[str, bool] = {"push": True, "email": False, "sms": False}
    enabled: bool = True

# Simple auth helper
async def get_current_user_id(authorization: str = None):
    # For now return a default user - integrate with your auth system
    return "default_user"

@router.post("/")
async def create_price_alert(alert_data: PriceAlertCreate):
    """Create or update price alert"""
    user_id = "default_user"  # Replace with actual auth
    
    # Check if alert already exists
    existing = await db.price_alerts.find_one({
        "user_id": user_id,
        "product_id": alert_data.product_id
    }, {"_id": 0})
    
    if existing:
        await db.price_alerts.update_one(
            {"user_id": user_id, "product_id": alert_data.product_id},
            {"$set": {
                "target_price": alert_data.target_price,
                "price_drop_percent": alert_data.price_drop_percent,
                "notification_methods": alert_data.notification_methods,
                "enabled": alert_data.enabled,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        return {"success": True, "message": "Alert updated"}
    
    alert = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "product_id": alert_data.product_id,
        "target_price": alert_data.target_price,
        "price_drop_percent": alert_data.price_drop_percent,
        "notification_methods": alert_data.notification_methods,
        "enabled": alert_data.enabled,
        "triggered": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.price_alerts.insert_one(alert)
    return {"success": True, "message": "Alert created", "id": alert["id"]}

@router.get("/")
async def get_user_alerts():
    """Get all price alerts for current user"""
    user_id = "default_user"
    
    alerts = await db.price_alerts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    return {"success": True, "data": alerts}

@router.get("/{product_id}")
async def get_product_alert(product_id: str):
    """Get price alert for specific product"""
    user_id = "default_user"
    
    alert = await db.price_alerts.find_one(
        {"user_id": user_id, "product_id": product_id},
        {"_id": 0}
    )
    
    return {"success": True, "data": alert}

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str):
    """Delete price alert"""
    user_id = "default_user"
    
    result = await db.price_alerts.delete_one({
        "id": alert_id,
        "user_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"success": True, "message": "Alert deleted"}
