"""
Social Core Models - Consensus Ideas

The "King of the Hill" idea voting system with:
- RP Economics (500 to create, 50 to vote)
- Weighted voting based on Trust Score
- Anti-duplicate checking
- Comment system
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum


class IdeaCategory(str, Enum):
    SITE = "site"           # Site features/improvements
    PRODUCTS = "products"   # Product requests
    SOFTWARE = "software"   # Minimal OS, tools
    COMMUNITY = "community" # Community features
    OTHER = "other"


class IdeaStatus(str, Enum):
    OPEN = "open"               # Accepting votes
    REVIEWING = "reviewing"     # Under team review
    IN_PROGRESS = "in_progress" # Being implemented
    IMPLEMENTED = "implemented" # Done!
    REJECTED = "rejected"       # Not accepted
    DUPLICATE = "duplicate"     # Merged with another


class IdeaVote(BaseModel):
    """Individual vote on an idea"""
    user_id: str
    username: str
    trust_score: float  # User's trust score at time of vote
    rp_spent: int = 50  # RP cost for this vote
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IdeaComment(BaseModel):
    """Comment on an idea"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    user_level: int = 1
    user_trust_score: float = 500.0
    content: str = Field(..., max_length=2000)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Comment voting
    upvotes: int = 0
    downvotes: int = 0
    upvoted_by: List[str] = Field(default_factory=list)
    downvoted_by: List[str] = Field(default_factory=list)
    
    # Official response
    is_official_response: bool = False


class IdeaCreate(BaseModel):
    """Create new idea (costs 500 RP)"""
    title: str = Field(..., min_length=10, max_length=200)
    description: str = Field(..., min_length=50, max_length=5000)
    category: IdeaCategory = IdeaCategory.OTHER
    tags: List[str] = Field(default_factory=list, max_length=5)


class IdeaUpdate(BaseModel):
    """Update idea (only for author, before votes)"""
    title: Optional[str] = Field(None, min_length=10, max_length=200)
    description: Optional[str] = Field(None, min_length=50, max_length=5000)
    category: Optional[IdeaCategory] = None
    tags: Optional[List[str]] = None


class ConsensusIdea(BaseModel):
    """Full idea model for Consensus system"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Author info
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    user_level: int = 1
    user_trust_score: float = 500.0
    
    # Content
    title: str
    description: str
    category: IdeaCategory = IdeaCategory.OTHER
    tags: List[str] = Field(default_factory=list)
    
    # Economics
    rp_cost: int = 500  # RP spent to create
    rp_refunded: bool = False  # True if implemented and refunded
    
    # Voting
    votes: List[IdeaVote] = Field(default_factory=list)
    vote_count: int = 0
    vote_score: float = 0.0  # Weighted score: sum(trust_score * rp_spent)
    
    # Status
    status: IdeaStatus = IdeaStatus.OPEN
    status_changed_at: Optional[datetime] = None
    status_changed_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    # Duplicate detection
    similar_hash: Optional[str] = None  # Hash for duplicate checking
    merged_into: Optional[str] = None   # ID of idea this was merged into
    
    # Comments
    comments_count: int = 0
    
    # Implementation tracking
    implementation_progress: int = 0  # 0-100%
    implementation_notes: Optional[str] = None
    implemented_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    
    # Ranking
    rank: int = 0  # Current position in leaderboard
    rank_change: int = 0  # +/- since last calculation


class ConsensusIdeaWithComments(ConsensusIdea):
    """Idea with loaded comments"""
    comments: List[IdeaComment] = Field(default_factory=list)


class ConsensusIdeaResponse(BaseModel):
    """API response for idea"""
    idea: ConsensusIdea
    has_voted: bool = False
    can_vote: bool = True  # False if not enough RP or already voted
    user_rp: int = 0


class SimilarIdeaCheck(BaseModel):
    """Response for duplicate check"""
    is_similar: bool = False
    similar_ideas: List[Dict[str, Any]] = Field(default_factory=list)
    similarity_scores: List[float] = Field(default_factory=list)


# ============================================
# RP COSTS CONFIGURATION
# ============================================

RP_COSTS = {
    "create_idea": 500,
    "vote_idea": 50,
    "create_post": 0,  # Posts are free
    "feature_post": 100,  # Pin post to top
}

XP_REWARDS = {
    "create_post": 50,
    "post_liked": 5,
    "post_saved": 10,
    "create_idea": 100,
    "idea_voted": 10,
    "idea_implemented": 5000,
    "top_month": 2000,
    "top_year": 10000,
}

# Minimum levels for actions
LEVEL_REQUIREMENTS = {
    "create_post": 5,
    "create_idea": 10,
    "vote_idea": 5,
    "feature_post": 15,
}
