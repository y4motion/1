from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import stripe
import os
from uuid import uuid4
from datetime import datetime, timezone

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Get Stripe key from environment
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')

class PaymentIntentRequest(BaseModel):
    product_id: str
    quantity: int
    variant_id: Optional[str] = None
    address_id: Optional[str] = None
    promo_code: Optional[str] = None
    amount: float

class PromoValidateRequest(BaseModel):
    code: str
    product_id: str

@router.post('/create-intent')
async def create_payment_intent(request: PaymentIntentRequest):
    """Create a Stripe payment intent for checkout"""
    try:
        # If no Stripe key, return mock response for development
        if not stripe.api_key:
            return {
                'clientSecret': 'mock_secret_' + str(uuid4()),
                'orderId': str(uuid4())
            }
        
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(request.amount * 100),  # Convert to cents
            currency='usd',
            metadata={
                'product_id': request.product_id,
                'quantity': str(request.quantity),
                'variant_id': request.variant_id or '',
                'promo_code': request.promo_code or ''
            }
        )
        
        # Create order ID
        order_id = str(uuid4())
        
        return {
            'clientSecret': intent.client_secret,
            'orderId': order_id
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/webhook')
async def stripe_webhook():
    """Handle Stripe webhooks"""
    # Placeholder for webhook handling
    return {'status': 'received'}
