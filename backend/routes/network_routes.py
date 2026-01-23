"""
Network Routes - Ghost Network Feed API

Endpoints for posts, comments, likes, saves
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone

from database import db
from models.network_post import (
    NetworkPostCreate, NetworkPostUpdate, NetworkPost,
    PostCategory, PostStatus
)
from routes.auth_routes import get_current_user
from services.network_service import NetworkService

router = APIRouter(prefix="/network", tags=["network"])

# Initialize service
network_service = NetworkService(db)


# ========================================
# POSTS
# ========================================

@router.get("/feed")
async def get_feed(
    category: Optional[str] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    sort: str = Query("hot", description="Sort by: hot, new, top"),
    current_user: dict = Depends(get_current_user)
):
    """Get network feed with posts"""
    
    cat = None
    if category:
        try:
            cat = PostCategory(category)
        except ValueError:
            pass
    
    posts = await network_service.get_feed(
        category=cat,
        page=page,
        limit=limit,
        sort=sort
    )
    
    # Add user interaction flags
    user_id = current_user.get("id") if current_user else None
    
    for post in posts:
        post["is_liked"] = user_id in post.get("liked_by", []) if user_id else False
        post["is_saved"] = user_id in post.get("saved_by", []) if user_id else False
        # Don't expose full lists
        post.pop("liked_by", None)
        post.pop("saved_by", None)
    
    return {
        "posts": posts,
        "page": page,
        "limit": limit,
        "has_more": len(posts) == limit
    }


@router.get("/post/{post_id}")
async def get_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single post with comments"""
    
    post = await db["network_posts"].find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.pop("_id", None)
    
    # Increment views
    await network_service.increment_views(post_id)
    
    # Get comments
    comments = await db["network_comments"].find({"post_id": post_id}).sort("created_at", -1).limit(50).to_list(length=50)
    for c in comments:
        c.pop("_id", None)
    
    # User flags
    user_id = current_user.get("id") if current_user else None
    post["is_liked"] = user_id in post.get("liked_by", []) if user_id else False
    post["is_saved"] = user_id in post.get("saved_by", []) if user_id else False
    post.pop("liked_by", None)
    post.pop("saved_by", None)
    
    return {
        "post": post,
        "comments": comments
    }


@router.post("/post")
async def create_post(
    post_data: NetworkPostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new post"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, post, message = await network_service.create_post(
        user_id=current_user["id"],
        post_data=post_data
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "message": message,
        "post": post.model_dump() if post else None
    }


@router.put("/post/{post_id}")
async def update_post(
    post_id: str,
    update_data: NetworkPostUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a post"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, post, message = await network_service.update_post(
        post_id=post_id,
        user_id=current_user["id"],
        update_data=update_data
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "message": message,
        "post": post.model_dump() if post else None
    }


@router.delete("/post/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a post"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, message = await network_service.delete_post(
        post_id=post_id,
        user_id=current_user["id"]
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {"success": True, "message": message}


@router.post("/post/{post_id}/publish")
async def publish_draft(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Publish a draft post"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, message = await network_service.publish_draft(
        post_id=post_id,
        user_id=current_user["id"]
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {"success": True, "message": message}


# ========================================
# ENGAGEMENT
# ========================================

@router.post("/post/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Like or unlike a post"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, count, message = await network_service.like_post(
        post_id=post_id,
        user_id=current_user["id"]
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "likes": count,
        "action": message.lower()
    }


@router.post("/post/{post_id}/save")
async def save_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Save or unsave a post"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, count, message = await network_service.save_post(
        post_id=post_id,
        user_id=current_user["id"]
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "saves": count,
        "action": message.lower()
    }


@router.post("/post/{post_id}/comment")
async def add_comment(
    post_id: str,
    content: str = Query(..., min_length=1, max_length=2000),
    parent_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Add a comment to a post"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, comment, message = await network_service.add_comment(
        post_id=post_id,
        user_id=current_user["id"],
        content=content,
        parent_comment_id=parent_id
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "comment": comment.model_dump() if comment else None
    }


# ========================================
# USER CONTENT
# ========================================

@router.get("/user/{user_id}/posts")
async def get_user_posts(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get posts by a specific user"""
    
    # Include drafts only if viewing own profile
    include_drafts = current_user and current_user.get("id") == user_id
    
    posts = await network_service.get_user_posts(
        user_id=user_id,
        include_drafts=include_drafts,
        page=page,
        limit=limit
    )
    
    return {
        "posts": posts,
        "page": page,
        "has_more": len(posts) == limit
    }


@router.get("/saved")
async def get_saved_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get posts saved by current user"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    posts = await network_service.get_saved_posts(
        user_id=current_user["id"],
        page=page,
        limit=limit
    )
    
    return {
        "posts": posts,
        "page": page,
        "has_more": len(posts) == limit
    }


@router.get("/drafts")
async def get_drafts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get current user's draft posts"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    posts = await db["network_posts"].find({
        "user_id": current_user["id"],
        "status": PostStatus.DRAFT.value
    }).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(length=limit)
    
    for post in posts:
        post.pop("_id", None)
    
    return {
        "posts": posts,
        "page": page,
        "has_more": len(posts) == limit
    }
