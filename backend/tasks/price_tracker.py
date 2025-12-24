from models.price_history import PriceHistory
from database import get_database
from datetime import datetime, timezone
from utils.logger import logger
import asyncio
import uuid


async def track_product_prices():
    """
    Background task: Track price changes for all products
    Runs every 6 hours
    """
    logger.info("🏷️ Starting price tracking background task...")
    
    while True:
        try:
            db = await get_database()
            
            # Get all active products
            products = await db.products.find({"status": "approved"}).to_list(length=None)
            
            logger.info(f"📊 Checking prices for {len(products)} products...")
            
            price_changes = 0
            
            for product in products:
                try:
                    # Check if price history exists
                    history = await db.price_history.find_one({"product_id": product['id']})
                    
                    if not history:
                        # Create new history
                        hist_obj = PriceHistory(product_id=product['id'])
                        hist_obj.add_price(product['price'])
                        
                        hist_dict = hist_obj.dict()
                        # Serialize timestamps
                        hist_dict['last_updated'] = hist_dict['last_updated'].isoformat()
                        for price in hist_dict['prices']:
                            price['timestamp'] = price['timestamp'].isoformat()
                        
                        await db.price_history.insert_one(hist_dict)
                    else:
                        # Check if price changed
                        last_price = history['prices'][-1]['price'] if history['prices'] else None
                        current_price = product['price']
                        
                        if last_price and last_price != current_price:
                            # Price changed! Update history
                            hist_obj = PriceHistory(**history)
                            hist_obj.add_price(current_price)
                            
                            hist_dict = hist_obj.dict()
                            hist_dict['last_updated'] = hist_dict['last_updated'].isoformat()
                            for price in hist_dict['prices']:
                                price['timestamp'] = price['timestamp'].isoformat()
                            
                            await db.price_history.update_one(
                                {"product_id": product['id']},
                                {"$set": hist_dict}
                            )
                            
                            price_changes += 1
                            logger.info(
                                f"💰 Price change detected: {product.get('name', product.get('title', 'Unknown'))} "
                                f"${last_price:.2f} → ${current_price:.2f}"
                            )
                            
                            # If price dropped, notify users with this in wishlist
                            if current_price < last_price:
                                await notify_price_drop(product['id'], product.get('name', product.get('title', 'Product')), last_price, current_price)
                            
                            # Check price alerts for this product
                            if current_price < last_price:
                                await check_price_alerts_for_product(product, current_price)
                
                except Exception as e:
                    logger.error(f"Error tracking price for product {product.get('id')}: {e}")
            
            logger.info(
                f"✅ Price tracking completed: {len(products)} products checked, "
                f"{price_changes} price changes detected"
            )
            
        except Exception as e:
            logger.error(f"❌ Price tracking error: {e}", exc_info=True)
        
        # Wait 6 hours
        await asyncio.sleep(6 * 3600)


async def notify_price_drop(product_id: str, product_name: str, old_price: float, new_price: float):
    """Notify users when price drops"""
    try:
        db = await get_database()
        
        # Find all users with this product in wishlist
        users_with_product = await db.users.find({
            "wishlist": product_id
        }).to_list(length=None)
        
        if not users_with_product:
            return
        
        drop_percent = ((old_price - new_price) / old_price) * 100
        
        for user in users_with_product:
            notification_dict = {
                'id': str(uuid.uuid4()),
                'user_id': user['id'],
                'type': 'price_drop',
                'title': f'Price Drop Alert! 🔥',
                'message': f"{product_name} dropped {drop_percent:.0f}% to ${new_price:.2f}",
                'link': f'/product/{product_id}',
                'is_read': False,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'metadata': {
                    'product_id': product_id,
                    'old_price': old_price,
                    'new_price': new_price,
                    'drop_percent': drop_percent
                }
            }
            
            await db.notifications.insert_one(notification_dict)
        
        logger.info(f"📬 Sent price drop notifications to {len(users_with_product)} users")
        
    except Exception as e:
        logger.error(f"Error sending price drop notifications: {e}")


async def check_price_alerts_for_product(product: dict, current_price: float):
    """Check and trigger price alerts for a specific product"""
    try:
        db = await get_database()
        
        # Get all active alerts for this product
        alerts = await db.price_alerts.find({
            "product_id": product['id'],
            "enabled": True,
            "triggered": False
        }).to_list(length=None)
        
        if not alerts:
            return
        
        triggered_count = 0
        
        for alert in alerts:
            should_trigger = False
            
            # Check target price condition
            if alert.get("target_price"):
                if current_price <= alert["target_price"]:
                    should_trigger = True
            
            # Check price drop percentage condition
            elif alert.get("price_drop_percent"):
                original_price = alert.get("original_price", 0)
                if original_price > 0:
                    price_drop = ((original_price - current_price) / original_price) * 100
                    if price_drop >= alert["price_drop_percent"]:
                        should_trigger = True
            
            if should_trigger:
                # Send notifications based on user preferences
                await send_price_alert_notification(alert, product, current_price)
                
                # Mark alert as triggered
                await db.price_alerts.update_one(
                    {"id": alert["id"]},
                    {"$set": {
                        "triggered": True,
                        "triggered_at": datetime.now(timezone.utc).isoformat(),
                        "triggered_price": current_price
                    }}
                )
                
                triggered_count += 1
        
        if triggered_count > 0:
            logger.info(f"🔔 Triggered {triggered_count} price alerts for product {product.get('title', product['id'])}")
        
    except Exception as e:
        logger.error(f"Error checking price alerts: {e}")


async def send_price_alert_notification(alert: dict, product: dict, new_price: float):
    """Send price alert notification via configured methods"""
    try:
        db = await get_database()
        
        methods = alert.get("notification_methods", {})
        user = await db.users.find_one({"id": alert["user_id"]})
        
        if not user:
            return
        
        product_name = product.get('title', product.get('name', 'Product'))
        original_price = alert.get("original_price", 0)
        
        # Calculate savings
        if original_price > 0:
            savings = original_price - new_price
            drop_percent = ((original_price - new_price) / original_price) * 100
        else:
            savings = 0
            drop_percent = 0
        
        # Push notification (in-app)
        if methods.get("push", True):
            notification_dict = {
                'id': str(uuid.uuid4()),
                'user_id': user['id'],
                'type': 'price_alert',
                'title': '🔥 Price Drop Alert!',
                'message': f"{product_name} is now ${new_price:.2f}! Save ${savings:.2f} ({drop_percent:.0f}% off)",
                'link': f"/product/{product['id']}",
                'is_read': False,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'metadata': {
                    'product_id': product['id'],
                    'original_price': original_price,
                    'new_price': new_price,
                    'savings': savings,
                    'drop_percent': drop_percent,
                    'alert_id': alert['id']
                }
            }
            
            await db.notifications.insert_one(notification_dict)
            logger.info(f"📬 Sent push notification to user {user['id']} for price alert")
        
        # Email notification
        if methods.get("email") and user.get("email"):
            # TODO: Integrate with email service (SendGrid, etc.)
            logger.info(f"📧 Email notification queued for {user['email']} (not implemented)")
        
        # SMS notification (premium feature)
        if methods.get("sms") and user.get("phone"):
            # TODO: Integrate with SMS service (Twilio, etc.)
            logger.info(f"📱 SMS notification queued for {user['phone']} (not implemented)")
        
    except Exception as e:
        logger.error(f"Error sending price alert notification: {e}")
