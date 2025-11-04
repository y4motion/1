from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid

from database import db
from utils.auth_utils import get_current_user, get_current_user_optional

router = APIRouter()

class CheckoutRequest(BaseModel):
    payment_method: str  # 'card', 'tinkoff', 'sbp', 'crypto'
    customer_info: Dict
    items: List[Dict]

class CheckoutResponse(BaseModel):
    success: bool
    order_id: str
    payment_url: Optional[str] = None
    message: str

@router.post("/checkout/", response_model=CheckoutResponse)
async def create_checkout(
    checkout_data: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create checkout session and initiate payment
    TODO: Integrate real payment gateways when API keys are provided
    """
    try:
        # Create order
        order_id = str(uuid.uuid4())
        
        # Calculate total
        total_amount = sum(item.get('price', 0) * item.get('quantity', 1) for item in checkout_data.items)
        
        order_data = {
            "id": order_id,
            "user_id": current_user.get("id"),
            "items": checkout_data.items,
            "customer_info": checkout_data.customer_info,
            "payment_method": checkout_data.payment_method,
            "total_amount": total_amount,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert order
        await db.orders.insert_one(order_data)
        
        # TODO: Process payment based on payment_method
        # For now, just return success (demo mode)
        payment_url = None
        
        if checkout_data.payment_method == 'card':
            # TODO: Integrate card payment gateway
            payment_url = f"/payment/card/{order_id}"
            
        elif checkout_data.payment_method == 'tinkoff':
            # TODO: Integrate Tinkoff API
            # Use Terminal Key and Secret Key from payment_settings
            payment_url = f"/payment/tinkoff/{order_id}"
            
        elif checkout_data.payment_method == 'sbp':
            # TODO: Integrate SBP (via Tinkoff or other provider)
            payment_url = f"/payment/sbp/{order_id}"
            
        elif checkout_data.payment_method == 'crypto':
            # TODO: Integrate crypto payment gateway (CoinGate, NOWPayments, etc.)
            payment_url = f"/payment/crypto/{order_id}"
        
        # Clear user's cart
        await db.carts.delete_one({"user_id": current_user.get("id")})
        
        return CheckoutResponse(
            success=True,
            order_id=order_id,
            payment_url=payment_url,
            message="Order created successfully (Demo mode - payment integration pending)"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")


@router.get("/checkout/payment-methods/")
async def get_available_payment_methods():
    """
    Get list of available payment methods configured by admin
    """
    try:
        payment_methods = await db.payment_methods.find({"is_active": True}).to_list(length=None)
        return {"payment_methods": payment_methods}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
