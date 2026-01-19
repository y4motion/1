"""
Glassy Mind - Observer Module
Наблюдатель за поведением пользователей на платформе.

Отслеживает:
- Просмотры товаров
- Добавления в корзину
- Время на странице (dwell time)
- Паттерны навигации
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from collections import defaultdict

logger = logging.getLogger(__name__)


@dataclass
class UserSession:
    """Сессия пользователя с историей действий"""
    user_id: str
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    views: List[Dict] = field(default_factory=list)
    cart_actions: List[Dict] = field(default_factory=list)
    dwell_times: Dict[str, float] = field(default_factory=dict)
    current_page: Optional[str] = None
    page_entered_at: Optional[datetime] = None


class Observer:
    """
    Наблюдатель за действиями пользователей.
    
    Собирает данные о поведении для последующего анализа
    и формирования контекста для AI-рекомендаций.
    """
    
    def __init__(self):
        self._sessions: Dict[str, UserSession] = {}
        self._global_stats: Dict[str, Any] = defaultdict(int)
        logger.info("🔭 Observer initialized")
    
    def _get_or_create_session(self, user_id: str) -> UserSession:
        """Получить или создать сессию пользователя"""
        if user_id not in self._sessions:
            self._sessions[user_id] = UserSession(user_id=user_id)
            logger.debug(f"Created new session for user: {user_id}")
        return self._sessions[user_id]
    
    def track_user_view(
        self, 
        user_id: str, 
        product_id: str, 
        product_data: Optional[Dict] = None
    ) -> Dict:
        """
        Отслеживание просмотра товара.
        
        Args:
            user_id: ID пользователя
            product_id: ID просматриваемого товара
            product_data: Дополнительные данные о товаре (category, price, etc.)
        
        Returns:
            Dict с информацией о записанном событии
        """
        session = self._get_or_create_session(user_id)
        
        view_event = {
            "product_id": product_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": product_data or {}
        }
        
        session.views.append(view_event)
        self._global_stats["total_views"] += 1
        
        logger.info(f"👁️ View tracked: user={user_id}, product={product_id}")
        
        return {
            "event": "view",
            "user_id": user_id,
            "product_id": product_id,
            "total_views_in_session": len(session.views)
        }
    
    def track_cart_add(
        self, 
        user_id: str, 
        product_id: str, 
        quantity: int = 1,
        product_data: Optional[Dict] = None
    ) -> Dict:
        """
        Отслеживание добавления в корзину.
        
        Args:
            user_id: ID пользователя
            product_id: ID добавленного товара
            quantity: Количество
            product_data: Дополнительные данные о товаре
        
        Returns:
            Dict с информацией о записанном событии
        """
        session = self._get_or_create_session(user_id)
        
        cart_event = {
            "product_id": product_id,
            "quantity": quantity,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": product_data or {}
        }
        
        session.cart_actions.append(cart_event)
        self._global_stats["total_cart_adds"] += 1
        
        logger.info(f"🛒 Cart add tracked: user={user_id}, product={product_id}, qty={quantity}")
        
        return {
            "event": "cart_add",
            "user_id": user_id,
            "product_id": product_id,
            "quantity": quantity,
            "total_cart_actions": len(session.cart_actions)
        }
    
    def analyze_dwell_time(
        self, 
        user_id: str, 
        page_id: str, 
        action: str = "enter"
    ) -> Dict:
        """
        Анализ времени на странице (dwell time).
        
        Args:
            user_id: ID пользователя
            page_id: ID страницы (product_id или route)
            action: "enter" при входе на страницу, "leave" при уходе
        
        Returns:
            Dict с информацией о dwell time
        """
        session = self._get_or_create_session(user_id)
        now = datetime.now(timezone.utc)
        
        if action == "enter":
            # Если был на другой странице — записать время
            if session.current_page and session.page_entered_at:
                dwell_seconds = (now - session.page_entered_at).total_seconds()
                session.dwell_times[session.current_page] = dwell_seconds
                logger.debug(f"Dwell time recorded: {session.current_page} = {dwell_seconds:.1f}s")
            
            session.current_page = page_id
            session.page_entered_at = now
            
            logger.info(f"📍 Page enter: user={user_id}, page={page_id}")
            
            return {
                "event": "page_enter",
                "user_id": user_id,
                "page_id": page_id
            }
        
        elif action == "leave":
            dwell_seconds = 0.0
            if session.current_page == page_id and session.page_entered_at:
                dwell_seconds = (now - session.page_entered_at).total_seconds()
                session.dwell_times[page_id] = dwell_seconds
            
            session.current_page = None
            session.page_entered_at = None
            
            logger.info(f"📍 Page leave: user={user_id}, page={page_id}, dwell={dwell_seconds:.1f}s")
            
            return {
                "event": "page_leave",
                "user_id": user_id,
                "page_id": page_id,
                "dwell_time_seconds": dwell_seconds
            }
        
        return {"event": "unknown", "action": action}
    
    def get_user_context(self, user_id: str) -> Dict:
        """
        Получить полный контекст пользователя для AI.
        
        Returns:
            Dict с историей просмотров, корзины и временем на страницах
        """
        session = self._get_or_create_session(user_id)
        
        # Категории просмотренных товаров
        viewed_categories = []
        viewed_products = []
        for view in session.views[-20:]:  # Последние 20 просмотров
            viewed_products.append(view["product_id"])
            if "data" in view and "category" in view["data"]:
                viewed_categories.append(view["data"]["category"])
        
        # Товары в корзине
        cart_products = [ca["product_id"] for ca in session.cart_actions]
        
        # Страницы с наибольшим dwell time
        top_pages = sorted(
            session.dwell_times.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5]
        
        return {
            "user_id": user_id,
            "session_start": session.started_at.isoformat(),
            "viewed_products": viewed_products,
            "viewed_categories": list(set(viewed_categories)),
            "cart_products": cart_products,
            "top_dwell_pages": dict(top_pages),
            "total_views": len(session.views),
            "total_cart_adds": len(session.cart_actions)
        }
    
    def get_global_stats(self) -> Dict:
        """Получить глобальную статистику"""
        return {
            "total_sessions": len(self._sessions),
            "total_views": self._global_stats["total_views"],
            "total_cart_adds": self._global_stats["total_cart_adds"]
        }


# Singleton instance
observer = Observer()
