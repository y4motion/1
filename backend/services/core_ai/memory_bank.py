from typing import Dict, List, Optional
from datetime import datetime, timezone
from database import get_database
import logging

logger = logging.getLogger(__name__)


class MemoryBank:
    """Централизованная память для всех AI агентов"""
    
    async def get_user_context(self, user_id: str) -> Dict:
        """Получить полный контекст пользователя"""
        db = await get_database()
        
        context = {
            "user": await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0}),
            "recent_views": await self._get_recent_views(user_id),
            "cart": await self._get_cart(user_id),
            "wishlist": await self._get_wishlist(user_id),
            "past_orders": await self._get_past_orders(user_id),
            "current_build": await self._get_current_build(user_id),
            "preferences": await self._get_preferences(user_id),
            "budget": await self._estimate_budget(user_id)
        }
        
        return context
    
    async def get_conversation(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Получить историю разговора для AI контекста"""
        db = await get_database()
        
        messages = await db.ai_conversations.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Форматировать для AI API (в правильном порядке)
        formatted = []
        for msg in reversed(messages):
            formatted.append({"role": "user", "content": msg["user_message"]})
            formatted.append({"role": "assistant", "content": msg["ai_response"]})
        
        return formatted
    
    async def save_conversation(
        self, 
        user_id: str, 
        user_msg: str, 
        ai_msg: str,
        agent_type: str = "chat",
        intent: str = None,
        metadata: Dict = None
    ):
        """Сохранить разговор в память"""
        db = await get_database()
        
        conversation = {
            "user_id": user_id,
            "user_message": user_msg,
            "ai_response": ai_msg,
            "agent_type": agent_type,
            "intent": intent,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.ai_conversations.insert_one(conversation)
        logger.info(f"💬 Conversation saved for user {user_id} (agent: {agent_type})")
    
    async def save_to_dataset(self, interaction: Dict):
        """Сохранить для обучения локальной модели (PHASE 2)"""
        db = await get_database()
        
        dataset_entry = {
            **interaction,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_validated": False,
            "quality_score": None
        }
        
        await db.ai_training_dataset.insert_one(dataset_entry)
        logger.info("📚 Training data saved")
    
    async def update_user_preferences(self, user_id: str, preferences: Dict):
        """Обновить предпочтения пользователя"""
        db = await get_database()
        
        await db.user_ai_preferences.update_one(
            {"user_id": user_id},
            {"$set": {
                **preferences,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    
    # ==================== Helper Methods ====================
    
    async def _get_recent_views(self, user_id: str) -> List[Dict]:
        """Получить недавно просмотренные товары"""
        db = await get_database()
        
        views = await db.product_views.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("viewed_at", -1).limit(10).to_list(10)
        
        # Обогатить данными о продуктах
        enriched = []
        for view in views:
            product = await db.products.find_one(
                {"id": view.get("product_id")},
                {"_id": 0, "id": 1, "title": 1, "price": 1, "category": 1}
            )
            if product:
                view["product"] = product
                enriched.append(view)
        
        return enriched
    
    async def _get_cart(self, user_id: str) -> Dict:
        """Получить корзину пользователя"""
        db = await get_database()
        
        cart = await db.carts.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        return cart or {"items": [], "total": 0}
    
    async def _get_wishlist(self, user_id: str) -> List[str]:
        """Получить wishlist пользователя"""
        db = await get_database()
        
        user = await db.users.find_one(
            {"id": user_id},
            {"_id": 0, "wishlist": 1}
        )
        
        return user.get("wishlist", []) if user else []
    
    async def _get_past_orders(self, user_id: str) -> List[Dict]:
        """Получить прошлые заказы"""
        db = await get_database()
        
        orders = await db.orders.find(
            {"user_id": user_id, "status": "completed"},
            {"_id": 0, "id": 1, "items": 1, "total": 1, "created_at": 1}
        ).sort("created_at", -1).limit(5).to_list(5)
        
        return orders
    
    async def _get_current_build(self, user_id: str) -> Dict:
        """Получить текущую сборку ПК"""
        db = await get_database()
        
        build = await db.pc_builds.find_one(
            {"user_id": user_id, "is_completed": False},
            {"_id": 0}
        )
        
        return build or {}
    
    async def _get_preferences(self, user_id: str) -> Dict:
        """Получить предпочтения пользователя"""
        db = await get_database()
        
        prefs = await db.user_ai_preferences.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        return prefs or {
            "preferred_brands": [],
            "budget_range": {"min": 0, "max": 999999},
            "interests": [],
            "communication_style": "friendly"
        }
    
    async def _estimate_budget(self, user_id: str) -> Optional[int]:
        """Оценить бюджет на основе истории"""
        db = await get_database()
        
        # Средняя цена просмотренных товаров
        views = await db.product_views.aggregate([
            {"$match": {"user_id": user_id}},
            {"$lookup": {
                "from": "products",
                "localField": "product_id",
                "foreignField": "id",
                "as": "product"
            }},
            {"$unwind": "$product"},
            {"$group": {
                "_id": None,
                "avg_price": {"$avg": "$product.price"}
            }}
        ]).to_list(1)
        
        if views and views[0].get("avg_price"):
            return int(views[0]["avg_price"] * 1.2)  # +20% buffer
        
        return None


# Global instance
memory_bank = MemoryBank()
