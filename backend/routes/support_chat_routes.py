from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, status
from typing import List, Dict, Optional
from datetime import datetime, timezone
from database import db
from models.support_chat import (
    SupportChatSession,
    SupportChatSessionCreate,
    SupportChatSessionResponse,
    SendSupportMessageRequest,
    SupportMessage,
    SupportMessageResponse
)
from utils.auth_utils import get_current_user, get_current_user_optional
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import AI chat integration
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter()

# Store active WebSocket connections
active_connections: Dict[str, List[WebSocket]] = {}


# AI Bot Helper
async def get_ai_response(user_message: str, session_id: str, user_id: Optional[str], language: str = 'en') -> str:
    """
    Generate AI response using OpenAI GPT-4o via emergentintegrations
    Responds in the specified language (en or ru)
    """
    try:
        api_key = os.getenv("EMERGENT_LLM_KEY")
        
        # System message with context - language specific
        if language == 'ru':
            system_message = """Ты полезный AI помощник службы поддержки игрового/технологического маркетплейса "Minimal Market". 
Твоя роль:
1. Отвечать на вопросы о товарах в каталоге (компоненты ПК, периферия, аудиооборудование и т.д.)
2. Помогать с вопросами по заказам
3. Предоставлять техническую поддержку и рекомендации по продуктам
4. Отвечать на общие вопросы о сайте

Будь дружелюбным, кратким и полезным. Всегда отвечай на русском языке.
Если не знаешь что-то, будь честным и предложи связаться с менеджером.

Доступные категории товаров:
- Компоненты ПК (процессоры, видеокарты, память, накопители, материнские платы, блоки питания, корпуса, охлаждение)
- Периферия (клавиатуры, мыши, гарнитуры, мониторы, веб-камеры, микрофоны)
- Аудиооборудование (наушники, колонки, ЦАПы, усилители)
- Сетевое оборудование (роутеры, Wi-Fi адаптеры, кабели)
- Умный дом
- Игровые аксессуары
- Оборудование для стриминга
- Мобильные аксессуары
- Офисное оборудование"""
        else:
            system_message = """You are a helpful AI support assistant for a gaming/tech e-commerce marketplace called "Minimal Market". 
Your role is to:
1. Answer questions about products in our catalog (PC components, peripherals, audio equipment, etc.)
2. Help with order-related inquiries
3. Provide technical support and product recommendations
4. Answer general questions about the website

Be friendly, concise, and helpful. Always respond in English.
If you don't know something, be honest and suggest contacting a human manager.

Available product categories:
- PC Components (CPUs, GPUs, RAM, Storage, Motherboards, PSUs, Cases, Cooling)
- Peripherals (Keyboards, Mice, Headsets, Monitors, Webcams, Microphones)
- Audio Equipment (Headphones, Speakers, DACs, Amplifiers)
- Networking (Routers, Wi-Fi adapters, Cables)
- Smart Home devices
- Gaming accessories
- Streaming equipment
- Mobile accessories
- Office equipment"""

        # Initialize AI chat
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Create user message
        user_msg = UserMessage(text=user_message)
        
        # Get AI response
        response = await chat.send_message(user_msg)
        
        return response
        
    except Exception as e:
        print(f"AI response error: {str(e)}")
        if language == 'ru':
            return "Извините, у меня возникли проблемы с обработкой вашего запроса. Пожалуйста, попробуйте еще раз или свяжитесь с нашей службой поддержки."
        return "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team for assistance."


@router.websocket("/ws/support-chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time support chat
    """
    await websocket.accept()
    
    # Add connection to active connections
    if session_id not in active_connections:
        active_connections[session_id] = []
    active_connections[session_id].append(websocket)
    
    try:
        # Send welcome message
        welcome_msg = {
            "type": "system",
            "message": "Connected to support chat. How can I help you today?",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await websocket.send_json(welcome_msg)
        
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            message_text = data.get("message", "")
            user_id = data.get("user_id")
            
            if not message_text:
                continue
            
            # Save user message to database
            session = await db.support_chat_sessions.find_one({"id": session_id})
            if not session:
                # Create new session
                new_session = SupportChatSession(
                    id=session_id,
                    user_id=user_id
                )
                session_dict = new_session.model_dump()
                session_dict['created_at'] = session_dict['created_at'].isoformat()
                session_dict['updated_at'] = session_dict['updated_at'].isoformat()
                await db.support_chat_sessions.insert_one(session_dict)
                session = session_dict
            
            # Create user message
            user_message = SupportMessage(
                sender="user",
                text=message_text
            )
            
            # Update session with user message
            user_msg_dict = user_message.model_dump()
            user_msg_dict['timestamp'] = user_msg_dict['timestamp'].isoformat()
            
            await db.support_chat_sessions.update_one(
                {"id": session_id},
                {
                    "$push": {"messages": user_msg_dict},
                    "$set": {
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                        "unread_count": 0  # User is active, so no unread
                    }
                }
            )
            
            # Broadcast user message to all connections in this session
            for connection in active_connections[session_id]:
                await connection.send_json({
                    "type": "user_message",
                    "message": user_message.model_dump(mode='json'),
                    "timestamp": user_message.timestamp.isoformat()
                })
            
            # Get AI response
            ai_response_text = await get_ai_response(message_text, session_id, user_id)
            
            # Create bot message
            bot_message = SupportMessage(
                sender="bot",
                text=ai_response_text
            )
            
            # Update session with bot message
            bot_msg_dict = bot_message.model_dump()
            bot_msg_dict['timestamp'] = bot_msg_dict['timestamp'].isoformat()
            
            await db.support_chat_sessions.update_one(
                {"id": session_id},
                {
                    "$push": {"messages": bot_msg_dict},
                    "$set": {
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Broadcast bot message to all connections
            for connection in active_connections[session_id]:
                await connection.send_json({
                    "type": "bot_message",
                    "message": bot_message.model_dump(mode='json'),
                    "timestamp": bot_message.timestamp.isoformat()
                })
            
    except WebSocketDisconnect:
        # Remove connection
        active_connections[session_id].remove(websocket)
        if not active_connections[session_id]:
            del active_connections[session_id]
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        active_connections[session_id].remove(websocket)


@router.post("/support-chat/sessions", response_model=SupportChatSessionResponse)
async def create_support_chat_session(
    session_data: SupportChatSessionCreate,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Create a new support chat session
    """
    user_id = current_user.get("id") if current_user else None
    
    session = SupportChatSession(
        user_id=user_id,
        title=session_data.title or "New Chat"
    )
    
    session_dict = session.model_dump()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['updated_at'] = session_dict['updated_at'].isoformat()
    
    await db.support_chat_sessions.insert_one(session_dict)
    
    return SupportChatSessionResponse(
        id=session.id,
        user_id=session.user_id,
        title=session.title,
        messages_count=0,
        created_at=session.created_at,
        updated_at=session.updated_at,
        unread_count=0
    )


@router.get("/support-chat/sessions", response_model=List[SupportChatSessionResponse])
async def get_support_chat_sessions(
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Get all support chat sessions for current user
    """
    user_id = current_user.get("id") if current_user else None
    
    if not user_id:
        # For anonymous users, can't retrieve sessions without session_token
        return []
    
    sessions = await db.support_chat_sessions.find(
        {"user_id": user_id, "is_active": True}
    ).sort("updated_at", -1).to_list(length=50)
    
    result = []
    for session in sessions:
        messages = session.get('messages', [])
        last_msg = messages[-1]['text'] if messages else None
        last_msg_time = messages[-1]['timestamp'] if messages else None
        
        result.append(SupportChatSessionResponse(
            id=session['id'],
            user_id=session['user_id'],
            title=session['title'],
            messages_count=len(messages),
            created_at=datetime.fromisoformat(session['created_at']),
            updated_at=datetime.fromisoformat(session['updated_at']),
            unread_count=session.get('unread_count', 0),
            last_message=last_msg,
            last_message_time=datetime.fromisoformat(last_msg_time) if last_msg_time else None
        ))
    
    return result


@router.get("/support-chat/sessions/{session_id}", response_model=Dict)
async def get_support_chat_session(session_id: str):
    """
    Get specific support chat session with messages
    """
    session = await db.support_chat_sessions.find_one({"id": session_id})
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return session


@router.delete("/support-chat/sessions/{session_id}")
async def delete_support_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Delete (deactivate) a support chat session
    """
    user_id = current_user.get("id") if current_user else None
    
    session = await db.support_chat_sessions.find_one({"id": session_id})
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    # Verify ownership (if user is logged in)
    if user_id and session.get('user_id') != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this chat"
        )
    
    # Soft delete
    await db.support_chat_sessions.update_one(
        {"id": session_id},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Chat session deleted successfully"}


@router.put("/support-chat/sessions/{session_id}/mark-read")
async def mark_session_read(session_id: str):
    """
    Mark all messages in session as read
    """
    result = await db.support_chat_sessions.update_one(
        {"id": session_id},
        {"$set": {"unread_count": 0}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return {"message": "Messages marked as read"}
