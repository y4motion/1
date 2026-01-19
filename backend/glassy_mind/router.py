"""
Glassy Mind - API Router
Эндпоинты для взаимодействия фронтенда с "мозгом".
Includes A/B testing, Deepseek AI integration, and Abandoned Cart webhooks.
"""

from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import logging

from utils.auth_utils import get_current_user, get_current_user_optional as get_optional_user
from .observer import observer
from .expert_brain import tech_expert
from .chat_agent import mind_chat_agent
from .abandoned_cart import abandoned_cart_webhook

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mind", tags=["glassy-mind"])


# ==================== Pydantic Models ====================

class TrackViewRequest(BaseModel):
    """Запрос на отслеживание просмотра"""
    product_id: str
    product_data: Optional[Dict] = None


class TrackCartRequest(BaseModel):
    """Запрос на отслеживание добавления в корзину"""
    product_id: str
    quantity: int = 1
    product_data: Optional[Dict] = None


class DwellTimeRequest(BaseModel):
    """Запрос на отслеживание времени на странице"""
    page_id: str
    action: str = Field(..., pattern="^(enter|leave)$")


class CompatibilityRequest(BaseModel):
    """Запрос на проверку совместимости"""
    products: List[Dict] = Field(..., min_length=1)


class AnalyzeRequest(BaseModel):
    """Запрос на полный анализ"""
    include_suggestions: bool = True
    include_compatibility: bool = False
    products_for_compatibility: Optional[List[Dict]] = None


class ChatRequest(BaseModel):
    """Запрос на AI чат"""
    message: str = Field(..., min_length=1, max_length=500)
    product_info: Optional[Dict] = None


# ==================== Tracking Endpoints ====================

@router.post("/track/view")
async def track_view(
    request: TrackViewRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Отслеживание просмотра товара с сохранением в MongoDB."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    result = await observer.track_user_view(
        user_id=user_id,
        product_id=request.product_id,
        product_data=request.product_data
    )
    
    return {
        "success": True,
        "data": result
    }


@router.post("/track/cart")
async def track_cart_add(
    request: TrackCartRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Отслеживание добавления в корзину."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    result = await observer.track_cart_add(
        user_id=user_id,
        product_id=request.product_id,
        quantity=request.quantity,
        product_data=request.product_data
    )
    
    return {
        "success": True,
        "data": result
    }


@router.post("/track/dwell")
async def track_dwell_time(
    request: DwellTimeRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Отслеживание времени на странице."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    result = await observer.analyze_dwell_time(
        user_id=user_id,
        page_id=request.page_id,
        action=request.action
    )
    
    return {
        "success": True,
        "data": result
    }


# ==================== Analysis Endpoints ====================

@router.post("/analyze")
async def analyze_user_behavior(
    request: AnalyzeRequest = Body(default=AnalyzeRequest()),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Полный анализ поведения пользователя с учётом A/B группы."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    # Получаем контекст
    user_context = await observer.get_user_context(user_id)
    
    response = {
        "success": True,
        "user_id": user_id,
        "context": user_context,
        "ab_group": user_context.get("ab_group", "A")
    }
    
    # Генерируем предложения
    if request.include_suggestions:
        suggestions = tech_expert.generate_suggestion(user_context)
        response["suggestions"] = suggestions
    
    # Проверяем совместимость
    if request.include_compatibility and request.products_for_compatibility:
        compatibility = tech_expert.evaluate_compatibility(
            request.products_for_compatibility
        )
        response["compatibility"] = {
            "level": compatibility.level.value,
            "score": compatibility.score,
            "issues": compatibility.issues,
            "suggestions": compatibility.suggestions,
            "details": compatibility.details
        }
    
    logger.info(f"🔮 Full analysis for user {user_id} (AB group: {user_context.get('ab_group')})")
    
    return response


@router.post("/compatibility")
async def check_compatibility(request: CompatibilityRequest):
    """Проверка совместимости списка компонентов."""
    result = tech_expert.evaluate_compatibility(request.products)
    
    return {
        "success": True,
        "compatibility": {
            "level": result.level.value,
            "score": result.score,
            "issues": result.issues,
            "suggestions": result.suggestions,
            "details": result.details
        }
    }


@router.get("/suggestions")
async def get_suggestions(
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Получить персональные предложения."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    user_context = await observer.get_user_context(user_id)
    suggestions = tech_expert.generate_suggestion(user_context)
    
    return {
        "success": True,
        **suggestions
    }


# ==================== AI Chat Endpoints ====================

@router.post("/chat")
async def ai_chat(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    AI-powered chat endpoint using Deepseek.
    
    Generates contextual responses based on:
    - User's message
    - Current product info
    - User's browsing history
    - A/B test group
    """
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    # Get user context
    user_context = await observer.get_user_context(user_id)
    
    # Product info (from request or default)
    product_info = request.product_info or {}
    
    # Generate AI response
    result = await mind_chat_agent.generate_response(
        user_message=request.message,
        product_info=product_info,
        user_context=user_context
    )
    
    if result["success"]:
        return {
            "success": True,
            "response": result["response"],
            "is_ai": True,
            "model": result.get("model"),
            "tokens_used": result.get("tokens_used", 0),
            "ab_group": user_context.get("ab_group", "A")
        }
    else:
        # Fallback to quick suggestion
        quick_response = await mind_chat_agent.get_quick_suggestion(
            product_info=product_info,
            user_context=user_context
        )
        
        return {
            "success": True,
            "response": quick_response or "Извините, не могу ответить на этот вопрос. Обратитесь в поддержку.",
            "is_ai": False,
            "fallback": True,
            "error": result.get("error")
        }


@router.post("/quick-tip")
async def get_quick_tip(
    product_info: Dict = Body(default={}),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get quick contextual tip without full AI call."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    user_context = await observer.get_user_context(user_id)
    
    tip = await mind_chat_agent.get_quick_suggestion(
        product_info=product_info,
        user_context=user_context
    )
    
    return {
        "success": True,
        "tip": tip,
        "ab_group": user_context.get("ab_group", "A")
    }


# ==================== A/B Testing Endpoints ====================

@router.get("/ab-test/results")
async def get_ab_test_results():
    """
    Get A/B test results for recommendation strategies.
    
    Compares conversion rates between groups A and B.
    """
    results = await observer.get_ab_test_results()
    
    return {
        "success": True,
        "results": results,
        "description": {
            "group_a": "Direct product recommendations",
            "group_b": "Question-based engagement"
        }
    }


@router.get("/ab-test/my-group")
async def get_my_ab_group(
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get current user's A/B test group."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    user_context = await observer.get_user_context(user_id)
    
    return {
        "success": True,
        "user_id": user_id,
        "ab_group": user_context.get("ab_group", "A"),
        "strategy": "direct_recommendations" if user_context.get("ab_group") == "A" else "question_engagement"
    }


# ==================== Status & Debug Endpoints ====================

@router.get("/status")
async def get_mind_status():
    """Получить статус Glassy Mind."""
    global_stats = await observer.get_global_stats()
    
    return {
        "success": True,
        "status": "operational",
        "components": {
            "observer": global_stats,
            "expert": tech_expert.get_expert_status(),
            "ai_chat": {
                "enabled": mind_chat_agent.enabled,
                "model": mind_chat_agent.model if mind_chat_agent.enabled else None
            }
        },
        "features": {
            "mongodb_persistence": global_stats.get("storage") == "mongodb",
            "deepseek_ai": mind_chat_agent.enabled,
            "ab_testing": True
        },
        "endpoints": [
            "POST /api/mind/track/view",
            "POST /api/mind/track/cart",
            "POST /api/mind/track/dwell",
            "POST /api/mind/analyze",
            "POST /api/mind/compatibility",
            "POST /api/mind/chat",
            "POST /api/mind/quick-tip",
            "GET /api/mind/suggestions",
            "GET /api/mind/status",
            "GET /api/mind/context",
            "GET /api/mind/ab-test/results",
            "GET /api/mind/ab-test/my-group"
        ]
    }


@router.get("/context")
async def get_user_context(
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Получить сырой контекст пользователя."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    context = await observer.get_user_context(user_id)
    
    return {
        "success": True,
        "context": context
    }


@router.get("/analytics/events")
async def get_recent_events(
    limit: int = 50,
    event_type: Optional[str] = None
):
    """Get recent behavior events for analytics."""
    await observer._ensure_db()
    
    if observer._db is None:
        return {"success": False, "error": "MongoDB required"}
    
    query = {}
    if event_type:
        query["event_type"] = event_type
    
    events = await observer._db.behavior_events.find(
        query,
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {
        "success": True,
        "events": events,
        "count": len(events)
    }



# ==================== Abandoned Cart Endpoints ====================

class TrackCartForAbandonmentRequest(BaseModel):
    """Request to track cart for abandonment detection"""
    products: List[Dict]
    user_email: Optional[str] = None


@router.post("/cart/track-abandonment")
async def track_cart_for_abandonment(
    request: TrackCartForAbandonmentRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Track cart contents for abandonment detection.
    Called when cart is updated.
    """
    user_id = current_user["id"] if current_user else "guest_anonymous"
    user_email = request.user_email or (current_user.get("email") if current_user else None)
    
    await abandoned_cart_webhook.track_cart_activity(
        user_id=user_id,
        products=request.products,
        user_email=user_email
    )
    
    return {
        "success": True,
        "message": "Cart tracked for abandonment detection",
        "products_count": len(request.products)
    }


@router.post("/cart/converted")
async def mark_cart_converted(
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Mark cart as converted (purchase completed)."""
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    await abandoned_cart_webhook.mark_cart_converted(user_id)
    
    return {
        "success": True,
        "message": "Cart marked as converted"
    }


@router.post("/cart/check-abandoned")
async def check_abandoned_carts(background_tasks: BackgroundTasks):
    """
    Check for abandoned carts and trigger webhooks.
    Can be called manually or via cron job.
    """
    triggered = await abandoned_cart_webhook.check_abandoned_carts()
    
    return {
        "success": True,
        "abandoned_carts_found": len(triggered),
        "details": triggered
    }


@router.get("/cart/abandoned-stats")
async def get_abandoned_cart_stats():
    """Get statistics about abandoned carts."""
    stats = await abandoned_cart_webhook.get_abandoned_cart_stats()
    
    return {
        "success": True,
        "stats": stats
    }


@router.get("/cart/recent-abandoned")
async def get_recent_abandoned_carts(limit: int = 10):
    """Get recent abandoned carts for dashboard."""
    carts = await abandoned_cart_webhook.get_recent_abandoned(limit)
    
    return {
        "success": True,
        "abandoned_carts": carts,
        "count": len(carts)
    }
