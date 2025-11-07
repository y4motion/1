from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models.voting import Proposal, ProposalCreate, ProposalWithComments, ProposalComment
from models.user import User
from utils.auth_utils import get_current_user
from database import get_database
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/voting", tags=["voting"])


def calculate_vote_weight(user_level: int) -> float:
    """Calculate vote weight based on user level"""
    return 1.0 + (user_level / 10.0)


@router.post("", response_model=Proposal)
async def create_proposal(
    proposal_data: ProposalCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new proposal (1 per month limit)"""
    db = await get_database()
    
    # Check if user already created a proposal this month
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    existing = await db.proposals.find_one({
        "user_id": current_user.id,
        "created_at": {"$gte": month_start.isoformat()}
    })
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You can only create one proposal per month"
        )
    
    proposal = Proposal(
        user_id=current_user.id,
        username=current_user.username,
        user_avatar=current_user.avatar_url,
        user_level=current_user.level,
        **proposal_data.dict(),
        status="vetting"  # Starts in vetting status
    )
    
    await db.proposals.insert_one(proposal.dict())
    
    return proposal


@router.get("", response_model=List[Proposal])
async def get_proposals(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, regex="^(vetting|voting|in_progress|completed|rejected)$"),
    category: Optional[str] = None,
    sort_by: str = Query("weighted_score", regex="^(weighted_score|created_at|votes_up)$")
):
    """Get proposals list"""
    db = await get_database()
    
    query = {}
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    
    proposals = await db.proposals.find(query).sort(sort_by, -1).skip(skip).limit(limit).to_list(length=limit)
    return [Proposal(**p) for p in proposals]


@router.get("/{proposal_id}", response_model=ProposalWithComments)
async def get_proposal(
    proposal_id: str
):
    """Get single proposal with comments"""
    db = await get_database()
    
    proposal = await db.proposals.find_one({"id": proposal_id})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Increment view count
    await db.proposals.update_one({"id": proposal_id}, {"$inc": {"views": 1}})
    proposal["views"] = proposal.get("views", 0) + 1
    
    # Get comments
    comments = await db.proposal_comments.find({"proposal_id": proposal_id}).sort("upvotes", -1).to_list(length=100)
    
    return ProposalWithComments(**proposal, comments=[ProposalComment(**c) for c in comments])


@router.post("/{proposal_id}/vote")
async def cast_vote(
    proposal_id: str,
    vote_type: str = Query(..., regex="^(up|down)$"),
    current_user: User = Depends(get_current_user)
):
    """Cast weighted vote on proposal"""
    db = await get_database()
    
    proposal = await db.proposals.find_one({"id": proposal_id})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if proposal["status"] != "voting":
        raise HTTPException(status_code=400, detail="Proposal is not open for voting")
    
    # Check if already voted
    existing_votes = proposal.get("votes", [])
    for vote in existing_votes:
        if vote["user_id"] == current_user.id:
            raise HTTPException(status_code=400, detail="You already voted on this proposal")
    
    # Calculate vote weight
    weight = calculate_vote_weight(current_user.level)
    
    vote_record = {
        "user_id": current_user.id,
        "vote_type": vote_type,
        "vote_weight": weight,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update proposal
    update_dict = {
        "$push": {"votes": vote_record}
    }
    
    if vote_type == "up":
        update_dict["$inc"] = {"votes_up": 1, "weighted_score": weight}
    else:
        update_dict["$inc"] = {"votes_down": 1, "weighted_score": -weight}
    
    await db.proposals.update_one({"id": proposal_id}, update_dict)
    
    # Award RP for voting
    await db.user_stats.update_one(
        {"user_id": current_user.id},
        {"$inc": {"total_votes_cast": 1, "monthly_rp": 3}},
        upsert=True
    )
    
    return {"status": "voted", "vote_type": vote_type, "weight": weight}


@router.post("/{proposal_id}/vet")
async def vet_proposal(
    proposal_id: str,
    approve: bool,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Vet proposal (admin/moderator only)"""
    if not (current_user.is_admin or current_user.is_moderator):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = await get_database()
    
    proposal = await db.proposals.find_one({"id": proposal_id})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if proposal["status"] != "vetting":
        raise HTTPException(status_code=400, detail="Proposal is not in vetting status")
    
    now = datetime.now(timezone.utc)
    
    if approve:
        # Approve and start voting period (30 days)
        update_dict = {
            "status": "voting",
            "vetted_by": current_user.id,
            "vetted_at": now.isoformat(),
            "voting_starts_at": now.isoformat(),
            "voting_ends_at": (now + timedelta(days=30)).isoformat()
        }
        if notes:
            update_dict["vetting_notes"] = notes
        
        await db.proposals.update_one({"id": proposal_id}, {"$set": update_dict})
        return {"status": "approved", "voting_ends_at": update_dict["voting_ends_at"]}
    else:
        # Reject
        await db.proposals.update_one(
            {"id": proposal_id},
            {"$set": {
                "status": "rejected",
                "vetted_by": current_user.id,
                "vetted_at": now.isoformat(),
                "vetting_notes": notes or "Rejected by moderator"
            }}
        )
        return {"status": "rejected"}


@router.post("/{proposal_id}/comments")
async def add_comment(
    proposal_id: str,
    content: str,
    current_user: User = Depends(get_current_user)
):
    """Add comment to proposal"""
    db = await get_database()
    
    proposal = await db.proposals.find_one({"id": proposal_id})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    comment = ProposalComment(
        user_id=current_user.id,
        username=current_user.username,
        user_avatar=current_user.avatar_url,
        content=content
    )
    
    comment_dict = {**comment.dict(), "proposal_id": proposal_id}
    await db.proposal_comments.insert_one(comment_dict)
    
    # Increment comment count
    await db.proposals.update_one({"id": proposal_id}, {"$inc": {"comments_count": 1}})
    
    return comment


@router.post("/{proposal_id}/comments/{comment_id}/approve")
async def approve_comment(
    proposal_id: str,
    comment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Approve comment to add to proposal body (proposal author only)"""
    db = await get_database()
    
    proposal = await db.proposals.find_one({"id": proposal_id})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if proposal["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only proposal author can approve comments")
    
    await db.proposal_comments.update_one(
        {"id": comment_id, "proposal_id": proposal_id},
        {"$set": {"is_approved_by_author": True}}
    )
    
    return {"status": "approved", "comment_id": comment_id}
