from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models.post import Post, PostCreate, PostWithComments, Comment, CommentCreate
from models.user import User
from utils.auth_utils import get_current_user
from database import get_database
from datetime import datetime, timezone

router = APIRouter(prefix="/feed", tags=["feed"])


@router.post("", response_model=Post)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new post"""
    db = await get_database()
    
    post_dict = {
        **post_data.dict(),
        "user_id": current_user.id,
        "username": current_user.username,
        "user_avatar": current_user.avatar_url,
        "user_level": current_user.level,
        "is_repost": bool(post_data.repost_of),
    }
    
    # If it's a repost, get original author
    if post_data.repost_of:
        original_post = await db.posts.find_one({"id": post_data.repost_of})
        if original_post:
            post_dict["original_author"] = original_post.get("username")
            # Increment repost count on original
            await db.posts.update_one(
                {"id": post_data.repost_of},
                {"$inc": {"reposts": 1}, "$addToSet": {"reposted_by": current_user.id}}
            )
    
    post = Post(**post_dict)
    await db.posts.insert_one(post.dict())
    
    # Award RP for posting
    await db.user_stats.update_one(
        {"user_id": current_user.id},
        {"$inc": {"total_posts": 1, "monthly_rp": 5}},
        upsert=True
    )
    
    return post


@router.get("", response_model=List[Post])
async def get_feed(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    following_only: bool = Query(False),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get personalized feed"""
    db = await get_database()
    
    query = {"is_hidden": False}
    
    # TODO: Implement following system and filter by followed users
    # if following_only and current_user:
    #     query["user_id"] = {"$in": user_following_list}
    
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    return [Post(**post) for post in posts]


@router.get("/{post_id}", response_model=PostWithComments)
async def get_post(
    post_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get single post with comments"""
    db = await get_database()
    
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    await db.posts.update_one({"id": post_id}, {"$inc": {"views": 1}})
    post["views"] = post.get("views", 0) + 1
    
    # Get comments
    comments = await db.post_comments.find({"post_id": post_id}).sort("created_at", -1).to_list(length=100)
    
    return PostWithComments(**post, comments=[Comment(**c) for c in comments])


@router.post("/{post_id}/like")
async def toggle_like(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Like/unlike a post"""
    db = await get_database()
    
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    liked_by = post.get("liked_by", [])
    is_liked = current_user.id in liked_by
    
    if is_liked:
        # Unlike
        await db.posts.update_one(
            {"id": post_id},
            {"$inc": {"likes": -1}, "$pull": {"liked_by": current_user.id}}
        )
        # Remove RP from post author
        await db.user_stats.update_one(
            {"user_id": post["user_id"]},
            {"$inc": {"monthly_rp": -2}}
        )
        action = "unliked"
    else:
        # Like
        await db.posts.update_one(
            {"id": post_id},
            {"$inc": {"likes": 1}, "$addToSet": {"liked_by": current_user.id}}
        )
        # Award RP to post author
        await db.user_stats.update_one(
            {"user_id": post["user_id"]},
            {"$inc": {"monthly_rp": 2, "total_likes_received": 1}},
            upsert=True
        )
        action = "liked"
    
    return {"status": action, "post_id": post_id}


@router.post("/{post_id}/comments", response_model=Comment)
async def add_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user)
):
    """Add comment to post"""
    db = await get_database()
    
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment = Comment(
        user_id=current_user.id,
        username=current_user.username,
        user_avatar=current_user.avatar_url,
        content=comment_data.content
    )
    
    comment_dict = {**comment.dict(), "post_id": post_id}
    await db.post_comments.insert_one(comment_dict)
    
    # Increment comment count
    await db.posts.update_one({"id": post_id}, {"$inc": {"comments_count": 1}})
    
    # Award RP for commenting
    await db.user_stats.update_one(
        {"user_id": current_user.id},
        {"$inc": {"total_comments": 1, "monthly_rp": 1}},
        upsert=True
    )
    
    return comment


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete own post"""
    db = await get_database()
    
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check ownership or admin
    if post["user_id"] != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.posts.delete_one({"id": post_id})
    await db.post_comments.delete_many({"post_id": post_id})
    
    return {"status": "deleted", "post_id": post_id}
