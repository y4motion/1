from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone

from models.category import Category, CategoryCreate, CategoryResponse, CategoryUpdate
from utils.auth_utils import get_current_user
from database import db

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category_data: CategoryCreate, current_user: dict = Depends(get_current_user)):
    """
    Create a new category (admin only)
    """
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user or not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create categories"
        )
    
    # Check if slug already exists
    existing = await db.categories.find_one({"slug": category_data.slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists"
        )
    
    category = Category(**category_data.model_dump())
    
    # Serialize datetime
    category_dict = category.model_dump()
    category_dict['created_at'] = category_dict['created_at'].isoformat()
    category_dict['updated_at'] = category_dict['updated_at'].isoformat()
    
    await db.categories.insert_one(category_dict)
    
    return CategoryResponse(**category.model_dump())


@router.get("/", response_model=List[CategoryResponse])
async def get_categories():
    """
    Get all active categories
    """
    categories = await db.categories.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Parse datetime
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
        if isinstance(cat.get('updated_at'), str):
            cat['updated_at'] = datetime.fromisoformat(cat['updated_at'])
    
    return [CategoryResponse(**c) for c in categories]


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    """
    Get a single category by ID
    """
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Parse datetime
    if isinstance(category.get('created_at'), str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    if isinstance(category.get('updated_at'), str):
        category['updated_at'] = datetime.fromisoformat(category['updated_at'])
    
    return CategoryResponse(**category)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a category (admin only)
    """
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user or not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update categories"
        )
    
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Update category
    update_data = {k: v for k, v in category_data.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.categories.update_one({"id": category_id}, {"$set": update_data})
    
    # Get updated category
    updated_category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    
    # Parse datetime
    if isinstance(updated_category.get('created_at'), str):
        updated_category['created_at'] = datetime.fromisoformat(updated_category['created_at'])
    if isinstance(updated_category.get('updated_at'), str):
        updated_category['updated_at'] = datetime.fromisoformat(updated_category['updated_at'])
    
    return CategoryResponse(**updated_category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a category (admin only)
    """
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user or not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete categories"
        )
    
    # Soft delete
    await db.categories.update_one({"id": category_id}, {"$set": {"is_active": False}})
    
    return {"message": "Category deleted successfully"}
