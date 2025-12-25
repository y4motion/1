from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

from database import db
from models.swap_listing import (
    SwapListing, SwapListingCreate, SwapListingUpdate, SwapListingResponse,
    SwapCondition, SwapDeliveryType, SwapListingStatus, SwapSellerRating
)
from models.swap_transaction import (
    SwapTransaction, SwapTransactionCreate, SwapTransactionUpdate,
    SwapReview, SwapReviewCreate, TransactionStatus
)
from utils.auth_utils import get_current_user, get_optional_user

router = APIRouter(prefix="/swap", tags=["Glassy Swap"])


# =====================
# LISTINGS ENDPOINTS
# =====================

@router.get("/listings", response_model=List[SwapListingResponse])
async def get_swap_listings(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    condition: Optional[SwapCondition] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    accepts_trade: Optional[bool] = None,
    search: Optional[str] = None,
    seller_min_rating: Optional[float] = None,
    sort_by: str = Query("newest", enum=["newest", "oldest", "price_asc", "price_desc", "popular"]),
    skip: int = 0,
    limit: int = 20
):
    """Get swap listings with filters - infinite scroll support"""
    
    # Build query
    query = {"status": SwapListingStatus.ACTIVE.value}
    
    if category:
        query["category"] = category
    if subcategory:
        query["subcategory"] = subcategory
    if condition:
        query["condition"] = condition.value
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if accepts_trade is not None:
        query["accepts_trade"] = accepts_trade
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    
    # Text search
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search.lower()]}}
        ]
    
    # Sorting
    sort_options = {
        "newest": [("created_at", -1)],
        "oldest": [("created_at", 1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "popular": [("views", -1)]
    }
    sort = sort_options.get(sort_by, [("created_at", -1)])
    
    # Boosted first
    sort = [("is_boosted", -1)] + sort
    
    # Fetch listings
    cursor = db.swap_listings.find(query, {"_id": 0}).sort(sort).skip(skip).limit(limit)
    listings = await cursor.to_list(length=limit)
    
    # Enrich with seller info
    enriched_listings = []
    for listing in listings:
        # Get seller info
        seller = await db.users.find_one({"id": listing["seller_id"]}, {"_id": 0})
        seller_rating = await db.swap_seller_ratings.find_one({"user_id": listing["seller_id"]}, {"_id": 0})
        
        if seller:
            listing["seller_username"] = seller.get("username")
            listing["seller_verified"] = seller.get("is_verified_creator", False)
        
        if seller_rating:
            listing["seller_rating"] = seller_rating.get("total_rating", 0)
            listing["seller_deals_count"] = seller_rating.get("successful_deals", 0)
            
            # Filter by seller rating if specified
            if seller_min_rating and seller_rating.get("total_rating", 0) < seller_min_rating:
                continue
        else:
            listing["seller_rating"] = 0
            listing["seller_deals_count"] = 0
        
        enriched_listings.append(listing)
    
    return enriched_listings


@router.get("/listings/{listing_id}", response_model=SwapListingResponse)
async def get_swap_listing(listing_id: str):
    """Get single listing details"""
    
    listing = await db.swap_listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Increment views
    await db.swap_listings.update_one(
        {"id": listing_id},
        {"$inc": {"views": 1}}
    )
    listing["views"] += 1
    
    # Get seller info
    seller = await db.users.find_one({"id": listing["seller_id"]}, {"_id": 0})
    seller_rating = await db.swap_seller_ratings.find_one({"user_id": listing["seller_id"]}, {"_id": 0})
    
    if seller:
        listing["seller_username"] = seller.get("username")
        listing["seller_verified"] = seller.get("is_verified_creator", False)
    
    if seller_rating:
        listing["seller_rating"] = seller_rating.get("total_rating", 0)
        listing["seller_deals_count"] = seller_rating.get("successful_deals", 0)
    
    return listing


@router.post("/listings", response_model=SwapListingResponse)
async def create_swap_listing(
    listing_data: SwapListingCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new swap listing"""
    
    listing = SwapListing(
        **listing_data.model_dump(),
        seller_id=current_user["id"],
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)  # 30 days expiry
    )
    
    doc = listing.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    if doc["expires_at"]:
        doc["expires_at"] = doc["expires_at"].isoformat()
    
    await db.swap_listings.insert_one(doc)
    
    # Add XP for creating listing
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"experience": 10}}
    )
    
    # Enrich response
    doc["seller_username"] = current_user.get("username")
    doc["seller_rating"] = 0
    doc["seller_deals_count"] = 0
    doc["seller_verified"] = current_user.get("is_verified_creator", False)
    
    return doc


@router.put("/listings/{listing_id}", response_model=SwapListingResponse)
async def update_swap_listing(
    listing_id: str,
    update_data: SwapListingUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update listing"""
    
    listing = await db.swap_listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["seller_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.swap_listings.update_one(
        {"id": listing_id},
        {"$set": update_dict}
    )
    
    updated = await db.swap_listings.find_one({"id": listing_id}, {"_id": 0})
    return updated


@router.delete("/listings/{listing_id}")
async def delete_swap_listing(
    listing_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete (soft) listing"""
    
    listing = await db.swap_listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["seller_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.swap_listings.update_one(
        {"id": listing_id},
        {"$set": {"status": SwapListingStatus.DELETED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Listing deleted"}


@router.get("/my-listings", response_model=List[SwapListingResponse])
async def get_my_listings(
    status: Optional[SwapListingStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get current user's listings"""
    
    query = {"seller_id": current_user["id"]}
    if status:
        query["status"] = status.value
    
    listings = await db.swap_listings.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return listings


# =====================
# FAVORITES ENDPOINTS
# =====================

@router.post("/listings/{listing_id}/favorite")
async def toggle_favorite(
    listing_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle favorite on listing"""
    
    listing = await db.swap_listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check if already favorited
    existing = await db.swap_favorites.find_one({
        "user_id": current_user["id"],
        "listing_id": listing_id
    })
    
    if existing:
        # Remove favorite
        await db.swap_favorites.delete_one({"user_id": current_user["id"], "listing_id": listing_id})
        await db.swap_listings.update_one({"id": listing_id}, {"$inc": {"favorites_count": -1}})
        return {"favorited": False}
    else:
        # Add favorite
        await db.swap_favorites.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "listing_id": listing_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        await db.swap_listings.update_one({"id": listing_id}, {"$inc": {"favorites_count": 1}})
        return {"favorited": True}


@router.get("/favorites", response_model=List[SwapListingResponse])
async def get_my_favorites(
    current_user: dict = Depends(get_current_user)
):
    """Get user's favorited listings"""
    
    favorites = await db.swap_favorites.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    listing_ids = [f["listing_id"] for f in favorites]
    
    listings = await db.swap_listings.find({"id": {"$in": listing_ids}}, {"_id": 0}).to_list(100)
    return listings


# =====================
# SELLER RATING ENDPOINTS
# =====================

@router.get("/seller/{user_id}/rating")
async def get_seller_rating(user_id: str):
    """Get seller rating info"""
    
    rating = await db.swap_seller_ratings.find_one({"user_id": user_id}, {"_id": 0})
    if not rating:
        # Return default rating
        return SwapSellerRating(user_id=user_id).model_dump()
    
    return rating


@router.get("/seller/{user_id}/reviews")
async def get_seller_reviews(
    user_id: str,
    skip: int = 0,
    limit: int = 20
):
    """Get reviews for seller"""
    
    reviews = await db.swap_reviews.find(
        {"reviewed_user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with reviewer info
    for review in reviews:
        reviewer = await db.users.find_one({"id": review["reviewer_id"]}, {"_id": 0})
        if reviewer:
            review["reviewer_username"] = reviewer.get("username")
    
    return reviews


# =====================
# CATEGORIES
# =====================

@router.get("/categories")
async def get_swap_categories():
    """Get swap categories with counts"""
    
    categories = [
        {"id": "gpu", "name": {"en": "Graphics Cards", "ru": "Видеокарты"}, "icon": "gpu"},
        {"id": "cpu", "name": {"en": "Processors", "ru": "Процессоры"}, "icon": "cpu"},
        {"id": "motherboard", "name": {"en": "Motherboards", "ru": "Материнские платы"}, "icon": "motherboard"},
        {"id": "ram", "name": {"en": "Memory", "ru": "Оперативная память"}, "icon": "ram"},
        {"id": "storage", "name": {"en": "Storage", "ru": "Накопители"}, "icon": "storage"},
        {"id": "psu", "name": {"en": "Power Supplies", "ru": "Блоки питания"}, "icon": "psu"},
        {"id": "case", "name": {"en": "Cases", "ru": "Корпуса"}, "icon": "case"},
        {"id": "cooling", "name": {"en": "Cooling", "ru": "Охлаждение"}, "icon": "cooling"},
        {"id": "peripherals", "name": {"en": "Peripherals", "ru": "Периферия"}, "icon": "peripherals"},
        {"id": "monitors", "name": {"en": "Monitors", "ru": "Мониторы"}, "icon": "monitor"},
        {"id": "laptops", "name": {"en": "Laptops", "ru": "Ноутбуки"}, "icon": "laptop"},
        {"id": "full_builds", "name": {"en": "Full Builds", "ru": "Готовые сборки"}, "icon": "pc"},
        {"id": "audio", "name": {"en": "Audio", "ru": "Аудио"}, "icon": "audio"},
        {"id": "networking", "name": {"en": "Networking", "ru": "Сетевое оборудование"}, "icon": "network"},
        {"id": "other", "name": {"en": "Other", "ru": "Другое"}, "icon": "other"}
    ]
    
    # Get counts for each category
    for cat in categories:
        count = await db.swap_listings.count_documents({
            "category": cat["id"],
            "status": SwapListingStatus.ACTIVE.value
        })
        cat["count"] = count
    
    return categories


# =====================
# STATS
# =====================

@router.get("/stats")
async def get_swap_stats():
    """Get general swap stats"""
    
    active_listings = await db.swap_listings.count_documents({"status": SwapListingStatus.ACTIVE.value})
    total_transactions = await db.swap_transactions.count_documents({"status": TransactionStatus.COMPLETED.value})
    total_sellers = len(await db.swap_listings.distinct("seller_id"))
    
    return {
        "active_listings": active_listings,
        "completed_transactions": total_transactions,
        "active_sellers": total_sellers
    }
