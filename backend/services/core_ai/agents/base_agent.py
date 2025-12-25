from abc import ABC, abstractmethod
from typing import Dict, Optional
import httpx
import os
import logging

logger = logging.getLogger(__name__)

# Get API key from environment
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')


class BaseAgent(ABC):
    """Базовый класс для всех AI агентов"""
    
    def __init__(self):
        self.model = "deepseek-chat"
        self.api_url = "https://api.deepseek.com/v1/chat/completions"
        self.api_key = DEEPSEEK_API_KEY or OPENAI_API_KEY
        self.temperature = 0.7
        self.max_tokens = 500
    
    @abstractmethod
    async def process(self, user_id: str, message: str, context: Dict) -> str:
        """Обработать запрос пользователя"""
        pass
    
    @abstractmethod
    def get_system_prompt(self, context: Dict = None) -> str:
        """Получить системный промпт для агента"""
        pass
    
    async def call_llm(self, messages: list, **kwargs) -> str:
        """Вызвать LLM API"""
        
        if not self.api_key:
            logger.warning("⚠️ No API key configured, returning mock response")
            return self._get_mock_response(messages)
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": kwargs.get("model", self.model),
                        "messages": messages,
                        "temperature": kwargs.get("temperature", self.temperature),
                        "max_tokens": kwargs.get("max_tokens", self.max_tokens)
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"LLM API error: {response.status_code} - {response.text}")
                    return self._get_fallback_response()
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
                
        except httpx.TimeoutException:
            logger.error("LLM API timeout")
            return self._get_fallback_response()
        except Exception as e:
            logger.error(f"LLM API error: {e}")
            return self._get_fallback_response()
    
    def _get_mock_response(self, messages: list) -> str:
        """Мок-ответ когда API недоступен"""
        user_msg = messages[-1]["content"] if messages else ""
        return f"🤖 [DEV MODE] Я получил твой запрос: '{user_msg[:50]}...'. API ключ не настроен."
    
    def _get_fallback_response(self) -> str:
        """Fallback ответ при ошибке"""
        return "Извини, сейчас я немного перегружен. Попробуй ещё раз через минуту! 🔄"
