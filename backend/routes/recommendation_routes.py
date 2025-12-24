from fastapi import APIRouter, Depends
from utils.recommendations import recommendation_engine
from utils.auth_utils import get_current_user
from utils.responses import success_response
from models.user import User
from database import get_database
from typing import Optional

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/for-you")
async def get_personalized_recommendations(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Get personalized recommendations for current user"""
    
    recommendations = await recommendation_engine.get_hybrid_recommendations(
        user_id=current_user.id,
        limit=limit
    )
    
    return success_response(
        data=recommendations,
        message=f"Personalized recommendations for {current_user.username}"
    )


@router.get("/similar/{product_id}")
async def get_similar_products(
    product_id: str,
    limit: int = 10
):
    """Get similar products based on content"""
    db = await get_database()
    
    product_ids = await recommendation_engine.get_content_based_recommendations(
        product_id=product_id,
        limit=limit
    )
    
    # Fetch product details
    products = await db.products.find({
        'id': {'$in': product_ids},
        'status': 'approved'
    }).to_list(length=limit)
    
    return success_response(
        data=products,
        message=f"Found {len(products)} similar products"
    )


@router.get("/trending")
async def get_trending_products(limit: int = 10):
    """Get trending products based on views and rating"""
    
    trending = await recommendation_engine.get_trending_products(limit=limit)
    
    return success_response(
        data=trending,
        message=f"Top {len(trending)} trending products"
    )


@router.get("/bundle/{product_id}")
async def get_bundle_recommendations(
    product_id: str,
    limit: int = 5
):
    """Get frequently bought together products"""
    db = await get_database()
    
    # Simple implementation: get products in same category
    product = await db.products.find_one({'id': product_id})
    if not product:
        return success_response(data=[], message="Product not found")
    
    bundle_products = await db.products.find({
        'category_id': product.get('category_id'),
        'id': {'$ne': product_id},
        'status': 'approved'
    }).sort('rating', -1).limit(limit).to_list(length=limit)
    
    return success_response(
        data=bundle_products,
        message=f"Bundle recommendations"
    )
