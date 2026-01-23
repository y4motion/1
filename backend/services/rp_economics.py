"""
Social Core Service - RP Economics

Handles all RP transactions for social features:
- Creating ideas (costs RP)
- Voting on ideas (costs RP)
- Refunds for implemented ideas
"""

from datetime import datetime, timezone
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class RPEconomicsService:
    """Manages RP transactions for social features"""
    
    # Cost configuration
    COSTS = {
        "create_idea": 500,
        "vote_idea": 50,
        "feature_post": 100,
    }
    
    # Rewards
    REWARDS = {
        "idea_implemented": 500,  # Refund creation cost
        "idea_implemented_bonus": 1000,  # Extra bonus
    }
    
    # Level requirements
    LEVEL_REQUIREMENTS = {
        "create_post": 5,
        "create_idea": 10,
        "vote_idea": 5,
    }
    
    def __init__(self, db):
        self.db = db
        self.users_collection = db["users"]
    
    async def check_can_afford(self, user_id: str, action: str) -> Tuple[bool, int, str]:
        """
        Check if user can afford an action
        Returns: (can_afford, current_balance, message)
        """
        cost = self.COSTS.get(action, 0)
        if cost == 0:
            return True, 0, "Free action"
        
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, 0, "User not found"
        
        current_rp = user.get("rp_balance", 0)
        
        if current_rp < cost:
            return False, current_rp, f"Insufficient RP. Need {cost}, have {current_rp}"
        
        return True, current_rp, f"Can afford (cost: {cost} RP)"
    
    async def check_level_requirement(self, user_id: str, action: str) -> Tuple[bool, int, int]:
        """
        Check if user meets level requirement
        Returns: (meets_requirement, user_level, required_level)
        """
        required = self.LEVEL_REQUIREMENTS.get(action, 0)
        
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, 0, required
        
        user_level = user.get("level", 1)
        
        return user_level >= required, user_level, required
    
    async def spend_rp(
        self, 
        user_id: str, 
        amount: int, 
        reason: str,
        reference_id: Optional[str] = None
    ) -> Tuple[bool, int, str]:
        """
        Deduct RP from user balance
        Returns: (success, new_balance, message)
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, 0, "User not found"
        
        current_rp = user.get("rp_balance", 0)
        
        if current_rp < amount:
            return False, current_rp, f"Insufficient RP. Need {amount}, have {current_rp}"
        
        new_balance = current_rp - amount
        
        # Update user
        await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "rp_balance": new_balance,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "rp_transactions": {
                        "type": "spend",
                        "amount": -amount,
                        "reason": reason,
                        "reference_id": reference_id,
                        "timestamp": datetime.now(timezone.utc)
                    }
                }
            }
        )
        
        logger.info(f"User {user_id} spent {amount} RP for {reason}. New balance: {new_balance}")
        
        return True, new_balance, f"Spent {amount} RP. New balance: {new_balance}"
    
    async def refund_rp(
        self,
        user_id: str,
        amount: int,
        reason: str,
        reference_id: Optional[str] = None
    ) -> Tuple[bool, int, str]:
        """
        Refund RP to user (for implemented ideas, etc.)
        Returns: (success, new_balance, message)
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, 0, "User not found"
        
        current_rp = user.get("rp_balance", 0)
        new_balance = current_rp + amount
        
        # Update user
        await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "rp_balance": new_balance,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "rp_transactions": {
                        "type": "refund",
                        "amount": amount,
                        "reason": reason,
                        "reference_id": reference_id,
                        "timestamp": datetime.now(timezone.utc)
                    }
                }
            }
        )
        
        logger.info(f"User {user_id} refunded {amount} RP for {reason}. New balance: {new_balance}")
        
        return True, new_balance, f"Refunded {amount} RP. New balance: {new_balance}"
    
    async def create_idea_transaction(self, user_id: str, idea_id: str) -> Tuple[bool, str]:
        """
        Full transaction for creating an idea
        Checks level, deducts RP
        """
        # Check level
        meets_level, user_level, required = await self.check_level_requirement(user_id, "create_idea")
        if not meets_level:
            return False, f"Level {required} required. You are level {user_level}"
        
        # Check and spend RP
        cost = self.COSTS["create_idea"]
        can_afford, balance, msg = await self.check_can_afford(user_id, "create_idea")
        
        if not can_afford:
            return False, msg
        
        success, new_balance, msg = await self.spend_rp(
            user_id=user_id,
            amount=cost,
            reason="create_idea",
            reference_id=idea_id
        )
        
        return success, msg
    
    async def vote_idea_transaction(self, user_id: str, idea_id: str) -> Tuple[bool, str]:
        """
        Full transaction for voting on an idea
        Checks level, deducts RP
        """
        # Check level
        meets_level, user_level, required = await self.check_level_requirement(user_id, "vote_idea")
        if not meets_level:
            return False, f"Level {required} required. You are level {user_level}"
        
        # Check and spend RP
        cost = self.COSTS["vote_idea"]
        can_afford, balance, msg = await self.check_can_afford(user_id, "vote_idea")
        
        if not can_afford:
            return False, msg
        
        success, new_balance, msg = await self.spend_rp(
            user_id=user_id,
            amount=cost,
            reason="vote_idea",
            reference_id=idea_id
        )
        
        return success, msg
    
    async def idea_implemented_reward(self, user_id: str, idea_id: str) -> Tuple[bool, str]:
        """
        Reward user when their idea is implemented
        Refunds creation cost + bonus
        """
        # Refund creation cost
        refund_amount = self.REWARDS["idea_implemented"]
        bonus_amount = self.REWARDS["idea_implemented_bonus"]
        total = refund_amount + bonus_amount
        
        success, new_balance, msg = await self.refund_rp(
            user_id=user_id,
            amount=total,
            reason="idea_implemented",
            reference_id=idea_id
        )
        
        if success:
            # Also award XP through xp_service
            from services.xp_service import xp_service
            await xp_service.award_xp(user_id, 5000, "idea_implemented")
        
        return success, f"Idea implemented! Received {total} RP refund + bonus"
