"""
Glassy Mind - Abandoned Cart Webhook System
Отслеживание брошенных корзин и отправка уведомлений.
"""

import os
import logging
import aiohttp
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class AbandonedCart:
    """Данные о брошенной корзине"""
    user_id: str
    email: Optional[str]
    products: List[Dict]
    total_value: float
    abandoned_at: datetime
    reminder_sent: bool = False


class AbandonedCartWebhook:
    """
    Система отслеживания и уведомления о брошенных корзинах.
    
    Интегрируется с Observer для отслеживания активности
    и отправляет webhooks при обнаружении брошенных корзин.
    """
    
    def __init__(self):
        self.webhook_url = os.environ.get('ABANDONED_CART_WEBHOOK_URL')
        self.reminder_delay_minutes = int(os.environ.get('CART_REMINDER_DELAY', '30'))
        self.enabled = bool(self.webhook_url)
        self._db = None
        
        if self.enabled:
            logger.info(f"🛒 AbandonedCartWebhook enabled, delay: {self.reminder_delay_minutes}min")
        else:
            logger.info("🛒 AbandonedCartWebhook disabled - no webhook URL")
    
    async def _ensure_db(self):
        """Lazy initialization of database"""
        if self._db is None:
            try:
                from database import db
                self._db = db
                # Create index for efficient queries
                await self._db.abandoned_carts.create_index("user_id")
                await self._db.abandoned_carts.create_index("reminder_sent")
                await self._db.abandoned_carts.create_index("abandoned_at")
            except Exception as e:
                logger.warning(f"MongoDB not available for abandoned carts: {e}")
    
    async def track_cart_activity(
        self,
        user_id: str,
        products: List[Dict],
        user_email: Optional[str] = None
    ):
        """
        Track cart activity for abandonment detection.
        Called when user adds items to cart.
        """
        await self._ensure_db()
        
        if self._db is None:
            return
        
        total_value = sum(
            float(p.get('price', 0)) * int(p.get('quantity', 1)) 
            for p in products
        )
        
        cart_data = {
            "user_id": user_id,
            "email": user_email,
            "products": products,
            "total_value": total_value,
            "last_activity": datetime.now(timezone.utc).isoformat(),
            "abandoned_at": None,
            "reminder_sent": False,
            "converted": False
        }
        
        await self._db.abandoned_carts.update_one(
            {"user_id": user_id},
            {"$set": cart_data},
            upsert=True
        )
        
        logger.debug(f"Cart activity tracked for user {user_id}, {len(products)} items")
    
    async def mark_cart_converted(self, user_id: str):
        """Mark cart as converted (purchase completed)"""
        await self._ensure_db()
        
        if self._db is None:
            return
        
        await self._db.abandoned_carts.update_one(
            {"user_id": user_id},
            {"$set": {"converted": True, "converted_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        logger.info(f"✅ Cart converted for user {user_id}")
    
    async def check_abandoned_carts(self) -> List[Dict]:
        """
        Check for abandoned carts and trigger webhooks.
        Should be called periodically (e.g., every 5 minutes).
        """
        await self._ensure_db()
        
        if self._db is None:
            return []
        
        # Find carts that haven't had activity in reminder_delay_minutes
        threshold = datetime.now(timezone.utc) - timedelta(minutes=self.reminder_delay_minutes)
        
        # Find carts that are abandoned but not yet notified
        abandoned = await self._db.abandoned_carts.find({
            "last_activity": {"$lt": threshold.isoformat()},
            "reminder_sent": False,
            "converted": False,
            "products": {"$ne": []}
        }).to_list(100)
        
        triggered = []
        
        for cart in abandoned:
            cart_id = str(cart.get("_id", ""))
            user_id = cart.get("user_id")
            
            # Mark as abandoned
            await self._db.abandoned_carts.update_one(
                {"_id": cart["_id"]},
                {"$set": {"abandoned_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Send webhook
            if self.enabled:
                success = await self._send_webhook(cart)
                if success:
                    await self._db.abandoned_carts.update_one(
                        {"_id": cart["_id"]},
                        {"$set": {"reminder_sent": True}}
                    )
                    triggered.append({
                        "user_id": user_id,
                        "products_count": len(cart.get("products", [])),
                        "total_value": cart.get("total_value", 0)
                    })
            else:
                # Just log without webhook
                triggered.append({
                    "user_id": user_id,
                    "products_count": len(cart.get("products", [])),
                    "total_value": cart.get("total_value", 0),
                    "webhook_skipped": True
                })
        
        if triggered:
            logger.info(f"🛒 Found {len(triggered)} abandoned carts")
        
        return triggered
    
    async def _send_webhook(self, cart: Dict) -> bool:
        """Send webhook notification for abandoned cart"""
        
        if not self.webhook_url:
            return False
        
        payload = {
            "event": "cart_abandoned",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": {
                "user_id": cart.get("user_id"),
                "email": cart.get("email"),
                "products": cart.get("products", []),
                "total_value": cart.get("total_value", 0),
                "currency": "USD",
                "abandoned_after_minutes": self.reminder_delay_minutes
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status in [200, 201, 202]:
                        logger.info(f"✅ Webhook sent for user {cart.get('user_id')}")
                        return True
                    else:
                        logger.warning(f"Webhook failed: {response.status}")
                        return False
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            return False
    
    async def get_abandoned_cart_stats(self) -> Dict:
        """Get statistics about abandoned carts"""
        await self._ensure_db()
        
        if self._db is None:
            return {"error": "Database not available"}
        
        total = await self._db.abandoned_carts.count_documents({})
        abandoned = await self._db.abandoned_carts.count_documents({"abandoned_at": {"$ne": None}})
        converted = await self._db.abandoned_carts.count_documents({"converted": True})
        reminder_sent = await self._db.abandoned_carts.count_documents({"reminder_sent": True})
        
        # Calculate total value of abandoned carts
        pipeline = [
            {"$match": {"abandoned_at": {"$ne": None}, "converted": False}},
            {"$group": {"_id": None, "total": {"$sum": "$total_value"}}}
        ]
        value_result = await self._db.abandoned_carts.aggregate(pipeline).to_list(1)
        abandoned_value = value_result[0]["total"] if value_result else 0
        
        # Recovery rate
        recovery_rate = round((converted / abandoned * 100), 2) if abandoned > 0 else 0
        
        return {
            "total_carts_tracked": total,
            "abandoned_carts": abandoned,
            "converted_carts": converted,
            "reminders_sent": reminder_sent,
            "abandoned_value_usd": round(abandoned_value, 2),
            "recovery_rate_percent": recovery_rate,
            "reminder_delay_minutes": self.reminder_delay_minutes
        }
    
    async def get_recent_abandoned(self, limit: int = 10) -> List[Dict]:
        """Get recent abandoned carts for dashboard"""
        await self._ensure_db()
        
        if self._db is None:
            return []
        
        carts = await self._db.abandoned_carts.find(
            {"abandoned_at": {"$ne": None}, "converted": False},
            {"_id": 0}
        ).sort("abandoned_at", -1).limit(limit).to_list(limit)
        
        return carts


# Singleton instance
abandoned_cart_webhook = AbandonedCartWebhook()
