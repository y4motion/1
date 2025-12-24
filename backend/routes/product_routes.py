from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone

from models.product import Product, ProductCreate, ProductResponse, ProductUpdate
from models.category import Category
from utils.auth_utils import get_current_user
from utils.cache import cache_response, invalidate_cache
from database import db

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/facets")
@cache_response(ttl_seconds=300)  # Cache for 5 minutes
async def get_product_facets():
    """Get dynamic facets for filtering"""
    from collections import defaultdict
    
    # Get all approved products
    products = await db.products.find({"status": "approved"}).to_list(length=None)
    
    facets = {
        "categories": defaultdict(lambda: {"count": 0, "name": ""}),
        "brands": defaultdict(lambda: {"count": 0}),
        "ratings": {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    }
    
    for product in products:
        # Category facets
        cat_id = product.get("category_id")
        if cat_id:
            facets["categories"][cat_id]["count"] += 1
            facets["categories"][cat_id]["id"] = cat_id
            facets["categories"][cat_id]["name"] = cat_id
        
        # Brand facets (if exists)
        brand = product.get("brand", product.get("seller_id", ""))[:20]  # Limit brand name
        if brand:
            facets["brands"][brand]["count"] += 1
            facets["brands"][brand]["id"] = brand
            facets["brands"][brand]["name"] = brand
        
        # Rating facets
        rating = int(product.get("rating", 0))
        if rating >= 1:
            for r in range(1, rating + 1):
                facets["ratings"][r] += 1
    
    return {
        "success": True,
        "data": {
            "categories": [
                {**v, "id": k} 
                for k, v in facets["categories"].items()
            ],
            "brands": sorted(
                [{"id": k, "name": k, "count": v["count"]} for k, v in facets["brands"].items()],
                key=lambda x: x["count"],
                reverse=True
            )[:20],  # Top 20 brands
            "ratings": facets["ratings"]
        }
    }




@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate, current_user: dict = Depends(get_current_user)):
    """
    Create a new product (requires authentication)
    """
    # Check if user has seller/admin permissions
    user = await db.users.find_one({"id": current_user["id"]})
    if not user or (not user.get("is_seller") and not user.get("is_admin")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers and admins can create products"
        )
    
    # Create product
    product = Product(
        **product_data.model_dump(),
        seller_id=current_user["id"]
    )
    
    # Serialize datetime
    product_dict = product.model_dump()
    product_dict['created_at'] = product_dict['created_at'].isoformat()
    product_dict['updated_at'] = product_dict['updated_at'].isoformat()
    
    await db.products.insert_one(product_dict)
    
    # Invalidate products list cache
    invalidate_cache("get_products:*")
    
    return ProductResponse(**product.model_dump())


@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    subcategory_id: Optional[str] = None,
    persona_id: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = Query("created_at", regex="^(created_at|price|average_rating|views)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    status: str = Query("approved", regex="^(all|pending|approved|rejected)$"),
    specific_filters: Optional[str] = None  # JSON string of specific filters
):
    """
    Get all products with filters and pagination
    Supports persona filtering and specific_filters (dynamic filters by subcategory)
    """
    import json
    
    # Build query
    query = {"is_active": True}
    
    if status != "all":
        query["status"] = status
    
    if category_id:
        query["category_id"] = category_id
    
    if subcategory_id:
        query["subcategory_id"] = subcategory_id
    
    # Filter by persona
    if persona_id:
        query["personas"] = {"$in": [persona_id]}
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search]}}
        ]
    
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    
    # Apply specific filters (dynamic filtering based on specific_filters dict)
    if specific_filters:
        try:
            filters_dict = json.loads(specific_filters)
            for key, value in filters_dict.items():
                if value:  # Only apply non-empty filters
                    filter_key = f"specific_filters.{key}"
                    
                    # Handle different filter types
                    if isinstance(value, list):
                        # Checkbox filters - any of the selected values
                        query[filter_key] = {"$in": value}
                    elif isinstance(value, dict):
                        # Range filters
                        if "min" in value and value["min"]:
                            query[filter_key] = {"$gte": float(value["min"])}
                        if "max" in value and value["max"]:
                            if filter_key in query:
                                query[filter_key]["$lte"] = float(value["max"])
                            else:
                                query[filter_key] = {"$lte": float(value["max"])}
                    elif isinstance(value, bool):
                        # Boolean filters
                        query[filter_key] = value
                    else:
                        # Text filters - exact match or regex
                        query[filter_key] = {"$regex": str(value), "$options": "i"}
        except json.JSONDecodeError:
            pass  # Ignore invalid JSON
    
    # Sort order
    sort_direction = -1 if sort_order == "desc" else 1
    
    # Query database
    products = await db.products.find(query, {"_id": 0}).sort(sort_by, sort_direction).skip(skip).limit(limit).to_list(limit)
    
    # Parse datetime
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return [ProductResponse(**p) for p in products]


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """
    Get a single product by ID and increment view count
    """
    product_dict = await db.products.find_one({"id": product_id}, {"_id": 0})
    
    if not product_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Increment view count
    await db.products.update_one(
        {"id": product_id},
        {"$inc": {"views": 1}}
    )
    product_dict['views'] = product_dict.get('views', 0) + 1
    
    # Parse datetime
    if isinstance(product_dict.get('created_at'), str):
        product_dict['created_at'] = datetime.fromisoformat(product_dict['created_at'])
    if isinstance(product_dict.get('updated_at'), str):
        product_dict['updated_at'] = datetime.fromisoformat(product_dict['updated_at'])
    
    return ProductResponse(**product_dict)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a product (only by seller or admin)
    """
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check permissions
    user = await db.users.find_one({"id": current_user["id"]})
    if product["seller_id"] != current_user["id"] and not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this product"
        )
    
    # Update product
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    # Get updated product
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    
    # Parse datetime
    if isinstance(updated_product.get('created_at'), str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    if isinstance(updated_product.get('updated_at'), str):
        updated_product['updated_at'] = datetime.fromisoformat(updated_product['updated_at'])
    
    return ProductResponse(**updated_product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a product (soft delete by setting is_active=False)
    """
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check permissions
    user = await db.users.find_one({"id": current_user["id"]})
    if product["seller_id"] != current_user["id"] and not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this product"
        )
    
    # Soft delete
    await db.products.update_one({"id": product_id}, {"$set": {"is_active": False}})
    
    return {"message": "Product deleted successfully"}


@router.post("/{product_id}/wishlist", status_code=status.HTTP_200_OK)
async def toggle_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    """
    Add or remove product from user's wishlist
    """
    user = await db.users.find_one({"id": current_user["id"]})
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    wishlist = user.get("wishlist", [])
    
    if product_id in wishlist:
        # Remove from wishlist
        wishlist.remove(product_id)
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"wishlist": wishlist}}
        )
        await db.products.update_one(
            {"id": product_id},
            {"$inc": {"wishlist_count": -1}}
        )
        return {"message": "Removed from wishlist", "in_wishlist": False}
    else:
        # Add to wishlist
        wishlist.append(product_id)
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"wishlist": wishlist}}
        )
        await db.products.update_one(
            {"id": product_id},
            {"$inc": {"wishlist_count": 1}}
        )
        return {"message": "Added to wishlist", "in_wishlist": True}
