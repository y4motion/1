from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone
import uuid

from database import db
from utils.auth_utils import get_current_user

router = APIRouter()

class SavedItem(BaseModel):
    product_id: str

@router.get("/saved/", response_model=dict)
async def get_saved_items(current_user: dict = Depends(get_current_user)):
    """Get user's saved items (save for later)"""
    try:
        saved = await db.saved_items.find_one({"user_id": current_user.get("id")})
        if not saved:
            return {"items": []}
        return {"items": saved.get("product_ids", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/saved/add")
async def add_to_saved(
    item: SavedItem,
    current_user: dict = Depends(get_current_user)
):
    """Add product to saved items"""
    try:
        # Check if saved list exists
        existing = await db.saved_items.find_one({"user_id": current_user.get("id")})
        
        if existing:
            # Update existing saved list
            await db.saved_items.update_one(
                {"user_id": current_user.get("id")},
                {
                    "$addToSet": {"product_ids": item.product_id},
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
        else:
            # Create new saved list
            saved = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.get("id"),
                "product_ids": [item.product_id],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.saved_items.insert_one(saved)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/saved/remove/{product_id}")
async def remove_from_saved(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove product from saved items"""
    try:
        result = await db.saved_items.update_one(
            {"user_id": current_user.get("id")},
            {
                "$pull": {"product_ids": product_id},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Item not in saved list")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
