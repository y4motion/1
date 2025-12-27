from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/promo", tags=["promo"])

# Mock promo codes database
PROMO_CODES = {
    'SAVE10': {'discount_percent': 10, 'discount_amount': None, 'min_order': 0},
    'SAVE20': {'discount_percent': 20, 'discount_amount': None, 'min_order': 50},
    'FLAT15': {'discount_percent': None, 'discount_amount': 15, 'min_order': 100},
    'WELCOME': {'discount_percent': 15, 'discount_amount': None, 'min_order': 0},
}

class PromoValidateRequest(BaseModel):
    code: str
    product_id: str
    subtotal: Optional[float] = 0

@router.post('/validate')
async def validate_promo(request: PromoValidateRequest):
    """Validate a promo code and return discount info"""
    code = request.code.upper()
    
    if code not in PROMO_CODES:
        return {
            'valid': False,
            'message': 'Invalid promo code'
        }
    
    promo = PROMO_CODES[code]
    
    # Check minimum order
    if request.subtotal < promo['min_order']:
        return {
            'valid': False,
            'message': f'Minimum order ${promo["min_order"]} required'
        }
    
    # Calculate discount
    if promo['discount_amount']:
        discount_amount = promo['discount_amount']
    elif promo['discount_percent']:
        discount_amount = request.subtotal * (promo['discount_percent'] / 100)
    else:
        discount_amount = 0
    
    return {
        'valid': True,
        'discount_percent': promo['discount_percent'],
        'discount_amount': discount_amount,
        'message': f'Code {code} applied!'
    }
