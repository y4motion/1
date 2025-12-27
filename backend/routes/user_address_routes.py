from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4

router = APIRouter(prefix="/api/user", tags=["user"])

class Address(BaseModel):
    id: str
    street: str
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool = False

# Mock addresses for development
MOCK_ADDRESSES = [
    {
        'id': 'addr_1',
        'street': '123 Main Street',
        'city': 'San Francisco',
        'state': 'CA',
        'postal_code': '94102',
        'country': 'USA',
        'is_default': True
    },
    {
        'id': 'addr_2',
        'street': '456 Oak Avenue',
        'city': 'Los Angeles',
        'state': 'CA',
        'postal_code': '90001',
        'country': 'USA',
        'is_default': False
    }
]

@router.get('/addresses')
async def get_addresses():
    """Get user's saved addresses"""
    return MOCK_ADDRESSES

@router.post('/addresses')
async def add_address(address: Address):
    """Add a new address"""
    new_address = address.dict()
    new_address['id'] = str(uuid4())
    MOCK_ADDRESSES.append(new_address)
    return new_address

@router.delete('/addresses/{address_id}')
async def delete_address(address_id: str):
    """Delete an address"""
    global MOCK_ADDRESSES
    MOCK_ADDRESSES = [a for a in MOCK_ADDRESSES if a['id'] != address_id]
    return {'status': 'deleted'}
