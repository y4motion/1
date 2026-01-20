"""
Glassy Mind - WebSocket Handler
Real-time коммуникация для чата, уведомлений и Rules Engine событий.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set, Optional
import json
import logging
import asyncio
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """Менеджер WebSocket соединений"""
    
    def __init__(self):
        # user_id -> set of websockets (один юзер может быть с нескольких устройств)
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # room_id -> set of user_ids
        self.rooms: Dict[str, Set[str]] = {}
        # websocket -> user_id (для быстрого поиска при disconnect)
        self.ws_to_user: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Подключение нового клиента"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        self.ws_to_user[websocket] = user_id
        
        logger.info(f"🔌 WebSocket connected: {user_id} (total: {self.total_connections})")
        
        # Отправляем подтверждение
        await self.send_personal(user_id, {
            "type": "connected",
            "data": {"user_id": user_id, "timestamp": datetime.now(timezone.utc).isoformat()}
        })
    
    def disconnect(self, websocket: WebSocket):
        """Отключение клиента"""
        user_id = self.ws_to_user.get(websocket)
        if user_id:
            self.active_connections.get(user_id, set()).discard(websocket)
            if not self.active_connections.get(user_id):
                del self.active_connections[user_id]
            del self.ws_to_user[websocket]
            logger.info(f"🔌 WebSocket disconnected: {user_id}")
    
    async def send_personal(self, user_id: str, message: dict):
        """Отправка сообщения конкретному пользователю"""
        connections = self.active_connections.get(user_id, set())
        disconnected = []
        
        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send to {user_id}: {e}")
                disconnected.append(ws)
        
        # Убираем мертвые соединения
        for ws in disconnected:
            self.disconnect(ws)
    
    async def broadcast(self, message: dict, exclude_user: Optional[str] = None):
        """Broadcast всем подключенным"""
        for user_id, connections in list(self.active_connections.items()):
            if user_id == exclude_user:
                continue
            await self.send_personal(user_id, message)
    
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: Optional[str] = None):
        """Broadcast в комнату (гильдия, trade диалог)"""
        users = self.rooms.get(room_id, set())
        for user_id in users:
            if user_id == exclude_user:
                continue
            await self.send_personal(user_id, message)
    
    def join_room(self, user_id: str, room_id: str):
        """Присоединение к комнате"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        self.rooms[room_id].add(user_id)
        logger.info(f"👥 {user_id} joined room {room_id}")
    
    def leave_room(self, user_id: str, room_id: str):
        """Выход из комнаты"""
        if room_id in self.rooms:
            self.rooms[room_id].discard(user_id)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        logger.info(f"👋 {user_id} left room {room_id}")
    
    @property
    def total_connections(self) -> int:
        return sum(len(conns) for conns in self.active_connections.values())
    
    def get_online_users(self) -> list:
        return list(self.active_connections.keys())


# Singleton
manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str = "guest"):
    """Основной WebSocket endpoint"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                await handle_message(websocket, user_id, message)
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": "Invalid JSON"}
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error for {user_id}: {e}")
        manager.disconnect(websocket)


async def handle_message(websocket: WebSocket, user_id: str, message: dict):
    """Обработка входящих сообщений"""
    msg_type = message.get("type")
    data = message.get("data", {})
    
    if msg_type == "chat_message":
        # Пересылаем сообщение в соответствующий режим
        mode = data.get("mode", "global")
        
        if mode == "global":
            # Broadcast всем
            await manager.broadcast({
                "type": "chat_message",
                "data": {
                    "mode": mode,
                    "user_id": user_id,
                    "text": data.get("text", ""),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            }, exclude_user=user_id)
            
        elif mode == "guilds":
            # Broadcast в гильдию
            room_id = data.get("room_id", f"guild_{data.get('guild_id', 'default')}")
            await manager.broadcast_to_room(room_id, {
                "type": "chat_message",
                "data": {
                    "mode": mode,
                    "user_id": user_id,
                    "text": data.get("text", ""),
                    "room_id": room_id,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            }, exclude_user=user_id)
            
        elif mode == "trade":
            # Приватный диалог с продавцом
            room_id = data.get("room_id") or f"trade_{data.get('seller_id', 'unknown')}"
            await manager.broadcast_to_room(room_id, {
                "type": "chat_message",
                "data": {
                    "mode": mode,
                    "user_id": user_id,
                    "text": data.get("text", ""),
                    "room_id": room_id,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            })
    
    elif msg_type == "typing":
        # Индикатор набора текста
        mode = data.get("mode")
        is_typing = data.get("isTyping", False)
        room_id = data.get("room_id")
        
        if room_id:
            await manager.broadcast_to_room(room_id, {
                "type": "typing",
                "data": {"user_id": user_id, "isTyping": is_typing}
            }, exclude_user=user_id)
    
    elif msg_type == "join_room":
        room_id = data.get("roomId")
        if room_id:
            manager.join_room(user_id, room_id)
            await websocket.send_json({
                "type": "room_joined",
                "data": {"room_id": room_id}
            })
    
    elif msg_type == "leave_room":
        room_id = data.get("roomId")
        if room_id:
            manager.leave_room(user_id, room_id)
            await websocket.send_json({
                "type": "room_left",
                "data": {"room_id": room_id}
            })
    
    elif msg_type == "ping":
        await websocket.send_json({"type": "pong", "data": {}})


# === API для триггера событий из других частей бэкенда ===

async def send_mind_event(user_id: str, event_type: str, data: dict = None):
    """
    Отправить событие Glassy Mind пользователю.
    Вызывается из Rules Engine когда нужно показать insight.
    """
    await manager.send_personal(user_id, {
        "type": "mind_event",
        "data": {
            "type": event_type,
            "data": data or {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    })


async def send_notification(user_id: str, title: str, message: str, action_url: str = None):
    """Отправить уведомление пользователю"""
    await manager.send_personal(user_id, {
        "type": "notification",
        "data": {
            "title": title,
            "message": message,
            "action_url": action_url,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    })


async def broadcast_guild_activity(guild_id: str, activity_type: str, data: dict = None):
    """Broadcast активности в гильдию"""
    room_id = f"guild_{guild_id}"
    await manager.broadcast_to_room(room_id, {
        "type": "guild_activity",
        "data": {
            "activity_type": activity_type,
            "guild_id": guild_id,
            **(data or {}),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    })


# Status endpoint
@router.get("/ws/status")
async def websocket_status():
    """Статус WebSocket сервера"""
    return {
        "success": True,
        "total_connections": manager.total_connections,
        "online_users": len(manager.active_connections),
        "active_rooms": len(manager.rooms),
        "rooms": {room_id: len(users) for room_id, users in manager.rooms.items()}
    }
