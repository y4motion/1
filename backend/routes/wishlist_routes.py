from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone
import uuid

from database import db
from utils.auth_utils import get_current_user

router = APIRouter()

class WishlistItem(BaseModel):
    product_id: str

@router.get("/wishlist/", response_model=dict)
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    """Get user's wishlist"""
    try:
        wishlist = await db.wishlists.find_one({"user_id": current_user.get("id")})
        if not wishlist:
            return {"items": []}
        return {"items": wishlist.get("product_ids", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/wishlist/add")
async def add_to_wishlist(
    item: WishlistItem,
    current_user: dict = Depends(get_current_user)
):
    """Add product to wishlist"""
    try:
        # Check if wishlist exists
        existing = await db.wishlists.find_one({"user_id": current_user.get("id")})
        
        if existing:
            # Update existing wishlist
            await db.wishlists.update_one(
                {"user_id": current_user.get("id")},
                {
                    "$addToSet": {"product_ids": item.product_id},
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
        else:
            # Create new wishlist
            wishlist = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.get("id"),
                "product_ids": [item.product_id],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.wishlists.insert_one(wishlist)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove product from wishlist"""
    try:
        result = await db.wishlists.update_one(
            {"user_id": current_user.get("id")},
            {
                "$pull": {"product_ids": product_id},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Item not in wishlist")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
