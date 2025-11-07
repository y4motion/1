from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models.creator import CreatorProfile, CreatorProfileCreate, CreatorReview, CreatorAssembly
from models.user import User
from utils.auth_utils import get_current_user
from database import get_database
from datetime import datetime, timezone

router = APIRouter(prefix="/creators", tags=["creators"])


@router.post("/profile", response_model=CreatorProfile)
async def create_creator_profile(
    profile_data: CreatorProfileCreate,
    current_user: User = Depends(get_current_user)
):
    """Create creator profile (requires verification by admin)"""
    db = await get_database()
    
    # Check if profile already exists
    existing = await db.creator_profiles.find_one({"user_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Creator profile already exists")
    
    profile = CreatorProfile(
        user_id=current_user.id,
        username=current_user.username,
        user_avatar=current_user.avatar_url,
        **profile_data.dict()
    )
    
    await db.creator_profiles.insert_one(profile.dict())
    
    # Update user model
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"creator_profile_id": profile.id}}
    )
    
    return profile


@router.get("", response_model=List[CreatorProfile])
async def get_creators(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    verified_only: bool = True,
    specialization: Optional[str] = None
):
    """Get creators list"""
    db = await get_database()
    
    query = {}
    if verified_only:
        query["is_verified"] = True
    if specialization:
        query["specialization"] = specialization
    
    creators = await db.creator_profiles.find(query).sort("total_views", -1).skip(skip).limit(limit).to_list(length=limit)
    return [CreatorProfile(**c) for c in creators]


@router.get("/{creator_id}", response_model=CreatorProfile)
async def get_creator(
    creator_id: str
):
    """Get creator profile"""
    db = await get_database()
    
    creator = await db.creator_profiles.find_one({"id": creator_id})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    return CreatorProfile(**creator)


@router.post("/{creator_id}/follow")
async def toggle_follow(
    creator_id: str,
    current_user: User = Depends(get_current_user)
):
    """Follow/unfollow creator"""
    db = await get_database()
    
    creator = await db.creator_profiles.find_one({"id": creator_id})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Check if already following (you'd store this in a separate followers collection)
    followers_doc = await db.creator_followers.find_one({
        "creator_id": creator_id,
        "follower_id": current_user.id
    })
    
    if followers_doc:
        # Unfollow
        await db.creator_followers.delete_one({"_id": followers_doc["_id"]})
        await db.creator_profiles.update_one({"id": creator_id}, {"$inc": {"followers": -1}})
        action = "unfollowed"
    else:
        # Follow
        await db.creator_followers.insert_one({
            "creator_id": creator_id,
            "follower_id": current_user.id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        await db.creator_profiles.update_one({"id": creator_id}, {"$inc": {"followers": 1}})
        action = "followed"
    
    return {"status": action, "creator_id": creator_id}


@router.post("/{creator_id}/assemblies", response_model=CreatorAssembly)
async def create_assembly(
    creator_id: str,
    assembly: CreatorAssembly,
    current_user: User = Depends(get_current_user)
):
    """Create product assembly (Creator only)"""
    db = await get_database()
    
    creator = await db.creator_profiles.find_one({"id": creator_id})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    if creator["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Calculate total price from products
    total = 0.0
    for product_id in assembly.product_ids:
        product = await db.products.find_one({"id": product_id})
        if product:
            total += product.get("price", 0)
    
    assembly.total_price = total
    
    # Add assembly to creator profile
    await db.creator_profiles.update_one(
        {"id": creator_id},
        {"$push": {"assemblies": assembly.dict()}}
    )
    
    return assembly


@router.get("/{creator_id}/assemblies", response_model=List[CreatorAssembly])
async def get_assemblies(
    creator_id: str
):
    """Get creator's product assemblies"""
    db = await get_database()
    
    creator = await db.creator_profiles.find_one({"id": creator_id})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    assemblies = creator.get("assemblies", [])
    return [CreatorAssembly(**a) for a in assemblies]
