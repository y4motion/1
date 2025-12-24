import json
import logging
from typing import Optional, Dict, List
from datetime import datetime, timezone
from database import db
import uuid
import os

logger = logging.getLogger(__name__)

# Get VAPID keys from environment
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY')
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'noreply@glassy-market.com')
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')


class NotificationService:
    """Unified notification service for all channels"""
    
    def __init__(self):
        self.vapid_private_key = VAPID_PRIVATE_KEY
        self.vapid_public_key = VAPID_PUBLIC_KEY
        self.vapid_claims = {"sub": f"mailto:{NOTIFICATION_EMAIL}"}
    
    async def send_notification(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        link: Optional[str] = None,
        metadata: Optional[Dict] = None,
        methods: Optional[Dict] = None
    ):
        """
        Send notification via all specified methods
        
        Args:
            user_id: User ID to send to
            notification_type: Type of notification (price_drop, order_update, etc.)
            title: Notification title
            message: Notification message
            link: Optional link for notification
            metadata: Additional metadata
            methods: Dict of {push: bool, email: bool, sms: bool}
        """
        if methods is None:
            methods = {"push": True, "email": False, "sms": False}
        
        # Create in-app notification (always)
        await self.create_in_app_notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link,
            metadata=metadata
        )
        
        # Get user data
        user = await db.users.find_one({"id": user_id})
        if not user:
            logger.error(f"User {user_id} not found")
            return
        
        # Send via requested methods
        results = {}
        
        if methods.get("push"):
            results["push"] = await self.send_push_notification(
                user_id=user_id,
                title=title,
                message=message,
                link=link
            )
        
        if methods.get("email"):
            results["email"] = await self.send_email_notification(
                email=user.get("email"),
                title=title,
                message=message,
                link=link
            )
        
        if methods.get("sms"):
            results["sms"] = await self.send_sms_notification(
                phone=user.get("phone"),
                message=f"{title}: {message}"
            )
        
        logger.info(f"Notification sent to {user_id}: {results}")
        return results
    
    async def create_in_app_notification(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        link: Optional[str] = None,
        metadata: Optional[Dict] = None
    ):
        """Create in-app notification in database"""
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "link": link,
            "metadata": metadata or {},
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.notifications.insert_one(notification)
        logger.info(f"✅ In-app notification created for {user_id}")
        return notification
    
    async def send_push_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        link: Optional[str] = None
    ) -> bool:
        """Send Web Push notification"""
        
        # Check if VAPID keys are configured
        if not self.vapid_private_key or not self.vapid_public_key:
            logger.warning("VAPID keys not configured, skipping push notification")
            return False
        
        # Get user's push subscriptions
        subscriptions = await db.push_subscriptions.find({
            "user_id": user_id
        }).to_list(None)
        
        if not subscriptions:
            logger.info(f"No push subscriptions found for user {user_id}")
            return False
        
        # Prepare notification payload
        payload = json.dumps({
            "title": title,
            "body": message,
            "icon": "/logo192.png",
            "badge": "/badge.png",
            "url": link or "/",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        success_count = 0
        failed_subscriptions = []
        
        # Import pywebpush only when needed
        try:
            from pywebpush import webpush, WebPushException
        except ImportError:
            logger.error("pywebpush not installed")
            return False
        
        # Send to all user's devices
        for sub in subscriptions:
            try:
                webpush(
                    subscription_info=sub["subscription"],
                    data=payload,
                    vapid_private_key=self.vapid_private_key,
                    vapid_claims=self.vapid_claims
                )
                success_count += 1
                logger.info(f"✅ Push sent to subscription {sub.get('id', 'unknown')}")
                
            except WebPushException as e:
                logger.error(f"❌ Push failed for subscription {sub.get('id', 'unknown')}: {e}")
                
                # If subscription is gone (410), mark for deletion
                if e.response and e.response.status_code == 410:
                    failed_subscriptions.append(sub["_id"])
            except Exception as e:
                logger.error(f"❌ Push error: {e}")
        
        # Cleanup invalid subscriptions
        if failed_subscriptions:
            await db.push_subscriptions.delete_many({
                "_id": {"$in": failed_subscriptions}
            })
            logger.info(f"🗑️ Removed {len(failed_subscriptions)} invalid subscriptions")
        
        return success_count > 0
    
    async def send_email_notification(
        self,
        email: Optional[str],
        title: str,
        message: str,
        link: Optional[str] = None
    ) -> bool:
        """Send email notification"""
        
        if not email:
            logger.warning("No email provided")
            return False
        
        if ENVIRONMENT == "production" and SENDGRID_API_KEY:
            # TODO: Implement SendGrid
            # from sendgrid import SendGridAPIClient
            # from sendgrid.helpers.mail import Mail
            # 
            # sg_message = Mail(
            #     from_email=NOTIFICATION_EMAIL,
            #     to_emails=email,
            #     subject=title,
            #     html_content=self._render_email_template(title, message, link)
            # )
            # 
            # try:
            #     sg = SendGridAPIClient(SENDGRID_API_KEY)
            #     response = sg.send(sg_message)
            #     logger.info(f"✅ Email sent to {email}: {response.status_code}")
            #     return True
            # except Exception as e:
            #     logger.error(f"❌ Email failed: {e}")
            #     return False
            
            logger.info(f"📧 EMAIL (production stub) to {email}: {title}")
            return True
        else:
            # Development: just log
            logger.info(f"📧 EMAIL (dev) to {email}: {title} - {message}")
            if link:
                logger.info(f"   Link: {link}")
            return True
    
    async def send_sms_notification(
        self,
        phone: Optional[str],
        message: str
    ) -> bool:
        """Send SMS notification"""
        
        if not phone:
            logger.warning("No phone provided")
            return False
        
        if ENVIRONMENT == "production" and TWILIO_ACCOUNT_SID:
            # TODO: Implement Twilio
            # from twilio.rest import Client
            # 
            # try:
            #     client = Client(
            #         TWILIO_ACCOUNT_SID,
            #         os.environ.get('TWILIO_AUTH_TOKEN')
            #     )
            #     
            #     sms = client.messages.create(
            #         body=message,
            #         from_=os.environ.get('TWILIO_PHONE_NUMBER'),
            #         to=phone
            #     )
            #     
            #     logger.info(f"✅ SMS sent to {phone}: {sms.sid}")
            #     return True
            # except Exception as e:
            #     logger.error(f"❌ SMS failed: {e}")
            #     return False
            
            logger.info(f"📱 SMS (production stub) to {phone}: {message}")
            return True
        else:
            # Development: just log
            logger.info(f"📱 SMS (dev) to {phone}: {message}")
            return True
    
    def _render_email_template(
        self,
        title: str,
        message: str,
        link: Optional[str] = None
    ) -> str:
        """Render HTML email template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background: #0a0a0a;
                    color: #ffffff;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 30px;
                }}
                h1 {{
                    color: #a855f7;
                    margin-top: 0;
                }}
                .message {{
                    line-height: 1.6;
                    margin: 20px 0;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: #a855f7;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    margin-top: 20px;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>{title}</h1>
                <div class="message">{message}</div>
                {f'<a href="{link}" class="button">View Details</a>' if link else ''}
                <div class="footer">
                    <p>This is an automated notification from Glassy Market</p>
                    <p>To manage your notification preferences, visit your account settings</p>
                </div>
            </div>
        </body>
        </html>
        """


# Global instance
notification_service = NotificationService()
