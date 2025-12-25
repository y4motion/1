from typing import Dict
from .base_agent import BaseAgent
from ..memory_bank import memory_bank
import logging

logger = logging.getLogger(__name__)


class ChatAgent(BaseAgent):
    """Агент для обычного общения с пользователями"""
    
    def __init__(self):
        super().__init__()
        self.model = "deepseek-chat"  # Быстрая модель для чата
        self.temperature = 0.7
        self.max_tokens = 500
    
    def get_system_prompt(self, context: Dict = None) -> str:
        """Системный промпт для ChatAgent"""
        
        prompt = """
Ты — CORE AI, дружелюбный помощник на IT-маркетплейсе Glassy Market.

СТИЛЬ ОБЩЕНИЯ:
- Дружелюбный, но профессиональный
- Короткие ответы (2-3 предложения максимум)
- Используй эмодзи умеренно (1-2 на сообщение)
- Говори на языке пользователя
- Избегай канцелярита и официоза

ЧТО МОЖЕШЬ:
- Отвечать на вопросы о товарах и ценах
- Помогать с выбором техники
- Объяснять характеристики
- Подсказывать где найти нужное

ЗАПРЕЩЕНО:
- Агрессивно продавать
- Обманывать о характеристиках
- Игнорировать бюджет пользователя
- Давать медицинские/юридические советы

Важно: Если не знаешь ответа — честно скажи, что уточнишь.
"""
        
        # Добавить контекст пользователя
        if context:
            if context.get("recent_views"):
                products = [v.get("product", {}).get("title", "?")[:30] for v in context["recent_views"][:3]]
                prompt += f"\n\nПользователь недавно смотрел: {', '.join(products)}"
            
            if context.get("budget"):
                prompt += f"\nПримерный бюджет: {context['budget']}₽"
            
            if context.get("cart", {}).get("items"):
                prompt += f"\nВ корзине: {len(context['cart']['items'])} товаров"
        
        return prompt
    
    async def process(self, user_id: str, message: str, context: Dict) -> str:
        """Обработать сообщение пользователя"""
        
        # 1. Получить контекст из памяти
        user_context = await memory_bank.get_user_context(user_id)
        conversation_history = await memory_bank.get_conversation(user_id, limit=5)
        
        # 2. Собрать сообщения для API
        messages = [
            {"role": "system", "content": self.get_system_prompt(user_context)},
            *conversation_history,
            {"role": "user", "content": message}
        ]
        
        # 3. Вызвать LLM
        ai_response = await self.call_llm(messages)
        
        # 4. Сохранить в память
        await memory_bank.save_conversation(
            user_id=user_id,
            user_msg=message,
            ai_msg=ai_response,
            agent_type="chat",
            intent="chat"
        )
        
        logger.info(f"💬 ChatAgent responded to user {user_id}")
        
        return ai_response
