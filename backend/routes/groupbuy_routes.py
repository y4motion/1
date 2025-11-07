from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models.groupbuy import GroupBuy, GroupBuyCreate, Participant, GroupBuyComment
from models.user import User
from utils.auth_utils import get_current_user
from database import get_database
from datetime import datetime, timezone

router = APIRouter(prefix="/groupbuy", tags=["groupbuy"])


def calculate_current_price(original_price: float, target_price: float, current: int, target: int) -> float:
    """Calculate current price based on participants"""
    if current >= target:
        return target_price
    
    # Linear interpolation
    progress = current / target
    price_diff = original_price - target_price
    return original_price - (price_diff * progress)


@router.post("", response_model=GroupBuy)
async def create_groupbuy(
    groupbuy_data: GroupBuyCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new group buy"""
    db = await get_database()
    
    # Validate deadline is in the future
    if groupbuy_data.deadline <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Deadline must be in the future")
    
    # Validate product exists
    product = await db.products.find_one({"id": groupbuy_data.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    groupbuy = GroupBuy(
        organizer_id=current_user.id,
        organizer_username=current_user.username,
        organizer_avatar=current_user.avatar_url,
        **groupbuy_data.dict(),
        current_price=groupbuy_data.original_price,
        status="active"
    )
    
    await db.groupbuys.insert_one(groupbuy.dict())
    
    # Award RP for organizing
    await db.user_stats.update_one(
        {"user_id": current_user.id},
        {"$inc": {"monthly_rp": 10}},
        upsert=True
    )
    
    return groupbuy


@router.get("", response_model=List[GroupBuy])
async def get_groupbuys(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, regex="^(active|successful|failed|completed)$"),
    sort_by: str = Query("created_at", regex="^(created_at|deadline|current_participants)$")
):
    """Get group buys list"""
    db = await get_database()
    
    query = {}
    if status:
        query["status"] = status
    
    groupbuys = await db.groupbuys.find(query).sort(sort_by, -1).skip(skip).limit(limit).to_list(length=limit)
    return [GroupBuy(**gb) for gb in groupbuys]


@router.get("/{groupbuy_id}", response_model=GroupBuy)
async def get_groupbuy(
    groupbuy_id: str
):
    """Get single group buy"""
    db = await get_database()
    
    groupbuy = await db.groupbuys.find_one({"id": groupbuy_id})
    if not groupbuy:
        raise HTTPException(status_code=404, detail="Group buy not found")
    
    # Increment view count
    await db.groupbuys.update_one({"id": groupbuy_id}, {"$inc": {"views": 1}})
    groupbuy["views"] = groupbuy.get("views", 0) + 1
    
    return GroupBuy(**groupbuy)


@router.post("/{groupbuy_id}/join")
async def join_groupbuy(
    groupbuy_id: str,
    quantity: int = Query(1, ge=1),
    current_user: User = Depends(get_current_user)
):
    """Join a group buy"""
    db = await get_database()
    
    groupbuy = await db.groupbuys.find_one({"id": groupbuy_id})
    if not groupbuy:
        raise HTTPException(status_code=404, detail="Group buy not found")
    
    if groupbuy["status"] != "active":
        raise HTTPException(status_code=400, detail="Group buy is not active")
    
    # Check if deadline passed
    deadline = datetime.fromisoformat(groupbuy["deadline"])
    if deadline < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Group buy deadline has passed")
    
    # Check if already joined
    participants = groupbuy.get("participants", [])
    for p in participants:
        if p["user_id"] == current_user.id:
            raise HTTPException(status_code=400, detail="Already joined this group buy")
    
    # Check max participants
    max_participants = groupbuy.get("max_participants")
    if max_participants and len(participants) >= max_participants:
        raise HTTPException(status_code=400, detail="Group buy is full")
    
    # Add participant
    participant = Participant(
        user_id=current_user.id,
        username=current_user.username,
        user_avatar=current_user.avatar_url,
        quantity=quantity
    )
    
    new_count = len(participants) + 1
    new_price = calculate_current_price(
        groupbuy["original_price"],
        groupbuy["target_price"],
        new_count,
        groupbuy["min_participants"]
    )
    
    await db.groupbuys.update_one(
        {"id": groupbuy_id},
        {
            "$push": {"participants": participant.dict()},
            "$inc": {"current_participants": 1},
            "$set": {"current_price": new_price}
        }
    )
    
    # Check if target reached
    if new_count >= groupbuy["min_participants"]:
        await db.groupbuys.update_one(
            {"id": groupbuy_id},
            {"$set": {"status": "successful"}}
        )
        
        # Award XP to organizer for successful group buy
        await db.user_stats.update_one(
            {"user_id": groupbuy["organizer_id"]},
            {"$inc": {"total_xp": 50}}
        )
    
    # Award RP for joining
    await db.user_stats.update_one(
        {"user_id": current_user.id},
        {"$inc": {"monthly_rp": 5}},
        upsert=True
    )
    
    return {
        "status": "joined",
        "current_participants": new_count,
        "current_price": new_price
    }


@router.post("/{groupbuy_id}/leave")
async def leave_groupbuy(
    groupbuy_id: str,
    current_user: User = Depends(get_current_user)
):
    """Leave a group buy"""
    db = await get_database()
    
    groupbuy = await db.groupbuys.find_one({"id": groupbuy_id})
    if not groupbuy:
        raise HTTPException(status_code=404, detail="Group buy not found")
    
    if groupbuy["status"] != "active":
        raise HTTPException(status_code=400, detail="Cannot leave non-active group buy")
    
    # Remove participant
    participants = groupbuy.get("participants", [])
    updated_participants = [p for p in participants if p["user_id"] != current_user.id]
    
    if len(updated_participants) == len(participants):
        raise HTTPException(status_code=400, detail="Not a participant of this group buy")
    
    new_count = len(updated_participants)
    new_price = calculate_current_price(
        groupbuy["original_price"],
        groupbuy["target_price"],
        new_count,
        groupbuy["min_participants"]
    )
    
    await db.groupbuys.update_one(
        {"id": groupbuy_id},
        {
            "$set": {
                "participants": updated_participants,
                "current_participants": new_count,
                "current_price": new_price
            }
        }
    )
    
    return {"status": "left", "current_participants": new_count}


@router.post("/{groupbuy_id}/interest")
async def toggle_interest(
    groupbuy_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark interest in group buy"""
    db = await get_database()
    
    groupbuy = await db.groupbuys.find_one({"id": groupbuy_id})
    if not groupbuy:
        raise HTTPException(status_code=404, detail="Group buy not found")
    
    interested = groupbuy.get("interested_users", [])
    is_interested = current_user.id in interested
    
    if is_interested:
        await db.groupbuys.update_one(
            {"id": groupbuy_id},
            {"$pull": {"interested_users": current_user.id}}
        )
        action = "removed"
    else:
        await db.groupbuys.update_one(
            {"id": groupbuy_id},
            {"$addToSet": {"interested_users": current_user.id}}
        )
        action = "added"
    
    return {"status": action, "groupbuy_id": groupbuy_id}


@router.post("/{groupbuy_id}/comments")
async def add_comment(
    groupbuy_id: str,
    content: str,
    current_user: User = Depends(get_current_user)
):
    """Add comment to group buy"""
    db = await get_database()
    
    groupbuy = await db.groupbuys.find_one({"id": groupbuy_id})
    if not groupbuy:
        raise HTTPException(status_code=404, detail="Group buy not found")
    
    comment = GroupBuyComment(
        groupbuy_id=groupbuy_id,
        user_id=current_user.id,
        username=current_user.username,
        user_avatar=current_user.avatar_url,
        content=content
    )
    
    await db.groupbuy_comments.insert_one(comment.dict())
    await db.groupbuys.update_one({"id": groupbuy_id}, {"$inc": {"comments_count": 1}})
    
    return comment


@router.get("/{groupbuy_id}/comments", response_model=List[GroupBuyComment])
async def get_comments(
    groupbuy_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get group buy comments"""
    db = await get_database()
    
    comments = await db.groupbuy_comments.find({"groupbuy_id": groupbuy_id}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    return [GroupBuyComment(**c) for c in comments]
