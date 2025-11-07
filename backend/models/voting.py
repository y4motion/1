from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone, timedelta


class ProposalCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=2000)
    category: str  # "Feature", "Bug Fix", "Content", "Policy", "Other"
    tags: List[str] = Field(default_factory=list)


class ProposalComment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    is_approved_by_author: bool = False  # Author can approve comment to add to proposal body
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    upvotes: int = 0
    upvoted_by: List[str] = Field(default_factory=list)


class Vote(BaseModel):
    """Individual vote record"""
    user_id: str
    vote_type: str  # "up", "down"
    vote_weight: float  # Based on user's level/XP
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Proposal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    user_level: int = 1
    
    title: str
    description: str
    category: str
    tags: List[str] = Field(default_factory=list)
    
    # Voting mechanics
    status: str = "vetting"  # vetting, voting, in_progress, completed, rejected
    votes_up: int = 0
    votes_down: int = 0
    weighted_score: float = 0.0  # Total weighted score
    votes: List[Vote] = Field(default_factory=list)
    
    # Engagement
    views: int = 0
    comments_count: int = 0
    
    # Moderation
    vetted_by: Optional[str] = None  # Admin/mod who approved
    vetted_at: Optional[datetime] = None
    vetting_notes: Optional[str] = None
    
    # Timeline
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    voting_starts_at: Optional[datetime] = None
    voting_ends_at: Optional[datetime] = None  # 30 days after voting starts
    implementation_deadline: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Implementation tracking
    implementation_progress: int = 0  # 0-100%
    implementation_notes: Optional[str] = None


class ProposalWithComments(Proposal):
    """Proposal with comments for detailed view"""
    comments: List[ProposalComment] = Field(default_factory=list)
