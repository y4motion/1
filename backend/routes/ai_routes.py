from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from utils.auth_utils import get_current_user
from services.core_ai import orchestrator
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict] = None


class ChatResponse(BaseModel):
    success: bool
    agent: str
    response: str
    intent: str


class ModerateRequest(BaseModel):
    content: str
    content_type: str = "comment"  # comment, review, post, message


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Чат с CORE AI — автоматический роутинг к нужному агенту.
    
    Агенты:
    - chat: Общие вопросы и общение
    - pc_builder: Сборка ПК, совместимость компонентов
    - recommender: Рекомендации товаров, поиск альтернатив
    - moderator: Модерация контента (фоновый режим)
    """
    
    try:
        # Добавить информацию о текущей странице в контекст
        context = request.context or {}
        
        result = await orchestrator.route_request(
            user_id=current_user["id"],
            message=request.message,
            context=context
        )
        
        return ChatResponse(
            success=True,
            agent=result["agent"],
            response=result["response"],
            intent=result["intent"]
        )
        
    except Exception as e:
        logger.error(f"AI chat error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Произошла ошибка при обработке запроса"
        )


@router.post("/chat/guest")
async def chat_with_ai_guest(request: ChatRequest):
    """
    Чат с CORE AI для гостей (ограниченный функционал).
    """
    
    try:
        # Гостевой user_id
        guest_id = "guest_anonymous"
        
        result = await orchestrator.route_request(
            user_id=guest_id,
            message=request.message,
            context=request.context or {}
        )
        
        return {
            "success": True,
            "agent": result["agent"],
            "response": result["response"],
            "intent": result["intent"],
            "is_guest": True
        }
        
    except Exception as e:
        logger.error(f"AI guest chat error: {e}", exc_info=True)
        return {
            "success": False,
            "response": "Извини, сейчас я немного перегружен. Попробуй позже!",
            "is_guest": True
        }


@router.post("/moderate")
async def moderate_content(
    request: ModerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Модерация контента через AI.
    
    Доступно только для модераторов и администраторов.
    """
    
    # Проверка прав доступа
    user_role = current_user.get("role", "user")
    if user_role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=403,
            detail="Недостаточно прав для модерации"
        )
    
    try:
        result = await orchestrator.moderate_content(
            content=request.content,
            content_type=request.content_type
        )
        
        return {
            "success": True,
            **result
        }
        
    except Exception as e:
        logger.error(f"Moderation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Ошибка модерации"
        )


@router.get("/agents")
async def get_available_agents():
    """Получить список доступных AI агентов"""
    
    return {
        "success": True,
        "agents": [
            {
                "id": "chat",
                "name": "Chat Agent",
                "description": "Общение и ответы на вопросы",
                "triggers": ["привет", "помоги", "как", "что"]
            },
            {
                "id": "pc_builder",
                "name": "PC Builder Agent",
                "description": "Помощь со сборкой ПК, проверка совместимости",
                "triggers": ["собрать", "сборка", "совместимость", "bottleneck"]
            },
            {
                "id": "recommender",
                "name": "Recommender Agent",
                "description": "Рекомендации товаров и поиск альтернатив",
                "triggers": ["посоветуй", "порекомендуй", "альтернатива", "что лучше"]
            },
            {
                "id": "moderator",
                "name": "Moderator Agent",
                "description": "Автоматическая модерация контента",
                "triggers": ["(автоматический)"]
            }
        ]
    }


@router.get("/status")
async def get_ai_status():
    """Проверить статус AI системы"""
    
    return {
        "success": True,
        "status": "operational",
        "orchestrator_initialized": orchestrator._initialized,
        "agents_loaded": len(orchestrator.agents) if orchestrator._initialized else 0,
        "features": {
            "chat": True,
            "recommendations": True,
            "pc_builder": True,
            "moderation": True,
            "memory": True
        }
    }
