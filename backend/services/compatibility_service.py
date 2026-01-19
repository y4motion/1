"""
Glassy.Tech - Compatibility Service
Жёсткая логика проверки совместимости PC-компонентов.

Проверки:
- CPU + Motherboard: сокет
- Motherboard + RAM: тип памяти (DDR4/DDR5)
- GPU + Case: длина видеокарты
- PSU: достаточная мощность
- Cooler + Case: высота кулера
- Form Factor: ITX/mATX/ATX совместимость
"""

import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class IssueSeverity(Enum):
    """Уровень серьёзности проблемы"""
    ERROR = "error"         # Критическая несовместимость
    WARNING = "warning"     # Потенциальная проблема
    INFO = "info"           # Рекомендация


@dataclass
class CompatibilityIssue:
    """Проблема совместимости"""
    severity: IssueSeverity
    component1: str  # ID или название первого компонента
    component2: str  # ID или название второго компонента
    issue_type: str  # socket_mismatch, ram_type_mismatch, etc.
    message: str     # Человекочитаемое сообщение
    suggestion: Optional[str] = None  # Предложение по исправлению


@dataclass
class CompatibilityReport:
    """Отчёт о совместимости сборки"""
    is_compatible: bool
    errors: List[CompatibilityIssue] = field(default_factory=list)
    warnings: List[CompatibilityIssue] = field(default_factory=list)
    info: List[CompatibilityIssue] = field(default_factory=list)
    total_tdp: int = 0
    recommended_psu: int = 0
    summary: str = ""
    
    def to_dict(self) -> Dict:
        return {
            "is_compatible": self.is_compatible,
            "errors": [
                {
                    "severity": e.severity.value,
                    "component1": e.component1,
                    "component2": e.component2,
                    "issue_type": e.issue_type,
                    "message": e.message,
                    "suggestion": e.suggestion
                }
                for e in self.errors
            ],
            "warnings": [
                {
                    "severity": w.severity.value,
                    "component1": w.component1,
                    "component2": w.component2,
                    "issue_type": w.issue_type,
                    "message": w.message,
                    "suggestion": w.suggestion
                }
                for w in self.warnings
            ],
            "info": [
                {
                    "severity": i.severity.value,
                    "component1": i.component1,
                    "component2": i.component2,
                    "issue_type": i.issue_type,
                    "message": i.message,
                    "suggestion": i.suggestion
                }
                for i in self.info
            ],
            "total_tdp": self.total_tdp,
            "recommended_psu": self.recommended_psu,
            "summary": self.summary
        }


class CompatibilityService:
    """
    Сервис проверки совместимости PC-компонентов.
    
    Выполняет жёсткие проверки на основе спецификаций.
    """
    
    # Коэффициент запаса для PSU (TDP * 1.2)
    PSU_HEADROOM = 1.2
    
    # Совместимость форм-факторов
    FORM_FACTOR_COMPAT = {
        "ATX": ["ATX", "Micro-ATX", "Mini-ITX"],
        "Micro-ATX": ["Micro-ATX", "Mini-ITX"],
        "Mini-ITX": ["Mini-ITX"],
    }
    
    def __init__(self):
        logger.info("⚙️ CompatibilityService initialized")
    
    def validate_build(self, parts: List[Dict]) -> CompatibilityReport:
        """
        Валидация полной сборки.
        
        Args:
            parts: Список компонентов с полями {id, title, category, specs}
            
        Returns:
            CompatibilityReport с ошибками и предупреждениями
        """
        report = CompatibilityReport(is_compatible=True)
        
        # Группируем по категориям
        by_category = {}
        for part in parts:
            cat = part.get("category", "").lower()
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(part)
        
        # Извлекаем ключевые компоненты
        cpu = by_category.get("cpu", [None])[0]
        motherboard = by_category.get("motherboard", [None])[0]
        gpus = by_category.get("gpu", [])
        rams = by_category.get("ram", [])
        psu = by_category.get("psu", [None])[0]
        case = by_category.get("case", [None])[0]
        coolers = by_category.get("cooling", [])
        
        # 1. CPU + Motherboard: Socket Check
        if cpu and motherboard:
            self._check_cpu_motherboard(cpu, motherboard, report)
        
        # 2. Motherboard + RAM: Type Check
        if motherboard and rams:
            self._check_motherboard_ram(motherboard, rams, report)
        
        # 3. GPU + Case: Length Check
        if gpus and case:
            for gpu in gpus:
                self._check_gpu_case(gpu, case, report)
        
        # 4. Cooler + Case: Height Check
        if coolers and case:
            for cooler in coolers:
                self._check_cooler_case(cooler, case, report)
        
        # 5. Motherboard + Case: Form Factor Check
        if motherboard and case:
            self._check_form_factor(motherboard, case, report)
        
        # 6. Power Supply Check
        total_tdp = self._calculate_total_tdp(parts, gpus)
        report.total_tdp = total_tdp
        report.recommended_psu = int(total_tdp * self.PSU_HEADROOM)
        
        if psu:
            self._check_psu(psu, total_tdp, gpus, report)
        elif total_tdp > 0:
            report.warnings.append(CompatibilityIssue(
                severity=IssueSeverity.WARNING,
                component1="Build",
                component2="PSU",
                issue_type="missing_psu",
                message=f"Не выбран блок питания. Рекомендуемая мощность: {report.recommended_psu}W",
                suggestion="Добавьте PSU с мощностью не менее {report.recommended_psu}W"
            ))
        
        # 7. RAM Slots Check
        if motherboard and rams:
            self._check_ram_slots(motherboard, rams, report)
        
        # Update compatibility status
        report.is_compatible = len(report.errors) == 0
        
        # Generate summary
        report.summary = self._generate_summary(report, parts)
        
        logger.info(f"🔍 Compatibility check: {len(report.errors)} errors, {len(report.warnings)} warnings")
        
        return report
    
    def _check_cpu_motherboard(self, cpu: Dict, mobo: Dict, report: CompatibilityReport):
        """Проверка сокета CPU и материнской платы"""
        cpu_socket = cpu.get("specs", {}).get("socket", "").upper()
        mobo_socket = mobo.get("specs", {}).get("socket", "").upper()
        
        if not cpu_socket or not mobo_socket:
            return
        
        if cpu_socket != mobo_socket:
            report.errors.append(CompatibilityIssue(
                severity=IssueSeverity.ERROR,
                component1=cpu.get("title", "CPU"),
                component2=mobo.get("title", "Motherboard"),
                issue_type="socket_mismatch",
                message=f"❌ Несовместимый сокет! CPU ({cpu_socket}) не подходит к материнской плате ({mobo_socket})",
                suggestion=f"Выберите материнскую плату с сокетом {cpu_socket} или процессор с сокетом {mobo_socket}"
            ))
    
    def _check_motherboard_ram(self, mobo: Dict, rams: List[Dict], report: CompatibilityReport):
        """Проверка типа RAM и материнской платы"""
        mobo_ram_type = mobo.get("specs", {}).get("ram_type", "").upper()
        
        if not mobo_ram_type:
            return
        
        for ram in rams:
            ram_type = ram.get("specs", {}).get("type", "").upper()
            
            if not ram_type:
                continue
            
            if ram_type != mobo_ram_type:
                report.errors.append(CompatibilityIssue(
                    severity=IssueSeverity.ERROR,
                    component1=ram.get("title", "RAM"),
                    component2=mobo.get("title", "Motherboard"),
                    issue_type="ram_type_mismatch",
                    message=f"❌ Несовместимая память! {ram_type} не подходит к плате ({mobo_ram_type})",
                    suggestion=f"Выберите память {mobo_ram_type}"
                ))
    
    def _check_gpu_case(self, gpu: Dict, case: Dict, report: CompatibilityReport):
        """Проверка длины GPU и корпуса"""
        gpu_length = gpu.get("specs", {}).get("length_mm", 0)
        case_max_gpu = case.get("specs", {}).get("max_gpu_length", 999)
        
        if not gpu_length:
            return
        
        if gpu_length > case_max_gpu:
            report.errors.append(CompatibilityIssue(
                severity=IssueSeverity.ERROR,
                component1=gpu.get("title", "GPU"),
                component2=case.get("title", "Case"),
                issue_type="gpu_too_long",
                message=f"❌ Видеокарта не влезет! GPU ({gpu_length}mm) > макс. длина корпуса ({case_max_gpu}mm)",
                suggestion="Выберите корпус побольше или компактную видеокарту"
            ))
        elif gpu_length > case_max_gpu - 20:
            report.warnings.append(CompatibilityIssue(
                severity=IssueSeverity.WARNING,
                component1=gpu.get("title", "GPU"),
                component2=case.get("title", "Case"),
                issue_type="gpu_tight_fit",
                message=f"⚠️ Впритык! GPU ({gpu_length}mm) почти достигает лимита ({case_max_gpu}mm)",
                suggestion="Проверьте, не помешают ли вентиляторы или кабели"
            ))
    
    def _check_cooler_case(self, cooler: Dict, case: Dict, report: CompatibilityReport):
        """Проверка высоты кулера и корпуса"""
        cooler_height = cooler.get("specs", {}).get("height", 0)
        case_max_cooler = case.get("specs", {}).get("max_cpu_cooler_height", 999)
        
        # Skip AIO coolers (they don't have height issues in the same way)
        if cooler.get("specs", {}).get("type", "").lower() == "aio liquid":
            return
        
        if not cooler_height:
            return
        
        if cooler_height > case_max_cooler:
            report.errors.append(CompatibilityIssue(
                severity=IssueSeverity.ERROR,
                component1=cooler.get("title", "Cooler"),
                component2=case.get("title", "Case"),
                issue_type="cooler_too_tall",
                message=f"❌ Кулер не влезет! Высота ({cooler_height}mm) > макс. высота в корпусе ({case_max_cooler}mm)",
                suggestion="Выберите низкопрофильный кулер или корпус повыше"
            ))
    
    def _check_form_factor(self, mobo: Dict, case: Dict, report: CompatibilityReport):
        """Проверка форм-фактора материнской платы и корпуса"""
        mobo_ff = mobo.get("specs", {}).get("form_factor", "ATX")
        case_supported = case.get("specs", {}).get("form_factor_support", ["ATX", "Micro-ATX", "Mini-ITX"])
        
        if isinstance(case_supported, str):
            case_supported = [case_supported]
        
        # Normalize form factors
        mobo_ff_normalized = mobo_ff.replace("-", "").replace(" ", "").upper()
        case_supported_normalized = [ff.replace("-", "").replace(" ", "").upper() for ff in case_supported]
        
        if mobo_ff_normalized not in case_supported_normalized and mobo_ff not in case_supported:
            report.errors.append(CompatibilityIssue(
                severity=IssueSeverity.ERROR,
                component1=mobo.get("title", "Motherboard"),
                component2=case.get("title", "Case"),
                issue_type="form_factor_mismatch",
                message=f"❌ Форм-фактор не подходит! {mobo_ff} плата не влезет в корпус ({', '.join(case_supported)})",
                suggestion=f"Выберите корпус с поддержкой {mobo_ff} или другую плату"
            ))
    
    def _calculate_total_tdp(self, parts: List[Dict], gpus: List[Dict]) -> int:
        """Подсчёт общего TDP сборки"""
        total = 0
        
        for part in parts:
            specs = part.get("specs", {})
            
            # CPU TDP
            if part.get("category") == "cpu":
                total += specs.get("tdp", 0)
            
            # GPU TDP (может быть несколько)
            elif part.get("category") == "gpu":
                total += specs.get("tdp", 0)
        
        # Базовое потребление системы (материнка, RAM, диски, вентиляторы)
        base_system = 50  # ~50W на остальное
        
        return total + base_system
    
    def _check_psu(self, psu: Dict, total_tdp: int, gpus: List[Dict], report: CompatibilityReport):
        """Проверка мощности блока питания"""
        psu_wattage = psu.get("specs", {}).get("wattage", 0)
        
        if not psu_wattage:
            return
        
        recommended = int(total_tdp * self.PSU_HEADROOM)
        
        # Check GPU recommended PSU (if available)
        for gpu in gpus:
            gpu_recommended_psu = gpu.get("specs", {}).get("recommended_psu_wattage", 0)
            if gpu_recommended_psu > 0 and psu_wattage < gpu_recommended_psu:
                report.errors.append(CompatibilityIssue(
                    severity=IssueSeverity.ERROR,
                    component1=psu.get("title", "PSU"),
                    component2=gpu.get("title", "GPU"),
                    issue_type="psu_insufficient_for_gpu",
                    message=f"❌ Слабый БП для видеокарты! {psu_wattage}W < рекомендуемые {gpu_recommended_psu}W",
                    suggestion=f"Выберите PSU мощностью минимум {gpu_recommended_psu}W"
                ))
                return
        
        # General PSU check
        if psu_wattage < total_tdp:
            report.errors.append(CompatibilityIssue(
                severity=IssueSeverity.ERROR,
                component1=psu.get("title", "PSU"),
                component2="Build Total",
                issue_type="psu_insufficient",
                message=f"❌ Недостаточная мощность! {psu_wattage}W < общий TDP {total_tdp}W",
                suggestion=f"Выберите PSU мощностью минимум {recommended}W"
            ))
        elif psu_wattage < recommended:
            report.warnings.append(CompatibilityIssue(
                severity=IssueSeverity.WARNING,
                component1=psu.get("title", "PSU"),
                component2="Build Total",
                issue_type="psu_low_headroom",
                message=f"⚠️ Мало запаса по мощности. {psu_wattage}W при TDP {total_tdp}W (рекомендуется {recommended}W)",
                suggestion=f"Рассмотрите PSU на {recommended}W для стабильности и будущих апгрейдов"
            ))
    
    def _check_ram_slots(self, mobo: Dict, rams: List[Dict], report: CompatibilityReport):
        """Проверка количества слотов RAM"""
        mobo_slots = mobo.get("specs", {}).get("ram_slots", 4)
        
        total_modules = sum(ram.get("specs", {}).get("modules", 1) for ram in rams)
        
        if total_modules > mobo_slots:
            report.errors.append(CompatibilityIssue(
                severity=IssueSeverity.ERROR,
                component1="RAM",
                component2=mobo.get("title", "Motherboard"),
                issue_type="too_many_ram_modules",
                message=f"❌ Слишком много модулей RAM! {total_modules} модулей > {mobo_slots} слотов",
                suggestion=f"Выберите комплект с меньшим количеством модулей"
            ))
    
    def _generate_summary(self, report: CompatibilityReport, parts: List[Dict]) -> str:
        """Генерация текстового summary"""
        if report.is_compatible:
            if report.warnings:
                return f"✅ Сборка совместима с {len(report.warnings)} предупреждением(ями). Рекомендуемый PSU: {report.recommended_psu}W"
            return f"✅ Отличная сборка! Все компоненты совместимы. Рекомендуемый PSU: {report.recommended_psu}W"
        else:
            return f"❌ Обнаружено {len(report.errors)} критических проблем совместимости!"
    
    def quick_check(self, new_part: Dict, existing_parts: List[Dict]) -> Optional[CompatibilityIssue]:
        """
        Быстрая проверка нового компонента против существующих.
        Используется при добавлении в корзину.
        
        Returns:
            CompatibilityIssue если найдена проблема, иначе None
        """
        all_parts = existing_parts + [new_part]
        report = self.validate_build(all_parts)
        
        if report.errors:
            # Return the most relevant error (involving the new part)
            for error in report.errors:
                new_title = new_part.get("title", "")
                if new_title in error.component1 or new_title in error.component2:
                    return error
            return report.errors[0]
        
        return None


# Singleton instance
compatibility_service = CompatibilityService()
