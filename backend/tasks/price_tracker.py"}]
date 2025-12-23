from models.price_history import PriceHistory
from database import get_database
from datetime import datetime, timezone
from utils.logger import logger
import asyncio


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
                                f"💰 Price change detected: {product['name']} "
                                f"${last_price:.2f} → ${current_price:.2f}"
                            )
                            
                            # If price dropped, notify users with this in wishlist
                            if current_price < last_price:
                                await notify_price_drop(product['id'], product['name'], last_price, current_price)
                
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
