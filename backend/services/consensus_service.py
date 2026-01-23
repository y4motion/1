"""
Social Core Service - Consensus Ideas

Handles the "King of the Hill" idea voting system:
- Create ideas (costs RP)
- Vote on ideas (costs RP)
- Ranking calculation
- Duplicate detection
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
import logging
import hashlib
import re

from models.consensus_idea import (
    ConsensusIdea, IdeaCreate, IdeaUpdate, IdeaComment,
    IdeaStatus, IdeaCategory, IdeaVote, RP_COSTS, XP_REWARDS
)

logger = logging.getLogger(__name__)


class ConsensusService:
    """Service for Consensus idea voting system"""
    
    def __init__(self, db):
        self.db = db
        self.ideas_collection = db["consensus_ideas"]
        self.comments_collection = db["consensus_comments"]
        self.users_collection = db["users"]
    
    # ========================================
    # IDEA CRUD
    # ========================================
    
    async def create_idea(
        self,
        user_id: str,
        idea_data: IdeaCreate
    ) -> Tuple[bool, Optional[ConsensusIdea], str]:
        """Create a new idea (costs 500 RP)"""
        
        # Get user
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, None, "User not found"
        
        # Check level requirement (level 10)
        if user.get("level", 1) < 10:
            return False, None, "Level 10 required to submit ideas"
        
        # Check rate limit (3 ideas per week)
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        ideas_this_week = await self.ideas_collection.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": week_ago}
        })
        
        if ideas_this_week >= 3:
            return False, None, "Weekly idea limit reached (3 ideas/week)"
        
        # Check for duplicates
        similar = await self.check_similar_ideas(idea_data.title, idea_data.description)
        if similar["is_similar"]:
            return False, None, f"Similar idea already exists: '{similar['similar_ideas'][0]['title']}'"
        
        # Process RP transaction
        from services.rp_economics import RPEconomicsService
        rp_service = RPEconomicsService(self.db)
        
        # Create idea first to get ID
        idea = ConsensusIdea(
            user_id=user_id,
            username=user.get("username", "Anonymous"),
            user_avatar=user.get("avatar_url"),
            user_level=user.get("level", 1),
            user_trust_score=user.get("trust_score", 500.0),
            title=idea_data.title,
            description=idea_data.description,
            category=idea_data.category,
            tags=idea_data.tags,
            rp_cost=RP_COSTS["create_idea"],
            similar_hash=self._generate_similarity_hash(idea_data.title, idea_data.description)
        )
        
        # Charge RP
        success, msg = await rp_service.create_idea_transaction(user_id, idea.id)
        if not success:
            return False, None, msg
        
        # Insert idea
        await self.ideas_collection.insert_one(idea.model_dump())
        
        # Award XP
        from services.xp_service import xp_service
        await xp_service.award_xp(user_id, XP_REWARDS["create_idea"], "create_idea")
        
        logger.info(f"User {user_id} created idea {idea.id}, spent {RP_COSTS['create_idea']} RP")
        
        return True, idea, "Idea submitted successfully"
    
    async def get_idea(self, idea_id: str) -> Optional[Dict[str, Any]]:
        """Get a single idea by ID"""
        idea = await self.ideas_collection.find_one({"id": idea_id})
        if idea:
            idea.pop("_id", None)
        return idea
    
    async def update_idea(
        self,
        idea_id: str,
        user_id: str,
        update_data: IdeaUpdate
    ) -> Tuple[bool, Optional[ConsensusIdea], str]:
        """Update an idea (only if no votes yet)"""
        
        idea = await self.ideas_collection.find_one({"id": idea_id})
        if not idea:
            return False, None, "Idea not found"
        
        if idea["user_id"] != user_id:
            return False, None, "Not authorized"
        
        if len(idea.get("votes", [])) > 0:
            return False, None, "Cannot edit after receiving votes"
        
        update_dict = {"updated_at": datetime.now(timezone.utc)}
        
        if update_data.title is not None:
            update_dict["title"] = update_data.title
        if update_data.description is not None:
            update_dict["description"] = update_data.description
        if update_data.category is not None:
            update_dict["category"] = update_data.category.value
        if update_data.tags is not None:
            update_dict["tags"] = update_data.tags
        
        # Regenerate similarity hash if content changed
        if "title" in update_dict or "description" in update_dict:
            new_title = update_dict.get("title", idea["title"])
            new_desc = update_dict.get("description", idea["description"])
            update_dict["similar_hash"] = self._generate_similarity_hash(new_title, new_desc)
        
        await self.ideas_collection.update_one(
            {"id": idea_id},
            {"$set": update_dict}
        )
        
        updated = await self.ideas_collection.find_one({"id": idea_id})
        updated.pop("_id", None)
        
        return True, ConsensusIdea(**updated), "Idea updated"
    
    # ========================================
    # VOTING
    # ========================================
    
    async def vote_on_idea(
        self,
        idea_id: str,
        user_id: str
    ) -> Tuple[bool, float, str]:
        """Vote on an idea (costs 50 RP). Returns (success, new_score, message)"""
        
        idea = await self.ideas_collection.find_one({"id": idea_id})
        if not idea:
            return False, 0, "Idea not found"
        
        if idea["status"] != IdeaStatus.OPEN.value:
            return False, 0, "Idea is not open for voting"
        
        # Check if already voted
        votes = idea.get("votes", [])
        if any(v["user_id"] == user_id for v in votes):
            return False, idea.get("vote_score", 0), "Already voted on this idea"
        
        # Can't vote on own idea
        if idea["user_id"] == user_id:
            return False, 0, "Cannot vote on your own idea"
        
        # Get user for trust score
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, 0, "User not found"
        
        # Check level requirement
        if user.get("level", 1) < 5:
            return False, 0, "Level 5 required to vote"
        
        # Process RP transaction
        from services.rp_economics import RPEconomicsService
        rp_service = RPEconomicsService(self.db)
        
        success, msg = await rp_service.vote_idea_transaction(user_id, idea_id)
        if not success:
            return False, 0, msg
        
        # Create vote
        vote = IdeaVote(
            user_id=user_id,
            username=user.get("username", "Anonymous"),
            trust_score=user.get("trust_score", 500.0),
            rp_spent=RP_COSTS["vote_idea"]
        )
        
        votes.append(vote.model_dump())
        
        # Calculate new score
        new_score = self._calculate_vote_score(votes)
        
        await self.ideas_collection.update_one(
            {"id": idea_id},
            {
                "$set": {
                    "votes": votes,
                    "vote_count": len(votes),
                    "vote_score": new_score,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Award XP to voter
        from services.xp_service import xp_service
        await xp_service.award_xp(user_id, XP_REWARDS["idea_voted"], "vote_cast")
        
        # Award XP to idea author
        await xp_service.award_xp(idea["user_id"], 10, "vote_received")
        
        logger.info(f"User {user_id} voted on idea {idea_id}. New score: {new_score}")
        
        return True, new_score, "Vote recorded"
    
    def _calculate_vote_score(self, votes: List[Dict[str, Any]]) -> float:
        """Calculate weighted vote score: sum(trust_score * rp_spent / 100)"""
        total = 0.0
        for vote in votes:
            trust = vote.get("trust_score", 500.0)
            rp = vote.get("rp_spent", 50)
            # Normalize: (trust/1000) * (rp/50) gives weight ~0.5-1.0 per vote
            weight = (trust / 1000.0) * (rp / 50.0)
            total += weight
        return round(total, 2)
    
    # ========================================
    # COMMENTS
    # ========================================
    
    async def add_comment(
        self,
        idea_id: str,
        user_id: str,
        content: str
    ) -> Tuple[bool, Optional[IdeaComment], str]:
        """Add a comment to an idea"""
        
        idea = await self.ideas_collection.find_one({"id": idea_id})
        if not idea:
            return False, None, "Idea not found"
        
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, None, "User not found"
        
        comment = IdeaComment(
            user_id=user_id,
            username=user.get("username", "Anonymous"),
            user_avatar=user.get("avatar_url"),
            user_level=user.get("level", 1),
            user_trust_score=user.get("trust_score", 500.0),
            content=content
        )
        
        await self.comments_collection.insert_one({
            **comment.model_dump(),
            "idea_id": idea_id
        })
        
        await self.ideas_collection.update_one(
            {"id": idea_id},
            {"$inc": {"comments_count": 1}}
        )
        
        return True, comment, "Comment added"
    
    async def get_comments(
        self,
        idea_id: str,
        page: int = 1,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get comments for an idea"""
        
        cursor = self.comments_collection.find({"idea_id": idea_id})
        cursor = cursor.sort("created_at", -1)
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        
        comments = await cursor.to_list(length=limit)
        
        for comment in comments:
            comment.pop("_id", None)
        
        return comments
    
    # ========================================
    # RANKING & FEED
    # ========================================
    
    async def get_ideas_ranked(
        self,
        category: Optional[IdeaCategory] = None,
        status: Optional[IdeaStatus] = None,
        page: int = 1,
        limit: int = 20,
        sort: str = "score"  # score, new, trending
    ) -> List[Dict[str, Any]]:
        """Get ideas ranked by score"""
        
        query = {}
        
        if category:
            query["category"] = category.value
        
        if status:
            query["status"] = status.value
        else:
            # Default: open ideas
            query["status"] = IdeaStatus.OPEN.value
        
        # Sort options
        sort_options = {
            "score": [("vote_score", -1), ("created_at", -1)],
            "new": [("created_at", -1)],
            "trending": [("vote_count", -1), ("created_at", -1)]
        }
        
        cursor = self.ideas_collection.find(query)
        cursor = cursor.sort(sort_options.get(sort, sort_options["score"]))
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        
        ideas = await cursor.to_list(length=limit)
        
        # Add rank and clean up
        for i, idea in enumerate(ideas):
            idea.pop("_id", None)
            idea["rank"] = (page - 1) * limit + i + 1
        
        return ideas
    
    async def get_user_ideas(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get ideas by a specific user"""
        
        cursor = self.ideas_collection.find({"user_id": user_id})
        cursor = cursor.sort("created_at", -1)
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        
        ideas = await cursor.to_list(length=limit)
        
        for idea in ideas:
            idea.pop("_id", None)
        
        return ideas
    
    # ========================================
    # DUPLICATE DETECTION
    # ========================================
    
    async def check_similar_ideas(
        self,
        title: str,
        description: str
    ) -> Dict[str, Any]:
        """Check for similar existing ideas"""
        
        # Generate hash for this content
        check_hash = self._generate_similarity_hash(title, description)
        
        # Extract keywords
        keywords = self._extract_keywords(title + " " + description)
        
        # Search for similar ideas
        similar_ideas = []
        
        # Method 1: Hash match (exact or near duplicate)
        hash_matches = await self.ideas_collection.find({
            "similar_hash": check_hash,
            "status": {"$in": [IdeaStatus.OPEN.value, IdeaStatus.IN_PROGRESS.value]}
        }).to_list(length=5)
        
        for idea in hash_matches:
            idea.pop("_id", None)
            similar_ideas.append({
                "id": idea["id"],
                "title": idea["title"],
                "similarity": 1.0
            })
        
        # Method 2: Keyword match (partial match)
        if not similar_ideas and keywords:
            keyword_query = {
                "$or": [
                    {"title": {"$regex": "|".join(keywords[:5]), "$options": "i"}},
                    {"tags": {"$in": keywords[:5]}}
                ],
                "status": {"$in": [IdeaStatus.OPEN.value, IdeaStatus.IN_PROGRESS.value]}
            }
            
            keyword_matches = await self.ideas_collection.find(keyword_query).limit(3).to_list(length=3)
            
            for idea in keyword_matches:
                # Calculate rough similarity
                idea_keywords = self._extract_keywords(idea["title"] + " " + idea.get("description", ""))
                overlap = len(set(keywords) & set(idea_keywords))
                similarity = overlap / max(len(keywords), 1)
                
                if similarity > 0.4:  # 40% keyword overlap threshold
                    similar_ideas.append({
                        "id": idea["id"],
                        "title": idea["title"],
                        "similarity": round(similarity, 2)
                    })
        
        return {
            "is_similar": len(similar_ideas) > 0,
            "similar_ideas": similar_ideas,
            "similarity_scores": [s["similarity"] for s in similar_ideas]
        }
    
    def _generate_similarity_hash(self, title: str, description: str) -> str:
        """Generate a hash for duplicate detection"""
        # Normalize text
        combined = (title + " " + description).lower()
        combined = re.sub(r'[^a-zа-яё0-9\s]', '', combined)
        combined = ' '.join(combined.split())
        
        # Generate hash
        return hashlib.md5(combined.encode()).hexdigest()[:16]
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text"""
        # Simple keyword extraction
        text = text.lower()
        text = re.sub(r'[^a-zа-яё0-9\s]', '', text)
        words = text.split()
        
        # Filter short words and common words
        stopwords = {'и', 'в', 'на', 'с', 'для', 'это', 'что', 'как', 'the', 'a', 'an', 'is', 'are', 'to', 'for'}
        keywords = [w for w in words if len(w) > 3 and w not in stopwords]
        
        return keywords[:10]
    
    # ========================================
    # STATUS MANAGEMENT
    # ========================================
    
    async def update_status(
        self,
        idea_id: str,
        new_status: IdeaStatus,
        admin_user_id: str,
        notes: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Update idea status (admin only)"""
        
        idea = await self.ideas_collection.find_one({"id": idea_id})
        if not idea:
            return False, "Idea not found"
        
        update_dict = {
            "status": new_status.value,
            "status_changed_at": datetime.now(timezone.utc),
            "status_changed_by": admin_user_id,
            "updated_at": datetime.now(timezone.utc)
        }
        
        if notes:
            if new_status == IdeaStatus.REJECTED:
                update_dict["rejection_reason"] = notes
            else:
                update_dict["implementation_notes"] = notes
        
        await self.ideas_collection.update_one(
            {"id": idea_id},
            {"$set": update_dict}
        )
        
        # If implemented, refund RP and award XP
        if new_status == IdeaStatus.IMPLEMENTED:
            from services.rp_economics import RPEconomicsService
            rp_service = RPEconomicsService(self.db)
            await rp_service.idea_implemented_reward(idea["user_id"], idea_id)
        
        return True, f"Status updated to {new_status.value}"
