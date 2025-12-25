from typing import Dict, List
from .base_agent import BaseAgent
from ..memory_bank import memory_bank
from database import get_database
import logging

logger = logging.getLogger(__name__)


class PCBuilderAgent(BaseAgent):
    """Агент для анализа и помощи со сборками ПК"""
    
    def __init__(self):
        super().__init__()
        self.model = "deepseek-chat"  # Можно заменить на reasoning модель
        self.temperature = 0.3  # Меньше креативности, больше точности
        self.max_tokens = 1000
    
    def get_system_prompt(self, context: Dict = None) -> str:
        """Системный промпт для PCBuilderAgent"""
        
        return """
Ты — эксперт по сборке компьютеров на IT-маркетплейсе.

ТВОИ ЗАДАЧИ:
1. Проверять совместимость компонентов
2. Находить узкие места (bottleneck)
3. Оценивать достаточность блока питания
4. Предлагать улучшения в рамках бюджета
5. Отвечать на технические вопросы

ФОРМАТ ОТВЕТА (при анализе сборки):
✅ Совместимость: [OK / ПРОБЛЕМА с описанием]
⚡ Баланс системы: [оценка 1-10 и объяснение]
🔌 БП: [достаточно / недостаточно, рекомендация по мощности]
💡 Рекомендации: [конкретные советы]

ПРАВИЛА:
- Будь конкретным и технически точным
- Указывай конкретные модели где возможно
- Учитывай бюджет пользователя
- Не рекомендуй устаревшие компоненты
- При bottleneck указывай какой компонент ограничивает

СОВМЕСТИМОСТЬ ПРОВЕРЯЙ:
- Сокет процессора и материнской платы
- Тип памяти (DDR4/DDR5) и слоты
- Размер видеокарты и корпуса
- Питание видеокарты и БП
- Охлаждение CPU
"""
    
    async def process(self, user_id: str, message: str, context: Dict) -> str:
        """Анализ сборки или ответ на вопрос о сборке ПК"""
        
        # 1. Получить текущую сборку пользователя
        build = context.get("current_build") or await self._get_user_build(user_id)
        user_context = await memory_bank.get_user_context(user_id)
        
        # 2. Форматировать информацию о сборке
        build_info = self._format_build_info(build)
        
        # 3. Получить историю диалога (меньше для технических вопросов)
        conversation_history = await memory_bank.get_conversation(user_id, limit=3)
        
        # 4. Собрать сообщения
        user_message = message
        if build_info:
            user_message = f"{message}\n\n📦 Текущая сборка:\n{build_info}"
        
        if user_context.get("budget"):
            user_message += f"\n💰 Бюджет: ~{user_context['budget']}₽"
        
        messages = [
            {"role": "system", "content": self.get_system_prompt()},
            *conversation_history,
            {"role": "user", "content": user_message}
        ]
        
        # 5. Вызвать LLM
        ai_response = await self.call_llm(messages)
        
        # 6. Сохранить в память
        await memory_bank.save_conversation(
            user_id=user_id,
            user_msg=message,
            ai_msg=ai_response,
            agent_type="pc_builder",
            intent="build_pc",
            metadata={"build_id": build.get("id")}
        )
        
        logger.info(f"🖥️ PCBuilderAgent responded to user {user_id}")
        
        return ai_response
    
    def _format_build_info(self, build: Dict) -> str:
        """Форматировать информацию о сборке для AI"""
        if not build or not build.get("components"):
            return ""
        
        components = build.get("components", {})
        info = []
        
        component_names = {
            "cpu": "CPU",
            "gpu": "GPU",
            "motherboard": "Материнская плата",
            "ram": "RAM",
            "storage": "Накопитель",
            "psu": "БП",
            "case": "Корпус",
            "cooler": "Охлаждение"
        }
        
        for key, name in component_names.items():
            component = components.get(key)
            if component:
                price = f" ({component.get('price', '?')}₽)" if component.get('price') else ""
                info.append(f"• {name}: {component.get('name', 'не выбран')}{price}")
            else:
                info.append(f"• {name}: не выбран")
        
        if build.get("budget"):
            info.append(f"\n💰 Бюджет: {build['budget']}₽")
        
        if build.get("purpose"):
            info.append(f"🎯 Цель: {build['purpose']}")
        
        return "\n".join(info)
    
    async def _get_user_build(self, user_id: str) -> Dict:
        """Получить текущую сборку пользователя из БД"""
        db = await get_database()
        
        build = await db.pc_builds.find_one(
            {"user_id": user_id, "is_completed": False},
            {"_id": 0}
        )
        
        return build or {}
    
    async def analyze_compatibility(self, components: Dict) -> Dict:
        """Анализ совместимости компонентов (можно вызвать отдельно)"""
        
        issues = []
        warnings = []
        
        # Проверка сокета CPU и материнской платы
        cpu = components.get("cpu", {})
        mb = components.get("motherboard", {})
        
        if cpu and mb:
            cpu_socket = cpu.get("socket")
            mb_socket = mb.get("socket")
            if cpu_socket and mb_socket and cpu_socket != mb_socket:
                issues.append(f"❌ Несовместимый сокет: CPU {cpu_socket} vs MB {mb_socket}")
        
        # Проверка типа памяти
        ram = components.get("ram", {})
        if ram and mb:
            ram_type = ram.get("type")  # DDR4, DDR5
            mb_ram_type = mb.get("ram_type")
            if ram_type and mb_ram_type and ram_type != mb_ram_type:
                issues.append(f"❌ Несовместимая память: RAM {ram_type} vs MB {mb_ram_type}")
        
        # Проверка мощности БП
        psu = components.get("psu", {})
        gpu = components.get("gpu", {})
        
        if psu and gpu:
            psu_wattage = psu.get("wattage", 0)
            gpu_tdp = gpu.get("tdp", 0)
            recommended = gpu_tdp * 2 + 150  # Примерная формула
            
            if psu_wattage < recommended:
                warnings.append(f"⚠️ БП может быть недостаточен: {psu_wattage}W vs рекомендуемые {recommended}W")
        
        return {
            "is_compatible": len(issues) == 0,
            "issues": issues,
            "warnings": warnings
        }
