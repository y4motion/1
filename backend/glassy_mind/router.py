"""
Glassy Mind - API Router
Эндпоинты для взаимодействия фронтенда с "мозгом".
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import logging

from utils.auth_utils import get_current_user, get_current_user_optional as get_optional_user
from .observer import observer
from .expert_brain import tech_expert

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


# ==================== Tracking Endpoints ====================

@router.post("/track/view")
async def track_view(
    request: TrackViewRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Отслеживание просмотра товара.
    
    Работает как для авторизованных, так и для гостей.
    """
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    result = observer.track_user_view(
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
    """
    Отслеживание добавления в корзину.
    """
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    result = observer.track_cart_add(
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
    """
    Отслеживание времени на странице.
    
    Вызывается при входе на страницу (action="enter")
    и при уходе (action="leave").
    """
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    result = observer.analyze_dwell_time(
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
    """
    Полный анализ поведения пользователя.
    
    Возвращает:
    - Контекст пользователя (просмотры, корзина, dwell time)
    - Персональные предложения (если include_suggestions=true)
    - Проверка совместимости (если include_compatibility=true)
    """
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    # Получаем контекст
    user_context = observer.get_user_context(user_id)
    
    response = {
        "success": True,
        "user_id": user_id,
        "context": user_context
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
    
    logger.info(f"🔮 Full analysis for user {user_id}")
    
    return response


@router.post("/compatibility")
async def check_compatibility(request: CompatibilityRequest):
    """
    Проверка совместимости списка компонентов.
    
    Не требует авторизации — можно использовать в конфигураторе.
    """
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
    """
    Получить персональные предложения.
    
    Быстрый эндпоинт для получения только рекомендаций.
    """
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    user_context = observer.get_user_context(user_id)
    suggestions = tech_expert.generate_suggestion(user_context)
    
    return {
        "success": True,
        **suggestions
    }


# ==================== Status & Debug Endpoints ====================

@router.get("/status")
async def get_mind_status():
    """
    Получить статус Glassy Mind.
    """
    return {
        "success": True,
        "status": "operational",
        "components": {
            "observer": observer.get_global_stats(),
            "expert": tech_expert.get_expert_status()
        },
        "endpoints": [
            "POST /api/mind/track/view",
            "POST /api/mind/track/cart",
            "POST /api/mind/track/dwell",
            "POST /api/mind/analyze",
            "POST /api/mind/compatibility",
            "GET /api/mind/suggestions",
            "GET /api/mind/status",
            "GET /api/mind/context"
        ]
    }


@router.get("/context")
async def get_user_context(
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Получить сырой контекст пользователя.
    
    Полезно для отладки и понимания, что видит система.
    """
    user_id = current_user["id"] if current_user else "guest_anonymous"
    
    context = observer.get_user_context(user_id)
    
    return {
        "success": True,
        "context": context
    }
