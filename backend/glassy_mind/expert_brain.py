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
        
        Расширенная база с реальными правилами для PC-компонентов,
        периферии и аудио-оборудования.
        """
        return {
            # ==================== CPU & MOTHERBOARD ====================
            "socket_compatibility": {
                # AMD
                "AM5": {
                    "cpus": ["Ryzen 7000", "Ryzen 9000", "Ryzen 7 7800X3D", "Ryzen 9 7950X3D"],
                    "chipsets": ["X670E", "X670", "B650E", "B650", "A620"],
                    "ram_type": "DDR5"
                },
                "AM4": {
                    "cpus": ["Ryzen 5000", "Ryzen 3000", "Ryzen 5 5600X", "Ryzen 7 5800X3D"],
                    "chipsets": ["X570", "B550", "X470", "B450"],
                    "ram_type": "DDR4"
                },
                # Intel
                "LGA1700": {
                    "cpus": ["Intel 12th", "Intel 13th", "Intel 14th", "i9-14900K", "i7-14700K", "i5-14600K"],
                    "chipsets": ["Z790", "Z690", "B760", "B660", "H770", "H670"],
                    "ram_type": ["DDR5", "DDR4"]
                },
                "LGA1851": {
                    "cpus": ["Intel Core Ultra 200", "Core Ultra 9 285K", "Core Ultra 7 265K", "Core Ultra 5 245K"],
                    "chipsets": ["Z890", "B860"],
                    "ram_type": "DDR5"
                },
                "LGA1200": {
                    "cpus": ["Intel 10th", "Intel 11th"],
                    "chipsets": ["Z590", "Z490", "B560", "B460"],
                    "ram_type": "DDR4"
                }
            },
            
            # ==================== RAM ====================
            "ram_compatibility": {
                "DDR5": {
                    "sockets": ["AM5", "LGA1700", "LGA1851"],
                    "speeds": [4800, 5200, 5600, 6000, 6400, 7200, 8000],
                    "note": "Requires DDR5-compatible motherboard"
                },
                "DDR4": {
                    "sockets": ["AM4", "LGA1200", "LGA1700"],
                    "speeds": [2133, 2400, 2666, 3000, 3200, 3600, 4000],
                    "note": "Most common, wide compatibility"
                }
            },
            
            # ==================== GPU POWER REQUIREMENTS ====================
            "power_requirements": {
                # NVIDIA RTX 50 Series (Blackwell)
                "RTX 5090": {"tdp": 575, "recommended_psu": 1000, "connectors": "1x 16-pin"},
                "RTX 5080": {"tdp": 360, "recommended_psu": 750, "connectors": "1x 16-pin"},
                "RTX 5070 Ti": {"tdp": 300, "recommended_psu": 700, "connectors": "1x 16-pin"},
                "RTX 5070": {"tdp": 250, "recommended_psu": 650, "connectors": "1x 8-pin"},
                
                # NVIDIA RTX 40 Series
                "RTX 4090": {"tdp": 450, "recommended_psu": 850, "connectors": "1x 16-pin or 3x 8-pin"},
                "RTX 4080 Super": {"tdp": 320, "recommended_psu": 750, "connectors": "1x 16-pin or 3x 8-pin"},
                "RTX 4080": {"tdp": 320, "recommended_psu": 750, "connectors": "1x 16-pin"},
                "RTX 4070 Ti Super": {"tdp": 285, "recommended_psu": 700, "connectors": "1x 16-pin"},
                "RTX 4070 Ti": {"tdp": 285, "recommended_psu": 700, "connectors": "1x 16-pin"},
                "RTX 4070 Super": {"tdp": 220, "recommended_psu": 650, "connectors": "1x 8-pin"},
                "RTX 4070": {"tdp": 200, "recommended_psu": 650, "connectors": "1x 8-pin"},
                "RTX 4060 Ti": {"tdp": 165, "recommended_psu": 550, "connectors": "1x 8-pin"},
                "RTX 4060": {"tdp": 115, "recommended_psu": 450, "connectors": "1x 8-pin"},
                
                # AMD RX 7000 Series
                "RX 7900 XTX": {"tdp": 355, "recommended_psu": 800, "connectors": "2x 8-pin"},
                "RX 7900 XT": {"tdp": 315, "recommended_psu": 750, "connectors": "2x 8-pin"},
                "RX 7900 GRE": {"tdp": 260, "recommended_psu": 700, "connectors": "2x 8-pin"},
                "RX 7800 XT": {"tdp": 263, "recommended_psu": 700, "connectors": "2x 8-pin"},
                "RX 7700 XT": {"tdp": 245, "recommended_psu": 650, "connectors": "1x 8-pin"},
                "RX 7600": {"tdp": 165, "recommended_psu": 550, "connectors": "1x 8-pin"},
                
                "default": {"tdp": 150, "recommended_psu": 500, "connectors": "1x 8-pin"}
            },
            
            # ==================== PCIe & STORAGE ====================
            "pcie_compatibility": {
                "PCIe 5.0": {
                    "backward_compatible": ["PCIe 4.0", "PCIe 3.0"],
                    "optimal_for": ["RTX 50 Series", "Next-gen SSDs"],
                    "bandwidth": "128 GB/s (x16)"
                },
                "PCIe 4.0": {
                    "backward_compatible": ["PCIe 3.0"],
                    "optimal_for": ["RTX 40 Series", "RX 7000 Series", "Gen4 NVMe"],
                    "bandwidth": "64 GB/s (x16)"
                },
                "PCIe 3.0": {
                    "optimal_for": ["RTX 30 Series", "RX 6000 Series", "Gen3 NVMe"],
                    "bandwidth": "32 GB/s (x16)"
                }
            },
            
            # ==================== COOLER COMPATIBILITY ====================
            "cooler_compatibility": {
                "tower_coolers": {
                    "max_ram_height": 40,  # mm, for RAM clearance
                    "check": "motherboard VRM heatsink clearance"
                },
                "aio_sizes": {
                    "120mm": {"performance": "entry", "tdp_support": 65},
                    "240mm": {"performance": "mid", "tdp_support": 125},
                    "280mm": {"performance": "mid-high", "tdp_support": 150},
                    "360mm": {"performance": "high", "tdp_support": 200},
                    "420mm": {"performance": "extreme", "tdp_support": 250}
                }
            },
            
            # ==================== PERIPHERALS ====================
            "peripheral_compatibility": {
                "headphones": {
                    "connection_types": ["3.5mm", "USB", "Bluetooth", "2.4GHz Wireless"],
                    "impedance_ranges": {
                        "low": {"range": [16, 32], "needs_amp": False},
                        "medium": {"range": [32, 80], "needs_amp": "optional"},
                        "high": {"range": [80, 600], "needs_amp": True}
                    },
                    "recommended_with": ["DAC", "headphone amp", "balanced cable", "replacement pads"]
                },
                "keyboards": {
                    "connection_types": ["USB-A", "USB-C", "Bluetooth", "2.4GHz"],
                    "switch_types": {
                        "linear": ["Red", "Yellow", "Black", "Speed Silver"],
                        "tactile": ["Brown", "Clear", "Orange"],
                        "clicky": ["Blue", "Green", "White"]
                    },
                    "recommended_with": ["wrist rest", "keycap set", "coiled cable", "desk mat"]
                },
                "mice": {
                    "connection_types": ["USB", "Bluetooth", "2.4GHz Wireless"],
                    "grip_styles": ["palm", "claw", "fingertip"],
                    "recommended_with": ["mousepad", "mouse bungee", "PTFE skates", "grip tape"]
                },
                "monitors": {
                    "connection_types": ["DisplayPort 2.1", "DisplayPort 1.4", "HDMI 2.1", "HDMI 2.0", "USB-C"],
                    "gpu_requirements": {
                        "4K 144Hz": ["RTX 4070 Ti+", "RX 7800 XT+"],
                        "4K 60Hz": ["RTX 4060+", "RX 7600+"],
                        "1440p 240Hz": ["RTX 4080+", "RX 7900 XT+"],
                        "1440p 144Hz": ["RTX 4070+", "RX 7700 XT+"],
                        "1080p 360Hz": ["RTX 4070+", "RX 7700 XT+"]
                    },
                    "recommended_with": ["monitor arm", "calibrator", "DP 2.1 cable"]
                }
            },
            
            # ==================== BUNDLE RECOMMENDATIONS ====================
            "category_bundles": {
                "headphones": {
                    "accessories": ["DAC/Amp", "balanced cable", "replacement ear pads", "headphone stand", "carrying case"],
                    "complementary": ["microphone", "audio interface"]
                },
                "keyboard": {
                    "accessories": ["wrist rest", "keycap set", "coiled cable", "switch opener", "lube kit"],
                    "complementary": ["desk mat", "mouse"]
                },
                "mouse": {
                    "accessories": ["mousepad XL", "mouse bungee", "PTFE skates", "grip tape", "paracord cable"],
                    "complementary": ["keyboard", "wrist rest"]
                },
                "monitor": {
                    "accessories": ["monitor arm", "calibrator", "screen protector", "light bar", "webcam"],
                    "complementary": ["GPU upgrade", "desk"]
                },
                "gpu": {
                    "accessories": ["GPU support bracket", "custom cables", "vertical mount", "riser cable"],
                    "complementary": ["PSU upgrade", "case fans", "AIO cooler"]
                },
                "cpu": {
                    "accessories": ["thermal paste", "CPU cooler", "AIO"],
                    "complementary": ["motherboard", "RAM kit"]
                },
                "case": {
                    "accessories": ["case fans", "fan hub", "RGB controller", "cable management kit"],
                    "complementary": ["PSU", "AIO cooler"]
                }
            },
            
            # ==================== GAMING SETUP PRESETS ====================
            "gaming_presets": {
                "esports_1080p": {
                    "target": "1080p 240-360Hz",
                    "cpu": ["Ryzen 5 7600", "i5-14600K"],
                    "gpu": ["RTX 4070", "RX 7700 XT"],
                    "ram": "32GB DDR5-6000",
                    "notes": "Optimized for competitive games"
                },
                "enthusiast_1440p": {
                    "target": "1440p 144-240Hz",
                    "cpu": ["Ryzen 7 7800X3D", "i7-14700K"],
                    "gpu": ["RTX 4080", "RX 7900 XTX"],
                    "ram": "32GB DDR5-6400",
                    "notes": "Best balance of quality and performance"
                },
                "4k_gaming": {
                    "target": "4K 60-120Hz",
                    "cpu": ["Ryzen 9 7950X3D", "i9-14900K"],
                    "gpu": ["RTX 4090", "RTX 5090"],
                    "ram": "64GB DDR5-6000",
                    "notes": "Maximum quality at 4K"
                },
                "budget_build": {
                    "target": "1080p 60-144Hz",
                    "cpu": ["Ryzen 5 5600", "i5-12400F"],
                    "gpu": ["RTX 4060", "RX 7600"],
                    "ram": "16GB DDR4-3200",
                    "notes": "Great value gaming"
                }
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
            
            # Get power requirements from extended knowledge base
            power_info = self._knowledge_base["power_requirements"].get(gpu_name)
            if not power_info:
                # Try partial match
                for key, val in self._knowledge_base["power_requirements"].items():
                    if key != "default" and key.lower() in gpu_name.lower():
                        power_info = val
                        break
            if not power_info:
                power_info = self._knowledge_base["power_requirements"]["default"]
            
            # Handle both old format (int) and new format (dict)
            if isinstance(power_info, dict):
                required_power = power_info.get("tdp", 150)
                recommended_psu = power_info.get("recommended_psu", required_power + 200)
                connectors = power_info.get("connectors", "1x 8-pin")
            else:
                required_power = power_info
                recommended_psu = required_power + 200
                connectors = "1x 8-pin"
            
            details["gpu_power_required"] = required_power
            details["recommended_psu"] = recommended_psu
            details["power_connectors"] = connectors
            
            if psus:
                psu = psus[0]
                psu_wattage = psu.get("specs", {}).get("wattage", 0)
                
                if psu_wattage < recommended_psu:
                    if psu_wattage < required_power:
                        issues.append(f"❌ БП ({psu_wattage}W) критически недостаточен для {gpu_name} ({required_power}W TDP)")
                        score -= 0.4
                    else:
                        issues.append(f"⚠️ БП ({psu_wattage}W) может быть недостаточно мощным для {gpu_name}")
                        score -= 0.2
                    suggestions.append(f"Рекомендуем БП от {recommended_psu}W для стабильной работы")
                else:
                    suggestions.append(f"✅ БП ({psu_wattage}W) достаточен для {gpu_name}")
            else:
                suggestions.append(f"💡 Добавьте БП от {recommended_psu}W для {gpu_name} (разъём: {connectors})")
        
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
