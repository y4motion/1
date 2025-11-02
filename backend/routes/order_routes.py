from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timezone
from database import db as db_client
from models.order import OrderCreate, Order, OrderResponse, OrderUpdate
from utils.auth_utils import get_current_user_optional
import logging

router = APIRouter(prefix="/api/orders", tags=["orders"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=OrderResponse)
async def create_order(order: OrderCreate, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Create a new order (supports both registered users and quick buy without registration).
    
    For quick buy: customer_email, customer_phone, customer_full_name must be provided
    For registered users: user_id will be set from JWT token
    """
    try:
        # Validate: either user is authenticated OR quick buy info is provided
        if not current_user and not (order.customer_email and order.customer_phone and order.customer_full_name):
            raise HTTPException(
                status_code=400,
                detail="Either authenticate or provide customer information for quick buy"
            )
        
        # Prepare order data
        order_dict = order.dict()
        
        # Set user_id if authenticated
        if current_user:
            order_dict['user_id'] = current_user['id']
        
        # Create Order instance to generate id and order_number
        new_order = Order(**order_dict)
        order_data = new_order.dict()
        
        # Convert datetime objects to ISO strings for MongoDB
        for key in ['created_at', 'updated_at', 'paid_at', 'shipped_at', 'delivered_at']:
            if order_data.get(key):
                order_data[key] = order_data[key].isoformat() if isinstance(order_data[key], datetime) else order_data[key]
        
        # Insert into database
        await db_client.orders.insert_one(order_data)
        
        logger.info(f"Order created: {new_order.order_number} ({new_order.id})")
        
        return OrderResponse(**new_order.dict())
    
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get orders. 
    - Admins/sellers can see all orders
    - Regular users can see only their orders
    - Unauthenticated users cannot access this endpoint
    """
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Build query filter
        query = {}
        
        # Regular users can only see their own orders
        if not current_user.get('is_admin') and not current_user.get('is_seller'):
            query['user_id'] = current_user['id']
        
        # Filter by status if provided
        if status:
            query['order_status'] = status
        
        # Fetch orders
        cursor = db_client.orders.find(query).skip(skip).limit(limit).sort('created_at', -1)
        orders = await cursor.to_list(length=limit)
        
        return [OrderResponse(**order) for order in orders]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Get a specific order by ID.
    Users can only access their own orders unless they're admin/seller.
    """
    try:
        # Fetch order
        order = await db_client.orders.find_one({"id": order_id})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Check permissions
        if current_user:
            # Admins and sellers can see any order
            if not current_user.get('is_admin') and not current_user.get('is_seller'):
                # Regular users can only see their own orders
                if order.get('user_id') != current_user['id']:
                    raise HTTPException(status_code=403, detail="Access denied")
        else:
            # For unauthenticated quick buy orders, allow access by order_id
            # (in production, add additional security like email verification)
            pass
        
        return OrderResponse(**order)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch order: {str(e)}")


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order_update: OrderUpdate,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Update order status (admin/seller only).
    """
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Check permissions: only admin or seller can update orders
        if not current_user.get('is_admin') and not current_user.get('is_seller'):
            raise HTTPException(status_code=403, detail="Only admins and sellers can update orders")
        
        # Fetch existing order
        order = await db_client.orders.find_one({"id": order_id})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Prepare update data
        update_data = {k: v for k, v in order_update.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated timestamp
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Convert datetime objects to ISO strings
        for key in ['shipped_at', 'delivered_at']:
            if key in update_data and isinstance(update_data[key], datetime):
                update_data[key] = update_data[key].isoformat()
        
        # Update in database
        await db_client.orders.update_one(
            {"id": order_id},
            {"$set": update_data}
        )
        
        # Fetch and return updated order
        updated_order = await db_client.orders.find_one({"id": order_id})
        
        logger.info(f"Order updated: {order_id}")
        
        return OrderResponse(**updated_order)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update order: {str(e)}")


@router.delete("/{order_id}")
async def delete_order(order_id: str, current_user: dict = Depends(get_current_user_optional)):
    """
    Delete an order (admin only).
    In production, consider soft delete instead.
    """
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Only admins can delete orders
        if not current_user.get('is_admin'):
            raise HTTPException(status_code=403, detail="Only admins can delete orders")
        
        # Check if order exists
        order = await db_client.orders.find_one({"id": order_id})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Delete order
        await db_client.orders.delete_one({"id": order_id})
        
        logger.info(f"Order deleted: {order_id}")
        
        return {"message": "Order deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete order: {str(e)}")
