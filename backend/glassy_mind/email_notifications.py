"""
Glassy Mind - Email Notifications System
Email уведомления для брошенных корзин и других событий.
"""

import os
import asyncio
import logging
import resend
from typing import Dict, List, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
STORE_NAME = "Glassy Market"
STORE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://glassy.market')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


class EmailNotificationService:
    """Сервис email-уведомлений через Resend."""
    
    def __init__(self):
        self.enabled = bool(RESEND_API_KEY)
        self.sender = SENDER_EMAIL
        self._db = None
        
        if self.enabled:
            logger.info("📧 EmailNotificationService enabled")
        else:
            logger.warning("📧 EmailNotificationService disabled - no RESEND_API_KEY")
    
    async def _ensure_db(self):
        """Lazy init database"""
        if self._db is None:
            try:
                from database import db
                self._db = db
                await self._db.email_logs.create_index("user_id")
                await self._db.email_logs.create_index("email_type")
            except:
                pass
    
    async def _log_email(self, email_type: str, recipient: str, subject: str, success: bool, email_id: Optional[str] = None):
        """Log email to database"""
        await self._ensure_db()
        if self._db is not None:
            await self._db.email_logs.insert_one({
                "email_type": email_type,
                "recipient": recipient,
                "subject": subject,
                "success": success,
                "email_id": email_id,
                "sent_at": datetime.now(timezone.utc).isoformat()
            })
    
    def _build_abandoned_cart_email(self, user_name: str, products: List[Dict], total_value: float, recovery_link: str) -> str:
        """Build HTML email for abandoned cart."""
        
        products_html = ""
        for p in products[:5]:  # Max 5 products
            products_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    <strong>{p.get('title', 'Product')}</strong><br>
                    <span style="color: #666; font-size: 14px;">Qty: {p.get('quantity', 1)}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                    ${p.get('price', 0):.2f}
                </td>
            </tr>
            """
        
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🛒 Вы кое-что забыли!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                                Привет{', ' + user_name if user_name else ''}! 👋
                            </p>
                            <p style="font-size: 16px; color: #666; margin: 0 0 25px;">
                                Мы заметили, что вы оставили товары в корзине. Они всё ещё ждут вас!
                            </p>
                            
                            <!-- Products Table -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                                <tr style="background: #f8f8f8;">
                                    <td style="padding: 12px; font-weight: bold; color: #333;">Товар</td>
                                    <td style="padding: 12px; font-weight: bold; color: #333; text-align: right;">Цена</td>
                                </tr>
                                {products_html}
                                <tr style="background: #8b5cf6;">
                                    <td style="padding: 15px; color: #fff; font-weight: bold;">Итого:</td>
                                    <td style="padding: 15px; color: #fff; font-weight: bold; text-align: right;">${total_value:.2f}</td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{recovery_link}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                            🛍️ Вернуться к покупкам
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Offer -->
                            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    💡 <strong>Специально для вас:</strong> Используйте код <strong>COMEBACK10</strong> для скидки 10%!
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f8f8; padding: 20px; text-align: center;">
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                {STORE_NAME} • Лучшая техника для геймеров
                            </p>
                            <p style="margin: 10px 0 0; color: #999; font-size: 11px;">
                                Не хотите получать такие письма? <a href="{STORE_URL}/unsubscribe" style="color: #8b5cf6;">Отписаться</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """
    
    async def send_abandoned_cart_email(
        self,
        recipient_email: str,
        user_name: Optional[str],
        products: List[Dict],
        total_value: float,
        recovery_link: str
    ) -> Dict:
        """Send abandoned cart reminder email."""
        
        if not self.enabled:
            return {"success": False, "error": "Email service disabled"}
        
        subject = f"🛒 Ваша корзина ждёт вас! — {STORE_NAME}"
        html_content = self._build_abandoned_cart_email(user_name, products, total_value, recovery_link)
        
        try:
            params = {
                "from": self.sender,
                "to": [recipient_email],
                "subject": subject,
                "html": html_content
            }
            
            email = await asyncio.to_thread(resend.Emails.send, params)
            
            await self._log_email("abandoned_cart", recipient_email, subject, True, email.get("id"))
            
            logger.info(f"📧 Abandoned cart email sent to {recipient_email}")
            
            return {
                "success": True,
                "email_id": email.get("id"),
                "recipient": recipient_email
            }
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            await self._log_email("abandoned_cart", recipient_email, subject, False)
            return {"success": False, "error": str(e)}
    
    async def send_welcome_email(self, recipient_email: str, user_name: str) -> Dict:
        """Send welcome email to new user."""
        
        if not self.enabled:
            return {"success": False, "error": "Email service disabled"}
        
        subject = f"👋 Добро пожаловать в {STORE_NAME}!"
        html_content = f"""
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; background: #f5f5f5; padding: 40px;">
    <table width="600" style="background: #fff; border-radius: 12px; margin: 0 auto; padding: 30px;">
        <tr>
            <td style="text-align: center;">
                <h1 style="color: #8b5cf6;">🎮 Добро пожаловать!</h1>
                <p style="font-size: 18px; color: #333;">
                    Привет, {user_name}! Рады видеть вас в {STORE_NAME}.
                </p>
                <p style="color: #666;">
                    Мы собрали лучшую технику для геймеров и энтузиастов.
                    Исследуйте наш каталог и найдите идеальные девайсы!
                </p>
                <a href="{STORE_URL}/marketplace" style="display: inline-block; background: #8b5cf6; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
                    🛍️ Начать покупки
                </a>
            </td>
        </tr>
    </table>
</body>
</html>
        """
        
        try:
            params = {
                "from": self.sender,
                "to": [recipient_email],
                "subject": subject,
                "html": html_content
            }
            
            email = await asyncio.to_thread(resend.Emails.send, params)
            await self._log_email("welcome", recipient_email, subject, True, email.get("id"))
            
            return {"success": True, "email_id": email.get("id")}
            
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_email_stats(self) -> Dict:
        """Get email sending statistics."""
        await self._ensure_db()
        
        if self._db is None:
            return {"error": "Database not available"}
        
        total = await self._db.email_logs.count_documents({})
        successful = await self._db.email_logs.count_documents({"success": True})
        abandoned_cart = await self._db.email_logs.count_documents({"email_type": "abandoned_cart"})
        welcome = await self._db.email_logs.count_documents({"email_type": "welcome"})
        
        return {
            "total_sent": total,
            "successful": successful,
            "failed": total - successful,
            "success_rate": round(successful / total * 100, 2) if total > 0 else 0,
            "by_type": {
                "abandoned_cart": abandoned_cart,
                "welcome": welcome
            },
            "service_enabled": self.enabled
        }


# Singleton instance
email_service = EmailNotificationService()
