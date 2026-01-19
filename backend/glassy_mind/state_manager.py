"""
Glassy Mind - State Manager
Singleton для управления состоянием агента в памяти.

Хранит для каждого пользователя:
- status: текущий статус агента (idle, analyzing, ready_to_suggest)
- action_count: количество действий с момента последнего сброса
- last_active: время последней активности
- suggestion: текст подсказки (если есть)
"""

from datetime import datetime, timezone
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class AgentStatus:
    """Константы статусов агента"""
    IDLE = "idle"
    ANALYZING = "analyzing"
    READY_TO_SUGGEST = "ready_to_suggest"


class MindStateManager:
    """
    Singleton менеджер состояния агента.
    
    Хранит состояние в памяти (RAM).
    В продакшене можно заменить на Redis.
    """
    _instance = None
    
    # Хранилище: {user_id: {"status": "idle", "last_active": timestamp, "action_count": 0, "suggestion": None}}
    _states: Dict[str, Dict] = {}
    
    # Порог действий для переключения в ready_to_suggest
    ACTION_THRESHOLD = 3
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            logger.info("🧠 MindStateManager initialized (Singleton)")
        return cls._instance
    
    @classmethod
    def get_instance(cls) -> "MindStateManager":
        """Получить единственный экземпляр менеджера"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def get_user_state(self, user_id: str) -> Dict:
        """
        Получить состояние пользователя.
        Если не существует — возвращает дефолтное.
        """
        if user_id not in self._states:
            return {
                "status": AgentStatus.IDLE,
                "action_count": 0,
                "last_active": None,
                "suggestion": None
            }
        return self._states[user_id].copy()
    
    def update_state(
        self, 
        user_id: str, 
        status: Optional[str] = None, 
        increment_action: bool = False,
        suggestion: Optional[str] = None
    ) -> Dict:
        """
        Обновить состояние пользователя.
        
        Args:
            user_id: ID пользователя
            status: новый статус (если нужно обновить)
            increment_action: увеличить счётчик действий
            suggestion: текст подсказки
            
        Returns:
            Обновлённое состояние
        """
        # Инициализация если пользователя нет
        if user_id not in self._states:
            self._states[user_id] = {
                "status": AgentStatus.IDLE,
                "action_count": 0,
                "last_active": datetime.now(timezone.utc),
                "suggestion": None
            }
        
        state = self._states[user_id]
        
        # Обновляем статус если передан
        if status:
            state["status"] = status
            logger.debug(f"🎯 User {user_id} status -> {status}")
        
        # Увеличиваем счётчик действий
        if increment_action:
            state["action_count"] += 1
            state["last_active"] = datetime.now(timezone.utc)
            logger.debug(f"📊 User {user_id} action_count: {state['action_count']}")
        
        # Обновляем подсказку
        if suggestion is not None:
            state["suggestion"] = suggestion
        
        return state.copy()
    
    def reset_actions(self, user_id: str):
        """Сбросить счётчик действий и статус в idle"""
        if user_id in self._states:
            self._states[user_id]["action_count"] = 0
            self._states[user_id]["status"] = AgentStatus.IDLE
            self._states[user_id]["suggestion"] = None
            logger.info(f"🔄 User {user_id} state reset to idle")
    
    def set_suggestion(self, user_id: str, suggestion: str):
        """Установить подсказку для пользователя"""
        if user_id not in self._states:
            self.update_state(user_id)
        
        self._states[user_id]["suggestion"] = suggestion
        self._states[user_id]["status"] = AgentStatus.READY_TO_SUGGEST
        logger.info(f"💡 Suggestion set for {user_id}: {suggestion[:50]}...")
    
    def clear_suggestion(self, user_id: str):
        """Очистить подсказку и сбросить статус"""
        self.reset_actions(user_id)
    
    def get_all_active_users(self) -> Dict[str, Dict]:
        """Получить всех пользователей с активным состоянием (не idle)"""
        return {
            uid: state.copy() 
            for uid, state in self._states.items() 
            if state["status"] != AgentStatus.IDLE
        }
    
    def get_stats(self) -> Dict:
        """Статистика по состояниям"""
        total = len(self._states)
        by_status = {
            AgentStatus.IDLE: 0,
            AgentStatus.ANALYZING: 0,
            AgentStatus.READY_TO_SUGGEST: 0
        }
        
        for state in self._states.values():
            status = state.get("status", AgentStatus.IDLE)
            if status in by_status:
                by_status[status] += 1
        
        return {
            "total_users": total,
            "by_status": by_status,
            "action_threshold": self.ACTION_THRESHOLD
        }


# Singleton instance для импорта
state_manager = MindStateManager.get_instance()
