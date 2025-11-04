from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone

from models.cart import Cart, CartResponse, AddToCartRequest, UpdateCartItemRequest, CartItem
from utils.auth_utils import get_current_user
from database import db

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=CartResponse)
async def get_cart(current_user: dict = Depends(get_current_user)):
    """
    Get current user's cart
    """
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    if not cart:
        # Create empty cart
        cart = Cart(user_id=current_user["id"])
        cart_dict = cart.model_dump()
        cart_dict['updated_at'] = cart_dict['updated_at'].isoformat()
        await db.carts.insert_one(cart_dict)
        return CartResponse(**cart.model_dump())
    
    # Parse datetime
    if isinstance(cart.get('updated_at'), str):
        cart['updated_at'] = datetime.fromisoformat(cart['updated_at'])
    
    for item in cart.get('items', []):
        if isinstance(item.get('added_at'), str):
            item['added_at'] = datetime.fromisoformat(item['added_at'])
    
    return CartResponse(**cart)


@router.post("/items")
async def add_to_cart(item_data: AddToCartRequest, current_user: dict = Depends(get_current_user)):
    """
    Add item to cart
    """
    # Check if product exists
    product = await db.products.find_one({"id": item_data.product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    
    if not cart:
        cart = Cart(user_id=current_user["id"])
        cart_dict = cart.model_dump()
        cart_dict['updated_at'] = cart_dict['updated_at'].isoformat()
        await db.carts.insert_one(cart_dict)
        cart = cart_dict
    
    # Check if item already in cart
    items = cart.get("items", [])
    existing_item = None
    for item in items:
        if item["product_id"] == item_data.product_id:
            existing_item = item
            break
    
    if existing_item:
        # Update quantity
        existing_item["quantity"] += item_data.quantity
    else:
        # Add new item
        new_item = CartItem(
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            price=product["price"],
            product_title=product["title"],
            product_image=product["images"][0]["url"] if product.get("images") else ""
        )
        new_item_dict = new_item.model_dump()
        new_item_dict['added_at'] = new_item_dict['added_at'].isoformat()
        items.append(new_item_dict)
    
    # Calculate totals
    total = sum(item["price"] * item["quantity"] for item in items)
    item_count = sum(item["quantity"] for item in items)
    
    # Update cart
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {
            "items": items,
            "total": round(total, 2),
            "item_count": item_count,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Item added to cart", "item_count": item_count, "total": round(total, 2)}


@router.put("/items/{product_id}")
async def update_cart_item(
    product_id: str,
    update_data: UpdateCartItemRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update cart item quantity
    """
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    items = cart.get("items", [])
    item_found = False
    
    for item in items:
        if item["product_id"] == product_id:
            item["quantity"] = update_data.quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    # Calculate totals
    total = sum(item["price"] * item["quantity"] for item in items)
    item_count = sum(item["quantity"] for item in items)
    
    # Update cart
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {
            "items": items,
            "total": round(total, 2),
            "item_count": item_count,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Cart updated", "item_count": item_count, "total": round(total, 2)}


@router.delete("/items/{product_id}")
async def remove_from_cart(product_id: str, current_user: dict = Depends(get_current_user)):
    """
    Remove item from cart
    """
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    items = cart.get("items", [])
    items = [item for item in items if item["product_id"] != product_id]
    
    # Calculate totals
    total = sum(item["price"] * item["quantity"] for item in items)
    item_count = sum(item["quantity"] for item in items)
    
    # Update cart
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {
            "items": items,
            "total": round(total, 2),
            "item_count": item_count,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Item removed from cart", "item_count": item_count, "total": round(total, 2)}


@router.delete("/")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """
    Clear all items from cart
    """
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {
            "items": [],
            "total": 0.0,
            "item_count": 0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Cart cleared"}
