"""
Glassy Mind - AI Brain for Glassy Market

Модули:
- observer: Отслеживание поведения пользователей (MongoDB persistence)
- expert_brain: Анализ совместимости и генерация рекомендаций
- chat_agent: AI чат с GPT интеграцией через emergentintegrations
- abandoned_cart: Webhook система для брошенных корзин
- router: API эндпоинты
"""

from .observer import observer, Observer
from .expert_brain import tech_expert, TechExpert, CompatibilityLevel
from .chat_agent import mind_chat_agent, MindChatAgent
from .abandoned_cart import abandoned_cart_webhook, AbandonedCartWebhook
from .router import router

__all__ = [
    "observer",
    "Observer", 
    "tech_expert",
    "TechExpert",
    "CompatibilityLevel",
    "mind_chat_agent",
    "MindChatAgent",
    "abandoned_cart_webhook",
    "AbandonedCartWebhook",
    "router"
]
