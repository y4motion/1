"""
Glassy Mind - Observer Module with MongoDB Persistence
Наблюдатель за поведением пользователей на платформе.

Отслеживает:
- Просмотры товаров
- Добавления в корзину
- Время на странице (dwell time)
- Паттерны навигации

Данные сохраняются в MongoDB для аналитики и персонализации.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict
import asyncio

from .state_manager import MindStateManager, AgentStatus, state_manager
from .rules_engine import rules_engine, TriggerType, RuleReaction

logger = logging.getLogger(__name__)


class MarketObserver:
    """
    Наблюдатель за событиями маркетплейса.
    Отслеживает действия и управляет переключением статусов агента.
    Интегрирован с RulesEngine для умного вмешательства.
    """
    
    def __init__(self):
        self.state_manager = MindStateManager.get_instance()
        self.rules_engine = rules_engine
        logger.info("👁️ MarketObserver initialized with RulesEngine")
    
    async def process_event(
        self, 
        user_id: str, 
        event_type: str, 
        metadata: Optional[Dict] = None,
        user_context: Optional[Dict] = None
    ) -> Dict:
        """
        Анализирует событие пользователя через RulesEngine.
        
        Args:
            user_id: ID пользователя
            event_type: Тип события (view, click, filter, cart_add, etc.)
            metadata: Дополнительные данные о событии
            user_context: Полный контекст пользователя (если есть)
            
        Returns:
            Dict с status, suggestion, rule_triggered
        """
        # 1. Обновляем счётчик действий
        current_state = self.state_manager.update_state(user_id, increment_action=True)
        count = current_state["action_count"]
        
        logger.info(f"📡 Event: {event_type} from {user_id} (action #{count})")
        
        # 2. Прогоняем через RulesEngine если есть контекст
        rule_reaction = None
        if user_context:
            rule_reaction = self.rules_engine.evaluate(user_context)
        
        # 3. Если правило сработало — используем его реакцию
        if rule_reaction:
            status = self._trigger_type_to_status(rule_reaction.trigger_type)
            self.state_manager.update_state(
                user_id,
                status=status,
                suggestion=rule_reaction.message
            )
            
            return {
                "status": status,
                "suggestion": rule_reaction.message,
                "rule_triggered": True,
                "rule_metadata": rule_reaction.metadata,
                "action_count": count
            }
        
        # 4. Fallback на простую логику по порогу
        if count == 1:
            self.state_manager.update_state(user_id, status=AgentStatus.ANALYZING)
            return {
                "status": AgentStatus.ANALYZING,
                "suggestion": None,
                "rule_triggered": False,
                "action_count": count
            }
        
        elif count >= self.state_manager.ACTION_THRESHOLD:
            suggestion = self._generate_suggestion(event_type, metadata)
            self.state_manager.update_state(
                user_id, 
                status=AgentStatus.READY_TO_SUGGEST,
                suggestion=suggestion
            )
            return {
                "status": AgentStatus.READY_TO_SUGGEST,
                "suggestion": suggestion,
                "rule_triggered": False,
                "action_count": count
            }
        
        return {
            "status": AgentStatus.ANALYZING,
            "suggestion": None,
            "rule_triggered": False,
            "action_count": count
        }
    
    def _trigger_type_to_status(self, trigger_type: TriggerType) -> str:
        """Конвертация TriggerType в AgentStatus"""
        mapping = {
            TriggerType.NONE: AgentStatus.IDLE,
            TriggerType.ANALYZING: AgentStatus.ANALYZING,
            TriggerType.READY_TO_SUGGEST: AgentStatus.READY_TO_SUGGEST,
            TriggerType.SOFT_PUSH: AgentStatus.READY_TO_SUGGEST
        }
        return mapping.get(trigger_type, AgentStatus.IDLE)
    
    def _generate_suggestion(self, event_type: str, metadata: Optional[Dict] = None) -> str:
        """Генерирует контекстную подсказку на основе события"""
        suggestions = {
            "view": "Вижу, что вы изучаете товары. Могу помочь с выбором!",
            "filter": "Много фильтруете? Давайте подберу оптимальные варианты!",
            "cart_add": "Отличный выбор! Хотите проверить совместимость?",
            "compare": "Сравниваете варианты? Могу подсказать ключевые отличия!",
            "search": "Не можете найти? Опишите что ищете, помогу!",
        }
        
        # Если есть category в metadata - персонализируем
        if metadata and metadata.get("category"):
            category = metadata["category"]
            return f"Интересуетесь {category}? Есть пара советов для вас!"
        
        return suggestions.get(event_type, "Есть идея! Могу помочь с выбором.")


class Observer:
    """
    Наблюдатель за действиями пользователей с MongoDB persistence.
    
    Собирает данные о поведении для последующего анализа
    и формирования контекста для AI-рекомендаций.
    """
    
    def __init__(self):
        self._in_memory_sessions: Dict[str, Dict] = {}
        self._global_stats: Dict[str, Any] = defaultdict(int)
        self._db = None
        self._initialized = False
        # Используем централизованный state_manager
        self.state_manager = MindStateManager.get_instance()
        self.market_observer = MarketObserver()
        logger.info("🔭 Observer initialized (MongoDB persistence enabled)")
    
    async def _ensure_db(self):
        """Lazy initialization of database connection"""
        if not self._initialized:
            try:
                from database import db
                self._db = db
                # Create indexes for efficient queries
                await self._db.user_sessions.create_index("user_id")
                await self._db.user_sessions.create_index("updated_at")
                await self._db.behavior_events.create_index([("user_id", 1), ("timestamp", -1)])
                await self._db.behavior_events.create_index("event_type")
                self._initialized = True
                logger.info("✅ Observer MongoDB indexes created")
            except Exception as e:
                logger.warning(f"MongoDB not available, using in-memory storage: {e}")
                self._db = None
                self._initialized = True
    
    async def _get_or_create_session(self, user_id: str) -> Dict:
        """Получить или создать сессию пользователя"""
        await self._ensure_db()
        
        # Try to get from MongoDB
        if self._db is not None:
            session = await self._db.user_sessions.find_one(
                {"user_id": user_id},
                {"_id": 0}
            )
            if session:
                return session
            
            # Create new session
            new_session = {
                "user_id": user_id,
                "started_at": datetime.now(timezone.utc).isoformat(),
                "views": [],
                "cart_actions": [],
                "dwell_times": {},
                "current_page": None,
                "page_entered_at": None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "ab_group": self._assign_ab_group(user_id)
            }
            await self._db.user_sessions.insert_one(new_session)
            logger.debug(f"Created new persistent session for user: {user_id}")
            return new_session
        
        # Fallback to in-memory
        if user_id not in self._in_memory_sessions:
            self._in_memory_sessions[user_id] = {
                "user_id": user_id,
                "started_at": datetime.now(timezone.utc).isoformat(),
                "views": [],
                "cart_actions": [],
                "dwell_times": {},
                "current_page": None,
                "page_entered_at": None,
                "ab_group": self._assign_ab_group(user_id)
            }
        return self._in_memory_sessions[user_id]
    
    def _assign_ab_group(self, user_id: str) -> str:
        """Assign user to A/B test group based on user_id hash"""
        hash_val = hash(user_id)
        # 50/50 split for now
        return "A" if hash_val % 2 == 0 else "B"
    
    async def _save_event(self, event_type: str, user_id: str, data: Dict):
        """Save event to MongoDB for analytics"""
        await self._ensure_db()
        
        if self._db is not None:
            event = {
                "event_type": event_type,
                "user_id": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "data": data
            }
            await self._db.behavior_events.insert_one(event)
    
    async def _update_session(self, user_id: str, updates: Dict):
        """Update session in MongoDB"""
        await self._ensure_db()
        
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        if self._db is not None:
            await self._db.user_sessions.update_one(
                {"user_id": user_id},
                {"$set": updates}
            )
        else:
            if user_id in self._in_memory_sessions:
                self._in_memory_sessions[user_id].update(updates)
    
    async def track_user_view(
        self, 
        user_id: str, 
        product_id: str, 
        product_data: Optional[Dict] = None
    ) -> Dict:
        """Отслеживание просмотра товара с сохранением в MongoDB"""
        session = await self._get_or_create_session(user_id)
        
        view_event = {
            "product_id": product_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": product_data or {}
        }
        
        # Update session views (keep last 50)
        views = session.get("views", [])
        views.append(view_event)
        views = views[-50:]  # Keep only last 50 views
        
        await self._update_session(user_id, {"views": views})
        await self._save_event("view", user_id, view_event)
        
        self._global_stats["total_views"] += 1
        logger.info(f"👁️ View tracked: user={user_id}, product={product_id}")
        
        return {
            "event": "view",
            "user_id": user_id,
            "product_id": product_id,
            "total_views_in_session": len(views),
            "ab_group": session.get("ab_group", "A")
        }
    
    async def track_cart_add(
        self, 
        user_id: str, 
        product_id: str, 
        quantity: int = 1,
        product_data: Optional[Dict] = None
    ) -> Dict:
        """Отслеживание добавления в корзину с сохранением в MongoDB"""
        session = await self._get_or_create_session(user_id)
        
        cart_event = {
            "product_id": product_id,
            "quantity": quantity,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": product_data or {}
        }
        
        cart_actions = session.get("cart_actions", [])
        cart_actions.append(cart_event)
        cart_actions = cart_actions[-30:]  # Keep last 30 cart actions
        
        await self._update_session(user_id, {"cart_actions": cart_actions})
        await self._save_event("cart_add", user_id, cart_event)
        
        self._global_stats["total_cart_adds"] += 1
        logger.info(f"🛒 Cart add tracked: user={user_id}, product={product_id}, qty={quantity}")
        
        return {
            "event": "cart_add",
            "user_id": user_id,
            "product_id": product_id,
            "quantity": quantity,
            "total_cart_actions": len(cart_actions)
        }
    
    async def analyze_dwell_time(
        self, 
        user_id: str, 
        page_id: str, 
        action: str = "enter"
    ) -> Dict:
        """Анализ времени на странице (dwell time) с сохранением в MongoDB"""
        session = await self._get_or_create_session(user_id)
        now = datetime.now(timezone.utc)
        
        if action == "enter":
            # Calculate dwell time for previous page
            dwell_times = session.get("dwell_times", {})
            current_page = session.get("current_page")
            page_entered_at = session.get("page_entered_at")
            
            if current_page and page_entered_at:
                try:
                    entered_dt = datetime.fromisoformat(page_entered_at.replace('Z', '+00:00'))
                    dwell_seconds = (now - entered_dt).total_seconds()
                    dwell_times[current_page] = dwell_seconds
                    logger.debug(f"Dwell time recorded: {current_page} = {dwell_seconds:.1f}s")
                except:
                    pass
            
            await self._update_session(user_id, {
                "current_page": page_id,
                "page_entered_at": now.isoformat(),
                "dwell_times": dwell_times
            })
            
            logger.info(f"📍 Page enter: user={user_id}, page={page_id}")
            
            return {
                "event": "page_enter",
                "user_id": user_id,
                "page_id": page_id
            }
        
        elif action == "leave":
            dwell_seconds = 0.0
            dwell_times = session.get("dwell_times", {})
            page_entered_at = session.get("page_entered_at")
            
            if session.get("current_page") == page_id and page_entered_at:
                try:
                    entered_dt = datetime.fromisoformat(page_entered_at.replace('Z', '+00:00'))
                    dwell_seconds = (now - entered_dt).total_seconds()
                    dwell_times[page_id] = dwell_seconds
                except:
                    pass
            
            await self._update_session(user_id, {
                "current_page": None,
                "page_entered_at": None,
                "dwell_times": dwell_times
            })
            
            await self._save_event("dwell", user_id, {
                "page_id": page_id,
                "dwell_seconds": dwell_seconds
            })
            
            logger.info(f"📍 Page leave: user={user_id}, page={page_id}, dwell={dwell_seconds:.1f}s")
            
            return {
                "event": "page_leave",
                "user_id": user_id,
                "page_id": page_id,
                "dwell_time_seconds": dwell_seconds
            }
        
        return {"event": "unknown", "action": action}
    
    async def get_user_context(self, user_id: str) -> Dict:
        """Получить полный контекст пользователя для AI"""
        session = await self._get_or_create_session(user_id)
        
        views = session.get("views", [])
        cart_actions = session.get("cart_actions", [])
        dwell_times = session.get("dwell_times", {})
        
        # Categories from views
        viewed_categories = []
        viewed_products = []
        for view in views[-20:]:
            viewed_products.append(view["product_id"])
            if "data" in view and "category" in view["data"]:
                viewed_categories.append(view["data"]["category"])
        
        # Cart products
        cart_products = [ca["product_id"] for ca in cart_actions]
        
        # Top dwell pages
        top_pages = sorted(
            dwell_times.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5]
        
        return {
            "user_id": user_id,
            "session_start": session.get("started_at"),
            "viewed_products": viewed_products,
            "viewed_categories": list(set(viewed_categories)),
            "cart_products": cart_products,
            "top_dwell_pages": dict(top_pages),
            "total_views": len(views),
            "total_cart_adds": len(cart_actions),
            "ab_group": session.get("ab_group", "A")
        }
    
    async def get_global_stats(self) -> Dict:
        """Получить глобальную статистику"""
        await self._ensure_db()
        
        stats = {
            "total_views": self._global_stats["total_views"],
            "total_cart_adds": self._global_stats["total_cart_adds"]
        }
        
        if self._db is not None:
            # Get stats from MongoDB
            total_sessions = await self._db.user_sessions.count_documents({})
            total_events = await self._db.behavior_events.count_documents({})
            
            # Get events from last 24 hours
            yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
            recent_views = await self._db.behavior_events.count_documents({
                "event_type": "view",
                "timestamp": {"$gte": yesterday.isoformat()}
            })
            
            stats.update({
                "total_sessions": total_sessions,
                "total_events": total_events,
                "views_last_24h": recent_views,
                "storage": "mongodb"
            })
        else:
            stats.update({
                "total_sessions": len(self._in_memory_sessions),
                "storage": "in-memory"
            })
        
        return stats
    
    async def get_ab_test_results(self) -> Dict:
        """Get A/B test results for recommendations"""
        await self._ensure_db()
        
        if self._db is None:
            return {"error": "MongoDB required for A/B test results"}
        
        # Count users in each group
        group_a = await self._db.user_sessions.count_documents({"ab_group": "A"})
        group_b = await self._db.user_sessions.count_documents({"ab_group": "B"})
        
        # Count conversions (cart adds) per group
        pipeline_a = [
            {"$match": {"ab_group": "A"}},
            {"$project": {"cart_count": {"$size": {"$ifNull": ["$cart_actions", []]}}}},
            {"$group": {"_id": None, "total_carts": {"$sum": "$cart_count"}}}
        ]
        pipeline_b = [
            {"$match": {"ab_group": "B"}},
            {"$project": {"cart_count": {"$size": {"$ifNull": ["$cart_actions", []]}}}},
            {"$group": {"_id": None, "total_carts": {"$sum": "$cart_count"}}}
        ]
        
        result_a = await self._db.user_sessions.aggregate(pipeline_a).to_list(1)
        result_b = await self._db.user_sessions.aggregate(pipeline_b).to_list(1)
        
        carts_a = result_a[0]["total_carts"] if result_a else 0
        carts_b = result_b[0]["total_carts"] if result_b else 0
        
        return {
            "group_a": {
                "users": group_a,
                "cart_adds": carts_a,
                "conversion_rate": round(carts_a / group_a * 100, 2) if group_a > 0 else 0
            },
            "group_b": {
                "users": group_b,
                "cart_adds": carts_b,
                "conversion_rate": round(carts_b / group_b * 100, 2) if group_b > 0 else 0
            },
            "winner": "A" if (carts_a / max(group_a, 1)) > (carts_b / max(group_b, 1)) else "B"
        }
    
    # ==================== Agent Status Management ====================
    # Теперь используем централизованный state_manager
    
    async def set_agent_status(
        self, 
        user_id: str, 
        status: str, 
        suggestion: Optional[str] = None
    ):
        """
        Установить статус агента для пользователя.
        Делегирует в state_manager.
        """
        self.state_manager.update_state(user_id, status=status, suggestion=suggestion)
        logger.info(f"🎯 Agent status for {user_id}: {status}" + (f" - '{suggestion[:50]}...'" if suggestion else ""))
    
    async def get_agent_status(self, user_id: str) -> Dict:
        """
        Получить текущий статус агента для пользователя.
        """
        state = self.state_manager.get_user_state(user_id)
        return {
            "status": state.get("status", AgentStatus.IDLE),
            "updated_at": state.get("last_active", datetime.now(timezone.utc)).isoformat() if state.get("last_active") else datetime.now(timezone.utc).isoformat(),
            "suggestion": state.get("suggestion"),
            "action_count": state.get("action_count", 0)
        }
    
    async def process_event(self, user_id: str, event_type: str, metadata: Optional[Dict] = None) -> str:
        """
        Обработать событие пользователя через MarketObserver.
        Автоматически управляет переключением статусов.
        """
        return await self.market_observer.process_event(user_id, event_type, metadata)
    
    async def analyze_and_maybe_suggest(self, user_id: str) -> Optional[str]:
        """
        Анализирует контекст пользователя и решает, нужно ли дать совет.
        
        Теперь также учитывает action_count из state_manager.
        """
        state = self.state_manager.get_user_state(user_id)
        
        # Если уже есть подсказка готова — возвращаем её
        if state.get("status") == AgentStatus.READY_TO_SUGGEST and state.get("suggestion"):
            return state["suggestion"]
        
        # Если action_count >= threshold — генерируем подсказку
        if state.get("action_count", 0) >= self.state_manager.ACTION_THRESHOLD:
            context = await self.get_user_context(user_id)
            suggestion = self._generate_context_suggestion(context)
            self.state_manager.set_suggestion(user_id, suggestion)
            return suggestion
        
        # Иначе анализируем контекст
        context = await self.get_user_context(user_id)
        suggestion = None
        
        # 1. Пользователь долго на одной странице (> 30 сек)
        top_dwell = context.get("top_dwell_pages", {})
        if top_dwell:
            max_dwell = max(top_dwell.values()) if top_dwell.values() else 0
            if max_dwell > 30:
                suggestion = "Вижу, что вы изучаете этот товар. Могу помочь с выбором или ответить на вопросы!"
        
        # 2. Много просмотров без добавления в корзину
        views_count = context.get("total_views", 0)
        cart_count = context.get("total_cart_adds", 0)
        if views_count >= 5 and cart_count == 0:
            suggestion = "Не можете определиться? Давайте подберём идеальный вариант вместе!"
        
        # 3. Товары в корзине - напомнить о совместимости
        cart_products = context.get("cart_products", [])
        if len(cart_products) >= 2:
            suggestion = "У вас несколько товаров в корзине. Хотите проверить их совместимость?"
        
        # Устанавливаем финальный статус
        if suggestion:
            self.state_manager.set_suggestion(user_id, suggestion)
        else:
            self.state_manager.update_state(user_id, status=AgentStatus.IDLE)
        
        return suggestion
    
    def _generate_context_suggestion(self, context: Dict) -> str:
        """Генерирует подсказку на основе контекста пользователя"""
        categories = context.get("viewed_categories", [])
        if categories:
            return f"Интересуетесь {categories[0]}? У меня есть несколько советов!"
        
        cart_products = context.get("cart_products", [])
        if cart_products:
            return "Хотите проверить совместимость товаров в корзине?"
        
        return "Могу помочь с выбором! Спросите меня о чём угодно."
    
    async def clear_suggestion(self, user_id: str):
        """Сбрасывает статус обратно в idle после показа подсказки"""
        self.state_manager.clear_suggestion(user_id)


# Singleton instance
observer = Observer()
