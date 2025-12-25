from typing import Dict, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class AgentType(Enum):
    CHAT = "chat"                      # Общение с пользователем
    MODERATOR = "moderator"            # Модерация контента
    PC_BUILDER = "pc_builder"          # Анализ сборок ПК
    RECOMMENDER = "recommender"        # Рекомендации товаров
    SELLER_ADVISOR = "seller_advisor"  # Советы продавцам
    ANALYTICS = "analytics"            # Аналитика


class Orchestrator:
    """Главный диспетчер CORE AI - роутинг запросов к специализированным агентам"""
    
    def __init__(self):
        self.agents = {}
        self._initialized = False
    
    def _initialize_agents(self):
        """Ленивая инициализация агентов"""
        if self._initialized:
            return
        
        from .agents.chat_agent import ChatAgent
        from .agents.moderator_agent import ModeratorAgent
        from .agents.pc_builder_agent import PCBuilderAgent
        from .agents.recommender_agent import RecommenderAgent
        
        self.agents = {
            AgentType.CHAT: ChatAgent(),
            AgentType.MODERATOR: ModeratorAgent(),
            AgentType.PC_BUILDER: PCBuilderAgent(),
            AgentType.RECOMMENDER: RecommenderAgent(),
        }
        
        self._initialized = True
        logger.info("🤖 CORE AI Orchestrator initialized with agents: " + 
                   ", ".join([a.value for a in self.agents.keys()]))
    
    async def route_request(
        self,
        user_id: str,
        message: str,
        context: Dict = None
    ) -> Dict:
        """Определить какой агент должен обработать запрос и выполнить"""
        self._initialize_agents()
        
        context = context or {}
        
        # 1. Анализ намерения (intent classification)
        intent = await self._classify_intent(message, context)
        logger.info(f"🎯 Intent classified: {intent}")
        
        # 2. Выбрать агента
        agent_type = self._select_agent(intent)
        agent = self.agents.get(agent_type)
        
        if not agent:
            agent = self.agents[AgentType.CHAT]  # Fallback
            agent_type = AgentType.CHAT
        
        logger.info(f"🤖 Routing to agent: {agent_type.value}")
        
        # 3. Обработать запрос
        try:
            response = await agent.process(user_id, message, context)
        except Exception as e:
            logger.error(f"❌ Agent {agent_type.value} error: {e}")
            response = "Извини, произошла ошибка. Попробуй ещё раз."
        
        return {
            "agent": agent_type.value,
            "response": response,
            "intent": intent
        }
    
    async def _classify_intent(self, message: str, context: Dict) -> str:
        """Классифицировать намерение пользователя"""
        message_lower = message.lower()
        
        # Ключевые слова для PC Builder
        pc_keywords = [
            "собрать", "сборка", "пк", "компьютер", "конфигурация",
            "совместим", "подойдет", "bottleneck", "узкое место",
            "игровой компьютер", "рабочая станция", "бп", "блок питания"
        ]
        if any(word in message_lower for word in pc_keywords):
            return "build_pc"
        
        # Ключевые слова для Recommender
        recommend_keywords = [
            "рекомендуй", "посоветуй", "подбери", "выбрать", "что лучше",
            "альтернатива", "аналог", "дешевле", "похожий", "вместо"
        ]
        if any(word in message_lower for word in recommend_keywords):
            return "recommend"
        
        # Ключевые слова для поиска цены/альтернатив
        price_keywords = ["цена", "стоит", "сколько", "бюджет", "дорого", "дёшево"]
        if any(word in message_lower for word in price_keywords):
            return "find_alternative"
        
        # Проверка контекста (что пользователь делает сейчас)
        current_page = context.get("current_page", "")
        if current_page in ["pc-builder", "assembly"]:
            return "build_pc"
        elif current_page in ["marketplace", "category", "product"]:
            return "recommend"
        
        # По умолчанию - обычный чат
        return "chat"
    
    def _select_agent(self, intent: str) -> AgentType:
        """Выбрать агента на основе намерения"""
        intent_to_agent = {
            "chat": AgentType.CHAT,
            "build_pc": AgentType.PC_BUILDER,
            "recommend": AgentType.RECOMMENDER,
            "find_alternative": AgentType.RECOMMENDER,
            "check_compatibility": AgentType.PC_BUILDER,
            "moderate": AgentType.MODERATOR,
        }
        
        return intent_to_agent.get(intent, AgentType.CHAT)
    
    async def moderate_content(
        self,
        content: str,
        content_type: str = "comment"
    ) -> Dict:
        """Модерировать контент через ModeratorAgent"""
        self._initialize_agents()
        
        moderator = self.agents.get(AgentType.MODERATOR)
        if moderator:
            return await moderator.moderate_content(content, content_type)
        
        return {"is_safe": True, "action": "approve"}


# Global instance
orchestrator = Orchestrator()
