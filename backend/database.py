from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


async def get_database():
    """Get database instance"""
    return db


async def create_indexes():
    """Create database indexes for performance optimization"""
    logger.info("🔧 Creating database indexes...")
    
    try:
        # Products indexes
        await db.products.create_index([("name", "text"), ("description", "text")])  # Full-text search
        await db.products.create_index("category_id")
        await db.products.create_index("sub_category_id")
        await db.products.create_index("persona_id")
        await db.products.create_index([("price", 1)])  # Ascending
        await db.products.create_index([("created_at", -1)])  # Descending
        await db.products.create_index([("rating", -1)])
        await db.products.create_index([("status", 1)])
        await db.products.create_index([("view_count", -1)])
        
        # Compound index for complex queries
        await db.products.create_index([
            ("status", 1),
            ("category_id", 1),
            ("price", 1)
        ])
        
        # Users indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        await db.users.create_index([("level", -1)])
        await db.users.create_index("is_seller")
        await db.users.create_index("is_verified_creator")
        
        # Posts indexes (Feed)
        await db.posts.create_index([("created_at", -1)])
        await db.posts.create_index("user_id")
        await db.posts.create_index([("likes", -1)])
        await db.posts.create_index("is_hidden")
        
        # Articles indexes
        await db.articles.create_index([("published_at", -1)])
        await db.articles.create_index("status")
        await db.articles.create_index("category")
        await db.articles.create_index([("views", -1)])
        await db.articles.create_index("is_featured")
        
        # Reviews indexes
        await db.reviews.create_index("product_id")
        await db.reviews.create_index([("rating", -1)])
        await db.reviews.create_index([("helpful_count", -1)])
        await db.reviews.create_index("status")
        
        # Questions indexes
        await db.questions.create_index("product_id")
        await db.questions.create_index([("created_at", -1)])
        
        # Proposals indexes (Voting)
        await db.proposals.create_index("status")
        await db.proposals.create_index([("weighted_score", -1)])
        await db.proposals.create_index([("created_at", -1)])
        
        # User Stats indexes
        await db.user_stats.create_index("user_id", unique=True)
        await db.user_stats.create_index([("monthly_rp", -1)])
        await db.user_stats.create_index([("total_xp", -1)])
        
        # Group Buys indexes
        await db.groupbuys.create_index("status")
        await db.groupbuys.create_index([("deadline", 1)])
        await db.groupbuys.create_index([("current_participants", -1)])
        
        # Creator Profiles indexes
        await db.creator_profiles.create_index("user_id")
        await db.creator_profiles.create_index("is_verified")
        await db.creator_profiles.create_index([("total_views", -1)])
        
        logger.info("✅ Database indexes created successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error creating indexes: {e}")


async def close_mongo_connection():
    """Close MongoDB connection"""
    client.close()
