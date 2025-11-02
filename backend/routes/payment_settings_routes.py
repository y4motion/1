from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timezone
from database import db as db_client
from models.payment_method import (
    PaymentMethodCreate,
    PaymentMethod,
    PaymentMethodResponse,
    AdminSettings,
    AdminSettingsUpdate
)
from utils.auth_utils import get_current_user
import logging

router = APIRouter(prefix="/api/payment-settings", tags=["payment_settings"])
logger = logging.getLogger(__name__)


# Helper function to check admin permissions
async def require_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods(active_only: bool = True):
    """
    Get all payment methods (public endpoint for customer display).
    Set active_only=False to include inactive methods (admin use).
    """
    try:
        query = {"is_active": True} if active_only else {}
        
        cursor = db_client.payment_methods.find(query)
        methods = await cursor.to_list(length=100)
        
        return [PaymentMethodResponse(**method) for method in methods]
    
    except Exception as e:
        logger.error(f"Error fetching payment methods: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch payment methods: {str(e)}")


@router.post("/payment-methods", response_model=PaymentMethodResponse)
async def create_payment_method(
    method: PaymentMethodCreate,
    current_user: dict = Depends(require_admin)
):
    """
    Create a new payment method (admin only).
    """
    try:
        # Create PaymentMethod instance to generate ID
        new_method = PaymentMethod(**method.dict())
        method_data = new_method.dict()
        
        # Convert datetime to ISO string
        method_data['created_at'] = method_data['created_at'].isoformat()
        method_data['updated_at'] = method_data['updated_at'].isoformat()
        
        # Insert into database
        await db_client.payment_methods.insert_one(method_data)
        
        logger.info(f"Payment method created: {new_method.name} ({new_method.id})")
        
        return PaymentMethodResponse(**new_method.dict())
    
    except Exception as e:
        logger.error(f"Error creating payment method: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create payment method: {str(e)}")


@router.put("/payment-methods/{method_id}", response_model=PaymentMethodResponse)
async def update_payment_method(
    method_id: str,
    method_update: PaymentMethodCreate,
    current_user: dict = Depends(require_admin)
):
    """
    Update an existing payment method (admin only).
    """
    try:
        # Check if method exists
        existing_method = await db_client.payment_methods.find_one({"id": method_id})
        
        if not existing_method:
            raise HTTPException(status_code=404, detail="Payment method not found")
        
        # Prepare update data
        update_data = method_update.dict()
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Update in database
        await db_client.payment_methods.update_one(
            {"id": method_id},
            {"$set": update_data}
        )
        
        # Fetch and return updated method
        updated_method = await db_client.payment_methods.find_one({"id": method_id})
        
        logger.info(f"Payment method updated: {method_id}")
        
        return PaymentMethodResponse(**updated_method)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating payment method: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update payment method: {str(e)}")


@router.delete("/payment-methods/{method_id}")
async def delete_payment_method(
    method_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Delete a payment method (admin only).
    """
    try:
        # Check if method exists
        method = await db_client.payment_methods.find_one({"id": method_id})
        
        if not method:
            raise HTTPException(status_code=404, detail="Payment method not found")
        
        # Delete method
        await db_client.payment_methods.delete_one({"id": method_id})
        
        logger.info(f"Payment method deleted: {method_id}")
        
        return {"message": "Payment method deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting payment method: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete payment method: {str(e)}")


@router.get("/admin-settings", response_model=AdminSettings)
async def get_admin_settings(current_user: dict = Depends(require_admin)):
    """
    Get global admin settings (admin only).
    """
    try:
        # Fetch settings (there should be only one settings document)
        settings = await db_client.admin_settings.find_one({"id": "settings_v1"})
        
        if not settings:
            # Create default settings if none exist
            default_settings = AdminSettings()
            settings_data = default_settings.dict()
            
            # Convert datetime to ISO string
            settings_data['created_at'] = settings_data['created_at'].isoformat()
            settings_data['updated_at'] = settings_data['updated_at'].isoformat()
            
            await db_client.admin_settings.insert_one(settings_data)
            
            return default_settings
        
        return AdminSettings(**settings)
    
    except Exception as e:
        logger.error(f"Error fetching admin settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch admin settings: {str(e)}")


@router.put("/admin-settings", response_model=AdminSettings)
async def update_admin_settings(
    settings_update: AdminSettingsUpdate,
    current_user: dict = Depends(require_admin)
):
    """
    Update global admin settings (admin only).
    """
    try:
        # Prepare update data
        update_data = {k: v for k, v in settings_update.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated timestamp
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Update in database (upsert to create if doesn't exist)
        await db_client.admin_settings.update_one(
            {"id": "settings_v1"},
            {"$set": update_data},
            upsert=True
        )
        
        # Fetch and return updated settings
        updated_settings = await db_client.admin_settings.find_one({"id": "settings_v1"})
        
        logger.info("Admin settings updated")
        
        return AdminSettings(**updated_settings)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating admin settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update admin settings: {str(e)}")
