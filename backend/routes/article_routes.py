from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models.article import Article, ArticleCreate, ArticleUpdate, ArticleResponse
from models.user import User
from utils.auth_utils import get_current_user
from database import get_database
from datetime import datetime, timezone
import re

router = APIRouter(prefix="/articles", tags=["articles"])


def calculate_read_time(content: str) -> int:
    """Calculate estimated read time in minutes"""
    words = len(re.findall(r'\w+', content))
    return max(1, words // 200)  # Average 200 words per minute


@router.post("", response_model=Article)
async def create_article(
    article_data: ArticleCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new article"""
    db = await get_database()
    
    article_dict = {
        **article_data.dict(),
        "user_id": current_user.id,
        "username": current_user.username,
        "user_avatar": current_user.avatar_url,
        "user_level": current_user.level,
        "is_verified_creator": current_user.is_verified_creator,
        "read_time": calculate_read_time(article_data.content),
        "status": "pending",  # Needs moderation
    }
    
    if not article_data.is_draft:
        article_dict["published_at"] = datetime.now(timezone.utc).isoformat()
    
    article = Article(**article_dict)
    await db.articles.insert_one(article.dict())
    
    # Award XP for publishing article
    if not article_data.is_draft:
        await db.user_stats.update_one(
            {"user_id": current_user.id},
            {"$inc": {"total_articles": 1, "total_xp": 100}},  # Large XP reward
            upsert=True
        )
    
    return article


@router.get("", response_model=List[ArticleResponse])
async def get_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    featured_only: bool = False,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get articles list"""
    db = await get_database()
    
    query = {"is_draft": False, "status": "approved"}
    
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    if featured_only:
        query["is_featured"] = True
    
    articles = await db.articles.find(query).sort("published_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Add comments count for each article
    result = []
    for article in articles:
        comments_count = await db.article_comments.count_documents({"article_id": article["id"]})
        result.append(ArticleResponse(**article, comments_count=comments_count))
    
    return result


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get single article"""
    db = await get_database()
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment view count
    await db.articles.update_one({"id": article_id}, {"$inc": {"views": 1}})
    article["views"] = article.get("views", 0) + 1
    
    # Award XP to author for views (1 XP per 10 views)
    if article["views"] % 10 == 0:
        await db.user_stats.update_one(
            {"user_id": article["user_id"]},
            {"$inc": {"total_xp": 1}}
        )
    
    comments_count = await db.article_comments.count_documents({"article_id": article_id})
    
    return ArticleResponse(**article, comments_count=comments_count)


@router.put("/{article_id}", response_model=Article)
async def update_article(
    article_id: str,
    article_data: ArticleUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update article"""
    db = await get_database()
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if article["user_id"] != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in article_data.dict(exclude_unset=True).items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if "content" in update_dict:
        update_dict["read_time"] = calculate_read_time(update_dict["content"])
    
    await db.articles.update_one({"id": article_id}, {"$set": update_dict})
    
    updated_article = await db.articles.find_one({"id": article_id})
    return Article(**updated_article)


@router.post("/{article_id}/like")
async def toggle_like(
    article_id: str,
    current_user: User = Depends(get_current_user)
):
    """Like/unlike an article"""
    db = await get_database()
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    liked_by = article.get("liked_by", [])
    is_liked = current_user.id in liked_by
    
    if is_liked:
        await db.articles.update_one(
            {"id": article_id},
            {"$inc": {"likes": -1}, "$pull": {"liked_by": current_user.id}}
        )
        await db.user_stats.update_one(
            {"user_id": article["user_id"]},
            {"$inc": {"monthly_rp": -5}}
        )
        action = "unliked"
    else:
        await db.articles.update_one(
            {"id": article_id},
            {"$inc": {"likes": 1}, "$addToSet": {"liked_by": current_user.id}}
        )
        # Articles get more RP than posts
        await db.user_stats.update_one(
            {"user_id": article["user_id"]},
            {"$inc": {"monthly_rp": 5, "total_likes_received": 1}},
            upsert=True
        )
        action = "liked"
    
    return {"status": action, "article_id": article_id}


@router.post("/{article_id}/bookmark")
async def toggle_bookmark(
    article_id: str,
    current_user: User = Depends(get_current_user)
):
    """Bookmark/unbookmark article"""
    db = await get_database()
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    bookmarked_by = article.get("bookmarked_by", [])
    is_bookmarked = current_user.id in bookmarked_by
    
    if is_bookmarked:
        await db.articles.update_one(
            {"id": article_id},
            {"$inc": {"bookmarks": -1}, "$pull": {"bookmarked_by": current_user.id}}
        )
        action = "removed"
    else:
        await db.articles.update_one(
            {"id": article_id},
            {"$inc": {"bookmarks": 1}, "$addToSet": {"bookmarked_by": current_user.id}}
        )
        action = "bookmarked"
    
    return {"status": action, "article_id": article_id}


@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete article"""
    db = await get_database()
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if article["user_id"] != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.articles.delete_one({"id": article_id})
    await db.article_comments.delete_many({"article_id": article_id})
    
    return {"status": "deleted", "article_id": article_id}
