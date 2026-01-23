"""
Social Core Service - Network Posts

Handles CRUD operations for network posts:
- Creating/updating posts
- Likes, saves, comments
- Feed generation
- Hot score calculation
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
import logging
import math

from models.network_post import (
    NetworkPost, NetworkPostCreate, NetworkPostUpdate,
    PostStatus, PostCategory, PostComment
)

logger = logging.getLogger(__name__)


class NetworkService:
    """Service for Ghost Network posts"""
    
    def __init__(self, db):
        self.db = db
        self.posts_collection = db["network_posts"]
        self.comments_collection = db["network_comments"]
        self.users_collection = db["users"]
    
    # ========================================
    # POST CRUD
    # ========================================
    
    async def create_post(
        self, 
        user_id: str, 
        post_data: NetworkPostCreate
    ) -> Tuple[bool, Optional[NetworkPost], str]:
        """Create a new network post"""
        
        # Get user info
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, None, "User not found"
        
        # Check level requirement (level 5)
        if user.get("level", 1) < 5:
            return False, None, "Level 5 required to post"
        
        # Check rate limit (5 posts per day)
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        posts_today = await self.posts_collection.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": today_start}
        })
        
        if posts_today >= 5:
            return False, None, "Daily post limit reached (5 posts/day)"
        
        # Create post
        post = NetworkPost(
            user_id=user_id,
            username=user.get("username", "Anonymous"),
            user_avatar=user.get("avatar_url"),
            user_level=user.get("level", 1),
            user_trust_score=user.get("trust_score", 500.0),
            user_class=user.get("class_type"),
            title=post_data.title,
            content=post_data.content,
            category=post_data.category,
            post_type=post_data.post_type,
            media=post_data.media,
            product_refs=post_data.product_refs,
            tags=post_data.tags,
            status=PostStatus.DRAFT if post_data.is_draft else PostStatus.PUBLISHED,
            published_at=None if post_data.is_draft else datetime.now(timezone.utc)
        )
        
        # Insert
        await self.posts_collection.insert_one(post.model_dump())
        
        # Award XP for publishing (not drafts)
        if not post_data.is_draft:
            from services.xp_service import xp_service
            await xp_service.award_xp(user_id, 50, "create_post")
        
        logger.info(f"User {user_id} created post {post.id}")
        
        return True, post, "Post created successfully"
    
    async def update_post(
        self,
        post_id: str,
        user_id: str,
        update_data: NetworkPostUpdate
    ) -> Tuple[bool, Optional[NetworkPost], str]:
        """Update an existing post"""
        
        post = await self.posts_collection.find_one({"id": post_id})
        if not post:
            return False, None, "Post not found"
        
        if post["user_id"] != user_id:
            return False, None, "Not authorized to edit this post"
        
        # Build update dict
        update_dict = {"updated_at": datetime.now(timezone.utc)}
        
        if update_data.title is not None:
            update_dict["title"] = update_data.title
        if update_data.content is not None:
            update_dict["content"] = update_data.content
        if update_data.category is not None:
            update_dict["category"] = update_data.category.value
        if update_data.media is not None:
            update_dict["media"] = [m.model_dump() for m in update_data.media]
        if update_data.product_refs is not None:
            update_dict["product_refs"] = [p.model_dump() for p in update_data.product_refs]
        if update_data.tags is not None:
            update_dict["tags"] = update_data.tags
        
        await self.posts_collection.update_one(
            {"id": post_id},
            {"$set": update_dict}
        )
        
        updated_post = await self.posts_collection.find_one({"id": post_id})
        
        return True, NetworkPost(**updated_post), "Post updated"
    
    async def delete_post(self, post_id: str, user_id: str) -> Tuple[bool, str]:
        """Delete a post (soft delete)"""
        
        post = await self.posts_collection.find_one({"id": post_id})
        if not post:
            return False, "Post not found"
        
        if post["user_id"] != user_id:
            return False, "Not authorized to delete this post"
        
        await self.posts_collection.update_one(
            {"id": post_id},
            {"$set": {"status": PostStatus.ARCHIVED.value, "updated_at": datetime.now(timezone.utc)}}
        )
        
        return True, "Post deleted"
    
    async def publish_draft(self, post_id: str, user_id: str) -> Tuple[bool, str]:
        """Publish a draft post"""
        
        post = await self.posts_collection.find_one({"id": post_id})
        if not post:
            return False, "Post not found"
        
        if post["user_id"] != user_id:
            return False, "Not authorized"
        
        if post["status"] != PostStatus.DRAFT.value:
            return False, "Post is not a draft"
        
        await self.posts_collection.update_one(
            {"id": post_id},
            {
                "$set": {
                    "status": PostStatus.PUBLISHED.value,
                    "published_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Award XP
        from services.xp_service import xp_service
        await xp_service.award_xp(user_id, 50, "create_post")
        
        return True, "Post published"
    
    # ========================================
    # ENGAGEMENT
    # ========================================
    
    async def like_post(self, post_id: str, user_id: str) -> Tuple[bool, int, str]:
        """Like/unlike a post. Returns (success, new_like_count, message)"""
        
        post = await self.posts_collection.find_one({"id": post_id})
        if not post:
            return False, 0, "Post not found"
        
        liked_by = post.get("liked_by", [])
        
        if user_id in liked_by:
            # Unlike
            liked_by.remove(user_id)
            new_count = len(liked_by)
            
            await self.posts_collection.update_one(
                {"id": post_id},
                {
                    "$set": {"likes": new_count, "liked_by": liked_by},
                    "$inc": {"hot_score": -1}
                }
            )
            
            return True, new_count, "Unliked"
        else:
            # Like
            liked_by.append(user_id)
            new_count = len(liked_by)
            
            await self.posts_collection.update_one(
                {"id": post_id},
                {
                    "$set": {"likes": new_count, "liked_by": liked_by},
                    "$inc": {"hot_score": 1}
                }
            )
            
            # Award XP to post author
            from services.xp_service import xp_service
            await xp_service.award_xp(post["user_id"], 5, "post_liked")
            
            return True, new_count, "Liked"
    
    async def save_post(self, post_id: str, user_id: str) -> Tuple[bool, int, str]:
        """Save/unsave a post"""
        
        post = await self.posts_collection.find_one({"id": post_id})
        if not post:
            return False, 0, "Post not found"
        
        saved_by = post.get("saved_by", [])
        
        if user_id in saved_by:
            # Unsave
            saved_by.remove(user_id)
            new_count = len(saved_by)
            
            await self.posts_collection.update_one(
                {"id": post_id},
                {"$set": {"saves_count": new_count, "saved_by": saved_by}}
            )
            
            return True, new_count, "Unsaved"
        else:
            # Save
            saved_by.append(user_id)
            new_count = len(saved_by)
            
            await self.posts_collection.update_one(
                {"id": post_id},
                {"$set": {"saves_count": new_count, "saved_by": saved_by}}
            )
            
            # Award XP
            from services.xp_service import xp_service
            await xp_service.award_xp(post["user_id"], 10, "post_saved")
            
            return True, new_count, "Saved"
    
    async def increment_views(self, post_id: str) -> None:
        """Increment view count"""
        await self.posts_collection.update_one(
            {"id": post_id},
            {"$inc": {"views": 1}}
        )
    
    # ========================================
    # COMMENTS
    # ========================================
    
    async def add_comment(
        self,
        post_id: str,
        user_id: str,
        content: str,
        parent_comment_id: Optional[str] = None
    ) -> Tuple[bool, Optional[PostComment], str]:
        """Add a comment to a post"""
        
        post = await self.posts_collection.find_one({"id": post_id})
        if not post:
            return False, None, "Post not found"
        
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, None, "User not found"
        
        comment = PostComment(
            user_id=user_id,
            username=user.get("username", "Anonymous"),
            user_avatar=user.get("avatar_url"),
            user_level=user.get("level", 1),
            user_trust_score=user.get("trust_score", 500.0),
            content=content,
            parent_comment_id=parent_comment_id
        )
        
        await self.comments_collection.insert_one({
            **comment.model_dump(),
            "post_id": post_id
        })
        
        # Update post comment count
        await self.posts_collection.update_one(
            {"id": post_id},
            {"$inc": {"comments_count": 1, "hot_score": 2}}
        )
        
        return True, comment, "Comment added"
    
    # ========================================
    # FEED
    # ========================================
    
    async def get_feed(
        self,
        category: Optional[PostCategory] = None,
        page: int = 1,
        limit: int = 20,
        sort: str = "hot"  # hot, new, top
    ) -> List[Dict[str, Any]]:
        """Get feed of posts"""
        
        query = {"status": PostStatus.PUBLISHED.value}
        
        if category:
            query["category"] = category.value
        
        # Sort options
        sort_options = {
            "hot": [("hot_score", -1), ("created_at", -1)],
            "new": [("created_at", -1)],
            "top": [("likes", -1), ("created_at", -1)]
        }
        
        cursor = self.posts_collection.find(query)
        cursor = cursor.sort(sort_options.get(sort, sort_options["hot"]))
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        
        posts = await cursor.to_list(length=limit)
        
        # Remove MongoDB _id
        for post in posts:
            post.pop("_id", None)
        
        return posts
    
    async def get_user_posts(
        self,
        user_id: str,
        include_drafts: bool = False,
        page: int = 1,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get posts by a specific user"""
        
        query = {"user_id": user_id}
        
        if not include_drafts:
            query["status"] = PostStatus.PUBLISHED.value
        
        cursor = self.posts_collection.find(query)
        cursor = cursor.sort("created_at", -1)
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        
        posts = await cursor.to_list(length=limit)
        
        for post in posts:
            post.pop("_id", None)
        
        return posts
    
    async def get_saved_posts(self, user_id: str, page: int = 1, limit: int = 20) -> List[Dict[str, Any]]:
        """Get posts saved by user"""
        
        cursor = self.posts_collection.find({
            "saved_by": user_id,
            "status": PostStatus.PUBLISHED.value
        })
        cursor = cursor.sort("created_at", -1)
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        
        posts = await cursor.to_list(length=limit)
        
        for post in posts:
            post.pop("_id", None)
        
        return posts
    
    # ========================================
    # HOT SCORE
    # ========================================
    
    async def recalculate_hot_scores(self) -> None:
        """Recalculate hot scores for all recent posts (background job)"""
        
        # Posts from last 7 days
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        
        cursor = self.posts_collection.find({
            "status": PostStatus.PUBLISHED.value,
            "created_at": {"$gte": cutoff}
        })
        
        async for post in cursor:
            hot_score = self._calculate_hot_score(post)
            await self.posts_collection.update_one(
                {"id": post["id"]},
                {"$set": {"hot_score": hot_score}}
            )
    
    def _calculate_hot_score(self, post: Dict[str, Any]) -> float:
        """Calculate hot score based on engagement and age"""
        
        likes = post.get("likes", 0)
        comments = post.get("comments_count", 0)
        saves = post.get("saves_count", 0)
        views = post.get("views", 0)
        
        # Engagement score
        engagement = (likes * 3) + (comments * 5) + (saves * 4) + (views * 0.1)
        
        # Age decay (half-life of 24 hours)
        created_at = post.get("created_at", datetime.now(timezone.utc))
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        age_hours = (datetime.now(timezone.utc) - created_at).total_seconds() / 3600
        decay = math.exp(-0.03 * age_hours)
        
        return engagement * decay
