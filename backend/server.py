from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# Import database connection
from database import db, close_mongo_connection, client, create_indexes

# Import auth routes
from routes.auth_routes import router as auth_router
from routes.product_routes import router as product_router
from routes.category_routes import router as category_router
from routes.review_routes import router as review_router
from routes.question_routes import router as question_router
from routes.cart_routes import router as cart_router
from routes.order_routes import router as order_router
from routes.payment_settings_routes import router as payment_settings_router
from routes.checkout_routes import router as checkout_router
from routes.bag_routes import router as bag_router
from routes.wishlist_routes import router as wishlist_router
from routes.saved_routes import router as saved_router
from routes.catalog_routes import router as catalog_router
from routes.support_chat_routes import router as support_chat_router
from routes.pc_build_routes import router as pc_build_router

# Import new social/community routes
from routes.feed_routes import router as feed_router
from routes.article_routes import router as article_router
from routes.creator_routes import router as creator_router
from routes.voting_routes import router as voting_router
from routes.rating_routes import router as rating_router
from routes.groupbuy_routes import router as groupbuy_router
from routes.logging_routes import router as logging_router
from routes.monitoring_routes import router as monitoring_router
from routes.notification_routes import router as notification_router

# Import middleware
from middleware.logging_middleware import RequestLoggingMiddleware

# Import background tasks
from tasks.price_tracker import track_product_prices
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include auth routes in api router
api_router.include_router(auth_router)
api_router.include_router(product_router)
api_router.include_router(category_router)
api_router.include_router(review_router)
api_router.include_router(question_router)
api_router.include_router(cart_router)
api_router.include_router(order_router)
api_router.include_router(payment_settings_router)
api_router.include_router(checkout_router)
api_router.include_router(bag_router)
api_router.include_router(wishlist_router)
api_router.include_router(saved_router)
api_router.include_router(catalog_router)
api_router.include_router(support_chat_router)
api_router.include_router(pc_build_router)

# Include new social/community routes
api_router.include_router(feed_router)
api_router.include_router(article_router)
api_router.include_router(creator_router)
api_router.include_router(voting_router)
api_router.include_router(rating_router)
api_router.include_router(groupbuy_router)
api_router.include_router(logging_router)
api_router.include_router(monitoring_router)
api_router.include_router(notification_router)

# Include the router in the main app
app.include_router(api_router)

# Add logging middleware
app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Allow all origins for development
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


@app.on_event("startup")
async def startup_db_indexes():
    """Create database indexes and start background tasks on startup"""
    await create_indexes()
    
    # Start background tasks
    asyncio.create_task(track_product_prices())
    logger.info("🚀 Background tasks started: price_tracker")