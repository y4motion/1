"""
Glassy Mind - Notification Service
Сервис уведомлений для email и внутренних пушей.

Пока реализация мок (печать в консоль), но структура готова для Resend/SMTP.
"""

import logging
from typing import Dict, Optional, List, Any
from datetime import datetime, timezone
from enum import Enum
import os

logger = logging.getLogger(__name__)


class NotificationType(Enum):
    """Типы уведомлений"""
    EMAIL = "email"
    SOFT_PUSH = "soft_push"      # Внутри сайта
    BROWSER_PUSH = "browser_push"


class NotificationTemplate(Enum):
    """Шаблоны уведомлений"""
    WELCOME = "welcome_email"
    CART_ABANDONED = "cart_abandoned"
    SUGGESTION = "suggestion"
    ORDER_CONFIRMATION = "order_confirmation"


# HTML Email Templates
EMAIL_TEMPLATES = {
    "welcome_email": {
        "subject": "Добро пожаловать в Glassy.Tech! 🎉",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #ffffff; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(20,20,30,0.95)); border: 1px solid rgba(139,92,246,0.2); border-radius: 16px; padding: 40px; }
        .logo { font-size: 24px; font-weight: 700; color: #a78bfa; margin-bottom: 24px; }
        h1 { color: #ffffff; font-size: 28px; margin-bottom: 16px; }
        p { color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 16px; }
        .xp-box { background: rgba(139,92,246,0.2); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .xp-value { font-size: 36px; font-weight: 700; color: #a78bfa; }
        .btn { display: inline-block; background: #8b5cf6; color: #fff; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: rgba(255,255,255,0.5); }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">✨ Glassy.Tech</div>
        <h1>Привет, {username}!</h1>
        <p>Добро пожаловать в сообщество Glassy.Tech — платформу для энтузиастов технологий.</p>
        <div class="xp-box">
            <div>Вам начислено</div>
            <div class="xp-value">+{xp_bonus} XP</div>
            <div>за регистрацию</div>
        </div>
        <p>Что можно делать:</p>
        <ul style="color: rgba(255,255,255,0.8);">
            <li>🛒 Покупать топовое железо</li>
            <li>🔄 Обмениваться на Glassy Swap</li>
            <li>🏆 Зарабатывать XP и рейтинг</li>
            <li>🤖 Получать советы от AI-ассистента</li>
        </ul>
        <a href="{site_url}/marketplace" class="btn">Начать покупки</a>
        <div class="footer">
            Это письмо отправлено автоматически. Если вы не регистрировались, проигнорируйте его.
        </div>
    </div>
</body>
</html>
"""
    },
    
    "cart_abandoned": {
        "subject": "Вы забыли кое-что в корзине 🛒",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #ffffff; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(20,20,30,0.95)); border: 1px solid rgba(139,92,246,0.2); border-radius: 16px; padding: 40px; }
        .logo { font-size: 24px; font-weight: 700; color: #a78bfa; margin-bottom: 24px; }
        h1 { color: #ffffff; font-size: 24px; margin-bottom: 16px; }
        p { color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 16px; }
        .ai-tip { background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 12px; padding: 16px; margin: 20px 0; }
        .ai-tip-icon { font-size: 20px; margin-right: 8px; }
        .product-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 12px 0; display: flex; align-items: center; }
        .product-img { width: 60px; height: 60px; border-radius: 8px; background: #1a1a2e; margin-right: 16px; }
        .product-title { color: #fff; font-weight: 600; }
        .product-price { color: #a78bfa; font-weight: 700; }
        .btn { display: inline-block; background: #8b5cf6; color: #fff; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: rgba(255,255,255,0.5); }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">✨ Glassy.Tech</div>
        <h1>Вы забыли кое-что...</h1>
        <p>Привет, {username}! Заметили, что вы не завершили покупку. Товары всё ещё ждут вас:</p>
        
        {cart_items_html}
        
        <div class="ai-tip">
            <span class="ai-tip-icon">💡</span>
            <strong>Совет от Glassy Mind:</strong> {ai_suggestion}
        </div>
        
        <a href="{site_url}/cart" class="btn">Вернуться к корзине</a>
        
        <div class="footer">
            <p>Вы получили это письмо потому что у вас есть товары в корзине на Glassy.Tech.</p>
            <a href="{unsubscribe_url}" style="color: #a78bfa;">Отписаться от напоминаний</a>
        </div>
    </div>
</body>
</html>
"""
    },
    
    "suggestion": {
        "subject": "💡 У Glassy Mind есть идея для вас",
        "html": """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #ffffff; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(20,20,30,0.95)); border: 1px solid rgba(139,92,246,0.2); border-radius: 16px; padding: 40px; }
        .suggestion-box { background: rgba(139,92,246,0.15); border-radius: 16px; padding: 24px; margin: 20px 0; text-align: center; }
        .suggestion-text { font-size: 18px; color: #fff; line-height: 1.5; }
        .btn { display: inline-block; background: #8b5cf6; color: #fff; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div style="font-size: 24px; font-weight: 700; color: #a78bfa; margin-bottom: 24px;">✨ Glassy.Tech</div>
        <h1 style="color: #fff;">Привет, {username}!</h1>
        <p style="color: rgba(255,255,255,0.8);">Наш AI-ассистент заметил кое-что интересное и хочет поделиться:</p>
        <div class="suggestion-box">
            <div style="font-size: 32px; margin-bottom: 12px;">💡</div>
            <div class="suggestion-text">{suggestion_text}</div>
        </div>
        <a href="{action_url}" class="btn">{action_text}</a>
    </div>
</body>
</html>
"""
    }
}


class NotificationQueue:
    """Очередь уведомлений (in-memory, для продакшена — Redis/Celery)"""
    
    def __init__(self):
        self._queue: List[Dict] = []
    
    def add(self, notification: Dict):
        self._queue.append({
            **notification,
            "queued_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"📬 Notification queued: {notification.get('type')} to {notification.get('to')}")
    
    def get_pending(self) -> List[Dict]:
        return self._queue.copy()
    
    def clear(self):
        self._queue = []


class NotificationManager:
    """
    Менеджер уведомлений.
    Пока мок-реализация, готовая для интеграции с Resend.
    """
    
    def __init__(self):
        self.queue = NotificationQueue()
        self.resend_api_key = os.getenv("RESEND_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@glassy.tech")
        self.site_url = os.getenv("SITE_URL", "https://glassy.tech")
        
        self.enabled = bool(self.resend_api_key)
        logger.info(f"📧 NotificationManager initialized (Resend: {'enabled' if self.enabled else 'mock mode'})")
    
    def _render_template(self, template_name: str, context: Dict) -> tuple:
        """Рендерит шаблон с контекстом"""
        template = EMAIL_TEMPLATES.get(template_name)
        if not template:
            logger.warning(f"Template '{template_name}' not found")
            return "Notification", "<p>No template</p>"
        
        subject = template["subject"]
        html = template["html"]
        
        # Replace placeholders
        for key, value in context.items():
            html = html.replace(f"{{{key}}}", str(value))
            subject = subject.replace(f"{{{key}}}", str(value))
        
        return subject, html
    
    async def send_email(
        self,
        to_email: str,
        template_name: str,
        context: Dict,
        immediate: bool = False
    ) -> Dict:
        """
        Отправить email уведомление.
        
        Args:
            to_email: Email получателя
            template_name: Имя шаблона
            context: Контекст для рендеринга
            immediate: Отправить сразу или в очередь
        """
        subject, html = self._render_template(template_name, context)
        
        notification = {
            "type": NotificationType.EMAIL.value,
            "to": to_email,
            "subject": subject,
            "template": template_name,
            "context": context
        }
        
        if not immediate:
            self.queue.add(notification)
            return {"success": True, "queued": True}
        
        # Мок-реализация (печать в консоль)
        logger.info("=" * 60)
        logger.info(f"📧 EMAIL NOTIFICATION (MOCK)")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Template: {template_name}")
        logger.info(f"Context: {context}")
        logger.info("=" * 60)
        
        # TODO: Интеграция с Resend
        # if self.enabled:
        #     import resend
        #     resend.api_key = self.resend_api_key
        #     result = resend.Emails.send({
        #         "from": self.from_email,
        #         "to": [to_email],
        #         "subject": subject,
        #         "html": html
        #     })
        #     return {"success": True, "id": result["id"]}
        
        return {
            "success": True,
            "mock": True,
            "to": to_email,
            "subject": subject
        }
    
    async def send_soft_push(
        self,
        user_id: str,
        message: str,
        action_url: Optional[str] = None,
        priority: int = 1
    ) -> Dict:
        """
        Внутреннее уведомление на сайте (soft push).
        Показывается через Living Bar или notification center.
        """
        notification = {
            "type": NotificationType.SOFT_PUSH.value,
            "user_id": user_id,
            "message": message,
            "action_url": action_url,
            "priority": priority,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        self.queue.add(notification)
        
        logger.info(f"🔔 Soft push queued for {user_id}: {message}")
        
        return {"success": True, "queued": True}
    
    async def process_rule_trigger(
        self,
        user_id: str,
        rule_name: str,
        reaction_message: str,
        user_email: Optional[str] = None,
        queue_email: bool = False
    ):
        """
        Обработать срабатывание правила из RulesEngine.
        Создаёт soft push и опционально email.
        """
        # Всегда создаём soft push
        await self.send_soft_push(
            user_id=user_id,
            message=reaction_message,
            priority=2
        )
        
        # Если нужен email и есть адрес
        if queue_email and user_email:
            await self.send_email(
                to_email=user_email,
                template_name="suggestion",
                context={
                    "username": user_id,
                    "suggestion_text": reaction_message,
                    "action_url": f"{self.site_url}/marketplace",
                    "action_text": "Перейти в магазин"
                },
                immediate=False
            )
    
    def get_pending_notifications(self) -> List[Dict]:
        """Получить все ожидающие уведомления"""
        return self.queue.get_pending()
    
    def get_user_notifications(self, user_id: str) -> List[Dict]:
        """Получить уведомления для конкретного пользователя"""
        return [
            n for n in self.queue.get_pending()
            if n.get("user_id") == user_id
        ]


# Singleton instance
notification_manager = NotificationManager()
