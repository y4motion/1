from typing import Dict, List
from .base_agent import BaseAgent
from ..memory_bank import memory_bank
from database import get_database
import logging

logger = logging.getLogger(__name__)


class RecommenderAgent(BaseAgent):
    """Агент для рекомендаций товаров"""
    
    def __init__(self):
        super().__init__()
        self.model = "deepseek-chat"
        self.temperature = 0.5
        self.max_tokens = 800
    
    def get_system_prompt(self, context: Dict = None) -> str:
        """Системный промпт для RecommenderAgent"""
        
        return """
Ты — эксперт по подбору техники на IT-маркетплейсе.

ТВОЯ ЗАДАЧА:
Порекомендовать 2-3 лучших варианта из доступных товаров.

КРИТЕРИИ ВЫБОРА:
1. Соответствие запросу пользователя
2. Соотношение цена/качество
3. Совместимость (если указана существующая система)
4. Рейтинг и отзывы
5. Наличие на складе

ФОРМАТ ОТВЕТА:
Для каждого товара:
🏆 [Название]
   💰 Цена: X₽
   ✨ Почему подходит: (1-2 предложения)
   ⭐ Рейтинг: X/5

ПРАВИЛА:
- Учитывай бюджет пользователя (не предлагай дороже)
- Не рекомендуй товары без наличия
- Если нет идеального варианта — предложи альтернативы
- Будь честным о недостатках
"""
    
    async def process(self, user_id: str, message: str, context: Dict) -> str:
        """Рекомендовать товары"""
        
        # 1. Получить контекст пользователя
        user_context = await memory_bank.get_user_context(user_id)
        
        # 2. Поиск релевантных товаров
        products = await self._search_products(message, user_context)
        
        if not products:
            return "🔍 К сожалению, я не нашёл подходящих товаров по твоему запросу. Попробуй уточнить, что именно ищешь?"
        
        # 3. Форматировать товары для AI
        products_info = self._format_products(products)
        
        # 4. Собрать сообщения
        budget_info = f"\n💰 Бюджет: ~{user_context.get('budget')}₽" if user_context.get('budget') else ""
        
        user_message = f"Запрос: {message}{budget_info}\n\nДоступные товары:\n{products_info}"
        
        messages = [
            {"role": "system", "content": self.get_system_prompt()},
            {"role": "user", "content": user_message}
        ]
        
        # 5. Вызвать LLM
        ai_response = await self.call_llm(messages)
        
        # 6. Сохранить в память
        await memory_bank.save_conversation(
            user_id=user_id,
            user_msg=message,
            ai_msg=ai_response,
            agent_type="recommender",
            intent="recommend",
            metadata={"products_shown": [p["id"] for p in products]}
        )
        
        logger.info(f"🛒 RecommenderAgent responded to user {user_id} with {len(products)} products")
        
        return ai_response
    
    async def _search_products(self, query: str, context: Dict) -> List[Dict]:
        """Поиск товаров в БД"""
        db = await get_database()
        
        # Базовый фильтр
        base_filter = {
            "status": "approved",
            "stock": {"$gt": 0}
        }
        
        # Добавить бюджетный фильтр если есть
        budget = context.get("budget")
        if budget:
            base_filter["price"] = {"$lte": budget * 1.1}  # +10% tolerance
        
        # Попробовать текстовый поиск
        try:
            products = await db.products.find(
                {
                    **base_filter,
                    "$text": {"$search": query}
                },
                {"_id": 0, "score": {"$meta": "textScore"}}
            ).sort([("score", {"$meta": "textScore"})]).limit(10).to_list(10)
        except:
            # Fallback на обычный поиск если text index не работает
            products = await db.products.find(
                {
                    **base_filter,
                    "$or": [
                        {"title": {"$regex": query, "$options": "i"}},
                        {"description": {"$regex": query, "$options": "i"}},
                        {"category": {"$regex": query, "$options": "i"}}
                    ]
                },
                {"_id": 0}
            ).limit(10).to_list(10)
        
        return products
    
    def _format_products(self, products: List[Dict]) -> str:
        """Форматировать товары для AI"""
        formatted = []
        
        for i, p in enumerate(products, 1):
            name = p.get('title', p.get('name', 'Без названия'))
            price = p.get('price', 0)
            rating = p.get('rating', 0)
            reviews = p.get('reviews_count', 0)
            stock = p.get('stock', 0)
            
            formatted.append(
                f"{i}. {name}\n"
                f"   Цена: {price}₽\n"
                f"   Рейтинг: {rating}/5 ({reviews} отзывов)\n"
                f"   В наличии: {stock} шт."
            )
        
        return "\n\n".join(formatted)
    
    async def find_alternatives(self, product_id: str, max_price: int = None) -> List[Dict]:
        """Найти альтернативы для конкретного товара"""
        db = await get_database()
        
        # Получить оригинальный товар
        original = await db.products.find_one({"id": product_id}, {"_id": 0})
        if not original:
            return []
        
        # Искать похожие
        filter_query = {
            "id": {"$ne": product_id},
            "category": original.get("category"),
            "status": "approved",
            "stock": {"$gt": 0}
        }
        
        if max_price:
            filter_query["price"] = {"$lte": max_price}
        elif original.get("price"):
            # Ищем дешевле или примерно такой же цены
            filter_query["price"] = {"$lte": original["price"] * 1.2}
        
        alternatives = await db.products.find(
            filter_query,
            {"_id": 0}
        ).sort("rating", -1).limit(5).to_list(5)
        
        return alternatives
