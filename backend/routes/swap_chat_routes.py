"""
Swap Chat Routes - Private messaging between buyers and sellers
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, Query
from typing import Dict, List, Optional
from datetime import datetime, timezone
import uuid
import json

from database import db
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/swap/chat", tags=["Swap Chat"])

# Store active WebSocket connections per conversation
# Key: conversation_id, Value: list of (user_id, websocket)
active_connections: Dict[str, List[tuple]] = {}


# =====================
# CONVERSATION MODELS
# =====================

async def get_or_create_conversation(listing_id: str, buyer_id: str, seller_id: str) -> dict:
    """Get existing conversation or create new one"""
    
    # Check if conversation exists
    conversation = await db.swap_conversations.find_one({
        "listing_id": listing_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id
    }, {"_id": 0})
    
    if conversation:
        return conversation
    
    # Create new conversation
    conversation = {
        "id": str(uuid.uuid4()),
        "listing_id": listing_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "last_message": None,
        "unread_buyer": 0,
        "unread_seller": 0,
        "status": "active"  # active, archived, blocked
    }
    
    await db.swap_conversations.insert_one(conversation)
    return conversation


# =====================
# REST ENDPOINTS
# =====================

@router.get("/conversations")
async def get_my_conversations(
    current_user: dict = Depends(get_current_user)
):
    """Get all conversations for current user (as buyer or seller)"""
    
    conversations = await db.swap_conversations.find({
        "$or": [
            {"buyer_id": current_user["id"]},
            {"seller_id": current_user["id"]}
        ],
        "status": "active"
    }, {"_id": 0}).sort("updated_at", -1).to_list(50)
    
    # Enrich with listing and user info
    enriched = []
    for conv in conversations:
        # Get listing info
        listing = await db.swap_listings.find_one({"id": conv["listing_id"]}, {"_id": 0, "title": 1, "price": 1, "images": 1})
        
        # Get other user info
        other_user_id = conv["seller_id"] if conv["buyer_id"] == current_user["id"] else conv["buyer_id"]
        other_user = await db.users.find_one({"id": other_user_id}, {"_id": 0, "username": 1})
        
        # Calculate unread count for current user
        is_buyer = conv["buyer_id"] == current_user["id"]
        unread = conv["unread_buyer"] if is_buyer else conv["unread_seller"]
        
        enriched.append({
            **conv,
            "listing_title": listing.get("title") if listing else "Deleted listing",
            "listing_price": listing.get("price") if listing else 0,
            "listing_image": listing.get("images", [{}])[0].get("url") if listing else None,
            "other_user_name": other_user.get("username") if other_user else "User",
            "unread": unread,
            "is_buyer": is_buyer
        })
    
    return enriched


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get messages for a conversation"""
    
    # Verify user has access
    conversation = await db.swap_conversations.find_one({"id": conversation_id}, {"_id": 0})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if current_user["id"] not in [conversation["buyer_id"], conversation["seller_id"]]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get messages
    messages = await db.swap_messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Mark as read
    is_buyer = conversation["buyer_id"] == current_user["id"]
    await db.swap_conversations.update_one(
        {"id": conversation_id},
        {"$set": {"unread_buyer" if is_buyer else "unread_seller": 0}}
    )
    
    return list(reversed(messages))


@router.post("/conversations/{listing_id}/start")
async def start_conversation(
    listing_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Start or get existing conversation with seller"""
    
    # Get listing
    listing = await db.swap_listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["seller_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    
    conversation = await get_or_create_conversation(
        listing_id=listing_id,
        buyer_id=current_user["id"],
        seller_id=listing["seller_id"]
    )
    
    return conversation


@router.post("/conversations/{conversation_id}/send")
async def send_message(
    conversation_id: str,
    message: dict,
    current_user: dict = Depends(get_current_user)
):
    """Send a message via REST (alternative to WebSocket)"""
    
    conversation = await db.swap_conversations.find_one({"id": conversation_id}, {"_id": 0})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if current_user["id"] not in [conversation["buyer_id"], conversation["seller_id"]]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create message
    msg = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "sender_id": current_user["id"],
        "text": message.get("text", ""),
        "type": message.get("type", "text"),  # text, offer, image
        "offer_amount": message.get("offer_amount"),  # For price offers
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    
    await db.swap_messages.insert_one(msg)
    
    # Update conversation
    is_buyer = conversation["buyer_id"] == current_user["id"]
    unread_field = "unread_seller" if is_buyer else "unread_buyer"
    
    await db.swap_conversations.update_one(
        {"id": conversation_id},
        {
            "$set": {
                "last_message": msg["text"][:100],
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$inc": {unread_field: 1}
        }
    )
    
    # Broadcast to WebSocket connections
    if conversation_id in active_connections:
        for user_id, ws in active_connections[conversation_id]:
            if user_id != current_user["id"]:
                try:
                    await ws.send_json(msg)
                except:
                    pass
    
    return msg


# =====================
# WEBSOCKET ENDPOINT
# =====================

@router.websocket("/ws/{conversation_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: str,
    token: str = Query(...)
):
    """WebSocket endpoint for real-time chat"""
    
    await websocket.accept()
    
    # Verify token and get user
    try:
        from utils.auth_utils import decode_token
        payload = decode_token(token)
        user_id = payload.get("user_id")
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token")
            return
    except Exception as e:
        await websocket.close(code=4001, reason="Authentication failed")
        return
    
    # Verify access to conversation
    conversation = await db.swap_conversations.find_one({"id": conversation_id}, {"_id": 0})
    if not conversation or user_id not in [conversation["buyer_id"], conversation["seller_id"]]:
        await websocket.close(code=4003, reason="Not authorized")
        return
    
    # Add to active connections
    if conversation_id not in active_connections:
        active_connections[conversation_id] = []
    active_connections[conversation_id].append((user_id, websocket))
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "conversation_id": conversation_id,
            "user_id": user_id
        })
        
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "message":
                # Create and save message
                msg = {
                    "id": str(uuid.uuid4()),
                    "conversation_id": conversation_id,
                    "sender_id": user_id,
                    "text": data.get("text", ""),
                    "type": data.get("message_type", "text"),
                    "offer_amount": data.get("offer_amount"),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "read": False
                }
                
                await db.swap_messages.insert_one(msg)
                
                # Update conversation
                is_buyer = conversation["buyer_id"] == user_id
                unread_field = "unread_seller" if is_buyer else "unread_buyer"
                
                await db.swap_conversations.update_one(
                    {"id": conversation_id},
                    {
                        "$set": {
                            "last_message": msg["text"][:100],
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        },
                        "$inc": {unread_field: 1}
                    }
                )
                
                # Broadcast to all connections in this conversation
                for uid, ws in active_connections[conversation_id]:
                    try:
                        await ws.send_json(msg)
                    except:
                        pass
            
            elif data.get("type") == "typing":
                # Broadcast typing indicator
                for uid, ws in active_connections[conversation_id]:
                    if uid != user_id:
                        try:
                            await ws.send_json({
                                "type": "typing",
                                "user_id": user_id
                            })
                        except:
                            pass
            
            elif data.get("type") == "read":
                # Mark messages as read
                is_buyer = conversation["buyer_id"] == user_id
                await db.swap_conversations.update_one(
                    {"id": conversation_id},
                    {"$set": {"unread_buyer" if is_buyer else "unread_seller": 0}}
                )
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Remove from active connections
        if conversation_id in active_connections:
            active_connections[conversation_id] = [
                (uid, ws) for uid, ws in active_connections[conversation_id]
                if ws != websocket
            ]
            if not active_connections[conversation_id]:
                del active_connections[conversation_id]
