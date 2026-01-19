"""
Glassy Mind - AI Chat Agent with Deepseek Integration
Умный чат-агент для ответов на вопросы пользователей о продуктах.
"""

import os
import logging
import aiohttp
from typing import Dict, Optional, List

logger = logging.getLogger(__name__)

DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')


class MindChatAgent:
    """
    AI Chat Agent для Glassy Mind.
    Использует Deepseek для генерации умных ответов
    на основе контекста пользователя и базы знаний.
    """
    
    def __init__(self):
        self.api_key = DEEPSEEK_API_KEY or OPENAI_API_KEY
        self.api_url = "https://api.deepseek.com/v1/chat/completions"
        self.model = "deepseek-chat"
        self.enabled = bool(self.api_key)
        
        if self.enabled:
            logger.info("🤖 MindChatAgent initialized with Deepseek")
        else:
            logger.warning("⚠️ MindChatAgent disabled - no API key")
    
    def _build_system_prompt(self, product_info: Dict, user_context: Dict) -> str:
        """Build system prompt with product and user context"""
        
        # User context summary
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
- Просмотренные товары: {', '.join(viewed_products) if viewed_products else 'нет данных'}
- Интересующие категории: {', '.join(viewed_categories) if viewed_categories else 'нет данных'}
- Товары в корзине: {len(cart_products)} шт.
- Тестовая группа: {ab_group}

БАЗА ЗНАНИЙ:
- RTX 5090 требует БП от 1000W (TDP 575W)
- RTX 4090 требует БП от 850W (TDP 450W)
- RTX 4080 требует БП от 750W (TDP 320W)
- AM5 сокет поддерживает Ryzen 7000/9000, DDR5
- LGA1700 поддерживает Intel 12-14 поколение, DDR4/DDR5
- Беспроводные наушники совместимы с любым Bluetooth 5.0+ устройством
- Для игровых мышей важен DPI (чем выше - точнее) и polling rate (8000Hz лучше)

ПРАВИЛА:
1. Отвечай кратко и по делу (2-3 предложения)
2. Если вопрос о совместимости — дай конкретный ответ
3. Если вопрос о качестве — упомяни отзывы или рейтинг
4. Рекомендуй дополнительные товары когда уместно
5. Отвечай на языке пользователя (русский или английский)
6. Используй эмодзи уместно
7. Если не знаешь ответ — честно скажи и предложи связаться с поддержкой"""
    
    async def generate_response(
        self,
        user_message: str,
        product_info: Dict,
        user_context: Dict
    ) -> Dict:
        """
        Generate AI response using Deepseek.
        
        Args:
            user_message: User's question
            product_info: Current product details
            user_context: User's browsing context from Observer
        
        Returns:
            Dict with response text and metadata
        """
        if not self.enabled:
            return {
                "success": False,
                "response": None,
                "error": "AI not configured"
            }
        
        try:
            system_prompt = self._build_system_prompt(product_info, user_context)
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "max_tokens": 200,
                "temperature": 0.7,
                "stream": False
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        ai_response = data["choices"][0]["message"]["content"]
                        
                        logger.info(f"🤖 AI response generated for: {user_message[:50]}...")
                        
                        return {
                            "success": True,
                            "response": ai_response,
                            "model": self.model,
                            "tokens_used": data.get("usage", {}).get("total_tokens", 0)
                        }
                    else:
                        error_text = await response.text()
                        logger.error(f"Deepseek API error: {response.status} - {error_text}")
                        return {
                            "success": False,
                            "response": None,
                            "error": f"API error: {response.status}"
                        }
        
        except aiohttp.ClientTimeout:
            logger.warning("Deepseek API timeout")
            return {
                "success": False,
                "response": None,
                "error": "AI response timeout"
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
        """
        Get quick contextual suggestion without full AI call.
        Uses rule-based logic for speed.
        """
        category = (product_info.get("category", "") or "").lower()
        tags = (product_info.get("tags", []) or [])
        tags_str = " ".join([str(t).lower() for t in tags])
        search_text = f"{category} {tags_str}"
        
        viewed_categories = user_context.get("viewed_categories", [])
        cart_count = len(user_context.get("cart_products", []))
        ab_group = user_context.get("ab_group", "A")
        
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
        
        # Default suggestions based on cart
        if cart_count == 0:
            return "🛒 Добавьте товар в корзину, чтобы не потерять!"
        elif cart_count >= 3:
            return "🎉 Отличный выбор! При заказе от $99 — бесплатная доставка!"
        
        return None


# Singleton instance
mind_chat_agent = MindChatAgent()
