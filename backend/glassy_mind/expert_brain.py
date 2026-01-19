"""
Glassy Mind - Tech Expert Brain Module
"Мозг" эксперта по технике — анализ совместимости и генерация рекомендаций.

Функции:
- Оценка совместимости компонентов
- Генерация персональных предложений
- Анализ контекста пользователя
"""

import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class CompatibilityLevel(Enum):
    """Уровни совместимости"""
    PERFECT = "perfect"       # Идеальная совместимость
    GOOD = "good"            # Хорошая совместимость
    WARNING = "warning"      # Есть нюансы
    INCOMPATIBLE = "incompatible"  # Несовместимо


@dataclass
class CompatibilityResult:
    """Результат проверки совместимости"""
    level: CompatibilityLevel
    score: float  # 0.0 - 1.0
    issues: List[str]
    suggestions: List[str]
    details: Dict[str, Any]


class TechExpert:
    """
    Эксперт по технике — анализирует совместимость
    и генерирует персональные рекомендации.
    """
    
    def __init__(self):
        self._knowledge_base = self._load_knowledge_base()
        logger.info("🧠 TechExpert initialized")
    
    def _load_knowledge_base(self) -> Dict:
        """
        Загрузка базы знаний о совместимости.
        
        В будущем — загрузка из БД или файла.
        Сейчас — базовые правила.
        """
        return {
            "socket_compatibility": {
                "AM5": ["Ryzen 7000", "Ryzen 9000"],
                "LGA1700": ["Intel 12th", "Intel 13th", "Intel 14th"],
                "LGA1851": ["Intel Core Ultra 200"]
            },
            "ram_compatibility": {
                "DDR5": ["AM5", "LGA1700", "LGA1851"],
                "DDR4": ["AM4", "LGA1200", "LGA1700"]
            },
            "power_requirements": {
                "RTX 4090": 450,
                "RTX 4080": 320,
                "RTX 4070": 200,
                "RTX 5090": 575,
                "RX 7900 XTX": 355,
                "default": 150
            },
            "category_bundles": {
                "headphones": ["dac", "amp", "cable", "ear_pads"],
                "keyboard": ["keycaps", "wrist_rest", "cable", "switches"],
                "mouse": ["mousepad", "bungee", "skates"],
                "monitor": ["arm", "cable", "calibrator"],
                "gpu": ["psu", "riser", "support_bracket"]
            }
        }
    
    def evaluate_compatibility(
        self, 
        products_list: List[Dict]
    ) -> CompatibilityResult:
        """
        Оценка совместимости списка продуктов.
        
        Args:
            products_list: Список товаров с их характеристиками
                [{"id": "...", "category": "...", "specs": {...}}, ...]
        
        Returns:
            CompatibilityResult с оценкой и рекомендациями
        """
        issues = []
        suggestions = []
        details = {}
        score = 1.0
        
        if not products_list:
            return CompatibilityResult(
                level=CompatibilityLevel.GOOD,
                score=1.0,
                issues=[],
                suggestions=["Добавьте товары для анализа совместимости"],
                details={}
            )
        
        # Извлекаем категории
        categories = [p.get("category", "unknown") for p in products_list]
        
        # Проверка 1: Поиск GPU и оценка требований к питанию
        gpus = [p for p in products_list if "gpu" in p.get("category", "").lower()]
        psus = [p for p in products_list if "psu" in p.get("category", "").lower()]
        
        if gpus:
            gpu = gpus[0]
            gpu_name = gpu.get("name", "")
            required_power = self._knowledge_base["power_requirements"].get(
                gpu_name, 
                self._knowledge_base["power_requirements"]["default"]
            )
            
            details["gpu_power_required"] = required_power
            
            if psus:
                psu = psus[0]
                psu_wattage = psu.get("specs", {}).get("wattage", 0)
                
                if psu_wattage < required_power + 200:
                    issues.append(f"⚠️ БП может быть недостаточно мощным для {gpu_name}")
                    suggestions.append(f"Рекомендуем БП от {required_power + 250}W")
                    score -= 0.2
            else:
                suggestions.append(f"Добавьте БП от {required_power + 250}W для {gpu_name}")
        
        # Проверка 2: CPU + Motherboard socket
        cpus = [p for p in products_list if "cpu" in p.get("category", "").lower()]
        motherboards = [p for p in products_list if "motherboard" in p.get("category", "").lower()]
        
        if cpus and motherboards:
            cpu_socket = cpus[0].get("specs", {}).get("socket", "")
            mb_socket = motherboards[0].get("specs", {}).get("socket", "")
            
            if cpu_socket and mb_socket and cpu_socket != mb_socket:
                issues.append(f"❌ Несовместимые сокеты: CPU ({cpu_socket}) и материнская плата ({mb_socket})")
                score -= 0.5
        
        # Проверка 3: RAM + Motherboard
        rams = [p for p in products_list if "ram" in p.get("category", "").lower()]
        
        if rams and motherboards:
            ram_type = rams[0].get("specs", {}).get("type", "")  # DDR4/DDR5
            mb_ram_support = motherboards[0].get("specs", {}).get("ram_type", "")
            
            if ram_type and mb_ram_support and ram_type not in mb_ram_support:
                issues.append(f"❌ Материнская плата не поддерживает {ram_type}")
                score -= 0.5
        
        # Определение уровня совместимости
        if score >= 0.9:
            level = CompatibilityLevel.PERFECT
        elif score >= 0.7:
            level = CompatibilityLevel.GOOD
        elif score >= 0.4:
            level = CompatibilityLevel.WARNING
        else:
            level = CompatibilityLevel.INCOMPATIBLE
        
        # Генерация дополнительных предложений
        if not suggestions:
            suggestions.append("✅ Все компоненты совместимы!")
        
        logger.info(f"🔍 Compatibility check: {len(products_list)} products, score={score:.2f}, level={level.value}")
        
        return CompatibilityResult(
            level=level,
            score=max(0.0, min(1.0, score)),
            issues=issues,
            suggestions=suggestions,
            details=details
        )
    
    def generate_suggestion(
        self, 
        user_context: Dict
    ) -> Dict:
        """
        Генерация персональных предложений на основе контекста.
        
        Args:
            user_context: Контекст от Observer (просмотры, корзина, dwell time)
        
        Returns:
            Dict с рекомендациями и причинами
        """
        suggestions = []
        reasoning = []
        
        viewed_products = user_context.get("viewed_products", [])
        viewed_categories = user_context.get("viewed_categories", [])
        cart_products = user_context.get("cart_products", [])
        top_dwell_pages = user_context.get("top_dwell_pages", {})
        
        # Логика 1: Рекомендации на основе категорий
        for category in viewed_categories:
            category_lower = category.lower()
            bundles = self._knowledge_base["category_bundles"].get(category_lower, [])
            
            if bundles:
                suggestions.append({
                    "type": "bundle",
                    "category": category,
                    "recommended_accessories": bundles[:3],
                    "reason": f"К {category} часто покупают"
                })
                reasoning.append(f"Вы смотрели {category} — предлагаем аксессуары")
        
        # Логика 2: На основе dwell time
        if top_dwell_pages:
            most_interested_page = list(top_dwell_pages.keys())[0] if top_dwell_pages else None
            if most_interested_page:
                dwell_time = top_dwell_pages[most_interested_page]
                if dwell_time > 30:  # Более 30 секунд на странице
                    suggestions.append({
                        "type": "interest",
                        "product_id": most_interested_page,
                        "dwell_time": dwell_time,
                        "reason": "Вы долго изучали этот товар"
                    })
                    reasoning.append(f"Высокий интерес к {most_interested_page} ({dwell_time:.0f}s)")
        
        # Логика 3: Товары в корзине без покупки
        if cart_products and len(viewed_products) > len(cart_products) * 2:
            suggestions.append({
                "type": "cart_reminder",
                "products_in_cart": len(cart_products),
                "reason": "У вас есть товары в корзине"
            })
            reasoning.append("Напоминание о корзине")
        
        # Логика 4: Если мало данных
        if not suggestions:
            suggestions.append({
                "type": "explore",
                "reason": "Изучите наши популярные товары",
                "categories": ["gpu", "headphones", "keyboards"]
            })
            reasoning.append("Недостаточно данных — предлагаем популярное")
        
        logger.info(f"💡 Generated {len(suggestions)} suggestions for user {user_context.get('user_id')}")
        
        return {
            "user_id": user_context.get("user_id"),
            "suggestions": suggestions,
            "reasoning": reasoning,
            "context_summary": {
                "total_views": user_context.get("total_views", 0),
                "categories_interested": viewed_categories[:5],
                "cart_size": len(cart_products)
            }
        }
    
    def get_expert_status(self) -> Dict:
        """Получить статус эксперта"""
        return {
            "status": "operational",
            "knowledge_categories": list(self._knowledge_base.keys()),
            "supported_checks": [
                "power_compatibility",
                "socket_compatibility", 
                "ram_compatibility",
                "bundle_suggestions"
            ]
        }


# Singleton instance
tech_expert = TechExpert()
