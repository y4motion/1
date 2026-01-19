"""
Glassy Mind - Rules Engine
Движок правил для интеллектуального вмешательства агента.

Анализирует контекст пользователя и определяет, когда агент должен вмешаться.
Правила основаны на паттернах поведения, не просто на количестве кликов.
"""

import logging
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from enum import Enum

logger = logging.getLogger(__name__)


class TriggerType(Enum):
    """Типы триггеров для UI"""
    NONE = "none"
    ANALYZING = "analyzing"
    READY_TO_SUGGEST = "ready_to_suggest"
    SOFT_PUSH = "soft_push"  # Внутреннее уведомление на сайте


@dataclass
class RuleReaction:
    """Результат срабатывания правила"""
    trigger_type: TriggerType
    message: str
    delay_seconds: int = 0  # Задержка перед показом (для analyzing -> ready_to_suggest)
    priority: int = 1  # Чем выше, тем важнее
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass 
class Rule:
    """
    Структура правила.
    
    Attributes:
        name: Уникальное имя правила
        description: Описание для логов
        condition: Функция (user_context) -> bool
        reaction: Результат при срабатывании
        cooldown_minutes: Минимальное время между срабатываниями
    """
    name: str
    description: str
    condition: Callable[[Dict], bool]
    reaction: RuleReaction
    cooldown_minutes: int = 30


class RulesEngine:
    """
    Движок правил для анализа поведения пользователей.
    
    Прогоняет контекст через набор правил и возвращает
    наиболее релевантную реакцию.
    """
    
    def __init__(self):
        self.rules: List[Rule] = []
        self._rule_cooldowns: Dict[str, Dict[str, datetime]] = {}  # user_id -> {rule_name -> last_triggered}
        self._init_default_rules()
        logger.info(f"⚙️ RulesEngine initialized with {len(self.rules)} rules")
    
    def _init_default_rules(self):
        """Инициализация встроенных правил"""
        
        # ==================== RULE 1: Hesitation (Нерешительность) ====================
        def hesitation_condition(ctx: Dict) -> bool:
            """
            Условие: Пользователь посетил одну категорию > 4 раз
            и ничего не добавил в корзину.
            """
            viewed_categories = ctx.get("viewed_categories", [])
            cart_products = ctx.get("cart_products", [])
            
            if cart_products:  # Уже что-то в корзине — не нерешительный
                return False
            
            # Считаем повторы категорий
            category_counts = {}
            for cat in viewed_categories:
                category_counts[cat] = category_counts.get(cat, 0) + 1
            
            # Если какая-то категория просмотрена > 4 раз
            max_views = max(category_counts.values()) if category_counts else 0
            return max_views > 4
        
        self.rules.append(Rule(
            name="hesitation",
            description="Пользователь нерешителен — много смотрит, не покупает",
            condition=hesitation_condition,
            reaction=RuleReaction(
                trigger_type=TriggerType.READY_TO_SUGGEST,
                message="Помочь сравнить характеристики?",
                priority=2
            ),
            cooldown_minutes=15
        ))
        
        # ==================== RULE 2: Big Spender (Мажор) ====================
        def big_spender_condition(ctx: Dict) -> bool:
            """
            Условие: В корзине товаров на сумму > $2000.
            """
            cart_total = ctx.get("cart_total", 0)
            return cart_total > 2000
        
        self.rules.append(Rule(
            name="big_spender",
            description="Крупная покупка — предложить проверку совместимости",
            condition=big_spender_condition,
            reaction=RuleReaction(
                trigger_type=TriggerType.READY_TO_SUGGEST,
                message="Проверить совместимость вашей топовой сборки?",
                delay_seconds=5,  # Сначала analyzing, потом ready
                priority=3,
                metadata={"show_analyzing_first": True}
            ),
            cooldown_minutes=60
        ))
        
        # ==================== RULE 3: Tech Geek (Гик) ====================
        def tech_geek_condition(ctx: Dict) -> bool:
            """
            Условие: Пользователь на /pc-builder > 5 минут.
            """
            top_dwell_pages = ctx.get("top_dwell_pages", {})
            
            # Ищем страницу pc-builder
            for page, dwell_seconds in top_dwell_pages.items():
                if "pc-builder" in page.lower() or "assembly" in page.lower():
                    if dwell_seconds > 300:  # 5 минут = 300 секунд
                        return True
            
            return False
        
        self.rules.append(Rule(
            name="tech_geek",
            description="Энтузиаст собирает ПК — предложить полезный совет",
            condition=tech_geek_condition,
            reaction=RuleReaction(
                trigger_type=TriggerType.READY_TO_SUGGEST,
                message="Чек-лист для кабель-менеджмента?",
                priority=2,
                metadata={"tip_type": "cable_management"}
            ),
            cooldown_minutes=30
        ))
        
        # ==================== RULE 4: Window Shopper (Витринный покупатель) ====================
        def window_shopper_condition(ctx: Dict) -> bool:
            """
            Условие: Много просмотров (> 10), но 0 в корзине.
            """
            total_views = ctx.get("total_views", 0)
            cart_products = ctx.get("cart_products", [])
            return total_views > 10 and len(cart_products) == 0
        
        self.rules.append(Rule(
            name="window_shopper",
            description="Много смотрит, ничего не берёт",
            condition=window_shopper_condition,
            reaction=RuleReaction(
                trigger_type=TriggerType.SOFT_PUSH,
                message="Не можете определиться? Давайте подберём вместе!",
                priority=1
            ),
            cooldown_minutes=20
        ))
        
        # ==================== RULE 5: Cart Abandonment Risk ====================
        def cart_abandonment_condition(ctx: Dict) -> bool:
            """
            Условие: Есть товары в корзине, но пользователь
            смотрит другие страницы (не checkout).
            """
            cart_products = ctx.get("cart_products", [])
            current_page = ctx.get("current_page", "")
            total_views = ctx.get("total_views", 0)
            
            if len(cart_products) == 0:
                return False
            
            # Корзина не пуста, но пользователь ушёл с checkout
            if "checkout" not in current_page.lower() and total_views > 5:
                return True
            
            return False
        
        self.rules.append(Rule(
            name="cart_abandonment_risk",
            description="Риск брошенной корзины",
            condition=cart_abandonment_condition,
            reaction=RuleReaction(
                trigger_type=TriggerType.SOFT_PUSH,
                message="У вас остались товары в корзине!",
                priority=2,
                metadata={"queue_email": True}
            ),
            cooldown_minutes=45
        ))
        
        # ==================== RULE 6: Comparison Mode ====================
        def comparison_mode_condition(ctx: Dict) -> bool:
            """
            Условие: Пользователь открывал > 3 разных товаров одной категории.
            """
            viewed_products = ctx.get("viewed_products", [])
            viewed_categories = ctx.get("viewed_categories", [])
            
            if len(viewed_products) < 3:
                return False
            
            # Проверяем, что категория повторяется
            if viewed_categories:
                main_category = max(set(viewed_categories), key=viewed_categories.count)
                category_count = viewed_categories.count(main_category)
                return category_count >= 3
            
            return False
        
        self.rules.append(Rule(
            name="comparison_mode",
            description="Пользователь сравнивает товары",
            condition=comparison_mode_condition,
            reaction=RuleReaction(
                trigger_type=TriggerType.READY_TO_SUGGEST,
                message="Сравнить выбранные товары бок о бок?",
                priority=2
            ),
            cooldown_minutes=10
        ))
    
    def _check_cooldown(self, user_id: str, rule_name: str, cooldown_minutes: int) -> bool:
        """Проверить, не на кулдауне ли правило"""
        if user_id not in self._rule_cooldowns:
            return True
        
        if rule_name not in self._rule_cooldowns[user_id]:
            return True
        
        last_triggered = self._rule_cooldowns[user_id][rule_name]
        cooldown_delta = timedelta(minutes=cooldown_minutes)
        
        return datetime.now(timezone.utc) - last_triggered > cooldown_delta
    
    def _set_cooldown(self, user_id: str, rule_name: str):
        """Установить кулдаун для правила"""
        if user_id not in self._rule_cooldowns:
            self._rule_cooldowns[user_id] = {}
        
        self._rule_cooldowns[user_id][rule_name] = datetime.now(timezone.utc)
    
    def evaluate(self, user_context: Dict) -> Optional[RuleReaction]:
        """
        Оценить контекст пользователя и вернуть реакцию.
        
        Args:
            user_context: Контекст от Observer (viewed_products, cart_products, etc.)
            
        Returns:
            RuleReaction если какое-то правило сработало, иначе None
        """
        user_id = user_context.get("user_id", "guest")
        triggered_reactions: List[RuleReaction] = []
        
        for rule in self.rules:
            # Проверяем кулдаун
            if not self._check_cooldown(user_id, rule.name, rule.cooldown_minutes):
                continue
            
            # Проверяем условие
            try:
                if rule.condition(user_context):
                    logger.info(f"🎯 Rule '{rule.name}' triggered for user {user_id}")
                    triggered_reactions.append(rule.reaction)
                    self._set_cooldown(user_id, rule.name)
            except Exception as e:
                logger.warning(f"Rule '{rule.name}' evaluation failed: {e}")
        
        if not triggered_reactions:
            return None
        
        # Возвращаем реакцию с наивысшим приоритетом
        best_reaction = max(triggered_reactions, key=lambda r: r.priority)
        logger.info(f"✨ Best reaction: {best_reaction.message} (priority {best_reaction.priority})")
        
        return best_reaction
    
    def add_rule(self, rule: Rule):
        """Добавить кастомное правило"""
        self.rules.append(rule)
        logger.info(f"➕ Added rule: {rule.name}")
    
    def get_rules_info(self) -> List[Dict]:
        """Информация о всех правилах для дебага"""
        return [
            {
                "name": rule.name,
                "description": rule.description,
                "cooldown_minutes": rule.cooldown_minutes,
                "reaction_type": rule.reaction.trigger_type.value,
                "reaction_message": rule.reaction.message,
                "priority": rule.reaction.priority
            }
            for rule in self.rules
        ]


# Singleton instance
rules_engine = RulesEngine()
