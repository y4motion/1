from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from datetime import datetime, timezone

from models.review import Review, ReviewCreate, ReviewResponse, ReviewReaction
from utils.auth_utils import get_current_user
from database import db

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    """
    Create a review for a product
    """
    # Check if product exists
    product = await db.products.find_one({"id": review_data.product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user already reviewed this product
    existing_review = await db.reviews.find_one({
        "product_id": review_data.product_id,
        "user_id": current_user["id"]
    })
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    # Get user info for caching
    user = await db.users.find_one({"id": current_user["id"]})
    
    # Create review
    review = Review(
        **review_data.model_dump(),
        user_id=current_user["id"],
        username=user.get("username", "Anonymous"),
        user_avatar=user.get("avatar_url")
    )
    
    # Serialize datetime
    review_dict = review.model_dump()
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    review_dict['updated_at'] = review_dict['updated_at'].isoformat()
    
    await db.reviews.insert_one(review_dict)
    
    # Update product rating
    await update_product_rating(review_data.product_id)
    
    return ReviewResponse(**review.model_dump())


async def update_product_rating(product_id: str):
    """Recalculate and update product's average rating"""
    reviews = await db.reviews.find({
        "product_id": product_id,
        "status": "approved"
    }).to_list(1000)
    
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        await db.products.update_one(
            {"id": product_id},
            {"$set": {
                "average_rating": round(avg_rating, 2),
                "total_reviews": len(reviews)
            }}
        )


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", regex="^(created_at|rating|helpful_count)$")
):
    """
    Get all reviews for a product
    """
    reviews = await db.reviews.find(
        {"product_id": product_id, "status": "approved"},
        {"_id": 0}
    ).sort(sort_by, -1).skip(skip).limit(limit).to_list(limit)
    
    # Parse datetime
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
        if isinstance(review.get('updated_at'), str):
            review['updated_at'] = datetime.fromisoformat(review['updated_at'])
    
    return [ReviewResponse(**r) for r in reviews]


@router.post("/{review_id}/reaction")
async def react_to_review(
    review_id: str,
    reaction_type: str = Query(..., regex="^(helpful|unhelpful)$"),
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a review as helpful or unhelpful
    """
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if user already reacted
    existing_reaction = await db.review_reactions.find_one({
        "review_id": review_id,
        "user_id": current_user["id"]
    })
    
    if existing_reaction:
        # Remove old reaction count
        old_type = existing_reaction["reaction_type"]
        await db.reviews.update_one(
            {"id": review_id},
            {"$inc": {f"{old_type}_count": -1}}
        )
        
        # Update reaction
        await db.review_reactions.update_one(
            {"review_id": review_id, "user_id": current_user["id"]},
            {"$set": {"reaction_type": reaction_type}}
        )
    else:
        # Create new reaction
        reaction = ReviewReaction(
            review_id=review_id,
            user_id=current_user["id"],
            reaction_type=reaction_type
        )
        await db.review_reactions.insert_one(reaction.model_dump())
    
    # Update review count
    await db.reviews.update_one(
        {"id": review_id},
        {"$inc": {f"{reaction_type}_count": 1}}
    )
    
    return {"message": "Reaction recorded"}


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a review (only by author or admin)
    """
    review = await db.reviews.find_one({"id": review_id})
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check permissions
    user = await db.users.find_one({"id": current_user["id"]})
    if review["user_id"] != current_user["id"] and not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this review"
        )
    
    # Delete review
    product_id = review["product_id"]
    await db.reviews.delete_one({"id": review_id})
    
    # Update product rating
    await update_product_rating(product_id)
    
    return {"message": "Review deleted successfully"}
