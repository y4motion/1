"""
Consensus Routes - King of the Hill Idea System API

Endpoints for ideas, voting, comments
RP Economics integrated
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel

from database import db
from models.consensus_idea import (
    IdeaCreate, IdeaUpdate, ConsensusIdea,
    IdeaCategory, IdeaStatus, RP_COSTS
)
from routes.auth_routes import get_current_user
from services.consensus_service import ConsensusService

router = APIRouter(prefix="/consensus", tags=["consensus"])

# Initialize service
consensus_service = ConsensusService(db)


# ========================================
# IDEAS
# ========================================

@router.get("/ideas")
async def get_ideas(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    sort: str = Query("score", description="Sort: score, new, trending"),
    current_user: dict = Depends(get_current_user)
):
    """Get ranked ideas (King of the Hill)"""
    
    cat = None
    if category:
        try:
            cat = IdeaCategory(category)
        except ValueError:
            pass
    
    stat = None
    if status:
        try:
            stat = IdeaStatus(status)
        except ValueError:
            pass
    
    ideas = await consensus_service.get_ideas_ranked(
        category=cat,
        status=stat,
        page=page,
        limit=limit,
        sort=sort
    )
    
    # Add user voting status
    user_id = current_user.get("id") if current_user else None
    user_rp = 0
    
    if user_id:
        user = await db["users"].find_one({"id": user_id})
        user_rp = user.get("rp_balance", 0) if user else 0
    
    for idea in ideas:
        votes = idea.get("votes", [])
        idea["has_voted"] = any(v["user_id"] == user_id for v in votes) if user_id else False
        idea["can_vote"] = user_rp >= RP_COSTS["vote_idea"] and not idea["has_voted"]
        # Don't expose full vote list
        idea["votes"] = len(votes)
    
    return {
        "ideas": ideas,
        "page": page,
        "limit": limit,
        "has_more": len(ideas) == limit,
        "user_rp": user_rp,
        "vote_cost": RP_COSTS["vote_idea"]
    }


@router.get("/idea/{idea_id}")
async def get_idea(
    idea_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single idea with comments"""
    
    idea = await consensus_service.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Get comments
    comments = await consensus_service.get_comments(idea_id, page=1, limit=50)
    
    # User status
    user_id = current_user.get("id") if current_user else None
    user_rp = 0
    
    if user_id:
        user = await db["users"].find_one({"id": user_id})
        user_rp = user.get("rp_balance", 0) if user else 0
    
    votes = idea.get("votes", [])
    has_voted = any(v["user_id"] == user_id for v in votes) if user_id else False
    
    idea["votes"] = len(votes)
    
    return {
        "idea": idea,
        "comments": comments,
        "has_voted": has_voted,
        "can_vote": user_rp >= RP_COSTS["vote_idea"] and not has_voted and idea.get("user_id") != user_id,
        "user_rp": user_rp,
        "vote_cost": RP_COSTS["vote_idea"]
    }


@router.post("/idea")
async def create_idea(
    idea_data: IdeaCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new idea (costs 500 RP)"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, idea, message = await consensus_service.create_idea(
        user_id=current_user["id"],
        idea_data=idea_data
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "message": message,
        "idea": idea.model_dump() if idea else None,
        "rp_spent": RP_COSTS["create_idea"]
    }


@router.put("/idea/{idea_id}")
async def update_idea(
    idea_id: str,
    update_data: IdeaUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an idea (only before votes)"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, idea, message = await consensus_service.update_idea(
        idea_id=idea_id,
        user_id=current_user["id"],
        update_data=update_data
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "message": message,
        "idea": idea.model_dump() if idea else None
    }


# ========================================
# VOTING
# ========================================

@router.post("/idea/{idea_id}/vote")
async def vote_on_idea(
    idea_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Vote on an idea (costs 50 RP)"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, new_score, message = await consensus_service.vote_on_idea(
        idea_id=idea_id,
        user_id=current_user["id"]
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    # Get updated user RP
    user = await db["users"].find_one({"id": current_user["id"]})
    new_rp = user.get("rp_balance", 0) if user else 0
    
    return {
        "success": True,
        "message": message,
        "new_score": new_score,
        "rp_spent": RP_COSTS["vote_idea"],
        "user_rp": new_rp
    }


# ========================================
# COMMENTS
# ========================================

class CommentInput(BaseModel):
    content: str


@router.post("/idea/{idea_id}/comment")
async def add_comment(
    idea_id: str,
    comment_input: CommentInput,
    current_user: dict = Depends(get_current_user)
):
    """Add a comment to an idea"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success, comment, message = await consensus_service.add_comment(
        idea_id=idea_id,
        user_id=current_user["id"],
        content=comment_input.content
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "comment": comment.model_dump() if comment else None
    }


@router.get("/idea/{idea_id}/comments")
async def get_comments(
    idea_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """Get comments for an idea"""
    
    comments = await consensus_service.get_comments(
        idea_id=idea_id,
        page=page,
        limit=limit
    )
    
    return {
        "comments": comments,
        "page": page,
        "has_more": len(comments) == limit
    }


# ========================================
# DUPLICATE CHECK
# ========================================

class SimilarCheckInput(BaseModel):
    title: str
    description: str


@router.post("/similar-check")
async def check_similar_ideas(
    check_input: SimilarCheckInput,
    current_user: dict = Depends(get_current_user)
):
    """Check for similar existing ideas before submitting"""
    
    result = await consensus_service.check_similar_ideas(
        title=check_input.title,
        description=check_input.description
    )
    
    return result


# ========================================
# USER IDEAS
# ========================================

@router.get("/user/{user_id}/ideas")
async def get_user_ideas(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """Get ideas by a specific user"""
    
    ideas = await consensus_service.get_user_ideas(
        user_id=user_id,
        page=page,
        limit=limit
    )
    
    for idea in ideas:
        idea["votes"] = len(idea.get("votes", []))
    
    return {
        "ideas": ideas,
        "page": page,
        "has_more": len(ideas) == limit
    }


# ========================================
# ADMIN ROUTES
# ========================================

@router.post("/idea/{idea_id}/status")
async def update_idea_status(
    idea_id: str,
    status: str = Query(..., description="New status: reviewing, in_progress, implemented, rejected"),
    notes: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Update idea status (admin/moderator only)"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not current_user.get("is_admin") and not current_user.get("is_moderator"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        new_status = IdeaStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    
    success, message = await consensus_service.update_status(
        idea_id=idea_id,
        new_status=new_status,
        admin_user_id=current_user["id"],
        notes=notes
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {"success": True, "message": message}


# ========================================
# INFO
# ========================================

@router.get("/info")
async def get_consensus_info(
    current_user: dict = Depends(get_current_user)
):
    """Get info about consensus system (costs, requirements)"""
    
    user_rp = 0
    user_level = 1
    
    if current_user:
        user = await db["users"].find_one({"id": current_user["id"]})
        if user:
            user_rp = user.get("rp_balance", 0)
            user_level = user.get("level", 1)
    
    return {
        "costs": RP_COSTS,
        "requirements": {
            "create_idea_level": 10,
            "vote_level": 5
        },
        "user": {
            "rp_balance": user_rp,
            "level": user_level,
            "can_create_idea": user_level >= 10 and user_rp >= RP_COSTS["create_idea"],
            "can_vote": user_level >= 5 and user_rp >= RP_COSTS["vote_idea"]
        },
        "rewards": {
            "idea_implemented_refund": 500,
            "idea_implemented_bonus": 1000,
            "idea_implemented_xp": 5000
        }
    }
