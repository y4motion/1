"""
Glassy Mind - AI Chat Agent with Emergent LLM Integration
Умный чат-агент для ответов на вопросы пользователей о продуктах.
Использует GPT-5.2 через emergentintegrations.
"""

import os
import logging
import uuid
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Get the Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')


class MindChatAgent:
    """
    AI Chat Agent для Glassy Mind.
    Использует GPT-5.2 через emergentintegrations для генерации умных ответов.
    """
    
    def __init__(self):
        self.api_key = EMERGENT_LLM_KEY
        self.enabled = bool(self.api_key)
        self.model_provider = "openai"
        self.model_name = "gpt-4.1-mini"  # Fast and efficient
        
        if self.enabled:
            logger.info(f"🤖 MindChatAgent initialized with {self.model_provider}/{self.model_name}")
        else:
            logger.warning("⚠️ MindChatAgent disabled - no EMERGENT_LLM_KEY")
    
    def _build_system_prompt(self, product_info: Dict, user_context: Dict) -> str:
        """Build system prompt with product and user context"""
        
        viewed_products = user_context.get("viewed_products", [])[:5]
        viewed_categories = user_context.get("viewed_categories", [])[:3]
        cart_products = user_context.get("cart_products", [])
        ab_group = user_context.get("ab_group", "A")
        
        return f"""Ты — Glassy AI, умный помощник маркетплейса технических товаров Glassy Market.
Твоя задача — помогать покупателям с вопросами о товарах, совместимости и выборе.

ТЕКУЩИЙ ТОВАР:
- Название: {product_info.get('title', 'Товар')}
- Категория: {product_info.get('category', 'Техника')}
- Цена: {product_info.get('price', 'N/A')}

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
- Просмотренные товары: {', '.join(str(p) for p in viewed_products) if viewed_products else 'нет данных'}
- Интересующие категории: {', '.join(str(c) for c in viewed_categories) if viewed_categories else 'нет данных'}
- Товары в корзине: {len(cart_products)} шт.
- Тестовая группа: {ab_group}

БАЗА ЗНАНИЙ О СОВМЕСТИМОСТИ:
- RTX 5090: TDP 575W, рекомендуем БП от 1000W, разъём 16-pin
- RTX 4090: TDP 450W, рекомендуем БП от 850W
- RTX 4080: TDP 320W, рекомендуем БП от 750W
- RTX 4070: TDP 200W, рекомендуем БП от 650W
- AM5 сокет: Ryzen 7000/9000, только DDR5
- LGA1700: Intel 12-14 поколение, DDR4 или DDR5
- LGA1851: Intel Core Ultra 200, только DDR5
- Беспроводные наушники: совместимы с Bluetooth 5.0+
- Игровые мыши: DPI до 25600, polling rate до 8000Hz

ПРАВИЛА ОТВЕТОВ:
1. Отвечай кратко (2-3 предложения максимум)
2. Если вопрос о совместимости — дай конкретный технический ответ
3. Если вопрос о качестве — упомяни отзывы или характеристики
4. Рекомендуй аксессуары когда уместно
5. Отвечай на языке вопроса (русский или английский)
6. Используй эмодзи умеренно (1-2 на ответ)
7. Если не знаешь — честно скажи и предложи связаться с поддержкой"""
    
    async def generate_response(
        self,
        user_message: str,
        product_info: Dict,
        user_context: Dict
    ) -> Dict:
        """Generate AI response using emergentintegrations."""
        
        if not self.enabled:
            return {
                "success": False,
                "response": None,
                "error": "AI not configured - no EMERGENT_LLM_KEY"
            }
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            system_prompt = self._build_system_prompt(product_info, user_context)
            session_id = f"mind_chat_{user_context.get('user_id', 'anonymous')}_{uuid.uuid4().hex[:8]}"
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_prompt
            ).with_model(self.model_provider, self.model_name)
            
            user_msg = UserMessage(text=user_message)
            response = await chat.send_message(user_msg)
            
            logger.info(f"🤖 AI response generated: {response[:50]}...")
            
            return {
                "success": True,
                "response": response,
                "model": f"{self.model_provider}/{self.model_name}",
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"AI generation error: {e}")
            return {
                "success": False,
                "response": None,
                "error": str(e)
            }
    
    async def get_quick_suggestion(
        self,
        product_info: Dict,
        user_context: Dict,
        suggestion_type: str = "general"
    ) -> Optional[str]:
        """Get quick contextual suggestion without full AI call."""
        
        category = (product_info.get("category", "") or "").lower()
        tags = product_info.get("tags", []) or []
        tags_str = " ".join([str(t).lower() for t in tags])
        search_text = f"{category} {tags_str}"
        
        ab_group = user_context.get("ab_group", "A")
        cart_count = len(user_context.get("cart_products", []))
        
        # A/B test different suggestion styles
        if ab_group == "A":
            # Group A: Direct recommendations
            if "headphone" in search_text or "audio" in search_text:
                return "💡 Совет: Для максимального качества звука рекомендуем добавить DAC/усилитель!"
            elif "gpu" in search_text or "graphics" in search_text:
                return "💡 Совет: Не забудьте проверить мощность вашего БП перед покупкой!"
            elif "keyboard" in search_text:
                return "💡 Совет: Добавьте подставку для запястий — руки скажут спасибо!"
            elif "mouse" in search_text or "mice" in search_text:
                return "💡 Совет: Хороший коврик улучшит точность сенсора на 15-20%!"
            elif "monitor" in search_text:
                return "💡 Совет: Используйте DisplayPort для максимальной частоты обновления!"
        else:
            # Group B: Question-based engagement
            if "headphone" in search_text or "audio" in search_text:
                return "🤔 Какой источник звука планируете использовать? Могу подсказать идеальную связку!"
            elif "gpu" in search_text or "graphics" in search_text:
                return "🤔 Какое разрешение монитора? Помогу выбрать оптимальную видеокарту!"
            elif "keyboard" in search_text:
                return "🤔 Предпочитаете тихие или кликающие клавиши? Подскажу лучший вариант!"
            elif "mouse" in search_text or "mice" in search_text:
                return "🤔 Какой хват используете — ладонный или когтевой? Важно для выбора!"
            elif "monitor" in search_text:
                return "🤔 Для игр или работы с графикой? Подберу идеальную матрицу!"
        
        # Default based on cart
        if cart_count == 0:
            return "🛒 Добавьте товар в корзину, чтобы не потерять!"
        elif cart_count >= 3:
            return "🎉 Отличный выбор! При заказе от $99 — бесплатная доставка!"
        
        return None


# Singleton instance
mind_chat_agent = MindChatAgent()
