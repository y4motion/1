from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone
import uuid

from database import db
from utils.auth_utils import get_current_user

router = APIRouter()

class BagCreate(BaseModel):
    name: str

class BagAddItem(BaseModel):
    product_id: str

class Bag(BaseModel):
    id: str
    name: str
    user_id: str
    product_ids: List[str]
    created_at: str
    updated_at: str

@router.get("/bags/", response_model=dict)
async def get_user_bags(current_user: dict = Depends(get_current_user)):
    """Get all bags for current user"""
    try:
        bags = await db.bags.find({"user_id": current_user.get("id")}).to_list(length=None)
        return {"bags": bags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bags/create", response_model=dict)
async def create_bag(bag_data: BagCreate, current_user: dict = Depends(get_current_user)):
    """Create a new bag (collection)"""
    try:
        bag_id = str(uuid.uuid4())
        bag = {
            "id": bag_id,
            "name": bag_data.name,
            "user_id": current_user.get("id"),
            "product_ids": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.bags.insert_one(bag)
        return {"success": True, "bag_id": bag_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bags/{bag_id}/add")
async def add_to_bag(
    bag_id: str,
    item: BagAddItem,
    current_user: dict = Depends(get_current_user)
):
    """Add product to bag"""
    try:
        result = await db.bags.update_one(
            {"id": bag_id, "user_id": current_user.get("id")},
            {
                "$addToSet": {"product_ids": item.product_id},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Bag not found or item already in bag")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/bags/{bag_id}/remove/{product_id}")
async def remove_from_bag(
    bag_id: str,
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove product from bag"""
    try:
        result = await db.bags.update_one(
            {"id": bag_id, "user_id": current_user.get("id")},
            {
                "$pull": {"product_ids": product_id},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Bag not found or item not in bag")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/bags/{bag_id}")
async def delete_bag(bag_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a bag"""
    try:
        result = await db.bags.delete_one({"id": bag_id, "user_id": current_user.get("id")})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Bag not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
