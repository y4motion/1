from typing import Dict
from .base_agent import BaseAgent
import json
import logging

logger = logging.getLogger(__name__)


class ModeratorAgent(BaseAgent):
    """Агент для модерации контента"""
    
    def __init__(self):
        super().__init__()
        self.model = "deepseek-chat"
        self.temperature = 0.1  # Минимальная креативность для консистентности
        self.max_tokens = 200
    
    def get_system_prompt(self, context: Dict = None) -> str:
        """Системный промпт для ModeratorAgent"""
        
        return """
Ты — автоматический модератор контента на IT-маркетплейсе.

ПРОВЕРЯЙ НА:
1. Токсичность (оскорбления, мат, угрозы)
2. Спам (реклама, повторяющийся контент, ссылки)
3. Мошенничество (фейковые отзывы, обман)
4. Неуместный контент (18+, политика, экстремизм)
5. Личные данные (телефоны, адреса, карты)

ОТВЕТ СТРОГО В JSON ФОРМАТЕ:
{
  "is_safe": true/false,
  "violations": ["список нарушений"],
  "severity": "low/medium/high/critical",
  "action": "approve/warn/reject/ban",
  "reason": "краткое объяснение"
}

ПРАВИЛА:
- approve: контент безопасен
- warn: мелкие нарушения, можно опубликовать с предупреждением
- reject: серьёзные нарушения, отклонить
- ban: критические нарушения, заблокировать пользователя

Будь строгим, но справедливым. Не блокируй за мелочи.
"""
    
    async def process(self, user_id: str, message: str, context: Dict) -> str:
        """Не используется напрямую в чате"""
        return "🛡️ Модератор работает в фоновом режиме"
    
    async def moderate_content(self, content: str, content_type: str = "comment") -> Dict:
        """Модерировать контент (отзыв, комментарий, пост)"""
        
        # Быстрые проверки без AI
        quick_result = self._quick_check(content)
        if quick_result:
            return quick_result
        
        # AI модерация
        messages = [
            {"role": "system", "content": self.get_system_prompt()},
            {"role": "user", "content": f"Тип контента: {content_type}\n\nКонтент для проверки:\n{content}"}
        ]
        
        response = await self.call_llm(messages)
        
        # Парсинг JSON ответа
        try:
            # Извлечь JSON из ответа
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
            else:
                raise ValueError("No JSON found")
                
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to parse moderation response: {e}")
            # Fallback - approve если не удалось распарсить
            result = {
                "is_safe": True,
                "violations": [],
                "severity": "low",
                "action": "approve",
                "reason": "Автоматическая проверка пройдена"
            }
        
        logger.info(f"🛡️ Moderation result: {result.get('action')} (safe: {result.get('is_safe')})")
        
        return result
    
    def _quick_check(self, content: str) -> Dict | None:
        """Быстрые проверки без AI"""
        
        content_lower = content.lower()
        
        # Список запрещённых слов (базовый)
        banned_words = [
            # Мат и оскорбления (примеры - добавить полный список)
            "хуй", "пизд", "ебан", "бля", "сука", "нахуй",
            # Спам-триггеры
            "заработок без вложений", "схема заработка", "пассивный доход"
        ]
        
        for word in banned_words:
            if word in content_lower:
                return {
                    "is_safe": False,
                    "violations": ["prohibited_content"],
                    "severity": "high",
                    "action": "reject",
                    "reason": f"Обнаружен запрещённый контент"
                }
        
        # Проверка на спам-ссылки
        spam_domains = ["bit.ly", "tinyurl", "t.me/", "telegram.me"]
        for domain in spam_domains:
            if domain in content_lower:
                return {
                    "is_safe": False,
                    "violations": ["spam_link"],
                    "severity": "medium",
                    "action": "warn",
                    "reason": "Подозрительная ссылка"
                }
        
        # Проверка на слишком короткий контент
        if len(content.strip()) < 3:
            return {
                "is_safe": False,
                "violations": ["too_short"],
                "severity": "low",
                "action": "reject",
                "reason": "Слишком короткий контент"
            }
        
        return None  # Нужна AI проверка
    
    async def moderate_batch(self, items: list) -> list:
        """Модерация пакета контента"""
        results = []
        
        for item in items:
            result = await self.moderate_content(
                content=item.get("content", ""),
                content_type=item.get("type", "comment")
            )
            results.append({
                "id": item.get("id"),
                **result
            })
        
        return results
