from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict
from utils.auth_utils import get_current_user
from database import get_database
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/price-alerts", tags=["price_alerts"])


class PriceAlertCreate(BaseModel):
    product_id: str
    target_price: Optional[float] = None
    price_drop_percent: Optional[int] = None
    notification_methods: Dict[str, bool] = {"push": True, "email": False, "sms": False}
    enabled: bool = True


class PriceAlertResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    target_price: Optional[float] = None
    price_drop_percent: Optional[int] = None
    notification_methods: Dict[str, bool]
    enabled: bool
    triggered: bool
    created_at: str
    updated_at: str


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_or_update_price_alert(
    alert_data: PriceAlertCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create or update a price alert for a product"""
    db = await get_database()
    
    # Check if product exists
    product = await db.products.find_one({"id": alert_data.product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if alert already exists for this user and product
    existing = await db.price_alerts.find_one({
        "user_id": current_user["id"],
        "product_id": alert_data.product_id
    })
    
    now = datetime.now(timezone.utc).isoformat()
    
    if existing:
        # Update existing alert
        await db.price_alerts.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "target_price": alert_data.target_price,
                "price_drop_percent": alert_data.price_drop_percent,
                "notification_methods": alert_data.notification_methods,
                "enabled": alert_data.enabled,
                "triggered": False,  # Reset triggered status on update
                "updated_at": now,
                "original_price": product.get("price", 0)  # Track price at alert time
            }}
        )
        return {"success": True, "message": "Price alert updated", "id": existing["id"]}
    else:
        # Create new alert
        alert = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "product_id": alert_data.product_id,
            "target_price": alert_data.target_price,
            "price_drop_percent": alert_data.price_drop_percent,
            "notification_methods": alert_data.notification_methods,
            "enabled": alert_data.enabled,
            "triggered": False,
            "original_price": product.get("price", 0),  # Track price at alert creation
            "created_at": now,
            "updated_at": now
        }
        
        await db.price_alerts.insert_one(alert)
        return {"success": True, "message": "Price alert created", "id": alert["id"]}


@router.get("/")
async def get_user_alerts(
    current_user: dict = Depends(get_current_user)
):
    """Get all price alerts for current user"""
    db = await get_database()
    
    alerts = await db.price_alerts.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(None)
    
    # Enrich with product data
    enriched_alerts = []
    for alert in alerts:
        product = await db.products.find_one(
            {"id": alert["product_id"]},
            {"_id": 0, "id": 1, "title": 1, "price": 1, "images": 1}
        )
        if product:
            alert["product"] = product
        enriched_alerts.append(alert)
    
    return {"success": True, "data": enriched_alerts}


@router.get("/product/{product_id}")
async def get_alert_for_product(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get price alert for a specific product"""
    db = await get_database()
    
    alert = await db.price_alerts.find_one(
        {
            "user_id": current_user["id"],
            "product_id": product_id
        },
        {"_id": 0}
    )
    
    return {"success": True, "data": alert}


@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a price alert"""
    db = await get_database()
    
    result = await db.price_alerts.delete_one({
        "id": alert_id,
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found or unauthorized"
        )
    
    return {"success": True, "message": "Alert deleted"}


@router.patch("/{alert_id}/toggle")
async def toggle_alert(
    alert_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle price alert enabled status"""
    db = await get_database()
    
    alert = await db.price_alerts.find_one({
        "id": alert_id,
        "user_id": current_user["id"]
    })
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found or unauthorized"
        )
    
    new_status = not alert.get("enabled", True)
    
    await db.price_alerts.update_one(
        {"id": alert_id},
        {"$set": {
            "enabled": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "enabled": new_status}
